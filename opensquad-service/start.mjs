/**
 * Ponto de entrada em produção (Render): se npm install não gerou static-ui,
 * roda build.mjs antes de carregar o Express — assim a UI aparece mesmo sem
 * Build Command correto no painel.
 *
 * Desativar: SKIP_STARTUP_BUILD=1
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = __dirname;

if (process.env.SKIP_STARTUP_BUILD !== '1') {
  const indexHtml = join(root, 'static-ui', 'index.html');
  const fePkg = join(root, '..', 'publicidade-frontend', 'package.json');
  if (!existsSync(indexHtml) && existsSync(fePkg)) {
    console.log(
      '[start] static-ui ausente — executando build.mjs (Vite + cópia)…'
    );
    const r = spawnSync('node', ['build.mjs'], {
      stdio: 'inherit',
      cwd: root,
      env: process.env,
    });
    if (r.status !== 0) {
      console.error(
        `[start] build.mjs falhou (exit ${r.status}). Servidor sobe sem UI.`
      );
    }
  } else if (!existsSync(fePkg)) {
    console.warn(
      '[start] publicidade-frontend não encontrado ao lado de opensquad-service — UI não pode ser gerada.'
    );
  }
}

await import(pathToFileURL(join(root, 'src', 'server.js')).href);
