const IG_BASE = 'https://graph.instagram.com/v18.0';

/**
 * Publica imagens no Instagram via Graph API.
 * Imagens precisam ser URLs públicas — usamos ImgBB para hospedar.
 *
 * @param {{ token: string, userId: string, imgbbKey: string, caption: string, imagesB64: string[] }} opts
 */
export async function publishToInstagram({ token, userId, imgbbKey, caption, imagesB64 }) {
  if (!token || !userId) throw new Error('ig_token e ig_user_id são obrigatórios para publicação');
  if (!imagesB64?.length) throw new Error('Nenhuma imagem disponível para publicar');

  // Upload todas as imagens para ImgBB (obter URLs públicas)
  const imageUrls = await Promise.all(
    imagesB64.map(b64 => uploadToImgBB(imgbbKey, b64)),
  );

  if (imageUrls.length === 1) {
    // Post simples
    const container = await igPost(`/${userId}/media`, token, {
      image_url: imageUrls[0],
      caption,
    });
    await igPost(`/${userId}/media_publish`, token, { creation_id: container.id });
  } else {
    // Carrossel
    const childIds = await Promise.all(
      imageUrls.map(url =>
        igPost(`/${userId}/media`, token, { image_url: url, is_carousel_item: true })
          .then(r => r.id),
      ),
    );
    const carousel = await igPost(`/${userId}/media`, token, {
      media_type: 'CAROUSEL',
      children:   childIds.join(','),
      caption,
    });
    await igPost(`/${userId}/media_publish`, token, { creation_id: carousel.id });
  }
}

async function igPost(path, token, body) {
  const url = `${IG_BASE}${path}?access_token=${token}`;
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(`Instagram API: ${err.error?.message || res.statusText}`);
  }
  return res.json();
}

async function uploadToImgBB(apiKey, base64) {
  if (!apiKey) throw new Error('imgbb_key é obrigatório para hospedar imagens');
  const form = new FormData();
  form.append('image', base64);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body:   form,
  });
  const data = await res.json();
  if (!data.success) throw new Error(`ImgBB upload falhou: ${data.error?.message || 'erro desconhecido'}`);
  return data.data.url;
}
