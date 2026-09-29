import { readJson, sendJson, streamChat } from './_providers.js';

/**
 * POST /api/chat  { provider, model, messages }
 * Streams the assistant reply back as plain UTF-8 text chunks.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  let body;
  try {
    body = await readJson(req);
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON body' });
  }

  const { provider, model, messages } = body || {};
  if (!['groq', 'gemini', 'openrouter'].includes(provider) || typeof model !== 'string' || !Array.isArray(messages)) {
    return sendJson(res, 400, { error: 'provider, model and messages are required' });
  }

  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) controller.abort();
  });

  let started = false;
  const write = (text) => {
    if (!started) {
      started = true;
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('X-Accel-Buffering', 'no');
    }
    res.write(text);
  };

  try {
    await streamChat({ provider, model, messages, signal: controller.signal }, write);
    if (!started) write('');
    res.end();
  } catch (err) {
    if (controller.signal.aborted) return res.end();
    const message = err?.message || 'The AI provider did not respond.';
    if (!started) return sendJson(res, 502, { error: message });
    // Headers already sent: append a marker the client turns into an error.
    res.end(`\n\n[[error]]${message}`);
  }
}
