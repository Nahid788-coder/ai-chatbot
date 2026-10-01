import { sendJson } from './_providers.js';

/**
 * GET /api/keepalive: one tiny read from Supabase.
 * Free Supabase projects pause after about a week without traffic, which breaks
 * sign-in. A Vercel cron (vercel.json) calls this once a day so that never happens.
 */
export default async function handler(req, res) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) return sendJson(res, 503, { ok: false, error: 'Supabase is not configured' });
  try {
    const r = await fetch(`${url}/rest/v1/conversations?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    sendJson(res, r.ok ? 200 : 502, { ok: r.ok, status: r.status, at: new Date().toISOString() });
  } catch (err) {
    sendJson(res, 502, { ok: false, error: err?.message || 'Supabase did not respond' });
  }
}
