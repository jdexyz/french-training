
/* ===========================================================
   DATA — every French vowel phoneme is covered across the set.
   Oral:  i y u e ɛ ø œ ə a o ɔ
   Nasal: ɑ̃ ɛ̃ ɔ̃ œ̃
   Each item: prompt (what is spoken), options, answer index, focus, ipa
   =========================================================== */

const LEVEL1 = [
  {p:"chat",  o:["chat","chien"],  a:0, focus:"/a/ vs /jɛ̃/", ipa:"chat /ʃa/ · chien /ʃjɛ̃/"},
  {p:"tout",  o:["tout","tu"],     a:0, focus:"/u/ vs /y/",   ipa:"tout /tu/ · tu /ty/"},
  {p:"roue",  o:["roue","rue"],    a:0, focus:"/u/ vs /y/",   ipa:"roue /ʁu/ · rue /ʁy/"},
  {p:"si",    o:["si","su"],       a:0, focus:"/i/ vs /y/",   ipa:"si /si/ · su /sy/"},
  {p:"vie",   o:["vie","vue"],     a:0, focus:"/i/ vs /y/",   ipa:"vie /vi/ · vue /vy/"},
  {p:"bout",  o:["bout","but"],    a:0, focus:"/u/ vs /y/",   ipa:"bout /bu/ · but /by(t)/"},
  {p:"fée",   o:["fée","fait"],    a:0, focus:"/e/ vs /ɛ/",   ipa:"fée /fe/ · fait /fɛ/"},
  {p:"pré",   o:["pré","près"],    a:0, focus:"/e/ vs /ɛ/",   ipa:"pré /pʁe/ · près /pʁɛ/"},
  {p:"les",   o:["les","lait"],    a:0, focus:"/e/ vs /ɛ/",   ipa:"les /le/ · lait /lɛ/"},
  {p:"saute", o:["saute","sotte"], a:0, focus:"/o/ vs /ɔ/",   ipa:"saute /sot/ · sotte /sɔt/"},
  {p:"paume", o:["paume","pomme"], a:0, focus:"/o/ vs /ɔ/",   ipa:"paume /pom/ · pomme /pɔm/"},
  {p:"haute", o:["haute","hotte"], a:0, focus:"/o/ vs /ɔ/",   ipa:"haute /ot/ · hotte /ɔt/"},
  {p:"jeûne", o:["jeûne","jeune"], a:0, focus:"/ø/ vs /œ/",   ipa:"jeûne /ʒøn/ · jeune /ʒœn/"},
  {p:"peu",   o:["peu","peur"],    a:0, focus:"/ø/ vs /œ/",   ipa:"peu /pø/ · peur /pœʁ/"},
  {p:"ceux",  o:["ceux","sœur"],   a:0, focus:"/ø/ vs /œ/",   ipa:"ceux /sø/ · sœur /sœʁ/"},
  {p:"le",    o:["le","les"],      a:0, focus:"/ə/ vs /e/",   ipa:"le /lə/ · les /le/"},
  {p:"je",    o:["je","jeu"],      a:0, focus:"/ə/ vs /ø/",   ipa:"je /ʒə/ · jeu /ʒø/"},
  {p:"ta",    o:["ta","temps"],    a:0, focus:"/a/ vs /ɑ̃/",   ipa:"ta /ta/ · temps /tɑ̃/"},
  {p:"la",    o:["la","lent"],     a:0, focus:"/a/ vs /ɑ̃/",   ipa:"la /la/ · lent /lɑ̃/"},
  {p:"sa",    o:["sa","sans"],     a:0, focus:"/a/ vs /ɑ̃/",   ipa:"sa /sa/ · sans /sɑ̃/"},
  {p:"paix",  o:["paix","pain"],   a:0, focus:"/ɛ/ vs /ɛ̃/",   ipa:"paix /pɛ/ · pain /pɛ̃/"},
  {p:"lait",  o:["lait","lin"],    a:0, focus:"/ɛ/ vs /ɛ̃/",   ipa:"lait /lɛ/ · lin /lɛ̃/"},
  {p:"beau",  o:["beau","bon"],    a:0, focus:"/o/ vs /ɔ̃/",   ipa:"beau /bo/ · bon /bɔ̃/"},
  {p:"seau",  o:["seau","son"],    a:0, focus:"/o/ vs /ɔ̃/",   ipa:"seau /so/ · son /sɔ̃/"},
  {p:"banc",  o:["banc","bon"],    a:0, focus:"/ɑ̃/ vs /ɔ̃/",   ipa:"banc /bɑ̃/ · bon /bɔ̃/"},
  {p:"rang",  o:["rang","rond"],   a:0, focus:"/ɑ̃/ vs /ɔ̃/",   ipa:"rang /ʁɑ̃/ · rond /ʁɔ̃/"},
  {p:"vent",  o:["vent","vin"],    a:0, focus:"/ɑ̃/ vs /ɛ̃/",   ipa:"vent /vɑ̃/ · vin /vɛ̃/"},
  {p:"lent",  o:["lent","lin"],    a:0, focus:"/ɑ̃/ vs /ɛ̃/",   ipa:"lent /lɑ̃/ · lin /lɛ̃/"},
  {p:"bain",  o:["bain","bon"],    a:0, focus:"/ɛ̃/ vs /ɔ̃/",   ipa:"bain /bɛ̃/ · bon /bɔ̃/"},
  {p:"brun",  o:["brun","brin"],   a:0, focus:"/œ̃/ vs /ɛ̃/",   ipa:"brun /bʁœ̃/ · brin /bʁɛ̃/"},
];

