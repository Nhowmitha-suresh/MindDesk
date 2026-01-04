// Lightweight Ollama helper for generating short, professional tips.
// This attempts to call a local Ollama HTTP endpoint. If unavailable,
// it falls back to a simple rule-based recommendations summary.

export async function generateAiTips(scores = {}) {
  // Prepare concise prompt summarizing user's trait scores
  const entries = Object.entries(scores || {}).filter(([,v]) => typeof v === 'number');
  if (!entries.length) return 'No score data available to generate AI suggestions.';

  entries.sort((a,b) => a[1] - b[1]); // lowest first
  const low = entries.slice(0, 4);

  const summaryLines = low.map(([trait, val]) => `- ${trait}: ${val}%`);
  const prompt = `You are a professional organizational psychologist. Given the following trait scores for a professional user, produce a short, actionable, and professional set of recommendations and one practical micro-exercise per trait. Keep it concise (3-5 bullet points per trait).\n\nScores:\n${summaryLines.join('\n')}\n\nRespond in plain text, with trait headings followed by bullets.`;

  // Configurable endpoint and model
  const OLLAMA_URL = window.OLLAMA_URL || 'http://127.0.0.1:11434/api/generate';
  const MODEL = window.OLLAMA_MODEL || 'llama2';

  // Try calling Ollama with a short timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const body = JSON.stringify({ model: MODEL, prompt });
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error('Ollama responded with ' + res.status);

    // Ollama may stream; try to parse JSON or text
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const j = await res.json();
      // If Ollama returns { text: '...' } or similar
      if (typeof j === 'object') {
        if (j.text) return j.text;
        if (j.output && typeof j.output === 'string') return j.output;
        // fallback stringified
        return JSON.stringify(j, null, 2);
      }
    }

    // otherwise return plain text
    const txt = await res.text();
    if (txt && txt.length) return txt;
    throw new Error('Empty response from Ollama');
  } catch (e) {
    // Fallback: simple professional tips using rule-based map
    const fallbackMap = {
      'Resilience': 'Practice brief reflection after setbacks: note one small recovery step and one learning per week.',
      'EmotionalRegulation': 'Use a 3-3-6 breathing exercise before high-stakes conversations.',
      'Conscientiousness': 'Adopt a two-minute planning routine each morning to capture top priorities.',
      'Accountability': 'Write a one-paragraph post-mortem for key tasks to capture lessons learned.',
      'GrowthMindset': 'Try a small daily challenge and track incremental improvements for two weeks.',
      'SelfAwareness': 'Keep a brief end-of-day note on one success and one area to improve.',
      'Adaptability': 'Experiment with swapping one routine task each week to build flexibility.',
      'Creativity': 'Schedule 10 minutes of free ideation without judging ideas.',
      'Leadership': 'Give specific, public praise to a colleague for something they did well this week.',
      'Drive': 'Set a 3-day micro-goal and measure progress daily.',
      'Ethics': 'Before major choices, list stakeholders and one fairness consideration.',
      'ProblemSolving': 'Practice 5-whys on a small recurring issue to find root causes.',
      'DecisionMaking': 'Limit options to three and test the leading option quickly.'
    };

    let out = 'AI unavailable — showing concise fallback recommendations:\n\n';
    low.forEach(([trait, val]) => {
      out += `${trait} — ${val}%:\n• ${fallbackMap[trait] || 'Short reflection: pick one action this week to improve.'}\n\n`;
    });
    out += `(Error: ${e.message || e})`;
    return out;
  }
}
