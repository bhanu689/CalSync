'use client';

import { useUnreadCount } from '@/queries/useNotifications';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export function NotificationBell() {
  const { data: count } = useUnreadCount();

  return (
    <Link
      href="/notifications"
      className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <Bell className="w-5 h-5 text-gray-500" />
      {count && count > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      ) : null}
    </Link>
  );
}
