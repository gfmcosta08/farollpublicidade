# Setup e Integração - Módulo PUBLICIDADE

## Visão Geral

O módulo PUBLICIDADE integra o OpenSquad ao seu SaaS existente (Django Ninja).

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Frontend  │ ───► │   Python (Django)│ ───► │  Node Service   │
│  (React)    │      │    Ninja API     │      │ (OpenSquad CLI) │
└─────────────┘      └──────────────────┘      └─────────────────┘
```

---

## 1. Configuração do Node Service (opensquad-service)

### 1.1 Clonar o OpenSquad

```bash
cd /path/to/opensquad-service
git clone https://github.com/renatoasse/opensquad.git
```

### 1.2 Instalar dependências

```bash
cd opensquad-service
npm install
```

### 1.3 Variáveis de ambiente (.env)

```env
PORT=3001
PATH_OPENSQUAD=./opensquad
NODE_ENV=production
OPENAI_API_KEY=sk-...
```

### 1.4 Iniciar o serviço

```bash
npm start
```

O serviço estará em: `http://localhost:3001`

---

## 2. Configuração do Backend (Django)

### 2.1 Adicionar o módulo ao seu projeto

Copie `app/modules/publicidade` para o seu projeto Django.

### 2.2 Registrar as rotas

No seu arquivo de API (ex: `api.py`):

```python
from ninja import NinjaAPI
from app.modules.publicidade.controller import router as publicidade_router

api = NinjaAPI()

# Adicionar rotas do módulo PUBLICIDADE
api.add_router('/admin/publicidade', publicidade_router)
```

### 2.3 Configurar permissão de superadmin

No `permissions.py`, adapte a verificação ao seu sistema de auth existente:

```python
def is_superadmin(admin) -> bool:
    # Integre com seu sistema de autenticação
    if hasattr(admin, 'is_superuser'):
        return admin.is_superuser
    return False
```

### 2.4 Variáveis de ambiente

```env
OPENSQUAD_SERVICE_URL=http://localhost:3001
PUBLICIDADE_LOG_FILE=logs/publicidade_admin.json
```

---

## 3. Configuração do Frontend

### 3.1 buildar ou integrar

**Opção A: Build standalone**
```bash
cd publicidade-frontend
npm install
npm run build
```

**Opção B: Integrar ao seu frontend existente**

Copie os arquivos de `src/pages/` e `src/components/` para seu projeto frontend.

### 3.2 Configurar API

No seu serviço de API, adicione o token de autenticação:

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 4. Deploy na Render

### 4.1 Serviço Node (opensquad-service)

```yaml
# render.yaml ou configuração manual
name: opensquad-service
runtime: Node
buildCommand: npm install
startCommand: npm start
envVars:
  - key: PATH_OPENSQUAD
    value: ./opensquad
  - key: OPENAI_API_KEY
    value: sk-...
```

### 4.2 Serviço Python

Seu serviço Python existente permanece igual, apenas adicione as rotas do módulo PUBLICIDADE.

### 4.3 Comunicação interna

Na Render, use **Private Services**:
- Python → `http://opensquad-service.internal:3001`
- Configure `OPENSQUAD_SERVICE_URL` no Python

---

## 5. Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/publicidade/dashboard` | Dashboard stats |
| GET | `/admin/publicidade/squads` | Lista squads |
| GET | `/admin/publicidade/squads/{id}` | Detalhes squad |
| POST | `/admin/publicidade/squads/run` | Executa squad |
| GET | `/admin/publicidade/skills` | Lista skills |
| POST | `/admin/publicidade/skills/install` | Instala skill |
| DELETE | `/admin/publicidade/skills/{name}` | Remove skill |
| GET | `/admin/publicidade/logs` | Logs admin |
| GET | `/admin/publicidade/logs/execution/{id}` | Logs execução |

---

## 6. Fluxo de Execução

```
1. Usuário acessa /admin/publicidade
2. Frontend → GET /admin/publicidade/dashboard
3. Python valida superadmin → GET /admin/publicidade/dashboard
4. Python → Node GET /squads
5. Node executa: npx opensquad list
6. Node retorna lista de squads
7. Python retorna para frontend
8. Frontend exibe interface
```

---

## 7. Testes Obrigatórios

1. **Listar squads**: `GET /admin/publicidade/squads`
2. **Executar squad**: `POST /admin/publicidade/squads/run` com `{squadName: "nome"}`
3. **Ver logs**: `GET /admin/publicidade/logs`
4. **Instalar skill**: `POST /admin/publicidade/skills/install` com `{skillName: "nome"}`
5. **Bloquear usuário comum**: Testar acesso com usuário não-superadmin

---

## 8. Estrutura Final

```
seu-projeto/
├── api.py                    # API principal (Ninja)
├── app/
│   └── modules/
│       └── publicidade/     # Módulo PUBLICIDADE
│           ├── __init__.py
│           ├── controller.py  # Rotas Django Ninja
│           ├── service.py     # Integração HTTP
│           ├── permissions.py # Verificação superadmin
│           ├── logs.py        # Logging admin
│           └── routes.py      # Registro
│
├── opensquad-service/        # Serviço Node
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   └── services/
│   ├── opensquad/            # Repositório clonado
│   └── package.json
│
└── frontend/                 # Seu frontend existente
    └── pages/
        └── publicidade/     # Páginas do módulo
```
