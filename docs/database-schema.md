# Database Schema (MongoDB + Mongoose)

## Collections Overview

| Collection | Purpose |
|------------|---------|
| users | Registered users (hosts) |
| eventtypes | Event type configurations |
| availabilities | Weekly schedules + date overrides |
| bookings | Scheduled appointments |
| notifications | In-app notifications |
| calendarintegrations | Connected calendar provider tokens |

---

## 1. Users

```typescript
interface IUser {
  _id: ObjectId;
  email: string;                    // unique, indexed
  username: string;                 // unique, indexed (for public URLs)
  name: string;
  passwordHash?: string;            // null for Google OAuth-only users
  avatar?: string;
  timezone: string;                 // IANA timezone, e.g. "America/New_York"
  authProvider: "local" | "google" | "both";
  googleId?: string;                // indexed, sparse
  isEmailVerified: boolean;
  refreshTokenVersion: number;      // increment to invalidate all refresh tokens
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `{ email: 1 }` — unique
- `{ username: 1 }` — unique
- `{ googleId: 1 }` — unique, sparse

---

## 2. CalendarIntegrations

```typescript
interface ICalendarIntegration {
  _id: ObjectId;
  userId: ObjectId;                 // ref: Users
  provider: "google" | "outlook";   // Apple uses ICS, no stored tokens
  accessToken: string;              // encrypted at rest
  refreshToken: string;             // encrypted at rest
  tokenExpiry: Date;
  calendarId: string;               // primary calendar ID
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `{ userId: 1, provider: 1 }` — unique compound

---

## 3. EventTypes

```typescript
interface IEventType {
  _id: ObjectId;
  userId: ObjectId;                 // ref: Users
  title: string;                    // e.g. "30 Minute Meeting"
  slug: string;                     // URL-safe, unique per user
  description?: string;
  durationMinutes: number;          // any positive integer
  bufferBefore: number;             // minutes, default 0
  bufferAfter: number;              // minutes, default 0
  type: "one-on-one" | "group";
  maxAttendees?: number;            // group events only, default 1 for one-on-one
  location?: string;                // "Google Meet", "Zoom", "Phone", free text
  isActive: boolean;                // toggle visibility on public page
  color: string;                    // hex color for UI
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `{ userId: 1, slug: 1 }` — unique compound
- `{ userId: 1, isActive: 1 }`

---

## 4. Availabilities

```typescript
interface ITimeSlot {
  start: string;                    // "09:00" (HH:mm in user's timezone)
  end: string;                      // "17:00"
}

interface IDaySchedule {
  day: number;                      // 0 = Sunday, 6 = Saturday
  enabled: boolean;
  slots: ITimeSlot[];
}

interface IDateOverride {
  date: string;                     // "2026-04-15" ISO date
  enabled: boolean;                 // false = day off
  slots: ITimeSlot[];
}

interface IAvailability {
  _id: ObjectId;
  userId: ObjectId;                 // ref: Users
  name: string;                     // e.g. "Working Hours"
  isDefault: boolean;               // one default per user
  weeklySchedule: IDaySchedule[];   // always 7 entries
  dateOverrides: IDateOverride[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `{ userId: 1 }`
- `{ userId: 1, isDefault: 1 }`

**Notes:**
- Times stored in user's local timezone (conceptual availability)
- Converted to UTC during slot generation

---

## 5. Bookings

```typescript
interface IInvitee {
  name: string;
  email: string;
  timezone: string;                 // IANA timezone
}

interface IBooking {
  _id: ObjectId;
  eventTypeId: ObjectId;            // ref: EventTypes
  hostUserId: ObjectId;             // ref: Users
  invitee: IInvitee;               // invitee does not need an account
  startTime: Date;                  // UTC
  endTime: Date;                    // UTC
  status: "confirmed" | "cancelled" | "rescheduled";
  cancelReason?: string;
  additionalAttendees?: IInvitee[]; // for group events
  calendarEventId?: string;         // ID from external calendar
  calendarProvider?: string;
  meetingLink?: string;
  notes?: string;                   // invitee-provided
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `{ hostUserId: 1, startTime: 1 }`
- `{ eventTypeId: 1, startTime: 1 }`
- `{ "invitee.email": 1 }`
- `{ status: 1 }`

**Race Condition Protection:**
When creating a booking, use MongoDB atomic operations to ensure no overlapping confirmed booking exists for the same host and time slot.

---

## 6. Notifications

```typescript
interface INotification {
  _id: ObjectId;
  userId: ObjectId;                 // ref: Users (notification recipient)
  type: "booking_created" | "booking_cancelled" | "booking_rescheduled" | "reminder";
  title: string;
  message: string;
  metadata: {
    bookingId?: ObjectId;
    eventTypeId?: ObjectId;
  };
  isRead: boolean;                  // default false
  emailSent: boolean;
  createdAt: Date;
}
```

**Indexes:**
- `{ userId: 1, isRead: 1, createdAt: -1 }`

---

## Relationships Diagram

```
Users ─────┬──── 1:N ────▶ EventTypes
            │
            ├──── 1:N ────▶ Availabilities
            │
            ├──── 1:N ────▶ Bookings (as host)
            │
            ├──── 1:N ────▶ CalendarIntegrations
            │
            └──── 1:N ────▶ Notifications

EventTypes ──── 1:N ────▶ Bookings
```
