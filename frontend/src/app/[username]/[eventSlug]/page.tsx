'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, ArrowLeft } from 'lucide-react';
import { AvailableSlot } from '@/types';
import Link from 'next/link';

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const eventSlug = params.eventSlug as string;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const inviteeTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Fetch public profile for event info
  const { data: profileData } = useQuery({
    queryKey: ['publicProfile', username],
    queryFn: async () => {
      const res = await api.get(`/users/${username}`);
      return res.data;
    },
  });

  const eventType = profileData?.eventTypes?.find(
    (et: { slug: string }) => et.slug === eventSlug
  );

  // Fetch slots for selected date
  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', username, eventSlug, selectedDate, inviteeTimezone],
    queryFn: async () => {
      const res = await api.get<{ slots: AvailableSlot[] }>('/availability/slots', {
        params: { username, eventTypeSlug: eventSlug, date: selectedDate, timezone: inviteeTimezone },
      });
      return res.data.slots;
    },
    enabled: !!selectedDate,
  });

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: Array<{ date: string; day: number; isPast: boolean; isCurrentMonth: boolean }> = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push({ date: '', day: 0, isPast: true, isCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        date: dateStr,
        day: d,
        isPast: date < today,
        isCurrentMonth: true,
      });
    }

    return days;
  }, [currentMonth]);

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
  };

  const handleConfirm = () => {
    if (!selectedSlot || !eventType) return;
    const params = new URLSearchParams({
      startTime: selectedSlot.start,
      endTime: selectedSlot.end,
      eventTypeId: eventType.id,
      timezone: inviteeTimezone,
    });
    router.push(`/${username}/${eventSlug}/confirm?${params}`);
  };

  const formatSlotTime = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: inviteeTimezone,
    });
  };

  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href={`/${username}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {eventType && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{eventType.title}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              {eventType.durationMinutes} min
            </div>
            {eventType.description && (
              <p className="text-sm text-gray-500 mt-2">{eventType.description}</p>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* Calendar */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{monthLabel}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-1.5 rounded-lg hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-1.5 rounded-lg hover:bg-gray-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="text-xs font-medium text-gray-400 py-2">{d}</div>
                ))}
                {calendarDays.map((day, i) => (
                  <button
                    key={i}
                    disabled={!day.isCurrentMonth || day.isPast}
                    onClick={() => day.date && handleDateClick(day.date)}
                    className={`py-2 text-sm rounded-lg transition-colors ${
                      !day.isCurrentMonth
                        ? 'invisible'
                        : day.isPast
                        ? 'text-gray-300 cursor-not-allowed'
                        : day.date === selectedDate
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-gray-700 hover:bg-blue-50 font-medium'
                    }`}
                  >
                    {day.day || ''}
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Timezone: {inviteeTimezone}
              </p>
            </div>

            {/* Time slots */}
            <div className="p-6">
              {!selectedDate ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  Select a date to see available times
                </div>
              ) : slotsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !slotsData || slotsData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No available times for this date
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {slotsData.map((slot, i) => (
                      <div key={i} className="flex gap-2">
                        <button
                          onClick={() => handleSlotSelect(slot)}
                          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                            selectedSlot?.start === slot.start
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-200 text-gray-700 hover:border-blue-300'
                          }`}
                        >
                          {formatSlotTime(slot.start)}
                        </button>
                        {selectedSlot?.start === slot.start && (
                          <button
                            onClick={handleConfirm}
                            className="px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
