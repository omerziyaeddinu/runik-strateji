export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction } = req.body || {};

  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server missing API key' });

  const models = [
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-001'
  ];

  const delays = [1000, 2000, 4000, 8000];
  let lastError = null;

  for (const model of models) {
    for (let i = 0; i <= delays.length; i++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const payload = {
          contents: [{ parts: [{ text: systemInstruction || '' }, { text: prompt }] }]
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify(payload)
        });

        const text = await response.text();
        let data = null;
        try { data = JSON.parse(text); } catch { data = null; }

        if (!response.ok) {
          const msg = data?.error?.message || text || `HTTP ${response.status}`;
          lastError = `Model ${model}: ${msg}`;
          if (response.status === 503 || response.status === 504) {
            if (i < delays.length) await new Promise(r => setTimeout(r, delays[i]));
            continue;
          }
          break;
        }

        const candidate = data?.candidates?.[0];
        const out = candidate?.content?.parts?.[0]?.text || candidate?.output || candidate?.content || null;
        return res.status(200).json({ text: out });
      } catch (err) {
        lastError = `Model ${model}: ${err?.message || 'unknown error'}`;
        if (i < delays.length) await new Promise(r => setTimeout(r, delays[i]));
        else break;
      }
    }
    // try next model on toplevel failure
  }

  return res.status(502).json({ error: `All models failed or unavailable${lastError ? ': ' + lastError : ''}` });
}
