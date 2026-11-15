/* Renders intro + 3 code-walkthrough + outro slides (1440x900) into build10. */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'build10');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const css = `
  * { margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI',system-ui,sans-serif; }
  body { width:1440px; height:900px; overflow:hidden; position:relative; background:#0b1020; color:#e8ecf8; }
  .glow { position:absolute; width:900px; height:900px; border-radius:50%; filter:blur(160px); opacity:.2; }
  .g1 { background:#6d5cff; top:-350px; left:-200px; }
  .g2 { background:#19c8a6; bottom:-400px; right:-150px; }
  .wrap { position:relative; padding:70px 90px; }
  .kicker { font-size:14px; font-weight:700; letter-spacing:.28em; text-transform:uppercase; color:#8f7bff; margin-bottom:16px; }
  h2 { font-size:40px; font-weight:800; letter-spacing:-.015em; margin-bottom:10px; }
  .sub { font-size:17px; color:#aab3d0; margin-bottom:26px; line-height:1.5; }
  .codecard { background:#0d1226; border:1px solid rgba(255,255,255,.1); border-radius:16px;
              padding:26px 30px; font:15.5px/1.62 'Cascadia Code','Consolas',monospace; color:#d6e2f5; }
  .ln { color:#3d4a6e; display:inline-block; width:44px; user-select:none; }
  .k { color:#c792ea; } .s { color:#a5f0dd; } .f { color:#82aaff; } .c { color:#5d6b8f; font-style:italic; }
  .n { color:#f78c6c; }
  .hl { background:rgba(25,200,166,.14); border-left:3px solid #19c8a6; margin:0 -12px; padding:0 9px; }
  .hl2 { background:rgba(109,92,255,.18); border-left:3px solid #6d5cff; margin:0 -12px; padding:0 9px; }
  .note { position:absolute; right:90px; bottom:64px; width:360px; background:rgba(255,255,255,.05);
          border:1px solid rgba(255,255,255,.12); border-radius:14px; padding:18px 20px; font-size:14px;
          color:#aab3d0; line-height:1.6; }
  .note b { color:#fff; }
  .brand { position:absolute; top:56px; right:90px; display:flex; align-items:center; gap:12px; }
  .logo { width:40px; height:40px; border-radius:11px; background:linear-gradient(135deg,#6d5cff,#19c8a6);
          display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; color:#fff; }
  .foot { position:absolute; bottom:36px; left:90px; font-size:13px; color:#6f7897; }
`;

