import { google } from 'googleapis';
import { CalendarIntegration } from '../models/CalendarIntegration';
import { env } from '../config/env';

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_CALENDAR_CALLBACK_URL
);

export const googleCalendarService = {
  getAuthUrl(userId: string): string {
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      state: userId,
    });
  },

  async handleCallback(code: string, userId: string) {
    const { tokens } = await oauth2Client.getToken(code);

    await CalendarIntegration.findOneAndUpdate(
      { userId, provider: 'google' },
      {
        userId,
        provider: 'google',
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || '',
        tokenExpiry: new Date(tokens.expiry_date || Date.now() + 3600000),
        calendarId: 'primary',
        enabled: true,
      },
      { upsert: true, new: true }
    );
  },

  async getClient(userId: string) {
    const integration = await CalendarIntegration.findOne({ userId, provider: 'google', enabled: true });
    if (!integration) return null;

    const client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_CALENDAR_CALLBACK_URL
    );

    client.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken,
      expiry_date: integration.tokenExpiry.getTime(),
    });

    // Refresh token if expired
    if (integration.tokenExpiry < new Date()) {
      const { credentials } = await client.refreshAccessToken();
      integration.accessToken = credentials.access_token || integration.accessToken;
      integration.tokenExpiry = new Date(credentials.expiry_date || Date.now() + 3600000);
      if (credentials.refresh_token) {
        integration.refreshToken = credentials.refresh_token;
      }
      await integration.save();
      client.setCredentials(credentials);
    }

    return client;
  },

  async getBusyTimes(userId: string, start: Date, end: Date) {
    const client = await this.getClient(userId);
    if (!client) return [];

    const calendar = google.calendar({ version: 'v3', auth: client });

    try {
      const res = await calendar.freebusy.query({
        requestBody: {
          timeMin: start.toISOString(),
          timeMax: end.toISOString(),
          items: [{ id: 'primary' }],
        },
      });

      const busy = res.data.calendars?.primary?.busy || [];
      return busy.map((b) => ({
        start: new Date(b.start || ''),
        end: new Date(b.end || ''),
      }));
    } catch {
      console.error('Failed to fetch Google Calendar busy times');
      return [];
    }
  },

  async createEvent(userId: string, event: {
    summary: string;
    description?: string;
    start: Date;
    end: Date;
    attendees: Array<{ email: string; displayName?: string }>;
  }) {
    const client = await this.getClient(userId);
    if (!client) return null;

    const calendar = google.calendar({ version: 'v3', auth: client });

    try {
      const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: event.summary,
          description: event.description,
          start: { dateTime: event.start.toISOString() },
          end: { dateTime: event.end.toISOString() },
          attendees: event.attendees.map((a) => ({ email: a.email, displayName: a.displayName })),
        },
      });
      return res.data.id;
    } catch {
      console.error('Failed to create Google Calendar event');
      return null;
    }
  },

  async deleteEvent(userId: string, eventId: string) {
    const client = await this.getClient(userId);
    if (!client) return;

    const calendar = google.calendar({ version: 'v3', auth: client });
    try {
      await calendar.events.delete({ calendarId: 'primary', eventId });
    } catch {
      console.error('Failed to delete Google Calendar event');
    }
  },
};
