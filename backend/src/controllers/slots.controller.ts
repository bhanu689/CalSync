import { Request, Response, NextFunction } from 'express';
import { generateSlots } from '../utils/slots';
import { calendarService } from '../services/calendar.service';
import { User } from '../models/User';

export const slotsController = {
  async getSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, eventTypeSlug, date, timezone } = req.query;

      if (!username || !eventTypeSlug || !date || !timezone) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'username, eventTypeSlug, date, and timezone are required',
          },
        });
        return;
      }

      // Fetch external busy times from connected calendars
      const user = await User.findOne({ username: String(username).toLowerCase() });
      let externalBusyTimes: Array<{ start: Date; end: Date }> = [];

      if (user) {
        const dayStart = new Date(String(date) + 'T00:00:00Z');
        const dayEnd = new Date(String(date) + 'T23:59:59Z');
        externalBusyTimes = await calendarService.getBusyTimes(String(user._id), dayStart, dayEnd);
      }

      const slots = await generateSlots(
        String(username),
        String(eventTypeSlug),
        String(date),
        String(timezone),
        externalBusyTimes
      );

      res.json({ slots, timezone: String(timezone) });
    } catch (error) {
      next(error);
    }
  },
};
