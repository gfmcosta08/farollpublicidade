import { callLLM } from './llm-client.js';
import { generateImage } from './image-client.js';
import {
  researcherSystemPrompt,
  strategistSystemPrompt,
  writerSystemPrompt,
  designerSystemPrompt,
  reviewerSystemPrompt,
} from './prompts.js';

function safeParseJSON(text, fallback) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : fallback;
  } catch {
    return fallback;
  }
}

export async function runResearcher(llm, context) {
  const system = await researcherSystemPrompt();
  return callLLM({ ...llm, messages: [
    { role: 'system', content: system },
    { role: 'user',   content: context },
  ]});
}

export async function runStrategist(llm, context, research) {
  const system = await strategistSystemPrompt(context.domain);
  return callLLM({ ...llm, messages: [
    { role: 'system', content: system },
    { role: 'user',   content: `${context.brief}\n\nPesquisa:\n${research}` },
  ]});
}

export async function runWriter(llm, context, priorOutput) {
  const system = await writerSystemPrompt(context.platforms);
  const raw = await callLLM({ ...llm, messages: [
    { role: 'system', content: system },
    { role: 'user',   content: `${context.brief}\n\nEstratégia:\n${priorOutput}` },
  ]});
  return safeParseJSON(raw, { slides: [], caption: raw, hashtags: [] });
}

export async function runDesigner(llm, copy, styleContext) {
  const system = await designerSystemPrompt(styleContext);
  const raw = await callLLM({ ...llm, messages: [
    { role: 'system', content: system },
    { role: 'user',   content: `Conteúdo dos slides:\n${JSON.stringify(copy.slides, null, 2)}` },
  ]});
  const parsed = safeParseJSON(raw, { image_prompts: [] });
  const prompts = parsed.image_prompts?.length
    ? parsed.image_prompts
    : copy.slides.map((s, i) => `Professional social media graphic, slide ${i + 1}: ${s.title}. ${styleContext}`);

  const noTextSuffix = ' Absolutely no text, no letters, no words, no numbers, no typography, no captions, no watermarks in the image.';

  const images = [];
  for (let i = 0; i < Math.min(prompts.length, 6); i++) {
    try {
      const prompt = `${prompts[i].trim()}${noTextSuffix}`;
      const b64 = await generateImage({ api_key: llm.api_key, prompt });
      images.push({ slide: i + 1, b64 });
    } catch (err) {
      images.push({ slide: i + 1, error: err.message });
    }
  }
  return images;
}

export async function runReviewer(llm, copy) {
  const system = await reviewerSystemPrompt();
  const raw = await callLLM({ ...llm, messages: [
    { role: 'system', content: system },
    { role: 'user',   content: `Revise e melhore:\n${JSON.stringify(copy, null, 2)}` },
  ]});
  return safeParseJSON(raw, copy);
}
