# Deploy alternativo na Render: Web Service com Environment "Docker"
# Build e start não dependem do campo "Build Command" do painel Node.
# Context: raiz do repositório (farollapi-cloud/publi).

FROM node:20-bookworm-slim

WORKDIR /app

COPY opensquad-service ./opensquad-service
COPY publicidade-frontend ./publicidade-frontend

WORKDIR /app/opensquad-service

ENV NODE_ENV=production

RUN npm install && npm run build

EXPOSE 10000

CMD ["npm", "start"]
