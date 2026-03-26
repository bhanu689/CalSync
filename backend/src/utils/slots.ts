import { Availability, IAvailability } from '../models/Availability';
import { Booking } from '../models/Booking';
import { EventType, IEventType } from '../models/EventType';
import { User } from '../models/User';

interface TimeBlock {
  start: Date;
  end: Date;
}

interface SlotResult {
  start: string;
  end: string;
}

export async function generateSlots(
  username: string,
  eventTypeSlug: string,
  dateStr: string, // "2026-04-01"
  inviteeTimezone: string,
  externalBusyTimes: TimeBlock[] = []
): Promise<SlotResult[]> {
  // Load user, event type, availability
  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) return [];

  const eventType = await EventType.findOne({
    userId: user._id,
    slug: eventTypeSlug,
    isActive: true,
  });
  if (!eventType) return [];

  const availability = await Availability.findOne({ userId: user._id, isDefault: true });
  if (!availability) return [];

  return generateSlotsForDate(
    availability,
    eventType,
    dateStr,
    user.timezone,
    inviteeTimezone,
    externalBusyTimes
  );
}

export async function generateSlotsForDate(
  availability: IAvailability,
  eventType: IEventType,
  dateStr: string,
  userTimezone: string,
  inviteeTimezone: string,
  externalBusyTimes: TimeBlock[] = []
): Promise<SlotResult[]> {
  // Determine which slots apply for this date
  const date = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = date.getDay(); // 0 = Sunday

  // Check date overrides first
  const override = availability.dateOverrides.find((o) => o.date === dateStr);

  let timeWindows: Array<{ start: string; end: string }>;

  if (override) {
    if (!override.enabled) return []; // Day off
    timeWindows = override.slots;
  } else {
    const daySchedule = availability.weeklySchedule.find((d) => d.day === dayOfWeek);
    if (!daySchedule || !daySchedule.enabled) return [];
    timeWindows = daySchedule.slots;
  }

  if (timeWindows.length === 0) return [];

  // Convert availability windows to UTC Date ranges
  const availableWindows: TimeBlock[] = timeWindows.map((slot) => {
    const start = parseTimeInTimezone(dateStr, slot.start, userTimezone);
    const end = parseTimeInTimezone(dateStr, slot.end, userTimezone);
    return { start, end };
  });

  // Fetch existing bookings for this date range
  const dayStart = availableWindows[0].start;
  const dayEnd = availableWindows[availableWindows.length - 1].end;

  const existingBookings = await Booking.find({
    hostUserId: (availability as any).userId,
    status: 'confirmed',
    startTime: { $lt: dayEnd },
    endTime: { $gt: dayStart },
  });

  // Build unavailable blocks
  const unavailable: TimeBlock[] = [
    ...existingBookings.map((b) => ({
      start: b.startTime,
      end: b.endTime,
    })),
    ...externalBusyTimes,
  ];

  // Generate candidate slots
  const duration = eventType.durationMinutes;
  const bufferBefore = eventType.bufferBefore || 0;
  const bufferAfter = eventType.bufferAfter || 0;
  const now = new Date();

  const slots: SlotResult[] = [];

  for (const window of availableWindows) {
    let cursor = new Date(window.start);

    while (true) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor.getTime() + duration * 60000);

      // Slot must fit within the availability window
      if (slotEnd > window.end) break;

      // Check buffer zones
      const bufferedStart = new Date(slotStart.getTime() - bufferBefore * 60000);
      const bufferedEnd = new Date(slotEnd.getTime() + bufferAfter * 60000);

      // Check if slot is in the past
      if (slotStart <= now) {
        cursor = new Date(cursor.getTime() + duration * 60000);
        continue;
      }

      // Check for conflicts
      const hasConflict = unavailable.some(
        (block) => bufferedStart < block.end && bufferedEnd > block.start
      );

      if (!hasConflict) {
        // For group events, check capacity
        if (eventType.type === 'group' && eventType.maxAttendees) {
          const bookingsForSlot = existingBookings.filter(
            (b) =>
              b.startTime.getTime() === slotStart.getTime() &&
              b.endTime.getTime() === slotEnd.getTime()
          );
          const attendeeCount = bookingsForSlot.reduce(
            (sum, b) => sum + 1 + (b.additionalAttendees?.length || 0),
            0
          );
          if (attendeeCount >= eventType.maxAttendees) {
            cursor = new Date(cursor.getTime() + duration * 60000);
            continue;
          }
        }

        // Convert to invitee timezone for display
        slots.push({
          start: formatInTimezone(slotStart, inviteeTimezone),
          end: formatInTimezone(slotEnd, inviteeTimezone),
        });
      }

      // Move cursor by the slot duration
      cursor = new Date(cursor.getTime() + duration * 60000);
    }
  }

  return slots;
}

function parseTimeInTimezone(dateStr: string, timeStr: string, timezone: string): Date {
  // Build an ISO-like string and use timezone offset
  const dateTimeStr = `${dateStr}T${timeStr}:00`;
  // Create date assuming it's in the user's timezone
  const date = new Date(
    new Date(dateTimeStr).toLocaleString('en-US', { timeZone: 'UTC' })
  );

  // Get the offset for this timezone on this date
  const utcDate = new Date(dateTimeStr + 'Z');
  const localStr = utcDate.toLocaleString('en-US', { timeZone: timezone });
  const localDate = new Date(localStr);
  const offset = utcDate.getTime() - localDate.getTime();

  return new Date(date.getTime() + offset);
}

function formatInTimezone(date: Date, timezone: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: timezone,
  };

  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';

  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
}
