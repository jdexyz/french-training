/* The course controller: what a lesson step IS, and what finishing one does.

   Both kinds of step land here — the listening rounds via finishLesson(), the
   spoken ones via finishCourseSpeak() — and both settle through settleStep(), so
   the two can't drift apart on what a pass is worth or where it sends you next. */

import { S } from './state.js';
import { TRANS } from './data.js';
import { shuffle, escapeHtml } from './util.js';
import { speak } from './audio.js';
import { L as tr, lang, italianTipTitle } from './i18n.js';   // aliased: `L` is the lesson variable everywhere here
import { geminiKey } from './gemini.js';
import {
  LESSONS, CHAPTERS, FOUNDATIONS, speakItemsFor,
  PASS_MARK, SPEAK_PASS, SPEAK_STEP_LEN, FOUND_SPEAK_LEN,
  P, saveProgress, lp, chapterRec, stepPassed, lessonDone, lessonMastered, chapterDone,
  nextStep, doneCount, currentIdx, weakestIdx, bumpStreak, buildLessonDeck,
  liveStreak, chapterUnlocked,
  fRec, foundationLearned, foundationMastered, foundationsAllLearned,
  firstOpenFoundation, masteredFoundationCount,
} from './course.js';
import { show, render } from './quiz.js';
import { renderSpeak, showKeyPanel } from './speak.js';
import { renderCourse } from './menu.js';

const STEP_NAME = {1:'👂 Words', 2:'👂 In context', 3:'🎤 Speak it'};

// step 1/2 are listening rounds; step 3 hands off to the mic + Gemini flow
function startLesson(i, step){
  if(!foundationsAllLearned()) return;                            // the sounds are gated behind the Foundations
  if(i < 0 || i >= LESSONS.length || i > currentIdx()) return;   // out of range or still locked
  const L = LESSONS[i];
  step = step || nextStep(L) || 1;
  if(step === 2 && !L.stepB) step = 3;                            // this contrast has no middle step
  if(step === 3) return startSpeakStep(i);

  S.mode = 'lesson'; S.lessonIdx = i; S.lessonStep = step; S.courseCtx = null; S.level = 0;
  S.deck = buildLessonDeck(i, step);
  S.idx = 0; S.score = 0; S.missed = [];
  show('quiz');
  document.getElementById('levelLabel').textContent =
    `Lesson ${i+1} · ${L.title} — ${STEP_NAME[step]}`;
  render();
}

// step 3: reuse Level 4's recorder and grader, but on this lesson's own words
function startSpeakStep(i){
  const L = LESSONS[i];
  S.mode = 'lesson'; S.lessonIdx = i; S.lessonStep = 3; S.level = 4;
  S.courseCtx = { type:'speak', lesson:i };
  S.speakMode = 'words';
  document.getElementById('plabel').textContent = `Lesson ${i+1} · ${L.title} — 🎤 Speak it`;
  show('pronounce');
  if(!geminiKey()){ showKeyPanel(); return; }
  beginCourseSpeakDeck();
}

function startChapter(c){
  if(!chapterUnlocked(c)) return;
  S.mode = 'lesson'; S.lessonStep = 0; S.level = 5;
  S.courseCtx = { type:'chapter', chapter:c };
  S.speakMode = 'sentences';
  document.getElementById('plabel').textContent = CHAPTERS[c].title;
  show('pronounce');
  if(!geminiKey()){ showKeyPanel(); return; }
  beginCourseSpeakDeck();
}

/* ---- the Foundations: a 📖 Learn screen, then a 🎤 Say-it drill ----

   The 📖 step is the theory: read it, hear the examples, and confirm — that
   confirmation (learnFoundation) is what unlocks the next node, and it needs no
   Gemini key, so the course can never dead-end. The 🎤 step reuses the whole
   mic + grader flow through S.courseCtx, exactly like a sound lesson's step 3. */
function startFoundation(i){
  if(i < 0 || i >= FOUNDATIONS.length) return;
  if(i > firstOpenFoundation() && !foundationLearned(FOUNDATIONS[i])) return;   // still locked
  S.mode = 'lesson'; S.level = 0; S.courseCtx = null;
  renderLearn(i);
  show('learn');
}

