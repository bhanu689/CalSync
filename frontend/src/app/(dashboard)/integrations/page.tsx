'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface CalendarIntegration {
  _id: string;
  provider: 'google' | 'outlook';
  enabled: boolean;
  createdAt: string;
}

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const { data } = useQuery({
    queryKey: ['calendars'],
    queryFn: async () => {
      const res = await api.get<{ integrations: CalendarIntegration[] }>('/calendars');
      return res.data.integrations;
    },
  });

  const { mutate: disconnect } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/calendars/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendars'] });
      toast.success('Calendar disconnected');
    },
  });

  // Show toast on successful connection
  useEffect(() => {
    const connected = searchParams.get('connected');
    if (connected) {
      toast.success(`${connected.charAt(0).toUpperCase() + connected.slice(1)} Calendar connected!`);
      window.history.replaceState({}, '', '/integrations');
    }
  }, [searchParams]);

  const googleConnected = data?.find((i) => i.provider === 'google');
  const outlookConnected = data?.find((i) => i.provider === 'outlook');

  const connectGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/calendars/google/connect`;
  };

  const connectOutlook = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/calendars/outlook/connect`;
  };

  const getAppleIcsUrl = () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/calendars/apple/export`;
    navigator.clipboard.writeText(url);
    toast.success('ICS URL copied! Add it as a calendar subscription in Apple Calendar.');
  };

  const integrations = [
    {
      name: 'Google Calendar',
      description: 'Sync busy times and create events on bookings.',
      icon: '🗓️',
      connected: googleConnected,
      onConnect: connectGoogle,
    },
    {
      name: 'Outlook Calendar',
      description: 'Connect Microsoft Outlook to sync your schedule.',
      icon: '📧',
      connected: outlookConnected,
      onConnect: connectOutlook,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="mt-1 text-sm text-gray-500">Connect your calendars to sync availability and events.</p>
      </div>

      <div className="space-y-4">
        {integrations.map((integration) => (
          <Card key={integration.name}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{integration.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                    {integration.connected && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                        <Check className="w-3 h-3" />
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{integration.description}</p>
                </div>
              </div>
              {integration.connected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnect(integration.connected!._id)}
                >
                  Disconnect
                </Button>
              ) : (
                <Button size="sm" onClick={integration.onConnect}>
                  Connect
                </Button>
              )}
            </div>
          </Card>
        ))}

        {/* Apple Calendar */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🍎</span>
              <div>
                <h3 className="font-semibold text-gray-900">Apple Calendar</h3>
                <p className="text-sm text-gray-500">
                  Subscribe to an ICS feed to see bookings in Apple Calendar.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={getAppleIcsUrl} className="gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              Copy ICS URL
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
