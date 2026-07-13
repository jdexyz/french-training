/* Small shared helpers. */

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function abToBase64(buf){
  const bytes=new Uint8Array(buf); let bin=''; const chunk=0x8000;
  for(let i=0;i<bytes.length;i+=chunk) bin += String.fromCharCode.apply(null, bytes.subarray(i,i+chunk));
  return btoa(bin);
}

/* ---- days & streak ---- */
function dayStr(d){ const z=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`; }
function todayStr(){ return dayStr(new Date()); }
function yesterdayStr(){ const d = new Date(); d.setDate(d.getDate()-1); return dayStr(d); }

export { shuffle, escapeHtml, abToBase64, dayStr, todayStr, yesterdayStr };
