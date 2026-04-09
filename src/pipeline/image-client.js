import OpenAI from 'openai';

const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.0-flash-preview-image-generation';

/** Instrução fixa para APIs de imagem (reforço além do prompt do utilizador). */
const GEMINI_IMAGE_SYSTEM =
  'You generate one image from the user description. The image must contain no readable text: no letters, numbers, words, signage, book covers with titles, phone UIs, newspapers, watermarks, or logos with readable names. Visual scene only.';

/**
 * Imagem via DALL-E 3 (OpenAI).
 * @returns {Promise<string>} base64 PNG (sem prefixo data:)
 */
async function generateImageOpenAI(api_key, prompt, size = '1024x1792', quality = 'standard') {
  const client = new OpenAI({ apiKey: api_key });
  const dallE3Prompt = `Create a single image with NO text, letters, numbers, captions, signs, watermarks, or typography anywhere — only the visual scene described below.\n\n${prompt}`;
  const res = await client.images.generate({
    model:           'dall-e-3',
    prompt:          dallE3Prompt,
    n:               1,
    size,
    quality,
    response_format: 'b64_json',
  });
  return res.data[0].b64_json;
}

/**
 * Imagem via API Gemini (Google AI) — modelo com saída de imagem (ex. Nano Banana / Flash Image).
 * Usa REST v1beta para suportar responseModalities.
 * @returns {Promise<string>} base64 PNG ou JPEG
 */
async function generateImageGoogle(api_key, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${encodeURIComponent(api_key)}`;
  const body = {
    systemInstruction: {
      parts: [{ text: GEMINI_IMAGE_SYSTEM }],
    },
    contents: [{
      role:  'user',
      parts: [{ text: `Generate exactly one image. Follow the description; keep the frame free of any written text or typography.\n\n${prompt}` }],
    }],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
    },
  };
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Gemini imagem (${res.status}): ${raw.slice(0, 500)}`);
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Resposta Gemini inválida');
  }
  const parts = data.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) return part.inlineData.data;
  }
  throw new Error('Gemini não devolveu imagem (inlineData). Verifique GEMINI_IMAGE_MODEL e permissões da chave em Google AI Studio.');
}

/**
 * @param {{ provider: 'openai' | 'google', api_key: string, prompt: string, size?: string, quality?: string }} opts
 * @returns {Promise<string>} base64
 */
export async function generateImage({ provider, api_key, prompt, size, quality }) {
  if (provider === 'google') {
    return generateImageGoogle(api_key, prompt);
  }
  return generateImageOpenAI(api_key, prompt, size, quality);
}
