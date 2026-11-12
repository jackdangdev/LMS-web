# EduNova LMS — Part B · First Release

A Learning Management System built with a **React 18 + Tailwind CSS** frontend on top of a **Node.js + Express + MongoDB (Mongoose)** backend that follows the **MVC** pattern, with JWT authentication, role-based authorisation and 59 passing end-to-end API tests.

## Quick start (frontend + backend)

**One command from the repository root (uses `concurrently`):**

```bash
npm install      # once — installs the root workspace deps (concurrently)
npm run dev      # API on :5000 + web client on :5173, colour-prefixed [api]/[web] logs
```

`Ctrl+C` stops both. Windows users can also double-click `start-all.cmd` (macOS/Linux: `./start-all.sh`), which installs dependencies if needed and then runs the same `npm run dev`.

Other root-level scripts:

| Command | What it does |
| --- | --- |
| `npm run dev` | Run API (nodemon) + web client (Vite) together via `concurrently` |
| `npm start` | Same, but the API runs plain `node server.js` (no reload) |
| `npm run install-all` | `npm install` inside both `lms-backend` and `lms-frontend` |
| `npm run seed` | Reset and reseed the development database |
| `npm test` | Backend test suite (Mocha + Chai + Supertest) |
| `npm run build` | Production build of the frontend to `lms-frontend/dist` |

Alternative: `node dev.js` performs extra pre-flight checks (Node version, MongoDB reachability, `.env` creation, port reuse) before launching the same two services. Flags: `--install` (force reinstall), `--no-web` (API only).

Manual equivalent:

```bash
# 1) backend
cd lms-backend
npm install
copy .env.example .env     # Windows  (Linux/macOS: cp .env.example .env)
npm run seed               # creates edunova_lms + demo data
npm start                  # API on http://localhost:5000/api

# 2) frontend (new terminal)
cd lms-frontend
npm install
npm run dev                # app on http://localhost:5173 (proxies /api -> :5000)
```

Useful commands (run inside `lms-backend` unless noted):

| Command | What it does |
| --- | --- |
| `npm start` / `npm run dev` | Run the API (dev = nodemon reload) |
| `npm test` | 59 end-to-end API tests (Mocha + Chai + Supertest) against `edunova_lms_test` |
| `npm run demo` | Replays a 26-call user journey against the running server and records every request/response to `../docs/assets/api-demo.json` |
| `npm run seed` | Resets and reseeds the development database |
| `npm run dev` (in `lms-frontend`) | Vite dev server with API proxy |
| `npm run build` (in `lms-frontend`) | Production build to `dist/` |
| `node scripts/shots.cjs` (in `lms-frontend`) | Drives the UI with headless Chrome and screenshots every screen |

Demo accounts (after seeding, password `Password123`): `admin@edunova.dev`, `lena@edunova.dev` / `kwame@edunova.dev` (instructors), `mia@student.dev` / `noah@student.dev` (students).

## What is implemented

### Frontend (`lms-frontend`, React 18 + Tailwind CSS + React Router)

- **Auth screens** — split-screen login (with one-click demo accounts) and registration with role picker + client-side validation; JWT stored in `localStorage`, session restored via `GET /api/auth/me`.
- **Route guards** — `RequireRole` protects `/my-learning` (student), `/teach` + `/teach/courses/:id` (instructor/admin), `/admin/users` (admin); 403 page for role violations.
- **Course catalogue** — search (debounced), category chips, level/sort selects, pagination, skeleton loaders — all state synced to the URL.
- **Course detail** — curriculum with expandable lessons, one-click enrol, lesson completion checkboxes that recalculate progress through `PUT /api/enrollments/:id`, sticky enrolment card.
- **My learning** — stats cards, progress bars, grade display, drop-course dialog.
- **Instructor console** — course table with publish toggle, create-course modal, stats.
- **Course editor** — tabbed settings / lessons / roster & grading (inline grade entry per student).
- **Admin users** — search + role filter + pagination, create/edit (any role, reset password), delete with self-deletion guard.
- Toast notifications, consistent design system (`components/ui.jsx`), fully responsive.

### Backend (`lms-backend`)

- **Auth** — register / login / me / update profile / change password (bcrypt + JWT, rate-limited).
- **Users (admin CRUD)** — paginated list, create with any role, update, deactivate, delete with cascade protection.
- **Courses** — the core LMS object: full CRUD, search/filter/sort/pagination, draft visibility rules, cascade delete.
- **Lessons** — nested resource under `/api/courses/:courseId/lessons`, auto numbering, unique order per course.
- **Enrolments** — enrol (capacity + duplicate guards), progress tracking with auto-completion, instructor grading with field-level permissions, roster summaries.
- **Authorisation** — `protect` (JWT) + `authorize('role')` middleware + object-ownership checks in controllers.
- **Consistent errors** — central error middleware: `{ success, message, errors? }` with 400/401/403/404/409 mapping.

## Deliverables

- `docs/EduNova-External-Design-Document-PartB.docx` — External Design Document v0.4 (team, logo, TOC, architecture, data model, API tables, access matrix, 8 wireframes, front-end chapter with 10 UI screenshots, course imagery & avatars, video walkthrough chapter, testing evidence). Rebuild with `python docs/build/make-docx.py`.
- `docs/assets/video/EduNova-Introduction.mp4` — 3:42 narrated video walkthrough of the app and its tech stack (rebuild: see `video/` scripts).
- `docs/assets/wireframes/` — wireframe PNGs (regenerate: `node docs/build/make-images.js`).
- `docs/assets/screens/` — API test / demo / database evidence screenshots.
- `docs/assets/app/` — screenshots of the live React UI (all roles and screens).
- `docs/build/` — everything is generated by scripts, so the document is fully reproducible.

## API surface (summary)

```
POST   /api/auth/register | /api/auth/login      GET/PUT /api/auth/me   PUT /api/auth/password
GET    /api/users        POST /api/users         GET/PUT/DELETE /api/users/:id        (admin)
GET    /api/courses      GET  /api/courses/mine  POST /api/courses     GET/PUT/DELETE /api/courses/:id
GET    /api/courses/:cid/lessons                POST /api/courses/:cid/lessons
GET/PUT/DELETE /api/courses/:cid/lessons/:lid
POST   /api/enrollments  GET /api/enrollments/me GET/PUT/DELETE /api/enrollments/:id
GET    /api/courses/:cid/enrollments            GET /api/health · GET /api (endpoint map)
```
