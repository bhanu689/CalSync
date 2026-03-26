# System Architecture

## 1. High-Level Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Next.js Frontend  │────▶│   Express Backend     │────▶│   MongoDB       │
│   (Port 3000)       │◀────│   (Port 5000)         │◀────│   (Port 27017)  │
└─────────────────────┘     └──────────────────────┘     └─────────────────┘
                                     │
                            ┌────────┴────────┐
                            │  External APIs  │
                            ├─────────────────┤
                            │ Google OAuth    │
                            │ Google Calendar │
                            │ Microsoft Graph │
                            │ SMTP (Email)    │
                            └─────────────────┘
```

- **Frontend** (Next.js): Handles UI rendering, client-side routing, and state management
- **Backend** (Express): Handles business logic, authentication, API routes, and external integrations
- **Database** (MongoDB): Stores all persistent data
- Communication: REST API over HTTP (JSON)

## 2. Folder Structure

```
calendar/
├── CLAUDE.md                    # Project context for AI sessions
├── docs/                        # All documentation
│   ├── prd.md
│   ├── architecture.md
│   ├── database-schema.md
│   ├── api-spec.md
│   ├── sprint-plan.md
│   └── sprint-tracking.md
│
├── frontend/                    # Next.js App
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── (auth)/          # Auth route group (login, register)
│   │   │   ├── (dashboard)/     # Protected route group
│   │   │   │   ├── dashboard/
│   │   │   │   ├── event-types/
│   │   │   │   ├── bookings/
│   │   │   │   ├── availability/
│   │   │   │   ├── integrations/
│   │   │   │   ├── notifications/
│   │   │   │   └── layout.tsx   # Sidebar + auth guard
│   │   │   ├── [username]/      # Public booking pages
│   │   │   │   ├── page.tsx
│   │   │   │   └── [eventSlug]/
│   │   │   ├── layout.tsx       # Root layout
│   │   │   └── page.tsx         # Landing page
│   │   ├── components/
│   │   │   ├── ui/              # Button, Input, Modal, Card, etc.
│   │   │   ├── auth/            # LoginForm, RegisterForm, GoogleButton
│   │   │   ├── calendar/        # WeeklyCalendar, DatePicker, TimeSlotGrid
│   │   │   ├── booking/         # BookingForm, BookingConfirmation
│   │   │   ├── event-types/     # EventTypeCard, EventTypeForm
│   │   │   ├── availability/    # WeeklyScheduleEditor, DateOverrideEditor
│   │   │   ├── notifications/   # NotificationBell, NotificationList
│   │   │   └── layout/          # Sidebar, Header, MobileNav
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/
│   │   │   ├── api.ts           # Axios instance + interceptors
│   │   │   ├── auth.ts          # Token helpers
│   │   │   └── utils.ts         # Timezone, date formatting
│   │   ├── stores/              # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   └── notificationStore.ts
│   │   ├── types/               # Shared TypeScript interfaces
│   │   └── queries/             # React Query hooks per domain
│   │       ├── useAuth.ts
│   │       ├── useEventTypes.ts
│   │       ├── useBookings.ts
│   │       ├── useAvailability.ts
│   │       └── useNotifications.ts
│   ├── public/
│   ├── tailwind.config.ts
│   ├── next.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                     # Express App
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts            # MongoDB connection
│   │   │   ├── env.ts           # Environment validation
│   │   │   ├── passport.ts      # Google OAuth strategy
│   │   │   └── mail.ts          # Nodemailer config
│   │   ├── models/              # Mongoose schemas
│   │   │   ├── User.ts
│   │   │   ├── EventType.ts
│   │   │   ├── Booking.ts
│   │   │   ├── Availability.ts
│   │   │   ├── Notification.ts
│   │   │   └── CalendarIntegration.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── eventType.routes.ts
│   │   │   ├── booking.routes.ts
│   │   │   ├── availability.routes.ts
│   │   │   ├── calendar.routes.ts
│   │   │   ├── notification.routes.ts
│   │   │   └── user.routes.ts
│   │   ├── controllers/         # Route handlers (one per route file)
│   │   ├── services/            # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── booking.service.ts
│   │   │   ├── availability.service.ts
│   │   │   ├── calendar.service.ts
│   │   │   ├── google-calendar.service.ts
│   │   │   ├── outlook-calendar.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── mail.service.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── validators/          # Zod schemas per route
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── timezone.ts
│   │   │   └── slots.ts         # Slot generation algorithm
│   │   └── app.ts               # Express bootstrap
│   ├── tsconfig.json
│   └── package.json
│
└── prd.md                       # Original PRD
```

## 3. Auth Architecture

```
┌──────────┐    POST /auth/login     ┌──────────┐    Verify    ┌─────────┐
│  Browser  │───────────────────────▶│  Express  │────────────▶│ MongoDB │
│           │◀───────────────────────│           │◀────────────│         │
└──────────┘  Access Token (body)    └──────────┘   User doc   └─────────┘
              Refresh Token (cookie)
