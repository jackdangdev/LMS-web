/* Renders the slide cards (title, architecture, stack, testing, outro) to PNG. */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'build');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const css = `
  * { margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI',system-ui,sans-serif; }
  body { width:1440px; height:900px; overflow:hidden; position:relative;
         background:#0b1020; color:#e8ecf8; display:flex; align-items:center; justify-content:center; }
  .glow { position:absolute; width:900px; height:900px; border-radius:50%; filter:blur(160px); opacity:.22; }
  .g1 { background:#6d5cff; top:-350px; left:-200px; }
  .g2 { background:#19c8a6; bottom:-400px; right:-150px; }
  .wrap { position:relative; width:1100px; }
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
          padding:18px 22px; text-align:center; min-width:190px; }
  .node b { display:block; font-size:17px; margin-bottom:5px; }
  .node span { font-size:13px; color:#9aa3c2; }
  .arrow { font-size:26px; color:#8f7bff; padding:0 14px; }
  .foot { position:absolute; bottom:36px; left:0; right:0; text-align:center; font-size:14px; color:#6f7897; letter-spacing:.06em; }
`;

const wrap = (title, body, kicker) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
<body><div class="glow g1"></div><div class="glow g2"></div><div class="wrap">
${kicker ? `<div class="kicker">${kicker}</div>` : ''}${body}</div>
<div class="foot">EduNova LMS · First Release · Team EduNova</div></body></html>`;

const slides = {
  'slide-title': wrap(null, `
    <div class="brand"><div class="logo">EN</div><div class="brandname">EduNova<small>LEARNING</small></div></div>
    <h1>A modern Learning<br/>Management System.</h1>
    <p class="sub">Courses · Lessons · Enrolments · Grading — a full-stack web application,<br/>
    built end to end with the MERN-style stack and a documented REST API.</p>`, 'Introducing'),
  'slide-arch': wrap(null, `
    <h2>Every request follows one journey.</h2>
    <div class="flow">
      <div class="node"><b>React client</b><span>components · fetch · JWT header</span></div>
      <div class="arrow">&#8594;</div>
      <div class="node"><b>Express middleware</b><span>helmet · rate limit · auth · roles</span></div>
      <div class="arrow">&#8594;</div>
      <div class="node"><b>Controller</b><span>business logic · validation</span></div>
      <div class="arrow">&#8594;</div>
      <div class="node"><b>MongoDB</b><span>Mongoose models · 4 collections</span></div>
    </div>
    <p class="sub">JSON responses flow back with a consistent success / error shape —<br/>the same contract the automated test suite verifies.</p>`, 'Architecture'),
  'slide-stack': wrap(null, `
    <h2>Programming technologies.</h2>
    <div class="row">
      <div class="card"><h3>Front end</h3><p>React 18 · Vite · Tailwind CSS · React Router · Context API · fetch client with JWT injection</p></div>
      <div class="card"><h3>Back end</h3><p>Node.js · Express 4 · MVC structure · JWT + bcrypt · express-rate-limit · helmet · morgan</p></div>
      <div class="card"><h3>Data</h3><p>MongoDB · Mongoose ODM · 4 collections · text search, unique and compound indexes · cascading deletes</p></div>
    </div>
    <div style="margin-top:26px">
      <span class="chip">JavaScript (ES Modules + CommonJS)</span><span class="chip teal">REST API</span>
      <span class="chip">Playwright (UI verification)</span><span class="chip teal">Vite proxy — zero CORS in dev</span>
    </div>`, 'Tech stack'),
  'slide-testing': wrap(null, `
    <h2>Tested end to end.</h2>
    <div class="row">
      <div class="card"><h3>59 automated API tests</h3><p>Mocha + Chai + Supertest against the real Express stack and a dedicated test database. CRUD, auth, permissions, validation, conflicts, cascades.</p></div>
      <div class="card"><h3>26-call live demo</h3><p>A scripted user journey replayed against the running server, recording every request and response as reproducible JSON evidence.</p></div>
      <div class="card"><h3>UI verification</h3><p>Headless Chrome drives all three roles through the real interface — zero console or page errors.</p></div>
    </div>`, 'Quality'),
  'slide-outro': wrap(null, `
    <div class="brand"><div class="logo">EN</div><div class="brandname">EduNova<small>LEARNING</small></div></div>
    <h1>Thanks for watching.</h1>
    <p class="sub">Team EduNova — First Release · React · Tailwind CSS · Node.js · Express · MongoDB</p>`, null),
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
