# Écoute · French Sound Trainer

An ear- and tongue-training app for French sounds. Learn to tell apart pairs like
*chat / chien* and *son / sang* by listening and choosing what you heard, then say
them yourself and get graded. Every French word and sentence shows its Italian
translation underneath.

It's an installable PWA: add it to an Android or desktop home screen and it runs
fullscreen, offline, and can send you a daily reminder. **Rémy** — moustache,
curly hair — is your coach.

The app itself is still one self-contained file, `french-sounds.html`. The only
server-side code is the handful of Netlify functions that deliver the reminders.

## Rémy's course

The course is the main way in, and every level feeds it. It turns the exercise
pools into **17 lessons, one per sound contrast**, ordered easiest-first: the oral
vowels (*chat / chaud*, *tout / tu*) before the nasals (*bon / banc*, *vin / vent*),
which are the ones that stay hard longest.

### Each lesson runs in steps

| Step | What it is | Material |
| --- | --- | --- |
| 1 · 👂 **Words** | hear the contrast in isolation | Level 1 |
| 2 · 👂 **In context** | hear it inside longer words and sentences | Levels 2 + 3 |
| 3 · 🎤 **Speak it** | say it yourself, graded word by word | Level 4's grader |

Score **80%** on the listening steps to clear the lesson and unlock the next sound.
A few contrasts (*lit / les*, *cou / queue*) only exist as single words in the data
and honestly have no step 2 — those lessons show two steps, not three.

**Step 3 is optional.** It needs a Gemini key, and the course must never dead-end
someone who doesn't have one, so the mic never gates progress. Clear it and the
sound is **mastered** (★, gold) and pays extra gelato. Fail it and you lose
nothing.

### ⚖️ Law aloud

Level 5's sentences become **four chapters** slotted into the path, one unlocking
every five sounds. Like the mic step they're optional and need a key — they unlock
*alongside* the sounds rather than blocking them, so an ignored chapter never
stalls the course.

Level 6 (*your own sentence*) stays a free tool: it's inherently freeform, not a
course unit.

### What makes it a course and not a quiz

- Every lesson quietly **mixes in the sounds you've already learned** — more often
  the shakier they are, and drawn from harder material as they firm up. That's the
  `🔁 review` chip during a round.
- Each cleared sound carries a **strength** from ●○○○○ to ●●●●●. A correct review
  raises it, a wrong one drops it, and saying it aloud bumps it. Strength decides
  how often the sound comes back and how hard the material is when it does.
- Clearing anything feeds your **streak** and earns **gelato points** 🍨.

Progress lives in `localStorage` — no account, no server, and it stays on the
device. *Reset progress* on the menu wipes it.

The six original levels are still there, unchanged, under **Free practice** on the
menu: pick any level and drill it outside the course.

## Levels (free practice)

- **Level 1 — Words.** Short, clearly contrasting pairs.
- **Level 2 — Longer words.** The same sounds in two-syllable words.
- **Level 3 — Sentences.** The sounds hidden in full sentences.
- **Level 4 — Speak.** Say the Level 1 words; your mic + Gemini score you.
- **Level 5 — Law aloud.** Read sentences about French/European law, graded word
  by word.
- **Level 6 — Your sentence.** Type any French sentence and train on it.

