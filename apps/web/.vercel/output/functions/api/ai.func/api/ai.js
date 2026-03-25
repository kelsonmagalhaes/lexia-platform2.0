const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

async function callOpenRouter(prompt, jsonMode) {
  if (!OPENROUTER_KEY) throw new Error('No OpenRouter key');
  const systemPrompt = jsonMode
    ? 'Você é um assistente jurídico especializado em Direito brasileiro. Responda APENAS com JSON puro válido, sem markdown, sem explicações extras.'
    : 'Você é Lex IA, assistente jurídica especializada em Direito brasileiro. Responda em português, de forma didática e precisa, usando markdown para formatação.';

  const body = {
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    max_tokens: 2048,
    temperature: 0.7
  };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'HTTP-Referer': 'https://lexstudy-academia-juridica.vercel.app',
      'X-Title': 'LexStudy Academia Juridica'
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000)
  });

  if (res.status === 429) throw new Error('RATE_LIMIT');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenRouter HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callGemini(prompt, jsonMode) {
  if (!GEMINI_KEY) throw new Error('No Gemini key');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
  const systemText = jsonMode
    ? 'Você é um assistente jurídico especializado em Direito brasileiro. Responda APENAS com JSON puro válido, sem markdown, sem explicações extras.'
    : 'Você é Lex IA, assistente jurídica especializada em Direito brasileiro. Responda em português, de forma didática e precisa, usando markdown para formatação.';

  const body = {
    contents: [{ role: 'user', parts: [{ text: `${systemText}\n\n${prompt}` }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000)
  });

  if (res.status === 429) throw new Error('RATE_LIMIT');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callPollinationsOpenAI(prompt, jsonMode) {
  const systemPrompt = jsonMode
    ? 'Você é um assistente jurídico especializado em Direito brasileiro. Responda APENAS com JSON puro válido, sem markdown, sem explicações extras.'
    : 'Você é Lex IA, assistente jurídica especializada em Direito brasileiro. Responda em português, de forma didática e precisa, usando markdown para formatação.';

  const body = {
    model: 'openai',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    private: true,
    seed: 42
  };

  const res = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000)
  });

  if (!res.ok) throw new Error(`Pollinations HTTP ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, jsonMode } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  const providers = [
    { name: 'openrouter', fn: () => callOpenRouter(prompt, jsonMode) },
    { name: 'gemini', fn: () => callGemini(prompt, jsonMode) },
    { name: 'pollinations', fn: () => callPollinationsOpenAI(prompt, jsonMode) },
  ];

  let lastError = null;
  for (const provider of providers) {
    try {
      const text = await provider.fn();
      if (text && text.trim().length > 5) {
        return res.status(200).json({ text, provider: provider.name });
      }
    } catch (e) {
      if (e.name === 'AbortError' || e.name === 'TimeoutError') {
        lastError = 'TIMEOUT';
        continue;
      }
      lastError = e.message;
      console.error(`${provider.name} failed:`, e.message);
    }
  }

  if (lastError === 'TIMEOUT') {
    return res.status(504).json({ error: 'TIMEOUT' });
  }
  return res.status(500).json({ error: 'Todos os serviços de IA estão indisponíveis. Tente novamente em instantes.' });
}
