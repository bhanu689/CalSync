import { googleCalendarService } from './google-calendar.service';
import { outlookCalendarService } from './outlook-calendar.service';
import { CalendarIntegration } from '../models/CalendarIntegration';

interface TimeBlock {
  start: Date;
  end: Date;
}

interface EventData {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  attendees: Array<{ email: string; displayName?: string }>;
}

export const calendarService = {
  async getBusyTimes(userId: string, start: Date, end: Date): Promise<TimeBlock[]> {
    const integrations = await CalendarIntegration.find({ userId, enabled: true });
    const busyTimes: TimeBlock[] = [];

    for (const integration of integrations) {
      let times: TimeBlock[] = [];

      if (integration.provider === 'google') {
        times = await googleCalendarService.getBusyTimes(userId, start, end);
      } else if (integration.provider === 'outlook') {
        times = await outlookCalendarService.getBusyTimes(userId, start, end);
      }

      busyTimes.push(...times);
    }

    return busyTimes;
  },

  async createEvent(userId: string, event: EventData): Promise<{ id: string; provider: string } | null> {
    // Create on the first connected calendar
    const integration = await CalendarIntegration.findOne({ userId, enabled: true });
    if (!integration) return null;

    let eventId: string | null | undefined = null;

    if (integration.provider === 'google') {
      eventId = await googleCalendarService.createEvent(userId, event);
    } else if (integration.provider === 'outlook') {
      eventId = await outlookCalendarService.createEvent(userId, event);
    }

    if (eventId) {
      return { id: eventId, provider: integration.provider };
    }

    return null;
  },

  async deleteEvent(userId: string, eventId: string, provider: string): Promise<void> {
    if (provider === 'google') {
      await googleCalendarService.deleteEvent(userId, eventId);
    } else if (provider === 'outlook') {
      await outlookCalendarService.deleteEvent(userId, eventId);
    }
  },
};
