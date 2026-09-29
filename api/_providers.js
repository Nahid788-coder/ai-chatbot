// Shared server-side helpers for the AI providers.
// API keys live only here (Vercel env vars), never in the browser bundle.

const env = (name) => process.env[name] || process.env[`VITE_${name}`] || '';

export const keys = () => ({
  groq: env('GROQ_KEY'),
  gemini: env('GEMINI_KEY'),
  openrouter: env('OPENROUTER_KEY'),
});

/** Read a JSON body from a Node request (Vercel may already have parsed it). */
export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/* ------------------------------------------------------------------ */
/* Model discovery                                                     */
/* ------------------------------------------------------------------ */

// Groq models that are not chat models (speech, safety classifiers, TTS).
const GROQ_SKIP = /whisper|guard|safeguard|orpheus|tts|playai|distil/i;

const pretty = (id) =>
  id
    .split('/')
    .pop()
    .replace(/[-_]/g, ' ')
    .replace(/\b(\w)/g, (m) => m.toUpperCase())
    .replace(/\bGpt\b/g, 'GPT')
    .replace(/\bOss\b/g, 'OSS')
    .replace(/(\d+)b\b/gi, '$1B');

async function groqModels(key) {
  const r = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!r.ok) return [];
  const { data = [] } = await r.json();
  return data
    .filter((m) => m.active !== false && !GROQ_SKIP.test(m.id))
    .map((m) => ({ id: m.id, name: pretty(m.id), provider: 'groq', context: m.context_window }));
}

async function geminiModels(key) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${key}`);
  if (!r.ok) return [];
  const { models = [] } = await r.json();
  return models
    .filter(
      (m) =>
        m.supportedGenerationMethods?.includes('generateContent') &&
        /flash/i.test(m.name) &&
        !/image|tts|audio|live|embedding|thinking-exp|preview|exp/i.test(m.name),
    )
    .map((m) => {
      const id = m.name.replace(/^models\//, '');
      return { id, name: m.displayName || pretty(id), provider: 'gemini', context: m.inputTokenLimit };
    });
}

async function openrouterModels(key) {
  const r = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!r.ok) return [];
  const { data = [] } = await r.json();
  // Only the free models, so nobody burns credits by accident.
  return data
    .filter((m) => m.id.endsWith(':free') && !/safety|guard|embed|vision-only/i.test(m.id))
    .slice(0, 12)
    .map((m) => ({
      id: m.id,
      name: (m.name || pretty(m.id)).replace(/\s*\(free\)\s*/i, ''),
      provider: 'openrouter',
      context: m.context_length,
    }));
}

export async function listModels() {
  const k = keys();
  const jobs = [
    k.groq ? groqModels(k.groq) : [],
    k.gemini ? geminiModels(k.gemini) : [],
    k.openrouter ? openrouterModels(k.openrouter) : [],
  ];
  const results = await Promise.allSettled(jobs);
  const all = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  // Newest versions first within each provider (e.g. Gemini 3.8 before 2.5).
  const ver = (id) => parseFloat((id.match(/(\d+(?:\.\d+)?)/) || [0, 0])[1]);
  const order = { groq: 0, gemini: 1, openrouter: 2 };
  return all.sort(
    (a, b) => order[a.provider] - order[b.provider] || (a.provider === 'gemini' ? ver(b.id) - ver(a.id) : 0),
  );
}

/* ------------------------------------------------------------------ */
/* Streaming chat                                                      */
/* ------------------------------------------------------------------ */

/**
 * Parse a Server-Sent-Events body and call onData for every `data:` payload.
 * Keeps a buffer so events split across network chunks are not lost.
 */
async function readSSE(body, onData) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith('data:')) continue;
      const data = t.slice(5).trim();
      if (!data || data === '[DONE]') continue;
      try {
        onData(JSON.parse(data));
      } catch {
        /* ignore keep-alive or partial lines */
      }
    }
  }
}

async function errorText(r, label) {
  let msg = `${label} error ${r.status}`;
  try {
    const j = await r.json();
    msg = j.error?.message || j.message || msg;
  } catch {
    /* body was not JSON */
  }
  return msg;
}

/**
 * Stream a reply from the chosen provider. `write(text)` receives each new text delta.
 */
export async function streamChat({ provider, model, messages, signal }, write) {
  const k = keys();
  const history = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-40);

  if (provider === 'gemini') {
    if (!k.gemini) throw new Error('Gemini key is not configured on the server.');
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${k.gemini}`,
      {
        method: 'POST',
        signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: history.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
        }),
      },
    );
    if (!r.ok) throw new Error(await errorText(r, 'Gemini'));
    await readSSE(r.body, (j) => {
      const parts = j.candidates?.[0]?.content?.parts ?? [];
      for (const p of parts) if (p.text && !p.thought) write(p.text);
    });
    return;
  }

  const isGroq = provider === 'groq';
  const key = isGroq ? k.groq : k.openrouter;
  if (!key) throw new Error(`${isGroq ? 'Groq' : 'OpenRouter'} key is not configured on the server.`);

  const r = await fetch(
    isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      signal,
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        ...(isGroq ? {} : { 'HTTP-Referer': 'https://github.com/Nahid788-coder/ai-chatbot', 'X-Title': 'Aurora Chat' }),
      },
      body: JSON.stringify({
        model,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
        max_tokens: 2048,
      }),
    },
  );
  if (!r.ok) throw new Error(await errorText(r, isGroq ? 'Groq' : 'OpenRouter'));
  await readSSE(r.body, (j) => {
    const delta = j.choices?.[0]?.delta?.content;
    if (delta) write(delta);
  });
}
