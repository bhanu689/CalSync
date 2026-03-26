import { ConfidentialClientApplication } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import { CalendarIntegration } from '../models/CalendarIntegration';
import { env } from '../config/env';

const msalConfig = {
  auth: {
    clientId: env.AZURE_CLIENT_ID,
    clientSecret: env.AZURE_CLIENT_SECRET,
    authority: 'https://login.microsoftonline.com/common',
  },
};

const SCOPES = ['Calendars.ReadWrite', 'offline_access'];

function getMsalClient() {
  if (!env.AZURE_CLIENT_ID || !env.AZURE_CLIENT_SECRET) return null;
  return new ConfidentialClientApplication(msalConfig);
}

export const outlookCalendarService = {
  getAuthUrl(userId: string): string | null {
    const client = getMsalClient();
    if (!client) return null;

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${env.AZURE_CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(env.AZURE_CALLBACK_URL)}` +
      `&scope=${encodeURIComponent(SCOPES.join(' '))}` +
      `&state=${userId}` +
      `&response_mode=query`;

    return authUrl;
  },

  async handleCallback(code: string, userId: string) {
    const client = getMsalClient();
    if (!client) throw new Error('Outlook not configured');

    const result = await client.acquireTokenByCode({
      code,
      scopes: SCOPES,
      redirectUri: env.AZURE_CALLBACK_URL,
    });

    await CalendarIntegration.findOneAndUpdate(
      { userId, provider: 'outlook' },
      {
        userId,
        provider: 'outlook',
        accessToken: result.accessToken,
        refreshToken: '', // MSAL handles token caching
        tokenExpiry: result.expiresOn || new Date(Date.now() + 3600000),
        calendarId: 'primary',
        enabled: true,
      },
      { upsert: true, new: true }
    );
  },

  async getGraphClient(userId: string): Promise<Client | null> {
    const integration = await CalendarIntegration.findOne({ userId, provider: 'outlook', enabled: true });
    if (!integration) return null;

    return Client.init({
      authProvider: (done) => {
        done(null, integration.accessToken);
      },
    });
  },

  async getBusyTimes(userId: string, start: Date, end: Date) {
    const client = await this.getGraphClient(userId);
    if (!client) return [];

    try {
      const res = await client.api('/me/calendar/getSchedule').post({
        schedules: ['me'],
        startTime: { dateTime: start.toISOString(), timeZone: 'UTC' },
        endTime: { dateTime: end.toISOString(), timeZone: 'UTC' },
      });

      const items = res.value?.[0]?.scheduleItems || [];
      return items.map((item: { start: { dateTime: string }; end: { dateTime: string } }) => ({
        start: new Date(item.start.dateTime),
        end: new Date(item.end.dateTime),
      }));
    } catch {
      console.error('Failed to fetch Outlook busy times');
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
    const client = await this.getGraphClient(userId);
    if (!client) return null;

    try {
      const res = await client.api('/me/events').post({
        subject: event.summary,
        body: { contentType: 'text', content: event.description || '' },
        start: { dateTime: event.start.toISOString(), timeZone: 'UTC' },
        end: { dateTime: event.end.toISOString(), timeZone: 'UTC' },
        attendees: event.attendees.map((a) => ({
          emailAddress: { address: a.email, name: a.displayName },
          type: 'required',
        })),
      });
      return res.id;
    } catch {
      console.error('Failed to create Outlook event');
      return null;
    }
  },

  async deleteEvent(userId: string, eventId: string) {
    const client = await this.getGraphClient(userId);
    if (!client) return;

    try {
      await client.api(`/me/events/${eventId}`).delete();
    } catch {
      console.error('Failed to delete Outlook event');
    }
  },
};
