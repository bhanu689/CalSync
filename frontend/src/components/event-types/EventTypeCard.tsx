'use client';

import { EventType } from '@/types';
import { useToggleEventType, useDeleteEventType } from '@/queries/useEventTypes';
import { useAuthStore } from '@/stores/authStore';
import {
  Clock,
  Users,
  User,
  Copy,
  Pencil,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface EventTypeCardProps {
  eventType: EventType;
}

export function EventTypeCard({ eventType }: EventTypeCardProps) {
  const user = useAuthStore((s) => s.user);
  const { mutate: toggle } = useToggleEventType();
  const { mutate: deleteEventType } = useDeleteEventType();
  const [showConfirm, setShowConfirm] = useState(false);

  const bookingUrl = `${window.location.origin}/${user?.username}/${eventType.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    toast.success('Link copied!');
  };

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Color accent bar */}
      <div className="h-1.5" style={{ backgroundColor: eventType.color }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{eventType.title}</h3>
            {eventType.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{eventType.description}</p>
            )}
          </div>

          {/* Active toggle */}
          <button
            onClick={() => toggle(eventType.id)}
            className={`relative ml-3 flex-shrink-0 w-10 h-6 rounded-full transition-colors duration-200 ${
              eventType.isActive ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                eventType.isActive ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md text-xs font-medium text-gray-600">
            <Clock className="w-3 h-3" />
            {eventType.durationMinutes} min
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md text-xs font-medium text-gray-600">
            {eventType.type === 'group' ? (
              <><Users className="w-3 h-3" /> Group</>
            ) : (
              <><User className="w-3 h-3" /> 1-on-1</>
            )}
          </span>
          {eventType.location && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md text-xs font-medium text-gray-600 truncate max-w-[120px]">
              {eventType.location}
            </span>
          )}
        </div>

        {/* Booking link */}
        <div className="flex items-center gap-1 mb-4 px-2.5 py-2 bg-gray-50 rounded-lg">
          <span className="text-xs text-gray-500 truncate flex-1">
            /{user?.username}/{eventType.slug}
          </span>
          <button onClick={copyLink} className="p-1 hover:bg-gray-200 rounded transition-colors" title="Copy link">
            <Copy className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <Link href={`/${user?.username}/${eventType.slug}`} target="_blank" className="p-1 hover:bg-gray-200 rounded transition-colors" title="Open booking page">
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <Link
            href={`/event-types/${eventType.id}/edit`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Link>

          {showConfirm ? (
            <div className="flex-1 flex gap-1">
              <button
                onClick={() => deleteEventType(eventType.id)}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
