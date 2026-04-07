import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const clientCache = new Map();

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
    // MiniMax exposes an OpenAI-compatible endpoint
    const res = await openaiClient(api_key, 'https://api.minimaxi.chat/v1')
      .chat.completions.create({ model, messages, temperature, max_tokens: maxTokens });
    return res.choices[0].message.content;
  }

  throw new Error(`Provider desconhecido: ${provider}`);
}