const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function codeCard(lines) {
  // lines: [raw, classes, highlight(''|hl|hl2)]
  return `<div class="codecard">` + lines.map(([t, cls, h]) => {
    let body = esc(t);
    body = body
      .replace(/&#39;[^&]*?'/g, (m) => `<span class="s">${m}</span>`)
      .replace(/\b(const|let|require|await|async|if|return|new|throw|module|exports)\b/g, '<span class="k">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="n">$1</span>');
    return `<div class="${h || ''}"><span class="ln"></span>${body}</div>`;
  }).join('') + `</div>`;
}

const pages = {
  'v3-intro': `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
  <body><div class="glow g1"></div><div class="glow g2"></div><div class="brand"><div class="logo">EN</div></div>
  <div class="wrap" style="padding-top:200px">
    <div class="kicker">Part 3 &middot; Demonstration video</div>
    <h2 style="font-size:72px">EduNova, live.</h2>
    <p class="sub" style="font-size:20px;max-width:760px">Every page of the platform, running on the real stack —<br/>then the code in <b style="color:#fff">server.js</b> and <b style="color:#fff">app.js</b> that drives it.</p>
  </div>
  <div class="foot">Team EduNova &middot; React &middot; Express &middot; MongoDB</div></body></html>`,

  'v3-code-server': `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
  <body><div class="glow g1"></div><div class="glow g2"></div><div class="brand"><div class="logo">EN</div></div>
  <div class="wrap">
    <div class="kicker">Code walkthrough &middot; 1 of 3</div>
    <h2>server.js — the process entry point</h2>
    <p class="sub">Four jobs, in order: env &rarr; database &rarr; listen &rarr; graceful shutdown. No <b style="color:#fff">listen()</b> inside app.js, so tests can import it.</p>
    ${codeCard([
      ["require('dotenv').config();", '', ''],
      ["", '', ''],
      ["const app = require('./src/app');", '', ''],
      ["const { connectDB, disconnectDB } = require('./src/config/db');", '', ''],
      ["const PORT = process.env.PORT || 5000;", '', ''],
      ["", '', ''],
      ["const start = async () => {", '', 'hl'],
      ["  await connectDB();                      // 1. database first", '', 'hl'],
      ["  const server = app.listen(PORT, () => { // 2. then listen", '', 'hl'],
      ["    console.log(`[api] EduNova LMS running on :${PORT}/api`);", '', 'hl'],
      ["  });", '', 'hl'],
      ["", '', ''],
      ["  const shutdown = async (signal) => {    // 3. graceful stop", '', 'hl2'],
      ["    server.close(async () => {", '', 'hl2'],
      ["      await disconnectDB();               //    no half-written data", '', 'hl2'],
      ["      process.exit(0);", '', 'hl2'],
      ["    });", '', 'hl2'],
      ["  };", '', 'hl2'],
      ["  ['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));", '', ''],
      ["};", '', ''],
      ["start();", '', ''],
    ])}
  </div>
  <div class="note"><b>Why it matters</b><br/>Tests import <b>app</b> without a port; deploys stop cleanly; config never hardcodes credentials.</div>
  <div class="foot">EduNova LMS &middot; lms-backend/server.js</div></body></html>`,

  'v3-code-app': `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
  <body><div class="glow g1"></div><div class="glow g2"></div><div class="brand"><div class="logo">EN</div></div>
  <div class="wrap">
    <div class="kicker">Code walkthrough &middot; 2 of 3</div>
    <h2>app.js — the middleware pipeline</h2>
    <p class="sub">Layer order is the security model: <b style="color:#fff">security &rarr; parsing &rarr; logging &rarr; routes &rarr; 404 &rarr; error funnel</b>.</p>
    ${codeCard([
      ["const app = express();", '', ''],
      ["", '', ''],
      ["app.use(helmet());                        // security headers", '', 'hl'],
      ["app.use(cors({ origin: CLIENT_ORIGINS, credentials: true }));", '', 'hl'],
      ["app.use(express.json({ limit: '1mb' }));  // body parsing", '', 'hl'],
      ["if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));", '', 'hl'],
      ["", '', ''],
      ["app.get('/api/health', (_req, res) => res.json({ status: 'UP' }));", '', ''],
      ["", '', ''],
      ["app.use('/api/auth', authRoutes);         // four routers,", '', 'hl2'],
      ["app.use('/api/users', userRoutes);        // one JSON contract", '', 'hl2'],
      ["app.use('/api/courses', courseRoutes);", '', 'hl2'],
      ["app.use('/api/enrollments', enrollmentRoutes);", '', 'hl2'],
      ["", '', ''],
      ["app.use(notFound);                        // unmatched request?", '', ''],
      ["app.use(errorHandler);                    // one error funnel:", '', ''],
      ["                                          // 400/401/403/404/409 -> JSON", '', ''],
    ])}
  </div>
  <div class="note"><b>Uniform envelope</b><br/>Success: <b>{ success, data }</b><br/>Failure: <b>{ success:false, message }</b> with the right status code — the client handles errors one way.</div>
  <div class="foot">EduNova LMS &middot; lms-backend/src/app.js</div></body></html>`,

  'v3-code-flow': `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
  <body><div class="glow g1"></div><div class="glow g2"></div><div class="brand"><div class="logo">EN</div></div>
  <div class="wrap">
    <div class="kicker">Code walkthrough &middot; 3 of 3</div>
    <h2>One request, end to end</h2>
    <p class="sub">POST /api/courses — guard at the door, validate in the controller, answer with the envelope.</p>
    ${codeCard([
      ["// routes/courseRoutes.js — declare, guard, delegate", '', ''],
      ["router.route('/')", '', 'hl'],
      ["  .get(optionalAuth, getCourses)          // public catalogue", '', 'hl'],
      ["  .post(protect, authorize('instructor', 'admin'), createCourse);", '', 'hl'],
      ["", '', ''],
      ["// controllers/courseController.js — the business rules", '', ''],
      ["const createCourse = asyncHandler(async (req, res) => {", '', 'hl2'],
      ["  if (!title || !code || !description)", '', 'hl2'],
      ["    throw new ApiError(400, 'title, code and description are required');", '', 'hl2'],
      ["", '', 'hl2'],
      ["  const duplicate = await Course.findOne({ code: normalisedCode });", '', 'hl2'],
      ["  if (duplicate)", '', 'hl2'],
      ["    throw new ApiError(409, `Course code ${code} is already in use`);", '', 'hl2'],
      ["", '', 'hl2'],
      ["  let instructorId = req.user._id;        // ownership from the token", '', 'hl2'],
      ["  const course = await Course.create({ ...req.body, instructor: instructorId });", '', 'hl2'],
      ["  res.status(201).json({ success: true, data: course });", '', 'hl2'],
      ["});", '', 'hl2'],
    ])}
  </div>
  <div class="note"><b>Same shape everywhere</b><br/>That is why 59 API tests cover 27 endpoints in one consistent style.</div>
  <div class="foot">EduNova LMS &middot; lms-backend/src</div></body></html>`,

  'v3-outro': `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
  <body><div class="glow g1"></div><div class="glow g2"></div><div class="brand"><div class="logo">EN</div></div>
  <div class="wrap" style="padding-top:220px">
    <div class="kicker">Thank you</div>
    <h2 style="font-size:64px">That is EduNova.</h2>
    <p class="sub" style="font-size:19px">Every page shown live &middot; the code explained &middot; 90 automated tests keeping it honest.<br/>
    Team EduNova &middot; Xiaoxing Dang &middot; repository, design document and evidence in the submission.</p>
  </div></body></html>`,
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const [name, html] of Object.entries(pages)) {
    fs.writeFileSync(path.join(OUT, `${name}.html`), html);
    await page.goto('file:///' + path.join(OUT, `${name}.html`).replace(/\\/g, '/'));
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    console.log('✓', name + '.png');
  }
  await browser.close();
})();
