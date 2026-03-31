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

## Deploy na Render (Web Service)

1. Conecte o repositório `farollapi-cloud/publi`.
2. **Root Directory:** `opensquad-service`
3. **Runtime:** Node 20+
4. **Build Command:** `bash build.sh` (script em [`opensquad-service/build.sh`](opensquad-service/build.sh); alternativa em uma linha está no mesmo README antigo se preferir).

5. **Start Command:** `node src/server.js` ou `npm start`

6. **Node:** na aba **Environment**, defina **`NODE_VERSION`** = `20` (ou `20.18.0`) se o build reclamar de versão do Node.
7. **Variáveis de ambiente:**
   - `PATH_OPENSQUAD` = `./opensquad`
   - `OPENAI_API_KEY` = sua chave (secret)
   - `NODE_ENV` = `production` (opcional)

A Render define `PORT` automaticamente.

### Blueprint

Use o arquivo [`render.yaml`](render.yaml) na raiz (Blueprint no dashboard da Render).

## Desenvolvimento local

```bash
cd opensquad-service
git clone https://github.com/renatoasse/opensquad.git opensquad
npm install
cd opensquad && npm install && cd ..
cp .env.example .env
# edite .env com OPENAI_API_KEY
npm start
```

Health check: `GET /health`

## Documentação

- [opensquad-service/README.md](opensquad-service/README.md) — endpoints
- [opensquad-service/DEPLOY.md](opensquad-service/DEPLOY.md) — deploy
