# Revisão — backend, frontend e Render

## Correção automática (postinstall)

O `opensquad-service/package.json` tem **`postinstall`**: após `npm install`, se não existir `static-ui/`, roda `build.mjs`. Assim, mesmo com Build Command antigo (só `npm install` + clone), a UI costuma ser gerada **durante** o primeiro `npm install` do deploy.

O `build.mjs` usa `npm install --ignore-scripts` onde precisa para **não** entrar em loop com o próprio `postinstall`.

---

## O que não está “no código”: painel da Render (opcional agora)

Os logs podem mostrar **Build Command** antigo:

`npm install && ( [ -d opensquad ] || git clone ...`

Esse comando **não** executa `npm run build` → **não gera `static-ui`** → o servidor só mostra JSON na `/`.

**Correção obrigatória no painel** (Web Service → Settings):

| Campo | Valor |
|--------|--------|
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

Ou apague o Build Command customizado e use **Docker** com o [`Dockerfile`](../Dockerfile) na raiz (ver `README`).

---

## Backend (`opensquad-service`)

| Item | Situação |
|------|-----------|
| API admin | `/api/admin/publicidade` — dashboard, squads, skills, logs |
| Rotas legadas | `/squads`, `/skills`, `/logs`, `/dashboard` (compatível) |
| UI estática | `static-ui/` ou `publicidade-frontend/dist` |
| Health | `GET /health` inclui `ui: true/false` e `uiPath` |

### Ajuste feito na revisão

- **Ordem das rotas em `squads.js`**: `GET /:id` por último, para não conflitar com `/run/:executionId` e `/execution/:executionId`.

---

## Frontend (`publicidade-frontend`)

| Item | Situação |
|------|-----------|
| Base Vite | `/admin/publicidade/` |
| React Router | `basename="/admin/publicidade"` |
| Chamadas API | ` /api/admin/publicidade/...` |
| Skills instalar/remover | API retorna **501** (só via CLI OpenSquad); a UI mostra alerta de erro — esperado até implementar spawn no servidor |

---

## Build (`build.mjs`)

- Gera `opensquad-service/static-ui` a partir do Vite.
- Falha com mensagem clara se `publicidade-frontend` não existir (monorepo incompleto).

---

## Checklist rápido na Render

1. Build log contém `Frontend Vite` e `static-ui OK`.
2. `GET https://seu-app.onrender.com/health` → `"ui": true`.
3. Abrir: `https://seu-app.onrender.com/admin/publicidade/`.
