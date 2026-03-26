import { z } from 'zod';

const timeSlotSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:mm format'),
  end: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:mm format'),
});

const dayScheduleSchema = z.object({
  day: z.number().int().min(0).max(6),
  enabled: z.boolean(),
  slots: z.array(timeSlotSchema),
});

const dateOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  enabled: z.boolean(),
  slots: z.array(timeSlotSchema),
});

export const createAvailabilitySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    isDefault: z.boolean().optional(),
    weeklySchedule: z.array(dayScheduleSchema).length(7, 'Must have exactly 7 days'),
    dateOverrides: z.array(dateOverrideSchema).optional(),
  }),
});

export const updateAvailabilitySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    isDefault: z.boolean().optional(),
    weeklySchedule: z.array(dayScheduleSchema).length(7).optional(),
    dateOverrides: z.array(dateOverrideSchema).optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});
