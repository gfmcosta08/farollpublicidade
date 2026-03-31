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

echo "==> build ok"
