# API Specification

Base URL: `http://localhost:5000/api`

All request/response bodies are JSON. Auth-required endpoints expect `Authorization: Bearer <accessToken>` header.

---

## 1. Auth (`/auth`)

### POST `/auth/register`
Create a new account with email/password.

**Body:**
```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "username": "string (required, alphanumeric + hyphens, 3-30 chars)"
}
```

**Response 201:**
```json
{
  "accessToken": "string",
  "user": { "id", "name", "email", "username", "timezone", "avatar" }
}
```
+ Sets `refreshToken` httpOnly cookie.

**Errors:** 409 (email/username taken), 400 (validation)

---

### POST `/auth/login`
Login with email/password.

**Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response 200:** Same as register.

**Errors:** 401 (invalid credentials)

---

### POST `/auth/refresh`
Refresh access token using httpOnly cookie.

**Body:** None (cookie sent automatically)

**Response 200:**
```json
{ "accessToken": "string" }
```

**Errors:** 401 (invalid/expired refresh token)

---

### POST `/auth/logout` 🔒
Invalidate refresh token.

**Response 200:**
```json
{ "message": "Logged out" }
```

---

### GET `/auth/google`
Redirect to Google OAuth consent screen.

**Response:** 302 redirect to Google.

---

### GET `/auth/google/callback`
Google OAuth callback. Creates/links user account.

**Response:** 302 redirect to `FRONTEND_URL/dashboard?token=<accessToken>` + sets refreshToken cookie.

---

### GET `/auth/me` 🔒
Get current user profile.