const LEVEL2 = [
  {p:"J'ai promené mon chat.",        o:["J'ai promené mon chat.","J'ai promené mon chien."],         a:0, focus:"/a/ vs /jɛ̃/", ipa:"chat /ʃa/ · chien /ʃjɛ̃/"},
  {p:"Il a marqué le but.",           o:["Il a marqué le but.","Il a marqué le bout."],               a:0, focus:"/y/ vs /u/",  ipa:"but /by/ · bout /bu/"},
  {p:"La roue tourne lentement.",     o:["La roue tourne lentement.","La rue tourne lentement."],     a:0, focus:"/u/ vs /y/",  ipa:"roue /ʁu/ · rue /ʁy/"},
  {p:"J'adore cette vue.",            o:["J'adore cette vue.","J'adore cette vie."],                  a:0, focus:"/y/ vs /i/",  ipa:"vue /vy/ · vie /vi/"},
  {p:"Le chat dort dessus.",          o:["Le chat dort dessus.","Le chat dort dessous."],            a:0, focus:"/y/ vs /u/",  ipa:"dessus /dəsy/ · dessous /dəsu/"},
  {p:"Il vend des pulls.",            o:["Il vend des pulls.","Il vend des poules."],                 a:0, focus:"/y/ vs /u/",  ipa:"pull /pyl/ · poule /pul/"},
  {p:"Il a très peu.",                o:["Il a très peu.","Il a très peur."],                         a:0, focus:"/ø/ vs /œ/",  ipa:"peu /pø/ · peur /pœʁ/"},
  {p:"Nous suivons la côte.",         o:["Nous suivons la côte.","Nous suivons la cote."],            a:0, focus:"/o/ vs /ɔ/",  ipa:"côte /kot/ · cote /kɔt/"},
  {p:"Il dessine une paume.",         o:["Il dessine une paume.","Il dessine une pomme."],            a:0, focus:"/o/ vs /ɔ/",  ipa:"paume /pom/ · pomme /pɔm/"},
  {p:"Il dort sur le saule.",         o:["Il dort sur le saule.","Il dort sur le sol."],              a:0, focus:"/o/ vs /ɔ/",  ipa:"saule /sol/ · sol /sɔl/"},
  {p:"Le train est là.",              o:["Le train est là.","Le train est lent."],                   a:0, focus:"/a/ vs /ɑ̃/",  ipa:"là /la/ · lent /lɑ̃/"},
  {p:"Il passe à toi.",               o:["Il passe à toi.","Il pense à toi."],                        a:0, focus:"/a/ vs /ɑ̃/",  ipa:"passe /pas/ · pense /pɑ̃s/"},
  {p:"Il fait du vin.",               o:["Il fait du vin.","Il fait du vent."],                       a:0, focus:"/ɛ̃/ vs /ɑ̃/", ipa:"vin /vɛ̃/ · vent /vɑ̃/"},
  {p:"Il peint le mur.",              o:["Il peint le mur.","Il pend le mur."],                       a:0, focus:"/ɛ̃/ vs /ɑ̃/", ipa:"peint /pɛ̃/ · pend /pɑ̃/"},
  {p:"C'est un beau gâteau.",         o:["C'est un beau gâteau.","C'est un bon gâteau."],             a:0, focus:"/o/ vs /ɔ̃/",  ipa:"beau /bo/ · bon /bɔ̃/"},
  {p:"C'est mon seau.",               o:["C'est mon seau.","C'est mon son."],                         a:0, focus:"/o/ vs /ɔ̃/",  ipa:"seau /so/ · son /sɔ̃/"},
  {p:"Il a les cheveux blancs.",      o:["Il a les cheveux blancs.","Il a les cheveux blonds."],      a:0, focus:"/ɑ̃/ vs /ɔ̃/", ipa:"blanc /blɑ̃/ · blond /blɔ̃/"},
  {p:"Dessine un rond.",              o:["Dessine un rond.","Dessine un rang."],                      a:0, focus:"/ɔ̃/ vs /ɑ̃/", ipa:"rond /ʁɔ̃/ · rang /ʁɑ̃/"},
  {p:"Le film est long.",             o:["Le film est long.","Le film est lent."],                   a:0, focus:"/ɔ̃/ vs /ɑ̃/", ipa:"long /lɔ̃/ · lent /lɑ̃/"},
  {p:"Le chien ronge l'os.",          o:["Le chien ronge l'os.","Le chien range l'os."],              a:0, focus:"/ɔ̃/ vs /ɑ̃/", ipa:"ronge /ʁɔ̃ʒ/ · range /ʁɑ̃ʒ/"},
  {p:"C'est une forte pente.",        o:["C'est une forte pente.","C'est une forte ponte."],          a:0, focus:"/ɑ̃/ vs /ɔ̃/", ipa:"pente /pɑ̃t/ · ponte /pɔ̃t/"},
  {p:"Quel beau teint !",             o:["Quel beau teint !","Quel beau ton !"],                      a:0, focus:"/ɛ̃/ vs /ɔ̃/", ipa:"teint /tɛ̃/ · ton /tɔ̃/"},
  {p:"Je vois le train.",             o:["Je vois le train.","Je vois le tronc."],                    a:0, focus:"/ɛ̃/ vs /ɔ̃/", ipa:"train /tʁɛ̃/ · tronc /tʁɔ̃/"},
  {p:"C'est un grand pin.",           o:["C'est un grand pin.","C'est un grand pont."],               a:0, focus:"/ɛ̃/ vs /ɔ̃/", ipa:"pin /pɛ̃/ · pont /pɔ̃/"},
  {p:"C'est un beau dé.",             o:["C'est un beau dé.","C'est un beau dais."],                  a:0, focus:"/e/ vs /ɛ/",  ipa:"dé /de/ · dais /dɛ/"},
  {p:"Le pont est solide.",           o:["Le pont est solide.","Le pan est solide."],                 a:0, focus:"/ɔ̃/ vs /ɑ̃/", ipa:"pont /pɔ̃/ · pan /pɑ̃/"},
  {p:"Quel beau banc !",              o:["Quel beau banc !","Quel beau bond !"],                      a:0, focus:"/ɑ̃/ vs /ɔ̃/", ipa:"banc /bɑ̃/ · bond /bɔ̃/"},
  {p:"C'est une jolie rue.",          o:["C'est une jolie rue.","C'est une jolie roue."],             a:0, focus:"/y/ vs /u/",  ipa:"rue /ʁy/ · roue /ʁu/"},
  {p:"Quel bon vin !",                o:["Quel bon vin !","Quel bon vent !"],                         a:0, focus:"/ɛ̃/ vs /ɑ̃/", ipa:"vin /vɛ̃/ · vent /vɑ̃/"},
  {p:"Il porte un costume brun.",     o:["Il porte un costume brun.","Il porte un costume brin."],    a:0, focus:"/œ̃/ vs /ɛ̃/", ipa:"brun /bʁœ̃/ · brin /bʁɛ̃/"},
];

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

