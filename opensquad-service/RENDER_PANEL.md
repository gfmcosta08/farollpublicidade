# O que colocar no painel da Render (Web Service)

O log mostrou que a Render **ainda usa o build antigo** (só `npm install` + clone do opensquad) e **não** roda o Vite nem cria `static-ui`. Corrija **na mão** uma vez:

## Build Command

Use **exatamente** (copiar a linha inteira):

```bash
npm install && npm run build
```

Isso usa o script `build` do [`package.json`](package.json), que executa [`build.mjs`](build.mjs) (OpenSquad + Vite + cópia para `static-ui`). O arquivo [`build.sh`](build.sh) é equivalente, para quem preferir Linux.

**Apague** o comando antigo que começa com `npm install && ( [ -d opensquad ]`.

## Start Command

Use **só um** destes (sem a palavra “ou”):

```bash
npm start
```

ou

```bash
node src/server.js
```

## Root Directory

`opensquad-service`

## Depois

Salve → **Manual Deploy** (ou espere o auto-deploy). Nos logs de build deve aparecer `==> Frontend Vite` e `static-ui OK`.
