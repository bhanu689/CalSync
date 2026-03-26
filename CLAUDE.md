# CalSync — Calendly Clone

## Project Overview

A web-based, mobile-responsive scheduling platform (like Calendly). Users set availability, share booking links, and invitees schedule appointments without back-and-forth emails.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, React Query, React Hook Form, Zustand, Zod |
| Backend | Express.js, TypeScript, Mongoose |
| Database | MongoDB (local) |
| Auth | Google OAuth 2.0 + Email/Password (JWT) |
| Calendar | Google Calendar API, Microsoft Graph (Outlook), ICS (Apple) |
| Email | Nodemailer |

## Project Structure

```
calendar/
├── CLAUDE.md              ← You are here
├── docs/                  ← All project documentation
│   ├── prd.md             ← Product requirements
│   ├── architecture.md    ← System architecture & folder structure
│   ├── database-schema.md ← MongoDB collections & schemas
│   ├── api-spec.md        ← All API endpoints
│   ├── sprint-plan.md     ← Sprint modules & task breakdown
│   └── sprint-tracking.md ← Task status tracking (UPDATE THIS)
├── frontend/              ← Next.js app (port 3000)
└── backend/               ← Express.js app (port 5000)
```

## How to Resume Work

1. **Check progress:** Read `docs/sprint-tracking.md` to see what's done and what's next
2. **Find current module:** Look for 🟡 (In Progress) tasks or the first ⬜ (Not Started) module
3. **Understand the task:** Reference `docs/sprint-plan.md` for detailed task descriptions and file paths
4. **Check API spec:** Reference `docs/api-spec.md` for endpoint contracts
5. **Check schema:** Reference `docs/database-schema.md` for data models
6. **After completing tasks:** Update `docs/sprint-tracking.md` — change ⬜ to ✅ and update progress counts

## UI Development

When building any frontend UI component or page, **always use the `example-skills:frontend-design` skill** before writing code. This ensures consistent, high-quality UI that follows design best practices.

**Workflow:**
1. Invoke `/example-skills:frontend-design` with a description of the component/page to build
2. Use the generated design as the foundation
3. Adapt to our stack (Next.js App Router, Tailwind CSS, lucide-react icons, react-hot-toast)

## Key Conventions

### Backend
- **Pattern:** Routes → Controllers → Services → Models
- **Validation:** Zod schemas in `validators/` folder, applied via `validate.middleware.ts`
- **Auth:** JWT access token (15 min) in Authorization header, refresh token (7 days) in httpOnly cookie
- **Errors:** All errors go through `error.middleware.ts`, return `{ error: { code, message, details } }`
- **Dates:** Store as UTC. Availability times stored in user's local timezone.

### Frontend
- **State:** Zustand for client state (auth, notifications), React Query for server state
- **Forms:** React Hook Form + Zod resolver
- **API:** Axios instance in `lib/api.ts` with auth interceptors
- **Styling:** Tailwind CSS only, no CSS modules
- **Icons:** lucide-react
- **Toasts:** react-hot-toast

### Shared
- **Validation:** Zod schemas can be shared or mirrored between frontend/backend
- **Types:** Keep TypeScript interfaces in `types/` folders

## Commands

### Backend
```bash
cd backend
npm install
npm run dev          # ts-node-dev, hot reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # Next.js dev server
```

### Database
```bash
mongod               # Start local MongoDB
```

## Environment Variables

See `docs/architecture.md` section 7 for the full list of required env vars for both frontend and backend.

## Sprint Status

**Current Sprint:** Single sprint, 7 modules, 98 tasks total.
**Tracking:** `docs/sprint-tracking.md`

| Module | Description |
|--------|------------|
| M1 | Project Bootstrap + Auth |
| M2 | Google OAuth + Event Types |
| M3 | Availability Management |
| M4 | Slot Generation + Public Booking |
| M5 | Bookings Management + Google Calendar |
| M6 | Outlook, Apple, Notifications |
| M7 | Dashboard, Landing, Polish, Deploy |

Always complete modules in order (M1 → M7). Within each module, complete tasks in order (T1, T2, ...).
