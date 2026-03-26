# Sprint Plan — CalSync

**Sprint:** Single sprint (7 days)
**Start Date:** TBD
**Structure:** 7 modules, one per day. Each module has numbered tasks.

---

## Module 1: Project Bootstrap + Auth (Day 1)

**Goal:** Both projects scaffolded, MongoDB connected, email/password auth working end-to-end.

| Task | Description | Files |
|------|-------------|-------|
| M1-T1 | Initialize Next.js frontend with TypeScript, Tailwind, ESLint | `frontend/` setup |
| M1-T2 | Install frontend dependencies (react-query, react-hook-form, zustand, zod, axios, date-fns, lucide-react, react-hot-toast) | `frontend/package.json` |
| M1-T3 | Set up frontend folder structure (app/, components/, hooks/, lib/, stores/, types/, queries/) | `frontend/src/` |
| M1-T4 | Initialize Express backend with TypeScript, ts-node-dev | `backend/` setup |
| M1-T5 | Install backend dependencies (mongoose, passport, jsonwebtoken, bcryptjs, zod, cors, cookie-parser, helmet, date-fns, nodemailer) | `backend/package.json` |
| M1-T6 | Set up backend folder structure (config/, models/, routes/, controllers/, services/, middleware/, validators/, utils/) | `backend/src/` |
| M1-T7 | Create MongoDB connection config and env validation | `backend/src/config/db.ts`, `env.ts` |
| M1-T8 | Create all 6 Mongoose models with schemas and indexes | `backend/src/models/*.ts` |
| M1-T9 | Create JWT utility (sign access/refresh, verify) | `backend/src/utils/jwt.ts` |
| M1-T10 | Create auth middleware (verify JWT, attach user to req) | `backend/src/middleware/auth.middleware.ts` |
| M1-T11 | Create validation middleware (Zod) | `backend/src/middleware/validate.middleware.ts` |
| M1-T12 | Create global error handler middleware | `backend/src/middleware/error.middleware.ts` |
| M1-T13 | Implement auth service (register, login, refresh, logout) | `backend/src/services/auth.service.ts` |
| M1-T14 | Implement auth routes + controller + validators | `backend/src/routes/auth.routes.ts`, `controllers/auth.controller.ts`, `validators/auth.validator.ts` |
| M1-T15 | Bootstrap Express app (middleware chain, route mounting, error handler) | `backend/src/app.ts` |
| M1-T16 | Create Axios instance with auth interceptors (attach token, silent refresh on 401) | `frontend/src/lib/api.ts` |
| M1-T17 | Create Zustand auth store (accessToken, user, isAuthenticated, actions) | `frontend/src/stores/authStore.ts` |
| M1-T18 | Create React Query auth hooks (useLogin, useRegister, useMe) | `frontend/src/queries/useAuth.ts` |
| M1-T19 | Build Login page with React Hook Form | `frontend/src/app/(auth)/login/page.tsx` |
| M1-T20 | Build Register page with React Hook Form | `frontend/src/app/(auth)/register/page.tsx` |
| M1-T21 | Build auth layout (centered card) | `frontend/src/app/(auth)/layout.tsx` |
| M1-T22 | Build dashboard layout with sidebar + auth guard redirect | `frontend/src/app/(dashboard)/layout.tsx` |
| M1-T23 | Build Sidebar and Header components | `frontend/src/components/layout/` |
| M1-T24 | Create shared TypeScript types | `frontend/src/types/` |
| M1-T25 | Create UI primitives (Button, Input, Card, Modal) | `frontend/src/components/ui/` |

**Verification:** Register a user, login, see dashboard with sidebar. Token refresh works on page reload.

---

## Module 2: Google OAuth + Event Types (Day 2)

**Goal:** Google sign-in works. Full CRUD for event types with UI.

| Task | Description | Files |
|------|-------------|-------|
| M2-T1 | Configure Passport.js Google strategy | `backend/src/config/passport.ts` |
| M2-T2 | Implement Google OAuth routes (redirect + callback) | `backend/src/routes/auth.routes.ts` (add routes) |
| M2-T3 | Handle account linking (same email from Google + local) | `backend/src/services/auth.service.ts` (extend) |
| M2-T4 | Build Google OAuth button component | `frontend/src/components/auth/GoogleButton.tsx` |
| M2-T5 | Handle OAuth callback redirect (read token from URL, store in Zustand) | `frontend/src/app/(dashboard)/dashboard/page.tsx` |
| M2-T6 | Implement EventType service (CRUD + toggle) | `backend/src/services/eventType.service.ts` |
| M2-T7 | Implement EventType routes + controller + validators | `backend/src/routes/eventType.routes.ts`, `controllers/`, `validators/` |
| M2-T8 | Auto-generate slug from title (slugify utility) | `backend/src/utils/slugify.ts` |
| M2-T9 | Create React Query hooks for event types | `frontend/src/queries/useEventTypes.ts` |
| M2-T10 | Build EventTypeCard component (title, duration, type badge, active toggle, edit/delete actions) | `frontend/src/components/event-types/EventTypeCard.tsx` |
| M2-T11 | Build Event Types list page (card grid + "Create" button) | `frontend/src/app/(dashboard)/event-types/page.tsx` |
| M2-T12 | Build EventTypeForm component (React Hook Form + Zod) | `frontend/src/components/event-types/EventTypeForm.tsx` |
| M2-T13 | Build Create Event Type page | `frontend/src/app/(dashboard)/event-types/new/page.tsx` |
| M2-T14 | Build Edit Event Type page | `frontend/src/app/(dashboard)/event-types/[id]/edit/page.tsx` |

