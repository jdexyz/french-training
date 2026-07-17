/* Écoute — the Foundations: the alphabet and the spelling-to-sound rules.

   These are a DIFFERENT kind of lesson from the sound contrasts in data.js.
   A contrast lesson trains the EAR on a minimal pair (chat / chien). A
   foundation lesson trains the eye and the tongue: it teaches, in plain
   words, how French spelling maps to sound — the alphabet, the accents, when
   "in" is nasal (incroyable) and when it is not (inégal) — then has you SAY
   the examples so Rémy can grade them.

   They sit at the very front of the course and gate the sounds behind them:
   you learn to read the letters before you drill the vowels.

   Shape of one foundation:
     id      stable key for stored progress — never rename a shipped one
     icon    the glyph shown on the path
     title   short name
     goal    one line: what you'll be able to do after it
     theory  the Learn screen — blocks of { h(eading), body, ex:[examples] }
             an example is { fr, ipa, it } and gets a 🔊 button
     drills  the 🎤 Say-it step — { mode:'words'|'sentences', items:[…] }
             a 'words' item is { w, ipa, it }; a 'sentences' item is { s, it }

   Loaded as an ES module (like data.js), so add a lesson here and the course
   picks it up: course.js derives the path, the gating and the progress from
   this array — no app code to touch. */

