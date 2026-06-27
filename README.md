# Écoute · French Sound Trainer

A small ear-training game for French vowel sounds — learn to tell apart pairs
like *chat / chien* and *son / sang* by listening and choosing what you heard.
Each French word and sentence shows its Italian translation underneath.

The whole app is a single self-contained file, `french-sounds.html`. No build
step, no dependencies, no account needed.

## Levels

- **Level 1 — Words.** Basic, short, clearly contrasting pairs: *chat/chien*,
  *son/sang*, *tout/tu*, *beau/bon*, *vin/vent*…
- **Level 2 — Longer words.** The same sounds inside two-syllable words:
  *bateau/bâton*, *manteau/menton*, *raisin/raison*, *dessus/dessous*…
- **Level 3 — Sentences.** The sounds hidden in full sentences:
  *« J'ai promené mon chat. »*

Each level has 30 exercises.

## How to play

Press the big ▶ button to hear the prompt, then pick the word or sentence you
think you heard. Use the 🔊 on a card to hear that specific option, **Slow** to
stretch the audio out, or the keyboard: `Space` replays, `1`/`2` choose,
`Enter` goes to the next question.

## Audio

By default the app uses **Google Translate's natural French voice** (this needs
an internet connection). The **Voice** menu inside a level lets you switch to
any French voice installed on your computer; your choice is remembered. If the
Google voice can't load, the app automatically falls back to the best installed
system voice.

## Run locally

Just open `french-sounds.html` in any modern browser (Chrome, Edge, or Safari).
Double-clicking the file works.

## Deploy to Netlify

This repo is ready to publish as-is — `netlify.toml` serves the app at the site
root, so visitors land directly on the game.

**Option A — drag and drop (easiest).** Go to <https://app.netlify.com/drop>
and drag this folder onto the page. Done.

**Option B — Netlify CLI.**

```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Option C — connect a Git repo.** Push this folder to GitHub/GitLab, then in
Netlify choose *Add new site → Import an existing project* and pick the repo.
There's no build command; Netlify reads `netlify.toml` and publishes the files.

## Files

- `french-sounds.html` — the entire app.
- `netlify.toml` — Netlify publish settings and the root rewrite.
- `README.md` — this file.
