export async function invokeLLM(prompt) {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, jsonMode: false }),
      signal: AbortSignal.timeout(45000)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (err.error === 'TIMEOUT') return '_A IA demorou para responder. Tente novamente._';
      return `_Serviço de IA indisponível no momento. Tente novamente em alguns instantes._`;
    }

    const data = await res.json();
    return data.text || '_Sem resposta da IA. Tente novamente._';
  } catch (e) {
    if (e.name === 'TimeoutError' || e.name === 'AbortError') {
      return '_A IA demorou para responder. Tente novamente._';
    }
    return '_Serviço de IA temporariamente indisponível. Tente novamente._';
  }
}

export async function invokeLLMJSON(prompt, schema) {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, jsonMode: true }),
      signal: AbortSignal.timeout(45000)
    });

    if (!res.ok) return null;

    const data = await res.json();
    const text = data.text || '';

    const clean = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start === -1 || end === -1) {
      const arrStart = clean.indexOf('[');
      const arrEnd = clean.lastIndexOf(']');
      if (arrStart !== -1 && arrEnd !== -1) {
        try {
          const arr = JSON.parse(clean.slice(arrStart, arrEnd + 1));
          return { questions: arr };
        } catch (_) {}
      }
      return null;
    }

    return JSON.parse(clean.slice(start, end + 1));
  } catch (e) {
    console.error('JSON AI error:', e);
    return null;
  }
}
