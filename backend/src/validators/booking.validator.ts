import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    eventTypeId: z.string().min(1),
    startTime: z.string().min(1, 'Start time is required'),
    invitee: z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email'),
      timezone: z.string().min(1, 'Timezone is required'),
    }),
    notes: z.string().optional(),
  }),
});

export const cancelBookingSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const rescheduleBookingSchema = z.object({
  body: z.object({
    newStartTime: z.string().min(1),
  }),
  params: z.object({
    id: z.string(),
  }),
});
