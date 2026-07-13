/* GET /api/push-key — hands the browser the VAPID public key it needs to
   subscribe. Also the client's way of asking "are reminders configured at all?" */

import { json } from '../lib/push.mjs';

export default async () => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) return json({ configured: false }, 200);
  return json({ configured: true, key });
};
