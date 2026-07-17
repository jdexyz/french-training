/* The listening quiz: hear a prompt, pick what you heard.

   Used by BOTH free practice (Levels 1-3) and the course's 👂 steps — the only
   difference is S.mode, which decides whether an answer is recorded against a
   lesson and where "finish" hands off to. */

import { S } from './state.js';
import { LEVEL1, LEVEL2, LEVEL3, TRANS, ODD } from './data.js';
import { shuffle } from './util.js';
import { speak } from './audio.js';
import { startSpeak, abortRecording } from './speak.js';
import { recordAnswer, finishLesson, startLesson } from './lesson.js';
import { renderCourse } from './menu.js';

const LEVELS = {1:LEVEL1, 2:LEVEL2, 3:LEVEL3};
const LEVEL_LABELS = {1:'Level 1 · Words', 2:'Level 2 · Longer words', 3:'Level 3 · Sentences'};
const QUIZ_LEN = 20;   // questions drawn at random from the (larger) pool each round

// show how big each pool is on the menu cards
[1,2,3].forEach(lv=>{
  const el = document.getElementById('tag'+lv);
  if(el){
    const base = el.textContent;
    el.textContent = `${LEVELS[lv].length} pairs · ${Math.min(QUIZ_LEN,LEVELS[lv].length)} random per round · ${base}`;
  }
});

function startLevel(lv){
  S.level = lv;
  S.mode = 'free';
  if(lv===4 || lv===5 || lv===6){ startSpeak(); return; }   // Levels 4-6 use the mic-based flow
  const src = LEVELS[lv] || LEVEL1;
  // shuffle question order, take a random subset; the spoken word of each pair
  // is chosen at render() time so it differs every round (memory can't cheat).
  S.deck = shuffle(src).slice(0, QUIZ_LEN).map(q=>({o:q.o.slice(), focus:q.focus, ipa:q.ipa}));
  S.idx=0; S.score=0; S.missed=[];
  show('quiz');
  document.getElementById('levelLabel').textContent = LEVEL_LABELS[lv] || '';
  render();
}

function render(){
  S.answered=false;
  const q = S.deck[S.idx];
  // pick which word of the pair is spoken THIS time — randomised so the answer
  // changes round to round, not just its position. You must actually listen.
  const spokenIdx = Math.floor(Math.random()*q.o.length);
  q.p = q.o[spokenIdx];
  q.order = shuffle(q.o.map((t,i)=>({t, correct:i===spokenIdx})));
  document.getElementById('counter').innerHTML = counterText();
  document.getElementById('bar').style.width = `${(S.idx)/S.deck.length*100}%`;
  document.getElementById('feedback').innerHTML = '';
  document.getElementById('next').disabled = true;

  const wrap = document.getElementById('options');
  wrap.innerHTML='';
  q.order.forEach((opt)=>{
    const b = document.createElement('button');
    b.className='opt';
    const it = TRANS[opt.t] || '';
    const oddTag = ODD.has(opt.t) ? ' · 🤔 unusual phrase' : '';
    // meaning is built but veiled — revealed only after the user answers, so the
    // translation can't give the answer away.
    b.innerHTML = `<span class="txt"><span class="fr2">${opt.t}</span>${it?`<span class="it veil">🇮🇹 ${it}${oddTag}</span>`:''}</span>`
      + `<span class="opt-ctrl"><span class="spk" title="Hear this option">🔊</span><span class="slowspk" title="Hear this option slowly">🐢</span><span class="mark"></span></span>`;
    b.onclick = ()=> choose(b, opt, q);
    b.querySelector('.spk').addEventListener('click',(e)=>{ e.stopPropagation(); speak(opt.t, false); });
    b.querySelector('.slowspk').addEventListener('click',(e)=>{ e.stopPropagation(); speak(opt.t, true); });
    wrap.appendChild(b);
  });
  // auto-play the prompt
  setTimeout(()=> speak(q.p), 250);
}

// "Question 3 / 12 · 🔁 review · Score 2" — the review flag is safe to show,
// it says which sound is being tested, never which option is right.
function counterText(){
  const q = S.deck[S.idx];
  const chip = (q && q.review) ? ` <span class="chip">🔁 review</span>` : '';
  return `Question ${S.idx+1} / ${S.deck.length}${chip} · Score ${S.score}`;
}

