/* POST /api/practiced — the app finished a lesson, so today is covered.
   This is what stops Rémy from nagging someone who already did their reps. */

import { json, store, keyFor } from '../lib/push.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad JSON' }, 400); }
  if (!body || !body.endpoint) return json({ error: 'missing endpoint' }, 400);

  const s = store();
  const k = keyFor(body.endpoint);
  const rec = await s.get(k, { type: 'json' }).catch(() => null);
  if (!rec) return json({ ok: false, unknown: true }, 404);

  rec.lastPracticeDate = body.localDate || rec.lastPracticeDate;
  rec.streak = Number(body.streak) || 0;
  if (Number.isFinite(body.tzOffset)) rec.tzOffset = body.tzOffset;
  rec.updatedAt = new Date().toISOString();

  await s.setJSON(k, rec);
  return json({ ok: true });
};
