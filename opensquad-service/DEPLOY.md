# Deploy Instructions — OpenSquad Service

> **Desatualizado para o monorepo Publi.** Para **GitHub, Render, Build/Start, Root Directory e URLs**, use a documentação canónica do repositório:
>
> - [`../docs/DEPLOY_E_INTEGRACOES.md`](../docs/DEPLOY_E_INTEGRACOES.md)
> - [`RENDER_PANEL.md`](RENDER_PANEL.md)
> - [`../AGENTS.md`](../AGENTS.md)

O texto abaixo mantém-se como referência histórica de desenvolvimento local; **não** siga os comandos de Build/Start da secção antiga “Deploy to Render” para o projeto **Publi** (usar sempre `npm install && npm run build` e `npm start` no painel, Root `opensquad-service`).

---

## Prerequisites

1. **OpenSquad Repository**: Clone https://github.com/renatoasse/opensquad into `opensquad-service/opensquad/`

## Local Development

```bash
cd opensquad-service

# Clone opensquad
git clone https://github.com/renatoasse/opensquad.git opensquad

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your OpenAI API key to .env
# OPENAI_API_KEY=sk-...

# Start the service
npm start
```

## Deploy to Render (legado — ver doc canónico)

Para o serviço **Publi** no monorepo `farollapi-cloud/publi`, ignore esta secção e siga [`../docs/DEPLOY_E_INTEGRACOES.md`](../docs/DEPLOY_E_INTEGRACOES.md).

### Option 1: Using render.yaml

```bash
# Install Render CLI
npm install -g render-cli

# Deploy
render deploy
```

### Option 2: Manual Deploy (histórico — não usar como única fonte)

1. **Create a new Web Service** on Render
   - Name: `opensquad-service`
   - Runtime: `Node`
   - Node Version: `20`
   - Build Command: `npm install`
   - Start Command: `node src/server.js`

2. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PATH_OPENSQUAD`: `./opensquad`
   - `PORT`: `3001`
   - `OPENAI_API_KEY`: Your API key
   - `LOG_LEVEL`: `info`

3. **After deployment**, clone opensquad:
   - Go to the service's Shell in Render dashboard
   - Run: `cd /app/opensquad && git clone https://github.com/renatoasse/opensquad.git .`
   - Run: `npm install`
   - Restart the service

## Testing

```bash
# Health check
curl http://localhost:3001/health

# List squads
curl http://localhost:3001/squads

# List skills
curl http://localhost:3001/skills
```

## Connecting from Python

Set the environment variable in your Python app:
```
OPENSQUAD_SERVICE_URL=http://opensquad-service.onrender.com
```

Or for internal Render communication:
```
OPENSQUAD_SERVICE_URL=http://opensquad-service.internal:3001
```
