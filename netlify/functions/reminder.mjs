/* Scheduled hourly. For every subscribed device it works out what time it is
   *for that learner*, and pushes only if (a) it's their chosen hour and (b) they
   haven't already practised today.

   Runs hourly rather than once a day because subscribers can be in any timezone
   and each picks their own reminder hour — the cron itself is UTC. */

import { store, configurePush, decide, sendTo } from '../lib/push.mjs';

const NUDGES = [
  { title: 'Rémy vous attend 🥐', body: "Five minutes of French? Your vowels are getting rusty." },
  { title: "C'est l'heure ! 🇫🇷", body: 'One lesson with Rémy — chat or chaud, can you still tell?' },
  { title: 'Rémy twirls his moustache…', body: 'Your ear was sharp yesterday. Keep it that way.' },
  { title: 'Un petit tour ? 👂', body: 'A quick round of sounds, then you are free.' },
  { title: 'Rémy is waiting', body: 'Nasal vowels do not learn themselves. Allons-y !' },
];

function streakNudge(streak) {
  return {
    title: `🔥 ${streak}-day streak on the line`,
    body: "Rémy is holding the door. One lesson keeps the streak alive.",
  };
}

export default async () => {
  if (!configurePush()) {
    console.log('reminder: VAPID keys not set — nothing to do');
    return new Response('not configured', { status: 200 });
  }

  const s = store();
  const now = Date.now();
  const day = Math.floor(now / 86400000);
  let sent = 0, pruned = 0, skipped = 0;

  const { blobs } = await s.list();

  for (const b of blobs) {
    const rec = await s.get(b.key, { type: 'json' }).catch(() => null);
    if (!rec || !rec.endpoint || !rec.keys) { skipped++; continue; }

    const { send, streakAtRisk, local } = decide(rec, now);
    if (!send) { skipped++; continue; }

    const payload = streakAtRisk
      ? streakNudge(rec.streak)
      : NUDGES[(day + local.hour) % NUDGES.length];

    const res = await sendTo(rec, { ...payload, url: '/?src=push', tag: 'ecoute-reminder' });

    if (res.ok) {
      rec.lastSentDate = local.date;
      rec.lastSentHour = local.hour;
      await s.setJSON(b.key, rec);
      sent++;
    } else if (res.gone) {
      await s.delete(b.key).catch(() => {});
      pruned++;
    } else {
      console.log('reminder: send failed', res.error);
    }
  }

  console.log(`reminder: sent=${sent} pruned=${pruned} skipped=${skipped} total=${blobs.length}`);
  return new Response('ok', { status: 200 });
};

export const config = { schedule: '0 * * * *' };
