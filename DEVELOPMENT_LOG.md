# PlaceTrack Development Log

This log tracks completed tasks, verified features, encountered errors, fixes, and any remaining notes during the development of **PlaceTrack**.

---

## Completed & Verified Features
- **Project Architecture:** Separated `client/` (React + Vite + Tailwind CSS) and `server/` (Express + Prisma + PostgreSQL).
- **Database & Seed:** Created PostgreSQL database `placetrack`, applied Prisma migration `20261126083047_init`, and seeded 12 sample applications, interview rounds, and reminders for `demo@placetrack.local`.
- **Authentication & Security:** Verified `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` session restoration, `POST /api/auth/logout`, HTTP-only JWT cookies, CSRF double-submit protection (`403` when missing), and cross-user isolation (`404` when User B attempts to read/update/delete User A's application).
- **Applications, Interviews, Dashboard & Reminders APIs:** Verified full CRUD lifecycle, Kanban status updates (`PATCH /api/applications/:id/status`), search/filter queries, interview round creation/updates, real-time dashboard stats (`totalApplications: 12`), custom reminders, and Nodemailer dev preview (`deliveryStatus: PREVIEWED`).
- **Lint & Build:** Verified `server` ESLint (`npm run lint`) and `client` ESLint + Vite production build (`npm run lint && npm run build`).
- **Browser UI Validation:** Verified landing, login, and registration pages; theme and password visibility toggles; authenticated dashboard and feature routes; application search; and application create/read/delete using temporary data that was removed afterward. Checked the dashboard at a 375px viewport with no horizontal overflow.
- **Deployment Configuration:** Added a Render Blueprint for the API and a Vercel SPA/API proxy configuration. Production configuration now requires strong JWT/cookie secrets and explicit SMTP credentials when live email is enabled.
- **Documentation:** Created [README.md](README.md) with Mermaid ER diagram and setup instructions, plus [INTERVIEW_GUIDE.md](INTERVIEW_GUIDE.md) with 50 technical interview Q&As and demo scripts.

## Errors & Fixes
1. **`client/package.json` dependency resolution:** Fixed `globals@^26.0.0` (non-existent) to `globals@^15.15.0`.
2. **`client/eslint.config.js` JSX unused-vars warnings:** Added `varsIgnorePattern: '^[A-Z]'` so imported React components used in JSX are recognized cleanly.
3. **`DATABASE_URL` special character:** URL-encoded `@` as `%40` in `server/.env`.

## Remaining Notes
- **Production Deployment:** Render and Vercel accounts must be connected to the repository, and the final Vercel origin / Render API URL must be confirmed in provider settings.
- **Gmail SMTP:** Add the Gmail address and app password to Render's secret environment variables, then verify delivery with the in-app test email. No live credentials are stored in the repository.
