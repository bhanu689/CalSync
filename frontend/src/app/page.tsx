'use client';

import Link from 'next/link';
import { Calendar, ArrowRight, Clock, Globe, Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">CalSync</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
          Scheduling made
          <span className="text-blue-600"> effortless</span>
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Set your availability, share your link, and let people book time with you.
          No more back-and-forth emails.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Start for free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Custom availability</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Set your weekly schedule, add date overrides, and configure buffer times between meetings.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Calendar sync</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Connect Google Calendar, Outlook, or Apple Calendar. Busy times are automatically blocked.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Instant notifications</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Get email and in-app notifications when someone books, cancels, or reschedules.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
