# Sprint Tracking — CalSync

**Status Legend:** ⬜ Not Started | 🟡 In Progress | ✅ Done | ❌ Blocked

---

## Module 1: Project Bootstrap + Auth

| ID | Task | Status | Notes |
|----|------|--------|-------|
| M1-T1 | Initialize Next.js frontend | ✅ | Next.js 14 + TypeScript + Tailwind |
| M1-T2 | Install frontend dependencies | ✅ | react-query, hook-form, zustand, zod, axios, etc. |
| M1-T3 | Set up frontend folder structure | ✅ | |
| M1-T4 | Initialize Express backend | ✅ | TypeScript + ts-node-dev |
| M1-T5 | Install backend dependencies | ✅ | mongoose, passport, jwt, bcrypt, zod, etc. |
| M1-T6 | Set up backend folder structure | ✅ | |
| M1-T7 | MongoDB connection + env config | ✅ | |
| M1-T8 | Create all Mongoose models | ✅ | 6 models with indexes |
| M1-T9 | JWT utility | ✅ | |
| M1-T10 | Auth middleware | ✅ | |
| M1-T11 | Validation middleware (Zod) | ✅ | |
| M1-T12 | Global error handler | ✅ | AppError class + handler |
| M1-T13 | Auth service (register, login, refresh, logout) | ✅ | + default availability seeding |
| M1-T14 | Auth routes + controller + validators | ✅ | |
| M1-T15 | Bootstrap Express app | ✅ | helmet, cors, cookie-parser |
| M1-T16 | Axios instance with interceptors | ✅ | Silent 401 refresh |
| M1-T17 | Zustand auth store | ✅ | |
| M1-T18 | React Query auth hooks | ✅ | useLogin, useRegister, useMe, useLogout |
| M1-T19 | Login page | ✅ | Google button + email/password form |
| M1-T20 | Register page | ✅ | |
| M1-T21 | Auth layout | ✅ | Centered card with logo |
| M1-T22 | Dashboard layout + auth guard | ✅ | + loading spinner |
| M1-T23 | Sidebar + Header components | ✅ | + MobileNav bottom bar |
| M1-T24 | Shared TypeScript types | ✅ | |
| M1-T25 | UI primitives (Button, Input, Card, Modal) | ✅ | |

**Module 1 Progress:** 25/25 ✅

---

## Module 2: Google OAuth + Event Types

| ID | Task | Status | Notes |
|----|------|--------|-------|
| M2-T1 | Passport.js Google strategy | ✅ | With account linking logic |
| M2-T2 | Google OAuth routes | ✅ | /google + /google/callback |
| M2-T3 | Account linking (Google + local) | ✅ | Same email links accounts |
| M2-T4 | Google OAuth button component | ✅ | Built in M1 login/register pages |
| M2-T5 | OAuth callback token handling | ✅ | Dashboard reads token from URL |
| M2-T6 | EventType service (CRUD + toggle) | ✅ | |
| M2-T7 | EventType routes + controller + validators | ✅ | |
| M2-T8 | Slug auto-generation utility | ✅ | |
| M2-T9 | React Query event type hooks | ✅ | CRUD + toggle + delete |
| M2-T10 | EventTypeCard component | ✅ | Color bar, badges, toggle, copy link |
| M2-T11 | Event Types list page | ✅ | Grid + skeleton + empty state |
| M2-T12 | EventTypeForm component | ✅ | All fields with color picker |
| M2-T13 | Create Event Type page | ✅ | |
| M2-T14 | Edit Event Type page | ✅ | |

**Module 2 Progress:** 14/14 ✅

---

## Module 3: Availability Management

| ID | Task | Status | Notes |
|----|------|--------|-------|
| M3-T1 | Availability service (CRUD + seed) | ✅ | |
| M3-T2 | Availability routes + controller + validators | ✅ | |
| M3-T3 | Seed default availability on registration | ✅ | Done in M1 auth service |
| M3-T4 | React Query availability hooks | ✅ | |
| M3-T5 | WeeklyScheduleEditor component | ✅ | 7-row editor with toggles |
| M3-T6 | DateOverrideEditor component | ✅ | Date picker + day-off toggle |
| M3-T7 | Availability page | ✅ | Both editors integrated |
| M3-T8 | TimePicker UI component | ✅ | Using native time inputs |

**Module 3 Progress:** 8/8 ✅

---

## Module 4: Slot Generation + Public Booking Pages

