/* The speak flow: record the learner, ask Gemini, show the verdict.

   Serves Level 4 (words), Level 5 (law sentences), Level 6 (your own sentence)
   AND the course's 🎤 steps and ⚖️ chapters. S.courseCtx is what tells it which.

   The recorder is private to this module: Web Audio in, 16-bit mono WAV @16kHz
   out — a format Gemini accepts on every browser, unlike webm/opus. */

import { S } from './state.js';
import { LAW_SENTENCES, LAW_LEN, SENT_EXAMPLES, TRANS } from './data.js';
import { shuffle, escapeHtml } from './util.js';
import { speak } from './audio.js';
import { SPEAK_LEN, geminiKey, setGeminiKey, analyzePronunciation, analyzeSentence } from './gemini.js';
import { L1_WORDS } from './course.js';
import { show, quitToMenu } from './quiz.js';
import { beginCourseSpeakDeck, finishCourseSpeak } from './lesson.js';

function itemText(it){ return S.speakMode==='words' ? it.w : it.s; }

function startSpeak(){
  S.courseCtx = null;                     // free practice, not a course step
  S.speakMode = S.level===5 ? 'sentences' : S.level===6 ? 'custom' : 'words';
  document.getElementById('plabel').textContent =
    S.level===5 ? 'Level 5 · Law aloud' : S.level===6 ? 'Level 6 · Your sentence' : 'Level 4 · Speak';
  show('pronounce');
  if(!geminiKey()){ showKeyPanel(); return; }
  proceedAfterKey();
}

// after a key is confirmed, go to the course step, the sentence box (L6),
// or straight to the free-practice S.deck (L4/L5)
function proceedAfterKey(){
  if(S.courseCtx) beginCourseSpeakDeck();
  else if(S.speakMode==='custom') showSentencePanel();
  else beginSpeakDeck();
}

function showKeyPanel(){
  document.getElementById('speakPanel').style.display='none';
  document.getElementById('sentencePanel').style.display='none';
  document.getElementById('keyPanel').style.display='';
  document.getElementById('keyInput').value = geminiKey();
  setTimeout(()=> document.getElementById('keyInput').focus(), 50);
}

document.getElementById('keySave').onclick = ()=>{
  const k = document.getElementById('keyInput').value.trim();
  if(!k){ document.getElementById('keyInput').focus(); return; }
  setGeminiKey(k);
  document.getElementById('keyPanel').style.display='none';
  proceedAfterKey();
};
document.getElementById('changeKey').onclick = (e)=>{ e.preventDefault(); abortRecording(); showKeyPanel(); };

function showSentencePanel(){
  document.getElementById('speakPanel').style.display='none';
  document.getElementById('keyPanel').style.display='none';
  document.getElementById('sentencePanel').style.display='';
  setTimeout(()=> document.getElementById('sentInput').focus(), 50);
}
document.getElementById('sentExample').onclick = (e)=>{
  e.preventDefault();
  const ta = document.getElementById('sentInput');
  // rotate through examples without Math.random (kept deterministic-safe)
  const used = ta.value.trim();
  const next = SENT_EXAMPLES.find(s=>s!==used) || SENT_EXAMPLES[0];
  ta.value = next; ta.focus();
};
document.getElementById('sentStart').onclick = ()=>{
  const text = document.getElementById('sentInput').value.trim();
  if(!text){ document.getElementById('sentInput').focus(); return; }
  startCustomSentence(text);
};
function startCustomSentence(text){
  document.getElementById('sentencePanel').style.display='none';
  document.getElementById('speakPanel').style.display='';
  S.speakDeck = [{s:text, it:''}];
  S.sidx=0; S.spassed=0; S.sresults=[]; S.passedSet=new Set();
  renderSpeak();
  setTimeout(()=> speak(text, false), 250);   // propose the audio right away
}

function beginSpeakDeck(){
  document.getElementById('speakPanel').style.display='';
  S.speakDeck = (S.speakMode==='sentences')
    ? shuffle(LAW_SENTENCES).slice(0, LAW_LEN)
    : shuffle(L1_WORDS).slice(0, SPEAK_LEN);
  S.sidx=0; S.spassed=0; S.sresults=[]; S.passedSet=new Set();
  renderSpeak();
}

