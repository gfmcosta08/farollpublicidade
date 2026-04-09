---
id: image-generation-raster
name: "AI raster images (no text)"
whenToUse: |
  DALL-E, Imagen, Gemini image, or any model that outputs a single bitmap.
  NOT for: HTML slides, carousels with typography, or layouts with copy on canvas.
version: "1.0.0"
---

# Geração de imagem raster (sem texto na cena)

## Objetivo

Cada `image_prompts[i]` descreve **apenas** uma cena visual (foto ou ilustração). O texto do post fica na legenda do Instagram — **nunca** dentro da imagem.

## Regras obrigatórias

1. **Proibido** na descrição e na cena gerada: palavras, letras, números, placas, letreiros, outdoors, capas de livro com título, ecrãs de telemóvel com UI legível, jornais, etiquetas de produto com texto, logótipos com nome legível, marcas d'água, subtítulos, caligrafia.
2. **Não cites** o título ou frases dos slides como texto a aparecer na imagem. Usa só **conceito visual**: objetos, ambiente, luz, cor, textura, emoção, metáfora **sem** elementos escritos.
3. **Evita** expressões que a API de imagem interpreta como "mostrar texto": "headline", "poster with", "sign saying", "banner with text", "infographic", "quote card", "tipografia", "overlay com frase".
4. **Prefere**: "cinematic photograph of…", "minimal 3D render of…", "soft editorial illustration of…", "abstract gradient environment…", "still life with…", sempre **sem** qualquer elemento que implique escrita.
5. Cada prompt em **inglês**, detalhado (luz, composição, paleta, estilo), e **termina** com uma frase curta: `No text, no letters, no numbers, no logos, no watermarks, no typography in the frame.`

## Anti-padrões

- Pedir "social media graphic" ou "carousel slide" — isso sugere caixas de texto; prefere "vertical portrait background" ou "editorial visual mood".
- Copiar o `title` do slide para dentro do prompt como citação — isso induz o modelo a renderizar essas palavras.
