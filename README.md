# Publi

Projeto independente para operar o [OpenSquad](https://github.com/renatoasse/opensquad) via API HTTP e interface web, com deploy na [Render](https://render.com).

## Estrutura do repositório

| Pasta | Descrição |
|--------|-----------|
| [`opensquad-service/`](opensquad-service/) | **Web Service (Node.js)** — API Express que executa o CLI do OpenSquad. Alvo principal do deploy na Render. |
| [`publicidade-frontend/`](publicidade-frontend/) | Frontend React (Vite) — painel visual. |
| [`app/modules/publicidade/`](app/modules/publicidade/) | Módulo Django Ninja (opcional) — integração com SaaS Python. |
| [`docs/`](docs/) | Documentação de arquitetura e setup. |

O núcleo multiagente não é reimplementado: usa-se o repositório oficial `renatoasse/opensquad` (clone no build ou em disco).

## Um só deploy (API + UI no Node)

O `opensquad-service` expõe:

- **API JSON:** ` /api/admin/publicidade/...` (ex.: `GET /api/admin/publicidade/squads`)
- **Interface:** ` /admin/publicidade/` (build Vite servido pelo Express)

O script [`opensquad-service/build.mjs`](opensquad-service/build.mjs) (via `npm run build`) roda o Vite e **copia** o resultado para `opensquad-service/static-ui`. Há também [`build.sh`](opensquad-service/build.sh) equivalente no Linux.

**Painel da Render:** veja [`opensquad-service/RENDER_PANEL.md`](opensquad-service/RENDER_PANEL.md) — o Build Command precisa ser `npm install && npm run build`, não o comando antigo.

## Deploy na Render (Web Service)

1. Conecte o repositório `farollapi-cloud/publi`.
2. **Root Directory:** `opensquad-service`
3. **Runtime:** Node 20+
4. **Build Command:** `npm install && npm run build` (usa o script `build` em `opensquad-service/package.json` → `bash build.sh`). **Não** use o comando antigo longo com só `npm install` + clone do opensquad — isso **não** gera o front nem `static-ui`.

5. **Start Command:** `npm start` ou `node src/server.js` — **uma linha só**, sem a palavra “ou” (a Render executa o texto inteiro como um comando).

6. **Node:** na aba **Environment**, defina **`NODE_VERSION`** = `20` (ou `20.18.0`) se o build reclamar de versão do Node.
7. **Variáveis de ambiente:**
   - `PATH_OPENSQUAD` = `./opensquad`
   - `OPENAI_API_KEY` = sua chave (secret)
   - `NODE_ENV` = `production` (opcional)

A Render define `PORT` automaticamente.

### Blueprint

Use o arquivo [`render.yaml`](render.yaml) na raiz (Blueprint no dashboard da Render).

## Desenvolvimento local

Terminal 1 — API + UI (após build do frontend):

```bash
cd publicidade-frontend && npm install && npm run build && cd ../opensquad-service
git clone https://github.com/renatoasse/opensquad.git opensquad
cd opensquad && npm install && cd ..
npm install
cp .env.example .env
npm start
```

Abra `http://localhost:3000/admin/publicidade/` — a API fica em `/api/admin/publicidade/...`.

Só frontend com hot reload (proxy para API na porta 3000): `cd publicidade-frontend && npm run dev` (porta 5173).

Health check: `GET /health`

## Documentação

- [opensquad-service/README.md](opensquad-service/README.md) — endpoints
- [opensquad-service/DEPLOY.md](opensquad-service/DEPLOY.md) — deploy