// Build the theory screen for foundation i, in the chosen language (see i18n.js).
// body/tip strings carry the author's own <b> emphasis, so they're injected as
// HTML; the French/IPA/gloss are escaped.
function renderLearn(i){
  const f = FOUNDATIONS[i];
  document.getElementById('learnLabel').textContent = `${f.icon} ${f.title}`;
  document.getElementById('learnGoal').textContent = tr(f.goal);

  const exBtn = (e, bi, ei)=>
    `<button class="ex" data-b="${bi}" data-e="${ei}">
       <span class="ex-fr">${escapeHtml(e.fr)}</span>
       <span class="ex-ipa">/${escapeHtml(e.ipa)}/</span>
       ${e.it ? `<span class="ex-it">🇮🇹 ${escapeHtml(e.it)}</span>` : ''}
       <span class="ex-spk" aria-hidden="true">🔊</span>
     </button>`;

  const theory = f.theory.map((blk, bi)=>
    `<div class="learn-block">
       <h3>${escapeHtml(tr(blk.h))}</h3>
       <p>${tr(blk.body)}</p>
       ${blk.ex && blk.ex.length ? `<div class="ex-grid">${blk.ex.map((e, ei)=> exBtn(e, bi, ei)).join('')}</div>` : ''}
     </div>`).join('');

  // the pronunciation tip written from an Italian speaker's point of view
  const tip = tr(f.italian);
  const tipHtml = tip
    ? `<div class="italian-tip"><h4>🇮🇹 ${escapeHtml(italianTipTitle())}</h4><p>${tip}</p></div>`
    : '';

  document.getElementById('learnBody').innerHTML = theory + tipHtml;

  // each example says itself when tapped
  document.querySelectorAll('#learnBody .ex').forEach(btn=>{
    btn.onclick = ()=>{
      const e = f.theory[+btn.dataset.b].ex[+btn.dataset.e];
      speak(e.fr, false);
    };
  });

  const speakBtn = document.getElementById('learnSpeak');
  const learned = foundationLearned(f);
  speakBtn.textContent = learned
    ? (lang() === 'it' ? '🎤 Esercitati a pronunciarla →' : '🎤 Practise saying it →')
    : (lang() === 'it' ? '🎤 Ho capito — pronunciala! →' : '🎤 Got it — say it out loud →');
  speakBtn.onclick = ()=> learnFoundation(i);
}

// Confirming the theory grants the 📖 step (once), then hands off to the drills.
function learnFoundation(i){
  const f = FOUNDATIONS[i];
  const rec = fRec(f.id);
  const first = !rec.learned;
  rec.learned = true;
  if(first){ P.gelato += 30; bumpStreak(); }
  saveProgress();
  renderCourse();
  startFoundationSpeak(i);
}

// The 🎤 Say-it step: the same recorder + Gemini grader, on this foundation's
// drills. Like a sound lesson's mic step, it's optional and never gates.
function startFoundationSpeak(i){
  const f = FOUNDATIONS[i];
  S.mode = 'lesson'; S.level = 4; S.lessonStep = 0;
  S.courseCtx = { type:'foundation', f:i };
  S.speakMode = f.drills.mode;                       // 'words' (the alphabet) or 'sentences'
  document.getElementById('plabel').textContent = `${f.icon} ${f.title} — 🎤 Say it`;
  show('pronounce');
  if(!geminiKey()){ showKeyPanel(); return; }
  beginCourseSpeakDeck();
}

function beginCourseSpeakDeck(){
  document.getElementById('keyPanel').style.display = 'none';
  document.getElementById('sentencePanel').style.display = 'none';
  document.getElementById('speakPanel').style.display = '';
  if(S.courseCtx.type === 'chapter')
    S.speakDeck = CHAPTERS[S.courseCtx.chapter].items.slice();
  else if(S.courseCtx.type === 'foundation')
    S.speakDeck = shuffle(FOUNDATIONS[S.courseCtx.f].drills.items.slice()).slice(0, FOUND_SPEAK_LEN);
  else
    S.speakDeck = shuffle(speakItemsFor(LESSONS[S.courseCtx.lesson])).slice(0, SPEAK_STEP_LEN);
  S.sidx = 0; S.spassed = 0; S.sresults = []; S.passedSet = new Set();
  renderSpeak();
}

