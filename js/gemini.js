/* Écoute — the pronunciation grader.

   Everything that talks to Gemini lives here: the API key (kept in this browser
   and sent straight to Google, never to us), the two prompts, and the dual-judge
   scoring. Two graders are asked independently and must AGREE that a take is
   correct — that trims false positives without adding false negatives.

   A classic script, like data.js — everything here is global by design. */

const GEMINI_MODEL = 'gemini-3.5-flash';      // newer audio model — better ear for fine vowel/nasal calls
const SPEAK_LEN = 10;                          // words per round

function geminiKey(){ return localStorage.getItem('ecoute_gemini_key') || ''; }
function setGeminiKey(k){ localStorage.setItem('ecoute_gemini_key', k.trim()); }

import { abToBase64 } from './util.js';

function buildGradeBody(item, b64){
  const word = item.w, ipa = item.ipa;
  const conf = item.confusions || [];
  const confLine = conf.length
    ? `A common mistake is to replace its vowel with that of ${conf.map(c=>`"${c.w}"${c.ipa?` /${c.ipa}/`:''}`).join(' or ')}; mark it incorrect and set leansToward to that word ONLY if you clearly hear that specific substitution.`
    : ``;
  return {
    contents:[{ parts:[
      { text:
        `You are a precise but fair French pronunciation coach grading an advanced learner. Decide whether the recording is a correct pronunciation of the single French word "${word}"${ipa?` whose correct pronunciation is /${ipa}/`:``}. `
        + `Compare the vowel (and any nasal) the learner produced against the target${ipa?` /${ipa}/`:''}. Give the benefit of the doubt: if the vowel is consistent with the target it is CORRECT, even with a mild non-native accent — and even for short words that are naturally ambiguous in isolation. French nasal vowels /ɑ̃/, /ɔ̃/, /ɛ̃/ resemble each other out of context, so do NOT fail a correct target vowel merely because it could resemble a neighbour. `
        + confLine + ` `
        + `Only mark it incorrect when the vowel is CLEARLY a different sound from the target. Ignore background noise, microphone quality and volume. If the clip is empty or silent, score 0 and mark it incorrect. `
        + `Scoring guide — 90-100: matches the target vowel, native-like; 70-89: target vowel right, mild accent (correct=true); 40-69: vowel noticeably wrong or drifts to a different sound (correct=false); below 40: a clearly different word. Respond as JSON.` },
      { inline_data:{ mime_type:'audio/wav', data: b64 } }
    ]}],
    generationConfig:{
      // Gemini 3.x can't fully disable thinking; "minimal" = lowest latency.
      // Temperature left at the model default (recommended for Gemini 3).
      thinkingConfig:{ thinkingLevel:'minimal' },
      responseMimeType:'application/json',
      responseSchema:{
        type:'OBJECT',
        properties:{
          score:{type:'INTEGER', description:'0-100 per the scoring guide; correct=true needs >=70'},
          correct:{type:'BOOLEAN', description:'true if the vowel matches the target sound (mild accent fine; isolation ambiguity is not a fault); false only when the vowel is clearly a different sound'},
          heard:{type:'STRING', description:'the closest real French word(s) it actually sounded like, or its IPA'},
          leansToward:{type:'STRING', description:'only if you clearly hear the target vowel replaced by a neighbour’s vowel, name that word; otherwise empty string'},
          feedback:{type:'STRING', description:'one concrete articulatory tip (tongue height/position, lip rounding, nasality) in English, max 30 words'}
        },
        required:['score','correct','heard','leansToward','feedback']
      }
    }
  };
}

async function gradeOnce(body, key){
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;
  let res;
  try{ res = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); }
  catch(e){ throw new Error('Network error reaching Gemini.'); }
  if(!res.ok){
    let detail=''; try{ const j=await res.json(); detail = j?.error?.message || ''; }catch(e){}
    if(res.status===400 && /API key/i.test(detail)) throw new Error('Invalid API key. Use ⚙︎ Change Gemini key.');
    if(res.status===403) throw new Error('Key rejected (403). Enable the Generative Language API for it.');
    if(res.status===429) throw new Error('Rate limit reached (429). Wait a moment and retry.');
    throw new Error(`Gemini error ${res.status}${detail?': '+detail.slice(0,140):''}`);
  }
  const j = await res.json();
  const text = j?.candidates?.[0]?.content?.parts?.[0]?.text;
  if(!text) throw new Error('Empty response from Gemini.');
  let out; try{ out = JSON.parse(text); }catch(e){ throw new Error('Could not read Gemini response.'); }
  out.score = Math.max(0, Math.min(100, parseInt(out.score,10)||0));
  out.correct = !!out.correct;
  out.leansToward = (out.leansToward||'').trim();
  return out;
}