function renderSpeak(){
  const item = S.speakDeck[S.sidx];
  const sentenceMode = S.speakMode!=='words';
  if(S.speakMode==='custom'){
    document.getElementById('pcounter').textContent = 'Your sentence';
    document.getElementById('pbar').style.width = '0%';
  } else {
    const unit = sentenceMode ? 'Sentence' : 'Word';
    document.getElementById('pcounter').textContent = `${unit} ${S.sidx+1} / ${S.speakDeck.length} · ${S.spassed} ✓`;
    document.getElementById('pbar').style.width = `${S.sidx/S.speakDeck.length*100}%`;
  }
  const wordEl = document.getElementById('pwWord');
  if(sentenceMode){
    wordEl.textContent = item.s; wordEl.className = 'pw-fr sentence';
    document.getElementById('pwIpa').textContent = '';
  } else {
    wordEl.textContent = item.w; wordEl.className = 'pw-fr';
    document.getElementById('pwIpa').textContent = item.ipa ? `/${item.ipa}/` : '';
  }
  document.getElementById('pwTrans').textContent = item.it ? `🇮🇹 ${item.it}` : '';
  const v = document.getElementById('verdict'); v.className='verdict'; v.innerHTML='';
  if(S.speakMode==='custom'){
    document.getElementById('pNext').disabled = false;
    document.getElementById('pNext').textContent = '✏️ New sentence';
  } else {
    document.getElementById('pNext').disabled = true;
    document.getElementById('pNext').textContent = (S.sidx+1<S.speakDeck.length)?'Next →':'See results';
  }
  document.getElementById('pRetry').style.display='none';
  setRecUI('idle');
}

document.getElementById('pwHear').onclick = ()=> speak(itemText(S.speakDeck[S.sidx]), false);
document.getElementById('pNext').onclick = ()=>{
  if(S.speakMode==='custom'){ showSentencePanel(); return; }
  if(S.sidx+1<S.speakDeck.length){ S.sidx++; renderSpeak(); } else finishSpeak();
};
document.getElementById('pRetry').onclick = ()=> renderSpeak();

/* ---- recording (Web Audio -> WAV) ---- */
let recState='idle', mediaStream=null, audioCtx=null, srcNode=null, procNode=null, sinkNode=null, recChunks=[], recRate=44100, autoStopTimer=null;
const recBtn = document.getElementById('recBtn');

function setRecUI(state){
  recState = state;
  recBtn.classList.toggle('recording', state==='recording');
  recBtn.classList.toggle('analyzing', state==='analyzing');
  recBtn.textContent = state==='recording' ? '⏹' : state==='analyzing' ? '⏳' : '🎤';
  const hint = document.getElementById('recHint');
  hint.textContent = state==='recording' ? 'Recording… tap to stop.'
                   : state==='analyzing' ? 'Sending to Gemini…'
                   : (S.speakMode!=='words' ? 'Tap, read the sentence aloud, then tap again to stop.'
                                          : 'Tap, say the word clearly, then tap again to stop.');
}

recBtn.onclick = async ()=>{
  if(recState==='idle'){
    try{ await beginRecording(); }
    catch(err){
      const v=document.getElementById('verdict'); v.className='verdict show bad';
      v.innerHTML = `<div class="vmain">🎙️ Microphone unavailable</div>
        <div class="vtip">${escapeHtml(micErrorHint(err))}</div>`;
      return;
    }
    setRecUI('recording');
    autoStopTimer = setTimeout(()=>{ if(recState==='recording') recBtn.click(); }, S.speakMode==='custom'?20000:S.speakMode==='sentences'?14000:6000); // safety cap
  } else if(recState==='recording'){
    clearTimeout(autoStopTimer);
    const wav = endRecording();
    setRecUI('analyzing');
    const item = S.speakDeck[S.sidx];
    try{
      if(S.speakMode!=='words') showSentenceVerdict(await analyzeSentence(item, wav));
      else                    showVerdict(await analyzePronunciation(item, wav));
    }catch(err){
      const v=document.getElementById('verdict'); v.className='verdict show bad';
      v.innerHTML = `<div class="vmain">⚠️ Couldn't grade that</div>
        <div class="vtip">${escapeHtml(String(err.message||err))}</div>`;
      document.getElementById('pRetry').style.display='';
    }
    setRecUI('idle');
  }
};

async function beginRecording(){
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    const e = new Error('This browser/context has no microphone access.'); e.name='NotFoundError'; throw e;
  }
  mediaStream = await navigator.mediaDevices.getUserMedia({audio:true});
  audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==='suspended'){ try{ await audioCtx.resume(); }catch(e){} }
  recRate = audioCtx.sampleRate;
  srcNode = audioCtx.createMediaStreamSource(mediaStream);
  procNode = audioCtx.createScriptProcessor(4096,1,1);
  sinkNode = audioCtx.createGain(); sinkNode.gain.value = 0;   // silent sink (no mic echo)
  recChunks = [];
  procNode.onaudioprocess = e=> recChunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  srcNode.connect(procNode); procNode.connect(sinkNode); sinkNode.connect(audioCtx.destination);
}

