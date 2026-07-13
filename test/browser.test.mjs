/* End-to-end, in a real browser: the course (listening + mic + law), the free
   levels, and the service-worker update path.

   Needs Playwright and a server:  npm run test:browser
   Skips itself (exit 0) if Playwright isn't installed, so `npm test` stays cheap. */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { suite } from './dom-stub.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4599;
const URL = `http://localhost:${PORT}/french-sounds.html`;

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.log('browser tests skipped — run `npm i -D playwright && npx playwright install chromium`');
  process.exit(0);
}

const server = spawn('npx', ['--yes', 'serve', ROOT, '-l', String(PORT)], { stdio: 'ignore' });
const stop = () => { try { server.kill(); } catch {} };
process.on('exit', stop);
await new Promise((r) => setTimeout(r, 2500));

const t = suite('browser · end to end');
const browser = await chromium.launch({
  args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
});
const ctx = await browser.newContext({ viewport: { width: 420, height: 1000 }, permissions: ['microphone'] });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

await page.route('**/translate.google.com/**', (r) => r.abort());       // no TTS in tests
await page.route('**/generativelanguage.googleapis.com/**', (r) =>      // stand in for Gemini
  r.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({
      score: 88, correct: true, passed: true, heard: 'chat', leansToward: '', mistakes: [],
      feedback: 'Nice open /a/.',
    }) }] } }] }),
  }));

await page.goto(URL, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.setItem('ecoute_gemini_key', 'AIzaSTUB'));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(300);

/* answer every question of a listening round correctly */
async function playQuiz() {
  for (;;) {
    const answer = await page.evaluate(() => __ecoute.S.deck[__ecoute.S.idx].p);
    const opts = page.locator('.opt');
    for (let i = 0; i < await opts.count(); i++) {
      if ((await opts.nth(i).locator('.fr2').innerText()).trim() === answer) { await opts.nth(i).click(); break; }
    }
    const last = (await page.locator('#next').innerText()).includes('results');
    await page.locator('#next').click();
    if (last) return;
  }
}

/* record + submit every word of a mic round */
async function playSpeak() {
  for (let i = 0; i < 12; i++) {
    await page.locator('#recBtn').click();
    await page.waitForTimeout(250);
    await page.locator('#recBtn').click();
    await page.waitForFunction(() => !document.getElementById('pNext').disabled, null, { timeout: 15000 });
    const last = await page.evaluate(() => __ecoute.S.sidx === __ecoute.S.speakDeck.length - 1);
    await page.locator('#pNext').click();
    if (last) return;
  }
  throw new Error('speak round never ended');
}

t.section('the menu');
t.eq(await page.locator('.node').count(), 50, '30 sounds + 20 spoken chapters in the path');
t.eq(await page.locator('.node:not([disabled])').count(), 1, 'only lesson 1 is open at the start');
t.eq(await page.locator('.node').first().locator('.pip').count(), 3, 'lesson 1 shows three steps');
t.ok((await page.locator('#continueBtn').innerText()).includes('👂 Words'), 'Continue points at step 1');

t.section('lesson 1 · step 1 (listen to words)');
await page.locator('#continueBtn').click();
await page.waitForSelector('#quiz:visible');
t.ok((await page.locator('#levelLabel').innerText()).includes('👂 Words'), 'step 1 label');
await playQuiz();
await page.waitForSelector('#result:visible');
t.ok(await page.evaluate(() => __ecoute.currentIdx() === 0), 'lesson 2 still locked after only step 1');
t.ok((await page.locator('#nextLessonBtn').innerText()).includes('In context'), 'it offers step 2 next');

t.section('lesson 1 · step 2 (the same sound in context)');
await page.locator('#nextLessonBtn').click();
await page.waitForSelector('#quiz:visible');
const fresh = await page.evaluate(() => __ecoute.S.deck.filter((q) => !q.review).length);
t.ok(fresh >= 8, `step 2 is a full round, not three repeats of one sentence (${fresh} new questions)`);
await playQuiz();
await page.waitForSelector('#result:visible');
t.ok(await page.evaluate(() => __ecoute.lessonDone(__ecoute.LESSONS[0])), 'listening done -> lesson cleared');
t.ok(await page.evaluate(() => __ecoute.currentIdx() === 1), 'lesson 2 unlocked WITHOUT the mic step');
t.ok(!(await page.evaluate(() => __ecoute.lessonMastered(__ecoute.LESSONS[0]))), 'not mastered yet');

