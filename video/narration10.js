/*
 * narration10.js — Part 3 demonstration video (<= 10 min).
 * Every page in action + the code in server.js / app.js explained.
 * ~950 words ≈ 6.8 min narration at -6% → ~7.3 min video.
 */
const SCENES = [
  {
    id: 's01-intro',
    type: 'slide',
    slide: 'v3-intro',
    text: `Welcome to the EduNova demonstration. I am Xiaoxing Dang from Team EduNova. In the next few minutes I will show you every page of our learning management system running on the real stack, and then walk you through the code in server.js and app.js that drives it. Everything is live — no mocks, no slides pretending to be software. The database is seeded, both servers are running from one npm command, and the browser you will see is the same one our end-to-end tests drive.`,
  },
  {
    id: 's02-catalogue',
    type: 'app',
    src: 's03-catalogue',
    text: `We start as a guest on the catalogue. The header gives us sign in and register; the grid shows every published course with its cover, instructor, level and price. The search box and category filters call the API as you type, and the current filter set is written into the URL — so this exact view can be shared as a link. The page is fully responsive; on a phone the grid collapses to a single column. Nothing on this screen requires an account — the catalogue is deliberately public, so prospective students can browse before they commit.`,
  },
  {
    id: 's03-detail',
    type: 'app',
    src: 's04-detail',
    text: `Opening a course shows the detail page. The curriculum lists every lesson in order with its duration, the professor card identifies the instructor, and the stats row — lessons, total time, enrolled students — is computed by the API, not hardcoded. Guests can read everything, but the enrol button sends them to sign in first. That is route guarding on the client, backed by real enforcement on the server. Every number you see here is one GET request away in the JSON response, which is exactly how our tests verify it.`,
  },
  {
    id: 's04-auth',
    type: 'app',
    src: 's05-auth',
    text: `Registration creates a student account. The form validates inline, the API re-validates everything, and the password is hashed with bcrypt before it is stored. After signing in, the token arrives, is kept by the session context, and is attached to every request by our shared API client. Notice the navbar changed: My Learning replaced Register. If the password were wrong, the same envelope would come back with a four-oh-one and the form would show it — we test that case explicitly.`,
  },
  {
    id: 's05-mylearning',
    type: 'app',
    src: 's06-mylearning',
    text: `My Learning is the student home. Each enrolment is a card with its course, progress bar, current grade and status. Ticking lessons off is how progress moves: the tick calls the API, the server recomputes the percentage, and when every lesson is done the enrolment completes itself. The student never calculates progress in the browser. That sounds like a detail, but it is the difference between a display and a system: one rule, enforced once, in one place.`,
  },
  {
    id: 's06-instructor',
    type: 'app',
    src: 's07-instructor',
    text: `Now the teaching side. An instructor signs in and lands on the teaching console with their own courses only — the query filters by owner, and the server would reject anyone poking at a course they do not own. The editor has three tabs. Settings edits title, description, pricing and publication. Lessons builds the ordered curriculum and reorders it. And the roster lists every enrolled student with a grade box — saving a grade updates the student's dashboard instantly. Publishing a course flips its visibility in the public catalogue — that toggle is a single field, guarded by role middleware.`,
  },
  {
    id: 's07-admin',
    type: 'app',
    src: 's08-admin',
    text: `Finally, administration. The admin searches the user base, flips roles between student, instructor and admin, and deactivates accounts. Deleting a user cascades — their enrolments are removed with them — because that integrity rule lives in the database layer, so no screen can forget it. The admin cannot touch course content — that is not their job — and the API will refuse the request even if someone crafts it by hand.`,
  },
  {
    id: 's08-code-server',
    type: 'slide',
    slide: 'v3-code-server',
    text: `Now the code that drives all of this. server.js is the process entry point, and it does exactly four things in order: it loads environment variables with dotenv, connects to MongoDB through our config module, starts Express listening on the configured port, and registers graceful shutdown handlers — on SIGINT or SIGTERM it closes the HTTP server and disconnects the database before exiting, so a deploy never leaves half-written data behind. Keeping listen out of the Express app itself is deliberate: it lets our test suite import the app without opening a port.`,
  },
  {
    id: 's09-code-app',
    type: 'slide',
    slide: 'v3-code-app',
    text: `The app it mounts lives in app.js, and the layer order is the whole story. Security headers from Helmet go on first, then CORS restricted to our known client origins, then JSON body parsing with a one megabyte limit, then request logging — and only after all of that do the four routers mount: auth, users, courses and enrollments. After the routers, two fallbacks catch everything that fell through: a forty-four handler and one centralized error handler that converts every failure into the same JSON envelope. This order is why every request is treated identically. It is also why the file has no surprises for a new developer: read top to bottom, and you have read the security model of the whole backend.`,
  },
  {
    id: 's10-code-flow',
    type: 'slide',
    slide: 'v3-code-flow',
    text: `One request end to end shows why the structure pays off. A POST to slash api slash courses first passes the protect middleware, which verifies the JWT and attaches the user; then authorize instructor. The route hands over to the controller, which validates the payload — including that course code pattern — checks for duplicate codes and answers with a four-oh-nine conflict if one exists, or creates the document through the Mongoose model and answers twenty seventeen. The same shape handles every endpoint, which is why fifty-nine API tests cover them in one consistent style. Controllers stay thin, models stay honest, and when something breaks, the status code tells you which layer broke it.`,
  },
  {
    id: 's11-outro',
    type: 'slide',
    slide: 'v3-outro',
    text: `That is EduNova: every page shown live, and the code behind it — a thin, careful server entry point, a layered Express app, and controllers that own the business rules. The repository, the design document and all test evidence are in the submission. Thank you for watching.`,
  },
];

module.exports = { SCENES };
