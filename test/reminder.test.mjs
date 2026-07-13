import { decide, localNow, keyFor, clampHour } from '../netlify/lib/push.mjs';

let fails = 0, n = 0;
const ok = (c, m) => { n++; if (!c) { fails++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m}  (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);

// getTimezoneOffset(): minutes to ADD to local to reach UTC. Paris in summer = -120.
const PARIS = -120;   // UTC+2
const NY = 240;       // UTC-4
const TOKYO = -540;   // UTC+9
const UTC = 0;

const at = (iso) => Date.parse(iso);

console.log('--- localNow maps UTC to the learner\'s wall clock');
eq(localNow(PARIS, at('2026-07-13T17:30:00Z')).hour, 19, 'Paris: 17:30Z is 19:30 local');
eq(localNow(PARIS, at('2026-07-13T17:30:00Z')).date, '2026-07-13', 'Paris: same calendar day');
eq(localNow(NY, at('2026-07-13T23:30:00Z')).hour, 19, 'New York: 23:30Z is 19:30 local');
eq(localNow(NY, at('2026-07-13T23:30:00Z')).date, '2026-07-13', 'New York: still the 13th locally');
eq(localNow(TOKYO, at('2026-07-13T10:00:00Z')).hour, 19, 'Tokyo: 10:00Z is 19:00 local');

console.log('--- the date rolls over in local time, not UTC');
// 02:00 Tokyo on the 14th is still 17:00 UTC on the 13th
eq(localNow(TOKYO, at('2026-07-13T17:00:00Z')).date, '2026-07-14', 'Tokyo is already on the next day');
// 20:00 New York on the 13th is 00:00 UTC on the 14th
eq(localNow(NY, at('2026-07-14T00:00:00Z')).date, '2026-07-13', 'New York is still on the previous day');

const base = { endpoint: 'https://push.example/x', keys: {}, hour: 19, streak: 0, tzOffset: PARIS };

console.log('--- nudges land at the learner\'s chosen hour');
ok(decide({ ...base }, at('2026-07-13T17:05:00Z')).send, 'Paris, 19:05 local, hour=19 -> send');
ok(!decide({ ...base }, at('2026-07-13T16:05:00Z')).send, 'Paris, 18:05 local -> silence');
ok(!decide({ ...base }, at('2026-07-13T18:05:00Z')).send, 'Paris, 20:05 local -> silence');
ok(decide({ ...base, tzOffset: NY }, at('2026-07-13T23:05:00Z')).send, 'New York, 19:05 local -> send');
ok(!decide({ ...base, tzOffset: NY }, at('2026-07-13T17:05:00Z')).send, 'New York at 13:05 local -> silence (would have been 19:00 in Paris)');
ok(decide({ ...base, tzOffset: TOKYO }, at('2026-07-13T10:05:00Z')).send, 'Tokyo, 19:05 local -> send');
ok(decide({ ...base, tzOffset: UTC, hour: 8 }, at('2026-07-13T08:30:00Z')).send, 'UTC, morning person -> send');

console.log('--- already practised today: stay quiet');
eq(decide({ ...base, lastPracticeDate: '2026-07-13' }, at('2026-07-13T17:05:00Z')).why, 'practised',
  'practised today -> no nudge');
ok(decide({ ...base, lastPracticeDate: '2026-07-12' }, at('2026-07-13T17:05:00Z')).send,
  'practised yesterday but not today -> nudge');
// the learner's "today" is what counts, not the server's
ok(!decide({ ...base, tzOffset: TOKYO, hour: 2, lastPracticeDate: '2026-07-14' }, at('2026-07-13T17:05:00Z')).send,
  'Tokyo: practice logged against the local date suppresses the nudge');

console.log('--- never push the same device twice in one hour');
eq(decide({ ...base, lastSentDate: '2026-07-13', lastSentHour: 19 }, at('2026-07-13T17:05:00Z')).why,
  'already-sent', 'a second cron run in the same hour is a no-op');
ok(decide({ ...base, lastSentDate: '2026-07-13', lastSentHour: 18 }, at('2026-07-13T17:05:00Z')).send,
  'a send in a *different* hour does not block this one');
ok(decide({ ...base, lastSentDate: '2026-07-12', lastSentHour: 19 }, at('2026-07-13T17:05:00Z')).send,
  'yesterday\'s send does not block today\'s');

console.log('--- the 21:00 last call, only for a streak worth saving');
const risky = { ...base, hour: 19, streak: 5 };
const r21 = decide(risky, at('2026-07-13T19:05:00Z'));   // 21:05 Paris
ok(r21.send && r21.streakAtRisk, 'streak of 5 unsaved at 21:00 -> urgent nudge');
ok(!decide({ ...base, hour: 19, streak: 1 }, at('2026-07-13T19:05:00Z')).send,
  'a 1-day streak is not worth a second push');
ok(!decide({ ...base, hour: 19, streak: 5, lastPracticeDate: '2026-07-13' }, at('2026-07-13T19:05:00Z')).send,
  'no last call if they already practised');
ok(!decide({ ...base, hour: 22, streak: 5 }, at('2026-07-13T19:05:00Z')).send,
  'someone who chose 22:00 does not get a 21:00 pre-nudge');
const at19 = decide(risky, at('2026-07-13T17:05:00Z'));
ok(at19.send && !at19.streakAtRisk, 'the 19:00 nudge is the normal one, not the urgent one');

console.log('--- misc');
eq(clampHour(25), 19, 'a nonsense hour falls back to 19:00');
eq(clampHour(0), 0, 'midnight is a legal hour');
eq(clampHour(undefined), 19, 'missing hour -> default');
const k = keyFor('https://fcm.googleapis.com/fcm/send/abc-123_XYZ');
ok(/^[A-Za-z0-9_-]+$/.test(k), 'blob key is url-safe: ' + k);
eq(Buffer.from(k, 'base64url').toString('utf8'), 'https://fcm.googleapis.com/fcm/send/abc-123_XYZ',
  'blob key round-trips back to the endpoint');

console.log('');
console.log(fails ? `FAILED ${fails} of ${n}` : `all ${n} assertions passed`);
if (fails) process.exitCode = 1;
