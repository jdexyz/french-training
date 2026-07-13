/* The course engine: lesson structure, steps, gating, review and progress.

   Imports the app's real modules and drives the actual buildLessonDeck(),
   finishLesson(), currentIdx() — so these assertions break when the app breaks,
   not when a reimplementation of it drifts.

   The DOM stub has to be installed BEFORE the modules load: several of them wire
   up event handlers at import time, as any browser script would. */

import { installDom, suite } from './dom-stub.mjs';

installDom();

const course = await import('../js/course.js');
const lesson = await import('../js/lesson.js');
const { S } = await import('../js/state.js');

const {
  LESSONS, LAW_CHAPTERS, LAW_AFTER, PATH, ROMAN, LAW_SENTENCES_LEN,
  SESSION_LEN, SPEAK_STEP_LEN, PASS_MARK,
  speakItemsFor, buildLessonDeck, poolTier, tierFor,
  defaultProgress, loadProgress, saveProgress, setProgress,
  lp, lawRec, stepPassed, lessonDone, lessonMastered, lawDone, nextStep,
  doneCount, currentIdx, lawUnlocked, liveStreak, bumpStreak, todayStr, yesterdayStr,
} = { ...course, ...(await import('../js/util.js')) };
const { LAW_SENTENCES } = await import('../js/data.js');
const { startLesson, startLawLesson, finishLesson, finishCourseSpeak, recordAnswer } = lesson;

const t = suite('course engine');
const P = () => course.P;                       // live binding: re-read after a reset
const fresh = () => setProgress(defaultProgress());

const clearStep = (i, step, frac = 1) => {
  S.mode = 'lesson'; S.lessonIdx = i; S.lessonStep = step; S.courseCtx = null;
  S.deck = buildLessonDeck(i, step); S.idx = 0; S.missed = [];
  S.score = Math.round(S.deck.length * frac);
  finishLesson();
};
const clearListening = (i) => { clearStep(i, 1); if (LESSONS[i].stepB) clearStep(i, 2); };
const clearSpeak = (i, frac = 1) => {
  S.courseCtx = { type: 'speak', lesson: i }; S.lessonIdx = i; S.lessonStep = 3;
  S.speakDeck = speakItemsFor(LESSONS[i]).slice(0, SPEAK_STEP_LEN);
  S.spassed = Math.round(S.speakDeck.length * frac);
  finishCourseSpeak();
  S.courseCtx = null;
};

t.section('the path');
t.eq(LESSONS.length, 17, '17 sound lessons');
t.eq(LAW_CHAPTERS.length, 4, 'law sentences split into 4 chapters');
t.eq(LAW_CHAPTERS.reduce((s, c) => s + c.length, 0), LAW_SENTENCES.length, 'no law sentence lost in the split');
t.eq(PATH.filter((x) => x.type === 'sound').length, 17, 'path holds every sound');
t.eq(PATH.filter((x) => x.type === 'law').length, 4, 'path holds every law chapter');
t.note('path: ' + PATH.map((x) => (x.type === 'law' ? `[LAW ${ROMAN[x.c]}]` : x.i + 1)).join(' '));

t.section('every exercise lands in some step');
t.ok(LESSONS.every((L) => L.stepA && L.stepA.length), 'every lesson has a step-1 pool');
LESSONS.forEach((L) => {
  const total = L.pool[1].length + L.pool[2].length + L.pool[3].length;
  t.eq(L.stepA.length + (L.stepB ? L.stepB.length : 0), total, `${L.title}: nothing dropped`);
  if (L.stepB) t.ok(!L.stepB.some((q) => L.stepA.includes(q)), `${L.title}: step 2 never re-uses step-1 items`);
});
const noB = LESSONS.filter((L) => !L.stepB);
t.note('no "in context" step: ' + (noB.map((L) => L.title).join(', ') || 'none'));
t.ok(noB.every((L) => L.stepA.length === L.pool[1].length + L.pool[2].length + L.pool[3].length),
  'a lesson lacking step 2 has all its material in step 1');

t.section('a thin step-2 pool is topped up, not left as three identical questions');
fresh();
const thin = LESSONS.find((L) => L.stepB && L.stepB.length === 1);   // /a/ vs /o/: one sentence pair
if (thin) {
  const d = buildLessonDeck(LESSONS.indexOf(thin), 2).filter((q) => !q.review);
  t.ok(d.length >= 8, `${thin.title}: step 2 is a full round (${d.length} new questions)`);
  t.ok(d.some((q) => thin.stepB.some((x) => x.o[0] === q.o[0])), 'and it does contain the context item');
  t.ok(d.some((q) => thin.stepA.some((x) => x.o[0] === q.o[0])), 'topped up from the step-1 words');
}

