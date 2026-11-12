/* Records the app-demo scenes with headless Chrome. One webm per scene. */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const API = 'http://localhost:5000/api';
const APP = 'http://localhost:5173';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const VID_DIR = path.join(__dirname, 'build', 'vid');
const SCENES = JSON.parse(fs.readFileSync(path.join(__dirname, 'build', 'scenes.json'), 'utf8')).filter(
  (s) => s.type === 'app' && (!process.env.ONLY || process.env.ONLY === s.id)
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const login = async (email) => {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Password123' }),
  });
  const json = await res.json();
  if (!json.token) throw new Error('login failed for ' + email);
  return json.token;
};

/* ---------- per-scene interactions ------------------------------------- */
const typeSlow = async (page, selector, text) => {
  await page.click(selector);
  for (const ch of text) {
    await page.keyboard.type(ch);
    await sleep(70);
  }
};

const actions = {
  catalogue: async (page, dur) => {
    await page.goto(APP + '/', { waitUntil: 'networkidle' });
    await sleep(1500);
    await typeSlow(page, 'input[placeholder*="Search"]', 'data');
    await sleep(1600);
    await page.fill('input[placeholder*="Search"]', '');
    await sleep(1200);
    await page.getByRole('button', { name: 'Data Science' }).first().click();
    await sleep(1600);
    await page.getByRole('button', { name: 'All courses' }).first().click();
    await sleep(1200);
    await page.mouse.wheel(0, 560);
    await sleep(1800);
    await page.hover('article:nth-of-type(2)');
    await sleep(2000);
    await page.mouse.wheel(0, -700);
    await sleep(1500);
  },
  detail: async (page, dur) => {
    await page.goto(APP + '/', { waitUntil: 'networkidle' });
    await sleep(1200);
    await page.locator('article a').first().click();
    await page.waitForURL('**/courses/**');
    await sleep(2000);
    await page.mouse.wheel(0, 420);
    await sleep(1600);
    const link = page.getByRole('button', { name: 'View details' }).first();
    if (await link.count()) {
      await link.click();
      await sleep(2200);
    }
    await page.mouse.wheel(0, 320);
    await sleep(2000);
    await page.mouse.wheel(0, 500);
    await sleep(2000);
  },
  auth: async (page, dur) => {
    // 1) register page as a guest (before any login, otherwise it redirects)
    await page.goto(APP + '/register', { waitUntil: 'networkidle' });
    await sleep(2000);
    await page.locator('input').first().click();
    await page.keyboard.type('Alex Turner');
    await sleep(1800);
    await page.mouse.wheel(0, 380);
    await sleep(1800);
    // 2) sign in with the seeded student demo account
    await page.goto(APP + '/login', { waitUntil: 'networkidle' });
    await sleep(2000);
    await page.getByRole('button', { name: 'Student', exact: true }).click();
    await sleep(1400);
    await page.getByRole('button', { name: /Sign in/i }).click();
    await page.waitForURL('**/my-learning', { timeout: 15000 });
    await sleep(3000);
    await page.mouse.wheel(0, 420);
    await sleep(2200);
  },
  mylearning: async (page, dur) => {
    await page.goto(APP + '/my-learning', { waitUntil: 'networkidle' });
    await sleep(2400);
    await page.mouse.wheel(0, 430);
    await sleep(2000);
    // open the data course and toggle a lesson checkbox (progress recompute demo)
    await page.locator('article a').first().click();
    await page.waitForURL('**/courses/**');
    await sleep(1800);
    const box = page.locator('button[aria-label*="ark"], ol button').first();
    await page.locator('ol li button').first().click();
    await sleep(2400);
    await page.locator('ol li button').first().click(); // restore
    await sleep(2200);
    await page.mouse.wheel(0, 380);
    await sleep(2000);
  },
  instructor: async (page, dur) => {
    await page.goto(APP + '/teach', { waitUntil: 'networkidle' });
    await sleep(2400);
    await page.mouse.wheel(0, 380);
    await sleep(1800);
    // open the course editor
    await page.getByRole('button', { name: /manage|edit|open/i }).first().click().catch(() => {});
    await sleep(800);
    await page.locator('table button').last().click().catch(() => {});
    await page.waitForURL('**/teach/courses/**', { timeout: 12000 });
    await sleep(2000);
    await page.getByRole('button', { name: /Lessons/i }).first().click();
    await sleep(2000);
    await page.getByRole('button', { name: /Roster/i }).first().click();
    await sleep(2400);
    await page.mouse.wheel(0, 300);
    await sleep(2000);
  },
  admin: async (page, dur) => {
    await page.goto(APP + '/admin/users', { waitUntil: 'networkidle' });
    await sleep(2400);
    await typeSlow(page, 'input[placeholder*="Search"]', 'mia');
    await sleep(1800);
    await page.fill('input[placeholder*="Search"]', '');
    await sleep(1200);
    await page.getByRole('button', { name: 'Instructors' }).first().click();
    await sleep(1800);
    await page.getByRole('button', { name: 'All roles' }).first().click();
    await sleep(1400);
    await page.mouse.wheel(0, 260);
    await sleep(2200);
  },
};

/* ---------------------------------------------------------------------- */
(async () => {
  fs.mkdirSync(VID_DIR, { recursive: true });
  const tokens = {
    mia: await login('mia@student.dev'),
    lena: await login('lena@edunova.dev'),
    admin: await login('admin@edunova.dev'),
  };

  const browser = await chromium.launch({ executablePath: CHROME, headless: true });

  for (const scene of SCENES) {
    const dur = (scene.narrSec + 1.4) * 1000;
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: VID_DIR, size: { width: 1440, height: 900 } },
    });
    const token =
      scene.actions === 'mylearning' ? tokens.mia : scene.actions === 'instructor' ? tokens.lena : scene.actions === 'admin' ? tokens.admin : null;
    if (token) {
      await ctx.addInitScript((t) => localStorage.setItem('edunova.token', t), token);
    }
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.log('  [pageerror]', e.message));
    console.log('recording', scene.id, `(${(dur / 1000).toFixed(1)}s)`);

    const t0 = Date.now();
    try {
      await actions[scene.actions](page, dur);
    } catch (e) {
      console.log('  [action warn]', e.message.split('\n')[0]);
    }
    const remaining = dur - (Date.now() - t0);
    if (remaining > 0) await sleep(remaining);

    await ctx.close();
    // newest video in dir belongs to this context
    const files = fs.readdirSync(VID_DIR).map((f) => path.join(VID_DIR, f));
    const newest = files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
    const dest = path.join(VID_DIR, scene.id + '.webm');
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    fs.renameSync(newest, dest);
    console.log('  ✓', scene.id + '.webm');
  }

  await browser.close();
  console.log('done');
})();
