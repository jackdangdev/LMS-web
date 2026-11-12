/*
 * narration9.js — 8-minute project introduction, v2.
 * Restructured to mirror the 30-slide customer deck:
 * intro -> live product tour -> API -> architecture -> stack -> data ->
 * security -> testing -> Cypress E2E demo (terminal + real run) -> CI/CD -> outro.
 * Target: ~1300 words ≈ 8.2 min at +5% rate.
 */
const SCENES = [
  {
    id: 's01-title',
    type: 'slide',
    slide: 'slide-title',
    text: `Hello, and welcome. My name is Xiaoxing Dang, from Team EduNova. In the next eight minutes I will walk you through our project end to end: the learning platform itself, the technologies we used to build it, how the database is designed, and how we test and ship it. Everything you are about to see is real, running software — not a prototype.`,
  },
  {
    id: 's02-overview',
    type: 'slide',
    slide: 'slide-overview',
    text: `EduNova was delivered in two releases. Release one is the product: authentication, a public course catalogue, enrolment, lesson tracking, progress recalculation, grading, an instructor dashboard and admin user management. Release two is the engineering: front-end unit tests, browser end-to-end tests, a Git repository with a branching workflow, and a CI pipeline. The platform serves three roles — students, instructors and admins — through twenty-seven REST endpoints over four MongoDB collections.`,
  },
  {
    id: 's03-catalogue',
    type: 'app',
    text: `Let us start with the running website. This is the catalogue. Every published course is shown as a card with its cover image, instructor, level and price. The search box and the category filters are wired to the API with debouncing — and they stay in sync with the URL, so any filtered view can be shared as a link. Clicking a card opens the course page.`,
  },
  {
    id: 's04-detail',
    type: 'app',
    text: `The course detail page shows the curriculum in order, the professor profile, and live statistics straight from the API: total lessons, total duration and enrolled students. As a student completes lessons and ticks them off, the progress bar recalculates on the server — the client never does the math. When every lesson is done, the course completes automatically.`,
  },
  {
    id: 's05-auth',
    type: 'app',
    text: `Registration and login are backed by JSON Web Tokens. New accounts are validated on both ends, passwords are hashed with bcrypt before they ever touch the database, and the signed token is attached to every request by the shared API client. Protected routes are guarded on the client, but the real enforcement happens in the Express middleware — the front end guard is just convenience.`,
  },
  {
    id: 's06-mylearning',
    type: 'app',
    text: `This is My Learning, the student dashboard. It lists every enrolment with its progress, current grade and status, and it resumes exactly where the student left off. The data comes from the enrolments collection, joined with course details through Mongoose population — one request, one clean JSON envelope.`,
  },
  {
    id: 's07-instructor',
    type: 'app',
    text: `On the teaching side, instructors get a dashboard listing their own courses. The course editor covers three tabs: settings, where validation rules from the API are mirrored in the form; the lesson builder, where the curriculum is created and reordered; and the roster, where the instructor grades each enrolled student. An instructor can only ever open courses they own — ownership is checked on the server.`,
  },
  {
    id: 's08-admin',
    type: 'app',
    text: `Administrators manage the user base here: searching accounts, switching roles between student, instructor and admin, and deactivating users. Deleting a user cascades cleanly — their enrolments go with them — because integrity rules live in the database layer, not in any single screen.`,
  },
  {
    id: 's09-api',
    type: 'slide',
    slide: 'slide-api',
    text: `Behind the screens sits a REST API of twenty-seven endpoints in five modules. Authentication handles register, login, the current profile and password changes. Courses cover the full CRUD lifecycle plus the instructor view. Lessons maintain the ordered curriculum. Enrolments drive enrolment, progress and grading. And the admin-only user module completes the picture. Every endpoint answers with the same JSON success-or-error envelope.`,
  },
  {
    id: 's10-arch',
    type: 'slide',
    slide: 'slide-arch',
    text: `Every request follows the same journey. The React client attaches its JWT and calls the API through the Vite proxy, which keeps development free of CORS issues. Express runs each call through its middleware pipeline — security headers, rate limiting, authentication, role checks — before it reaches the controller, where validation and business rules live. Only then does Mongoose touch MongoDB. Because each layer has one job, each layer can be tested in isolation.`,
  },
  {
    id: 's11-stack',
    type: 'slide',
    slide: 'slide-stack',
    text: `The technology choices are deliberately mainstream. On the front end: React eighteen with hooks and context, Vite for instant tooling, Tailwind CSS for the design system, and React Router. On the back end: Node and Express in an MVC structure, secured with JWT, bcrypt, rate limiting and Helmet. Around the code: Mocha and Supertest, Vitest, Cypress, Playwright, and GitHub Actions — and a single npm command starts both servers together.`,
  },
  {
    id: 's12-data',
    type: 'slide',
    slide: 'slide-data',
    text: `The database is four collections. Users store hashed credentials and a role. Courses carry a unique code, pricing, level and publication flag. Lessons form the ordered curriculum. Enrollments connect a student to a course and carry progress and grade. Mongoose schemas enforce types, enums and defaults; unique and compound indexes protect integrity; and relationships use references with cascading deletes, so removing a course cleans up its enrolments.`,
  },
  {
    id: 's13-security',
    type: 'slide',
    slide: 'slide-security',
    text: `Security is layered, not sprinkled. Identity rests on bcrypt hashing and seven-day JWTs verified on every protected route. Hardening comes from login rate limiting, Helmet headers and input validation on every write. Authorization is role middleware plus object-ownership checks: students reach their own learning, instructors manage only their own courses, and admins hold the keys to user management.`,
  },
  {
    id: 's14-testing',
    type: 'slide',
    slide: 'slide-testing',
    text: `Which brings us to quality. Ninety automated tests guard the platform: fifty-nine API tests run against the real Express stack, twenty-one front-end unit tests cover components and utilities, and ten Cypress scenarios drive the browser end to end. The end-to-end suite covers registration, login and route guards, catalogue search, and a complete course CRUD journey — and every run is recorded to video as evidence.`,
  },
  {
    id: 's15-cypress',
    type: 'app',
    text: `Here is that end-to-end suite running for real. Cypress launches the application exactly as a user would — no mocks, no shortcuts.`,
  },
  {
    id: 's16-cypress2',
    type: 'cypress',
    video: 'cypress-real.mp4',
    text: `In the recording you can see a student signing in, browsing the catalogue, and then an instructor creating a course, editing it and deleting it — the full CRUD cycle, verified automatically. When a run fails, Cypress saves the screenshot and the video, so debugging starts with evidence instead of guesswork.`,
  },
  {
    id: 's17-cicd',
    type: 'slide',
    slide: 'slide-cicd',
    text: `All of this is wired into continuous integration. Work happens on a feature branch, lands as an atomic commit, merges back to main, and GitHub Actions takes over: it starts a real MongoDB service, installs dependencies, runs the API suite, the unit tests and Cypress, and builds the client. A red build never ships. We demonstrated this live — a change merged to main appeared on the site on reload.`,
  },
  {
    id: 's18-outro',
    type: 'slide',
    slide: 'slide-outro',
    text: `That is EduNova: a real platform, an honest architecture, ninety tests and a pipeline that keeps it green. The repository, the design document and all the evidence are ready for review. Thank you for watching — we are happy to take questions.`,
  },
];

module.exports = { SCENES };