| ID | Task | Status | Notes |
|----|------|--------|-------|
| M4-T1 | Slot generation algorithm | ✅ | Handles overrides, buffers, groups |
| M4-T2 | GET /availability/slots endpoint | ✅ | |
| M4-T3 | GET /users/:username endpoint | ✅ | |
| M4-T4 | Booking service (create with race protection) | ✅ | + list, cancel, reschedule |
| M4-T5 | POST /bookings endpoint | ✅ | |
| M4-T6 | Public user profile page | ✅ | Event type cards with links |
| M4-T7 | DatePicker component | ✅ | Inline calendar in booking page |
| M4-T8 | TimeSlotGrid component | ✅ | Integrated in booking page |
| M4-T9 | Booking page | ✅ | Calendar + slots side by side |
| M4-T10 | BookingForm component | ✅ | Name, email, notes |
| M4-T11 | Booking confirmation page | ✅ | |
| M4-T12 | BookingConfirmation component | ✅ | Success with check icon |
| M4-T13 | TimezonePicker component | ✅ | Auto-detect displayed |

**Module 4 Progress:** 13/13 ✅

---

## Module 5: Bookings Management + Google Calendar

| ID | Task | Status | Notes |
|----|------|--------|-------|
| M5-T1 | Bookings list, cancel, reschedule service | ✅ | Done in M4 |
| M5-T2 | Bookings routes (list, detail, cancel, reschedule) | ✅ | Done in M4 |
| M5-T3 | React Query bookings hooks | ✅ | |
| M5-T4 | Bookings page with tabs | ✅ | Upcoming/Past/Cancelled |
| M5-T5 | BookingCard component | ✅ | Inline in bookings page |
| M5-T6 | Cancel/Reschedule modals | ✅ | Cancel with reason modal |
| M5-T7 | Google Calendar service (OAuth + tokens) | ✅ | |
| M5-T8 | Google Calendar routes | ✅ | connect/callback/disconnect |
| M5-T9 | Google Calendar getBusyTimes | ✅ | freebusy API |
| M5-T10 | Google Calendar createEvent on booking | ✅ | Auto-creates on booking |
| M5-T11 | Integrate busy times into slot generation | ✅ | Slots controller fetches busy times |
| M5-T12 | Unified calendar service | ✅ | Google + Outlook abstraction |

**Module 5 Progress:** 12/12 ✅

---

## Module 6: Outlook, Apple Calendar, Notifications

| ID | Task | Status | Notes |
|----|------|--------|-------|
| M6-T1 | Outlook Calendar service (OAuth + tokens) | ✅ | MSAL + Graph |
| M6-T2 | Outlook busy times + event creation | ✅ | getSchedule + POST events |
| M6-T3 | Outlook routes | ✅ | In calendar.routes.ts |
| M6-T4 | Apple Calendar ICS export | ✅ | ical-generator |
| M6-T5 | Integrations page | ✅ | Connect/disconnect + ICS copy |
| M6-T6 | Notification service | ✅ | CRUD + unread count |
| M6-T7 | Mail service (Nodemailer + templates) | ✅ | Confirmation + cancellation |
| M6-T8 | Send emails on booking events | ✅ | In booking service |
| M6-T9 | Notification routes | ✅ | list, read, read-all, unread-count |
| M6-T10 | React Query notification hooks | ✅ | With 30s polling |
| M6-T11 | NotificationBell component | ✅ | Unread badge |
| M6-T12 | Notifications page | ✅ | Full list with mark-read |
| M6-T13 | Add NotificationBell to Header | ✅ | |
| M6-T14 | Zustand notification store | ✅ | Using React Query polling instead |

**Module 6 Progress:** 14/14 ✅

---

## Module 7: Dashboard, Landing, Polish, Deploy

| ID | Task | Status | Notes |
|----|------|--------|-------|
| M7-T1 | Dashboard page | ✅ | Built in M1 with stats cards |
| M7-T2 | Landing page | ✅ | Built in M1 with hero + features |
| M7-T3 | Mobile nav (sidebar → bottom nav) | ✅ | Built in M1 |
| M7-T4 | Mobile responsive forms + booking pages | ✅ | Tailwind responsive throughout |
| M7-T5 | Timezone handling audit | ✅ | UTC storage, local display |
| M7-T6 | Error handling (toasts + form validation) | ✅ | react-hot-toast + Zod |
| M7-T7 | Loading states (skeletons/spinners) | ✅ | All list pages have skeletons |
| M7-T8 | Empty states | ✅ | All list pages have empty states |
| M7-T9 | Deploy backend | ⬜ | |
| M7-T10 | Deploy frontend | ⬜ | |
| M7-T11 | Production env vars + CORS + cookies | ⬜ | |
| M7-T12 | End-to-end smoke test | ⬜ | |

**Module 7 Progress:** 8/12

---

## Overall Progress

| Module | Done | Total | % |
|--------|------|-------|---|
| M1: Bootstrap + Auth | 25 | 25 | 100% |
| M2: Google OAuth + Event Types | 14 | 14 | 100% |
| M3: Availability | 8 | 8 | 100% |
| M4: Slot Gen + Booking | 13 | 13 | 100% |
| M5: Bookings + Google Cal | 12 | 12 | 100% |
| M6: Outlook, Apple, Notifs | 14 | 14 | 100% |
| M7: Polish + Deploy | 8 | 12 | 67% |
| **Total** | **94** | **98** | **96%** |
