/* The app shell, and the entry point.

   Everything that is about the app rather than about French: registering the
   service worker, staying on the latest code, the daily push reminder, the
   install prompt — and finally booting the UI.

   This is the module the page loads; every other module is reached from here. */

import { S } from './state.js';
import { speak } from './audio.js';
import { todayStr } from './util.js';
import {
  P, saveProgress, liveStreak, setOnPractised,
  LESSONS, FOUNDATIONS, lp, currentIdx, lessonDone, lessonMastered, chapterUnlocked,
  fRec, foundationLearned, foundationsAllLearned,
} from './course.js';
import { startLevel, quitToMenu, finish } from './quiz.js';
import { renderCourse } from './menu.js';

/* =========================================================================
   INSTALL + DAILY REMINDERS
   A PWA can't schedule its own notification (the Notification Triggers API was
   never shipped), so the nudge is a real web push: the browser subscribes, the
   endpoint goes to /api/subscribe, and an hourly Netlify function decides — per
   learner, in their own timezone — whether tonight deserves a ping.
   ========================================================================= */
let swReg = null, deferredInstall = null, pushKey = null, pushReady = false;

const remToggle  = document.getElementById('remToggle');
const remHourRow = document.getElementById('remHourRow');
const remHourSel = document.getElementById('remHour');
const remSubEl   = document.getElementById('remSub');

for(let h=0; h<24; h++){
  const o = document.createElement('option');
  o.value = h; o.textContent = String(h).padStart(2,'0') + ':00';
  remHourSel.appendChild(o);
}
function setRemSub(t){ remSubEl.textContent = t; }
function hhmm(){ return String(P.hour).padStart(2,'0') + ':00'; }

// VAPID keys travel as base64url; PushManager wants raw bytes.
function b64ToBytes(b64){
  const pad = '='.repeat((4 - b64.length % 4) % 4);
  const raw = atob((b64 + pad).replace(/-/g,'+').replace(/_/g,'/'));
  const out = new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++) out[i] = raw.charCodeAt(i);
  return out;
}

window.addEventListener('load', async ()=>{
  if('serviceWorker' in navigator && location.protocol !== 'file:'){
    try{
      swReg = await navigator.serviceWorker.register('/sw.js');
      watchForUpdates();
    }catch(e){ swReg = null; }
  }
  initReminders();
});

/* =========================================================================
   STAYING ON THE LATEST CODE
   An installed PWA runs from the service worker's cache, so a deploy doesn't
   reach it by itself. Two paths back to fresh code:

   - Automatic: a new sw.js installs in the background and waits. We show the
     "new version ready" banner and let the learner reload when they're not
     mid-lesson — taking over uninvited would kill the round they're playing.
   - Manual: "Check for updates" asks the worker to re-fetch the shell straight
     from the network. That catches a deploy that only touched the HTML, which
     leaves sw.js byte-identical and so raises no update event at all.
   ========================================================================= */
const APP_VERSION = '2.3.1';
let waitingWorker = null, updateRequested = false, reloading = false;

document.getElementById('updVer').textContent = 'Écoute v' + APP_VERSION;

function showUpdateBanner(worker){
  waitingWorker = worker;
  document.getElementById('updBanner').style.display = 'flex';
}

function watchForUpdates(){
  // an update downloaded on a previous visit and is still parked
  if(swReg.waiting && navigator.serviceWorker.controller) showUpdateBanner(swReg.waiting);

  swReg.addEventListener('updatefound', ()=>{
    const w = swReg.installing;
    if(!w) return;
    w.addEventListener('statechange', ()=>{
      // a controller already exists => this is an update, not the first install
      if(w.state === 'installed' && navigator.serviceWorker.controller) showUpdateBanner(w);
    });
  });

  navigator.serviceWorker.addEventListener('controllerchange', ()=>{
    // Fires on the very first install too (activate calls clients.claim), so only
    // reload when the learner actually asked for the update.
    if(!updateRequested || reloading) return;
    reloading = true;
    location.reload();
  });

  swReg.update().catch(()=>{});
  document.addEventListener('visibilitychange', ()=>{
    if(!document.hidden && swReg) swReg.update().catch(()=>{});
  });
}