t.section('lesson 1 · step 3 (say it)');
await page.locator('#nextLessonBtn').click();
await page.waitForSelector('#pronounce:visible');
t.ok((await page.locator('#plabel').innerText()).includes('🎤'), 'mic step label');
await playSpeak();
await page.waitForSelector('#result:visible');
t.ok(await page.evaluate(() => __ecoute.lessonMastered(__ecoute.LESSONS[0])), 'the sound is mastered');
t.ok((await page.locator('#resultStats').innerText()).includes('mastered'), 'the result says so');

await page.locator('#result .btn.ghost').first().click();
await page.waitForSelector('#menu:visible');
t.ok((await page.locator('.node').first().getAttribute('class')).includes('gold'), 'lesson 1 is gold on the path');
t.eq(await page.locator('.node').first().locator('.pip.on').count(), 3, 'all three pips lit');

t.section('spoken chapters unlock alongside, and never gate a sound');
const chapter = page.locator('.node.law').first();
t.ok(await chapter.isDisabled(), 'the first chapter is locked at the start');
await page.evaluate(() => {
  const { lp, LESSONS, saveProgress, renderCourse } = __ecoute;
  for (let i = 0; i < 2; i++) { const r = lp(LESSONS[i].key); r.s1 = 100; r.s2 = 100; r.strength = 2; }
  saveProgress(); renderCourse();
});
t.ok(!(await chapter.isDisabled()), 'it opens after only 2 sounds');
t.ok(await page.evaluate(() => __ecoute.currentIdx() === 2), 'and lesson 3 is reachable with the chapter untouched');
t.ok((await chapter.innerText()).includes('⚖️'), 'the first chapter is a law one');
const office = page.locator('.node.law').nth(1);
t.ok((await office.innerText()).includes('💼'), 'the second is an Au bureau one — the tracks alternate');
await chapter.click();
await page.waitForSelector('#pronounce:visible');
t.eq(await page.evaluate(() => __ecoute.S.speakDeck.length), 5, 'a chapter holds 5 sentences');
await page.locator('#pronounce .btn.ghost').first().click();

t.section('the free levels still work, untouched by the course');
await page.waitForSelector('#menu:visible');
t.eq(await page.locator('.lvl:visible').count(), 6, 'all six free levels are visible without unfolding anything');
await page.locator('.lvl').first().click();
await page.waitForSelector('#quiz:visible');
t.eq(await page.evaluate(() => __ecoute.S.mode), 'free', 'a free level is not a lesson');
t.eq(await page.evaluate(() => __ecoute.S.deck.length), 20, 'Level 1 is still a 20-question round');
t.ok(await page.evaluate(() => __ecoute.S.deck.every((q) => !q.review)), 'free levels never inject course reviews');
await page.evaluate(() => { __ecoute.S.idx = __ecoute.S.deck.length - 1; __ecoute.finish(); });
await page.waitForSelector('#result:visible');
t.ok(await page.locator('#resultRemy').isHidden(), 'Rémy stays out of the free-level result');
t.eq(await page.locator('#retryBtn').innerText(), 'Try again', 'the retry button is not left over from a lesson');

t.section('updates reach an installed app');
await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 10000 });
t.ok(true, 'the service worker controls the page');
t.ok(await page.locator('#updBanner').isHidden(), 'no update banner on a first install');
await page.locator('#result .btn.ghost').first().click().catch(() => {});
await page.locator('#updCheck').click();
await page.waitForFunction(
  () => document.getElementById('updCheck').textContent.includes('Up to date'),
  null, { timeout: 20000 },
);
t.ok(true, '"Check for updates" reports an unchanged deploy as up to date');

t.ok(errors.length === 0, 'no uncaught JS errors' + (errors.length ? ': ' + errors.join('; ') : ''));

await browser.close();
stop();
t.done();
