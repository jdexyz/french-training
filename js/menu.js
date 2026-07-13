/* The menu: Rémy, the stats, and the path of lessons. */

import { S } from './state.js';
import { escapeHtml, todayStr } from './util.js';
import { geminiKey } from './gemini.js';
import {
  LESSONS, PATH, CHAPTERS, CHAPTER_AFTER,
  P, defaultProgress, setProgress, saveProgress, lp, chapterRec,
  stepPassed, lessonDone, lessonMastered, chapterDone, nextStep,
  doneCount, masteredCount, currentIdx, chapterUnlocked, weakestIdx, liveStreak,
} from './course.js';
import { STEP_NAME, startLesson, startChapter } from './lesson.js';

/* ---- the menu: Rémy, the stats, the path ---- */
function remyLine(allDone, cur, streak){
  if(allDone)
    return `<b>Tout le programme !</b> Every sound in the course is yours. Now we keep them sharp — one review a day.`;
  if(!P.lastDay)
    return `Salut ! Je suis <b>Rémy</b>. On commence par le plus simple : <b>${escapeHtml(LESSONS[0].title)}</b>. Une leçon, et c'est tout.`;
  if(P.lastDay === todayStr())
    return `<b>Déjà fait aujourd'hui</b> — chapeau. Envie d'un tour de plus ?`;
  if(streak > 0)
    return `Your <b>${streak}-day streak</b> is waiting. Leçon ${cur+1} : <b>${escapeHtml(LESSONS[cur].title)}</b>.`;
  return `Ça fait un moment ! On reprend doucement — leçon ${cur+1}, <b>${escapeHtml(LESSONS[cur].title)}</b>.`;
}

// which node's step list is expanded in the path

function stepRow(L, i, step, optional){
  const done = stepPassed(L, step);
  const rec = lp(L.key);
  const best = step === 1 ? rec.s1 : step === 2 ? rec.s2 : rec.sp;
  const needsKey = step === 3 && !geminiKey();
  const note = done ? `best ${best}%`
             : needsKey ? 'optional · needs a Gemini key'
             : optional ? 'optional · +80 🍨'
             : 'not yet cleared';
  return `<button class="steprow${done?' done':''}" data-lesson="${i}" data-step="${step}">
      <span class="sdot">${done ? '✓' : step}</span>
      <span class="snt"><b>${STEP_NAME[step]}</b><span>${note}</span></span>
    </button>`;
}

function renderCourse(){
  const allDone = currentIdx() >= LESSONS.length;
  const cur = Math.min(currentIdx(), LESSONS.length-1);
  const streak = liveStreak();

  const st = document.getElementById('statStreak');
  st.textContent = `🔥 ${streak} day${streak===1?'':'s'}`;
  st.classList.toggle('hot', streak > 0);
  document.getElementById('statGelato').textContent = `🍨 ${P.gelato} gelato`;
  document.getElementById('statDone').textContent =
    `🎓 ${doneCount()} / ${LESSONS.length}${masteredCount() ? ` · ★ ${masteredCount()}` : ''}`;
  document.getElementById('remyLine').innerHTML = remyLine(allDone, cur, streak);

  const cb = document.getElementById('continueBtn');
  if(allDone){
    const w = weakestIdx();
    const openCh = CHAPTERS.findIndex((_,c)=> chapterUnlocked(c) && !chapterDone(c));
    if(openCh >= 0){
      cb.textContent = `▶ Continue · ${CHAPTERS[openCh].title}`;
      cb.onclick = ()=> startChapter(openCh);
    } else {
      cb.textContent = `🎓 Course complete — review ${LESSONS[w].title}`;
      cb.onclick = ()=> startLesson(w, 1);
    }
  } else {
    const step = nextStep(LESSONS[cur]) || 1;
    cb.textContent = `${P.gelato > 0 ? '▶ Continue' : '▶ Start'} · Lesson ${cur+1} — ${STEP_NAME[step]}`;
    cb.onclick = ()=> startLesson(cur, step);
  }

  const path = document.getElementById('path');
  path.innerHTML = '';

  PATH.forEach((node)=>{
    if(node.type === 'chapter'){
      const c = node.c;
      const ch = CHAPTERS[c];
      const locked = !chapterUnlocked(c);
      const done = chapterDone(c);
      const b = document.createElement('button');
      b.className = 'node law' + (done ? ' done' : '');
      b.disabled = locked;
      b.innerHTML =
        `<span class="dot">${done ? '✓' : locked ? '🔒' : ch.icon}</span>
         <span class="nt">
           <b>${escapeHtml(ch.title)}</b>
           <span>${ch.items.length} sentences aloud · ${
             done ? `best ${chapterRec(c).best}%`
                  : locked ? `unlocks after ${CHAPTER_AFTER[c]} sounds`
                  : geminiKey() ? 'optional · +100 🍨'
                  : 'optional · needs a Gemini key'}</span>
         </span>`;
      if(!locked) b.onclick = ()=> startChapter(c);
      path.appendChild(b);
      return;
    }

    const i = node.i;
    const L = LESSONS[i];
    const rec = lp(L.key);
    const locked = i > currentIdx();
    const done = lessonDone(L);
    const mastered = lessonMastered(L);
    const steps = L.stepB ? [1,2,3] : [1,3];

    const b = document.createElement('button');
    b.className = 'node' + (done ? ' done' : '') + (mastered ? ' gold' : '') + (!allDone && i === cur ? ' current' : '');
    b.disabled = locked;
    b.innerHTML =
      `<span class="dot">${mastered ? '★' : done ? '✓' : locked ? '🔒' : i+1}</span>
       <span class="nt">
         <b>${escapeHtml(L.title)}</b>
         <span>${escapeHtml(L.focus)}${locked ? ' · locked' : ''}</span>
       </span>
       <span class="pips">${steps.map(s=>
          `<i class="pip${stepPassed(L,s) ? ' on' : ''}">${s===3 ? '🎤' : '👂'}</i>`).join('')}</span>`;
    if(!locked) b.onclick = ()=>{ S.openNode = (S.openNode === i) ? null : i; renderCourse(); };
    path.appendChild(b);

    // expanded: the lesson's steps, each launchable on its own
    if(S.openNode === i && !locked){
      const panel = document.createElement('div');
      panel.className = 'steps';
      panel.innerHTML = steps.map(s=> stepRow(L, i, s, s===3)).join('');
      panel.querySelectorAll('.steprow').forEach(r=>{
        r.onclick = ()=> startLesson(+r.dataset.lesson, +r.dataset.step);
      });
      path.appendChild(panel);
    }
  });
}

document.getElementById('resetBtn').onclick = (e)=>{
  e.preventDefault();
  if(!confirm('Reset every lesson, your gelato and your streak? Rémy will start you again from lesson 1.')) return;
  setProgress(defaultProgress());
  saveProgress();
  renderCourse();
};

export { renderCourse, remyLine, stepRow };