// Two independent graders are sent at once. Passing requires BOTH to agree the
// pronunciation is correct, which trims false positives without adding false
// negatives; scores are averaged and the stricter judge's feedback is shown.
function mergeVerdicts(a, b){
  const strict = (a.score <= b.score) ? a : b;     // harsher judge drives the notes
  return {
    score: Math.round((a.score + b.score)/2),
    correct: a.correct && b.correct,
    heard: strict.heard || a.heard || b.heard || '',
    leansToward: (a.leansToward || b.leansToward || '').trim(),
    feedback: strict.feedback || a.feedback || b.feedback || ''
  };
}

async function analyzePronunciation(item, wavBuf){
  const key = geminiKey();
  if(!key) throw new Error('No Gemini key set.');
  const body = buildGradeBody(item, abToBase64(wavBuf));
  const settled = await Promise.allSettled([ gradeOnce(body, key), gradeOnce(body, key) ]);
  const oks = settled.filter(s=>s.status==='fulfilled').map(s=>s.value);
  if(!oks.length) throw (settled[0].reason || new Error('Grading failed.'));
  return oks.length===2 ? mergeVerdicts(oks[0], oks[1]) : oks[0];   // one survivor still usable
}

/* ---- Level 5: grade a whole spoken sentence, naming the words that are off ---- */
function buildSentenceBody(sentence, b64){
  return {
    contents:[{ parts:[
      { text:
        `You are a precise but fair French pronunciation coach. The learner read this French sentence aloud (a sentence about French / European law):\n"${sentence}"\n`
        + `Listen to the recording and judge their pronunciation word by word. List the specific words from the sentence that are mispronounced — wrong vowel or consonant, missing/incorrect liaison, wrong word, or clearly misplaced stress. `
        + `Give the benefit of the doubt for a mild non-native accent: only flag a word if its error would actually stand out to a native listener. For each flagged word give a short, concrete tip. Use the exact spelling of the word as it appears in the sentence. `
        + `Ignore background noise, microphone quality and volume. If the recording is empty or does not match the sentence, score 0 and mark it not passed. `
        + `Scoring guide — 90-100: fluent, native-like; 75-89: clear with a mild accent; 50-74: understandable but several words are off; below 50: hard to follow or wrong sentence. Respond as JSON.` },
      { inline_data:{ mime_type:'audio/wav', data: b64 } }
    ]}],
    generationConfig:{
      thinkingConfig:{ thinkingLevel:'minimal' },
      responseMimeType:'application/json',
      responseSchema:{
        type:'OBJECT',
        properties:{
          score:{type:'INTEGER', description:'0-100 per the scoring guide'},
          passed:{type:'BOOLEAN', description:'true if the sentence is well pronounced overall (a mild accent is fine, no word stands out as wrong)'},
          mistakes:{type:'ARRAY', description:'words that are mispronounced; empty if none',
            items:{ type:'OBJECT', properties:{
              word:{type:'STRING', description:'the exact word from the sentence'},
              issue:{type:'STRING', description:'short, concrete tip on what was wrong, max 15 words'}
            }, required:['word','issue'] } },
          feedback:{type:'STRING', description:'one short overall tip in English, max 25 words'}
        },
        required:['score','passed','mistakes','feedback']
      }
    }
  };
}

function mergeSentenceVerdicts(a, b){
  const byWord = new Map();
  [...(a.mistakes||[]), ...(b.mistakes||[])].forEach(m=>{
    const k = (m.word||'').toLowerCase().trim();
    if(k && !byWord.has(k)) byWord.set(k, {word:m.word, issue:m.issue||''});
  });
  return {
    score: Math.round((a.score + b.score)/2),
    passed: !!a.passed && !!b.passed,                 // both judges must agree it's clean
    mistakes: [...byWord.values()],                   // union — surface anything either judge caught
    feedback: (a.score<=b.score?a:b).feedback || a.feedback || b.feedback || ''
  };
}

async function analyzeSentence(item, wavBuf){
  const key = geminiKey();
  if(!key) throw new Error('No Gemini key set.');
  const body = buildSentenceBody(item.s, abToBase64(wavBuf));
  const norm = v=>{
    v.score = Math.max(0, Math.min(100, parseInt(v.score,10)||0));
    v.passed = !!v.passed;
    v.mistakes = Array.isArray(v.mistakes) ? v.mistakes.filter(m=>m && m.word) : [];
    return v;
  };
  const settled = await Promise.allSettled([ gradeOnce(body, key).then(norm), gradeOnce(body, key).then(norm) ]);
  const oks = settled.filter(s=>s.status==='fulfilled').map(s=>s.value);
  if(!oks.length) throw (settled[0].reason || new Error('Grading failed.'));
  return oks.length===2 ? mergeSentenceVerdicts(oks[0], oks[1]) : oks[0];
}

export { GEMINI_MODEL, SPEAK_LEN, geminiKey, setGeminiKey, analyzePronunciation, analyzeSentence };
