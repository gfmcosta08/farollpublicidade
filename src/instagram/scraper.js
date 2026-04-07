/**
 * Analisa URLs de referência do Instagram e extrai contexto de estilo.
 * Estratégia sem browser headless (compatível com Render):
 *   1. Posts públicos → oEmbed do Facebook/Instagram
 *   2. Perfis → extrai username e descreve estilo esperado
 *   3. Fallback → passa a URL diretamente como contexto para o LLM
 */

const OEMBED_BASE = 'https://graph.facebook.com/v18.0/instagram_oembed';

export async function analyzeReference(url) {
  if (!url?.trim()) return '';

  const clean = url.trim();

  // Tentativa 1: oEmbed para posts públicos (não requer auth se for post público)
  if (clean.match(/instagram\.com\/p\//)) {
    try {
      const oembedUrl = `${OEMBED_BASE}?url=${encodeURIComponent(clean)}&fields=author_name,title,thumbnail_url`;
      const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        return `Post de referência de @${data.author_name}: "${data.title || 'sem título'}". Use o estilo visual e comunicativo deste criador como inspiração.`;
      }
    } catch {
      // continua para fallback
    }
  }

  // Tentativa 2: Reels
  if (clean.match(/instagram\.com\/reel\//)) {
    try {
      const oembedUrl = `${OEMBED_BASE}?url=${encodeURIComponent(clean)}&fields=author_name,title`;
      const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        return `Reel de referência de @${data.author_name}: "${data.title || 'sem título'}". Inspire-se no estilo deste criador.`;
      }
    } catch {
      // continua
    }
  }

  // Tentativa 3: extrai username do perfil
  const profileMatch = clean.match(/instagram\.com\/([^/?#]+)\/?$/);
  if (profileMatch) {
    const username = profileMatch[1];
    // Evita falsos positivos (pages do IG como /explore, /stories, etc.)
    if (!['explore', 'stories', 'reels', 'tv', 'accounts', 'p', 'reel'].includes(username)) {
      return `Perfil de referência: @${username} no Instagram. Analise o estilo visual, tom de voz e estrutura de conteúdo típicos deste tipo de perfil para criar conteúdo similar.`;
    }
  }

  // Fallback genérico
  return `Referência de estilo: ${clean}. Use como inspiração visual e comunicativa.`;
}
