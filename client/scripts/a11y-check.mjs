// Runs axe-core (WCAG 2.0/2.1 A and AA rules) against the running app in headless Chrome,
// and optionally saves screenshots. Usage:
//   BASE_URL=http://localhost:5080 CHROME_PATH=/usr/bin/google-chrome node scripts/a11y-check.mjs [--screenshots ../docs/screenshots]
import { AxePuppeteer } from '@axe-core/puppeteer';
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:4200';
const chromePath = process.env.CHROME_PATH ?? '/usr/bin/google-chrome';
const shotsArg = process.argv.indexOf('--screenshots');
const shotsDir = shotsArg > -1 ? process.argv[shotsArg + 1] : null;
if (shotsDir) mkdirSync(shotsDir, { recursive: true });

const browser = await puppeteer.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
let failures = 0;

async function check(name, viewport = { width: 1280, height: 900 }) {
  await page.setViewport(viewport);
  // Let Material's fade-in transitions finish so axe measures final colors, not mid-animation ones.
  await new Promise((r) => setTimeout(r, 400));
  const results = await new AxePuppeteer(page).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const count = results.violations.length;
  failures += count;
  console.log(`${count === 0 ? 'PASS' : 'FAIL'}  ${name}: ${count} violation(s), ${results.passes.length} rules passed`);
  for (const v of results.violations) {
    console.log(`   - [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`);
  }
  if (shotsDir) await page.screenshot({ path: join(shotsDir, `${name}.png`), fullPage: true });
}

async function go(path) {
  await page.goto(baseUrl + path, { waitUntil: 'networkidle0' });
}

// 1. Request list
await go('/requests');
await check('01-request-list');

// 2. Empty form submitted: error summary and inline errors shown
await go('/requests/new');
await check('02-request-form');
await page.click('button[type="submit"]');
await page.waitForSelector('.error-summary');
await check('03-request-form-errors');

// 3. Fill in and submit the form, land on the confirmation/detail page
await page.click('#field-type');
await page.waitForSelector('mat-option');
await page.click('mat-option');
await page.type('#field-address', '200 Example Road');
await page.type('#field-description', 'Request to repair a damaged sidewalk panel.');
await page.type('#field-name', 'Casey Morgan');
await page.type('#field-email', 'casey.morgan@example.com');
await page.type('#field-phone', '555-010-2468');
await page.click('button[type="submit"]');
await page.waitForSelector('.confirmation');
await check('04-request-submitted');

// 4. Keyboard checks: skip link is first in tab order and moves focus to <main>;
//    client-side navigation moves focus to the new page's <h1>.
await go('/requests');
await page.keyboard.press('Tab');
const first = await page.evaluate(() => document.activeElement?.textContent?.trim());
await page.keyboard.press('Enter');
const afterSkip = await page.evaluate(() => document.activeElement?.id);
await page.click('a[href="/requests/new"]');
await page.waitForFunction(() => document.activeElement?.tagName === 'H1', { timeout: 3000 }).catch(() => {});
const afterNav = await page.evaluate(() => `${document.activeElement?.tagName}: ${document.activeElement?.textContent?.trim()}`);
const keyboardOk = first === 'Skip to main content' && afterSkip === 'main-content' && afterNav.startsWith('H1');
if (!keyboardOk) failures++;
console.log(`${keyboardOk ? 'PASS' : 'FAIL'}  keyboard: first Tab -> "${first}", Enter -> #${afterSkip}, after navigation focus -> ${afterNav}`);

// 5. Small-screen layout of the list
await go('/requests');
await check('05-request-list-mobile', { width: 390, height: 844 });

await browser.close();
console.log(failures === 0 ? '\nAll automated checks passed' : `\n${failures} problem(s) found`);
process.exit(failures === 0 ? 0 : 1);
