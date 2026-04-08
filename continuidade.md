# Continuidade — FarollPubli

Última atualização: contexto para retomar o trabalho após testes no Render.

## Estado do projeto

- **Provedores:** apenas **OpenAI** (texto + DALL·E) e **Google Gemini** (texto + imagem). Anthropic e MiniMax foram removidos.
- **Deploy:** testes em curso no **Render**; validar amanhã o fluxo completo e reportar resultados.
- **Commit de referência:** `feat: provedores OpenAI + Google Gemini; remove Anthropic e MiniMax` (branch `main`, remoto `origin`).

## Bloqueio conhecido — Google Gemini

- Erro **429 Too Many Requests** / quota: métricas `generativelanguage.googleapis.com/...free_tier...` para o modelo **`gemini-2.0-flash`** — indica **cota do free tier esgotada ou muito limitada** no projeto/chave da API, não é necessariamente falha de deploy no Render.
- **Ações sugeridas:** consultar [Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) e [monitorização de uso](https://ai.dev/rate-limit); avaliar **ativação de billing** no projeto Google; ou usar **outro modelo Gemini** suportado pela conta; usar **OpenAI** no squad enquanto a quota Google não estiver estável.

## Pendências para a próxima sessão

1. Validar no **Render**: criação de squads, pipeline completo e geração de imagens.
2. Se o Gemini continuar com **429**: confirmar plano/quota no AI Studio ou ajustar **`GEMINI_IMAGE_MODEL`** no ambiente se o modelo escolhido não tiver quota.
3. Opcional: após billing estável, se ainda houver picos de 429, considerar **retries com backoff** no cliente Gemini.

## Repositório

- Caminho local: workspace FarollPubli.
- Remoto típico: `https://github.com/gfmcosta08/farollpublicidade.git` (confirmar com `git remote -v` se necessário).
