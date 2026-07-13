/* Écoute — the audio engine.

   Two voices: Google Translate's TTS (natural, needs the network) and whatever
   French voices the browser has installed, ranked so a good one wins. If Google
   can't load we fall back on our own and tell the user once.

   A classic script, like data.js — everything here is global by design. */

/* =========================== AUDIO ENGINE ===========================
   Two sources:
   1) "google"  — Google Translate's TTS (natural voice). Plays as a
      cross-origin <audio> stream (media playback isn't CORS-blocked).
      If it can't load (offline / endpoint change), we auto-fall back.
   2) System voices — the browser's SpeechSynthesis voices. We rank them
      so a high-quality voice ("Google français", Enhanced/Premium,
      Thomas, Amélie…) is preferred over the low-quality compact ones.
   The user can switch sources/voices in the dropdown; choice is saved.
   ==================================================================== */
const sel = document.getElementById('voiceSel');
const playBtn = document.getElementById('play');
let sysVoices = [];
let googleFailed = false;
let curAudio = null;

function rank(v){
  const n = (v.name||'').toLowerCase();
  let s = 0;
  if(n.includes('google')) s += 50;            // Chrome's network neural voice
  if(/enhanced|premium|neural|siri/.test(n)) s += 40;
  if(/thomas|amélie|amelie|audrey|aurélie|aurelie|virginie|marie/.test(n)) s += 20;
  if(/compact|eloquence|pico/.test(n)) s -= 30; // low-quality engines
  if(/fr[-_]fr/i.test(v.lang)) s += 5;
  return s;
}

function buildVoiceList(){
  const all = ('speechSynthesis' in window) ? speechSynthesis.getVoices() : [];
  sysVoices = all.filter(v=>/^fr/i.test(v.lang)).sort((a,b)=>rank(b)-rank(a));
  const saved = localStorage.getItem('ecoute_voice');
  sel.innerHTML = '';
  const og = document.createElement('option');
  og.value = 'google'; og.textContent = 'Google Translate (natural) — recommended';
  sel.appendChild(og);
  sysVoices.forEach((v,i)=>{
    const o = document.createElement('option');
    o.value = 'sys:'+i;
    o.textContent = 'System · ' + v.name;
    sel.appendChild(o);
  });
  // restore saved choice if still valid, else default to Google
  if(saved && [...sel.options].some(o=>o.value===saved)) sel.value = saved;
  else sel.value = 'google';
}
if('speechSynthesis' in window){
  buildVoiceList();
  speechSynthesis.onvoiceschanged = buildVoiceList;
}
sel.addEventListener('change', ()=>{
  localStorage.setItem('ecoute_voice', sel.value);
  setToast('');
});

function setToast(msg){
  const h = document.querySelector('.listen .hint');
  if(!h) return;
  if(msg){ h.className='hint toast'; h.textContent = msg; }
  else { h.className='hint'; h.textContent = 'Listen, then choose what you heard.'; }
}

function bestSysVoice(){ return sysVoices[0] || null; }

function speakSystem(text, slow, voice){
  if(!('speechSynthesis' in window)) { setToast('No speech support in this browser.'); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = voice || bestSysVoice();
  u.lang = 'fr-FR';
  if(v) u.voice = v;
  u.rate = slow ? 0.5 : 0.95;
  u.onstart = ()=> playBtn.classList.add('playing');
  u.onend   = ()=> playBtn.classList.remove('playing');
  speechSynthesis.speak(u);
}

function googleURL(text, slow){
  const base = 'https://translate.google.com/translate_tts';
  const q = encodeURIComponent(text);
  let u = `${base}?ie=UTF-8&q=${q}&tl=fr&client=tw-ob&total=1&idx=0&textlen=${text.length}`;
  if(slow) u += '&ttsspeed=0.3';
  return u;
}

function playGoogle(text, slow){
  return new Promise((resolve,reject)=>{
    if(curAudio){ curAudio.pause(); curAudio = null; }
    const a = new Audio();
    a.crossOrigin = null;
    a.src = googleURL(text, slow);
    curAudio = a;
    let settled = false;
    const timer = setTimeout(()=>{ if(!settled){ settled=true; reject(new Error('timeout')); } }, 6000);
    a.onplaying = ()=> playBtn.classList.add('playing');
    a.onended   = ()=>{ playBtn.classList.remove('playing'); clearTimeout(timer); if(!settled){settled=true;resolve();} };
    a.onerror   = ()=>{ playBtn.classList.remove('playing'); clearTimeout(timer); if(!settled){settled=true;reject(new Error('audio error'));} };
    a.play().catch(err=>{ clearTimeout(timer); if(!settled){settled=true;reject(err);} });
  });
}

// Unified entry point used everywhere in the quiz.
function speak(text, slow){
  if(!text) return;
  const choice = sel.value;
  if(choice.startsWith('sys:')){
    speakSystem(text, !!slow, sysVoices[+choice.split(':')[1]]);
    return;
  }
  // Google source
  if(googleFailed){ speakSystem(text, !!slow); return; }
  playGoogle(text, !!slow).catch(()=>{
    // First failure: remember it, switch UI to best system voice, inform user.
    googleFailed = true;
    if(sysVoices.length){
      sel.value = 'sys:0';
      localStorage.setItem('ecoute_voice', 'sys:0');
      setToast('Google audio unavailable — switched to “'+sysVoices[0].name+'”.');
    } else {
      setToast('Google audio unavailable and no system French voice found.');
    }
    speakSystem(text, !!slow);
  });
}

export { speak, setToast, buildVoiceList };