```

- **Access Token**: JWT, 15 min TTL, stored in Zustand (memory). Sent via `Authorization: Bearer` header.
- **Refresh Token**: JWT, 7 day TTL, stored in httpOnly/Secure/SameSite=Strict cookie. Sent automatically by browser.
- **Token Refresh**: On 401 response, Axios interceptor calls `POST /auth/refresh` once. If that fails, redirect to login.
- **Google OAuth**: Passport.js strategy. On callback, issues JWT pair same as email/password flow.

## 4. Data Flow: Booking Creation

```
Invitee visits /:username/:eventSlug
        │
        ▼
Frontend fetches GET /api/availability/slots
  ?username=X&eventTypeSlug=Y&date=2026-04-01&timezone=America/New_York
        │
        ▼
Backend: Load availability → Check overrides → Convert to UTC
  → Fetch calendar busy times (Google + Outlook)
  → Fetch existing bookings → Generate candidate slots
  → Remove conflicts → Return available slots
        │
        ▼
Invitee selects slot, fills form, submits
        │
        ▼
Frontend POSTs to /api/bookings
  { eventTypeId, startTime, invitee: { name, email, timezone }, notes }
        │
        ▼
Backend: Atomic check (no overlap) → Create booking
  → Create calendar event on host's connected calendar
  → Send emails (host + invitee)
  → Create in-app notification for host
  → Return booking confirmation
```

## 5. Calendar Integration Architecture

```
┌─────────────────────────────────────────────────┐
│              calendar.service.ts                 │
│         (Unified Calendar Interface)             │
│                                                  │
│  getBusyTimes(userId, start, end) → TimeBlock[]  │
│  createEvent(userId, booking) → eventId          │
│  deleteEvent(userId, eventId) → void             │
└──────────┬──────────────┬───────────────┬────────┘
           │              │               │
    ┌──────▼──────┐ ┌─────▼─────┐  ┌─────▼──────┐
    │   Google     │ │  Outlook  │  │   Apple    │
    │  Calendar    │ │  (Graph)  │  │  (ICS)     │
    │  Service     │ │  Service  │  │  Export    │
    └─────────────┘ └───────────┘  └────────────┘
```

- Google: `googleapis` npm package, OAuth2 tokens stored encrypted in CalendarIntegrations collection
- Outlook: `@azure/msal-node` + Microsoft Graph API
- Apple: ICS file generation via `ical-generator`, served as subscription URL

## 6. Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Separate frontend/backend folders | Independent deployment and scaling. Express is better suited for Passport.js OAuth flows than Next.js API routes. |
| Access token in memory, refresh in httpOnly cookie | XSS protection — JavaScript cannot access the refresh token |
| Availability in user timezone, bookings in UTC | Availability is conceptual ("I work 9-5"). Bookings are absolute points in time. |
| Polling for notifications (not WebSocket) | Simpler for 7-day timeline. 30s poll on unread count is sufficient. |
| Apple Calendar via ICS | Apple has no REST calendar API. ICS subscription is the industry standard approach. |
| Zod for validation on both frontend and backend | Consistent validation. React Hook Form has built-in Zod resolver. |
| Atomic booking creation | MongoDB `findOneAndUpdate` with conditions prevents double-booking race conditions. |

## 7. Environment Variables

### Backend (.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/calsync
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
GOOGLE_CALENDAR_CALLBACK_URL=http://localhost:5000/api/calendars/google/callback
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_CALLBACK_URL=http://localhost:5000/api/calendars/outlook/callback
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

## 8. Key NPM Packages

### Backend

| Package | Purpose |
|---------|---------|
| express | HTTP server |
| mongoose | MongoDB ODM |
| passport, passport-google-oauth20 | Google OAuth |
| jsonwebtoken | JWT creation/verification |
| bcryptjs | Password hashing |
| zod | Request validation |
| googleapis | Google Calendar API |
| @azure/msal-node | Microsoft OAuth |
| @microsoft/microsoft-graph-client | Outlook Calendar API |
| ical-generator | Apple Calendar ICS export |
| nodemailer | Email sending |
| cors, cookie-parser, helmet | Express middleware |
| date-fns, date-fns-tz | Date/timezone utilities |
| ts-node-dev | Development server |

### Frontend

| Package | Purpose |
|---------|---------|
| next, react, react-dom | Framework |
| typescript | Type safety |
| tailwindcss | Styling |
| @tanstack/react-query | Server state management |
| react-hook-form, @hookform/resolvers | Form management |
| zod | Validation schemas |
| zustand | Client state management |
| axios | HTTP client |
| date-fns, date-fns-tz | Date/timezone utilities |
| react-hot-toast | Toast notifications |
| lucide-react | Icons |
