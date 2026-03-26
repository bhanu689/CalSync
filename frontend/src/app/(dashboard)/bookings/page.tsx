'use client';

import { useBookings, useCancelBooking } from '@/queries/useBookings';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Calendar, Clock, Mail, User, X } from 'lucide-react';
import { useState } from 'react';
import { Booking } from '@/types';

type Tab = 'upcoming' | 'past' | 'cancelled';

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [cancelModal, setCancelModal] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const now = new Date().toISOString();

  const { data, isLoading } = useBookings(
    activeTab === 'upcoming'
      ? { status: 'confirmed', page: 1 }
      : activeTab === 'cancelled'
      ? { status: 'cancelled', page: 1 }
      : { page: 1 }
  );

  const { mutate: cancel, isPending: isCancelling } = useCancelBooking();

  const filteredBookings = data?.bookings?.filter((b) => {
    if (activeTab === 'upcoming') return b.status === 'confirmed' && b.startTime > now;
    if (activeTab === 'past') return b.startTime <= now || b.status === 'rescheduled';
    return b.status === 'cancelled';
  }) || [];

  const handleCancel = () => {
    if (!cancelModal) return;
    cancel(
      { id: cancelModal.id, reason: cancelReason },
      { onSuccess: () => { setCancelModal(null); setCancelReason(''); } }
    );
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your scheduled appointments.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 h-24 animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No {activeTab} bookings</h3>
          <p className="text-sm text-gray-500 mt-1">
            {activeTab === 'upcoming'
              ? 'Share your booking link to start getting booked.'
              : `You have no ${activeTab} bookings.`}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} padding="none">
              <div className="flex items-stretch">
                {/* Color bar */}
                <div
                  className="w-1.5 rounded-l-xl flex-shrink-0"
                  style={{ backgroundColor: (booking.eventType as { color?: string; title?: string })?.color || '#3B82F6' }}
                />

                <div className="flex-1 p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {(booking.eventType as { color?: string; title?: string })?.title || 'Meeting'}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(booking.startTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {booking.invitee.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {booking.invitee.email}
                      </span>
                    </div>
                  </div>

                  {booking.status === 'confirmed' && activeTab === 'upcoming' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCancelModal(booking)}
                      className="flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Cancel
                    </Button>
                  )}

                  {booking.status === 'cancelled' && (
                    <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full font-medium flex-shrink-0">
                      Cancelled
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel modal */}
      <Modal
        isOpen={!!cancelModal}
        onClose={() => { setCancelModal(null); setCancelReason(''); }}
        title="Cancel Booking"
      >
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to cancel the booking with{' '}
          <strong>{cancelModal?.invitee.name}</strong>?
        </p>
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Reason for cancellation (optional)"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setCancelModal(null)}>
            Keep Booking
          </Button>
          <Button variant="danger" onClick={handleCancel} isLoading={isCancelling}>
            Cancel Booking
          </Button>
        </div>
      </Modal>
    </div>
  );
}
