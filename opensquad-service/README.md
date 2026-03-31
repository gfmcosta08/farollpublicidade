# OpenSquad Service - Integration Guide

## Overview

This is a Node.js service that wraps the OpenSquad multi-agent framework, exposing it via REST API for integration with Python backends.

## How It Works

```
┌─────────────┐      HTTP       ┌──────────────────┐      CLI       ┌─────────────┐
│   Python    │ ──────────────► │ opensquad-service│ ─────────────► │  OpenSquad  │
│  Backend    │                 │    (Node.js)     │                │  (Local)    │
└─────────────┘                 └──────────────────┘                └─────────────┘
```

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/squads` | List all squads |
| GET | `/squads/:id` | Get squad details |
| POST | `/squads/run` | Run a squad |
| GET | `/squads/run/:executionId` | Get execution status |
| GET | `/skills` | List installed skills |
| GET | `/logs` | List execution logs |
| GET | `/logs/:executionId` | Get execution details |
| GET | `/dashboard?squadName=x` | Get dashboard info |
| GET | `/health` | Health check |

## Request/Response Examples

### List Squads

```bash
curl http://localhost:3000/squads
```

```json
{
  "squads": [
    {
      "name": "my-squad",
      "description": "A test squad",
      "agents": ["researcher", "writer"],
      "tasks": ["task1", "task2"],
      "hasDashboard": true,
      "lastRun": null
    }
  ]
}
```

### Run Squad

```bash
curl -X POST http://localhost:3000/squads/run \
  -H "Content-Type: application/json" \
  -d '{"squadName": "my-squad"}'
```

```json
{
  "executionId": "uuid-1234",
  "message": "Squad execution started",
  "status": "running"
}
```

### Get Execution

```bash
curl http://localhost:3000/squads/run/uuid-1234
```

```json
{
  "execution": {
    "id": "uuid-1234",
    "squadName": "my-squad",
    "status": "success",
    "startedAt": "2024-01-01T00:00:00.000Z",
    "finishedAt": "2024-01-01T00:05:00.000Z",
    "duration": 300000,
    "logs": [
      { "type": "stdout", "message": "Starting...", "timestamp": "..." }
    ]
  }
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Service port |
| `PATH_OPENSQUAD` | No | `./opensquad` | Path to OpenSquad repository |
| `OPENAI_API_KEY` | Yes | - | OpenAI API key for OpenSquad |

## Running Locally

```bash
cd opensquad-service

# Clone OpenSquad
git clone https://github.com/renatoasse/opensquad.git opensquad

# Install dependencies
npm install
cd opensquad && npm install && cd ..

# Create .env file
echo "OPENAI_API_KEY=sk-..." > .env

# Start service
npm start
```

## Deploy to Render

```bash
# Deploy using render.yaml
render deploy
```

Or manually:
1. Create Node.js web service on Render
2. Set environment variables: `PATH_OPENSQUAD=./opensquad`, `OPENAI_API_KEY`, `PORT=3000`
3. Build command: `npm install && git clone https://github.com/renatoasse/opensquad.git opensquad && cd opensquad && npm install`
4. Start command: `node src/server.js`

## Integration with Python

```python
import httpx
import os

OPENSQUAD_URL = os.environ.get('OPENSQUAD_SERVICE_URL', 'http://localhost:3000')

async def list_squads():
    async with httpx.AsyncClient() as client:
        response = await client.get(f'{OPENSQUAD_URL}/squads')
        return response.json()

async def run_squad(squad_name: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f'{OPENSQUAD_URL}/squads/run',
            json={'squadName': squad_name}
        )
        return response.json()

async def get_execution(execution_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(f'{OPENSQUAD_URL}/squads/run/{execution_id}')
        return response.json()
```

## Notes

- Skills installation/removal must be done via CLI in the OpenSquad IDE
- The service expects OpenSquad to be cloned in the `opensquad` directory
- Execution timeout is 5 minutes
- All endpoints return JSON
