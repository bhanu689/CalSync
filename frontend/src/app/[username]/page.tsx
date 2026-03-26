'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Calendar, Clock, Users, User } from 'lucide-react';
import Link from 'next/link';

interface PublicProfile {
  user: { name: string; username: string; avatar: string | null };
  eventTypes: Array<{
    id: string;
    title: string;
    slug: string;
    description?: string;
    durationMinutes: number;
    type: 'one-on-one' | 'group';
    color: string;
  }>;
}

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['publicProfile', username],
    queryFn: async () => {
      const res = await api.get<PublicProfile>(`/users/${username}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
          <p className="mt-2 text-gray-500">This scheduling page doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Profile header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {data.user.avatar ? (
              <picture><img src={data.user.avatar} alt={data.user.name} className="w-16 h-16 rounded-full" /></picture>
            ) : (
              <User className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{data.user.name}</h1>
          <p className="text-gray-500 mt-1">Pick an event type to book a time.</p>
        </div>

        {/* Event types */}
        {data.eventTypes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No event types available.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.eventTypes.map((et) => (
              <Link
                key={et.id}
                href={`/${username}/${et.slug}`}
                className="block bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all p-5"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-1.5 h-14 rounded-full flex-shrink-0"
                    style={{ backgroundColor: et.color }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{et.title}</h3>
                    {et.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{et.description}</p>
                    )}
                    <div className="flex gap-3 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        {et.durationMinutes} min
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        {et.type === 'group' ? (
                          <><Users className="w-3.5 h-3.5" /> Group</>
                        ) : (
                          <><User className="w-3.5 h-3.5" /> 1-on-1</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
