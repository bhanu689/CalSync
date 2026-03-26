'use client';

import { useEventTypes } from '@/queries/useEventTypes';
import { EventTypeCard } from '@/components/event-types/EventTypeCard';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Plus, CalendarRange } from 'lucide-react';

export default function EventTypesPage() {
  const { data: eventTypes, isLoading } = useEventTypes();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Types</h1>
          <p className="mt-1 text-sm text-gray-500">Create events to share for people to book on your calendar.</p>
        </div>
        <Link href="/event-types/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Event Type
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 h-64 animate-pulse">
              <div className="h-1.5 bg-gray-200 rounded-t-xl" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="flex gap-2 mt-4">
                  <div className="h-6 bg-gray-100 rounded w-16" />
                  <div className="h-6 bg-gray-100 rounded w-14" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : eventTypes && eventTypes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventTypes.map((et) => (
            <EventTypeCard key={et.id} eventType={et} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CalendarRange className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No event types yet</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Create your first event type to start getting booked.
          </p>
          <Link href="/event-types/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Event Type
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
