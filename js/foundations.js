/* Écoute — the Foundations: the alphabet and the spelling-to-sound rules.

   These are a DIFFERENT kind of lesson from the sound contrasts in data.js.
   A contrast lesson trains the EAR on a minimal pair (chat / chien). A
   foundation lesson trains the eye and the tongue: it teaches, in plain
   words, how French spelling maps to sound — the alphabet, the accents, when
   "in" is nasal (incroyable) and when it is not (inégal) — then has you SAY
   the examples so Rémy can grade them.

   They sit at the very front of the course and gate the sounds behind them:
   you learn to read the letters before you drill the vowels.

   BILINGUAL. The teaching text is authored twice, as { en, it } — the Learn
   screen shows whichever the learner picked (see js/i18n.js, default English).
   The French/IPA and the Italian gloss on each example are the same in both.
   Each foundation also carries an `italian` tip: pronunciation advice written
   from an Italian speaker's point of view (what sound has no Italian
   equivalent, the classic Italian-accent traps).

   Shape of one foundation:
     id      stable key for stored progress — never rename a shipped one
     icon    the glyph shown on the path
     title   short name (French terms — the same in both languages)
     goal    { en, it }: one line, what you'll be able to do after it
     theory  the Learn screen — blocks of { h:{en,it}, body:{en,it}, ex:[…] }
             an example is { fr, ipa, it } and gets a 🔊 button
     italian { en, it }: the "for the Italian ear" pronunciation tip
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
    goal: {
      en: 'Name all 26 letters the French way — the base for spelling out loud.',
      it: 'Nomina tutte e 26 le lettere alla francese — la base per fare lo spelling.',
    },
    theory: [
      { h: { en: 'Same letters, different names', it: 'Stesse lettere, nomi diversi' },
        body: {
          en: 'French uses the same 26 letters as English, but you SAY most of them differently. Here is the whole alphabet — tap 🔊 on any letter to hear its name.',
          it: 'Il francese usa le stesse 26 lettere dell\'italiano, ma i NOMI si dicono in modo diverso. Ecco tutto l\'alfabeto — tocca 🔊 su una lettera per sentirne il nome.',
        },
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
      { h: { en: 'The ones that trip you up', it: 'Quelle che ti ingannano' },
        body: {
          en: 'A few names are the opposite of what an English or Italian speaker expects: <b>G</b> is /ʒe/ and <b>J</b> is /ʒi/ — swapped. <b>U</b> is the tight /y/, not "oo". <b>Y</b> is "i grec" (Greek i) and <b>W</b> is "double v".',
          it: 'Alcuni nomi sono l\'opposto di quello che si aspetta un italiano: <b>G</b> è /ʒe/ e <b>J</b> è /ʒi/ — scambiati. <b>U</b> è la /y/ chiusa, non «u». <b>Y</b> è «i grec» (i greca) e <b>W</b> è «doppia v».',
        },
        ex: [
          {fr:'G', ipa:'ʒe', it:'gi dolce'}, {fr:'J', ipa:'ʒi', it:'gi'},
          {fr:'U', ipa:'y', it:'u francese'}, {fr:'Y', ipa:'iɡʁɛk', it:'i greca'},
          {fr:'W', ipa:'dubləve', it:'doppia vu'},
        ],
      },
    ],
    italian: {
      en: 'Two Italian reflexes to drop right away: French E is a mute /ə/ (not "e"), and R is scraped in the throat, never rolled. And Italian has no /y/ at all — that is exactly the letter U.',
      it: 'Due riflessi italiani da abbandonare subito: la E francese è una /ə/ muta (non «e»), e la R si raschia in gola, mai arrotata. E l\'italiano non ha affatto la /y/: è proprio la lettera U.',
    },
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
    goal: {
      en: 'Read é, è, ê, à, ç — and know which marks change the sound.',
      it: 'Leggi é, è, ê, à, ç — e sappi quali accenti cambiano il suono.',
    },
    theory: [
      { h: { en: 'The accents on e', it: 'Gli accenti sulla e' },
        body: {
          en: 'The e is the only vowel whose accent really changes the sound. <b>é</b> (accent aigu) is a closed /e/, smiling. <b>è</b> and <b>ê</b> (grave, circonflexe) are an open /ɛ/, jaw dropped.',
          it: 'La e è l\'unica vocale il cui accento cambia davvero il suono. <b>é</b> (accento acuto) è una /e/ chiusa, sorridente. <b>è</b> ed <b>ê</b> (grave, circonflesso) sono una /ɛ/ aperta, con la mascella abbassata.',
        },
        ex: [
          {fr:'été', ipa:'ete', it:'estate'}, {fr:'café', ipa:'kafe', it:'caffè'},
          {fr:'père', ipa:'pɛʁ', it:'padre'}, {fr:'tête', ipa:'tɛt', it:'testa'},
          {fr:'très', ipa:'tʁɛ', it:'molto'},
        ],
      },
      { h: { en: 'The other marks barely change the sound', it: 'Gli altri accenti quasi non cambiano il suono' },
        body: {
          en: 'On a, u, i, o the accent mostly just tells two words apart or marks a letter that vanished long ago (often an s): <b>à</b> vs <b>a</b>, <b>où</b> vs <b>ou</b>, forê<b>t</b> = "forest". The <b>ô</b> is a clean /o/.',
          it: 'Su a, u, i, o l\'accento per lo più distingue solo due parole o segna una lettera sparita da secoli (spesso una s): <b>à</b> vs <b>a</b>, <b>où</b> vs <b>ou</b>, forê<b>t</b> = «foresta». La <b>ô</b> è una /o/ pulita.',
        },
        ex: [
          {fr:'à', ipa:'a', it:'a / verso'}, {fr:'où', ipa:'u', it:'dove'},
          {fr:'hôtel', ipa:'otɛl', it:'albergo'}, {fr:'île', ipa:'il', it:'isola'},
          {fr:'forêt', ipa:'foʁɛ', it:'foresta'},
        ],
      },
      { h: { en: 'The cédille ç', it: 'La cédille ç' },
        body: {
          en: 'The little hook under <b>ç</b> makes a c say /s/ even before a, o, u — where a plain c would say /k/. It exists only to keep the soft sound.',
          it: 'Il gancetto sotto la <b>ç</b> fa dire /s/ a una c anche davanti ad a, o, u — dove una c normale direbbe /k/. Serve solo a mantenere il suono dolce.',
        },
        ex: [
          {fr:'ça', ipa:'sa', it:'ciò'}, {fr:'garçon', ipa:'ɡaʁsɔ̃', it:'ragazzo'},
          {fr:'français', ipa:'fʁɑ̃sɛ', it:'francese'}, {fr:'leçon', ipa:'ləsɔ̃', it:'lezione'},
        ],
      },
    ],
    italian: {
      en: 'Careful: French é/è are not the Italian é/è. French é is tighter than in "perché", and è/ê are as open as in "caffè". Keep the two clearly apart — many words differ only by that.',
      it: 'Attenzione: la é/è francese non è la é/è italiana. La é francese è più chiusa che in «perché», mentre è/ê sono aperte come in «caffè». Tienile ben distinte — molte parole differiscono solo per quello.',
    },
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
    goal: {
      en: 'Split the two sounds that swap words: tu vs tout, dessus vs dessous.',
      it: 'Separa i due suoni che scambiano le parole: tu vs tout, dessus vs dessous.',
    },
    theory: [
      { h: { en: 'u = /y/ — the tight French u', it: 'u = /y/ — la u francese chiusa' },
        body: {
          en: 'There is no English "oo" here. Say the vowel of "ee", then — keeping your tongue exactly there — round your lips as if to whistle. That is /y/.',
          it: 'Qui non c\'è nessuna «u» all\'italiana. Di\' la vocale di «i», e — tenendo la lingua esattamente lì — arrotonda le labbra come per fischiare. Ecco la /y/.',
        },
        ex: [
          {fr:'tu', ipa:'ty', it:'tu'}, {fr:'rue', ipa:'ʁy', it:'via'},
          {fr:'lune', ipa:'lyn', it:'luna'}, {fr:'sur', ipa:'syʁ', it:'su'}, {fr:'une', ipa:'yn', it:'una'},
        ],
      },
      { h: { en: 'ou = /u/ — the deep oo', it: 'ou = /u/ — la u profonda' },
        body: {
          en: 'The letters <b>ou</b> together make one sound, /u/: lips pushed forward, tongue back. This is the "oo" of "food".',
          it: 'Le lettere <b>ou</b> insieme fanno un solo suono, /u/: labbra in avanti, lingua indietro. È la «u» italiana di «uva».',
        },
        ex: [
          {fr:'tout', ipa:'tu', it:'tutto'}, {fr:'nous', ipa:'nu', it:'noi'},
          {fr:'jour', ipa:'ʒuʁ', it:'giorno'}, {fr:'amour', ipa:'amuʁ', it:'amore'},
        ],
      },
      { h: { en: 'Hear them side by side', it: 'Ascoltale a confronto' },
        body: {
          en: 'The whole meaning rides on this one vowel. Round-and-tight vs deep-and-back:',
          it: 'Tutto il significato si gioca su questa vocale. Chiusa-e-arrotondata contro profonda-e-arretrata:',
        },
        ex: [
          {fr:'dessus', ipa:'dəsy', it:'sopra'}, {fr:'dessous', ipa:'dəsu', it:'sotto'},
          {fr:'pur', ipa:'pyʁ', it:'puro'}, {fr:'pour', ipa:'puʁ', it:'per'},
        ],
      },
    ],
    italian: {
      en: 'This is THE hard one for Italians. Your "u" is already /u/, so ou is easy — but /y/ (the letter u) simply does not exist in Italian. Say Italian "i", then round your lips WITHOUT moving your tongue. If tu comes out like tout, you slipped back to /u/.',
      it: 'Questo è IL suono difficile per un italiano. La tua «u» è già /u/, quindi ou è facile — ma la /y/ (la lettera u) in italiano non esiste proprio. Di\' «i», poi arrotonda le labbra SENZA muovere la lingua. Se «tu» ti esce come «tout», sei ricaduto sulla /u/.',
    },
    drills: { mode: 'sentences', items: [
      {s:'tu', it:'tu'}, {s:'tout', it:'tutto'}, {s:'la rue', it:'la via'}, {s:'la roue', it:'la ruota'},
      {s:'au-dessus', it:'sopra'}, {s:'au-dessous', it:'sotto'}, {s:'la lune', it:'la luna'}, {s:'bonjour', it:'buongiorno'},
    ] },
  },

  /* ─────────────────────────── 4 · vowel teams ──────────────────────────── */
  {
    id: 'vowel-teams', icon: '🔡',
    title: 'Vowel teams',
    goal: {
      en: 'Two letters, one sound: au/eau, oi, eu, ai.',
      it: 'Due lettere, un suono: au/eau, oi, eu, ai.',
    },
    theory: [
      { h: { en: 'au, eau = /o/', it: 'au, eau = /o/' },
        body: {
          en: 'These never say "a-u". As a team they are a plain closed /o/.',
          it: 'Non si leggono mai «a-u». Come squadra sono una /o/ chiusa.',
        },
        ex: [
          {fr:'chaud', ipa:'ʃo', it:'caldo'}, {fr:'beau', ipa:'bo', it:'bello'},
          {fr:'eau', ipa:'o', it:'acqua'}, {fr:'gâteau', ipa:'ɡato', it:'torta'},
        ],
      },
      { h: { en: 'oi = /wa/', it: 'oi = /wa/' },
        body: {
          en: 'The pair <b>oi</b> is always /wa/ — a quick "w" then an open "a".',
          it: 'La coppia <b>oi</b> è sempre /wa/ — una «u» rapida e poi una «a» aperta.',
        },
        ex: [
          {fr:'moi', ipa:'mwa', it:'me'}, {fr:'trois', ipa:'tʁwa', it:'tre'},
          {fr:'voiture', ipa:'vwatyʁ', it:'automobile'}, {fr:'boire', ipa:'bwaʁ', it:'bere'},
        ],
      },
      { h: { en: 'eu, œu = /ø/ or /œ/', it: 'eu, œu = /ø/ o /œ/' },
        body: {
          en: 'Round your lips as for /o/ but keep the tongue forward, as for /e/. Closed /ø/ at the end of a word, opener /œ/ before a consonant.',
          it: 'Arrotonda le labbra come per /o/ ma tieni la lingua in avanti, come per /e/. /ø/ chiusa a fine parola, /œ/ più aperta davanti a consonante.',
        },
        ex: [
          {fr:'deux', ipa:'dø', it:'due'}, {fr:'feu', ipa:'fø', it:'fuoco'},
          {fr:'sœur', ipa:'sœʁ', it:'sorella'}, {fr:'fleur', ipa:'flœʁ', it:'fiore'},
        ],
      },
      { h: { en: 'ai, ei = /ɛ/', it: 'ai, ei = /ɛ/' },
        body: {
          en: 'The teams <b>ai</b> and <b>ei</b> are an open /ɛ/, the same sound as è.',
          it: 'Le squadre <b>ai</b> ed <b>ei</b> sono una /ɛ/ aperta, lo stesso suono di è.',
        },
        ex: [
          {fr:'mais', ipa:'mɛ', it:'ma'}, {fr:'maison', ipa:'mɛzɔ̃', it:'casa'},
          {fr:'lait', ipa:'lɛ', it:'latte'}, {fr:'neige', ipa:'nɛʒ', it:'neve'},
        ],
      },
    ],
    italian: {
      en: 'None of these read the Italian way. French oi is /wa/, not "oi"; and eu/œu (/ø œ/) have no Italian counterpart — round your lips for "o" while your tongue says "e". Only ai/ei is intuitive (it is your open è).',
      it: 'Nessuna di queste si legge all\'italiana. <b>oi</b> è /wa/, non «oi»; e eu/œu (/ø œ/) non hanno un corrispondente italiano — arrotonda le labbra per «o» mentre la lingua dice «e». Solo ai/ei è intuitiva (è la tua è aperta).',
    },
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
    goal: {
      en: 'c is /k/ or /s/ — the next letter decides.',
      it: 'la c è /k/ o /s/ — decide la lettera dopo.',
    },
    theory: [
      { h: { en: 'Hard c = /k/', it: 'c dura = /k/' },
        body: {
          en: 'Before <b>a, o, u</b> or a consonant, c is a hard /k/.',
          it: 'Davanti ad <b>a, o, u</b> o a una consonante, la c è una /k/ dura.',
        },
        ex: [
          {fr:'café', ipa:'kafe', it:'caffè'}, {fr:'cou', ipa:'ku', it:'collo'},
          {fr:'cube', ipa:'kyb', it:'cubo'}, {fr:'classe', ipa:'klas', it:'classe'},
        ],
      },
      { h: { en: 'Soft c = /s/', it: 'c dolce = /s/' },
        body: {
          en: 'Before <b>e, i, y</b>, c softens to /s/.',
          it: 'Davanti a <b>e, i, y</b>, la c si addolcisce in /s/.',
        },
        ex: [
          {fr:'ce', ipa:'sə', it:'questo'}, {fr:'cinéma', ipa:'sinema', it:'cinema'},
          {fr:'merci', ipa:'mɛʁsi', it:'grazie'}, {fr:'cycle', ipa:'sikl', it:'ciclo'},
        ],
      },
      { h: { en: 'ç for the soft sound before a/o/u', it: 'ç per il suono dolce davanti ad a/o/u' },
        body: {
          en: 'When you need the /s/ before a, o or u, the cédille steps in (see the accents lesson): ça, garçon.',
          it: 'Quando serve la /s/ davanti ad a, o, u, entra in gioco la cédille (vedi la lezione sugli accenti): ça, garçon.',
        },
        ex: [
          {fr:'ça', ipa:'sa', it:'ciò'}, {fr:'garçon', ipa:'ɡaʁsɔ̃', it:'ragazzo'},
        ],
      },
    ],
    italian: {
      en: 'Same rule as Italian c (casa vs cena) — but the soft one is /s/, NOT the Italian "c" of "cena" (/tʃ/). So ce, ci = /sə, si/, never "ce, ci".',
      it: 'Stessa regola della c italiana (casa vs cena) — ma quella dolce è /s/, NON la «c» di «cena» (/tʃ/). Quindi ce, ci = /sə, si/, mai «ce, ci».',
    },
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
    goal: {
      en: 'g is /g/ or /ʒ/ — the same trick as c.',
      it: 'la g è /g/ o /ʒ/ — stesso gioco della c.',
    },
    theory: [
      { h: { en: 'Hard g = /g/', it: 'g dura = /g/' },
        body: {
          en: 'Before <b>a, o, u</b> or a consonant, g is the hard /g/ of "go".',
          it: 'Davanti ad <b>a, o, u</b> o a una consonante, la g è la /g/ dura di «gatto».',
        },
        ex: [
          {fr:'gare', ipa:'ɡaʁ', it:'stazione'}, {fr:'grand', ipa:'ɡʁɑ̃', it:'grande'},
          {fr:'légume', ipa:'leɡym', it:'verdura'},
        ],
      },
      { h: { en: 'Soft g = /ʒ/', it: 'g dolce = /ʒ/' },
        body: {
          en: 'Before <b>e, i, y</b>, g becomes the soft /ʒ/ — the sound in "measure", or Italian gi without the d.',
          it: 'Davanti a <b>e, i, y</b>, la g diventa la /ʒ/ dolce — il suono di «Jacques», o la «gi» italiana senza la d.',
        },
        ex: [
          {fr:'gentil', ipa:'ʒɑ̃ti', it:'gentile'}, {fr:'girafe', ipa:'ʒiʁaf', it:'giraffa'},
          {fr:'manger', ipa:'mɑ̃ʒe', it:'mangiare'},
        ],
      },
      { h: { en: 'The gu and ge tricks', it: 'I trucchi gu e ge' },
        body: {
          en: 'To keep a hard g before e/i, French adds a silent u: <b>gu</b>erre. To keep a soft g before a/o, it adds a silent e: nous man<b>ge</b>ons.',
          it: 'Per tenere la g dura davanti a e/i, il francese aggiunge una u muta: <b>gu</b>erre. Per tenere la g dolce davanti ad a/o, aggiunge una e muta: nous man<b>ge</b>ons.',
        },
        ex: [
          {fr:'guitare', ipa:'ɡitaʁ', it:'chitarra'}, {fr:'guerre', ipa:'ɡɛʁ', it:'guerra'},
          {fr:'nous mangeons', ipa:'nu mɑ̃ʒɔ̃', it:'noi mangiamo'},
        ],
      },
    ],
    italian: {
      en: 'The trap: soft g is /ʒ/, not the Italian "g" of "gente" (/dʒ/). Drop the initial d — "gel" is /ʒɛl/, a soft buzz, not "gel".',
      it: 'La trappola: la g dolce è /ʒ/, non la «g» di «gente» (/dʒ/). Togli la d iniziale — «gel» è /ʒɛl/, un ronzio morbido, non «gel».',
    },
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
    goal: {
      en: 's = /s/, but /z/ between two vowels.',
      it: 's = /s/, ma /z/ tra due vocali.',
    },
    theory: [
      { h: { en: 's = /s/', it: 's = /s/' },
        body: {
          en: 'At the start of a word or next to a consonant, s is a clean /s/. A double <b>ss</b> is always /s/ too.',
          it: 'A inizio parola o accanto a una consonante, la s è una /s/ pulita. Anche la <b>ss</b> doppia è sempre /s/.',
        },
        ex: [
          {fr:'salut', ipa:'saly', it:'ciao'}, {fr:'sport', ipa:'spɔʁ', it:'sport'},
          {fr:'poisson', ipa:'pwasɔ̃', it:'pesce'},
        ],
      },
      { h: { en: 'One s between two vowels = /z/', it: 'Una s tra due vocali = /z/' },
        body: {
          en: 'Trapped between two vowels, a single s buzzes into /z/.',
          it: 'Intrappolata tra due vocali, una s singola diventa sonora: /z/.',
        },
        ex: [
          {fr:'rose', ipa:'ʁoz', it:'rosa'}, {fr:'maison', ipa:'mɛzɔ̃', it:'casa'},
          {fr:'chose', ipa:'ʃoz', it:'cosa'}, {fr:'cousine', ipa:'kuzin', it:'cugina'},
        ],
      },
      { h: { en: 'poison vs poisson', it: 'poison vs poisson' },
        body: {
          en: 'This is why French doubles the s: one s /z/ = <b>poison</b>; two ss /s/ = <b>poisson</b> (a fish). Same trick behind dessert / désert.',
          it: 'Ecco perché il francese raddoppia la s: una s /z/ = <b>poison</b> (veleno); due ss /s/ = <b>poisson</b> (pesce). Stesso trucco dietro dessert / désert.',
        },
        ex: [
          {fr:'poison', ipa:'pwazɔ̃', it:'veleno'}, {fr:'poisson', ipa:'pwasɔ̃', it:'pesce'},
        ],
      },
    ],
    italian: {
      en: 'Good news: Italian already does this (rosa /z/ vs sasso /s/), so you own the sound. Just apply it strictly — a single s between vowels is ALWAYS /z/ in French, with none of the regional guessing Italian allows.',
      it: 'Buona notizia: l\'italiano lo fa già (rosa /z/ vs sasso /s/), quindi il suono ce l\'hai. Applicalo solo con rigore — in francese una s tra vocali è SEMPRE /z/, senza le incertezze regionali che l\'italiano si permette.',
    },
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
    goal: {
      en: 'Letter pairs that make one sound.',
      it: 'Coppie di lettere che fanno un solo suono.',
    },
    theory: [
      { h: { en: 'ch = /ʃ/', it: 'ch = /ʃ/' },
        body: {
          en: 'Never "k" here: <b>ch</b> is the "sh" of "ship".',
          it: 'Qui mai «k»: <b>ch</b> è la «sc» di «scena».',
        },
        ex: [
          {fr:'chat', ipa:'ʃa', it:'gatto'}, {fr:'chien', ipa:'ʃjɛ̃', it:'cane'},
          {fr:'chocolat', ipa:'ʃokola', it:'cioccolato'},
        ],
      },
      { h: { en: 'gn = /ɲ/', it: 'gn = /ɲ/' },
        body: {
          en: 'Exactly the Italian <b>gn</b> of "gnocchi" — a soft ny.',
          it: 'Esattamente la <b>gn</b> italiana di «gnocchi» — una ny morbida.',
        },
        ex: [
          {fr:'montagne', ipa:'mɔ̃taɲ', it:'montagna'}, {fr:'ligne', ipa:'liɲ', it:'linea'},
          {fr:'agneau', ipa:'aɲo', it:'agnello'},
        ],
      },
      { h: { en: 'ph = /f/, th = /t/, qu = /k/', it: 'ph = /f/, th = /t/, qu = /k/' },
        body: {
          en: '<b>ph</b> is just /f/; <b>th</b> is a plain /t/ (no English lisp); <b>qu</b> is /k/ — the u is silent.',
          it: '<b>ph</b> è semplicemente /f/; <b>th</b> è una /t/ normale (niente lisca all\'inglese); <b>qu</b> è /k/ — la u è muta.',
        },
        ex: [
          {fr:'photo', ipa:'foto', it:'foto'}, {fr:'thé', ipa:'te', it:'tè'},
          {fr:'quatre', ipa:'katʁ', it:'quattro'}, {fr:'musique', ipa:'myzik', it:'musica'},
        ],
      },
    ],
    italian: {
      en: 'Two gifts and one warning: gn is your "gnocchi" and ch is your "scena". But qu is just /k/ (qui = "ki"), never the Italian "qu" of "qui" (/kw/) — do not sound the u.',
      it: 'Due regali e un avviso: <b>gn</b> è il tuo «gnocchi» e <b>ch</b> è la tua «scena». Ma <b>qu</b> è solo /k/ (qui = «ki»), mai la «qu» italiana di «qui» (/kw/) — non far suonare la u.',
    },
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
    goal: {
      en: 'The round nasal — and never a real "n".',
      it: 'La nasale arrotondata — e mai una vera «n».',
    },
    theory: [
      { h: { en: 'on, om = /ɔ̃/', it: 'on, om = /ɔ̃/' },
        body: {
          en: 'Round your lips as for /o/ and let the air run through your nose. The crucial part: you do NOT pronounce the n — it only nasalises the vowel.',
          it: 'Arrotonda le labbra come per /o/ e lascia scorrere l\'aria dal naso. La cosa cruciale: NON pronunci la n — nasalizza soltanto la vocale.',
        },
        ex: [
          {fr:'bon', ipa:'bɔ̃', it:'buono'}, {fr:'non', ipa:'nɔ̃', it:'no'},
          {fr:'nom', ipa:'nɔ̃', it:'nome'}, {fr:'maison', ipa:'mɛzɔ̃', it:'casa'},
        ],
      },
      { h: { en: 'Before b or p, the n is written m', it: 'Davanti a b o p, la n si scrive m' },
        body: {
          en: 'A spelling habit, not a new sound: before b/p the nasal is written <b>om</b>. Still /ɔ̃/.',
          it: 'Un\'abitudine ortografica, non un suono nuovo: davanti a b/p la nasale si scrive <b>om</b>. Sempre /ɔ̃/.',
        },
        ex: [
          {fr:'nombre', ipa:'nɔ̃bʁ', it:'numero'}, {fr:'tomber', ipa:'tɔ̃be', it:'cadere'},
          {fr:'comprendre', ipa:'kɔ̃pʁɑ̃dʁ', it:'capire'},
        ],
      },
    ],
    italian: {
      en: 'Italian has no nasal vowels at all — this is the hardest new habit. "bon" is NOT "bon": the n dissolves into the nose and colours the vowel. If a French listener hears a crisp "n", you have said it the Italian way.',
      it: 'L\'italiano non ha affatto vocali nasali — è l\'abitudine più difficile da prendere. «bon» NON è «bon»: la n si scioglie nel naso e colora la vocale. Se un francese sente una «n» netta, l\'hai detta all\'italiana.',
    },
    drills: { mode: 'sentences', items: [
      {s:"c'est bon", it:'è buono'}, {s:'non merci', it:'no grazie'}, {s:'mon nom', it:'il mio nome'},
      {s:'une maison', it:'una casa'}, {s:'un nombre', it:'un numero'}, {s:'je comprends', it:'capisco'},
    ] },
  },

  /* ──────────────────── 10 · nasal /ɑ̃/ — an / en ───────────────────────── */
  {
    id: 'nasal-an', icon: '👃',
    title: 'Nasal /ɑ̃/ — an, en',
    goal: {
      en: 'The open nasal — and yes, en usually sounds like an.',
      it: 'La nasale aperta — e sì, «en» di solito suona come «an».',
    },
    theory: [
      { h: { en: 'an, am, en, em = /ɑ̃/', it: 'an, am, en, em = /ɑ̃/' },
        body: {
          en: 'Open your mouth wide, send the air through the nose, drop the consonant. The surprise for beginners: <b>en</b> and <b>em</b> normally give /ɑ̃/, not /ɛ̃/.',
          it: 'Spalanca la bocca, manda l\'aria dal naso, lascia cadere la consonante. La sorpresa per chi inizia: <b>en</b> ed <b>em</b> normalmente danno /ɑ̃/, non /ɛ̃/.',
        },
        ex: [
          {fr:'grand', ipa:'ɡʁɑ̃', it:'grande'}, {fr:'temps', ipa:'tɑ̃', it:'tempo'},
          {fr:'enfant', ipa:'ɑ̃fɑ̃', it:'bambino'}, {fr:'chambre', ipa:'ʃɑ̃bʁ', it:'camera'},
        ],
      },
      { h: { en: 'Round /ɔ̃/ or open /ɑ̃/?', it: '/ɔ̃/ arrotondata o /ɑ̃/ aperta?' },
        body: {
          en: 'Same nose, different mouth: <b>on</b> keeps the lips rounded (/ɔ̃/), <b>an/en</b> opens them wide (/ɑ̃/). Compare son and sans.',
          it: 'Stesso naso, bocca diversa: <b>on</b> tiene le labbra arrotondate (/ɔ̃/), <b>an/en</b> le apre bene (/ɑ̃/). Confronta son e sans.',
        },
        ex: [
          {fr:'son', ipa:'sɔ̃', it:'suono'}, {fr:'sans', ipa:'sɑ̃', it:'senza'},
          {fr:'trente ans', ipa:'tʁɑ̃t ɑ̃', it:"trent'anni"},
        ],
      },
    ],
    italian: {
      en: 'Same "no n" rule as /ɔ̃/, but mouth wide open. Beware "en": your instinct reads it "en", but grand, temps, enfant are all /ɑ̃/ — no n heard, mouth open.',
      it: 'Stessa regola «niente n» della /ɔ̃/, ma a bocca ben aperta. Attento a «en»: l\'istinto lo legge «en», ma grand, temps, enfant sono tutti /ɑ̃/ — nessuna n, bocca aperta.',
    },
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
    goal: {
      en: 'The bright nasal, as in vin and pain.',
      it: 'La nasale chiara, come in vin e pain.',
    },
    theory: [
      { h: { en: 'in, im, ain, ein, yn = /ɛ̃/', it: 'in, im, ain, ein, yn = /ɛ̃/' },
        body: {
          en: 'One bright nasal vowel hides behind many spellings. Mouth fairly open, lips spread, air through the nose, no n.',
          it: 'Un\'unica vocale nasale chiara si nasconde dietro tante grafie. Bocca abbastanza aperta, labbra distese, aria dal naso, niente n.',
        },
        ex: [
          {fr:'vin', ipa:'vɛ̃', it:'vino'}, {fr:'pain', ipa:'pɛ̃', it:'pane'},
          {fr:'main', ipa:'mɛ̃', it:'mano'}, {fr:'plein', ipa:'plɛ̃', it:'pieno'},
          {fr:'important', ipa:'ɛ̃pɔʁtɑ̃', it:'importante'},
        ],
      },
      { h: { en: 'un, um ≈ the same sound', it: 'un, um ≈ lo stesso suono' },
        body: {
          en: 'Textbooks call <b>un</b> a separate nasal /œ̃/, but most speakers today merge it into /ɛ̃/. Say un like the start of "vin".',
          it: 'I manuali chiamano <b>un</b> una nasale a parte /œ̃/, ma oggi la maggior parte dei parlanti la fonde con /ɛ̃/. Di\' «un» come l\'inizio di «vin».',
        },
        ex: [
          {fr:'un', ipa:'œ̃', it:'un / uno'}, {fr:'brun', ipa:'bʁœ̃', it:'castano'},
          {fr:'lundi', ipa:'lœ̃di', it:'lunedì'}, {fr:'parfum', ipa:'paʁfœ̃', it:'profumo'},
        ],
      },
      { h: { en: 'oin = /wɛ̃/', it: 'oin = /wɛ̃/' },
        body: {
          en: 'Put a quick "w" in front of the bright nasal and you get <b>oin</b>.',
          it: 'Metti una «u» rapida davanti alla nasale chiara ed ecco <b>oin</b>.',
        },
        ex: [
          {fr:'loin', ipa:'lwɛ̃', it:'lontano'}, {fr:'point', ipa:'pwɛ̃', it:'punto'},
          {fr:'besoin', ipa:'bəzwɛ̃', it:'bisogno'},
        ],
      },
    ],
    italian: {
      en: 'No Italian equivalent again — and do not let the spelling fool you: "vin" is not "i" + "n", it is one nasal /ɛ̃/. The same single vowel sits behind in, ain and ein.',
      it: 'Di nuovo nessun equivalente italiano — e non farti ingannare dalla grafia: «vin» non è «i» + «n», è un\'unica nasale /ɛ̃/. La stessa vocale sta dietro in, ain ed ein.',
    },
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
    goal: {
      en: 'incroyable vs inégal: the rule that turns the nasal off.',
      it: 'incroyable vs inégal: la regola che spegne la nasale.',
    },
    theory: [
      { h: { en: 'The rule in one line', it: 'La regola in una riga' },
        body: {
          en: 'A nasal spelling (in, on, an, en…) is only nasal when the n/m <b>closes the syllable</b> — i.e. a consonant follows, or the word ends. If a <b>vowel follows</b>, or the <b>n/m is doubled</b>, the vowel goes back to normal and you DO pronounce the n or m.',
          it: 'Una grafia nasale (in, on, an, en…) è nasale solo quando la n/m <b>chiude la sillaba</b> — cioè segue una consonante, o la parola finisce. Se segue una <b>vocale</b>, o la <b>n/m è doppia</b>, la vocale torna normale e la n o la m SI pronunciano.',
        },
      },
      { h: { en: 'in- : incroyable vs inégal', it: 'in- : incroyable vs inégal' },
        body: {
          en: 'Same prefix, opposite sound. In <b>in·croyable</b> the n meets a consonant → nasal /ɛ̃/. In <b>i·nutile</b>, <b>i·négal</b> the n meets a vowel → a plain /i/ and a fully-sounded n.',
          it: 'Stesso prefisso, suono opposto. In <b>in·croyable</b> la n incontra una consonante → nasale /ɛ̃/. In <b>i·nutile</b>, <b>i·négal</b> la n incontra una vocale → una /i/ normale e una n ben pronunciata.',
        },
        ex: [
          {fr:'incroyable', ipa:'ɛ̃kʁwajabl', it:'incredibile'}, {fr:'inutile', ipa:'inytil', it:'inutile'},
          {fr:'inégal', ipa:'ineɡal', it:'disuguale'}, {fr:'inoubliable', ipa:'inublijabl', it:'indimenticabile'},
        ],
      },
      { h: { en: 'A doubled n or m kills the nasal', it: 'Una n o m doppia uccide la nasale' },
        body: {
          en: 'One n nasalises; two do not. Watch a word switch as it grows: bon → bonne, an → année, and im- + m stays oral in immense.',
          it: 'Una n sola nasalizza; due no. Guarda una parola cambiare mentre cresce: bon → bonne, an → année, e im- + m resta orale in immense.',
        },
        ex: [
          {fr:'bon', ipa:'bɔ̃', it:'buono (m.)'}, {fr:'bonne', ipa:'bɔn', it:'buona (f.)'},
          {fr:'année', ipa:'ane', it:'anno'}, {fr:'immense', ipa:'imɑ̃s', it:'immenso'},
        ],
      },
    ],
    italian: {
      en: 'This one actually helps you: when French denasalises, vowel + n become almost Italian again (inutile ≈ "inutile"). The trap is over-nasalising — say a clean /i-n/ before a vowel.',
      it: 'Questa in realtà ti aiuta: quando il francese denasalizza, vocale + n tornano quasi italiane (inutile ≈ «inutile»). Il rischio è nasalizzare troppo — di\' una /i-n/ pulita davanti a una vocale.',
    },
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
    goal: {
      en: 'Most final consonants are silent — but not all.',
      it: 'Quasi tutte le consonanti finali sono mute — ma non tutte.',
    },
    theory: [
      { h: { en: 'The default: silent', it: 'La regola: muta' },
        body: {
          en: 'The last consonant of a word is usually NOT pronounced, and a final <b>e</b> is silent too. You write more than you say.',
          it: 'L\'ultima consonante di una parola di solito NON si pronuncia, e anche una <b>e</b> finale è muta. Scrivi più di quanto dici.',
        },
        ex: [
          {fr:'petit', ipa:'pəti', it:'piccolo'}, {fr:'grand', ipa:'ɡʁɑ̃', it:'grande'},
          {fr:'nez', ipa:'ne', it:'naso'}, {fr:'trop', ipa:'tʁo', it:'troppo'},
        ],
      },
      { h: { en: 'CaReFuL — c, r, f, l often stay', it: 'CaReFuL — c, r, f, l spesso restano' },
        body: {
          en: 'A handy memory hook: the letters in "Ca-Re-Fu-L" (c, r, f, l) are the final consonants most likely to be SOUNDED.',
          it: 'Un aiuto per la memoria: le lettere di «Ca-Re-Fu-L» (c, r, f, l) sono le consonanti finali che più spesso SI pronunciano.',
        },
        ex: [
          {fr:'sac', ipa:'sak', it:'borsa'}, {fr:'hiver', ipa:'ivɛʁ', it:'inverno'},
          {fr:'chef', ipa:'ʃɛf', it:'capo'}, {fr:'animal', ipa:'animal', it:'animale'},
        ],
      },
      { h: { en: 'The big exception: -er = /e/', it: 'La grande eccezione: -er = /e/' },
        body: {
          en: 'A final r is DROPPED in the verb ending -er and in -ier words, leaving a clean /e/.',
          it: 'La r finale CADE nella desinenza verbale -er e nelle parole in -ier, lasciando una /e/ pulita.',
        },
        ex: [
          {fr:'parler', ipa:'paʁle', it:'parlare'}, {fr:'premier', ipa:'pʁəmje', it:'primo'},
        ],
      },
    ],
    italian: {
      en: 'The biggest break from Italian, where every letter sounds. "petit" is /pəti/ — you write four more letters than you say. Fight the Italian urge to pronounce that final t.',
      it: 'Il distacco più grande dall\'italiano, dove ogni lettera suona. «petit» è /pəti/ — scrivi quattro lettere in più di quante ne dici. Combatti l\'istinto italiano di pronunciare quella t finale.',
    },
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
    goal: {
      en: '-e, -es, -ent: written, never said.',
      it: '-e, -es, -ent: scritte, mai dette.',
    },
    theory: [
      { h: { en: 'je parle = ils parlent', it: 'je parle = ils parlent' },
        body: {
          en: 'The endings <b>-e, -es, -ent</b> of a present-tense verb are all silent. Three different spellings, one sound. A verb\'s <b>-ent</b> is NEVER a nasal.',
          it: 'Le desinenze <b>-e, -es, -ent</b> del presente sono tutte mute. Tre grafie diverse, un solo suono. La <b>-ent</b> di un verbo NON è mai una nasale.',
        },
        ex: [
          {fr:'je parle', ipa:'ʒə paʁl', it:'io parlo'}, {fr:'ils parlent', ipa:'il paʁl', it:'loro parlano'},
          {fr:'elles chantent', ipa:'ɛl ʃɑ̃t', it:'loro cantano'},
        ],
      },
      { h: { en: '-er, -ez = /e/', it: '-er, -ez = /e/' },
        body: {
          en: 'The infinitive -er and the vous form -ez both land on a closed /e/.',
          it: 'L\'infinito -er e la forma vous -ez cadono entrambi su una /e/ chiusa.',
        },
        ex: [
          {fr:'vous parlez', ipa:'vu paʁle', it:'voi parlate'}, {fr:'chanter', ipa:'ʃɑ̃te', it:'cantare'},
        ],
      },
      { h: { en: 'Careful: a noun/adverb -ent IS nasal', it: 'Attenzione: la -ent di nome/avverbio È nasale' },
        body: {
          en: 'Only the VERB ending -ent is silent. In an adverb or noun, -ent is the nasal /ɑ̃/: sou<b>vent</b>, mo<b>ment</b>.',
          it: 'Solo la desinenza VERBALE -ent è muta. In un avverbio o nome, -ent è la nasale /ɑ̃/: sou<b>vent</b>, mo<b>ment</b>.',
        },
        ex: [
          {fr:'souvent', ipa:'suvɑ̃', it:'spesso'}, {fr:'un moment', ipa:'œ̃ mɔmɑ̃', it:'un momento'},
        ],
      },
    ],
    italian: {
      en: 'In Italian "parlano" you clearly hear the ending; in French "parlent" you hear nothing — je parle and ils parlent are identical /paʁl/. Let the ending go completely silent.',
      it: 'In italiano «parlano» la desinenza si sente bene; in francese «parlent» non si sente nulla — je parle e ils parlent sono identici: /paʁl/. Lascia la desinenza del tutto muta.',
    },
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
    goal: {
      en: 'fille, travail, soleil: the /j/ sound of "yes".',
      it: 'fille, travail, soleil: il suono /j/ di «ieri».',
    },
    theory: [
      { h: { en: 'ill / ille = /ij/ or /j/', it: 'ill / ille = /ij/ o /j/' },
        body: {
          en: 'Usually the double l here is not an "l" at all but a /j/ — the y of "yes". After another vowel it is just /j/: trava<b>il</b>, sole<b>il</b>, boute<b>ille</b>.',
          it: 'Di solito la doppia l qui non è affatto una «l» ma una /j/ — la i di «ieri». Dopo un\'altra vocale è solo /j/: trava<b>il</b>, sole<b>il</b>, boute<b>ille</b>.',
        },
        ex: [
          {fr:'fille', ipa:'fij', it:'ragazza'}, {fr:'famille', ipa:'famij', it:'famiglia'},
          {fr:'travail', ipa:'tʁavaj', it:'lavoro'}, {fr:'soleil', ipa:'solɛj', it:'sole'},
        ],
      },
      { h: { en: 'The stubborn /il/ words', it: 'Le parole ostinate in /il/' },
        body: {
          en: 'A short list keeps a real "l": <b>ville</b>, <b>mille</b>, <b>tranquille</b>. These you just memorise.',
          it: 'Una piccola lista tiene una vera «l»: <b>ville</b>, <b>mille</b>, <b>tranquille</b>. Queste si imparano a memoria.',
        },
        ex: [
          {fr:'ville', ipa:'vil', it:'città'}, {fr:'mille', ipa:'mil', it:'mille'},
          {fr:'tranquille', ipa:'tʁɑ̃kil', it:'tranquillo'},
        ],
      },
    ],
    italian: {
      en: 'Easy for you — it is close to the Italian "gli" family, your /ʎ/ softened to a /j/. Just do not read the double l as a hard "l": fille is /fij/, not "fil-le".',
      it: 'Facile per te — è vicino alla famiglia del «gli» italiano, la tua /ʎ/ ammorbidita in /j/. Basta non leggere la doppia l come una «l» dura: fille è /fij/, non «fil-le».',
    },
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
    goal: {
      en: 'How French words melt into each other.',
      it: 'Come le parole francesi si fondono tra loro.',
    },
    theory: [
      { h: { en: 'h is always silent', it: 'la h è sempre muta' },
        body: {
          en: 'French never voices an h. It is written but never heard.',
          it: 'Il francese non pronuncia mai la h. Si scrive ma non si sente.',
        },
        ex: [
          {fr:'homme', ipa:'ɔm', it:'uomo'}, {fr:'heure', ipa:'œʁ', it:'ora'},
          {fr:'hôtel', ipa:'otɛl', it:'albergo'},
        ],
      },
      { h: { en: 'Élision — the dropped vowel', it: 'Elisione — la vocale che cade' },
        body: {
          en: 'Before a vowel (or silent h), little words lose their own vowel and glue on with an apostrophe: le/la → l\', je → j\', de → d\'.',
          it: 'Davanti a una vocale (o h muta), le paroline perdono la propria vocale e si attaccano con l\'apostrofo: le/la → l\', je → j\', de → d\'.',
        },
        ex: [
          {fr:"l'homme", ipa:'lɔm', it:"l'uomo"}, {fr:"j'ai", ipa:'ʒe', it:'ho'},
          {fr:"l'heure", ipa:'lœʁ', it:"l'ora"},
        ],
      },
      { h: { en: 'Liaison — the consonant wakes up', it: 'Liaison — la consonante si risveglia' },
        body: {
          en: 'A normally-silent final consonant is PRONOUNCED when the next word starts with a vowel, and links across: les‿amis sounds /le-z-ami/, c\'est‿un /sɛ-t-œ̃/.',
          it: 'Una consonante finale normalmente muta SI pronuncia quando la parola dopo comincia per vocale, e fa da ponte: les‿amis suona /le-z-ami/, c\'est‿un /sɛ-t-œ̃/.',
        },
        ex: [
          {fr:'les amis', ipa:'le‿z‿ami', it:'gli amici'}, {fr:'vous avez', ipa:'vu‿z‿ave', it:'voi avete'},
          {fr:"c'est un ami", ipa:'sɛ‿t‿œ̃‿n‿ami', it:'è un amico'},
        ],
      },
    ],
    italian: {
      en: 'Italian links words too, but here a silent letter reappears from nowhere: "les" alone is /le/, yet /lez/ before a vowel. Train your ear to expect that extra /z/ and /t/ — Italians tend to drop it.',
      it: 'Anche l\'italiano lega le parole, ma qui una lettera muta ricompare dal nulla: «les» da solo è /le/, ma /lez/ davanti a una vocale. Abitua l\'orecchio ad aspettarsi quella /z/ e quella /t/ in più — gli italiani tendono a ometterle.',
    },
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
    goal: {
      en: 'The throat R, and the little e that disappears.',
      it: 'La R di gola, e la piccola e che sparisce.',
    },
    theory: [
      { h: { en: 'R = /ʁ/, made in the throat', it: 'R = /ʁ/, fatta in gola' },
        body: {
          en: 'The French R is not rolled on the tongue-tip like the Italian or Spanish r. It is a soft scrape at the BACK of the throat — closer to a gentle gargle, near the sound of clearing your throat.',
          it: 'La R francese non si arrota sulla punta della lingua come la r italiana o spagnola. È un raschio morbido in FONDO alla gola — vicino a un gargarismo leggero, quasi il suono di quando ci si schiarisce la voce.',
        },
        ex: [
          {fr:'rue', ipa:'ʁy', it:'via'}, {fr:'Paris', ipa:'paʁi', it:'Parigi'},
          {fr:'rouge', ipa:'ʁuʒ', it:'rosso'}, {fr:'mercredi', ipa:'mɛʁkʁədi', it:'mercoledì'},
        ],
      },
      { h: { en: 'The e muet — the vanishing e', it: 'La e muet — la e che svanisce' },
        body: {
          en: 'A short unstressed <b>e</b> is often dropped in everyday speech. "Petit" becomes /p(ə)ti/, and "je ne sais pas" collapses to /ʒənsɛpa/.',
          it: 'Una <b>e</b> breve e atona spesso cade nel parlato di tutti i giorni. «Petit» diventa /p(ə)ti/, e «je ne sais pas» collassa in /ʒənsɛpa/.',
        },
        ex: [
          {fr:'petit', ipa:'p(ə)ti', it:'piccolo'}, {fr:'samedi', ipa:'samdi', it:'sabato'},
          {fr:'maintenant', ipa:'mɛ̃tnɑ̃', it:'adesso'},
        ],
      },
    ],
    italian: {
      en: 'The single biggest giveaway of an Italian accent is the rolled r. Stop the tongue-tip trill entirely — the French /ʁ/ is a soft scrape at the back, like a gentle gargle. Drill it slowly on "rue" and "Paris".',
      it: 'Il tratto che più tradisce l\'accento italiano è la r arrotata. Ferma del tutto il trillo della punta della lingua — la /ʁ/ francese è un raschio morbido dietro, come un gargarismo leggero. Esercitati piano su «rue» e «Paris».',
    },
    drills: { mode: 'sentences', items: [
      {s:'la rue', it:'la via'}, {s:'je viens de Paris', it:'vengo da Parigi'},
      {s:'du vin rouge', it:'del vino rosso'}, {s:'mercredi', it:'mercoledì'},
      {s:'un petit chat', it:'un piccolo gatto'}, {s:'je ne sais pas', it:'non lo so'},
    ] },
  },

];

export { FOUNDATIONS };
