# PROJETO COMPLETO — MÓDULO “PUBLICIDADE” INTEGRADO AO SAAS (PYTHON + RENDER) USANDO OPEN SQUAD

## MISSÃO

Criar um módulo interno chamado **PUBLICIDADE**, dentro do painel de **SUPERADMIN** do meu SaaS (já existente em Python na Render), que permita operar o repositório:

https://github.com/renatoasse/opensquad

de forma:
- visual
- moderna
- online
- organizada
- sem uso de terminal/manual

---

## REGRA PRINCIPAL (INEGOCIÁVEL)

Você deve:

- USAR o repositório opensquad **na íntegra**
- NÃO reescrever o core
- NÃO criar outro sistema multiagente
- NÃO adaptar a lógica central
- NÃO substituir comandos internos

Você deve apenas:
- INTEGRAR
- ENCAPSULAR
- ORGANIZAR
- CRIAR INTERFACE

Se você estiver criando algo que substitui o opensquad → está ERRADO  
Se você estiver apenas integrando ele → está CERTO  

---

## CONTEXTO TÉCNICO

Meu sistema atual:
- Backend: Python
- Hospedagem: Render
- Já possui painel admin
- Já possui superadmin

Novo módulo:
- Nome: PUBLICIDADE
- Acesso: SOMENTE SUPERADMIN
- Objetivo: operar o opensquad via UI

---

## ARQUITETURA OBRIGATÓRIA

### CAMADA 1 — CORE (INTACTO)
Repositório opensquad rodando com:
- Node.js 20+
- CLI própria
- estrutura original preservada

NÃO ALTERAR ESSA CAMADA

---

### CAMADA 2 — ENGINE SERVICE (NODE)

Criar um serviço Node separado:

Responsável por:
- executar comandos do opensquad
- listar squads
- executar squads
- listar skills
- gerenciar dashboard
- retornar logs

Esse serviço será chamado pelo backend Python

---

### CAMADA 3 — BACKEND PYTHON (INTEGRADOR)

Responsável por:
- autenticação
- autorização (superadmin)
- chamar o serviço Node
- registrar logs administrativos
- expor endpoints internos

---

### CAMADA 4 — FRONTEND (MÓDULO PUBLICIDADE)

Responsável por:
- interface visual
- operação dos squads
- visualização de logs
- controle de execução

---

## ARQUITETURA NA RENDER (OBRIGATÓRIA)

Criar DOIS serviços:

### 1. app-python (já existe)
- SaaS principal
- API interna
- autenticação

### 2. opensquad-service (NOVO)
- Node.js 20+
- roda o opensquad
- expõe API interna (localhost ou private service)

Comunicação:
Python → HTTP interno → Node

---

## ESTRUTURA DE ARQUIVOS (A SER CRIADA)

### NO BACKEND PYTHON


/app
/modules
/publicidade
controller.py
service.py
routes.py
schemas.py
permissions.py
logs.py


---

### NO SERVIÇO NODE (opensquad-service)


/opensquad-service
/src
server.js
routes/
squads.js
skills.js
execution.js
dashboard.js
services/
opensquadRunner.js
fileReader.js


OBS:
O repositório opensquad deve estar dentro ou acoplado aqui, SEM ALTERAÇÃO.

---

## ENDPOINTS (NODE SERVICE)

### Squads

GET /squads  
→ lista squads

POST /squads/run  
→ executa squad

GET /squads/:id  
→ detalhes

---

### Skills

GET /skills  
POST /skills/install  
DELETE /skills/:id  

---

### Logs

GET /logs  
GET /logs/:executionId  

---

### Dashboard

GET /dashboard  
→ retorna URL ou embed

---

## ENDPOINTS (PYTHON)

Prefixo: `/admin/publicidade`

GET /dashboard  
GET /squads  
POST /squads/run  
GET /squads/:id  
GET /logs  
GET /skills  

Todos protegidos por:
SUPERADMIN REQUIRED

---

## ROTAS FRONTEND

Dentro do painel admin:


/admin/publicidade
/admin/publicidade/squads
/admin/publicidade/squads/:id
/admin/publicidade/logs
/admin/publicidade/skills
/admin/publicidade/dashboard


---

## TELAS OBRIGATÓRIAS

### 1. DASHBOARD

- total de squads
- execuções recentes
- erros recentes
- botão "executar rápido"
- atalhos

---

### 2. LISTA DE SQUADS

Tabela com:
- nome
- status
- última execução
- ações

Ações:
- executar
- visualizar
- logs

---

### 3. DETALHE DO SQUAD

- informações completas
- botão executar
- histórico
- agentes envolvidos

---

### 4. EXECUÇÃO

- loading
- progresso
- logs em tempo real
- status final

---

### 5. LOGS

- lista de execuções
- filtro por data
- detalhes técnicos

---

### 6. SKILLS

- listar
- instalar
- remover

---

### 7. DASHBOARD VISUAL (OPENSQUAD)

- embed do dashboard original
- OU iframe
- OU redirecionamento interno seguro

NÃO recriar — usar o original

---

## PERMISSÃO (CRÍTICO)

Implementar:

- verificação backend Python:
  is_superadmin == True

- frontend:
  esconder botão se não for superadmin

- bloquear endpoints

---

## FLUXO DE EXECUÇÃO

1. usuário clica em PUBLICIDADE
2. frontend chama backend Python
3. Python valida permissão
4. Python chama serviço Node
5. Node executa opensquad
6. Node retorna logs/status
7. Python organiza resposta
8. frontend exibe

---

## LOGS ADMINISTRATIVOS

Registrar:

- quem executou
- quando
- qual squad
- resultado
- tempo de execução

---

## REGRAS CRÍTICAS

### NÃO FAZER

- recriar opensquad
- copiar lógica
- simular execução
- criar mock
- alterar estrutura original

---

### FAZER

- usar comandos reais
- ler dados reais
- executar squads reais
- integrar via serviço

---

## DEPLOY NA RENDER

### Serviço Node

- runtime: Node 20+
- start: node src/server.js
- variáveis:
  OPENAI_API_KEY
  PATH_OPENSQUAD

---

### Serviço Python

- já existente
- adicionar rotas novas

---

## TESTES OBRIGATÓRIOS

- listar squads
- executar squad
- ver logs
- instalar skill
- bloquear usuário comum
- validar integração completa

---

## CRITÉRIO DE SUCESSO

O projeto está correto se:

- botão PUBLICIDADE existe
- só superadmin acessa
- UI está funcional
- squads executam de verdade
- logs aparecem
- opensquad não foi alterado
- tudo roda na Render

---

## REGRA FINAL

Você NÃO está criando um sistema novo.

Você está criando uma **interface + integração** para um sistema existente.

Se você substituir o opensquad → ERRO  
Se você integrar o opensquad → CORRETO