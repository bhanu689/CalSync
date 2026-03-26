'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { User, ApiError } from '@/types';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AuthResponse {
  accessToken: string;
  user: User;
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: { name: string; email: string; password: string; username: string }) => {
      const res = await api.post<AuthResponse>('/auth/register', data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      toast.success('Account created!');
      router.push('/dashboard');
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.error?.message || 'Registration failed');
    },
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await api.post<AuthResponse>('/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      toast.success('Welcome back!');
      router.push('/dashboard');
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.error?.message || 'Login failed');
    },
  });
}

export function useMe() {
  const { setAuth, clearAuth } = useAuthStore();

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const refreshRes = await api.post<{ accessToken: string }>('/auth/refresh');
        const token = refreshRes.data.accessToken;

        const meRes = await api.get<User>('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAuth(token, meRes.data);
        return meRes.data;
      } catch {
        clearAuth();
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      clearAuth();
      router.push('/login');
    },
  });
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (data: { name?: string; username?: string; timezone?: string }) => {
      const res = await api.patch<User>('/auth/me', data);
      return res.data;
    },
    onSuccess: (data) => {
      setUser(data);
      toast.success('Profile updated');
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.error?.message || 'Update failed');
    },
  });
}
