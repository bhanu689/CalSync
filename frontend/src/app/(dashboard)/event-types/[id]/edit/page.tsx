'use client';

import { useParams } from 'next/navigation';
import { useEventType, useUpdateEventType } from '@/queries/useEventTypes';
import { EventTypeForm, EventTypeFormData } from '@/components/event-types/EventTypeForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditEventTypePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: eventType, isLoading } = useEventType(id);
  const { mutate: update, isPending } = useUpdateEventType();

  const handleSubmit = (data: EventTypeFormData) => {
    update({ id, ...data });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!eventType) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Event type not found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/event-types"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Event Types
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Event Type</h1>
      </div>

      <EventTypeForm
        defaultValues={{
          title: eventType.title,
          slug: eventType.slug,
          description: eventType.description,
          durationMinutes: eventType.durationMinutes,
          bufferBefore: eventType.bufferBefore,
          bufferAfter: eventType.bufferAfter,
          type: eventType.type,
          maxAttendees: eventType.maxAttendees,
          location: eventType.location,
          color: eventType.color,
        }}
        onSubmit={handleSubmit}
        isPending={isPending}
        submitLabel="Save Changes"
      />
    </div>
  );
}