**Response 200:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "username": "string",
  "timezone": "string",
  "avatar": "string | null",
  "authProvider": "local | google | both"
}
```

---

### PATCH `/auth/me` 🔒
Update profile.

**Body (all optional):**
```json
{
  "name": "string",
  "username": "string",
  "timezone": "string"
}
```

**Response 200:** Updated user object.

---

## 2. Event Types (`/event-types`) 🔒

### GET `/event-types`
List current user's event types.

**Response 200:**
```json
{
  "eventTypes": [
    {
      "id", "title", "slug", "description", "durationMinutes",
      "bufferBefore", "bufferAfter", "type", "maxAttendees",
      "location", "isActive", "color", "createdAt"
    }
  ]
}
```

---

### POST `/event-types`
Create event type.

**Body:**
```json
{
  "title": "string (required)",
  "slug": "string (optional, auto-generated from title)",
  "description": "string (optional)",
  "durationMinutes": "number (required, > 0)",
  "bufferBefore": "number (default 0)",
  "bufferAfter": "number (default 0)",
  "type": "one-on-one | group (default one-on-one)",
  "maxAttendees": "number (required if group)",
  "location": "string (optional)",
  "color": "string (optional, default #3B82F6)"
}
```

**Response 201:** Created event type object.

**Errors:** 409 (slug taken for this user)

---

### GET `/event-types/:id`
Get event type details.

**Response 200:** Event type object.

---

### PATCH `/event-types/:id`
Update event type. All fields optional.

**Response 200:** Updated event type object.

---

### DELETE `/event-types/:id`
Delete event type.

**Response 200:**
```json
{ "message": "Event type deleted" }
```

---

### PATCH `/event-types/:id/toggle`
Toggle isActive status.

**Response 200:** Updated event type object.

---

## 3. Availability (`/availability`)

### GET `/availability` 🔒
List user's availability schedules.

**Response 200:**
```json
{
  "availabilities": [
    {
      "id", "name", "isDefault",
      "weeklySchedule": [
        { "day": 0, "enabled": false, "slots": [] },
        { "day": 1, "enabled": true, "slots": [{ "start": "09:00", "end": "17:00" }] }
      ],
      "dateOverrides": [
        { "date": "2026-04-15", "enabled": false, "slots": [] }
      ]
    }
  ]
}
```

---

### POST `/availability` 🔒
Create availability schedule.

**Body:**
```json
{
  "name": "string (required)",
  "isDefault": "boolean (default false)",
  "weeklySchedule": "IDaySchedule[] (required, 7 entries)",
  "dateOverrides": "IDateOverride[] (optional, default [])"
}
```

**Response 201:** Created availability object.

---

### PATCH `/availability/:id` 🔒
Update availability schedule.

**Body (all optional):**
```json
{
  "name": "string",
  "isDefault": "boolean",
  "weeklySchedule": "IDaySchedule[]",
  "dateOverrides": "IDateOverride[]"
}
```

**Response 200:** Updated availability object.

---

### DELETE `/availability/:id` 🔒
Delete availability schedule. Cannot delete if it's the only one.

**Response 200:**
```json
{ "message": "Availability deleted" }
```

**Errors:** 400 (cannot delete last schedule)

---

### GET `/availability/slots` (Public)
Get available time slots for booking.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | Yes | Host's username |
| eventTypeSlug | string | Yes | Event type slug |
| date | string | Yes | ISO date "2026-04-01" |
| timezone | string | Yes | Invitee's IANA timezone |

**Response 200:**
```json
{
  "slots": [
    { "start": "2026-04-01T09:00:00", "end": "2026-04-01T09:30:00" },
    { "start": "2026-04-01T09:30:00", "end": "2026-04-01T10:00:00" }
  ],
  "timezone": "America/New_York"
}
```

Times are in the invitee's requested timezone.

---

## 4. Bookings (`/bookings`)

### GET `/bookings` 🔒
List host's bookings.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | string | all | "confirmed", "cancelled", "rescheduled" |
| from | string | - | ISO date, filter start |
| to | string | - | ISO date, filter end |
| page | number | 1 | Pagination |
| limit | number | 20 | Items per page |

**Response 200:**
```json
{
  "bookings": [
    {
      "id", "eventType": { "id", "title", "durationMinutes", "color" },
      "invitee": { "name", "email", "timezone" },
      "startTime", "endTime", "status", "notes", "meetingLink", "createdAt"
    }
  ],
  "total": 42,
  "page": 1,
  "totalPages": 3
}
```

---

### POST `/bookings` (Public)
Create a booking (invitee books a slot).

**Body:**
```json
{
  "eventTypeId": "string (required)",
  "startTime": "string (required, ISO datetime in UTC)",
  "invitee": {
    "name": "string (required)",
    "email": "string (required, valid email)",
    "timezone": "string (required, IANA timezone)"
  },
  "notes": "string (optional)"
}
```

**Response 201:**
```json
{
  "booking": {
    "id", "startTime", "endTime", "status": "confirmed",
    "invitee", "meetingLink", "eventType": { "title", "durationMinutes" },
    "host": { "name", "email" }
  }
}
```

**Errors:** 409 (slot no longer available), 400 (validation)

---

### GET `/bookings/:id` 🔒
Get booking details.

**Response 200:** Full booking object with populated eventType and host.

---

### PATCH `/bookings/:id/cancel` 🔒
Cancel a booking.

**Body:**
```json
{
  "reason": "string (optional)"
}
```

**Response 200:** Updated booking with `status: "cancelled"`.

Side effects: Email to invitee, in-app notification, calendar event deleted.

---

### PATCH `/bookings/:id/reschedule` 🔒
Reschedule a booking.

**Body:**
```json
{
  "newStartTime": "string (required, ISO datetime in UTC)"
}
```

**Response 200:** Updated booking with new times.

Side effects: Email to invitee, in-app notification, calendar event updated.

---

## 5. Calendar Integrations (`/calendars`) 🔒

### GET `/calendars`
List connected calendars.

**Response 200:**
```json
{
  "integrations": [
    { "id", "provider": "google", "calendarId", "enabled", "createdAt" }
  ]
}
```

---

### GET `/calendars/google/connect`
Start Google Calendar OAuth flow.

**Response:** 302 redirect to Google consent (calendar scopes).

---

### GET `/calendars/google/callback`
Google Calendar OAuth callback.

**Response:** 302 redirect to `FRONTEND_URL/integrations?connected=google`.

---

### GET `/calendars/outlook/connect`
Start Outlook OAuth flow.

**Response:** 302 redirect to Microsoft consent.

---

### GET `/calendars/outlook/callback`
Outlook OAuth callback.

**Response:** 302 redirect to `FRONTEND_URL/integrations?connected=outlook`.

---

### DELETE `/calendars/:id`
Disconnect a calendar integration.

**Response 200:**
```json
{ "message": "Calendar disconnected" }
```

---

### GET `/calendars/busy-times`
Fetch aggregated busy times from all connected calendars.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| start | string | Yes | ISO datetime |
| end | string | Yes | ISO datetime |

**Response 200:**
```json
{
  "busyTimes": [
    { "start": "2026-04-01T10:00:00Z", "end": "2026-04-01T11:00:00Z", "provider": "google" }
  ]
}
```

---

### GET `/calendars/apple/export`
Generate ICS subscription feed for Apple Calendar.

**Response 200:** `text/calendar` content type, `.ics` file body.

---

## 6. Notifications (`/notifications`) 🔒

### GET `/notifications`
List notifications (paginated, newest first).

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| page | number | 1 |
| limit | number | 20 |

**Response 200:**
```json
{
  "notifications": [
    { "id", "type", "title", "message", "metadata", "isRead", "createdAt" }
  ],
  "total": 15,
  "page": 1,
  "totalPages": 1
}
```

---

### GET `/notifications/unread-count`
Get count of unread notifications.

**Response 200:**
```json
{ "count": 3 }
```

---

### PATCH `/notifications/:id/read`
Mark single notification as read.

**Response 200:** Updated notification.

---

### PATCH `/notifications/read-all`
Mark all notifications as read.

**Response 200:**
```json
{ "message": "All notifications marked as read" }
```

---

## 7. Public Users (`/users`)

### GET `/users/:username` (Public)
Get public profile for booking page.

**Response 200:**
```json
{
  "user": {
    "name": "string",
    "username": "string",
    "avatar": "string | null"
  },
  "eventTypes": [
    { "id", "title", "slug", "description", "durationMinutes", "type", "color" }
  ]
}
```

**Errors:** 404 (user not found)

---

## Error Response Format

All errors follow this structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": {}
  }
}
```

| HTTP Status | Code | When |
|-------------|------|------|
| 400 | VALIDATION_ERROR | Invalid request body/params |
| 401 | UNAUTHORIZED | Missing/invalid token |
| 403 | FORBIDDEN | Not allowed to access resource |
| 404 | NOT_FOUND | Resource doesn't exist |
| 409 | CONFLICT | Duplicate (email, slug, double-booking) |
| 500 | INTERNAL_ERROR | Server error |

---

🔒 = Requires `Authorization: Bearer <accessToken>` header