// called from choose() on every answer inside a listening step
function recordAnswer(key, ok, isReview){
  if(!key) return;
  const rec = lp(key);
  rec.seen++;
  if(ok) rec.correct++;
  // Only reviews move strength: the lesson's own drills are how you learn it,
  // reviews are the test of whether it stuck.
  if(isReview && lessonDone(LESSONS.find(l=>l.key===key) || {key})){
    rec.strength = ok ? Math.min(5, rec.strength + 1) : Math.max(1, rec.strength - 1);
  }
}

/* One place decides what a finished course step is worth and what happens next,
   so the listening steps and the spoken ones can't drift apart. */
function settleStep({ L, step, passed, pct, scoreText, remyLine, detail, gelato }){
  const wasDone = lessonDone(L);
  const rec = lp(L.key);
  const field = step === 1 ? 's1' : step === 2 ? 's2' : 'sp';
  if(passed) rec[field] = Math.max(rec[field]||0, Math.round(pct*100));

  const nowDone = lessonDone(L);
  const firstClear = nowDone && !wasDone;
  if(firstClear) rec.strength = Math.max(1, rec.strength);
  else if(passed && step === 3) rec.strength = Math.min(5, rec.strength + 1);   // saying it is real proof

  P.gelato += gelato;
  const grew = bumpStreak();
  saveProgress();

  document.getElementById('finalScore').textContent = scoreText;
  document.getElementById('resultMsg').textContent = detail;
  document.getElementById('resultRemy').style.display = '';
  document.getElementById('resultRemyLine').innerHTML = remyLine;
  document.getElementById('resultStats').innerHTML =
    `<span class="stat">+${gelato} 🍨</span>` +
    `<span class="stat${liveStreak()?' hot':''}">🔥 ${liveStreak()} day${liveStreak()===1?'':'s'}${grew?' · +1':''}</span>` +
    `<span class="stat">🎓 ${doneCount()} / ${LESSONS.length}</span>` +
    (lessonMastered(L) ? `<span class="stat gold">★ mastered</span>` : '');

  const retry = document.getElementById('retryBtn');
  retry.className = passed ? 'btn ghost' : 'btn';
  retry.textContent = passed ? 'Repeat step' : 'Try again';
  retry.onclick = ()=> startLesson(S.lessonIdx, step);

  // Where next? The lesson's own next step if it has one, else the next lesson.
  const next = document.getElementById('nextLessonBtn');
  const remaining = nextStep(L);
  if(passed && remaining){
    next.style.display = '';
    next.textContent = `Step ${remaining} → ${STEP_NAME[remaining]}`;
    next.onclick = ()=> startLesson(S.lessonIdx, remaining);
  } else if(passed && S.lessonIdx + 1 < LESSONS.length){
    const n = S.lessonIdx + 1;
    next.style.display = '';
    next.textContent = `Lesson ${n+1} → ${LESSONS[n].title}`;
    next.onclick = ()=> startLesson(n);
  } else if(passed){
    next.style.display = '';
    next.textContent = '🎓 Review a sound';
    next.onclick = ()=> startLesson(weakestIdx(), 1);
  } else {
    next.style.display = 'none';
  }

  renderCourse();
}

