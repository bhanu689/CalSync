import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { googleCalendarService } from '../services/google-calendar.service';
import { outlookCalendarService } from '../services/outlook-calendar.service';
import { calendarService } from '../services/calendar.service';
import { CalendarIntegration } from '../models/CalendarIntegration';
import { Booking } from '../models/Booking';
import { EventType } from '../models/EventType';
import { User } from '../models/User';
import { env } from '../config/env';
import icalGenerator from 'ical-generator';

const router = Router();

// List connected calendars
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const integrations = await CalendarIntegration.find({ userId: req.userId })
      .select('provider calendarId enabled createdAt');
    res.json({ integrations });
  } catch (error) {
    next(error);
  }
});

// Google Calendar connect
router.get('/google/connect', authenticate, (req: AuthRequest, res: Response) => {
  const url = googleCalendarService.getAuthUrl(req.userId!);
  res.redirect(url);
});

// Google Calendar callback
router.get('/google/callback', async (req, res, next) => {
  try {
    const code = String(req.query.code);
    const userId = String(req.query.state);
    await googleCalendarService.handleCallback(code, userId);
    res.redirect(`${env.FRONTEND_URL}/integrations?connected=google`);
  } catch (error) {
    next(error);
  }
});

// Outlook connect
router.get('/outlook/connect', authenticate, (req: AuthRequest, res: Response) => {
  const url = outlookCalendarService.getAuthUrl(req.userId!);
  if (!url) {
    res.status(400).json({ error: { code: 'NOT_CONFIGURED', message: 'Outlook not configured' } });
    return;
  }
  res.redirect(url);
});

// Outlook callback
router.get('/outlook/callback', async (req, res, next) => {
  try {
    const code = String(req.query.code);
    const state = String(req.query.state);
    await outlookCalendarService.handleCallback(code, state);
    res.redirect(`${env.FRONTEND_URL}/integrations?connected=outlook`);
  } catch (error) {
    next(error);
  }
});

// Disconnect calendar
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await CalendarIntegration.findOneAndDelete({ _id: String(req.params.id), userId: req.userId });
    res.json({ message: 'Calendar disconnected' });
  } catch (error) {
    next(error);
  }
});

// Get busy times
router.get('/busy-times', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const start = new Date(String(req.query.start));
    const end = new Date(String(req.query.end));
    const busyTimes = await calendarService.getBusyTimes(req.userId!, start, end);
    res.json({ busyTimes });
  } catch (error) {
    next(error);
  }
});

// Apple Calendar ICS export
router.get('/apple/export', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) { res.status(404).json({ error: { message: 'User not found' } }); return; }

    const bookings = await Booking.find({
      hostUserId: req.userId,
      status: 'confirmed',
      startTime: { $gte: new Date() },
    }).populate('eventTypeId', 'title');

    const calendar = icalGenerator({ name: `${user.name} - CalSync` });

    for (const booking of bookings) {
      const et = booking.eventTypeId as unknown as { title: string };
      calendar.createEvent({
        start: booking.startTime,
        end: booking.endTime,
        summary: et?.title || 'Meeting',
        description: `Booking with ${booking.invitee.name} (${booking.invitee.email})`,
        attendees: [{ email: booking.invitee.email, name: booking.invitee.name }],
      });
    }

    res.set('Content-Type', 'text/calendar; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="calsync.ics"');
    res.send(calendar.toString());
  } catch (error) {
    next(error);
  }
});

export default router;