function endRecording(){
  if(procNode){ procNode.disconnect(); procNode.onaudioprocess=null; }
  if(srcNode) srcNode.disconnect();
  if(sinkNode) sinkNode.disconnect();
  if(mediaStream) mediaStream.getTracks().forEach(t=>t.stop());
  const fromRate = recRate;
  if(audioCtx){ audioCtx.close(); audioCtx=null; }
  const len = recChunks.reduce((s,c)=>s+c.length,0);
  const data = new Float32Array(len);
  let off=0; for(const c of recChunks){ data.set(c,off); off+=c.length; }
  recChunks=[];
  const down = downsample(data, fromRate, 16000);
  return encodeWAV(down, 16000);
}

function abortRecording(){            // called when leaving Level 4 mid-record
  if(recState==='idle') return;
  clearTimeout(autoStopTimer);
  try{ endRecording(); }catch(e){}
  setRecUI('idle');
}

function downsample(buf, from, to){
  if(to>=from) return buf;
  const ratio = from/to, newLen = Math.round(buf.length/ratio), out = new Float32Array(newLen);
  let oi=0, ii=0;
  while(oi<newLen){
    const next = Math.round((oi+1)*ratio); let sum=0,cnt=0;
    for(; ii<next && ii<buf.length; ii++){ sum+=buf[ii]; cnt++; }
    out[oi++] = cnt ? sum/cnt : 0;
  }
  return out;
}

function encodeWAV(samples, rate){
  const buffer = new ArrayBuffer(44 + samples.length*2), view = new DataView(buffer);
  const wr=(o,s)=>{ for(let i=0;i<s.length;i++) view.setUint8(o+i, s.charCodeAt(i)); };
  wr(0,'RIFF'); view.setUint32(4,36+samples.length*2,true); wr(8,'WAVE');
  wr(12,'fmt '); view.setUint32(16,16,true); view.setUint16(20,1,true); view.setUint16(22,1,true);
  view.setUint32(24,rate,true); view.setUint32(28,rate*2,true); view.setUint16(32,2,true); view.setUint16(34,16,true);
  wr(36,'data'); view.setUint32(40,samples.length*2,true);
  let off=44;
  for(let i=0;i<samples.length;i++,off+=2){
    const s=Math.max(-1,Math.min(1,samples[i]));
    view.setInt16(off, s<0 ? s*0x8000 : s*0x7FFF, true);
  }
  return buffer;
}



function micErrorHint(err){
  const n = err && err.name;
  if(n==='NotAllowedError') return 'Microphone permission was blocked. Allow mic access for this page and try again.';
  if(n==='NotFoundError')  return 'No microphone was found on this device.';
  if(location.protocol==='file:') return 'Browsers block the mic on file:// pages. Open this file over http(s) or localhost (e.g. the deployed site).';
  return (err && err.message) || 'Could not start the microphone.';
}


function highlightSentence(sentence, mistakes){
  let html = escapeHtml(sentence);
  (mistakes||[]).forEach(m=>{
    const w = (m.word||'').trim(); if(!w) return;
    const re = new RegExp('('+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')', 'gi');
    html = html.replace(re, '<span class="badword">$1</span>');
  });
  return html;
}

function showSentenceVerdict(v){
  S.sresults[S.sidx] = v;
  if(v.passed && !S.passedSet.has(S.sidx)){ S.passedSet.add(S.sidx); S.spassed++; }
  document.getElementById('pcounter').textContent =
    (S.speakMode==='custom') ? 'Your sentence' : `Sentence ${S.sidx+1} / ${S.speakDeck.length} · ${S.spassed} ✓`;
  const item = S.speakDeck[S.sidx];
  const el = document.getElementById('verdict');
  el.className = 'verdict show ' + (v.passed?'good':'bad');
  const list = (v.mistakes && v.mistakes.length)
    ? `<ul class="mistakes">` + v.mistakes.map(m=>
        `<li><b>${escapeHtml(m.word)}</b>${m.issue?` — ${escapeHtml(m.issue)}`:''}</li>`).join('') + `</ul>`
    : `<div class="vheard" style="color:var(--good)">Every word sounded good! 🎉</div>`;
  el.innerHTML =
    `<div class="vscore">${v.score}<span>/100</span></div>
     <div class="vmain">${v.passed?'✓ Well pronounced':'✗ Some words need work'}</div>
     <div class="sentence-hl">${highlightSentence(item.s, v.mistakes)}</div>
     ${list}
     ${v.feedback?`<div class="vtip">💡 ${escapeHtml(v.feedback)}</div>`:''}`;
  document.getElementById('pNext').disabled = false;
  document.getElementById('pRetry').style.display='';
}