function finishLesson(){
  const L = LESSONS[S.lessonIdx];
  const step = S.lessonStep;
  const pct = S.deck.length ? S.score/S.deck.length : 0;
  const passed = pct >= PASS_MARK;
  const willFinishLesson = passed && !lessonDone(L) && !nextStepAfter(L, step);

  settleStep({
    L, step, passed, pct,
    scoreText: `${S.score} / ${S.deck.length}`,
    gelato: S.score*10 + (passed ? 50 : 0),
    detail: passed
      ? (willFinishLesson
          ? `Sound learned. ${L.title} will keep coming back in later lessons so it doesn't fade.`
          : `${STEP_NAME[step]} cleared.`)
      : `A step needs ${Math.round(PASS_MARK*100)}% to clear. Replay each prompt with 🐢 Slow and listen for the vowel alone.`,
    remyLine: passed
      ? (willFinishLesson
          ? `<b>Bravo !</b> ${escapeHtml(L.focus)} — you can hear it now. On le dit à voix haute ?`
          : `<b>Très bien.</b> ${escapeHtml(L.focus)} is landing.`)
      : `<b>Presque !</b> ${escapeHtml(L.focus)} is a stubborn one. On recommence ?`,
  });

  const ml = document.getElementById('missedList');
  if(S.missed.length){
    ml.innerHTML = `<p style="color:var(--muted);margin:0 0 8px">Sounds to review:</p>` +
      S.missed.map(m=>`<div style="padding:8px 12px;background:var(--card2);border-radius:10px;margin-bottom:6px">
        <span style="color:var(--accent2)">${escapeHtml(m.p)}</span>${TRANS[m.p]?` <span style="color:var(--muted);font-style:italic">— 🇮🇹 ${escapeHtml(TRANS[m.p])}</span>`:''}<br>
        <span style="color:var(--muted);font-size:.85rem">${escapeHtml(m.ipa)} · ${escapeHtml(m.focus)}</span></div>`).join('');
  } else {
    ml.innerHTML = `<p style="color:var(--good);text-align:center">Not one mistake. 🎉</p>`;
  }
}

// would clearing `step` still leave a *listening* step outstanding?
function nextStepAfter(L, step){
  if(step === 1 && L.stepB && !stepPassed(L,2)) return 2;
  return 0;
}