let deck=[], idx=0, score=0, level=1, answered=false, missed=[];

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

function startLevel(lv){
  level = lv;
  const src = (lv===1?LEVEL1:LEVEL2);
  // shuffle question order; options shuffled per question at render
  deck = shuffle(src).map(q=>{
    const order = shuffle(q.o.map((t,i)=>({t,correct:i===q.a})));
    return {prompt:q.prompt!==undefined?q.prompt:q.p, p:q.p, focus:q.focus, ipa:q.ipa, order};
  });
  idx=0; score=0; missed=[];
  show('quiz');
  document.getElementById('levelLabel').textContent = (lv===1?'Level 1 · Words':'Level 2 · Sentences');
  render();
}

function render(){
  answered=false;
  const q = deck[idx];
  document.getElementById('counter').textContent = `Question ${idx+1} / ${deck.length} · Score ${score}`;
  document.getElementById('bar').style.width = `${(idx)/deck.length*100}%`;
  document.getElementById('feedback').innerHTML = '';
  document.getElementById('next').disabled = true;

  const wrap = document.getElementById('options');
  wrap.innerHTML='';
  q.order.forEach((opt)=>{
    const b = document.createElement('button');
    b.className='opt';
    b.innerHTML = `<span>${opt.t}</span><span class="mark"></span>`;
    b.onclick = ()=> choose(b, opt, q);
    wrap.appendChild(b);
  });
  // auto-play the prompt
  setTimeout(()=> speak(q.p), 250);
}

