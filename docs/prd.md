# Product Requirements Document: CalSync - Scheduling Platform

## 1. Overview

CalSync is a web-based, mobile-responsive scheduling platform similar to Calendly. It allows users to set their availability, share booking links, and let invitees schedule appointments — eliminating back-and-forth emails.

## 2. Goals

- Allow users to create event types (one-on-one and group) with custom durations
- Provide public booking pages where invitees can pick available slots
- Integrate with Google Calendar, Outlook, and Apple Calendar
- Support scheduling across time zones
- Deliver email and in-app notifications for booking events

## 3. Non-Goals

- LLM/AI features
- Booking page appearance customization (no custom branding)
- Round-robin team scheduling
- Payment collection for bookings
- SMS notifications
- Recurring/repeating events

## 4. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| State Management | Zustand |
| Data Fetching | React Query (@tanstack/react-query) |
| Forms | React Hook Form + Zod validation |
| Backend | Express.js, TypeScript |
| Database | MongoDB (local, Mongoose ODM) |
| Auth | Google OAuth 2.0 + Email/Password (JWT) |
| Email | Nodemailer |

## 5. User Roles

| Role | Description |
|------|------------|
| Host | Registered user who sets availability and creates event types |
| Invitee | Anyone (no account required) who books a slot via a public link |

## 6. Features

### 6.1 Authentication

**Email/Password Registration & Login**
- Register with name, email, password, and username (for public URL)
- Password hashed with bcrypt (12 rounds)
- JWT access token (15 min, stored in memory) + refresh token (7 days, httpOnly cookie)
- Silent token refresh on app mount

**Google OAuth**
- Sign up / sign in via Google
- If a Google account email matches an existing email/password user, link the accounts
- Scopes: `profile`, `email`

### 6.2 Event Types

Hosts can create and manage event types:

| Field | Description |
|-------|------------|
| Title | Display name (e.g., "30 Minute Meeting") |
| Slug | URL-safe identifier, auto-generated from title, unique per user |
| Description | Optional description shown on booking page |
| Duration | Custom duration in minutes (any positive integer) |
| Buffer Before | Minutes of gap before the meeting (default: 0) |
| Buffer After | Minutes of gap after the meeting (default: 0) |
| Type | One-on-one or Group |
| Max Attendees | For group events only (default: 1 for one-on-one) |
| Location | Free text (e.g., "Google Meet", "Zoom", "Phone") |
| Active/Inactive | Toggle to hide from public booking page |
| Color | Hex color for UI display |

### 6.3 Availability Management

**Weekly Schedule**
- 7-day recurring schedule (e.g., Mon-Fri 9:00 AM - 5:00 PM)
- Multiple time slots per day (e.g., 9-12 and 1-5)
- Each day can be toggled on/off
- Stored in user's local timezone

**Date Overrides**
- Override specific dates with custom hours or mark as unavailable
- Takes priority over weekly schedule

**Default Availability**
- On registration, users get a default schedule: Mon-Fri, 9:00 AM - 5:00 PM

### 6.4 Public Booking Pages

**User Profile Page** (`/:username`)
- Displays user name and list of active event types
- No authentication required

**Booking Page** (`/:username/:eventSlug`)
- Date picker showing available dates
- Time slot grid for selected date
- Slots calculated based on:
  - Host's availability schedule (weekly + overrides)
  - Existing confirmed bookings
  - Busy times from connected calendars (Google, Outlook)
  - Buffer times (before/after)
  - For group events: available until `currentAttendees < maxAttendees`
- Past slots are hidden
- Invitee's timezone auto-detected, can be changed

**Booking Confirmation Page** (`/:username/:eventSlug/confirm`)
- Invitee enters: name, email, timezone, optional notes
- On confirmation:
  - Booking created in database
  - Calendar event created on host's connected calendar
  - Email sent to both host and invitee
  - In-app notification created for host

### 6.5 Bookings Management

Hosts can view and manage their bookings:

- **Upcoming**: Confirmed future bookings
- **Past**: Completed bookings
- **Cancelled**: Cancelled bookings
- Actions: Cancel (with reason), Reschedule

### 6.6 Calendar Integration

| Provider | Auth | Read Busy Times | Create Events | Notes |
|----------|------|-----------------|---------------|-------|
| Google Calendar | OAuth 2.0 | Yes (freebusy API) | Yes | Full bidirectional sync |
| Outlook | OAuth 2.0 (Microsoft Graph) | Yes (getSchedule) | Yes | Full bidirectional sync |
| Apple Calendar | ICS subscription URL | No | Export only | User subscribes to ICS feed in Apple Calendar settings |

**Integration Page**
- Connect/disconnect buttons for each provider
- Status indicator (connected/disconnected)
- For Apple: display subscription URL to copy

### 6.7 Notifications

**In-App Notifications**
- Bell icon in header with unread count badge
- Notification types: booking created, cancelled, rescheduled, reminder
- Mark as read (individual or all)
- Polling-based (30-second interval on unread count)

**Email Notifications**
- Booking confirmation (to host and invitee)
- Booking cancellation (to host and invitee)
- Booking reschedule (to host and invitee)

### 6.8 Time Zone Support

- All dates stored as UTC in database
- Availability stored in user's local timezone (conceptual — "I work 9-5 in my timezone")
- Invitee timezone auto-detected via `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Invitee can manually change timezone on booking page
- All displayed times converted to viewer's timezone

### 6.9 Dashboard

- Overview of upcoming bookings (next 7 days)
- Quick stats: total bookings, upcoming count, event types count
- Quick links to create event type, copy booking link

## 7. Pages

| Route | Auth Required | Description |
|-------|---------------|-------------|
| `/` | No | Landing page |
| `/login` | No | Login form + Google OAuth |
| `/register` | No | Registration form |
| `/dashboard` | Yes | Overview with stats and upcoming bookings |
| `/event-types` | Yes | List/manage event types |
| `/event-types/new` | Yes | Create event type form |
| `/event-types/[id]/edit` | Yes | Edit event type form |
| `/availability` | Yes | Weekly schedule + date overrides editor |
| `/integrations` | Yes | Connect/disconnect calendar providers |
| `/bookings` | Yes | Bookings list with tabs |
| `/notifications` | Yes | Full notification list |
| `/:username` | No | Public user profile |
| `/:username/:eventSlug` | No | Public booking page (date/time selection) |
| `/:username/:eventSlug/confirm` | No | Booking confirmation form |

## 8. Non-Functional Requirements

- **Responsive**: Mobile-first design, works on all screen sizes
- **Security**: Passwords hashed (bcrypt), JWT with httpOnly refresh cookies, input validation (Zod), CORS configured
- **Race Conditions**: Booking creation uses atomic MongoDB operations to prevent double-booking
- **Scalability**: Separate frontend/backend allows independent scaling
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

## 9. Assumptions

1. Users have a Google account available for OAuth setup (Google Cloud Console credentials)
2. Local MongoDB is running for development
3. SMTP credentials available for email notifications (e.g., Gmail app password)
4. Microsoft Azure AD app registration available for Outlook integration
5. Single-developer, 7-day timeline
6. No payment processing required
7. No team/organization features beyond group events
