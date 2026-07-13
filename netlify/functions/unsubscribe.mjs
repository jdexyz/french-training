/* POST /api/unsubscribe — the learner turned reminders off. Forget the device. */

import { json, store, keyFor } from '../lib/push.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad JSON' }, 400); }
  if (!body || !body.endpoint) return json({ error: 'missing endpoint' }, 400);

  await store().delete(keyFor(body.endpoint)).catch(() => {});
  return json({ ok: true });
};