function showVerdict(v){
  S.sresults[S.sidx] = v;
  if(v.correct && !S.passedSet.has(S.sidx)){ S.passedSet.add(S.sidx); S.spassed++; }
  document.getElementById('pcounter').textContent = `Word ${S.sidx+1} / ${S.speakDeck.length} · ${S.spassed} ✓`;
  const el = document.getElementById('verdict');
  el.className = 'verdict show ' + (v.correct?'good':'bad');
  el.innerHTML =
    `<div class="vscore">${v.score}<span>/100</span></div>
     <div class="vmain">${v.correct?'✓ Native-sounding':'✗ Vowel not quite there'}</div>
     ${v.heard?`<div class="vheard">Sounded like: <b>${escapeHtml(v.heard)}</b></div>`:''}
     ${v.leansToward?`<div class="vheard">Your vowel leans toward: <b>${escapeHtml(v.leansToward)}</b></div>`:''}
     ${v.feedback?`<div class="vtip">💡 ${escapeHtml(v.feedback)}</div>`:''}`;
  document.getElementById('pNext').disabled = false;
  document.getElementById('pRetry').style.display='';
}

function finishSpeak(){
  abortRecording();
  show('result');
  document.getElementById('bar').style.width='100%';
  if(S.courseCtx){ finishCourseSpeak(); return; }

  document.getElementById('resultRemy').style.display='none';
  document.getElementById('nextLessonBtn').style.display='none';
  document.getElementById('retryBtn').className='btn';
  document.getElementById('retryBtn').textContent='Try again';
  document.getElementById('retryBtn').onclick = ()=> startLevel(S.level);
  const unit = (S.speakMode==='sentences') ? 'sentences' : 'words';
  document.getElementById('finalScore').textContent = `${S.spassed} / ${S.speakDeck.length}`;
  const pct = S.spassed/S.speakDeck.length;
  let msg = pct===1 ? `Bravo ! Every ${unit==='sentences'?'sentence':'word'} came through clearly. 🎙️🇫🇷`
          : pct>=.7 ? `Très bien ! Most of your ${unit} were spot on.`
          : pct>=.4 ? "Pas mal ! Replay the reference and mimic it closely."
          : "Bon courage ! Listen first, then copy the rhythm and vowels.";
  document.getElementById('resultMsg').textContent = msg;

  const ml = document.getElementById('missedList');
  const rows = S.speakDeck.map((it,i)=>({it, v:S.sresults[i], i})).filter(r=>!S.passedSet.has(r.i));
  if(!rows.length){
    ml.innerHTML = `<p style="color:var(--good);text-align:center">Perfect pronunciation — nothing to practise! 🎉</p>`;
  } else if(S.speakMode==='sentences'){
    ml.innerHTML = `<p style="color:var(--muted);margin:0 0 8px">Sentences to practise:</p>` +
      rows.map(r=>`<div style="padding:10px 12px;background:var(--card2);border-radius:10px;margin-bottom:6px">
        <span style="color:var(--accent2)">${escapeHtml(r.it.s)}</span>
        ${r.v&&r.v.mistakes&&r.v.mistakes.length
          ? `<br><span style="color:var(--muted);font-size:.85rem">Watch: ${r.v.mistakes.map(m=>`<b style="color:var(--bad)">${escapeHtml(m.word)}</b>`).join(', ')}</span>`
          : (r.v&&r.v.feedback?`<br><span style="color:var(--muted);font-size:.85rem">💡 ${escapeHtml(r.v.feedback)}</span>`:'')}</div>`).join('');
  } else {
    ml.innerHTML = `<p style="color:var(--muted);margin:0 0 8px">Words to practise:</p>` +
      rows.map(r=>`<div style="padding:8px 12px;background:var(--card2);border-radius:10px;margin-bottom:6px">
        <span style="color:var(--accent2)">${r.it.w}</span>${r.it.ipa?` <span style="color:var(--muted)">/${r.it.ipa}/</span>`:''}${r.it.it?` <span style="color:var(--muted);font-style:italic">— 🇮🇹 ${r.it.it}</span>`:''}
        ${r.v&&r.v.feedback?`<br><span style="color:var(--muted);font-size:.85rem">💡 ${escapeHtml(r.v.feedback)}</span>`:''}</div>`).join('');
  }
}

export {
  startSpeak, proceedAfterKey, showKeyPanel, showSentencePanel, beginSpeakDeck,
  renderSpeak, setRecUI, abortRecording, finishSpeak, itemText,
};
