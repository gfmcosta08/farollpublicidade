# Instruções para assistentes (IA e humanos)

Leia **antes** de alterar deploy, integrações ou estrutura do monorepo.

## Fonte canónica

| Assunto | Ficheiro |
|---------|----------|
| **Deploy, GitHub, Render, URLs, variáveis** | [`docs/DEPLOY_E_INTEGRACOES.md`](docs/DEPLOY_E_INTEGRACOES.md) |
| **Continuidade entre sessões** | [`docs/continuidade.md`](docs/continuidade.md) (atalho na raiz: [`continuidade.md`](continuidade.md)) |
| **Painel Render (Build / Start / Root)** | [`opensquad-service/RENDER_PANEL.md`](opensquad-service/RENDER_PANEL.md) |

Não inventar URLs, nomes de repositório ou comandos de build que contradigam esses ficheiros.

## Repositório e branch

- **GitHub:** `https://github.com/farollapi-cloud/publi`
- **Branch de deploy:** `main`

## Render (Web Service Node)

- **Root Directory:** `opensquad-service` (obrigatório: o monorepo inteiro é clonado, mas o build corre nesta pasta).
- **Build Command:** `npm install && npm run build` (o `package.json` define `build` → `node build.mjs`).
- **Start Command:** `npm start` (→ `node start.mjs`). Evitar `node src/server.js` em produção se quiser geração automática de `static-ui` quando em falta.
- **Não** usar o comando antigo de build que só faz `npm install` + clone do opensquad sem `npm run build` — não gera o front nem `static-ui`.

## Frontend (`publicidade-frontend`)

- O build de produção copia artefactos para `opensquad-service/static-ui`.
- **Vite** e **@vitejs/plugin-react** estão em **`dependencies`** (não só `devDependencies`) para o `npm install` em `NODE_ENV=production` na Render instalar o toolchain de build.
- Script de build: `node ./node_modules/vite/bin/vite.js build` (em `package.json`).

## Backend do serviço (`opensquad-service`)

- `build.mjs`: clone opensquad se necessário, `npm install` no frontend, Vite → `static-ui`.
- `run()` em `build.mjs` deve passar `opts.env` ao `spawnSync` quando fornecido (`env: opts.env ?? process.env`).
- Repositório externo clonado no build: `renatoasse/opensquad` → pasta `opensquad-service/opensquad/`. **Não** é o repositório do Publi.

## O que este projeto **não** usa no deploy Node

- **Supabase** (ver tabela no doc de deploy).
- O módulo Django em `app/modules/publicidade/` **não** faz parte do Web Service Node na Render.

## Segurança e ambiente

- **Não** sobrescrever `.env` sem confirmação explícita do utilizador.
- Secrets (`OPENAI_API_KEY`) apenas via painel Render ou ficheiros locais ignorados pelo Git.

## Documentação desatualizada

Ficheiros com aviso no topo a remeter ao canónico: `opensquad-service/DEPLOY.md` (histórico). Preferir sempre `docs/DEPLOY_E_INTEGRACOES.md` e `RENDER_PANEL.md`.
