#!/usr/bin/env bash
# Build na Render (Linux). Root Directory = opensquad-service
set -euo pipefail

echo "==> npm install (serviço)"
npm install

echo "==> OpenSquad (clone + install)"
if [ ! -d opensquad ]; then
  git clone --depth 1 https://github.com/renatoasse/opensquad.git opensquad
fi
cd opensquad
npm install
cd ..

echo "==> Frontend Vite (UI em /admin/publicidade)"
cd ../publicidade-frontend
npm install
npm run build
cd ../opensquad-service

echo "==> build ok"
