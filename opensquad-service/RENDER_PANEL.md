# O que colocar no painel da Render (Web Service)

Contexto do monorepo e URLs: [`../docs/DEPLOY_E_INTEGRACOES.md`](../docs/DEPLOY_E_INTEGRACOES.md). Instruções para IAs: [`../AGENTS.md`](../AGENTS.md).

---

O log mostrou que a Render **ainda usa o build antigo** (só `npm install` + clone do opensquad) e **não** roda o Vite nem cria `static-ui`. Corrija **na mão** uma vez:

## Build Command

Use **exatamente** (copiar a linha inteira):

```bash
npm install && npm run build
```

Isso usa o script `build` do [`package.json`](package.json), que executa [`build.mjs`](build.mjs) (OpenSquad + Vite + cópia para `static-ui`). O arquivo [`build.sh`](build.sh) é equivalente, para quem preferir Linux.

**Apague** o comando antigo que começa com `npm install && ( [ -d opensquad ]`.

## Start Command

```bash
npm start
```

Isso executa [`start.mjs`](start.mjs): se não existir `static-ui`, roda `build.mjs` **antes** do servidor (útil quando o build no painel não gerou a UI).

**Não** use `node src/server.js` direto em produção se quiser a correção automática da UI.

## Root Directory

`opensquad-service`

## Depois

Salve → **Manual Deploy** (ou espere o auto-deploy). Nos logs de build deve aparecer `==> Frontend Vite` e `static-ui OK`.

Confirme com `GET /health` — deve retornar `"ui": true` após um build correto.

## Alternativa: Docker (sem depender desse painel Node)

1. No mesmo serviço ou um novo **Web Service** → **Environment: Docker**.
2. **Dockerfile Path:** `Dockerfile` (raiz do repo).
3. **Root Directory:** vazio ou raiz (o `Dockerfile` copia `opensquad-service` e `publicidade-frontend`).
4. Deploy — o `Dockerfile` já roda `npm install && npm run build` dentro da imagem.
