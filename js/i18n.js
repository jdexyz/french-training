/* Écoute — the interface language: 🇬🇧 English or 🇮🇹 Italiano.

   The app is built for Italian speakers (every French word carries its Italian
   gloss), so this toggle is NOT a full UI translation — the buttons stay put.
   What it switches is the TEACHING VOICE: Rémy's coaching and all the Foundations
   theory, plus each Foundation's "for the Italian ear" pronunciation tip.

   Content that has two languages is authored as a plain `{ en, it }` object in
   the data; the renderers pass it through L() to pick the current one. A plain
   string means "same in both" and is returned untouched, so most call sites need
   no change. Default is English; the choice lives in localStorage. */

const LKEY = 'ecoute_lang';

function lang(){ return localStorage.getItem(LKEY) === 'it' ? 'it' : 'en'; }
function setLang(l){ localStorage.setItem(LKEY, l === 'it' ? 'it' : 'en'); }

// Pick the current language out of an {en,it} object; pass strings through.
function L(v){
  if(v == null) return '';
  if(typeof v === 'string') return v;
  return v[lang()] != null ? v[lang()] : (v.en != null ? v.en : '');
}

// The label for the Italian-contrastive tip shown on every Foundation.
function italianTipTitle(){
  return lang() === 'it' ? "Per l'orecchio italiano" : 'For the Italian ear';
}

export { lang, setLang, L, italianTipTitle };
