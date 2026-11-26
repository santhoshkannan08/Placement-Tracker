# PlaceTrack — Beginner-Friendly Interview Guide

This guide helps you understand, demonstrate, and confidently explain **PlaceTrack** in a full-stack developer internship interview.

---

## 1. Core Concepts Explained Simply

- **What problem does this project solve?**
  Students applying to 20–50+ internships and jobs often lose track of application links, interview dates, and deadlines in messy spreadsheets. PlaceTrack puts every application, interview round, calendar event, and email reminder in one organized dashboard.
- **Why did I choose this project?**
  It solves a real problem I personally face as a student, and it demonstrates every core full-stack skill interviewers look for: authentication, database relationships, CRUD APIs, drag-and-drop UI, analytics, and background jobs.
- **What is full-stack development?**
  Building both what the user sees and interacts with in the browser (**frontend**) and the server logic + database that stores and protects data (**backend**).
- **What is the frontend?**
  A React.js single-page application (SPA) built with Vite and styled with Tailwind CSS (`client/`). It renders pages, handles forms, shows charts, and sends HTTP requests to the backend using Axios.
- **What is the backend?**
  A Node.js + Express.js REST API (`server/`) that validates requests, checks authentication, talks to PostgreSQL via Prisma, and runs scheduled email reminders.
- **How does React communicate with Express?**
  React calls Express endpoints (like `GET /api/applications` or `PATCH /api/applications/:id/status`) using Axios (`client/src/services/api.js`) with `withCredentials: true` so cookies are automatically sent.
