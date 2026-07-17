/* Rémy's course, and the learner's progress through it.

   The course is DERIVED from the exercise data, not written out by hand: every
   question already carries a `focus` like "/u/ vs /y/", so the contrast IS the
   lesson id. Add a minimal pair to js/data.js and it joins the right lesson.

   Progress lives here too, because the two are inseparable — "what is lesson 6"
   and "have you cleared lesson 6" are the same question asked twice. */

import { LEVEL1, LEVEL2, LEVEL3, TRANS, LAW_SENTENCES, OFFICE_SENTENCES } from './data.js';
import { FOUNDATIONS } from './foundations.js';
import { shuffle, dayStr, todayStr, yesterdayStr } from './util.js';

// Called when a round lands, so the reminder backend can skip tonight's nudge.
// A hook rather than an import: js/app.js owns the push code and imports THIS
// module, and a cycle between them would be gratuitous.
let onPractised = () => {};
export function setOnPractised(fn){ onPractised = fn; }

/* =========================================================================
   LEVEL 4 — SPEAK · record the user's voice and ask Gemini to grade it.
   - Key: pasted once, kept in localStorage, sent straight to Google.
   - Audio: captured via Web Audio and encoded to 16-bit mono WAV @16kHz
            (a format Gemini accepts on every browser, unlike webm/opus).
   ========================================================================= */

// build word -> IPA map from the Level-1 ipa strings ("chat /ʃa/ · chien /ʃjɛ̃/")
function buildIpaMap(levels){
  const m = {};
  levels.forEach(arr=> arr.forEach(q=>{
    (q.ipa||'').split('·').forEach(seg=>{
      const mt = seg.trim().match(/^(.+?)\s*\/(.+)\/$/);
      if(mt) m[mt[1].trim()] = mt[2].trim();
    });
  }));
  return m;
}
// Built from all three levels: the course's 🎤 step needs IPA for words that only
// appear in Level 2 (the /s/ vs /z/ contrast has no single-syllable pair at all).
const IPA_MAP = buildIpaMap([LEVEL1, LEVEL2, LEVEL3]);
// each word keeps the minimal-pair neighbour(s) it's easily confused with, so
// Gemini can be told exactly which vowel drift to listen for.
const L1_WORDS = (()=>{
  const map = new Map();
  LEVEL1.forEach(q=> q.o.forEach((w,i)=>{
    if(!map.has(w)) map.set(w, {w, ipa: IPA_MAP[w]||'', it: TRANS[w]||'', confusions:[]});
    const other = q.o[q.o.length-1-i];
    const e = map.get(w);
    if(other && other!==w && !e.confusions.some(c=>c.w===other))
      e.confusions.push({w:other, ipa: IPA_MAP[other]||''});
  }));
  return [...map.values()];
})();

/* =========================================================================
   RÉMY'S COURSE — the app's memory, a lesson path, and spaced review.

   A "lesson" is one sound contrast (/u/ vs /y/, /ɔ̃/ vs /ɑ̃/ …). Lessons are
   derived from the same data the free levels use — every question already
   carries a `focus` like "/u/ vs /y/", so the contrast IS the lesson id.

   The course is what makes the app remember you:
   - clear a lesson (80%) and the next one unlocks;
   - every later session quietly mixes in the sounds you've already learned,
     picked more often the weaker they are, and drawn from harder material
     (word → longer word → sentence) as they get stronger.
   Everything lives in localStorage — no account, no server.
   ========================================================================= */

