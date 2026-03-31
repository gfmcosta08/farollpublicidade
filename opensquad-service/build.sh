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

echo "==> Frontend Vite → static-ui (dentro deste serviço, garantido no deploy)"
cd ../publicidade-frontend
npm install
npm run build
cd ../opensquad-service
rm -rf static-ui
cp -r ../publicidade-frontend/dist ./static-ui
test -f ./static-ui/index.html
echo "==> static-ui OK ($(du -sh static-ui | cut -f1))"

echo "==> build ok"