document.getElementById('updNow').onclick = ()=>{
  updateRequested = true;
  if(waitingWorker){
    waitingWorker.postMessage({ type:'SKIP_WAITING' });
    // if controllerchange never lands, reload anyway rather than hang
    setTimeout(()=>{ if(!reloading){ reloading = true; location.reload(); } }, 2000);
  } else {
    location.reload();
  }
};

// Ask the worker to re-pull the shell past every cache. Resolves true if the
// bytes actually changed.
function refreshShell(){
  return new Promise((resolve)=>{
    const sw = navigator.serviceWorker.controller;
    if(!sw) return resolve(false);
    const done = (v)=>{ navigator.serviceWorker.removeEventListener('message', onMsg); clearTimeout(t); resolve(v); };
    const onMsg = (e)=>{ if(e.data && e.data.type === 'REFRESHED') done(!!e.data.changed); };
    const t = setTimeout(()=> done(false), 8000);
    navigator.serviceWorker.addEventListener('message', onMsg);
    sw.postMessage({ type:'REFRESH' });
  });
}

document.getElementById('updCheck').onclick = async ()=>{
  const btn = document.getElementById('updCheck');
  const reset = (txt)=>{ btn.textContent = txt; setTimeout(()=>{ btn.textContent = '⟳ Check for updates'; btn.disabled = false; }, 2200); };
  btn.disabled = true;
  btn.textContent = 'Checking…';

  if(!swReg){ location.reload(); return; }        // no worker: a plain reload is the update

  try{
    await swReg.update();                          // did sw.js itself change?
    if(swReg.waiting){
      showUpdateBanner(swReg.waiting);
      btn.textContent = 'Update ready ↑';
      btn.disabled = false;
      return;
    }
    // Same worker, but the HTML may still have moved underneath it.
    if(await refreshShell()){
      updateRequested = true; reloading = true;
      location.reload();
      return;
    }
    reset('✓ Up to date');
  }catch(e){
    reset('Check failed');
  }
};

async function initReminders(){
  remHourSel.value = String(P.hour);

  if(!swReg || !('Notification' in window) || !('PushManager' in window)){
    remToggle.disabled = true;
    setRemSub(location.protocol === 'file:'
      ? 'Browsers block notifications on file:// pages — open the app over http(s).'
      : 'This browser can’t receive push notifications. Chrome on Android works best.');
    return;
  }

  let info = null;
  try{ info = await (await fetch('/api/push-key')).json(); }catch(e){}
  if(!info || !info.configured){
    remToggle.disabled = true;
    setRemSub('Reminders are off on this deploy — the site needs VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY set.');
    return;
  }
  pushKey = info.key;
  pushReady = true;

  const sub = await swReg.pushManager.getSubscription();
  const on = !!sub && Notification.permission === 'granted';
  P.push = on; saveProgress();
  remToggle.checked = on;
  remHourRow.style.display = on ? '' : 'none';
  setRemSub(on
    ? `Rémy will ping you at ${hhmm()} — unless you've already practised that day.`
    : 'Let Rémy nudge you once a day, so the streak survives.');
  if(on) syncSubscription();          // refresh timezone / hour / last practice
}

remToggle.onchange = async ()=>{
  if(remToggle.checked){
    setRemSub('Asking your browser…');
    try{ await enableReminders(); }
    catch(err){
      remToggle.checked = false;
      remHourRow.style.display = 'none';
      setRemSub(String((err && err.message) || err));
    }
  } else {
    await disableReminders();
  }
};

remHourSel.onchange = async ()=>{
  P.hour = parseInt(remHourSel.value, 10);
  saveProgress();
  await syncSubscription();
  setRemSub(`C'est noté — Rémy will ping you at ${hhmm()}.`);
};

async function enableReminders(){
  const perm = await Notification.requestPermission();
  if(perm !== 'granted')
    throw new Error(perm === 'denied'
      ? 'Notifications are blocked for this site. Allow them in your browser settings, then flip this back on.'
      : 'Notification permission was dismissed.');

  const sub = await swReg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: b64ToBytes(pushKey),
  });
  const res = await fetch('/api/subscribe', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify(subPayload(sub)),
  });
  if(!res.ok) throw new Error('Could not register this device for reminders.');

  P.push = true;
  P.hour = parseInt(remHourSel.value, 10);
  saveProgress();
  remHourRow.style.display = '';
  setRemSub(`C'est noté — Rémy will ping you at ${hhmm()}.`);
}

