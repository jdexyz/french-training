/* Shared plumbing for the reminder functions.
   Lives outside netlify/functions/ so Netlify doesn't try to deploy it as a
   function of its own — the bundler still follows the relative imports. */

import { getStore } from '@netlify/blobs';
import webpush from 'web-push';

export const STORE = 'ecoute-reminders';

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export function store() {
  return getStore(STORE);
}

/* Push endpoints are long URLs; base64url keeps them legal as blob keys and
   lets us address a subscription without keeping a separate index. */
export function keyFor(endpoint) {
  return Buffer.from(String(endpoint), 'utf8').toString('base64url');
}

/* Returns false when the site owner hasn't set the VAPID env vars yet — the
   client uses that to keep the reminder toggle honest instead of failing later. */
export function configurePush() {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:hello@example.com', pub, priv);
  return true;
}

export function clampHour(h) {
  const n = parseInt(h, 10);
  return Number.isFinite(n) && n >= 0 && n <= 23 ? n : 19;
}

/* The learner's wall-clock time, derived from the getTimezoneOffset() they sent
   at subscribe time. Offset is minutes to ADD to local to reach UTC, so
   local = UTC - offset. */
export function localNow(tzOffsetMinutes, at = Date.now()) {
  const d = new Date(at - (Number(tzOffsetMinutes) || 0) * 60000);
  return { hour: d.getUTCHours(), date: d.toISOString().slice(0, 10) };
}

/* Should this device get a nudge on this run? Pure, so it can be tested against
   awkward timezones without a push service in the loop.

   Rules, in order:
   - practised today already -> silence, that's the whole point
   - we already pushed them this hour -> silence (the cron can fire twice)
   - it's the hour they asked for -> nudge
   - it's 21:00 their time, they chose an earlier hour, and a real streak is
     about to die -> one last nudge
   - otherwise -> silence */
export function decide(rec, at = Date.now()) {
  const local = localNow(rec.tzOffset, at);

  if (rec.lastPracticeDate === local.date) return { send: false, why: 'practised', local };
  if (rec.lastSentDate === local.date && rec.lastSentHour === local.hour) {
    return { send: false, why: 'already-sent', local };
  }

  const atChosenHour = local.hour === clampHour(rec.hour);
  const streakAtRisk = local.hour === 21 && clampHour(rec.hour) < 21 && (rec.streak || 0) >= 2;
  if (!atChosenHour && !streakAtRisk) return { send: false, why: 'not-their-hour', local };

  return { send: true, streakAtRisk, local };
}

/* Sends, and reports whether the subscription is dead so the caller can prune it.
   404/410 is the push service telling us the endpoint is gone for good. */
export async function sendTo(rec, payload) {
  try {
    await webpush.sendNotification(
      { endpoint: rec.endpoint, keys: rec.keys },
      JSON.stringify(payload),
      { TTL: 6 * 3600 }
    );
    return { ok: true };
  } catch (err) {
    const gone = err && (err.statusCode === 404 || err.statusCode === 410);
    return { ok: false, gone, error: String((err && err.message) || err) };
  }
}
