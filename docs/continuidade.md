# Continuidade do projeto Publi

Na raiz do repo existe [`../continuidade.md`](../continuidade.md) (atalho que aponta para este ficheiro).

Este ficheiro resume **decisões estáveis** e **o que foi acordado** para qualquer sessão futura (outra IA ou desenvolvedor). Mantê-lo alinhado com [`DEPLOY_E_INTEGRACOES.md`](DEPLOY_E_INTEGRACOES.md) e com [`../AGENTS.md`](../AGENTS.md).

## Identidade do repositório

| Item | Valor |
|------|--------|
| GitHub | `https://github.com/farollapi-cloud/publi` |
| Branch principal | `main` |
| Serviço Render | Web Service Node, **Root Directory** `opensquad-service` |
| URL pública (exemplo) | Ver tabela em `DEPLOY_E_INTEGRACOES.md` — o subdomínio `*.onrender.com` pode mudar se o serviço for recriado |

## Stack do deploy único (API + UI estática)

- **Node** em `opensquad-service/`: Express, API sob `/api/admin/publicidade/...`, UI em `/admin/publicidade/` servida a partir de `static-ui/`.
- **React + Vite** em `publicidade-frontend/`: o build é copiado para `opensquad-service/static-ui` por `build.mjs` (invocado por `npm run build` e pelo fluxo de `postinstall` quando aplicável).
- **OpenSquad** (upstream): clone de `renatoasse/opensquad` em `opensquad-service/opensquad/` durante o build.

## Convenções que evitam erros

1. **Documentação canónica de deploy:** `docs/DEPLOY_E_INTEGRACOES.md` — atualizar URLs e nomes quando o ambiente mudar.
2. **Instruções para IAs:** `AGENTS.md` na raiz.
3. **Painel Render:** valores exactos em `opensquad-service/RENDER_PANEL.md`.
4. **Frontend em produção:** Vite e plugin React em `dependencies` de `publicidade-frontend/package.json` para builds com `NODE_ENV=production`.
5. **Histórico de código:** `git log`; não duplicar changelog longo neste ficheiro — apenas marcos abaixo.

## Marcos / alterações recentes (deploy)

| Data | Nota |
|------|------|
| 2026-03 | Padronização: `AGENTS.md`, regra Cursor `deploy-publi.mdc`, avisos em docs legados; Vite em `dependencies`; `build.mjs` com `opts.env`; script de build do frontend via `node ./node_modules/vite/bin/vite.js build`. |

## Próximos passos sugeridos (opcional)

- Se a URL da Render mudar, editar a tabela em `DEPLOY_E_INTEGRACOES.md` e esta secção.
- Manter `render.yaml` coerente com o painel, se usar Blueprint.