**Verification:** Login with Google. Create, edit, toggle, delete event types. Slug auto-generates.

---

## Module 3: Availability Management (Day 3)

**Goal:** Users can set weekly availability and date overrides.

| Task | Description | Files |
|------|-------------|-------|
| M3-T1 | Implement Availability service (CRUD, seed default on registration) | `backend/src/services/availability.service.ts` |
| M3-T2 | Implement Availability routes + controller + validators | `backend/src/routes/availability.routes.ts`, `controllers/`, `validators/` |
| M3-T3 | Seed default availability (Mon-Fri 9-5) on user registration | `backend/src/services/auth.service.ts` (extend register) |
| M3-T4 | Create React Query hooks for availability | `frontend/src/queries/useAvailability.ts` |
| M3-T5 | Build WeeklyScheduleEditor component (7 rows, day toggle, time range inputs, add/remove slots) | `frontend/src/components/availability/WeeklyScheduleEditor.tsx` |
| M3-T6 | Build DateOverrideEditor component (date picker + custom hours or day-off toggle) | `frontend/src/components/availability/DateOverrideEditor.tsx` |
| M3-T7 | Build Availability page integrating both editors with save | `frontend/src/app/(dashboard)/availability/page.tsx` |
| M3-T8 | Build time picker UI component | `frontend/src/components/ui/TimePicker.tsx` |

**Verification:** Edit weekly schedule, add date overrides, save and reload — data persists.

---

## Module 4: Slot Generation + Public Booking Pages (Day 4)

**Goal:** Invitees can view available slots and book appointments.

| Task | Description | Files |
|------|-------------|-------|
| M4-T1 | Implement slot generation algorithm | `backend/src/utils/slots.ts` |
| M4-T2 | Implement GET /availability/slots endpoint (public) | `backend/src/routes/availability.routes.ts` (add route) |
| M4-T3 | Implement public user profile endpoint GET /users/:username | `backend/src/routes/user.routes.ts`, `controllers/user.controller.ts` |
| M4-T4 | Implement booking service (create with race condition protection) | `backend/src/services/booking.service.ts` |
| M4-T5 | Implement POST /bookings endpoint (public) | `backend/src/routes/booking.routes.ts`, `controllers/`, `validators/` |
| M4-T6 | Build public user profile page (list active event types) | `frontend/src/app/[username]/page.tsx` |
| M4-T7 | Build date picker component for booking page | `frontend/src/components/calendar/DatePicker.tsx` |
| M4-T8 | Build TimeSlotGrid component (fetch and display available slots) | `frontend/src/components/calendar/TimeSlotGrid.tsx` |
| M4-T9 | Build booking page (date picker + time slot grid) | `frontend/src/app/[username]/[eventSlug]/page.tsx` |
| M4-T10 | Build BookingForm component (invitee name, email, timezone, notes) | `frontend/src/components/booking/BookingForm.tsx` |
| M4-T11 | Build booking confirmation page | `frontend/src/app/[username]/[eventSlug]/confirm/page.tsx` |
| M4-T12 | Build BookingConfirmation success component | `frontend/src/components/booking/BookingConfirmation.tsx` |
| M4-T13 | Create timezone picker component (auto-detect + manual select) | `frontend/src/components/ui/TimezonePicker.tsx` |

**Verification:** Visit `/:username`, select event type, pick date/time, fill form, confirm booking. Booking appears in host's bookings.

---

## Module 5: Bookings Management + Google Calendar (Day 5)

**Goal:** Hosts can manage bookings. Google Calendar connected and syncing.

| Task | Description | Files |
|------|-------------|-------|
| M5-T1 | Implement bookings list, cancel, reschedule in booking service | `backend/src/services/booking.service.ts` (extend) |
| M5-T2 | Implement bookings routes (GET list, GET detail, PATCH cancel, PATCH reschedule) | `backend/src/routes/booking.routes.ts` (extend) |
| M5-T3 | Create React Query hooks for bookings | `frontend/src/queries/useBookings.ts` |
| M5-T4 | Build Bookings page with tabs (Upcoming / Past / Cancelled) | `frontend/src/app/(dashboard)/bookings/page.tsx` |
| M5-T5 | Build BookingCard/BookingRow component | `frontend/src/components/booking/BookingCard.tsx` |
| M5-T6 | Build cancel/reschedule modals | `frontend/src/components/booking/CancelModal.tsx`, `RescheduleModal.tsx` |
| M5-T7 | Implement Google Calendar service (OAuth connect, token storage, token refresh) | `backend/src/services/google-calendar.service.ts` |
| M5-T8 | Implement Google Calendar routes (connect, callback, disconnect) | `backend/src/routes/calendar.routes.ts` |
| M5-T9 | Implement getBusyTimes via Google Calendar freebusy API | `backend/src/services/google-calendar.service.ts` (extend) |
| M5-T10 | Implement createEvent on Google Calendar on booking confirmation | `backend/src/services/google-calendar.service.ts` (extend) |
| M5-T11 | Integrate calendar busy times into slot generation | `backend/src/utils/slots.ts` (extend) |
| M5-T12 | Implement unified calendar service | `backend/src/services/calendar.service.ts` |