// "/u/ vs /y/" and "/y/ vs /u/" are the same lesson; canonicalise to one id.
function contrastKey(focus){
  const m = String(focus||'').match(/\/\s*([^/]+?)\s*\/\s*vs\s*\/\s*([^/]+?)\s*\//);
  return m ? [m[1], m[2]].sort().join('~') : null;
}

// contrast id -> {1:[word items], 2:[longer words], 3:[sentences]}
const POOLS = (()=>{
  const p = {};
  [[1,LEVEL1],[2,LEVEL2],[3,LEVEL3]].forEach(([tier, arr])=>{
    arr.forEach(q=>{
      const k = contrastKey(q.focus);
      if(!k) return;
      (p[k] || (p[k] = {1:[],2:[],3:[]}))[tier].push(q);
    });
  });
  return p;
})();

// Teaching order: easy oral vowels first, the four nasals last — they're the
// contrasts that stay hard longest, and they lean on the oral ones underneath.
const COURSE_ORDER = [
  // oral vowels — the ones an Italian ear already half-hears
  '/a/ vs /o/', '/i/ vs /e/', '/e/ vs /ɛ/', '/u/ vs /o/', '/u/ vs /y/',
  '/i/ vs /y/', '/ø/ vs /o/', '/u/ vs /ø/', '/œ/ vs /ø/',
  '/o/ vs /ɔ/', '/ə/ vs /e/', '/ə/ vs /ø/',
  // consonants — voicing first, then the sibilants, then R against L
  '/p/ vs /b/', '/t/ vs /d/', '/k/ vs /g/', '/f/ vs /v/',
  '/s/ vs /z/', '/ʃ/ vs /ʒ/', '/s/ vs /ʃ/', '/m/ vs /n/', '/ʁ/ vs /l/',
  // nasals last: they stay hard longest, and they lean on the oral vowels below
  '/a/ vs /ɑ̃/', '/o/ vs /ɔ̃/', '/ɛ/ vs /ɛ̃/', '/ɛ̃/ vs /ɔ̃/', '/ɔ̃/ vs /ɑ̃/',
  '/ɛ̃/ vs /ɑ̃/', '/wa/ vs /wɛ̃/', '/i/ vs /ɑ̃/', '/a/ vs /jɛ̃/',
];

/* Each sound lesson runs in up to three steps:
     1 · 👂 Words       — hear the contrast in isolation      (Level 1 material)
     2 · 👂 In context  — hear it inside longer words/sentences (Level 2 + 3)
     3 · 🎤 Speak it    — say it yourself, graded by Gemini    (Level 4's grader)

   Step 2 only exists when the contrast HAS longer material — a few (cou/queue,
   lit/les) live only as single words, and a fake second step drawn from the same
   handful of pairs would just be step 1 again.

   Step 3 is optional by design: it needs a Gemini key, and the course must never
   dead-end someone who doesn't have one. It pays extra gelato and takes the sound
   to mastery instead. */
const LESSONS = COURSE_ORDER.map(focus=>{
  const key = contrastKey(focus);
  const pool = POOLS[key];
  if(!pool) return null;                                   // contrast not in the data
  const sample = pool[1][0] || pool[2][0] || pool[3][0];

  // step 1 = the shortest material there is; step 2 = everything longer than that
  const a = pool[1].length ? pool[1] : (pool[2].length ? pool[2] : pool[3]);
  let b = [];
  if(a !== pool[3]) b = b.concat(pool[3]);
  if(a !== pool[2]) b = b.concat(pool[2]);

  return { key, focus, title: sample.o.join(' / '), pool, stepA:a, stepB:b.length ? b : null };
}).filter(Boolean);

// The 🎤 step for a lesson: every distinct word of the contrast, each carrying the
// minimal-pair neighbour it gets confused with, which is what the grader listens for.
function speakItemsFor(L){
  const map = new Map();
  L.stepA.forEach(q=> q.o.forEach((w,i)=>{
    if(!map.has(w)) map.set(w, {w, ipa: IPA_MAP[w]||'', it: TRANS[w]||'', confusions:[]});
    const other = q.o[q.o.length-1-i];
    const e = map.get(w);
    if(other && other!==w && !e.confusions.some(c=>c.w===other))
      e.confusions.push({w:other, ipa: IPA_MAP[other]||''});
  }));
  return [...map.values()];
}

/* The spoken chapters — the other half of the course.

   Two tracks, because a lawyer arriving in a Paris firm needs both and only one
   of them is taught anywhere: ⚖️ the language of the law, and 💼 the language of
   the working day (the phone, the deadline, the printer, the coffee).

   They alternate down the path and unlock alongside the sounds, roughly one
   every two lessons. Like the 🎤 step they need a Gemini key, so they never gate
   a sound — an ignored chapter can't stall the course. */
const CHAPTER_LEN = 5;

function chaptersOf(sentences, kind, icon, name){
  const out = [];
  for(let i=0; i<sentences.length; i+=CHAPTER_LEN)
    out.push({ kind, icon, name, items: sentences.slice(i, i+CHAPTER_LEN) });
  return out;
}

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'];

const CHAPTERS = (()=>{
  const law = chaptersOf(LAW_SENTENCES, 'law', '⚖️', 'Law aloud');
  const office = chaptersOf(OFFICE_SENTENCES, 'office', '💼', 'Au bureau');
  // interleave, so you never read six legal texts in a row
  const out = [];
  for(let i=0; i<Math.max(law.length, office.length); i++){
    if(law[i]) out.push(law[i]);
    if(office[i]) out.push(office[i]);
  }
  return out.map((c, i)=>{
    const nth = out.slice(0, i+1).filter(x=>x.kind === c.kind).length;
    return { ...c, title: `${c.icon} ${c.name} ${ROMAN[nth-1] || nth}` };
  });
})();

// Spread the chapters evenly across the sounds rather than piling the leftovers
// at the end: with 29 lessons and 20 chapters that lands one every ~1.5 lessons.
const CHAPTER_AFTER = CHAPTERS.map((_, c)=>
  Math.min(LESSONS.length, Math.max(1, Math.ceil((c + 1) * LESSONS.length / CHAPTERS.length))));

// The path the learner actually sees: the sounds, with the spoken chapters
// slotted in between them.
const PATH = (()=>{
  // The Foundations come first and gate the sounds: you learn to read the
  // letters and the spelling rules before you drill the vowel contrasts.
  const nodes = FOUNDATIONS.map((_, f)=> ({ type:'foundation', f }));
  LESSONS.forEach((L, i)=>{
    nodes.push({ type:'sound', i });
    CHAPTER_AFTER.forEach((after, c)=>{ if(after === i+1) nodes.push({ type:'chapter', c }); });
  });
  return nodes;
})();

const SESSION_LEN = 12;
const PASS_MARK = 0.8;          // listening steps
const SPEAK_PASS = 0.7;         // spoken steps — a mild accent shouldn't fail you
const SPEAK_STEP_LEN = 6;       // words in a 🎤 step
const FOUND_SPEAK_LEN = 8;      // drill items in a foundation's 🎤 Say-it step

/* ---- stored progress ---- */
const PKEY = 'ecoute_progress_v1';
// A factory, not a shared constant: `lessons` must be a fresh object every time,
// or lp() would write the learner's records into the defaults themselves.
function defaultProgress(){
  return { v:4, gelato:0, streak:0, bestStreak:0, lastDay:null, lessons:{}, chapters:{}, foundations:{}, hour:19, push:false };
}
export let P = loadProgress();

function loadProgress(){
  let raw = {};
  try{ raw = JSON.parse(localStorage.getItem(PKEY) || '{}') || {}; }catch(e){}
  const p = Object.assign(defaultProgress(), raw);
  p.lessons = Object.assign({}, raw.lessons || {});
  p.chapters = Object.assign({}, raw.chapters || {});
  p.foundations = Object.assign({}, raw.foundations || {});
  // Migration: the Foundations were added after the sounds. A learner who was
  // already partway through the sounds should NOT find the whole path suddenly
  // re-locked behind them — grandfather the Foundations in as already learned.
  if(raw.foundations === undefined){
    const hadProgress = raw.lessons && Object.values(raw.lessons).some(r=> r && (r.done || r.s1 || r.s2 || r.sp || r.best));
    if(hadProgress) FOUNDATIONS.forEach(f=>{ p.foundations[f.id] = { learned:true, sp:0 }; });
  }
  return p;
}
// Reset and the tests need to swap the whole object; an imported binding can't
// be assigned from outside, so hand them a setter.
function setProgress(next){ P = next; }

function saveProgress(){
  try{ localStorage.setItem(PKEY, JSON.stringify(P)); }catch(e){}
}

// Per-lesson record. s1/s2/sp hold the best score on each step (0 = never passed);
// strength 0-5 drives how often — and how hard — a learned sound comes back.
function lp(key){
  const r = P.lessons[key] || (P.lessons[key] = {strength:0, seen:0, correct:0, s1:0, s2:0, sp:0});
  // records written by v1 of the course, before steps existed
  if(r.s1 === undefined){ r.s1 = r.done ? (r.best||PASS_MARK*100) : 0; r.s2 = 0; r.sp = 0; }
  return r;
}
function chapterRec(c){ return P.chapters[c] || (P.chapters[c] = {best:0}); }

/* ---- the Foundations: the alphabet and the spelling-to-sound rules ----
   A foundation has two steps: 📖 Learn (reading the theory — free, and what
   gates the next node) and 🎤 Say it (the drills — optional, needs a Gemini
   key, and what takes it to mastery). `learned` is the gate; `sp` is the best
   spoken score. They unlock in order and, together, gate the first sound. */
function fRec(id){ return P.foundations[id] || (P.foundations[id] = { learned:false, sp:0 }); }
function foundationLearned(f){ return !!fRec(f.id).learned; }
function foundationMastered(f){ return foundationLearned(f) && fRec(f.id).sp >= SPEAK_PASS*100; }
function foundationsAllLearned(){ return FOUNDATIONS.every(foundationLearned); }
function foundationUnlocked(i){ return i === 0 || foundationLearned(FOUNDATIONS[i-1]); }
// the first foundation still to be learned (clamped, so it's always a real index)
function firstOpenFoundation(){
  const i = FOUNDATIONS.findIndex(f=> !foundationLearned(f));
  return i < 0 ? FOUNDATIONS.length - 1 : i;
}
function learnedFoundationCount(){ return FOUNDATIONS.filter(foundationLearned).length; }
function masteredFoundationCount(){ return FOUNDATIONS.filter(foundationMastered).length; }

function stepPassed(L, step){
  const r = lp(L.key);
  if(step === 1) return r.s1 >= PASS_MARK*100;
  if(step === 2) return !L.stepB || r.s2 >= PASS_MARK*100;   // no step 2 => nothing to fail
  return r.sp >= SPEAK_PASS*100;
}
// "done" = the listening is solid. That's what unlocks the next sound.
function lessonDone(L){ return stepPassed(L,1) && stepPassed(L,2); }
// "mastered" = done, and you can say it too.
function lessonMastered(L){ return lessonDone(L) && stepPassed(L,3); }
function chapterDone(c){ return chapterRec(c).best >= SPEAK_PASS*100; }

// The next step of a lesson that still needs doing (0 if the lesson is fully done).
function nextStep(L){
  if(!stepPassed(L,1)) return 1;
  if(!stepPassed(L,2)) return 2;
  if(!stepPassed(L,3)) return 3;
  return 0;
}

function doneCount(){ return LESSONS.filter(lessonDone).length; }
function masteredCount(){ return LESSONS.filter(lessonMastered).length; }
function currentIdx(){
  for(let i=0;i<LESSONS.length;i++) if(!lessonDone(LESSONS[i])) return i;
  return LESSONS.length;                                   // every sound cleared
}
function chapterUnlocked(c){ return doneCount() >= CHAPTER_AFTER[c]; }
function weakestIdx(){
  let at = 0, low = 99;
  LESSONS.forEach((l,i)=>{ const s = lp(l.key).strength; if(s < low){ low = s; at = i; } });
  return at;
}

// The streak as it stands *now* — a stored streak you didn't feed yesterday is dead.
function liveStreak(){
  if(!P.lastDay) return 0;
  return (P.lastDay === todayStr() || P.lastDay === yesterdayStr()) ? (P.streak||0) : 0;
}
function bumpStreak(){
  const t = todayStr();
  if(P.lastDay === t) return false;                        // already counted today
  P.streak = (P.lastDay === yesterdayStr()) ? (P.streak||0) + 1 : 1;
  P.lastDay = t;
  P.bestStreak = Math.max(P.bestStreak||0, P.streak);
  onPractised();                                           // tell the server to stay quiet tonight
  return true;
}

/* ---- building a lesson's deck ---- */
function poolTier(pool, want){
  const order = want===3 ? [3,2,1] : want===2 ? [2,3,1] : [1,2,3];
  for(const t of order) if(pool[t] && pool[t].length) return pool[t];
  return [];
}
// stronger sound -> harder material: single word, then longer word, then sentence
function tierFor(strength){ return strength >= 5 ? 3 : strength >= 3 ? 2 : 1; }

// Some contrasts only have one or two minimal pairs. Cycling the pool is fine:
// render() re-randomises which half of the pair is spoken, so a repeat is a new
// question, not the same one twice.
function drawFrom(list, n){
  const out = [];
  while(out.length < n && list.length){
    for(const it of shuffle(list)){
      if(out.length >= n) break;
      out.push(it);
    }
  }
  return out;
}
function mkQ(q, key, review){
  return { o:q.o.slice(), focus:q.focus, ipa:q.ipa, key, review };
}

/* The new material for a step.

   Step 2 is the awkward one: a contrast like /a/ vs /o/ has exactly ONE sentence
   pair in the data, so drawing step 2 purely from the "in context" pool gave a
   3-question round of the same sentence three times. Instead we drill the context
   items (cycled, but at least four questions' worth) and top the round up with the
   step-1 words — which is what "the same sound, now in context" should feel like
   anyway. Contrasts with plenty of context material never reach the top-up. */
function newItemsFor(L, step, n){
  if(step !== 2 || !L.stepB) return drawFrom(L.stepA, n);
  const ctx = drawFrom(L.stepB, Math.min(n, Math.max(4, L.stepB.length*2)));
  const rest = n - ctx.length;
  return rest > 0 ? ctx.concat(drawFrom(L.stepA, rest)) : ctx;
}

function buildLessonDeck(i, step){
  const L = LESSONS[i];
  const own = (step === 2 && L.stepB) ? L.stepB : L.stepA;
  const newCount = Math.min(8, own.length >= 4 ? 8 : Math.max(step === 2 ? 8 : 3, own.length*3));
  const fresh = newItemsFor(L, step, newCount).map(q=>mkQ(q, L.key, false));

  // Review: sounds already cleared. Weight 6-strength, so a shaky sound comes
  // back five times as often as one you've nailed.
  const learned = LESSONS.slice(0, i).filter(lessonDone);
  const want = Math.min(SESSION_LEN - fresh.length, learned.length * 2);
  const reviews = [];
  if(want > 0 && learned.length){
    const bag = [];
    learned.forEach(l=>{
      const w = 6 - Math.min(5, lp(l.key).strength);
      for(let k=0;k<w;k++) bag.push(l);
    });
    for(let k=0;k<want;k++){
      const l = bag[Math.floor(Math.random()*bag.length)];
      const list = poolTier(l.pool, tierFor(lp(l.key).strength));
      if(!list.length) continue;
      reviews.push(mkQ(list[Math.floor(Math.random()*list.length)], l.key, true));
    }
  }
  return shuffle(fresh.concat(reviews));
}

export {
  contrastKey, POOLS, COURSE_ORDER, LESSONS, PATH, CHAPTERS, CHAPTER_AFTER, ROMAN,
  FOUNDATIONS, IPA_MAP, L1_WORDS, speakItemsFor,
  SESSION_LEN, PASS_MARK, SPEAK_PASS, SPEAK_STEP_LEN, FOUND_SPEAK_LEN,
  defaultProgress, loadProgress, saveProgress, setProgress, lp, chapterRec,
  stepPassed, lessonDone, lessonMastered, chapterDone, nextStep,
  doneCount, masteredCount, currentIdx, chapterUnlocked, weakestIdx,
  liveStreak, bumpStreak,
  fRec, foundationLearned, foundationMastered, foundationsAllLearned,
  foundationUnlocked, firstOpenFoundation, learnedFoundationCount, masteredFoundationCount,
  poolTier, tierFor, drawFrom, buildLessonDeck,
};
