/* The mutable state a running round lives in.

   It is ONE object on purpose. These fields used to be a dozen module-level
   `let`s that the quiz, the speak flow and the course controller all assigned
   to. ES modules make imported bindings read-only, so that could not survive a
   split — and the shared-globals arrangement was already the source of real
   bugs (a retry handler leaking between the course and free practice).

   Everything that describes "what round am I in, and where am I in it" is here.
   Anything owned by a single module (the recorder's audio nodes, the service
   worker registration) stays private to that module. */

export const S = {
  // the listening quiz
  deck: [],          // the questions of the current round
  idx: 0,            // which one we're on
  score: 0,
  answered: false,
  missed: [],
  level: 1,          // free-practice level 1-6 (0 while in a course lesson)

  // 'free'   — the old menu levels, unchanged
  // 'lesson' — one step of Rémy's course
  mode: 'free',
  lessonIdx: 0,
  lessonStep: 1,     // 1 = 👂 words, 2 = 👂 in context, 3 = 🎤 speak
  // set while a mic-based COURSE step runs, so the shared speak flow knows it is
  // a lesson and not free-practice Level 4/5/6
  courseCtx: null,

  // the speak flow (Levels 4-6, and the course's 🎤 steps)
  speakMode: 'words',   // 'words' | 'sentences' | 'custom'
  speakDeck: [],
  sidx: 0,
  spassed: 0,
  sresults: [],
  passedSet: new Set(),

  // which lesson's step list is unfolded on the menu
  openNode: null,
};
