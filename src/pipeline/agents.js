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
  // Fallback sem citar títulos no prompt — citar texto em PT induz o modelo a renderizar palavras na imagem.
  const prompts = parsed.image_prompts?.length
    ? parsed.image_prompts
    : copy.slides.map(
        (_s, i) =>
          `Vertical 9:16 editorial background for social slide ${i + 1} of ${copy.slides.length}, abstract premium mood, soft lighting, cohesive art direction. Theme suggested only through objects, color and atmosphere — no headlines, no posters, no signage. ${styleContext || 'modern, professional, clean'}.`,
      );

  const noTextPrefix =
    '[IMAGE CONSTRAINT — NON-NEGOTIABLE] The output must be a single image with zero readable text: no letters, numbers, words, captions, signs, screens with UI, book titles, labels, logos with readable names, watermarks, or typography anywhere in the frame. Pure visuals only.\n\n';
  const noTextSuffix =
    ' Still: absolutely no text, letters, words, numbers, typography, captions, signs, or watermarks in the image — illustration or photograph only.';

  const images = [];
  for (let i = 0; i < Math.min(prompts.length, 6); i++) {
    try {
      const prompt = `${noTextPrefix}${prompts[i].trim()}${noTextSuffix}`;
      const b64 = await generateImage({ provider: llm.provider, api_key: llm.api_key, prompt });
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
