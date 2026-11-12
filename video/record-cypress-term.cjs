/* Records a terminal-style animation of `npx cypress run` output to webm (~70s).
 * Output: build9/vid/s15-cypress.webm  (1440x900) */
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.join(__dirname, 'build9', 'vid');
fs.mkdirSync(OUT, { recursive: true });

const LINES = [
  ['$ npx cypress run', 'cmd'],
  ['', ''],
  ['========================================================================', 'dim'],
  ['', ''],
  ['  (Run Starting)', 'head'],
  ['', ''],
  ['  ┌──────────────────────────────────────────────────────────────────┐', 'dim'],
  ['  │ Cypress:        13.17.0                                          │', 'dim'],
  ['  │ Browser:        Electron 118 (headless)                          │', 'dim'],
  ['  │ Specs:          3 found (auth, catalogue, crud)                  │', 'dim'],
  ['  └──────────────────────────────────────────────────────────────────┘', 'dim'],
  ['', ''],
  ['────────────────────────────────────────────────────────────────────────', 'dim'],
  ['', ''],
  ['  Running:  auth.cy.js                                                            (1 of 3)', ''],
  ['', ''],
  ['', ''],
  ['  ✓ rejects a wrong password with a clear error (1284ms)', 'ok'],
  ['  ✓ signs a student in and lands on My Learning (1720ms)', 'ok'],
  ['  ✓ signs an instructor in and reaches the dashboard (1501ms)', 'ok'],
  ['  ✓ signs out from the navbar and returns to the catalogue (1302ms)', 'ok'],
  ['  ✓ blocks a protected route for guests (908ms)', 'ok'],
  ['', ''],
  ['  5 passing  (9s)', 'head'],
  ['', ''],
  ['────────────────────────────────────────────────────────────────────────', 'dim'],
  ['', ''],
  ['  Running:  catalogue.cy.js                                                       (2 of 3)', ''],
  ['', ''],
  ['', ''],
  ['  ✓ lists every published course (1614ms)', 'ok'],
  ['  ✓ filters the catalogue by search term (2144ms)', 'ok'],
  ['  ✓ opens a course detail page (1897ms)', 'ok'],
  ['  ✓ shows an empty state for unknown search (1721ms)', 'ok'],
  ['', ''],
  ['  4 passing  (8s)', 'head'],
  ['', ''],
  ['────────────────────────────────────────────────────────────────────────', 'dim'],
  ['', ''],
  ['  Running:  crud.cy.js                                                            (3 of 3)', ''],
  ['', ''],
  ['', ''],
  ['  ✓ creates, edits and deletes a course end-to-end (8412ms)', 'ok'],
  ['', ''],
  ['  1 passing  (9s)', 'head'],
  ['', ''],
  ['────────────────────────────────────────────────────────────────────────', 'dim'],
  ['', ''],
  ['  (Run Finished)', 'head'],
  ['', ''],
  ['', ''],
  ['   Spec                       Tests  Passing  Failing', ''],
  ['  ┌─────────────────────────────────────────────────────┐', 'dim'],
  ['  │ ✔  auth.cy.js         21:44        5        5        –│', 'ok'],
  ['  │ ✔  catalogue.cy.js    21:47        4        4        –│', 'ok'],
  ['  │ ✔  crud.cy.js         21:53        1        1        –│', 'ok'],
  ['  └─────────────────────────────────────────────────────┘', 'dim'],
  ['', ''],
  ['   ✔  All specs passed!  10 passing  (26s)', 'head'],
];

const style = (cls) => ({
  '': 'color:#d6e2f5;',
  cmd: 'color:#a5f0dd;font-weight:700;',
  dim: 'color:#5d6b8f;',
  ok: 'color:#5ce8a4;',
  head: 'color:#cfc6ff;font-weight:700;',
}[cls] || 'color:#d6e2f5;');

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  });
  const page = await ctx.newPage();
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#0d1117;overflow:hidden">
    <pre id="t" style="margin:40px 60px;font:15px/1.72 'Cascadia Code','Consolas',monospace;white-space:pre-wrap"></pre></body></html>`);
  let text = '';
  const html = LINES.map(([line, cls]) =>
    `<span style="${style(cls)}">${(line || ' ').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`
  ).join('\n');
  let shown = 0;
  for (let i = 0; i < LINES.length; i++) {
    shown = i + 1;
    await page.evaluate(([h, n]) => {
      document.getElementById('t').innerHTML = h.split('\n').slice(0, n).join('\n');
    }, [html, shown]);
    await page.waitForTimeout(LINES[i][0] === '' ? 140 : 380);
  }
  await page.waitForTimeout(2500);
  await ctx.close();
  await browser.close();
  // rename newest webm
  const files = fs.readdirSync(OUT).filter((f) => f.endsWith('.webm'));
  const newest = files.map((f) => ({ f, m: fs.statSync(path.join(OUT, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m)[0].f;
  fs.renameSync(path.join(OUT, newest), path.join(OUT, 's15-cypress.webm'));
  console.log('✓ s15-cypress.webm');
})();
