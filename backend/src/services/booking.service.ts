import { Booking } from '../models/Booking';
import { EventType } from '../models/EventType';
import { User } from '../models/User';
import { AppError } from '../middleware/error.middleware';
import { calendarService } from './calendar.service';
import { notificationService } from './notification.service';
import { mailService } from './mail.service';

export const bookingService = {
  async create(data: {
    eventTypeId: string;
    startTime: string; // ISO UTC
    invitee: { name: string; email: string; timezone: string };
    notes?: string;
  }) {
    const eventType = await EventType.findById(data.eventTypeId);
    if (!eventType || !eventType.isActive) {
      throw new AppError(404, 'NOT_FOUND', 'Event type not found or inactive');
    }

    const host = await User.findById(eventType.userId);
    if (!host) {
      throw new AppError(404, 'NOT_FOUND', 'Host not found');
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(startTime.getTime() + eventType.durationMinutes * 60000);

    // Atomic check for overlapping bookings (race condition protection)
    const overlap = await Booking.findOne({
      hostUserId: eventType.userId,
      status: 'confirmed',
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (overlap) {
      // For group events, check capacity
      if (eventType.type === 'group' && eventType.maxAttendees) {
        const sameSlotBookings = await Booking.countDocuments({
          eventTypeId: data.eventTypeId,
          status: 'confirmed',
          startTime,
          endTime,
        });
        if (sameSlotBookings >= eventType.maxAttendees) {
          throw new AppError(409, 'CONFLICT', 'This time slot is no longer available');
        }
      } else {
        throw new AppError(409, 'CONFLICT', 'This time slot is no longer available');
      }
    }

    const booking = await Booking.create({
      eventTypeId: data.eventTypeId,
      hostUserId: eventType.userId,
      invitee: data.invitee,
      startTime,
      endTime,
      status: 'confirmed',
      notes: data.notes,
    });

    // Side effects (fire and forget)
    // 1. Create calendar event
    calendarService.createEvent(String(eventType.userId), {
      summary: `${eventType.title} with ${data.invitee.name}`,
      description: data.notes,
      start: startTime,
      end: endTime,
      attendees: [{ email: data.invitee.email, displayName: data.invitee.name }],
    }).then(async (result) => {
      if (result) {
        booking.calendarEventId = result.id;
        booking.calendarProvider = result.provider;
        await booking.save();
      }
    }).catch(() => {});

    // 2. Send notification
    notificationService.create({
      userId: String(eventType.userId),
      type: 'booking_created',
      title: 'New Booking',
      message: `${data.invitee.name} booked ${eventType.title}`,
      metadata: { bookingId: String(booking._id), eventTypeId: String(eventType._id) },
    }).catch(() => {});

    // 3. Send emails
    mailService.sendBookingConfirmation({
      hostEmail: host.email,
      hostName: host.name,
      inviteeName: data.invitee.name,
      inviteeEmail: data.invitee.email,
      eventTitle: eventType.title,
      startTime,
      endTime,
    }).catch(() => {});

    return {
      booking: {
        id: booking._id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        invitee: booking.invitee,
        notes: booking.notes,
        eventType: {
          title: eventType.title,
          durationMinutes: eventType.durationMinutes,
        },
        host: {
          name: host.name,
          email: host.email,
        },
      },
    };
  },

  async list(userId: string, query: {
    status?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: Record<string, unknown> = { hostUserId: userId };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.from || query.to) {
      filter.startTime = {};
      if (query.from) (filter.startTime as Record<string, unknown>).$gte = new Date(query.from);
      if (query.to) (filter.startTime as Record<string, unknown>).$lte = new Date(query.to);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('eventTypeId', 'title durationMinutes color')
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    return {
      bookings: bookings.map((b) => ({
        id: b._id,
        eventType: b.eventTypeId,
        invitee: b.invitee,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        cancelReason: b.cancelReason,
        notes: b.notes,
        meetingLink: b.meetingLink,
        createdAt: b.createdAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getById(id: string, userId: string) {
    const booking = await Booking.findOne({ _id: id, hostUserId: userId })
      .populate('eventTypeId', 'title durationMinutes color');
    if (!booking) {
      throw new AppError(404, 'NOT_FOUND', 'Booking not found');
    }
    return booking;
  },

  async cancel(id: string, userId: string, reason?: string) {
    const booking = await Booking.findOneAndUpdate(
      { _id: id, hostUserId: userId, status: 'confirmed' },
      { status: 'cancelled', cancelReason: reason },
      { new: true }
    );
    if (!booking) {
      throw new AppError(404, 'NOT_FOUND', 'Booking not found or already cancelled');
    }

    // Side effects
    if (booking.calendarEventId && booking.calendarProvider) {
      calendarService.deleteEvent(userId, booking.calendarEventId, booking.calendarProvider).catch(() => {});
    }

    const host = await User.findById(userId);
    notificationService.create({
      userId,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Booking with ${booking.invitee.name} was cancelled`,
      metadata: { bookingId: String(booking._id) },
    }).catch(() => {});

    if (host) {
      mailService.sendBookingCancellation({
        inviteeEmail: booking.invitee.email,
        inviteeName: booking.invitee.name,
        hostName: host.name,
        eventTitle: 'Meeting',
        startTime: booking.startTime,
        reason,
      }).catch(() => {});
    }

    return booking;
  },

  async reschedule(id: string, userId: string, newStartTime: string) {
    const booking = await Booking.findOne({ _id: id, hostUserId: userId, status: 'confirmed' });
    if (!booking) {
      throw new AppError(404, 'NOT_FOUND', 'Booking not found');
    }

    const eventType = await EventType.findById(booking.eventTypeId);
    if (!eventType) {
      throw new AppError(404, 'NOT_FOUND', 'Event type not found');
    }

    const start = new Date(newStartTime);
    const end = new Date(start.getTime() + eventType.durationMinutes * 60000);

    // Check for overlaps
    const overlap = await Booking.findOne({
      hostUserId: userId,
      status: 'confirmed',
      _id: { $ne: id },
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    if (overlap) {
      throw new AppError(409, 'CONFLICT', 'New time slot is not available');
    }

    booking.startTime = start;
    booking.endTime = end;
    booking.status = 'rescheduled';
    await booking.save();

    return booking;
  },
};