t.section('the mic step knows what to listen for');
const si = speakItemsFor(LESSONS[0]);
t.ok(si.length >= 2, 'speak items built: ' + si.map((x) => x.w).join(', '));
t.ok(si.every((x) => x.ipa), 'every speak item carries IPA');
t.ok(si.every((x) => x.confusions.length), 'every speak item carries its minimal-pair confusion');
t.ok(speakItemsFor(LESSONS.find((L) => L.focus === '/s/ vs /z/')).every((x) => x.ipa),
  '/s/ vs /z/ has IPA despite having no Level-1 words');

t.section('listening clears the lesson; the mic step does NOT gate it');
fresh();
t.eq(currentIdx(), 0, 'start on lesson 1');
clearStep(0, 1);
t.ok(stepPassed(LESSONS[0], 1), 'step 1 passed');
t.ok(!lessonDone(LESSONS[0]), 'lesson not done — step 2 outstanding');
t.eq(currentIdx(), 0, 'lesson 2 still locked');
clearStep(0, 2);
t.ok(lessonDone(LESSONS[0]), 'both listening steps done -> lesson cleared');
t.eq(currentIdx(), 1, 'lesson 2 unlocked WITHOUT the mic step');
t.ok(!lessonMastered(LESSONS[0]), 'not mastered until the mic step');
t.eq(nextStep(LESSONS[0]), 3, 'the mic step is what remains');
t.eq(lp(LESSONS[0].key).strength, 1, 'a cleared sound enters review at strength 1');

t.section('the mic step masters the sound');
const g0 = P().gelato;
clearSpeak(0);
t.ok(lessonMastered(LESSONS[0]), 'lesson mastered');
t.eq(nextStep(LESSONS[0]), 0, 'nothing left');
t.ok(P().gelato > g0, `the mic step pays gelato: +${P().gelato - g0}`);
t.eq(lp(LESSONS[0].key).strength, 2, 'saying it aloud bumps strength');

t.section('a lesson with no step 2 goes straight 1 -> 3');
fresh();
const short = LESSONS.findIndex((L) => !L.stepB);
for (let i = 0; i < short; i++) clearListening(i);
t.eq(currentIdx(), short, `reached ${LESSONS[short].title}`);
clearStep(short, 1);
t.ok(lessonDone(LESSONS[short]), 'one listening step is enough when there is no second');
t.eq(nextStep(LESSONS[short]), 3, 'it offers the mic step next');
t.eq(currentIdx(), short + 1, 'and the next lesson unlocked');

t.section('failure clears nothing, and never takes progress away');
fresh();
clearStep(0, 1, 0.5);
t.ok(!stepPassed(LESSONS[0], 1), 'a 50% step does not pass');
t.eq(currentIdx(), 0, 'nothing unlocked');
t.eq(lp(LESSONS[0].key).s1, 0, 'no best score recorded for a failed step');
fresh();
clearListening(0);
clearSpeak(0, 0.5);
t.ok(!lessonMastered(LESSONS[0]), '50% on the mic does not master the sound');
t.ok(lessonDone(LESSONS[0]), 'but the lesson stays cleared');
t.eq(currentIdx(), 1, 'and the next lesson stays unlocked');

t.section('law chapters unlock alongside, and never gate a sound');
fresh();
t.ok(!lawUnlocked(0), 'law I locked at the start');
t.eq(LAW_AFTER[0], 5, 'law I appears after 5 sounds');
for (let i = 0; i < 5; i++) clearListening(i);
t.ok(lawUnlocked(0), 'law I unlocked');
t.ok(!lawUnlocked(1), 'law II still locked');
t.eq(currentIdx(), 5, 'lesson 6 available even though law I is untouched');
clearListening(5);
t.eq(currentIdx(), 6, 'skipping the law chapter does not stall the path');
const g1 = P().gelato;
S.courseCtx = { type: 'law', chapter: 0 };
S.speakDeck = LAW_CHAPTERS[0].slice();
S.spassed = S.speakDeck.length;
finishCourseSpeak();
S.courseCtx = null;
t.ok(lawDone(0), 'law I cleared');
t.eq(lawRec(0).best, 100, 'best recorded');
t.ok(P().gelato > g1, `law chapter pays gelato: +${P().gelato - g1}`);

