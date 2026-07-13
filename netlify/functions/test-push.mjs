/* POST /api/test-push {endpoint} — fire one notification at this device now.
   Wired to the "Send a test" link in the reminder settings: the only reliable way
   to confirm the whole chain (VAPID → push service → service worker) really works. */

import { json, store, keyFor, configurePush, sendTo } from '../lib/push.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!configurePush()) return json({ error: 'Reminders are not configured on the server (no VAPID keys).' }, 503);

  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad JSON' }, 400); }
  if (!body || !body.endpoint) return json({ error: 'missing endpoint' }, 400);

  const rec = await store().get(keyFor(body.endpoint), { type: 'json' }).catch(() => null);
  if (!rec) return json({ error: 'This device is not subscribed.' }, 404);

  const res = await sendTo(rec, {
    title: 'Rémy checking in ✅',
    body: 'Reminders work. See you at your practice hour.',
    url: '/?src=push',
    tag: 'ecoute-test',
  });

  if (!res.ok) return json({ error: res.error || 'Push failed.' }, 502);
  return json({ ok: true });
};