**Verification:** Connect Google Calendar. Book a slot — event appears in Google Calendar. Existing Google Calendar events block those slots.

---

## Module 6: Outlook, Apple Calendar, Notifications (Day 6)

**Goal:** Outlook and Apple Calendar work. Email + in-app notifications functional.

| Task | Description | Files |
|------|-------------|-------|
| M6-T1 | Implement Outlook Calendar service (OAuth, token storage, refresh) | `backend/src/services/outlook-calendar.service.ts` |
| M6-T2 | Implement Outlook busy times + event creation via Microsoft Graph | `backend/src/services/outlook-calendar.service.ts` (extend) |
| M6-T3 | Implement Outlook routes (connect, callback) | `backend/src/routes/calendar.routes.ts` (extend) |
| M6-T4 | Implement Apple Calendar ICS export endpoint | `backend/src/routes/calendar.routes.ts` (extend), install `ical-generator` |
| M6-T5 | Build Integrations page (connect/disconnect buttons, status, Apple ICS URL) | `frontend/src/app/(dashboard)/integrations/page.tsx` |
| M6-T6 | Implement notification service (create on booking events) | `backend/src/services/notification.service.ts` |
| M6-T7 | Implement mail service (Nodemailer config + email templates) | `backend/src/services/mail.service.ts`, `backend/src/config/mail.ts` |
| M6-T8 | Send emails on booking create/cancel/reschedule | `backend/src/services/booking.service.ts` (extend) |
| M6-T9 | Implement notification routes (list, unread count, mark read) | `backend/src/routes/notification.routes.ts`, `controllers/`, `validators/` |
| M6-T10 | Create React Query hooks for notifications | `frontend/src/queries/useNotifications.ts` |
| M6-T11 | Build NotificationBell component (unread badge, dropdown) | `frontend/src/components/notifications/NotificationBell.tsx` |
| M6-T12 | Build Notifications page (full list with mark-read) | `frontend/src/app/(dashboard)/notifications/page.tsx` |
| M6-T13 | Add NotificationBell to Header | `frontend/src/components/layout/Header.tsx` (extend) |
| M6-T14 | Create Zustand notification store (unread count, polling) | `frontend/src/stores/notificationStore.ts` |

**Verification:** Connect Outlook — busy times block slots, events sync. Subscribe to ICS in Apple Calendar. Book a meeting — host gets email + in-app notification.

---

## Module 7: Dashboard, Landing Page, Polish, Deploy (Day 7)

**Goal:** Polished, responsive, deployed application.

| Task | Description | Files |
|------|-------------|-------|
| M7-T1 | Build Dashboard page (upcoming bookings, quick stats, quick links) | `frontend/src/app/(dashboard)/dashboard/page.tsx` |
| M7-T2 | Build Landing page (hero, features, CTA) | `frontend/src/app/page.tsx` |
| M7-T3 | Mobile responsive: Sidebar → bottom nav on mobile | `frontend/src/components/layout/MobileNav.tsx` |
| M7-T4 | Mobile responsive: Forms stack vertically, booking pages mobile-first | All form components |
| M7-T5 | Timezone handling audit: verify UTC storage, correct display conversion | All date display points |
| M7-T6 | Error handling: toast notifications for API errors, form validation messages | `frontend/src/lib/api.ts`, form components |
| M7-T7 | Loading states: skeletons/spinners on data fetch | List pages, booking page |
| M7-T8 | Empty states: meaningful messages when no data | List pages |
| M7-T9 | Deploy backend (Railway/Render) | Backend deployment config |
| M7-T10 | Deploy frontend (Vercel) | `frontend/vercel.json` if needed |
| M7-T11 | Configure production env vars, CORS, cookie settings | Both `.env` files |
| M7-T12 | End-to-end smoke test of full booking flow | Manual test |

**Verification:** Full flow works on deployed URLs. Responsive on mobile. All features functional.

---

## Task Summary

| Module | Tasks | Critical Path |
|--------|-------|---------------|
| M1: Bootstrap + Auth | 25 | Foundation — everything depends on this |
| M2: Google OAuth + Event Types | 14 | Depends on M1 |
| M3: Availability | 8 | Depends on M1 |
| M4: Slot Generation + Booking | 13 | Depends on M2 + M3 |
| M5: Bookings + Google Calendar | 12 | Depends on M4 |
| M6: Outlook, Apple, Notifications | 14 | Depends on M5 |
| M7: Polish + Deploy | 12 | Depends on all |
| **Total** | **98** | |
