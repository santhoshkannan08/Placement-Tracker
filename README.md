# PlaceTrack — Placement & Job Application Tracker

PlaceTrack is a full-stack web application built for students and job seekers to organize job and internship applications, manage multi-round interviews, monitor deadlines on a calendar, receive automated email reminders, and track placement progress with real-time analytics.

---

## Problem Statement

Students preparing for campus placements and internships often track dozens of applications across spreadsheets, sticky notes, and email threads. This leads to missed application deadlines, forgotten interview links, and poor visibility into where applications stall in the hiring pipeline.

## Project Objectives

- Centralize all job and internship applications in a private, authenticated workspace per user.
- Provide an intuitive drag-and-drop Kanban board alongside a searchable, filterable table view.
- Track multi-round interviews (online assessments, technical rounds, HR rounds) with prep notes and feedback.
- Automate 24-hour deadline and interview reminders using `node-cron` and `nodemailer`.
- Visualize real-time placement progress with charts calculated directly from PostgreSQL records.

---

## Features

- **Authentication & Security:** Registration, login, logout, profile management, `bcrypt` password hashing, JWT stored in HTTP-only cookies, double-submit CSRF protection, Helmet headers, CORS, and rate limiting.
- **Analytics Dashboard:** Real-time KPIs (total, active, upcoming interviews, offers, rejected, success rate, pending deadlines), status distribution donut chart, monthly applications bar chart, progress funnel, and upcoming timeline.
- **Interactive Kanban Board:** Drag-and-drop (`@dnd-kit/core`) across 6 stages (`Wishlist`, `Applied`, `Assessment`, `Interview`, `Offer Received`, `Rejected`) with optimistic UI updates, API error rollback, and an accessible status dropdown.
- **Applications CRUD & Filtering:** Full create, view, edit, and delete with confirmation dialogs; search by company/title; filter by status, job type, priority, work mode, and date range; sort by newest, oldest, or upcoming deadline.
- **Interview Round Management:** Multiple rounds per application with type, date/time, platform, meeting link, interviewer details, status (`Upcoming`, `Completed`, `Passed`, `Failed`, `Cancelled`), prep notes, and feedback.
- **Calendar View:** Monthly calendar color-coded for Interviews, Deadlines, and Custom Reminders with click-through to the associated application.
- **Email Reminders:** Automated `node-cron` background check for deadlines/interviews within 24 hours, custom user reminders, delivery status tracking, duplicate prevention, and a development preview mode.
- **Modern UI/UX:** Linear/Notion-inspired interface with collapsible sidebar, light/dark mode, loading skeletons, toast notifications, and responsive mobile/tablet/desktop support.

---

## Technology Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 18 (Vite), JavaScript, Tailwind CSS, React Router, Axios, Lucide React, dnd-kit, Recharts |
| **Backend** | Node.js, Express.js, Zod, JWT, bcrypt, Nodemailer, node-cron, Helmet, express-rate-limit |
| **Database** | PostgreSQL, Prisma ORM |
| **Tooling** | Git, ESLint, Prettier, dotenv |

---

## System Architecture

```text
┌─────────────────────────────┐        HTTP + Cookies (JWT & CSRF)       ┌─────────────────────────────┐
│   React Frontend (Vite)     │ ───────────────────────────────────────▶ │   Express.js REST API       │
│   http://localhost:5173     │ ◀─────────────────────────────────────── │   http://localhost:5000     │
└─────────────────────────────┘               JSON Responses             └──────────────┬──────────────┘
                                                                                        │
                                                                         Prisma ORM     │
                                                                                        ▼
┌─────────────────────────────┐                                          ┌─────────────────────────────┐
│   node-cron + Nodemailer    │ ◀──────────────────────────────────────▶ │   PostgreSQL Database       │
│   (24h & Custom Reminders)  │                                          │   (placetrack)              │
└─────────────────────────────┘                                          └─────────────────────────────┘
```

---

## Database ER Diagram

```mermaid
erDiagram
    User ||--o{ Application : owns
    User ||--o{ Reminder : receives
    Application ||--o{ InterviewRound : has
    Application ||--o{ Reminder : triggers
    InterviewRound ||--o{ Reminder : schedules

    User {
        string id PK
        string name
        string email UK
        string passwordHash
        boolean emailRemindersEnabled
        datetime createdAt
        datetime updatedAt
    }

    Application {
        string id PK
        string userId FK
        string companyName
        string jobTitle
        string jobType
        string workMode
        string location
        string compensation
        string applicationUrl
        datetime applicationDate
        datetime deadline
        string status
        string priority
        string recruiterName
        string recruiterEmail
        string description
        string notes
        datetime createdAt
        datetime updatedAt
    }

    InterviewRound {
        string id PK
        string applicationId FK
        string roundName
        string interviewType
        datetime scheduledAt
        string meetingLink
        string location
        string interviewerDetails
        string status
        string preparationNotes
        string feedback
        datetime createdAt
        datetime updatedAt
    }

    Reminder {
        string id PK
        string userId FK
        string applicationId FK
        string interviewRoundId FK
        string reminderType
        string title
        datetime scheduledAt
        string deliveryStatus
        datetime sentAt
        datetime createdAt
    }
```

---

## API Endpoint Documentation

### Authentication (`/api/auth`)
- `GET /api/auth/csrf` — Issue CSRF token cookie
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Authenticate user and set HTTP-only JWT cookie
- `POST /api/auth/logout` — Clear authentication cookie
- `GET /api/auth/me` — Restore current authenticated user session
- `PATCH /api/auth/profile` — Update user name, reminder preference, or password

