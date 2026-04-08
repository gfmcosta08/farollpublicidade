import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openaiCache = new Map();

function openaiClient(apiKey) {
  const key = `openai:${apiKey}`;
  if (!openaiCache.has(key)) openaiCache.set(key, new OpenAI({ apiKey }));
  return openaiCache.get(key);
}

/** Converte mensagens estilo OpenAI para histórico Gemini. */
function buildGeminiParts(messages) {
  const system = messages.find((m) => m.role === 'system')?.content || '';
  const rest = messages.filter((m) => m.role !== 'system');
  const history = [];
  for (const m of rest) {
    if (m.role === 'user') history.push({ role: 'user', parts: [{ text: String(m.content) }] });
    else if (m.role === 'assistant') history.push({ role: 'model', parts: [{ text: String(m.content) }] });
  }
  return { system, history };
}

/**
 * Chamada unificada — openai ou google (Gemini).
 * @param {{ provider: string, model: string, api_key: string, messages: object[], temperature?: number, maxTokens?: number }} opts
 * @returns {Promise<string>}
 */
export async function callLLM({ provider, model, api_key, messages, temperature = 0.7, maxTokens = 4096 }) {
  if (provider === 'openai') {
    const res = await openaiClient(api_key).chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });
    return res.choices[0].message.content;
  }

  if (provider === 'google') {
    const genAI = new GoogleGenerativeAI(api_key);
    const { system, history } = buildGeminiParts(messages);
    const gm = genAI.getGenerativeModel({
      model,
      systemInstruction: system || undefined,
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    });
    if (history.length === 0) return '';
    if (history.length === 1) {
      const r = await gm.generateContent(history[0].parts[0].text);
      return r.response.text();
    }
    const chat = gm.startChat({ history: history.slice(0, -1) });
    const last = history[history.length - 1];
    const r = await chat.sendMessage(last.parts[0].text);
    return r.response.text();
  }

  throw new Error(`Provider desconhecido: ${provider}`);
}