t.section('spaced review');
fresh();
for (let i = 0; i < 5; i++) clearListening(i);
const d = buildLessonDeck(5, 1);
t.eq(d.length, SESSION_LEN, 'session is full length once there is something to review');
const revs = d.filter((q) => q.review);
t.ok(revs.length > 0, `reviews present: ${revs.length}`);
const learned = new Set(LESSONS.slice(0, 5).map((l) => l.key));
t.ok(revs.every((q) => learned.has(q.key)), 'reviews only come from cleared lessons');
t.ok(d.filter((q) => !q.review).every((q) => q.key === LESSONS[5].key), 'new items are the current contrast');

lp(LESSONS[0].key).strength = 1;
[1, 2, 3, 4].forEach((i) => { lp(LESSONS[i].key).strength = 5; });
let weak = 0, strong = 0;
for (let n = 0; n < 300; n++) {
  buildLessonDeck(5, 1).filter((q) => q.review).forEach((q) => {
    if (q.key === LESSONS[0].key) weak++; else strong++;
  });
}
t.ok(weak > strong / 2, `a strength-1 sound is drawn far more than any strength-5 one (weak=${weak})`);

t.section('strength moves only on reviews');
fresh();
clearListening(0);
const k0 = LESSONS[0].key;
lp(k0).strength = 3;
recordAnswer(k0, true, true);   t.eq(lp(k0).strength, 4, 'correct review -> +1');
recordAnswer(k0, false, true);  t.eq(lp(k0).strength, 3, 'wrong review -> -1');
recordAnswer(k0, false, false); t.eq(lp(k0).strength, 3, 'a drill inside the lesson does not move strength');
for (let i = 0; i < 9; i++) recordAnswer(k0, true, true);
t.eq(lp(k0).strength, 5, 'caps at 5');
for (let i = 0; i < 9; i++) recordAnswer(k0, false, true);
t.eq(lp(k0).strength, 1, 'floors at 1 for a learned sound');

t.section('harder material as a sound gets stronger');
t.eq(tierFor(0), 1, 'new sound -> single words');
t.eq(tierFor(3), 2, 'mid strength -> longer words');
t.eq(tierFor(5), 3, 'mastered -> sentences');
const withL3 = LESSONS.find((l) => l.pool[3].length);
t.ok(poolTier(withL3.pool, 3) === withL3.pool[3], 'tier 3 draws sentences when the contrast has them');
const noL1 = LESSONS.find((l) => !l.pool[1].length);
if (noL1) t.ok(poolTier(noL1.pool, 1).length > 0, 'a contrast with no L1 words falls back rather than going empty');

t.section('streak');
fresh();
t.eq(liveStreak(), 0, 'no practice -> no streak');
t.eq(bumpStreak(), true, 'first practice today counts');
t.eq(P().streak, 1, 'streak = 1');
t.eq(bumpStreak(), false, 'practising twice in a day does not double-count');
P().lastDay = yesterdayStr();
bumpStreak();
t.eq(P().streak, 2, 'consecutive day -> 2');
P().lastDay = '2020-01-01';
t.eq(liveStreak(), 0, 'a stale streak is dead');

t.section('progress persistence');
fresh();
clearListening(0);
P().gelato = 120; P().hour = 7;
saveProgress();
setProgress(loadProgress());
t.ok(lessonDone(LESSONS[0]), 'lesson state reloaded');
t.eq(P().gelato, 120, 'gelato reloaded');
t.eq(P().hour, 7, 'reminder hour reloaded');
// reset must actually reset: `lessons` used to alias the defaults object
setProgress(defaultProgress());
t.eq(doneCount(), 0, 'a fresh progress object shares nothing with the previous one');

t.section('records written before the course had steps still load');
localStorage.setItem('ecoute_progress_v1', JSON.stringify({
  v: 1, gelato: 300, streak: 3, lastDay: todayStr(),
  lessons: { [LESSONS[0].key]: { done: true, strength: 4, seen: 20, correct: 18, best: 92 } },
}));
setProgress(loadProgress());
t.eq(lp(LESSONS[0].key).s1, 92, 'an old cleared lesson keeps its score as step 1');
t.eq(lp(LESSONS[0].key).strength, 4, 'strength preserved');
t.eq(P().gelato, 300, 'gelato preserved');
t.ok(!lp(LESSONS[0].key).sp, 'the mic step is simply not done yet');

t.section('locked things stay locked');
setProgress(defaultProgress());
S.mode = 'free';
startLesson(6, 1);
t.eq(S.mode, 'free', 'startLesson on a locked lesson is a no-op');
S.courseCtx = null;
startLawLesson(3);
t.ok(!S.courseCtx, 'startLawLesson on a locked chapter is a no-op');

t.done();