- **How does an API work?**
  An API (Application Programming Interface) is a set of URLs (endpoints) that accept structured requests (JSON) and return structured responses (JSON) with HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`).
- **How does JWT authentication work?**
  When you log in, the backend verifies your password, signs a JSON Web Token (JWT) containing your `userId`, and stores it in an **HTTP-only cookie** (`placetrack_token`). On every future request, the browser sends that cookie automatically, and our `authenticate` middleware (`server/src/middleware/auth.js`) verifies the token.
- **Why is password hashing necessary?**
  If someone ever gained access to the database, plain-text passwords would expose every user's account. Hashing with `bcrypt` (`SALT_ROUNDS = 12`) turns passwords into irreversible hashes.
- **What is CRUD?**
  **Create, Read, Update, Delete** — the four basic operations on database records (e.g., creating an application, viewing it, editing it, deleting it).
- **How does PostgreSQL store the data?**
  PostgreSQL is a relational database that stores structured data in tables (`User`, `Application`, `InterviewRound`, `Reminder`) with strict types and relationships.
- **What are primary and foreign keys?**
  A **Primary Key** (`id`) uniquely identifies each row in a table. A **Foreign Key** (like `userId` on `Application` or `applicationId` on `InterviewRound`) links a row to its parent record in another table.
- **Why did I use Prisma?**
  Prisma lets us define our database schema in one clean file (`server/prisma/schema.prisma`), generates a JavaScript client, runs safe parameterized queries (preventing SQL injection), and manages database migrations.
- **How does the Kanban board work?**
  Using `@dnd-kit/core` (`client/src/pages/KanbanPage.jsx`), each status column is a droppable zone and each card is draggable. When dropped (or changed via the accessible dropdown), React updates the UI optimistically and calls `PATCH /api/applications/:id/status`. If the API fails, it restores the previous status.
- **How are reminders scheduled?**
  `node-cron` (`server/src/services/reminderCron.js`) runs every 5 minutes on the backend, checks for deadlines/interviews within 24 hours and due custom reminders, and avoids duplicates by checking existing `Reminder` rows.
- **How do emails get delivered?**
  `Nodemailer` (`server/src/services/emailService.js`) sends emails via SMTP when configured, or logs a full preview to the server console when `EMAIL_DEV_MODE=true`.
- **How are private user records protected?**
  Every private route runs `authenticate` first, and every controller checks `record.userId === req.user.id` (or `application.userId === req.user.id` for interviews) before returning, updating, or deleting data.
- **How are errors handled?**
  Controllers use `asyncHandler` so any thrown error goes to `errorHandler.js`, which formats Zod validation errors (`400`), Prisma unique/not-found errors (`409`/`404`), and custom `AppError`s into clean JSON without leaking stack traces in production.
- **How is the application deployed?**
  Frontend (`client/dist`) can be deployed to Vercel/Netlify; Backend (`server/`) to Render/Railway; PostgreSQL to Neon/Supabase/Railway.
- **What challenges occurred during actual development?**
  1. Ensuring special characters (`@`) in the PostgreSQL password were URL-encoded (`%40`) in `DATABASE_URL`.
  2. Configuring ESLint 9 flat config so JSX component imports weren't flagged as unused variables.
  3. Designing CSRF protection (`XSRF-TOKEN` cookie + `X-CSRF-Token` header) alongside HTTP-only JWT cookies so state-changing requests work smoothly in Axios.
- **What improvements could be added in the future?**
  Resume version tracking per application, CSV export, and browser push notifications.

---

## 2. Pitch & Demo Scripts

### 30-Second Introduction
> "I built **PlaceTrack**, a full-stack placement and job application tracker using React, Tailwind CSS, Node.js, Express, PostgreSQL, and Prisma. It replaces messy spreadsheets by letting students track applications on a drag-and-drop Kanban board, log multi-round interviews, view deadlines on a calendar, and receive automated 24-hour email reminders—all secured with HTTP-only JWT cookies and per-user data isolation."

### 2-Minute Project Explanation
> "As a student preparing for internships, I noticed it's easy to lose track of deadlines and interview rounds across spreadsheets. So I built PlaceTrack with a clear separation between the React frontend (`client/`) and Express REST API (`server/`).
> On the backend, I modeled four normalized tables in PostgreSQL using Prisma: `User`, `Application`, `InterviewRound`, and `Reminder`, with cascading deletes and indexes. Authentication uses `bcrypt` for password hashing, JWTs stored in HTTP-only cookies, and double-submit CSRF protection.
> On the frontend, users get an analytics dashboard powered by Recharts that computes real-time metrics from the database, a 6-stage Kanban board built with `@dnd-kit/core` with optimistic updates and error rollback, advanced search and filtering, an interview schedule, a color-coded calendar, and a reminder system powered by `node-cron` and `Nodemailer`."

### 5-Minute Demo Script
1. **Landing & Auth (45s):** Show the Landing page, explain dark/light mode, log in with the demo account (or register a fresh user), and refresh the page to prove the HTTP-only cookie restores the session.
2. **Analytics Dashboard (45s):** Point out the 7 real-time KPIs, Donut chart, Monthly Bar chart, Conversion Funnel, and Upcoming Timeline—emphasizing zero hardcoded numbers.
3. **Kanban Board (60s):** Drag a card from `Applied` to `Interview` (or use the status dropdown), refresh the page to show PostgreSQL persistence, and explain optimistic rollback.
4. **Applications & Interview Rounds (75s):** Filter by company/status on All Applications, open an application's Details page, and add/edit an Interview Round.
5. **Calendar, Reminders & Security (45s):** Show the color-coded Calendar, trigger **Send Test Email** on Reminders, and briefly mention per-user ownership checks and CSRF protection.

---

## 3. Architecture, Database & Lifecycle

- **System Architecture:** React SPA (`:5173`) communicates via Axios (`/api/*` proxied to `:5000`) with Express REST API, which uses Prisma ORM to query PostgreSQL and `node-cron` + `Nodemailer` for background reminders.
- **Database Relationships:**
  - `User` 1 → Many `Application` (`onDelete: Cascade`)
  - `Application` 1 → Many `InterviewRound` (`onDelete: Cascade`)
  - `User` / `Application` / `InterviewRound` → Many `Reminder` (`onDelete: Cascade`)
- **Request-Response Lifecycle (Example: Updating Kanban Status):**
  1. User drops card in `Interview` column → React calls `api.patch('/applications/:id/status', { status: 'Interview' })`.
  2. Axios interceptor reads `XSRF-TOKEN` cookie and attaches `X-CSRF-Token` header.
  3. Express runs `helmet`, `cors`, `cookieParser`, `verifyCsrf`, then `authenticate` (verifies `placetrack_token` JWT cookie and loads `req.user`).
  4. `updateApplicationStatus` controller checks `existing.userId === req.user.id`, validates `status` with Zod, updates PostgreSQL via Prisma, and returns `200 OK` JSON.

---

## 4. Important Files to Understand Before the Interview

1. `server/prisma/schema.prisma` — Database models, relations, indexes, and cascade rules.
2. `server/src/app.js` — Express middleware pipeline (Helmet, CORS, CSRF, routes, error handler).
3. `server/src/middleware/auth.js` & `server/src/middleware/csrf.js` — Security layer.
4. `server/src/controllers/applicationController.js` — CRUD, filtering, ownership checks.
5. `server/src/controllers/dashboardController.js` — Real-time SQL/JS analytics aggregation.
6. `server/src/services/reminderCron.js` — Scheduled 24h deadline/interview reminder logic.
7. `client/src/services/api.js` — Axios instance with credentials and CSRF header injection.
8. `client/src/context/AuthContext.jsx` — Session restoration and auth state.
9. `client/src/pages/KanbanPage.jsx` — `@dnd-kit/core` drag-and-drop + optimistic UI rollback.

---

## 5. 50 Likely Technical Interview Questions

### Architecture & Full-Stack Basics (1–10)
1. **Why separate `client/` and `server/` instead of one monolithic folder?**
   - *Beginner:* Keeps frontend UI code and backend API code clean and independent.
   - *Pro:* Enables independent builds, clear separation of concerns, and flexible deployment (e.g., Vercel for static assets + Render for Node API). *Ref: `client/`, `server/`.*
2. **How does the Vite proxy in `client/vite.config.js` help in development?**
   - *Beginner:* It forwards `/api` requests from port 5173 to port 5000 so cookies work smoothly.
   - *Pro:* Avoids cross-origin cookie issues during local development by making `/api` appear same-origin to the browser. *Ref: `client/vite.config.js`.*
3. **What is a REST API and how did you structure yours?**
   - *Beginner:* URLs representing resources (`applications`, `interviews`, `reminders`) using HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`).
   - *Pro:* Resource-oriented routes with proper status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`) and centralized error handling. *Ref: `server/src/routes/`.*
4. **Why did you use `PATCH` instead of `PUT` for updating applications?**
   - *Beginner:* `PATCH` updates only the fields we send, like changing just the `status`.
   - *Pro:* `PUT` implies full resource replacement, whereas `PATCH` supports partial updates cleanly via `applicationUpdateSchema = applicationCreateSchema.partial()`. *Ref: `server/src/validators/schemas.js`.*
5. **What does `asyncHandler` do in Express?**
   - *Beginner:* Catches errors in async route functions so the server doesn't crash.
   - *Pro:* Wraps async controllers in `Promise.resolve(...).catch(next)` to forward rejected promises to Express's centralized error middleware. *Ref: `server/src/utils/asyncHandler.js`.*
6. **How does centralized error handling work?**
   - *Beginner:* One function formats all errors into clean JSON messages.
   - *Pro:* `errorHandler.js` maps Zod `ZodError` to `400`, Prisma `P2002` to `409`, `P2025` to `404`, and hides internal details in production. *Ref: `server/src/middleware/errorHandler.js`.*
7. **Why use Zod for validation on the backend if HTML forms already validate?**
   - *Beginner:* Users or attackers can bypass browser forms using tools like curl or Postman.
   - *Pro:* Server-side validation is a security boundary; Zod enforces types, lengths, URLs, and enums before data reaches Prisma. *Ref: `server/src/validators/schemas.js`.*
8. **What are environment variables and why use `.env`?**
   - *Beginner:* A way to keep passwords and secret keys out of source code.
   - *Pro:* Separates configuration from code (12-factor app) and keeps secrets out of Git via `.gitignore`. *Ref: `.env.example`, `server/src/config/env.js`.*
9. **Why did you choose React Context instead of Redux?**
   - *Beginner:* Our global state is small (just auth user, theme, and toasts), so Context is simpler.
   - *Pro:* Avoids Redux boilerplate when server state is fetched per page and global client state is limited to Auth, Theme, and Toast. *Ref: `client/src/context/`.*
10. **What happens if a user visits an unknown URL?**
    - *Beginner:* They see a clean 404 page with a button back to the dashboard.
    - *Pro:* React Router's catch-all `<Route path="*" element={<NotFoundPage />} />` handles unknown client routes, and `/api/*` returns JSON `404`. *Ref: `client/src/App.jsx`, `server/src/app.js`.*

### Authentication & Security (11–22)
11. **Why store JWT in an HTTP-only cookie instead of `localStorage`?**
    - *Beginner:* JavaScript cannot read HTTP-only cookies, so XSS attacks can't steal the token.
    - *Pro:* Mitigates token exfiltration via XSS; paired with `sameSite: 'lax'` and CSRF tokens for defense-in-depth. *Ref: `server/src/controllers/authController.js`.*
12. **If HTTP-only cookies are sent automatically, how do you prevent CSRF attacks?**
    - *Beginner:* We use a second cookie (`XSRF-TOKEN`) that our frontend reads and sends in a header (`X-CSRF-Token`).
    - *Pro:* Double-submit cookie pattern: an attacker's cross-site form cannot read our cookie to forge the matching `X-CSRF-Token` header. *Ref: `server/src/middleware/csrf.js`, `client/src/services/api.js`.*
13. **How does `bcrypt` protect passwords?**
    - *Beginner:* It scrambles passwords with a random salt so even identical passwords look different.
    - *Pro:* Adaptive key-derivation function with 12 salt rounds (`SALT_ROUNDS = 12`), making brute-force attacks computationally expensive. *Ref: `server/src/controllers/authController.js`.*
14. **How do you ensure `passwordHash` is never leaked to the frontend?**
    - *Beginner:* We use a `sanitizeUser` helper and Prisma `select` to exclude it.
    - *Pro:* Both `authenticate` middleware (`select`) and `sanitizeUser` explicitly whitelist safe user fields. *Ref: `server/src/middleware/auth.js`.*
15. **How does session persistence work when the user refreshes the page?**
    - *Beginner:* On app load, React calls `/api/auth/me` which reads the cookie and logs the user back in.
    - *Pro:* `AuthContext` runs `restoreSession()` in `useEffect`; `ProtectedRoute` shows a loading spinner until `/api/auth/me` resolves. *Ref: `client/src/context/AuthContext.jsx`.*
16. **How do you prevent User B from accessing or deleting User A's application?**
    - *Beginner:* Every API checks if the application's `userId` matches the logged-in user's ID.
    - *Pro:* Object-level authorization (IDOR protection) in every controller; returns `404` when `application.userId !== req.user.id` so existence isn't leaked. *Ref: `server/src/controllers/applicationController.js`.*
17. **What does Helmet do?**
    - *Beginner:* Adds security headers to HTTP responses to protect against common browser attacks.
    - *Pro:* Sets headers like `X-Content-Type-Options`, `X-Frame-Options`, and `Strict-Transport-Security` automatically. *Ref: `server/src/app.js`.*
18. **Why add rate limiting on `/api/auth/login` and `/api/auth/register`?**
    - *Beginner:* Stops bots from guessing passwords thousands of times per minute.
    - *Pro:* `express-rate-limit` caps auth endpoints at 30 requests per 15 minutes per IP to mitigate brute-force and credential stuffing. *Ref: `server/src/middleware/rateLimiter.js`.*
19. **How does CORS work in your app?**
    - *Beginner:* It tells the browser which frontend URL is allowed to talk to our backend.
    - *Pro:* Configured with `origin: env.clientUrl` and `credentials: true` so browsers allow cookie-authenticated cross-origin requests only from our frontend. *Ref: `server/src/app.js`.*
20. **How do you prevent SQL injection?**
    - *Beginner:* Prisma automatically parameterizes all queries instead of concatenating strings.
    - *Pro:* Prisma's query builder uses prepared statements under the hood, neutralizing SQL injection vectors.
21. **How is the test email endpoint protected from abuse?**
    - *Beginner:* It only sends to the logged-in user's own email address, never an arbitrary address from the request body.
    - *Pro:* `sendTestEmail` ignores any body recipient and uses `req.user.email` exclusively, preventing open-relay spam abuse. *Ref: `server/src/controllers/reminderController.js`.*
22. **Why is the demo account only seeded in non-production?**
    - *Beginner:* Having a known demo password in production would be a security risk.
    - *Pro:* `seed.js` exits early if `NODE_ENV === 'production'`, and the "Fill demo" button in `LoginPage.jsx` is gated behind `import.meta.env.DEV`. *Ref: `server/prisma/seed.js`, `client/src/pages/LoginPage.jsx`.*

### Database & Prisma (23–32)
23. **Why PostgreSQL instead of MongoDB or a JSON file?**
    - *Beginner:* Our data has clear relationships (Users → Applications → Interviews → Reminders), which relational databases handle best.
    - *Pro:* ACID transactions, foreign key constraints, cascading deletes, and indexed relational queries fit structured placement tracking.
24. **What does `onDelete: Cascade` do in `schema.prisma`?**
    - *Beginner:* Deleting an application automatically deletes its interview rounds and reminders.
    - *Pro:* Maintains referential integrity at the database level without orphan records or manual multi-table cleanup code. *Ref: `server/prisma/schema.prisma`.*
25. **Why did you add `@@index([userId, status])` on `Application`?**
    - *Beginner:* Makes filtering a user's applications by status much faster.
    - *Pro:* Composite B-tree index speeds up common `WHERE userId = ? AND status = ?` queries as the table grows. *Ref: `server/prisma/schema.prisma`.*
26. **What is the difference between `prisma generate` and `prisma migrate dev`?**
    - *Beginner:* `migrate` updates the database tables; `generate` updates the JavaScript Prisma client code.
    - *Pro:* `migrate dev` diffs `schema.prisma`, generates SQL migrations, and applies them; `generate` builds the client from the schema.
27. **Why is `interviewRoundId` optional on `Reminder`?**
    - *Beginner:* Because deadline reminders and custom reminders belong to an application, not always to a specific interview.
    - *Pro:* Supports three reminder types (`DEADLINE_24H`, `INTERVIEW_24H`, `CUSTOM`) in one normalized table. *Ref: `server/prisma/schema.prisma`.*
28. **How do you make `seed.js` idempotent?**
    - *Beginner:* Running it twice won't crash or create duplicate demo data.
    - *Pro:* Uses `prisma.user.upsert` and deletes existing demo user applications before re-seeding. *Ref: `server/prisma/seed.js`.*
29. **How does search work in `GET /api/applications`?**
    - *Beginner:* It searches both `companyName` and `jobTitle` ignoring uppercase/lowercase.
    - *Pro:* Uses Prisma `OR` with `contains` and `mode: 'insensitive'` combined with optional status/priority/date filters. *Ref: `server/src/controllers/applicationController.js`.*
30. **How are dashboard statistics calculated?**
    - *Beginner:* From real database rows—nothing is hardcoded.
    - *Pro:* `getDashboardStats` fetches user applications and interviews via `Promise.all`, then computes counts, success rate, monthly buckets, funnel stages, and upcoming timeline. *Ref: `server/src/controllers/dashboardController.js`.*
31. **How do you calculate the Application Progress Funnel?**
    - *Beginner:* Counts how many applications reached Applied, Assessment, Interview, and Offer Received.
    - *Pro:* Cumulative stage progression so an application in `Offer Received` is counted as having passed Applied, Assessment, and Interview. *Ref: `server/src/controllers/dashboardController.js`.*
32. **What happens if a user has 0 applications?**
    - *Beginner:* The dashboard shows a friendly empty state with a button to add their first application.
    - *Pro:* Prevents division-by-zero in `successRate` (`submittedCount > 0 ? ... : 0`) and renders `EmptyState.jsx`. *Ref: `client/src/pages/DashboardPage.jsx`.*

### Frontend, Kanban, Calendar & Reminders (33–50)
33. **How did you implement drag-and-drop on the Kanban board?**
    - *Beginner:* Using `@dnd-kit/core` with droppable columns and draggable cards.
    - *Pro:* Uses `PointerSensor` (6px activation distance so clicks on buttons still work) and `KeyboardSensor` for accessibility, plus `DragOverlay` for smooth dragging. *Ref: `client/src/pages/KanbanPage.jsx`.*
34. **What is optimistic UI update and how do you handle failures?**
    - *Beginner:* We move the card immediately so it feels fast, and if the server fails, we move it back and show an error toast.
    - *Pro:* Snapshots `previousApps`, updates React state immediately, awaits `PATCH /api/applications/:id/status`, and rolls back in `catch`. *Ref: `client/src/pages/KanbanPage.jsx`.*
35. **Why include a status dropdown on Kanban cards if drag-and-drop already exists?**
    - *Beginner:* For mobile users and keyboard/screen-reader accessibility.
    - *Pro:* Ensures WCAG accessibility and effortless status changes on touch devices where horizontal drag-and-drop can be awkward.
36. **How do you debounce search input on the Applications page?**
    - *Beginner:* Wait 200ms after the user stops typing before calling the API.
    - *Pro:* `useEffect` with `setTimeout` and cleanup `clearTimeout` avoids firing an API request on every keystroke. *Ref: `client/src/pages/ApplicationsPage.jsx`.*
37. **How does dark mode work?**
    - *Beginner:* Clicking the sun/moon button adds or removes the `dark` class on `<html>` and saves the choice in `localStorage`.
    - *Pro:* `ThemeContext` syncs `document.documentElement.classList` with Tailwind's `darkMode: 'class'` strategy. *Ref: `client/src/context/ThemeContext.jsx`.*
38. **How do you handle date/time consistency between frontend and backend?**
    - *Beginner:* We send ISO UTC strings to the backend and format them to the user's local timezone in React.
    - *Pro:* PostgreSQL stores UTC `DateTime`; `<input type="datetime-local">` converts to `.toISOString()` on submit and formats via `toLocaleString` on display. *Ref: `client/src/utils/constants.js`.*
39. **How does the Calendar page distinguish different event types?**
    - *Beginner:* Interviews are indigo, deadlines are amber, and custom reminders are emerald green.
    - *Pro:* Merges applications, interviews, and custom reminders into a date-keyed list and renders color-coded `<Link>` badges to `/applications/:id`. *Ref: `client/src/pages/CalendarPage.jsx`.*
40. **How does `node-cron` prevent sending duplicate 24-hour reminder emails?**
    - *Beginner:* Before creating a 24-hour reminder, it checks if one already exists for that application or interview.
    - *Pro:* Queries `prisma.reminder.findFirst` by `(applicationId, reminderType)` or `(interviewRoundId, reminderType)` before inserting `PENDING` rows. *Ref: `server/src/services/reminderCron.js`.*
41. **How does email previewing work when SMTP credentials aren't set?**
    - *Beginner:* In dev mode, Nodemailer uses `jsonTransport` and prints the email to the server terminal.
    - *Pro:* Allows full end-to-end testing of reminder scheduling and `deliveryStatus` (`PREVIEWED` vs `SENT`) without external SMTP credentials. *Ref: `server/src/services/emailService.js`.*
42. **Why use `Confirmation Dialogs` before deleting?**
    - *Beginner:* Prevents accidental deletion of an application and all its interview rounds.
    - *Pro:* `ConfirmDialog.jsx` provides an accessible `role="dialog"` modal before executing irreversible `DELETE` requests. *Ref: `client/src/components/ConfirmDialog.jsx`.*
43. **How do toast notifications work?**
    - *Beginner:* Small popup messages in the bottom-right corner that disappear after 4 seconds.
    - *Pro:* `ToastContext` manages a queue of `{ id, message, type }` items with `aria-live="polite"` and auto-dismiss timers. *Ref: `client/src/context/ToastContext.jsx`.*
44. **What are loading skeletons and why use them?**
    - *Beginner:* Gray pulsing placeholders shown while data is loading so the layout doesn't jump.
    - *Pro:* Improves perceived performance and prevents Cumulative Layout Shift (CLS) compared to blank screens. *Ref: `client/src/components/Skeleton.jsx`.*
45. **How did you make the sidebar work on both desktop and mobile?**
    - *Beginner:* On desktop it can collapse to icons; on mobile it slides out as a drawer.
    - *Pro:* Uses Tailwind responsive breakpoints (`hidden md:flex` vs `md:hidden` overlay drawer) in `AppLayout.jsx`. *Ref: `client/src/layouts/AppLayout.jsx`.*
46. **How did you build the charts on the dashboard?**
    - *Beginner:* Using Recharts (`PieChart` for the donut chart and `BarChart` for monthly applications) inside `ResponsiveContainer`.
    - *Pro:* `ResponsiveContainer` automatically resizes SVGs to fit mobile, tablet, and desktop cards. *Ref: `client/src/pages/DashboardPage.jsx`.*
47. **What happens when a user's JWT expires?**
    - *Beginner:* The backend returns `401`, clears the cookie, and the frontend redirects them to `/login`.
    - *Pro:* `authenticate` catches `TokenExpiredError`, clears `placetrack_token`, and returns `401`. *Ref: `server/src/middleware/auth.js`.*
48. **Why use `lucide-react` for icons?**
    - *Beginner:* Clean, consistent SVG icons that are lightweight and easy to size with Tailwind classes.
    - *Pro:* Tree-shakable ES module icons so only used icons are bundled into `client/dist`.
49. **How did you test that your application actually works?**
    - *Beginner:* Ran ESLint, Vite production build, Prisma migrations, and automated end-to-end API tests covering auth, CRUD, ownership checks, and reminders.
    - *Pro:* Verified two-user isolation (`404` on cross-user access), CSRF rejection (`403` without token), full CRUD lifecycle, and dashboard aggregation against real PostgreSQL.
50. **How did you use AI-assisted development honestly in this project?**
    - *Beginner/Honest:* "I used AI assistance to accelerate scaffolding and boilerplate, while I reviewed the architecture, configured PostgreSQL and environment variables, tested the APIs and UI flows, and made sure I understand how every file—from `schema.prisma` to `KanbanPage.jsx`—works."
