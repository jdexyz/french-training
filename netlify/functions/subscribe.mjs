/* POST /api/subscribe — remember a browser so the hourly job can nudge it.

   We store the learner's UTC offset and their preferred local hour, never any
   identity: a push endpoint is the only thing that ties a record to a device. */

import { json, store, keyFor, clampHour } from '../lib/push.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad JSON' }, 400); }

  const sub = body && body.subscription;
  if (!sub || !sub.endpoint || !sub.keys) return json({ error: 'missing subscription' }, 400);

  const s = store();
  const prev = await s.get(keyFor(sub.endpoint), { type: 'json' }).catch(() => null);

  await s.setJSON(keyFor(sub.endpoint), {
    endpoint: sub.endpoint,
    keys: sub.keys,
    tzOffset: Number.isFinite(body.tzOffset) ? body.tzOffset : 0,
    hour: clampHour(body.hour),
    // don't lose practice history when the client re-subscribes on every load
    lastPracticeDate: body.lastPracticeDate || (prev && prev.lastPracticeDate) || null,
    streak: Number(body.streak) || (prev && prev.streak) || 0,
    createdAt: (prev && prev.createdAt) || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // pushsubscriptionchange hands us the endpoint that was rotated out
  if (body.replaces && body.replaces !== sub.endpoint) {
    await s.delete(keyFor(body.replaces)).catch(() => {});
  }

  return json({ ok: true });
};