async function disableReminders(){
  const sub = swReg && await swReg.pushManager.getSubscription();
  if(sub){
    await fetch('/api/unsubscribe', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ endpoint: sub.endpoint }),
    }).catch(()=>{});
    await sub.unsubscribe().catch(()=>{});
  }
  P.push = false;
  saveProgress();
  remHourRow.style.display = 'none';
  setRemSub('Reminders off. Rémy will wait quietly.');
}

function subPayload(sub){
  return {
    subscription: sub.toJSON(),
    tzOffset: new Date().getTimezoneOffset(),
    hour: parseInt(remHourSel.value, 10),
    lastPracticeDate: P.lastDay,
    streak: liveStreak(),
  };
}

async function syncSubscription(){
  if(!pushReady || !swReg) return;
  const sub = await swReg.pushManager.getSubscription();
  if(!sub) return;
  fetch('/api/subscribe', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify(subPayload(sub)),
  }).catch(()=>{});
}

// Fired the moment a lesson lands: today is covered, so skip tonight's nudge.
async function notifyPracticed(){
  if(!P.push || !swReg) return;
  const sub = await swReg.pushManager.getSubscription();
  if(!sub) return;
  fetch('/api/practiced', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      endpoint: sub.endpoint,
      localDate: todayStr(),
      streak: liveStreak(),
      tzOffset: new Date().getTimezoneOffset(),
    }),
  }).catch(()=>{});
}

document.getElementById('remTest').onclick = async (e)=>{
  e.preventDefault();
  const sub = swReg && await swReg.pushManager.getSubscription();
  if(!sub){ setRemSub('Turn reminders on first.'); return; }
  setRemSub('Sending a test…');
  try{
    const res = await fetch('/api/test-push', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
    const j = await res.json().catch(()=>({}));
    setRemSub(res.ok ? 'Sent — it should land in a second.' : (j.error || 'The test push failed.'));
  }catch(err){
    setRemSub('The test push failed: ' + ((err && err.message) || err));
  }
};

/* ---- "Install" (Chrome fires this only when the PWA is installable) ---- */
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredInstall = e;
  installBtn.style.display = 'block';
});
installBtn.onclick = async ()=>{
  if(!deferredInstall) return;
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null;
  installBtn.style.display = 'none';
};
window.addEventListener('appinstalled', ()=>{ installBtn.style.display = 'none'; });

renderCourse();

// keyboard: space replays, 1/2/3 choose
document.addEventListener('keydown',e=>{
  if(document.getElementById('quiz').style.display==='none') return;
  if(e.code==='Space'){ e.preventDefault(); speak(S.deck[S.idx].p); }
  if(['1','2','3'].includes(e.key)){
    const b=document.querySelectorAll('.opt')[+e.key-1];
    if(b && !b.disabled) b.click();
  }
  if(e.key==='Enter' && !document.getElementById('next').disabled) document.getElementById('next').click();
});

/* The menu's level cards and the "← Menu" buttons used to call startLevel() and
   quitToMenu() through inline onclick attributes, which only worked while every
   function was a global. Modules have no globals, so they are bound here. */
document.querySelectorAll('[data-level]').forEach(el=>{
  el.onclick = ()=> startLevel(+el.dataset.level);
});
document.querySelectorAll('[data-to-menu]').forEach(el=>{
  el.onclick = ()=> quitToMenu();
});

// Practising is what tells the reminder backend to stay quiet tonight.
setOnPractised(notifyPracticed);

/* A deliberate seam for the browser tests. They drive the real app through the
   DOM like a user would, but a few facts (which lesson is current, whether a
   sound counts as mastered) simply aren't in the DOM to read. Nothing in the app
   uses this object. */
window.__ecoute = {
  S, LESSONS, FOUNDATIONS, lp, fRec, saveProgress, renderCourse,
  currentIdx, lessonDone, lessonMastered, chapterUnlocked, finish,
  foundationLearned, foundationsAllLearned,
  get P(){ return P; },
};
