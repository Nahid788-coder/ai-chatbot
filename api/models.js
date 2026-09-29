import { listModels, sendJson } from './_providers.js';

let cache = { at: 0, models: [] };
let pending = null; // requests that arrive together share one lookup

/** GET /api/models — chat models currently available with the configured keys. */
export default async function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });
  try {
    if (Date.now() - cache.at > 10 * 60 * 1000 || cache.models.length === 0) {
      pending ??= listModels().finally(() => {
        pending = null;
      });
      cache = { at: Date.now(), models: await pending };
    }
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    sendJson(res, 200, { models: cache.models });
  } catch (err) {
    sendJson(res, 500, { error: err?.message || 'Could not list models', models: [] });
  }
}
