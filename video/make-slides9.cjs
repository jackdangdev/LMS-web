/* Renders the slide cards for the 8-minute video to PNG (1440x900). */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'build9');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const css = `
  * { margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI',system-ui,sans-serif; }
  body { width:1440px; height:900px; overflow:hidden; position:relative;
         background:#0b1020; color:#e8ecf8; display:flex; align-items:center; justify-content:center; }
  .glow { position:absolute; width:900px; height:900px; border-radius:50%; filter:blur(160px); opacity:.22; }
  .g1 { background:#6d5cff; top:-350px; left:-200px; }
  .g2 { background:#19c8a6; bottom:-400px; right:-150px; }
  .wrap { position:relative; width:1140px; }
  .kicker { font-size:15px; font-weight:700; letter-spacing:.28em; text-transform:uppercase; color:#8f7bff; margin-bottom:22px; }
  h1 { font-size:76px; font-weight:800; letter-spacing:-.02em; line-height:1.05; }
  h2 { font-size:48px; font-weight:800; letter-spacing:-.015em; margin-bottom:34px; }
  .sub { font-size:23px; color:#aab3d0; margin-top:24px; line-height:1.55; }
  .brand { display:flex; align-items:center; gap:16px; margin-bottom:40px; }
  .logo { width:58px; height:58px; border-radius:16px; background:linear-gradient(135deg,#6d5cff,#19c8a6);
          display:flex; align-items:center; justify-content:center; font-weight:800; font-size:22px; color:#fff; }
  .brandname { font-size:24px; font-weight:700; }
  .brandname small { display:block; font-size:12px; letter-spacing:.3em; color:#8a93b5; font-weight:600; }
  .row { display:flex; gap:20px; }
  .card { flex:1; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1);
          border-radius:16px; padding:24px 26px; }
  .card h3 { font-size:17px; font-weight:700; margin-bottom:10px; color:#fff; }
  .card p { font-size:14.5px; line-height:1.6; color:#aab3d0; }
  .chip { display:inline-block; margin:6px 8px 0 0; padding:8px 16px; border-radius:999px; font-size:15px; font-weight:600;
          background:rgba(109,92,255,.16); border:1px solid rgba(109,92,255,.45); color:#cfc6ff; }
  .chip.teal { background:rgba(25,200,166,.14); border-color:rgba(25,200,166,.4); color:#a5f0dd; }
  .flow { display:flex; align-items:center; gap:0; margin-top:10px; }
  .node { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.14); border-radius:14px;
          padding:18px 22px; text-align:center; min-width:170px; }
  .node b { display:block; font-size:17px; margin-bottom:5px; }
  .node span { font-size:13px; color:#9aa3c2; }
  .arrow { font-size:26px; color:#8f7bff; padding:0 14px; }
  .num { font-size:44px; font-weight:800; color:#19c8a6; margin-bottom:6px; }
  .foot { position:absolute; bottom:36px; left:0; right:0; text-align:center; font-size:14px; color:#6f7897; letter-spacing:.06em; }
`;