Levels 4–6 need your own [Gemini API key](https://aistudio.google.com/apikey).
It's stored only in your browser and sent straight to Google.

## Daily reminders

A PWA **cannot schedule its own notification** — the Notification Triggers API
(`showTrigger`) was never shipped by any browser. So the nudge is a real web push:
your browser subscribes, the endpoint is stored, and an hourly Netlify function
decides — per learner, in their own timezone — whether tonight deserves a ping.

Rémy stays quiet if you've already practised that day, and sends one extra "last
call" at 21:00 if a streak of 2+ days is about to die.

### Setting it up

Reminders are **off** until the site has VAPID keys. Without them the app still
works everywhere; the toggle just explains it isn't configured.

1. Generate a keypair:

   ```bash
   npm install
   npm run vapid
   ```

2. Put the two values in Netlify (*Site configuration → Environment variables*),
   plus a contact address the push services can reach you at:

   | Variable | Value |
   | --- | --- |
   | `VAPID_PUBLIC_KEY` | from `npm run vapid` |
   | `VAPID_PRIVATE_KEY` | from `npm run vapid` |
   | `VAPID_SUBJECT` | `mailto:you@example.com` |

3. Redeploy. Open the site, flip **🔔 Daily reminder** on, allow notifications,
   pick your hour, and hit **Send a test** to prove the chain works end to end.

The private key never reaches the browser. Subscriptions are stored in Netlify
Blobs (no database to run) and hold nothing but a push endpoint, a UTC offset, a
preferred hour and the date you last practised. Dead subscriptions are pruned
automatically.

## Install it

**Android / desktop Chrome.** Open the site and use the **📲 Install** button on
the menu (or the browser's own install prompt). It lands on the home screen and
runs without browser chrome.

**iOS.** *Share → Add to Home Screen.* Notifications work on iOS 16.4+, but only
once it's installed to the home screen.

**Google Play (optional).** Nothing here needs the Play Store — an installed PWA
already gets real notifications on Android. If you want a store listing anyway,
wrap this same site in a Trusted Web Activity; no app code changes:

```bash
npx @bubblewrap/cli init --manifest https://YOUR-SITE.netlify.app/manifest.webmanifest
npx @bubblewrap/cli build          # produces app-release-bundle.aab
```

Upload the `.aab` to the Play Console, then copy the SHA-256 fingerprint Play
gives you into a `/.well-known/assetlinks.json` on the site so Android verifies you
own the domain and hides the URL bar. ([PWABuilder](https://www.pwabuilder.com) does
the same thing through a GUI.)

## Shipping a new version

An installed PWA runs from the service worker's cache, so a deploy doesn't reach
it on its own. There are two ways it gets there:

- **Automatically.** A new `sw.js` installs in the background and waits; the app
  shows a *"A new version of Écoute is ready"* banner on the menu, and the learner
  reloads when they're ready. It never takes over mid-lesson.
- **Manually.** The **⟳ Check for updates** link at the bottom of the menu asks
  the worker to re-fetch the shell straight from the network, past every cache.

**Bump the version in both places when you deploy** — `VERSION` in `sw.js` and
`APP_VERSION` in `french-sounds.html`. The browser detects a new service worker by
byte-comparing `sw.js`, so a deploy that only touched the HTML leaves it identical
and raises no update event at all. (The manual button still catches that case, but
nobody gets the banner.)

## How to play

Press ▶ to hear the prompt, then pick what you heard. Use 🔊 on a card to hear
that option, **🐢 Slow** to stretch it out, or the keyboard: `Space` replays,
`1`/`2` choose, `Enter` advances. Meanings stay hidden until you answer, and the
app picks at random which half of the pair to speak — memorising won't help, you
have to listen.

## Audio

By default the app uses **Google Translate's natural French voice** (needs the
network). The **Voice** menu inside a level switches to any French voice installed
on your machine, and your choice is remembered. If the Google voice can't load,
the app falls back to the best system voice on its own.

## Run locally

```bash
npm install
npm run dev        # netlify dev — serves the app AND the reminder functions
```

Or, for the app alone with no functions, `npm run static` (the reminder toggle
will correctly report itself as unconfigured). Opening `french-sounds.html`
directly as a `file://` also works, but browsers block the microphone and
notifications on `file://` pages.

## Tests

```bash
npm test           # course engine + reminder logic  (fast, no browser)
npm run test:browser   # drives the real app in Chromium (needs playwright)
npm run test:all
```

`test/course.test.mjs` runs the app's *real* script under a DOM stub and drives
the actual `buildLessonDeck()`, `finishLesson()`, `currentIdx()` — so it breaks
when the app breaks, not when a reimplementation drifts. `test/browser.test.mjs`
plays a lesson end to end (listening steps, the mic step with Gemini stubbed, a
law chapter), checks the free levels are untouched, and checks the
service-worker update path. Together, 166 assertions.

## Files

- `french-sounds.html` — the app: quiz, course engine, speak flow, UI.
- `js/data.js` — **all the teaching content.** Add a minimal pair here and the
  course picks it up on its own: the `focus` field (`"/u/ vs /y/"`) *is* the
  lesson id. No app code to touch.
- `js/audio.js` — the voice engine (Google TTS + system voices, with fallback).
- `js/gemini.js` — the pronunciation grader: API key, prompts, dual-judge scoring.
- `remy.svg`, `badge.svg`, `icons/` — Rémy, and the icon set generated from him
  (`npm run icons` regenerates the PNGs; needs ImageMagick).
- `manifest.webmanifest`, `sw.js` — what makes it installable and push-capable.
- `netlify/functions/` — subscribe, unsubscribe, practiced, test-push, and the
  hourly `reminder` cron.
- `netlify/lib/push.mjs` — shared push plumbing and the "should we nudge?" rule.
- `netlify.toml` — publish settings, the root rewrite, and the `/api/*` routes.

`js/*.js` are plain classic scripts loaded before the app — they share one global
scope on purpose. That keeps the zero-build, zero-toolchain property: nothing here
is compiled, bundled, or transpiled.