/* The 🎤 steps and the ⚖️ law chapters both land here from finishSpeak(). */
function finishCourseSpeak(){
  const pct = S.speakDeck.length ? S.spassed/S.speakDeck.length : 0;
  const passed = pct >= SPEAK_PASS;

  if(S.courseCtx.type === 'chapter'){
    const c = S.courseCtx.chapter;
    const ch = CHAPTERS[c];
    const rec = chapterRec(c);
    const first = passed && !chapterDone(c);
    if(passed) rec.best = Math.max(rec.best, Math.round(pct*100));
    const gelato = S.spassed*20 + (passed ? 100 : 0);
    P.gelato += gelato;
    const grew = bumpStreak();
    saveProgress();

    document.getElementById('finalScore').textContent = `${S.spassed} / ${S.speakDeck.length}`;
    document.getElementById('resultMsg').textContent = passed
      ? (ch.kind === 'law'
          ? `Chapter cleared. Reading legal French aloud is the hardest thing in this app.`
          : `Chapter cleared. That is the French you'll actually speak all day.`)
      : `You need ${Math.round(SPEAK_PASS*100)}% of the sentences to pass. Hear each one first, then copy its rhythm.`;
    document.getElementById('resultRemy').style.display = '';
    document.getElementById('resultRemyLine').innerHTML = passed
      ? (first
          ? (ch.kind === 'law'
              ? `<b>Maître du barreau !</b> ${escapeHtml(ch.title)} is yours.`
              : `<b>Comme au bureau !</b> ${escapeHtml(ch.title)} is yours — that's a real working day.`)
          : `<b>Toujours net.</b> Nothing has slipped.`)
      : `<b>Courage !</b> Long sentences are a marathon. Écoute, puis répète.`;
    document.getElementById('resultStats').innerHTML =
      `<span class="stat">+${gelato} 🍨</span>` +
      `<span class="stat${liveStreak()?' hot':''}">🔥 ${liveStreak()} day${liveStreak()===1?'':'s'}${grew?' · +1':''}</span>` +
      `<span class="stat">🗣️ ${CHAPTERS.filter((_,x)=>chapterDone(x)).length} / ${CHAPTERS.length}</span>`;

    const retry = document.getElementById('retryBtn');
    retry.className = passed ? 'btn ghost' : 'btn';
    retry.textContent = passed ? 'Repeat chapter' : 'Try again';
    retry.onclick = ()=> startChapter(c);

    const next = document.getElementById('nextLessonBtn');
    const cur = currentIdx();
    if(passed && cur < LESSONS.length){
      next.style.display = '';
      next.textContent = `Lesson ${cur+1} → ${LESSONS[cur].title}`;
      next.onclick = ()=> startLesson(cur);
    } else next.style.display = 'none';

    renderCourse();
    return;
  }

  if(S.courseCtx.type === 'foundation'){
    const fi = S.courseCtx.f;
    const f = FOUNDATIONS[fi];
    const rec = fRec(f.id);
    const first = passed && rec.sp < SPEAK_PASS*100;
    if(passed) rec.sp = Math.max(rec.sp, Math.round(pct*100));
    const gelato = S.spassed*15 + (passed ? 60 : 0);
    P.gelato += gelato;
    const grew = bumpStreak();
    saveProgress();

    const it = lang() === 'it';
    document.getElementById('finalScore').textContent = `${S.spassed} / ${S.speakDeck.length}`;
    document.getElementById('resultMsg').textContent = passed
      ? (it ? `${f.title} — ora sai dirla, non solo leggerla.`
            : `${f.title} — you can say it now, not just read it.`)
      : (it ? `Ti serve il ${Math.round(SPEAK_PASS*100)}% per la maestria. Tocca 🔊 Ascolta, poi imitala da vicino. (La regola è già imparata — questo aggiunge solo la maestria.)`
            : `You need ${Math.round(SPEAK_PASS*100)}% to master this. Tap 🔊 Hear it, then copy it closely. (The rule is already learned — this only adds mastery.)`);
    document.getElementById('resultRemy').style.display = '';
    document.getElementById('resultRemyLine').innerHTML = passed
      ? (first ? `<b>★ Bien dit !</b> ${escapeHtml(f.title)} — ${it ? 'maîtrisé. La tua bocca è d\'accordo con la regola.' : 'mastered. Your mouth agrees with the rule.'}`
               : `<b>Toujours net.</b> ${escapeHtml(f.title)} ${it ? 'sempre solida.' : 'still solid.'}`)
      : `<b>Presque !</b> ${it ? 'Rileggi gli esempi, écoute, puis répète.' : 'Relis les exemples, écoute, puis répète.'}`;
    document.getElementById('resultStats').innerHTML =
      `<span class="stat">+${gelato} 🍨</span>` +
      `<span class="stat${liveStreak()?' hot':''}">🔥 ${liveStreak()} day${liveStreak()===1?'':'s'}${grew?' · +1':''}</span>` +
      `<span class="stat">📖 ${masteredFoundationCount()} / ${FOUNDATIONS.length}</span>` +
      (foundationMastered(f) ? `<span class="stat gold">★ mastered</span>` : '');

    const retry = document.getElementById('retryBtn');
    retry.className = passed ? 'btn ghost' : 'btn';
    retry.textContent = passed ? 'Repeat drill' : 'Try again';
    retry.onclick = ()=> startFoundationSpeak(fi);

    // The 📖 step already unlocked what's next, so always offer the way forward.
    const next = document.getElementById('nextLessonBtn');
    next.style.display = '';
    if(fi + 1 < FOUNDATIONS.length){
      next.textContent = `Next → ${FOUNDATIONS[fi+1].icon} ${FOUNDATIONS[fi+1].title}`;
      next.onclick = ()=> startFoundation(fi + 1);
    } else {
      next.textContent = `🎓 On to the sounds → ${LESSONS[0].title}`;
      next.onclick = ()=> startLesson(0, 1);
    }

    renderCourse();
    return;
  }

  // 🎤 step of a sound lesson
  const L = LESSONS[S.courseCtx.lesson];
  settleStep({
    L, step:3, passed, pct,
    scoreText: `${S.spassed} / ${S.speakDeck.length}`,
    gelato: S.spassed*15 + (passed ? 80 : 0),
    detail: passed
      ? `${L.title} — heard AND spoken. That sound is yours.`
      : `You need ${Math.round(SPEAK_PASS*100)}% of the words to clear this. Tap 🔊 Hear it, then copy the vowel exactly.`,
    remyLine: passed
      ? `<b>★ Maîtrisé !</b> ${escapeHtml(L.focus)} — your mouth agrees with your ear.`
      : `<b>Pas encore.</b> ${escapeHtml(L.focus)} is harder to say than to hear. Réessaie !`,
  });
}

export {
  STEP_NAME, startLesson, startSpeakStep, startChapter, beginCourseSpeakDeck,
  startFoundation, renderLearn, learnFoundation, startFoundationSpeak,
  recordAnswer, settleStep, finishLesson, nextStepAfter, finishCourseSpeak,
};