const wrap = (body, kicker) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
<body><div class="glow g1"></div><div class="glow g2"></div><div class="wrap">
${kicker ? `<div class="kicker">${kicker}</div>` : ''}${body}</div>
<div class="foot">EduNova LMS · Team EduNova · First &amp; Second Release</div></body></html>`;

const slides = {
  'slide-title': wrap(`
    <div class="brand"><div class="logo">EN</div><div class="brandname">EduNova<small>LEARNING</small></div></div>
    <h1>A modern Learning<br/>Management System.</h1>
    <p class="sub">A complete project introduction — features, architecture, technologies,<br/>
    automated testing and CI/CD — in eight minutes.</p>`, 'Project introduction · Team EduNova'),

  'slide-overview': wrap(`
    <h2>Two releases, one platform.</h2>
    <div class="row">
      <div class="card"><h3>Release 1 — the product</h3>
        <p>JWT authentication · public course catalogue · enrolment and lesson tracking · progress recalculation · grading · instructor dashboard and course editor · admin user management</p></div>
      <div class="card"><h3>Release 2 — the engineering</h3>
        <p>Front-end unit tests (Vitest) · browser end-to-end tests (Cypress) · Git repository with a branching workflow · GitHub Actions CI pipeline · submission evidence: screenshots, videos, PDFs</p></div>
    </div>
    <div style="margin-top:26px">
      <span class="chip">3 roles — student / instructor / admin</span>
      <span class="chip teal">27 REST endpoints</span>
      <span class="chip">4 MongoDB collections</span>
      <span class="chip teal">Real, running code</span>
    </div>`, 'Scope'),

  'slide-api': wrap(`
    <h2>One REST API, five modules, 27 endpoints.</h2>
    <div class="row" style="flex-wrap:wrap">
      <div class="card" style="flex:1 1 30%"><h3>auth <span style="color:#19c8a6">· 5</span></h3>
        <p>register · login · current profile · update profile · change password</p></div>
      <div class="card" style="flex:1 1 30%"><h3>courses <span style="color:#19c8a6">· 7</span></h3>
        <p>list · detail · mine · create · update · delete · publish toggle</p></div>
      <div class="card" style="flex:1 1 30%"><h3>lessons <span style="color:#19c8a6">· 5</span></h3>
        <p>ordered curriculum CRUD · reorder</p></div>
      <div class="card" style="flex:1 1 46%"><h3>enrollments <span style="color:#19c8a6">· 5</span></h3>
        <p>enrol · roster per course · my learning · progress ticks · grading</p></div>
      <div class="card" style="flex:1 1 46%"><h3>users <span style="color:#19c8a6">· 5</span> <span style="font-size:12px;color:#8a93b5">(admin only)</span></h3>
        <p>list · detail · create · update role/status · delete (cascades)</p></div>
    </div>
    <p class="sub">Uniform JSON envelope on every response — <span style="color:#a5f0dd">{ success, data }</span> on the happy path,<br/>
    <span style="color:#ffb4b4">{ success: false, message }</span> with the right status code when something goes wrong.</p>`, 'The API'),

  'slide-arch': wrap(`
    <h2>Every request follows one journey.</h2>
    <div class="flow">
      <div class="node"><b>React client</b><span>components · fetch · JWT header</span></div>
      <div class="arrow">&#8594;</div>
      <div class="node"><b>Vite proxy</b><span>zero CORS in dev</span></div>
      <div class="arrow">&#8594;</div>
      <div class="node"><b>Express middleware</b><span>helmet · rate limit · auth · roles</span></div>
      <div class="arrow">&#8594;</div>
      <div class="node"><b>Controller</b><span>business logic · validation</span></div>
      <div class="arrow">&#8594;</div>
      <div class="node"><b>MongoDB</b><span>Mongoose models · indexes</span></div>
    </div>
    <p class="sub">A consistent JSON success / error envelope flows back to the client —<br/>one uniform contract, so every layer can be tested in isolation.</p>`, 'Architecture'),

  'slide-stack': wrap(`
    <h2>Programming technologies.</h2>
    <div class="row">
      <div class="card"><h3>Front end</h3><p>React 18 (hooks + Context) · Vite · Tailwind CSS · React Router · fetch client with JWT injection · toast &amp; session providers</p></div>
      <div class="card"><h3>Back end</h3><p>Node.js · Express 4 · MVC structure · JWT + bcrypt · express-rate-limit · helmet · morgan · centralized error handler</p></div>
      <div class="card"><h3>Tooling</h3><p>Vitest + Testing Library · Cypress · Mocha + Chai + Supertest · Playwright &amp; headless Chrome · GitHub Actions</p></div>
    </div>
    <div style="margin-top:26px">
      <span class="chip">JavaScript (ES Modules + CommonJS)</span><span class="chip teal">REST API</span>
      <span class="chip">concurrently — one command, both servers</span><span class="chip teal">npm workspaces-style monorepo</span>
    </div>`, 'Tech stack'),

  'slide-data': wrap(`
    <h2>Four collections, one clean model.</h2>
    <div class="row">
      <div class="node"><b>users</b><span>name · email (unique) · role · hashed password</span></div>
      <div class="node"><b>courses</b><span>code (unique) · title · price · level · published</span></div>
      <div class="node"><b>lessons</b><span>ordered curriculum · duration · summary</span></div>
      <div class="node"><b>enrollments</b><span>student + course · progress · grade</span></div>
    </div>
    <p class="sub">Mongoose schemas with validators, defaults and enums · unique and compound indexes ·<br/>
    reference-based relationships with cascading deletes.</p>`, 'Data model'),

  'slide-security': wrap(`
    <h2>Security, layered.</h2>
    <div class="row">
      <div class="card"><h3>Identity</h3><p>bcrypt password hashing with per-user salts · JSON Web Tokens expiring after 7 days · verified on every protected route</p></div>
      <div class="card"><h3>Hardening</h3><p>login rate limiting · Helmet security headers · input validation on every write · structured error responses</p></div>
      <div class="card"><h3>Authorization</h3><p>role middleware (student / instructor / admin) · object-ownership checks — an instructor can only manage their own courses</p></div>
    </div>`, 'Security'),

  'slide-testing': wrap(`
    <h2>Tested at every level.</h2>
    <div class="row">
      <div class="card"><h3><span class="num">90</span> automated tests</h3>
        <p>59 API tests (Mocha + Chai + Supertest on the real Express stack) · 21 front-end unit tests (Vitest + React Testing Library) · 10 Cypress end-to-end scenarios</p></div>
      <div class="card"><h3>End-to-end coverage</h3>
        <p>registration, login and route guards · catalogue search and filters · a complete course CRUD journey by an instructor · every run recorded to video with screenshots</p></div>
      <div class="card"><h3>Evidence</h3>
        <p>test-result snapshots, Cypress recordings and raw logs are packaged into the submission as reproducible proof.</p></div>
    </div>`, 'Quality'),

  'slide-cicd': wrap(`
    <h2>Git workflow &amp; CI/CD.</h2>
    <div class="flow">
      <div class="node"><b>feature branch</b><span>develop isolated changes</span></div>
      <div class="arrow">&#8594;</div>
      <div class="node"><b>commit</b><span>atomic, descriptive history</span></div>
      <div class="arrow">&#8594;</div>
      <div class="node"><b>merge to main</b><span>change goes live on reload</span></div>
      <div class="arrow">&#8594;</div>
      <div class="node"><b>GitHub Actions</b><span>install · test · build · e2e</span></div>
    </div>
    <p class="sub">The pipeline starts a real MongoDB service, runs the API suite, unit tests and Cypress —<br/>a red build never ships. Before/after screenshots prove the live update.</p>`, 'Delivery'),

  'slide-outro': wrap(`
    <div class="brand"><div class="logo">EN</div><div class="brandname">EduNova<small>LEARNING</small></div></div>
    <h1>Thanks for watching.</h1>
    <p class="sub">Team EduNova · React · Tailwind CSS · Node.js · Express · MongoDB<br/>
    Automated testing · Git &amp; GitHub Actions CI/CD</p>`, null),
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const [name, html] of Object.entries(slides)) {
    fs.writeFileSync(path.join(OUT, `${name}.html`), html);
    await page.goto('file:///' + path.join(OUT, `${name}.html`).replace(/\\/g, '/'));
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    console.log('✓', name + '.png');
  }
  await browser.close();
})();
