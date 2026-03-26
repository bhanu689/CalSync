'use client';

import { useCreateEventType } from '@/queries/useEventTypes';
import { EventTypeForm, EventTypeFormData } from '@/components/event-types/EventTypeForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewEventTypePage() {
  const { mutate: create, isPending } = useCreateEventType();

  const handleSubmit = (data: EventTypeFormData) => {
    create(data);
  };

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
        <h1 className="text-2xl font-bold text-gray-900">New Event Type</h1>
      </div>

      <EventTypeForm
        onSubmit={handleSubmit}
        isPending={isPending}
        submitLabel="Create Event Type"
      />
    </div>
  );
}