### Applications (`/api/applications`)
- `GET /api/applications` — List user applications (supports `search`, `status`, `jobType`, `priority`, `workMode`, `startDate`, `endDate`, `sort`)
- `GET /api/applications/:id` — Get single application with interviews and reminders
- `POST /api/applications` — Create a new application
- `PATCH /api/applications/:id` — Update application details
- `PATCH /api/applications/:id/status` — Update application Kanban status
- `DELETE /api/applications/:id` — Delete an application

### Interview Rounds (`/api/applications/:id/interviews` & `/api/interviews`)
- `GET /api/interviews` — List all interview rounds for the logged-in user
- `GET /api/applications/:id/interviews` — List rounds for a specific application
- `POST /api/applications/:id/interviews` — Add an interview round
- `PATCH /api/interviews/:id` — Update an interview round
- `DELETE /api/interviews/:id` — Delete an interview round

### Dashboard & Reminders
- `GET /api/dashboard/stats` — Compute real-time KPIs, charts, funnel, and timeline
- `GET /api/reminders` — List user reminders
- `POST /api/reminders` — Create a custom reminder
- `PATCH /api/reminders/:id` — Update a reminder
- `DELETE /api/reminders/:id` — Delete a reminder
- `POST /api/reminders/test-email` — Send/preview a test email to the authenticated user

---

## Local Setup & Installation

### 1. Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL (v14+ running locally)

### 2. Install Dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Environment Variables
Copy `.env.example` to `server/.env` and update `DATABASE_URL`, `JWT_SECRET`, and `COOKIE_SECRET`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/placetrack?schema=public"
DATABASE_URL_UNPOOLED="postgresql://postgres:YOUR_PASSWORD@localhost:5432/placetrack?schema=public"
JWT_SECRET="your-random-secret-key"
JWT_EXPIRES_IN="7d"
COOKIE_SECRET="your-random-cookie-secret"
EMAIL_DEV_MODE=true
```
> **Note:** If your PostgreSQL password contains special characters like `@`, URL-encode them (e.g., `@` becomes `%40`).
> `DATABASE_URL_UNPOOLED` is used by Prisma migrations. For local PostgreSQL, it can match `DATABASE_URL`; on Neon, use the direct connection string while `DATABASE_URL` uses the pooled connection string.

### 4. Database Setup & Seed Data
```bash
cd server
npx prisma migrate dev --name init
node prisma/seed.js
```
The seed script creates 12 sample applications, interview rounds, and reminders for a local-only demo user (`demo@placetrack.local` / `DemoPass123!`) when `NODE_ENV !== 'production'`.

### 5. Run Locally
In two terminals:
```bash
# Terminal 1 — Backend (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd client && npm run dev
```

---

## Configuring Real Email Reminders (SMTP)

By default, development uses `EMAIL_DEV_MODE=true` and logs email previews to the backend console. Production defaults to real email delivery and fails at startup if the SMTP credentials are missing.

For Gmail SMTP, enable 2-Step Verification and create an [app password](https://support.google.com/accounts/answer/185833). Use the app password, not your Google Account password. Store it as `SMTP_PASS` in the hosting provider's secret environment variables; do not commit it or paste it into source files.

Configure these backend variables:
```env
EMAIL_DEV_MODE=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-google-app-password
EMAIL_FROM="PlaceTrack <your-email@gmail.com>"
```

`EMAIL_FROM` should use the same address as `SMTP_USER`. After deployment, click **Send Test Email** on the Reminders page.

---

## Deploy to Render and Vercel

The repository includes a Render Blueprint at [`render.yaml`](render.yaml) and Vercel routing config at [`client/vercel.json`](client/vercel.json). The Vercel rewrite proxies `/api` through the frontend origin, preserving the app's HTTP-only cookie and CSRF flow without cross-site cookies. API rewrite caching is disabled.

1. Connect the repository to Render and create a Blueprint service from `render.yaml`. The API service uses `server/`, applies Prisma migrations before startup, and exposes `/api/health`.
2. In Render, set `DATABASE_URL` to the Neon pooled connection string and `DATABASE_URL_UNPOOLED` to the direct connection string for the same branch. Set `CLIENT_URL` to the exact Vercel production origin (for example, `https://your-project.vercel.app`, without a trailing slash).
3. Add `SMTP_USER`, the Gmail app password as `SMTP_PASS`, and `EMAIL_FROM` to Render's environment variables. Render generates `JWT_SECRET` and `COOKIE_SECRET`; keep both secret values private.
4. Import the repository in Vercel with the project root set to `client/`. Use `npm run build` and `dist` as the output directory. The Vercel rewrite targets `https://placetrack-api.onrender.com`; if Render assigns a different service URL, update that destination in `client/vercel.json` before deploying.
5. After both services are deployed, verify the Render `/api/health` endpoint, sign in through the Vercel site, refresh a protected route, and send a test email.

Render's API hostname is based on the Blueprint service name. If the service name or hostname changes, update the Vercel rewrite destination to match. Preview deployments use different origins; the API CORS allowlist is configured for the single `CLIENT_URL` production origin.

---

## Security Considerations

- Passwords are hashed with `bcrypt` (12 salt rounds) and never returned in API responses.
- JWTs are stored in `httpOnly`, `sameSite=lax` cookies (`secure` in production).
- State-changing API requests are protected with double-submit CSRF tokens (`XSRF-TOKEN` cookie + `X-CSRF-Token` header).
- Every private endpoint verifies both authentication (`req.user.id`) and resource ownership.
- Authentication endpoints are rate-limited (`express-rate-limit`), and all inputs are validated with Zod.

---

## Future Improvements

- Resume version attachment per application.
- Browser push notifications in addition to email reminders.
- CSV/PDF export of application history.
- Chrome extension to save job postings with one click.
