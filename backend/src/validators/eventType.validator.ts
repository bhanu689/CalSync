import { z } from 'zod';

export const createEventTypeSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100),
    slug: z.string().optional(),
    description: z.string().max(500).optional(),
    durationMinutes: z.number().int().positive('Duration must be positive'),
    bufferBefore: z.number().int().min(0).optional(),
    bufferAfter: z.number().int().min(0).optional(),
    type: z.enum(['one-on-one', 'group']).optional(),
    maxAttendees: z.number().int().positive().optional(),
    location: z.string().max(200).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  }),
});

export const updateEventTypeSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    slug: z.string().optional(),
    description: z.string().max(500).optional(),
    durationMinutes: z.number().int().positive().optional(),
    bufferBefore: z.number().int().min(0).optional(),
    bufferAfter: z.number().int().min(0).optional(),
    type: z.enum(['one-on-one', 'group']).optional(),
    maxAttendees: z.number().int().positive().optional(),
    location: z.string().max(200).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});
