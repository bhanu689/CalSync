'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
];

const eventTypeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  slug: z.string().optional(),
  description: z.string().max(500).optional(),
  durationMinutes: z.number().int().positive('Must be positive'),
  bufferBefore: z.number().int().min(0).optional(),
  bufferAfter: z.number().int().min(0).optional(),
  type: z.enum(['one-on-one', 'group']),
  maxAttendees: z.number().int().positive().optional(),
  location: z.string().max(200).optional(),
  color: z.string(),
});

export type EventTypeFormData = z.infer<typeof eventTypeSchema>;

interface EventTypeFormProps {
  defaultValues?: Partial<EventTypeFormData>;
  onSubmit: (data: EventTypeFormData) => void;
  isPending: boolean;
  submitLabel: string;
}

export function EventTypeForm({ defaultValues, onSubmit, isPending, submitLabel }: EventTypeFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventTypeFormData>({
    resolver: zodResolver(eventTypeSchema),
    defaultValues: {
      type: 'one-on-one',
      color: '#3B82F6',
      durationMinutes: 30,
      bufferBefore: 0,
      bufferAfter: 0,
      ...defaultValues,
    },
  });

  const eventTypeType = watch('type');
  const selectedColor = watch('color');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <Card>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Basic Info</h3>

        <div className="space-y-4">
          <Input
            id="title"
            label="Title"
            placeholder="e.g. 30 Minute Meeting"
            error={errors.title?.message}
            {...register('title')}
          />

          <Input
            id="slug"
            label="URL Slug (optional, auto-generated from title)"
            placeholder="30-minute-meeting"
            error={errors.slug?.message}
            {...register('slug')}
          />

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Brief description shown on your booking page"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Duration & Buffers</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            id="durationMinutes"
            label="Duration (minutes)"
            type="number"
            min={1}
            error={errors.durationMinutes?.message}
            {...register('durationMinutes', { valueAsNumber: true })}
          />
          <Input
            id="bufferBefore"
            label="Buffer before (min)"
            type="number"
            min={0}
            error={errors.bufferBefore?.message}
            {...register('bufferBefore', { valueAsNumber: true })}
          />
          <Input
            id="bufferAfter"
            label="Buffer after (min)"
            type="number"
            min={0}
            error={errors.bufferAfter?.message}
            {...register('bufferAfter', { valueAsNumber: true })}
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Event Type</h3>

        <div className="flex gap-3 mb-4">
          <button
            type="button"
            onClick={() => setValue('type', 'one-on-one')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
              eventTypeType === 'one-on-one'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            One-on-One
          </button>
          <button
            type="button"
            onClick={() => setValue('type', 'group')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
              eventTypeType === 'group'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            Group Event
          </button>
        </div>

        {eventTypeType === 'group' && (
          <Input
            id="maxAttendees"
            label="Max attendees"
            type="number"
            min={2}
            placeholder="10"
            error={errors.maxAttendees?.message}
            {...register('maxAttendees', { valueAsNumber: true })}
          />
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Details</h3>

        <div className="space-y-4">
          <Input
            id="location"
            label="Location"
            placeholder="Google Meet, Zoom link, Phone, etc."
            error={errors.location?.message}
            {...register('location')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input type="hidden" {...register('color')} />
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" isLoading={isPending}>
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
