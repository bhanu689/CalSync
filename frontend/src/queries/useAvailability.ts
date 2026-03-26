'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { Availability, DaySchedule, DateOverride, ApiError } from '@/types';
import toast from 'react-hot-toast';

export function useAvailabilities() {
  return useQuery({
    queryKey: ['availabilities'],
    queryFn: async () => {
      const res = await api.get<{ availabilities: Availability[] }>('/availability');
      return res.data.availabilities;
    },
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      name?: string;
      isDefault?: boolean;
      weeklySchedule?: DaySchedule[];
      dateOverrides?: DateOverride[];
    }) => {
      const res = await api.patch<Availability>(`/availability/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });
      toast.success('Availability saved');
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.error?.message || 'Failed to save');
    },
  });
}
