import OpenAI from 'openai';

/**
 * Generates an image via DALL-E 3.
 * Returns the image as a base64 string (no prefix).
 * @param {{ api_key: string, prompt: string, size?: string, quality?: string }} opts
 * @returns {Promise<string>} base64 PNG
 */
export async function generateImage({
  api_key,
  prompt,
  size    = '1024x1792',   // portrait — ideal for Instagram
  quality = 'standard',
}) {
  const client = new OpenAI({ apiKey: api_key });
  const res = await client.images.generate({
    model:           'dall-e-3',
    prompt,
    n:               1,
    size,
    quality,
    response_format: 'b64_json',
  });
  return res.data[0].b64_json;
}