const FOUNDATIONS = [

  /* ─────────────────────────── 1 · the alphabet ─────────────────────────── */
  {
    id: 'alphabet', icon: '🔤',
    title: 'The French alphabet',
    goal: 'Name all 26 letters the French way — the base for spelling out loud.',
    theory: [
      { h: 'Same letters, different names',
        body: 'French uses the same 26 letters as English, but you SAY most of them differently. Here is the whole alphabet — tap 🔊 on any letter to hear its name.',
        ex: [
          {fr:'A', ipa:'a', it:'a'}, {fr:'B', ipa:'be', it:'bi'}, {fr:'C', ipa:'se', it:'ci'},
          {fr:'D', ipa:'de', it:'di'}, {fr:'E', ipa:'ə', it:'e muta'}, {fr:'F', ipa:'ɛf', it:'effe'},
          {fr:'G', ipa:'ʒe', it:'gi (dolce)'}, {fr:'H', ipa:'aʃ', it:'acca'}, {fr:'I', ipa:'i', it:'i'},
          {fr:'J', ipa:'ʒi', it:'gi'}, {fr:'K', ipa:'ka', it:'ka'}, {fr:'L', ipa:'ɛl', it:'elle'},
          {fr:'M', ipa:'ɛm', it:'emme'}, {fr:'N', ipa:'ɛn', it:'enne'}, {fr:'O', ipa:'o', it:'o'},
          {fr:'P', ipa:'pe', it:'pi'}, {fr:'Q', ipa:'ky', it:'cu'}, {fr:'R', ipa:'ɛʁ', it:'erre'},
          {fr:'S', ipa:'ɛs', it:'esse'}, {fr:'T', ipa:'te', it:'ti'}, {fr:'U', ipa:'y', it:'u francese'},
          {fr:'V', ipa:'ve', it:'vi'}, {fr:'W', ipa:'dubləve', it:'doppia vu'}, {fr:'X', ipa:'iks', it:'ics'},
          {fr:'Y', ipa:'iɡʁɛk', it:'i greca'}, {fr:'Z', ipa:'zɛd', it:'zeta'},
        ],
      },
      { h: 'The ones that trip you up',
        body: 'A few names are the opposite of what an English or Italian speaker expects: <b>G</b> is /ʒe/ and <b>J</b> is /ʒi/ — swapped. <b>U</b> is the tight /y/, not "oo". <b>Y</b> is "i grec" (Greek i) and <b>W</b> is "double v".',
        ex: [
          {fr:'G', ipa:'ʒe', it:'gi dolce'}, {fr:'J', ipa:'ʒi', it:'gi'},
          {fr:'U', ipa:'y', it:'u francese'}, {fr:'Y', ipa:'iɡʁɛk', it:'i greca'},
          {fr:'W', ipa:'dubləve', it:'doppia vu'},
        ],
      },
    ],
    drills: { mode: 'words', items: [
      {w:'A', ipa:'a', it:''}, {w:'E', ipa:'ə', it:''}, {w:'G', ipa:'ʒe', it:''},
      {w:'H', ipa:'aʃ', it:''}, {w:'J', ipa:'ʒi', it:''}, {w:'Q', ipa:'ky', it:''},
      {w:'R', ipa:'ɛʁ', it:''}, {w:'U', ipa:'y', it:''}, {w:'W', ipa:'dubləve', it:''},
      {w:'Y', ipa:'iɡʁɛk', it:''}, {w:'Z', ipa:'zɛd', it:''},
    ] },
  },

  /* ─────────────────────────── 2 · accents & ç ──────────────────────────── */
  {
    id: 'accents', icon: '🎵',
    title: 'Accents & the cédille',
    goal: 'Read é, è, ê, à, ç — and know which marks change the sound.',
    theory: [
      { h: 'The accents on e',
        body: 'The e is the only vowel whose accent really changes the sound. <b>é</b> (accent aigu) is a closed /e/, smiling. <b>è</b> and <b>ê</b> (grave, circonflexe) are an open /ɛ/, jaw dropped.',
        ex: [
          {fr:'été', ipa:'ete', it:'estate'}, {fr:'café', ipa:'kafe', it:'caffè'},
          {fr:'père', ipa:'pɛʁ', it:'padre'}, {fr:'tête', ipa:'tɛt', it:'testa'},
          {fr:'très', ipa:'tʁɛ', it:'molto'},
        ],
      },
      { h: 'The other marks barely change the sound',
        body: 'On a, u, i, o the accent mostly just tells two words apart or marks a letter that vanished long ago (often an s): <b>à</b> vs <b>a</b>, <b>où</b> vs <b>ou</b>, forê<b>t</b> = "forest". The <b>ô</b> is a clean /o/.',
        ex: [
          {fr:'à', ipa:'a', it:'a / verso'}, {fr:'où', ipa:'u', it:'dove'},
          {fr:'hôtel', ipa:'otɛl', it:'albergo'}, {fr:'île', ipa:'il', it:'isola'},
          {fr:'forêt', ipa:'foʁɛ', it:'foresta'},
        ],
      },
      { h: 'The cédille ç',
        body: 'The little hook under <b>ç</b> makes a c say /s/ even before a, o, u — where a plain c would say /k/. It exists only to keep the soft sound.',
        ex: [
          {fr:'ça', ipa:'sa', it:'ciò'}, {fr:'garçon', ipa:'ɡaʁsɔ̃', it:'ragazzo'},
          {fr:'français', ipa:'fʁɑ̃sɛ', it:'francese'}, {fr:'leçon', ipa:'ləsɔ̃', it:'lezione'},
        ],
      },
    ],
    drills: { mode: 'sentences', items: [
      {s:"l'été", it:"l'estate"}, {s:'un café', it:'un caffè'}, {s:'mon père', it:'mio padre'},
      {s:'très bien', it:'molto bene'}, {s:'un garçon français', it:'un ragazzo francese'},
      {s:'une leçon', it:'una lezione'}, {s:"l'hôtel", it:"l'albergo"}, {s:'la forêt', it:'la foresta'},
    ] },
  },

  /* ─────────────────────── 3 · u /y/ vs ou /u/ ──────────────────────────── */
  {
    id: 'u-vs-ou', icon: '🇺',
    title: 'u /y/ vs ou /u/',
    goal: 'Split the two sounds that swap words: tu vs tout, dessus vs dessous.',
    theory: [
      { h: 'u = /y/ — the tight French u',
        body: 'There is no English "oo" here. Say the vowel of "ee", then — keeping your tongue exactly there — round your lips as if to whistle. That is /y/.',
        ex: [
          {fr:'tu', ipa:'ty', it:'tu'}, {fr:'rue', ipa:'ʁy', it:'via'},
          {fr:'lune', ipa:'lyn', it:'luna'}, {fr:'sur', ipa:'syʁ', it:'su'}, {fr:'une', ipa:'yn', it:'una'},
        ],
      },
      { h: 'ou = /u/ — the deep oo',
        body: 'The letters <b>ou</b> together make one sound, /u/: lips pushed forward, tongue back. This is the "oo" of "food".',
        ex: [
          {fr:'tout', ipa:'tu', it:'tutto'}, {fr:'nous', ipa:'nu', it:'noi'},
          {fr:'jour', ipa:'ʒuʁ', it:'giorno'}, {fr:'amour', ipa:'amuʁ', it:'amore'},
        ],
      },
      { h: 'Hear them side by side',
        body: 'The whole meaning rides on this one vowel. Round-and-tight vs deep-and-back:',
        ex: [
          {fr:'dessus', ipa:'dəsy', it:'sopra'}, {fr:'dessous', ipa:'dəsu', it:'sotto'},
          {fr:'pur', ipa:'pyʁ', it:'puro'}, {fr:'pour', ipa:'puʁ', it:'per'},
        ],
      },
    ],
    drills: { mode: 'sentences', items: [
      {s:'tu', it:'tu'}, {s:'tout', it:'tutto'}, {s:'la rue', it:'la via'}, {s:'la roue', it:'la ruota'},
      {s:'au-dessus', it:'sopra'}, {s:'au-dessous', it:'sotto'}, {s:'la lune', it:'la luna'}, {s:'bonjour', it:'buongiorno'},
    ] },
  },

  /* ─────────────────────────── 4 · vowel teams ──────────────────────────── */
  {
    id: 'vowel-teams', icon: '🔡',
    title: 'Vowel teams',
    goal: 'Two letters, one sound: au/eau, oi, eu, ai.',
    theory: [
      { h: 'au, eau = /o/',
        body: 'These never say "a-u". As a team they are a plain closed /o/.',
        ex: [
          {fr:'chaud', ipa:'ʃo', it:'caldo'}, {fr:'beau', ipa:'bo', it:'bello'},
          {fr:'eau', ipa:'o', it:'acqua'}, {fr:'gâteau', ipa:'ɡato', it:'torta'},
        ],
      },
      { h: 'oi = /wa/',
        body: 'The pair <b>oi</b> is always /wa/ — a quick "w" then an open "a".',
        ex: [
          {fr:'moi', ipa:'mwa', it:'me'}, {fr:'trois', ipa:'tʁwa', it:'tre'},
          {fr:'voiture', ipa:'vwatyʁ', it:'automobile'}, {fr:'boire', ipa:'bwaʁ', it:'bere'},
        ],
      },
      { h: 'eu, œu = /ø/ or /œ/',
        body: 'Round your lips as for /o/ but keep the tongue forward, as for /e/. Closed /ø/ at the end of a word, opener /œ/ before a consonant.',
        ex: [
          {fr:'deux', ipa:'dø', it:'due'}, {fr:'feu', ipa:'fø', it:'fuoco'},
          {fr:'sœur', ipa:'sœʁ', it:'sorella'}, {fr:'fleur', ipa:'flœʁ', it:'fiore'},
        ],
      },
      { h: 'ai, ei = /ɛ/',
        body: 'The teams <b>ai</b> and <b>ei</b> are an open /ɛ/, the same sound as è.',
        ex: [
          {fr:'mais', ipa:'mɛ', it:'ma'}, {fr:'maison', ipa:'mɛzɔ̃', it:'casa'},
          {fr:'lait', ipa:'lɛ', it:'latte'}, {fr:'neige', ipa:'nɛʒ', it:'neve'},
        ],
      },
    ],
    drills: { mode: 'sentences', items: [
      {s:'il fait chaud', it:'fa caldo'}, {s:'un beau gâteau', it:'una bella torta'},
      {s:'moi et toi', it:'io e te'}, {s:'trois voitures', it:'tre automobili'},
      {s:'deux fleurs', it:'due fiori'}, {s:'ma sœur', it:'mia sorella'},
      {s:'une maison', it:'una casa'}, {s:'du lait', it:'del latte'},
    ] },
  },

  /* ───────────────────────────── 5 · the letter c ───────────────────────── */
  {
    id: 'letter-c', icon: '🅲',
    title: 'The letter c',
    goal: 'c is /k/ or /s/ — the next letter decides.',
    theory: [
      { h: 'Hard c = /k/',
        body: 'Before <b>a, o, u</b> or a consonant, c is a hard /k/.',
        ex: [
          {fr:'café', ipa:'kafe', it:'caffè'}, {fr:'cou', ipa:'ku', it:'collo'},
          {fr:'cube', ipa:'kyb', it:'cubo'}, {fr:'classe', ipa:'klas', it:'classe'},
        ],
      },
      { h: 'Soft c = /s/',
        body: 'Before <b>e, i, y</b>, c softens to /s/.',
        ex: [
          {fr:'ce', ipa:'sə', it:'questo'}, {fr:'cinéma', ipa:'sinema', it:'cinema'},
          {fr:'merci', ipa:'mɛʁsi', it:'grazie'}, {fr:'cycle', ipa:'sikl', it:'ciclo'},
        ],
      },
      { h: 'ç for the soft sound before a/o/u',
        body: 'When you need the /s/ before a, o or u, the cédille steps in (see the accents lesson): ça, garçon.',
        ex: [
          {fr:'ça', ipa:'sa', it:'ciò'}, {fr:'garçon', ipa:'ɡaʁsɔ̃', it:'ragazzo'},
        ],
      },
    ],
    drills: { mode: 'sentences', items: [
      {s:'un café', it:'un caffè'}, {s:'merci beaucoup', it:'grazie mille'},
      {s:'le cinéma', it:'il cinema'}, {s:'ça va', it:'come va'},
      {s:'un garçon', it:'un ragazzo'}, {s:'la classe', it:'la classe'},
    ] },
  },

  /* ───────────────────────────── 6 · the letter g ───────────────────────── */
  {
    id: 'letter-g', icon: '🅶',
    title: 'The letter g',
    goal: 'g is /g/ or /ʒ/ — the same trick as c.',
    theory: [
      { h: 'Hard g = /g/',
        body: 'Before <b>a, o, u</b> or a consonant, g is the hard /g/ of "go".',
        ex: [
          {fr:'gare', ipa:'ɡaʁ', it:'stazione'}, {fr:'grand', ipa:'ɡʁɑ̃', it:'grande'},
          {fr:'légume', ipa:'leɡym', it:'verdura'},
        ],
      },
      { h: 'Soft g = /ʒ/',
        body: 'Before <b>e, i, y</b>, g becomes the soft /ʒ/ — the sound in "measure", or Italian gi without the d.',
        ex: [
          {fr:'gentil', ipa:'ʒɑ̃ti', it:'gentile'}, {fr:'girafe', ipa:'ʒiʁaf', it:'giraffa'},
          {fr:'manger', ipa:'mɑ̃ʒe', it:'mangiare'},
        ],
      },
      { h: 'The gu and ge tricks',
        body: 'To keep a hard g before e/i, French adds a silent u: <b>gu</b>erre. To keep a soft g before a/o, it adds a silent e: nous man<b>ge</b>ons.',
        ex: [
          {fr:'guitare', ipa:'ɡitaʁ', it:'chitarra'}, {fr:'guerre', ipa:'ɡɛʁ', it:'guerra'},
          {fr:'nous mangeons', ipa:'nu mɑ̃ʒɔ̃', it:'noi mangiamo'},
        ],
      },
    ],
    drills: { mode: 'sentences', items: [
      {s:'la gare', it:'la stazione'}, {s:'un grand gâteau', it:'una grande torta'},
      {s:"c'est gentil", it:'è gentile'}, {s:'je vais manger', it:'vado a mangiare'},
      {s:'une guitare', it:'una chitarra'}, {s:'nous mangeons', it:'noi mangiamo'},
    ] },
  },

  /* ───────────────────────────── 7 · the letter s ───────────────────────── */
  {
    id: 'letter-s', icon: '🐍',
    title: 'The letter s',
    goal: 's = /s/, but /z/ between two vowels.',
    theory: [
      { h: 's = /s/',
        body: 'At the start of a word or next to a consonant, s is a clean /s/. A double <b>ss</b> is always /s/ too.',
        ex: [
          {fr:'salut', ipa:'saly', it:'ciao'}, {fr:'sport', ipa:'spɔʁ', it:'sport'},
          {fr:'poisson', ipa:'pwasɔ̃', it:'pesce'},
        ],
      },
      { h: 'One s between two vowels = /z/',
        body: 'Trapped between two vowels, a single s buzzes into /z/.',
        ex: [
          {fr:'rose', ipa:'ʁoz', it:'rosa'}, {fr:'maison', ipa:'mɛzɔ̃', it:'casa'},
          {fr:'chose', ipa:'ʃoz', it:'cosa'}, {fr:'cousine', ipa:'kuzin', it:'cugina'},
        ],
      },
      { h: 'poison vs poisson',
        body: 'This is why French doubles the s: one s /z/ = <b>poison</b>; two ss /s/ = <b>poisson</b> (a fish). Same trick behind dessert / désert.',
        ex: [
          {fr:'poison', ipa:'pwazɔ̃', it:'veleno'}, {fr:'poisson', ipa:'pwasɔ̃', it:'pesce'},
        ],
      },
    ],
    drills: { mode: 'sentences', items: [
      {s:'salut', it:'ciao'}, {s:'une rose', it:'una rosa'}, {s:'une maison', it:'una casa'},
      {s:'une chose', it:'una cosa'}, {s:'un poisson', it:'un pesce'},
      {s:'du poison', it:'del veleno'}, {s:'ma cousine', it:'mia cugina'},
    ] },
  },

  /* ───────────────────────────── 8 · digraphs ───────────────────────────── */
  {
    id: 'digraphs', icon: '🔗',
    title: 'ch · gn · ph · th · qu',
    goal: 'Letter pairs that make one sound.',
    theory: [
      { h: 'ch = /ʃ/',
        body: 'Never "k" here: <b>ch</b> is the "sh" of "ship".',
        ex: [
          {fr:'chat', ipa:'ʃa', it:'gatto'}, {fr:'chien', ipa:'ʃjɛ̃', it:'cane'},
          {fr:'chocolat', ipa:'ʃokola', it:'cioccolato'},
        ],
      },
      { h: 'gn = /ɲ/',
        body: 'Exactly the Italian <b>gn</b> of "gnocchi" — a soft ny.',
        ex: [
          {fr:'montagne', ipa:'mɔ̃taɲ', it:'montagna'}, {fr:'ligne', ipa:'liɲ', it:'linea'},
          {fr:'agneau', ipa:'aɲo', it:'agnello'},
        ],
      },
      { h: 'ph = /f/, th = /t/, qu = /k/',
        body: '<b>ph</b> is just /f/; <b>th</b> is a plain /t/ (no English lisp); <b>qu</b> is /k/ — the u is silent.',
        ex: [
          {fr:'photo', ipa:'foto', it:'foto'}, {fr:'thé', ipa:'te', it:'tè'},
          {fr:'quatre', ipa:'katʁ', it:'quattro'}, {fr:'musique', ipa:'myzik', it:'musica'},
        ],
      },
    ],
    drills: { mode: 'sentences', items: [
      {s:'un chat', it:'un gatto'}, {s:'du chocolat', it:'del cioccolato'},
      {s:'la montagne', it:'la montagna'}, {s:'une photo', it:'una foto'},
      {s:'un thé', it:'un tè'}, {s:'quatre', it:'quattro'}, {s:'la pharmacie', it:'la farmacia'},
    ] },
  },

  /* ─────────────────────── 9 · nasal /ɔ̃/ — on / om ─────────────────────── */
  {
    id: 'nasal-on', icon: '👃',
    title: 'Nasal /ɔ̃/ — on, om',
    goal: 'The round nasal — and never a real "n".',
    theory: [
      { h: 'on, om = /ɔ̃/',
        body: 'Round your lips as for /o/ and let the air run through your nose. The crucial part: you do NOT pronounce the n — it only nasalises the vowel.',
        ex: [
          {fr:'bon', ipa:'bɔ̃', it:'buono'}, {fr:'non', ipa:'nɔ̃', it:'no'},
          {fr:'nom', ipa:'nɔ̃', it:'nome'}, {fr:'maison', ipa:'mɛzɔ̃', it:'casa'},
        ],
      },
      { h: 'Before b or p, the n is written m',
        body: 'A spelling habit, not a new sound: before b/p the nasal is written <b>om</b>. Still /ɔ̃/.',
        ex: [
          {fr:'nombre', ipa:'nɔ̃bʁ', it:'numero'}, {fr:'tomber', ipa:'tɔ̃be', it:'cadere'},
          {fr:'comprendre', ipa:'kɔ̃pʁɑ̃dʁ', it:'capire'},
        ],
      },
    ],
    drills: { mode: 'sentences', items: [
      {s:"c'est bon", it:'è buono'}, {s:'non merci', it:'no grazie'}, {s:'mon nom', it:'il mio nome'},
      {s:'une maison', it:'una casa'}, {s:'un nombre', it:'un numero'}, {s:'je comprends', it:'capisco'},
    ] },
  },

  /* ──────────────────── 10 · nasal /ɑ̃/ — an / en ───────────────────────── */
  {
    id: 'nasal-an', icon: '👃',
    title: 'Nasal /ɑ̃/ — an, en',
    goal: 'The open nasal — and yes, en usually sounds like an.',
    theory: [
      { h: 'an, am, en, em = /ɑ̃/',
        body: 'Open your mouth wide, send the air through the nose, drop the consonant. The surprise for beginners: <b>en</b> and <b>em</b> normally give /ɑ̃/, not /ɛ̃/.',
        ex: [
          {fr:'grand', ipa:'ɡʁɑ̃', it:'grande'}, {fr:'temps', ipa:'tɑ̃', it:'tempo'},
          {fr:'enfant', ipa:'ɑ̃fɑ̃', it:'bambino'}, {fr:'chambre', ipa:'ʃɑ̃bʁ', it:'camera'},
        ],
      },
      { h: 'Round /ɔ̃/ or open /ɑ̃/?',
        body: 'Same nose, different mouth: <b>on</b> keeps the lips rounded (/ɔ̃/), <b>an/en</b> opens them wide (/ɑ̃/). Compare son and sans.',
        ex: [
          {fr:'son', ipa:'sɔ̃', it:'suono'}, {fr:'sans', ipa:'sɑ̃', it:'senza'},
          {fr:'trente ans', ipa:'tʁɑ̃t ɑ̃', it:"trent'anni"},
        ],
      },
    ],
    drills: { mode: 'sentences', items: [
      {s:'un grand enfant', it:'un bambino grande'}, {s:'il fait beau temps', it:'fa bel tempo'},
      {s:'dans la chambre', it:'nella camera'}, {s:'on mange ensemble', it:'mangiamo insieme'},
      {s:'comment', it:'come'}, {s:'trente ans', it:"trent'anni"},
    ] },
  },

  /* ─────────────── 11 · nasal /ɛ̃/ — in / ain / un / oin ────────────────── */
  {
    id: 'nasal-in', icon: '👃',
    title: 'Nasal /ɛ̃/ — in, ain, un',
    goal: 'The bright nasal, as in vin and pain.',
    theory: [
      { h: 'in, im, ain, ein, yn = /ɛ̃/',
        body: 'One bright nasal vowel hides behind many spellings. Mouth fairly open, lips spread, air through the nose, no n.',
        ex: [
          {fr:'vin', ipa:'vɛ̃', it:'vino'}, {fr:'pain', ipa:'pɛ̃', it:'pane'},
          {fr:'main', ipa:'mɛ̃', it:'mano'}, {fr:'plein', ipa:'plɛ̃', it:'pieno'},
          {fr:'important', ipa:'ɛ̃pɔʁtɑ̃', it:'importante'},
        ],
      },
      { h: 'un, um ≈ the same sound',
        body: 'Textbooks call <b>un</b> a separate nasal /œ̃/, but most speakers today merge it into /ɛ̃/. Say un like the start of "vin".',
        ex: [
          {fr:'un', ipa:'œ̃', it:'un / uno'}, {fr:'brun', ipa:'bʁœ̃', it:'castano'},
          {fr:'lundi', ipa:'lœ̃di', it:'lunedì'}, {fr:'parfum', ipa:'paʁfœ̃', it:'profumo'},
        ],
      },
      { h: 'oin = /wɛ̃/',
        body: 'Put a quick "w" in front of the bright nasal and you get <b>oin</b>.',
        ex: [
          {fr:'loin', ipa:'lwɛ̃', it:'lontano'}, {fr:'point', ipa:'pwɛ̃', it:'punto'},
          {fr:'besoin', ipa:'bəzwɛ̃', it:'bisogno'},
        ],
      },
    ],
    drills: { mode: 'sentences', items: [
      {s:'du vin', it:'del vino'}, {s:'du pain', it:'del pane'}, {s:'ma main', it:'la mia mano'},
      {s:"c'est important", it:'è importante'}, {s:'un parfum', it:'un profumo'},
      {s:"c'est loin", it:'è lontano'}, {s:"j'ai besoin", it:'ho bisogno'},
    ] },
  },

  /* ─────────── 12 · when in/on/an is NOT nasal — the exception ───────────── */
  {
    id: 'denasal', icon: '🚫',
    title: 'When it is NOT nasal',
    goal: 'incroyable vs inégal: the rule that turns the nasal off.',
    theory: [
      { h: 'The rule in one line',
        body: 'A nasal spelling (in, on, an, en…) is only nasal when the n/m <b>closes the syllable</b> — i.e. a consonant follows, or the word ends. If a <b>vowel follows</b>, or the <b>n/m is doubled</b>, the vowel goes back to normal and you DO pronounce the n or m.',
      },
      { h: 'in- : incroyable vs inégal',
        body: 'Same prefix, opposite sound. In <b>in·croyable</b> the n meets a consonant → nasal /ɛ̃/. In <b>i·nutile</b>, <b>i·négal</b> the n meets a vowel → a plain /i/ and a fully-sounded n.',
        ex: [
          {fr:'incroyable', ipa:'ɛ̃kʁwajabl', it:'incredibile'}, {fr:'inutile', ipa:'inytil', it:'inutile'},
          {fr:'inégal', ipa:'ineɡal', it:'disuguale'}, {fr:'inoubliable', ipa:'inublijabl', it:'indimenticabile'},
        ],
      },
      { h: 'A doubled n or m kills the nasal',
        body: 'One n nasalises; two do not. Watch a word switch as it grows: bon → bonne, an → année, and im- + m stays oral in immense.',
        ex: [
          {fr:'bon', ipa:'bɔ̃', it:'buono (m.)'}, {fr:'bonne', ipa:'bɔn', it:'buona (f.)'},
          {fr:'année', ipa:'ane', it:'anno'}, {fr:'immense', ipa:'imɑ̃s', it:'immenso'},
        ],
      },
    ],
    drills: { mode: 'sentences', items: [
      {s:'incroyable', it:'incredibile'}, {s:'inutile', it:'inutile'}, {s:'inégal', it:'disuguale'},
      {s:'il est bon', it:'è buono'}, {s:'elle est bonne', it:'è buona'},
      {s:'une bonne année', it:'un buon anno'}, {s:"c'est immense", it:'è immenso'},
    ] },
  },

  /* ─────────────────── 13 · silent final consonants ─────────────────────── */
  {
    id: 'silent-finals', icon: '🔇',
    title: 'Silent final consonants',
    goal: 'Most final consonants are silent — but not all.',
    theory: [
      { h: 'The default: silent',
        body: 'The last consonant of a word is usually NOT pronounced, and a final <b>e</b> is silent too. You write more than you say.',
        ex: [
          {fr:'petit', ipa:'pəti', it:'piccolo'}, {fr:'grand', ipa:'ɡʁɑ̃', it:'grande'},
          {fr:'nez', ipa:'ne', it:'naso'}, {fr:'trop', ipa:'tʁo', it:'troppo'},
        ],
      },
      { h: 'CaReFuL — c, r, f, l often stay',
        body: 'A handy memory hook: the letters in "Ca-Re-Fu-L" (c, r, f, l) are the final consonants most likely to be SOUNDED.',
        ex: [
          {fr:'sac', ipa:'sak', it:'borsa'}, {fr:'hiver', ipa:'ivɛʁ', it:'inverno'},
          {fr:'chef', ipa:'ʃɛf', it:'capo'}, {fr:'animal', ipa:'animal', it:'animale'},
        ],
      },
      { h: 'The big exception: -er = /e/',
        body: 'A final r is DROPPED in the verb ending -er and in -ier words, leaving a clean /e/.',
        ex: [
          {fr:'parler', ipa:'paʁle', it:'parlare'}, {fr:'premier', ipa:'pʁəmje', it:'primo'},
        ],
      },
    ],
    drills: { mode: 'sentences', items: [
      {s:'un petit chat', it:'un piccolo gatto'}, {s:'il est grand', it:'è grande'},
      {s:'avec toi', it:'con te'}, {s:'un sac', it:'una borsa'},
      {s:'le chef', it:'il capo'}, {s:'parler français', it:'parlare francese'},
    ] },
  },

  /* ───────────────────── 14 · silent verb endings ───────────────────────── */
  {
    id: 'silent-verbs', icon: '🤫',
    title: 'Silent verb endings',
    goal: '-e, -es, -ent: written, never said.',
    theory: [
      { h: 'je parle = ils parlent',
        body: 'The endings <b>-e, -es, -ent</b> of a present-tense verb are all silent. Three different spellings, one sound. A verb\'s <b>-ent</b> is NEVER a nasal.',
        ex: [
          {fr:'je parle', ipa:'ʒə paʁl', it:'io parlo'}, {fr:'ils parlent', ipa:'il paʁl', it:'loro parlano'},
          {fr:'elles chantent', ipa:'ɛl ʃɑ̃t', it:'loro cantano'},
        ],
      },
      { h: '-er, -ez = /e/',
        body: 'The infinitive -er and the vous form -ez both land on a closed /e/.',
        ex: [
          {fr:'vous parlez', ipa:'vu paʁle', it:'voi parlate'}, {fr:'chanter', ipa:'ʃɑ̃te', it:'cantare'},
        ],
      },
      { h: 'Careful: a noun/adverb -ent IS nasal',
        body: 'Only the VERB ending -ent is silent. In an adverb or noun, -ent is the nasal /ɑ̃/: sou<b>vent</b>, mo<b>ment</b>.',
        ex: [
          {fr:'souvent', ipa:'suvɑ̃', it:'spesso'}, {fr:'un moment', ipa:'œ̃ mɔmɑ̃', it:'un momento'},
        ],
      },
    ],
    drills: { mode: 'sentences', items: [
      {s:'je parle', it:'io parlo'}, {s:'ils parlent', it:'loro parlano'},
      {s:'vous parlez', it:'voi parlate'}, {s:'elles chantent', it:'loro cantano'},
      {s:'souvent', it:'spesso'}, {s:'un moment', it:'un momento'},
    ] },
  },

  /* ─────────────────────── 15 · the -ille ending ────────────────────────── */
  {
    id: 'ille', icon: '🔚',
    title: 'The -ille ending',
    goal: 'fille, travail, soleil: the /j/ sound of "yes".',
    theory: [
      { h: 'ill / ille = /ij/ or /j/',
        body: 'Usually the double l here is not an "l" at all but a /j/ — the y of "yes". After another vowel it is just /j/: trava<b>il</b>, sole<b>il</b>, boute<b>ille</b>.',
        ex: [
          {fr:'fille', ipa:'fij', it:'ragazza'}, {fr:'famille', ipa:'famij', it:'famiglia'},
          {fr:'travail', ipa:'tʁavaj', it:'lavoro'}, {fr:'soleil', ipa:'solɛj', it:'sole'},
        ],
      },
      { h: 'The stubborn /il/ words',
        body: 'A short list keeps a real "l": <b>ville</b>, <b>mille</b>, <b>tranquille</b>. These you just memorise.',
        ex: [
          {fr:'ville', ipa:'vil', it:'città'}, {fr:'mille', ipa:'mil', it:'mille'},
          {fr:'tranquille', ipa:'tʁɑ̃kil', it:'tranquillo'},
        ],
      },
    ],
    drills: { mode: 'sentences', items: [
      {s:'une fille', it:'una ragazza'}, {s:'ma famille', it:'la mia famiglia'},
      {s:'le travail', it:'il lavoro'}, {s:'le soleil', it:'il sole'},
      {s:'une bouteille', it:'una bottiglia'}, {s:'la ville', it:'la città'},
    ] },
  },

  /* ────────────── 16 · h muet, élision & liaison ────────────────────────── */
  {
    id: 'liaison', icon: '🔗',
    title: 'Silent h, élision & liaison',
    goal: 'How French words melt into each other.',
    theory: [
      { h: 'h is always silent',
        body: 'French never voices an h. It is written but never heard.',
        ex: [
          {fr:'homme', ipa:'ɔm', it:'uomo'}, {fr:'heure', ipa:'œʁ', it:'ora'},
          {fr:'hôtel', ipa:'otɛl', it:'albergo'},
        ],
      },
      { h: 'Élision — the dropped vowel',
        body: 'Before a vowel (or silent h), little words lose their own vowel and glue on with an apostrophe: le/la → l\', je → j\', de → d\'.',
        ex: [
          {fr:"l'homme", ipa:'lɔm', it:"l'uomo"}, {fr:"j'ai", ipa:'ʒe', it:'ho'},
          {fr:"l'heure", ipa:'lœʁ', it:"l'ora"},
        ],
      },
      { h: 'Liaison — the consonant wakes up',
        body: 'A normally-silent final consonant is PRONOUNCED when the next word starts with a vowel, and links across: les‿amis sounds /le-z-ami/, c\'est‿un /sɛ-t-œ̃/.',
        ex: [
          {fr:'les amis', ipa:'le‿z‿ami', it:'gli amici'}, {fr:'vous avez', ipa:'vu‿z‿ave', it:'voi avete'},
          {fr:"c'est un ami", ipa:'sɛ‿t‿œ̃‿n‿ami', it:'è un amico'},
        ],
      },
    ],
    drills: { mode: 'sentences', items: [
      {s:'un homme', it:'un uomo'}, {s:"l'hôtel", it:"l'albergo"}, {s:"j'ai faim", it:'ho fame'},
      {s:'les amis', it:'gli amici'}, {s:'vous avez', it:'voi avete'},
      {s:'nous avons', it:'noi abbiamo'}, {s:"c'est un ami", it:'è un amico'},
    ] },
  },

  /* ─────────────────── 17 · the French R & the e muet ───────────────────── */
  {
    id: 'r-and-schwa', icon: '🌀',
    title: 'The French R & the mute e',
    goal: 'The throat R, and the little e that disappears.',
    theory: [
      { h: 'R = /ʁ/, made in the throat',
        body: 'The French R is not rolled on the tongue-tip like the Italian or Spanish r. It is a soft scrape at the BACK of the throat — closer to a gentle gargle, near the sound of clearing your throat.',
        ex: [
          {fr:'rue', ipa:'ʁy', it:'via'}, {fr:'Paris', ipa:'paʁi', it:'Parigi'},
          {fr:'rouge', ipa:'ʁuʒ', it:'rosso'}, {fr:'mercredi', ipa:'mɛʁkʁədi', it:'mercoledì'},
        ],
      },
      { h: 'The e muet — the vanishing e',
        body: 'A short unstressed <b>e</b> is often dropped in everyday speech. "Petit" becomes /p(ə)ti/, and "je ne sais pas" collapses to /ʒənsɛpa/.',
        ex: [
          {fr:'petit', ipa:'p(ə)ti', it:'piccolo'}, {fr:'samedi', ipa:'samdi', it:'sabato'},
          {fr:'maintenant', ipa:'mɛ̃tnɑ̃', it:'adesso'},
        ],
      },
    ],
    drills: { mode: 'sentences', items: [
      {s:'la rue', it:'la via'}, {s:'je viens de Paris', it:'vengo da Parigi'},
      {s:'du vin rouge', it:'del vino rosso'}, {s:'mercredi', it:'mercoledì'},
      {s:'un petit chat', it:'un piccolo gatto'}, {s:'je ne sais pas', it:'non lo so'},
    ] },
  },

];

export { FOUNDATIONS };
