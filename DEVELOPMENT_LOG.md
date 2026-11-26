# PlaceTrack Development Log

This log tracks completed tasks, verified features, encountered errors, fixes, and any remaining notes during the development of **PlaceTrack**.

---

## Completed & Verified Features
- **Project Architecture:** Separated `client/` (React + Vite + Tailwind CSS) and `server/` (Express + Prisma + PostgreSQL).
- **Database & Seed:** Created PostgreSQL database `placetrack`, applied Prisma migration `20261126083047_init`, and seeded 12 sample applications, interview rounds, and reminders for `demo@placetrack.local`.
- **Authentication & Security:** Verified `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` session restoration, `POST /api/auth/logout`, HTTP-only JWT cookies, CSRF double-submit protection (`403` when missing), and cross-user isolation (`404` when User B attempts to read/update/delete User A's application).
- **Applications, Interviews, Dashboard & Reminders APIs:** Verified full CRUD lifecycle, Kanban status updates (`PATCH /api/applications/:id/status`), search/filter queries, interview round creation/updates, real-time dashboard stats (`totalApplications: 12`), custom reminders, and Nodemailer dev preview (`deliveryStatus: PREVIEWED`).
- **Lint & Build:** Verified `server` ESLint (`npm run lint`) and `client` ESLint + Vite production build (`npm run lint && npm run build`).
- **Documentation:** Created [README.md](README.md) with Mermaid ER diagram and setup instructions, plus [INTERVIEW_GUIDE.md](INTERVIEW_GUIDE.md) with 50 technical interview Q&As and demo scripts.

## Errors & Fixes
1. **`client/package.json` dependency resolution:** Fixed `globals@^26.0.0` (non-existent) to `globals@^15.15.0`.
2. **`client/eslint.config.js` JSX unused-vars warnings:** Added `varsIgnorePattern: '^[A-Z]'` so imported React components used in JSX are recognized cleanly.
3. **`DATABASE_URL` special character:** URL-encoded `@` as `%40` in `server/.env`.

## Remaining Notes
- **Browser Automation Tool:** Chrome DevTools MCP could not attach (`DevToolsActivePort` not found because Chrome remote debugging was not enabled). Backend + PostgreSQL + Vite servers are running and API end-to-end integration tests passed; open `http://localhost:5173` in your browser to visually inspect and test the UI.
- **SMTP:** Running in `EMAIL_DEV_MODE=true` (console preview). Configure SMTP variables in `server/.env` for live email delivery.
