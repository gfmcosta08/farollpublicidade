import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const clientCache = new Map();

const MINIMAX_DEFAULT_BASE = 'https://api.minimax.io/v1';

/** IDs legados salvos em squads antigos → modelos atuais (OpenAI-compatible API). */
const MINIMAX_MODEL_ALIASES = {
  'abab6.5s-chat': 'MiniMax-M2.5',
  'abab-6.5s-chat': 'MiniMax-M2.5',
  'abab6.5-chat': 'MiniMax-M2.5',
  'abab-6.5-chat': 'MiniMax-M2.5',
  'abab5.5s-chat': 'MiniMax-M2',
  'abab-5.5s-chat': 'MiniMax-M2',
  'abab5.5-chat': 'MiniMax-M2',
  'MiniMax-Text-01': 'MiniMax-M2.7',
};

function resolveMinimaxModel(model) {
  return MINIMAX_MODEL_ALIASES[model] || model;
}

function minimaxBaseURL() {
  const u = process.env.MINIMAX_BASE_URL?.trim();
  return u || MINIMAX_DEFAULT_BASE;
}

function openaiClient(apiKey, baseURL) {
  const key = `openai:${apiKey}:${baseURL}`;
  if (!clientCache.has(key)) {
    clientCache.set(key, new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) }));
  }
  return clientCache.get(key);
}

function anthropicClient(apiKey) {
  const key = `anthropic:${apiKey}`;
  if (!clientCache.has(key)) clientCache.set(key, new Anthropic({ apiKey }));
  return clientCache.get(key);
}

/**
 * Unified LLM call — supports openai, anthropic, minimax.
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

  if (provider === 'anthropic') {
    const systemMsg = messages.find(m => m.role === 'system');
    const userMsgs  = messages.filter(m => m.role !== 'system');
    const res = await anthropicClient(api_key).messages.create({
      model,
      max_tokens: maxTokens,
      system: systemMsg?.content || '',
      messages: userMsgs,
    });
    return res.content[0].text;
  }

  if (provider === 'minimax') {
    const resolvedModel = resolveMinimaxModel(model);
    const res = await openaiClient(api_key, minimaxBaseURL()).chat.completions.create({
      model: resolvedModel,
      messages,
      temperature,
      max_tokens: maxTokens,
    });
    return res.choices[0].message.content;
  }

  throw new Error(`Provider desconhecido: ${provider}`);
}
