/* The menu: Rémy, the stats, and the path of lessons. */

import { S } from './state.js';
import { escapeHtml, todayStr } from './util.js';
import { L as tr, lang, setLang } from './i18n.js';   // aliased: `L` is the lesson variable everywhere here
import { geminiKey } from './gemini.js';
import {
  LESSONS, PATH, CHAPTERS, CHAPTER_AFTER, FOUNDATIONS,
  P, defaultProgress, setProgress, saveProgress, lp, chapterRec,
  stepPassed, lessonDone, lessonMastered, chapterDone, nextStep,
  doneCount, masteredCount, currentIdx, chapterUnlocked, weakestIdx, liveStreak,
  fRec, foundationLearned, foundationMastered, foundationsAllLearned,
  foundationUnlocked, firstOpenFoundation,
} from './course.js';
import { STEP_NAME, startLesson, startChapter, startFoundation, startFoundationSpeak } from './lesson.js';

/* ---- the menu: Rémy, the stats, the path ---- */
function remyLine(allDone, cur, streak){
  const it = lang() === 'it';
  if(!foundationsAllLearned()){
    const f = escapeHtml(FOUNDATIONS[firstOpenFoundation()].title);
    if(!P.lastDay)
      return it ? `Ciao ! Sono <b>Rémy</b>. Partiamo dalle basi : <b>${f}</b>. Prima leggere, poi i suoni.`
                : `Salut ! Je suis <b>Rémy</b>. On commence par les bases : <b>${f}</b>. D'abord lire, ensuite les sons.`;
    if(P.lastDay === todayStr())
      return it ? `<b>Già fatto oggi</b> — bravo. Ancora un po' ? <b>${f}</b> ti aspetta.`
                : `<b>Déjà fait aujourd'hui</b> — chapeau. Un peu plus ? <b>${f}</b> t'attend.`;
    if(streak > 0)
      return it ? `La tua <b>serie di ${streak} giorn${streak===1?'o':'i'}</b> continua. Mettiamo le basi : <b>${f}</b>.`
                : `Ta <b>série de ${streak} jour${streak===1?'':'s'}</b> continue. On pose les bases : <b>${f}</b>.`;
    return it ? `Prima posiamo le fondamenta : <b>${f}</b>. Leggi la regola, poi dilla ad alta voce.`
              : `On pose d'abord les fondations : <b>${f}</b>. Lis la règle, puis dis-la à voix haute.`;
  }
  const curTitle = escapeHtml(LESSONS[cur].title);
  if(allDone)
    return it ? `<b>Tutto il programma !</b> Ogni suono del corso è tuo. Ora li teniamo affilati — un ripasso al giorno.`
              : `<b>Tout le programme !</b> Every sound in the course is yours. Now we keep them sharp — one review a day.`;
  if(!P.lastDay)
    return it ? `Ciao ! Sono <b>Rémy</b>. Cominciamo dal più semplice : <b>${escapeHtml(LESSONS[0].title)}</b>. Una lezione, e basta.`
              : `Salut ! Je suis <b>Rémy</b>. On commence par le plus simple : <b>${escapeHtml(LESSONS[0].title)}</b>. Une leçon, et c'est tout.`;
  if(P.lastDay === todayStr())
    return it ? `<b>Già fatto oggi</b> — bravo. Voglia di un altro giro ?`
              : `<b>Déjà fait aujourd'hui</b> — chapeau. Envie d'un tour de plus ?`;
  if(streak > 0)
    return it ? `La tua <b>serie di ${streak} giorn${streak===1?'o':'i'}</b> ti aspetta. Lezione ${cur+1} : <b>${curTitle}</b>.`
              : `Your <b>${streak}-day streak</b> is waiting. Leçon ${cur+1} : <b>${curTitle}</b>.`;
  return it ? `È da un po' ! Riprendiamo con calma — lezione ${cur+1}, <b>${curTitle}</b>.`
            : `Ça fait un moment ! On reprend doucement — leçon ${cur+1}, <b>${curTitle}</b>.`;
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
  if(!foundationsAllLearned()){
    const fi = firstOpenFoundation();
    const f = FOUNDATIONS[fi];
    cb.textContent = `${P.gelato > 0 ? '▶ Continue' : '▶ Start'} · ${f.icon} ${f.title}`;
    cb.onclick = ()=> startFoundation(fi);
  } else if(allDone){
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
    if(node.type === 'foundation'){
      const it = lang() === 'it';
      const fi = node.f;
      const f = FOUNDATIONS[fi];
      const rec = fRec(f.id);
      const locked = !foundationUnlocked(fi);
      const learned = foundationLearned(f);
      const mastered = foundationMastered(f);
      const isCurrent = !learned && !locked;

      const b = document.createElement('button');
      b.className = 'node found' + (learned ? ' done' : '') + (mastered ? ' gold' : '') + (isCurrent ? ' current' : '');
      b.disabled = locked;
      b.innerHTML =
        `<span class="dot">${mastered ? '★' : learned ? '✓' : locked ? '🔒' : f.icon}</span>
         <span class="nt">
           <b>${escapeHtml(f.title)}</b>
           <span>${escapeHtml(tr(f.goal))}${locked ? (it ? ' · bloccato' : ' · locked') : ''}</span>
         </span>
         <span class="pips">
           <i class="pip${learned ? ' on' : ''}">📖</i>
           <i class="pip${mastered ? ' on' : ''}">🎤</i>
         </span>`;
      if(!locked) b.onclick = ()=>{ S.openNode = (S.openNode === 'f'+fi) ? null : 'f'+fi; renderCourse(); };
      path.appendChild(b);

      if(S.openNode === ('f'+fi) && !locked){
        const panel = document.createElement('div');
        panel.className = 'steps';
        const needsKey = !geminiKey();
        const learnNote = learned ? (it ? 'la regola e gli esempi' : 'the rule, and the examples')
                                  : (it ? 'leggi la regola · sblocca il passo dopo' : 'read the rule · unlocks the next step');
        const speakNote = mastered ? `${it ? 'meglio' : 'best'} ${rec.sp}%`
                        : needsKey ? (it ? 'facoltativo · serve una chiave Gemini' : 'optional · needs a Gemini key')
                                   : (it ? 'facoltativo · +60 🍨' : 'optional · +60 🍨');
        panel.innerHTML =
          `<button class="steprow${learned?' done':''}" data-f="${fi}" data-fstep="learn">
             <span class="sdot">${learned ? '✓' : '📖'}</span>
             <span class="snt"><b>📖 ${it ? 'Impara' : 'Learn'}</b><span>${learnNote}</span></span>
           </button>
           <button class="steprow${mastered?' done':''}" data-f="${fi}" data-fstep="speak">
             <span class="sdot">${mastered ? '✓' : '🎤'}</span>
             <span class="snt"><b>🎤 ${it ? 'Pronunciala' : 'Say it'}</b><span>${speakNote}</span></span>
           </button>`;
        panel.querySelectorAll('.steprow').forEach(r=>{
          r.onclick = ()=> r.dataset.fstep === 'learn' ? startFoundation(+r.dataset.f) : startFoundationSpeak(+r.dataset.f);
        });
        path.appendChild(panel);
      }
      return;
    }

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
    const locked = !foundationsAllLearned() || i > currentIdx();   // the sounds wait behind the Foundations
    const done = lessonDone(L);
    const mastered = lessonMastered(L);
    const steps = L.stepB ? [1,2,3] : [1,3];

    const b = document.createElement('button');
    b.className = 'node' + (done ? ' done' : '') + (mastered ? ' gold' : '') + (foundationsAllLearned() && !allDone && i === cur ? ' current' : '');
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

/* ---- the 🇬🇧 / 🇮🇹 language setting ---- */
function renderLang(){
  const sub = document.getElementById('langSub');
  if(sub) sub.textContent = lang() === 'it'
    ? 'Le spiegazioni di Rémy e le Fondamenta (le glosse restano in italiano).'
    : "Rémy's coaching and the Foundations (the Italian glosses stay put).";
  document.querySelectorAll('#langToggle .seg').forEach(s=>
    s.classList.toggle('on', s.dataset.lang === lang()));
}
document.querySelectorAll('#langToggle .seg').forEach(s=>{
  s.onclick = ()=>{ setLang(s.dataset.lang); renderLang(); renderCourse(); };
});
renderLang();

export { renderCourse, remyLine, stepRow, renderLang };
