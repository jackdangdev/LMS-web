/**
 * Narration script for the EduNova introduction video.
 * Each scene: { id, type, text } — type: 'slide' (static title card) or 'app' (screen recording).
 */

const SCENES = [
  {
    id: 's01-title',
    type: 'slide',
    text:
      "Welcome to EduNova — a modern Learning Management System built for this first release. " +
      "In the next few minutes, we will walk through the platform, and look at the programming technologies used to build it.",
  },
  {
    id: 's02-catalogue',
    type: 'app',
    text:
      "Everything starts at the course catalogue. Visitors can browse all published courses without an account. " +
      "The catalogue supports live search, category filters, difficulty levels and pagination — " +
      "and every filter is synced to the U R L, so any view can be shared as a link.",
    actions: 'catalogue',
  },
  {
    id: 's03-detail',
    type: 'app',
    text:
      "Each course page shows the curriculum as an ordered list of lessons. " +
      "A student can enrol in one click. Once enrolled, they tick off lessons as they complete them — " +
      "the client recalculates progress through the REST API, and when every lesson is done, the enrolment is automatically marked as completed.",
    actions: 'detail',
  },
  {
    id: 's04-auth',
    type: 'app',
    text:
      "Authentication is token based. Users register with a name, email and password. " +
      "Passwords are hashed with bcrypt — they are never stored in plain text. " +
      "On login, the server signs a JSON Web Token that expires after seven days. " +
      "Every protected request carries this token, and middleware verifies it before anything else runs.",
    actions: 'auth',
  },
  {
    id: 's05-mylearning',
    type: 'app',
    text:
      "Students track everything in My Learning: statistics, progress bars and grades for each enrolment. " +
      "The platform has three roles — students, instructors and administrators — " +
      "enforced by role based authorization middleware on the server, plus ownership checks so instructors can only manage their own courses.",
    actions: 'mylearning',
  },
  {
    id: 's06-instructor',
    type: 'app',
    text:
      "Instructors get a dedicated dashboard. They can publish or unpublish courses in one click, " +
      "create new courses, and manage ordered lessons in the course editor. " +
      "The roster tab shows every enrolled student, where grades can be submitted inline — grading an enrolment completes it.",
    actions: 'instructor',
  },
  {
    id: 's07-admin',
    type: 'app',
    text:
      "Administrators manage every account from the user management table: searching, filtering by role, " +
      "creating and editing users, resetting passwords, and deleting accounts — with guard rails, such as not being able to delete yourself.",
    actions: 'admin',
  },
  {
    id: 's08-arch',
    type: 'slide',
    text:
      "Under the hood, every request follows the same journey. " +
      "The React client sends a fetch call, with the J S O N Web Token attached, through the Vite development proxy to Express — so there is no CORS friction in development. " +
      "Middleware first applies security headers, rate limiting and authentication. " +
      "The controller runs the business logic through Mongoose models, MongoDB persists the data, " +
      "and a consistent J S O N response flows back to the client.",
  },
  {
    id: 's09-stack',
    type: 'slide',
    text:
      "Now, the technology behind it. The front end is built with React eighteen and Vite, styled with Tailwind C S S, and routed with React Router. " +
      "The back end is Node dot js with Express, organised in the Model View Controller pattern: " +
      "Mongoose models define the data, controllers hold the business logic, and routes map U R Ls to them. " +
      "The database is MongoDB, with four collections: users, courses, lessons, and enrollments.",
  },
  {
    id: 's10-testing',
    type: 'slide',
    text:
      "The API is secured with J S O N Web Tokens, bcrypt hashing, rate limiting and security headers. " +
      "Quality is covered by an automated test suite — fifty nine end to end tests written with Mocha, Chai and Supertest, " +
      "running the real Express stack against a dedicated test database, covering every CRUD operation plus error and permission cases.",
  },
  {
    id: 's11-outro',
    type: 'slide',
    text:
      "EduNova — courses, lessons and enrolments, end to end, built with React, Tailwind, Node, Express and MongoDB. Thank you for watching.",
  },
];

module.exports = { SCENES };
