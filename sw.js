/* Écoute — service worker.
   Two jobs:
   1. Keep the app shell available offline (the quiz itself is pure client-side;
      only the Google TTS audio and the Gemini grader need the network).
   2. Receive the push messages that bring the learner back — Rémy's reminders.

   3. Hand the running app a way to pull the latest code on demand (REFRESH).

   Bump VERSION on every deploy. The browser detects a new service worker by
   byte-comparing this file, so if VERSION doesn't change, a deploy that only
   touched the HTML raises no "update available" signal at all. */

const VERSION = '2.0.0';
const CACHE = 'ecoute-' + VERSION;
const SHELL = [
  '/',
  '/french-sounds.html',
  '/js/app.js',
  '/js/audio.js',
  '/js/course.js',
  '/js/data.js',
  '/js/gemini.js',
  '/js/lesson.js',
  '/js/menu.js',
  '/js/quiz.js',
  '/js/speak.js',
  '/js/state.js',
  '/js/util.js',
  '/manifest.webmanifest',
  '/remy.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/badge-96.png',
];

// Deliberately NOT skipWaiting() here: yanking the caches out from under a page
// that's mid-lesson would break it. The new worker waits until the app says go.
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // addAll is all-or-nothing; a single 404 would leave us with no cache at all.
      .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {}))))
  );
});

self.addEventListener('message', (e) => {
  const msg = e.data || {};

  // "Update now" — the app has told us it's safe to take over.
  if (msg.type === 'SKIP_WAITING') self.skipWaiting();

  // "Check for updates" — re-fetch the shell straight from the network, past
  // every cache. This is what makes the button work even when sw.js itself is
  // unchanged (a deploy that only edited the HTML).
  if (msg.type === 'REFRESH') {
    e.waitUntil((async () => {
      let changed = false;
      const c = await caches.open(CACHE);
      for (const url of SHELL) {
        try {
          const fresh = await fetch(url, { cache: 'reload' });
          if (!fresh || !fresh.ok) continue;
          const old = await c.match(url);
          if (!old || !(await sameBytes(old.clone(), fresh.clone()))) changed = true;
          await c.put(url, fresh);
        } catch (_) { /* offline: keep what we have */ }
      }
      if (e.source) e.source.postMessage({ type: 'REFRESHED', changed });
    })());
  }
});

async function sameBytes(a, b) {
  const [x, y] = await Promise.all([a.text(), b.text()]);
  return x === y;
}

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Same-origin GETs are served stale-while-revalidate: instant from cache, then
   refreshed in the background. Everything else (Google TTS, Gemini, /api/*)
   goes straight to the network — those must never be served from a cache. */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/.netlify/')) return;

  e.respondWith(
    caches.match(req).then((hit) => {
      const fresh = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit || caches.match('/french-sounds.html'));
      return hit || fresh;
    })
  );
});

/* ---- Push: Rémy taps the learner on the shoulder ---- */
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = {}; }

  const title = d.title || 'Rémy vous attend !';
  const opts = {
    body: d.body || 'Cinq minutes de français ? Your ear will thank you.',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
    tag: d.tag || 'ecoute-reminder',   // a new reminder replaces the old one
    renotify: true,
    requireInteraction: false,
    data: { url: d.url || '/?src=push' },
    actions: [
      { action: 'practice', title: '▶ Practise now' },
      { action: 'later', title: 'Later' },
    ],
  };
  e.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (e.action === 'later') return;

  const target = (e.notification.data && e.notification.data.url) || '/?src=push';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) {
          c.navigate(target).catch(() => {});
          return c.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});

/* Chrome can rotate a subscription out from under us; re-subscribe and re-register. */
self.addEventListener('pushsubscriptionchange', (e) => {
  e.waitUntil((async () => {
    const old = e.oldSubscription || (await self.registration.pushManager.getSubscription());
    const key = e.oldSubscription && e.oldSubscription.options
      ? e.oldSubscription.options.applicationServerKey
      : null;
    if (!key) return;
    const sub = await self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: key,
    });
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: sub.toJSON(),
        replaces: old ? old.endpoint : null,
        tzOffset: new Date().getTimezoneOffset(),
      }),
    }).catch(() => {});
  })());
});
