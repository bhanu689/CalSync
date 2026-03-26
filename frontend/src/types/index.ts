// User
export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  timezone: string;
  avatar: string | null;
  authProvider: 'local' | 'google' | 'both';
}

// Event Types
export interface EventType {
  id: string;
  title: string;
  slug: string;
  description?: string;
  durationMinutes: number;
  bufferBefore: number;
  bufferAfter: number;
  type: 'one-on-one' | 'group';
  maxAttendees?: number;
  location?: string;
  isActive: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// Availability
export interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "17:00"
}

export interface DaySchedule {
  day: number;
  enabled: boolean;
  slots: TimeSlot[];
}

export interface DateOverride {
  date: string;
  enabled: boolean;
  slots: TimeSlot[];
}

export interface Availability {
  id: string;
  name: string;
  isDefault: boolean;
  weeklySchedule: DaySchedule[];
  dateOverrides: DateOverride[];
  createdAt: string;
  updatedAt: string;
}

// Bookings
export interface Invitee {
  name: string;
  email: string;
  timezone: string;
}

export interface Booking {
  id: string;
  eventType: {
    id: string;
    title: string;
    durationMinutes: number;
    color: string;
  };
  invitee: Invitee;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled' | 'rescheduled';
  cancelReason?: string;
  notes?: string;
  meetingLink?: string;
  createdAt: string;
}

// Notifications
export interface Notification {
  id: string;
  type: 'booking_created' | 'booking_cancelled' | 'booking_rescheduled' | 'reminder';
  title: string;
  message: string;
  metadata: {
    bookingId?: string;
    eventTypeId?: string;
  };
  isRead: boolean;
  createdAt: string;
}

// API Response
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Slot
export interface AvailableSlot {
  start: string;
  end: string;
}