function choose(btn, opt, q){
  if(answered) return;
  answered=true;
  const buttons = [...document.querySelectorAll('.opt')];
  buttons.forEach(b=> b.disabled=true);

  if(opt.correct){
    score++;
    btn.classList.add('correct');
    btn.querySelector('.mark').textContent='✓';
    document.getElementById('feedback').innerHTML =
      `<b style="color:var(--good)">Correct !</b> &nbsp; <span class="ipa">${q.ipa}</span> &nbsp;·&nbsp; <span style="color:var(--muted)">${q.focus}</span>`;
  } else {
    btn.classList.add('wrong');
    btn.querySelector('.mark').textContent='✗';
    // reveal the correct one
    buttons.forEach(b=>{
      const label = b.querySelector('span').textContent;
      const corr = q.order.find(o=>o.correct).t;
      if(label===corr){ b.classList.add('correct'); b.querySelector('.mark').textContent='✓'; }
    });
    missed.push(q);
    document.getElementById('feedback').innerHTML =
      `<b style="color:var(--bad)">Not quite.</b> &nbsp; <span class="ipa">${q.ipa}</span> &nbsp;·&nbsp; <span style="color:var(--muted)">${q.focus}</span>`;
  }
  document.getElementById('counter').textContent = `Question ${idx+1} / ${deck.length} · Score ${score}`;
  document.getElementById('next').disabled = false;
  document.getElementById('next').textContent = (idx+1<deck.length)?'Next →':'See results';
}

document.getElementById('next').onclick = ()=>{
  if(idx+1<deck.length){ idx++; render(); }
  else finish();
};
document.getElementById('play').onclick = ()=> speak(deck[idx].p, false);
document.getElementById('slow').onclick = ()=> speak(deck[idx].p, true);
document.getElementById('retryBtn').onclick = ()=> startLevel(level);

function finish(){
  show('result');
  document.getElementById('bar').style.width='100%';
  document.getElementById('finalScore').textContent = `${score} / ${deck.length}`;
  const pct = score/deck.length;
  let msg = pct===1 ? "Parfait ! A flawless ear. 👂🇫🇷"
          : pct>=.8 ? "Très bien ! Your ear is sharp."
          : pct>=.5 ? "Pas mal ! Keep training those vowels."
          : "Bon courage ! These contrasts are tricky — replay slowly and try again.";
  document.getElementById('resultMsg').textContent = msg;

  const ml = document.getElementById('missedList');
  if(missed.length){
    ml.innerHTML = `<p style="color:var(--muted);margin:0 0 8px">Sounds to review:</p>` +
      missed.map(m=>`<div style="padding:8px 12px;background:var(--card2);border-radius:10px;margin-bottom:6px">
        <span style="color:var(--accent2)">${m.p}</span> &nbsp;—&nbsp; <span style="color:var(--muted)">${m.ipa} · ${m.focus}</span></div>`).join('');
  } else {
    ml.innerHTML = `<p style="color:var(--good);text-align:center">No mistakes — nothing to review! 🎉</p>`;
  }
}

function quitToMenu(){ speechSynthesis.cancel(); show('menu'); }
function show(id){
  ['menu','quiz','result'].forEach(s=> document.getElementById(s).style.display = (s===id?'':'none'));
  window.scrollTo(0,0);
}

// keyboard: space replays, 1/2/3 choose
document.addEventListener('keydown',e=>{
  if(document.getElementById('quiz').style.display==='none') return;
  if(e.code==='Space'){ e.preventDefault(); speak(deck[idx].p); }
  if(['1','2','3'].includes(e.key)){
    const b=document.querySelectorAll('.opt')[+e.key-1];
    if(b && !b.disabled) b.click();
  }
  if(e.key==='Enter' && !document.getElementById('next').disabled) document.getElementById('next').click();
});
