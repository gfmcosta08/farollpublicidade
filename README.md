# Publi

Projeto independente para operar o [OpenSquad](https://github.com/renatoasse/opensquad) via API HTTP e interface web, com deploy na [Render](https://render.com).

**Antes de alterar deploy ou integrações:** leia [`docs/DEPLOY_E_INTEGRACOES.md`](docs/DEPLOY_E_INTEGRACOES.md) (fonte canónica). Para assistentes (IA): [`AGENTS.md`](AGENTS.md). Continuidade entre sessões: [`docs/continuidade.md`](docs/continuidade.md).

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

O script [`opensquad-service/build.mjs`](opensquad-service/build.mjs) (via `npm run build` em `opensquad-service/package.json`) roda o Vite e **copia** o resultado para `opensquad-service/static-ui`. Existe ainda [`build.sh`](opensquad-service/build.sh) como alternativa em Linux.

**Painel da Render:** veja [`opensquad-service/RENDER_PANEL.md`](opensquad-service/RENDER_PANEL.md) — o Build Command precisa ser `npm install && npm run build`, não o comando antigo.

**Alternativa:** deploy com **Docker** usando o [`Dockerfile`](Dockerfile) na raiz (Web Service → Environment **Docker** → `Dockerfile` path `/Dockerfile`). Assim o build não depende do campo de Build Command do modo Node.

Revisão técnica: [`docs/REVISAO_DEPLOY.md`](docs/REVISAO_DEPLOY.md).

**Onde está o deploy (GitHub, Render, o que não é usado):** [`docs/DEPLOY_E_INTEGRACOES.md`](docs/DEPLOY_E_INTEGRACOES.md).

## Deploy na Render (Web Service)

1. Conecte o repositório `farollapi-cloud/publi`.
2. **Root Directory:** `opensquad-service`
3. **Runtime:** Node 20+
4. **Build Command:** `npm install && npm run build` (o script `build` chama `node build.mjs`). **Não** use o comando antigo longo com só `npm install` + clone do opensquad — isso **não** gera o front nem `static-ui`.

5. **Start Command:** `npm start` — **uma linha só** (a Render executa o texto inteiro como um comando). Preferir **não** usar `node src/server.js` em produção se quiser o fluxo de [`start.mjs`](opensquad-service/start.mjs) quando `static-ui` faltar.

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

- [docs/DEPLOY_E_INTEGRACOES.md](docs/DEPLOY_E_INTEGRACOES.md) — **deploy, GitHub, Render (canónico)**
- [AGENTS.md](AGENTS.md) — instruções para assistentes (IA)
- [docs/continuidade.md](docs/continuidade.md) — continuidade entre sessões
- [opensquad-service/README.md](opensquad-service/README.md) — endpoints
- [opensquad-service/DEPLOY.md](opensquad-service/DEPLOY.md) — legado (ver doc canónico acima)