function choose(btn, opt, q){
  if(S.answered) return;
  S.answered=true;
  if(S.mode==='lesson') recordAnswer(q.key, opt.correct, q.review);
  const buttons = [...document.querySelectorAll('.opt')];
  buttons.forEach(b=>{
    b.classList.add('locked');  // visual lock; speakers stay clickable
    b.querySelectorAll('.it.veil').forEach(s=> s.classList.remove('veil')); // now reveal meanings
  });

  if(opt.correct){
    S.score++;
    btn.classList.add('correct');
    btn.querySelector('.mark').textContent='✓';
    document.getElementById('feedback').innerHTML =
      `<b style="color:var(--good)">Correct !</b> &nbsp; <span class="ipa">${q.ipa}</span> &nbsp;·&nbsp; <span style="color:var(--muted)">${q.focus}</span>`;
  } else {
    btn.classList.add('wrong');
    btn.querySelector('.mark').textContent='✗';
    // reveal the correct one
    buttons.forEach(b=>{
      const label = b.querySelector('.fr2').textContent;
      const corr = q.order.find(o=>o.correct).t;
      if(label===corr){ b.classList.add('correct'); b.querySelector('.mark').textContent='✓'; }
    });
    S.missed.push(q);
    document.getElementById('feedback').innerHTML =
      `<b style="color:var(--bad)">Not quite.</b> &nbsp; <span class="ipa">${q.ipa}</span> &nbsp;·&nbsp; <span style="color:var(--muted)">${q.focus}</span>`;
  }
  // if the word that was actually spoken is a grammatically-correct-but-odd
  // phrase, tell the user now (after they've S.answered) so the nonsense never
  // helped them guess.
  if(ODD.has(q.p)){
    document.getElementById('feedback').innerHTML +=
      `<div class="oddnote">🤔 « ${q.p} » is grammatically correct but isn't something you'd normally say — it's here only to train your ear for the sound.</div>`;
  }
  document.getElementById('counter').innerHTML = counterText();
  document.getElementById('next').disabled = false;
  document.getElementById('next').textContent = (S.idx+1<S.deck.length)?'Next →':'See results';
}

document.getElementById('next').onclick = ()=>{
  if(S.idx+1<S.deck.length){ S.idx++; render(); }
  else finish();
};
document.getElementById('play').onclick = ()=> speak(S.deck[S.idx].p, false);
document.getElementById('replay').onclick = ()=> speak(S.deck[S.idx].p, false);
document.getElementById('slow').onclick = ()=> speak(S.deck[S.idx].p, true);
document.getElementById('retryBtn').onclick = ()=> (S.mode==='lesson') ? startLesson(S.lessonIdx) : startLevel(S.level);

function finish(){
  show('result');
  document.getElementById('bar').style.width='100%';
  if(S.mode==='lesson'){ finishLesson(); return; }

  document.getElementById('resultRemy').style.display='none';
  document.getElementById('nextLessonBtn').style.display='none';
  document.getElementById('retryBtn').className='btn';
  document.getElementById('retryBtn').textContent='Try again';
  document.getElementById('retryBtn').onclick = ()=> startLevel(S.level);
  document.getElementById('finalScore').textContent = `${S.score} / ${S.deck.length}`;
  const pct = S.score/S.deck.length;
  let msg = pct===1 ? "Parfait ! A flawless ear. 👂🇫🇷"
          : pct>=.8 ? "Très bien ! Your ear is sharp."
          : pct>=.5 ? "Pas mal ! Keep training those vowels."
          : "Bon courage ! These contrasts are tricky — replay slowly and try again.";
  document.getElementById('resultMsg').textContent = msg;

  const ml = document.getElementById('missedList');
  if(S.missed.length){
    ml.innerHTML = `<p style="color:var(--muted);margin:0 0 8px">Sounds to review:</p>` +
      S.missed.map(m=>`<div style="padding:8px 12px;background:var(--card2);border-radius:10px;margin-bottom:6px">
        <span style="color:var(--accent2)">${m.p}</span>${TRANS[m.p]?` <span style="color:var(--muted);font-style:italic">— 🇮🇹 ${TRANS[m.p]}</span>`:''}<br>
        <span style="color:var(--muted);font-size:.85rem">${m.ipa} · ${m.focus}</span></div>`).join('');
  } else {
    ml.innerHTML = `<p style="color:var(--good);text-align:center">No mistakes — nothing to review! 🎉</p>`;
  }
}

function quitToMenu(){
  speechSynthesis.cancel(); abortRecording();
  S.mode='free'; S.courseCtx=null;
  renderCourse(); show('menu');
}
function show(id){
  ['menu','quiz','pronounce','result','learn'].forEach(s=> document.getElementById(s).style.display = (s===id?'':'none'));
  window.scrollTo(0,0);
}

export { startLevel, render, counterText, choose, finish, quitToMenu, show, LEVELS, QUIZ_LEN };
