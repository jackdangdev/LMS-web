/**
 * scripts/shots.js — drives the running dev server with a real Chrome and
 * captures one screenshot per top-level screen, for design review and for the
 * External Design Document's "initial screenshots" section.
 *
 * Usage: node scripts/shots.js [outDir]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const BASE = process.env.APP_URL || 'http://localhost:5173';
const OUT = process.argv[2] || path.join(__dirname, '..', '..', 'docs', 'assets', 'app');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const ACCOUNTS = {
  student: { email: 'mia@student.dev', password: 'Password123' },
  instructor: { email: 'lena@edunova.dev', password: 'Password123' },
  admin: { email: 'admin@edunova.dev', password: 'Password123' },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function signIn(context, role) {
  const page = await context.newPage();
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', ACCOUNTS[role].email);
  await page.fill('input[type="password"]', ACCOUNTS[role].password);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 }),
    page.click('button[type="submit"]'),
  ]);
  return page;
}

async function shoot(page, name, { fullPage = true, wait = 700 } = {}) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await sleep(wait);
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage });
  console.log('  ✓', path.basename(file));
  return file;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });

  const errors = [];
  const collect = (page) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`);
    });
    page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
  };

  /* ------------------------------------------------ anonymous browsing */
  const guest = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  const guestPage = await guest.newPage();
  collect(guestPage);

  await guestPage.goto(BASE, { waitUntil: 'networkidle' });
  await shoot(guestPage, '01-catalogue-guest');

  const firstCard = guestPage.locator('article a[href^="/courses/"]').first();
  await firstCard.click();
  await guestPage.waitForURL(/\/courses\//);
  await shoot(guestPage, '02-course-detail-guest');
  const courseUrl = guestPage.url();
  await guest.close();

  /* ------------------------------------------------------ student flow */
  const studentCtx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const studentPage = await signIn(studentCtx, 'student');
  collect(studentPage);
  await shoot(studentPage, '03-my-learning');
  await studentPage.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await shoot(studentPage, '04-catalogue-student');
  await studentPage.goto(courseUrl, { waitUntil: 'networkidle' });
  await shoot(studentPage, '05-course-detail-enrolled');
  await studentCtx.close();

  /* --------------------------------------------------- instructor flow */
  const instructorCtx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const instructorPage = await signIn(instructorCtx, 'instructor');
  collect(instructorPage);
  await shoot(instructorPage, '06-instructor-dashboard');

  await instructorPage.goto(`${BASE}/teach`, { waitUntil: 'networkidle' });
  const manage = instructorPage.getByRole('button', { name: 'Manage' }).first();
  if ((await manage.count()) > 0) {
    await manage.click();
    await instructorPage.waitForURL(/\/teach\/courses\//);
    await shoot(instructorPage, '07-course-editor-settings');

    await instructorPage.getByRole('button', { name: 'Lessons' }).click();
    await shoot(instructorPage, '08-course-editor-lessons');

    await instructorPage.getByRole('button', { name: /Roster/ }).click();
    await sleep(900);
    await shoot(instructorPage, '09-course-roster');
  }
  await instructorCtx.close();

  /* -------------------------------------------------------- admin flow */
  const adminCtx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const adminPage = await signIn(adminCtx, 'admin');
  collect(adminPage);
  await adminPage.goto(`${BASE}/admin/users`, { waitUntil: 'networkidle' });
  await shoot(adminPage, '10-admin-users');
  await adminCtx.close();

  await browser.close();

  if (errors.length) {
    console.log('\nBrowser errors captured:');
    [...new Set(errors)].forEach((line) => console.log('  !', line));
  } else {
    console.log('\nNo console or page errors.');
  }
})();
