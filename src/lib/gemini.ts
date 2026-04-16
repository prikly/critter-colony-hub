// Gemini API utility — requires VITE_GEMINI_API_KEY in .env
const API_KEY = typeof window !== 'undefined' ? (import.meta as any).env?.VITE_GEMINI_API_KEY : '';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function callGemini(prompt: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  const res = await fetch(`${BASE_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 512 },
    }),
  });
  if (!res.ok) throw new Error('Gemini API error');
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function parseJson<T>(text: string): T {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array found');
  return JSON.parse(match[0]);
}

function parseJsonObj<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found');
  return JSON.parse(match[0]);
}

export async function generateIceBreakers(name: string, org: string, role: string): Promise<string[]> {
  try {
    const prompt = `You are a fun event host. The attendee's name is ${name}, they study/work as ${role} at ${org}. Suggest 3 short, witty one-liner ice-breakers they can add to their profile. Max 15 words each. Return a JSON array of 3 strings only, no explanation.`;
    const text = await callGemini(prompt);
    return parseJson<string[]>(text);
  } catch {
    // Fallback suggestions
    return [
      `${name} here — powered by caffeine and curiosity ☕`,
      `Breaking ice since ${new Date().getFullYear()} — ask me anything!`,
      `${role} by day, creature tamer by night 🌙`,
    ];
  }
}

export async function generateTriviaQuestions(): Promise<Array<{ question: string; options: string[]; correctIndex: number; difficulty: 'easy' | 'medium' }>> {
  try {
    const prompt = `Generate 5 trivia questions suitable for a college/tech event. Each question has 4 answer options. Return JSON array: [{question, options: [A,B,C,D], correctIndex: 0-3, difficulty: "easy"|"medium"}]. Return only the JSON, no explanation.`;
    const text = await callGemini(prompt);
    return parseJson(text);
  } catch {
    return [
      { question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech ML', 'Hyper Transfer ML', 'Home Tool ML'], correctIndex: 0, difficulty: 'easy' },
      { question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctIndex: 1, difficulty: 'easy' },
      { question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correctIndex: 2, difficulty: 'medium' },
      { question: 'Who created Python?', options: ['James Gosling', 'Guido van Rossum', 'Dennis Ritchie', 'Bjarne Stroustrup'], correctIndex: 1, difficulty: 'medium' },
      { question: 'What year was the first iPhone released?', options: ['2005', '2006', '2007', '2008'], correctIndex: 2, difficulty: 'easy' },
    ];
  }
}

export async function validateWordChain(chain: string[], newWord: string): Promise<{ valid: boolean; reason: string }> {
  try {
    const prompt = `Current word chain: [${chain.join(', ')}]. The player submitted "${newWord}". Is this valid? Rules: must start with last letter of previous word, must be a real English word, must not already be in the chain. Reply with JSON: {valid: true|false, reason: string}. Return only JSON.`;
    const text = await callGemini(prompt);
    return parseJsonObj(text);
  } catch {
    // Simple local validation fallback
    if (chain.length > 0) {
      const lastWord = chain[chain.length - 1];
      const lastLetter = lastWord[lastWord.length - 1].toLowerCase();
      if (newWord[0].toLowerCase() !== lastLetter) {
        return { valid: false, reason: `Word must start with "${lastLetter}"` };
      }
    }
    if (chain.map(w => w.toLowerCase()).includes(newWord.toLowerCase())) {
      return { valid: false, reason: 'Word already used!' };
    }
    return { valid: true, reason: 'Accepted!' };
  }
}
