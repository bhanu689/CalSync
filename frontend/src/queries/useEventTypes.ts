'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { EventType, ApiError } from '@/types';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export function useEventTypes() {
  return useQuery({
    queryKey: ['eventTypes'],
    queryFn: async () => {
      const res = await api.get<{ eventTypes: EventType[] }>('/event-types');
      return res.data.eventTypes;
    },
  });
}

export function useEventType(id: string) {
  return useQuery({
    queryKey: ['eventType', id],
    queryFn: async () => {
      const res = await api.get<EventType>(`/event-types/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateEventType() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      slug?: string;
      description?: string;
      durationMinutes: number;
      bufferBefore?: number;
      bufferAfter?: number;
      type?: 'one-on-one' | 'group';
      maxAttendees?: number;
      location?: string;
      color?: string;
    }) => {
      const res = await api.post<EventType>('/event-types', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventTypes'] });
      toast.success('Event type created');
      router.push('/event-types');
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create event type');
    },
  });
}

export function useUpdateEventType() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<{
      title: string;
      slug: string;
      description: string;
      durationMinutes: number;
      bufferBefore: number;
      bufferAfter: number;
      type: 'one-on-one' | 'group';
      maxAttendees: number;
      location: string;
      color: string;
    }>) => {
      const res = await api.patch<EventType>(`/event-types/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventTypes'] });
      toast.success('Event type updated');
      router.push('/event-types');
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update event type');
    },
  });
}

export function useDeleteEventType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/event-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventTypes'] });
      toast.success('Event type deleted');
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.error?.message || 'Failed to delete');
    },
  });
}

export function useToggleEventType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch<EventType>(`/event-types/${id}/toggle`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventTypes'] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.error?.message || 'Failed to toggle');
    },
  });
}
