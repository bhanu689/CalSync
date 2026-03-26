'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ApiError } from '@/types';
import { Calendar, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useState } from 'react';

const bookingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function ConfirmBookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const username = params.username as string;
  const eventSlug = params.eventSlug as string;

  const startTime = searchParams.get('startTime') || '';
  const eventTypeId = searchParams.get('eventTypeId') || '';
  const timezone = searchParams.get('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [confirmed, setConfirmed] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const { mutate: book, isPending } = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const startDate = new Date(startTime);
      const res = await api.post('/bookings', {
        eventTypeId,
        startTime: startDate.toISOString(),
        invitee: {
          name: data.name,
          email: data.email,
          timezone,
        },
        notes: data.notes,
      });
      return res.data;
    },
    onSuccess: () => {
      setConfirmed(true);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.error?.message || 'Booking failed');
    },
  });

  const formatDateTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
    });
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <div className="py-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-500 mb-4">
              You&apos;re all set. A confirmation will be sent to your email.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left text-sm space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                {formatDateTime(startTime)}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                {timezone}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link
          href={`/${username}/${eventSlug}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <Card>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Confirm your booking</h1>

          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-sm space-y-1">
            <div className="flex items-center gap-2 text-blue-700 font-medium">
              <Calendar className="w-4 h-4" />
              {formatDateTime(startTime)}
            </div>
            <p className="text-blue-600 text-xs ml-6">{timezone}</p>
          </div>

          <form onSubmit={handleSubmit((data) => book(data))} className="space-y-4">
            <Input
              id="name"
              label="Your name"
              placeholder="Jane Smith"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="jane@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Anything you'd like to share ahead of the meeting"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                {...register('notes')}
              />
            </div>
            <Button type="submit" className="w-full" isLoading={isPending}>
              Confirm Booking
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
