/**
 * Roda após `npm install` no opensquad-service.
 * Gera static-ui se ainda não existir — assim a Render funciona mesmo com
 * Build Command antigo (só `npm install` + clone), desde que o repo seja monorepo.
 *
 * Desativar: SKIP_POSTINSTALL_UI=1
 */
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

if (process.env.SKIP_POSTINSTALL_UI === '1') {
  process.exit(0);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceRoot = join(__dirname, '..');

if (existsSync(join(serviceRoot, 'static-ui', 'index.html'))) {
  console.log('[postinstall] static-ui já existe');
  process.exit(0);
}

const fePkg = join(serviceRoot, '..', 'publicidade-frontend', 'package.json');
if (!existsSync(fePkg)) {
  console.log(
    '[postinstall] sem publicidade-frontend ao lado — pulando UI (instalação isolada)'
  );
  process.exit(0);
}

console.log('[postinstall] gerando static-ui a partir do monorepo...');
const r = spawnSync('node', ['build.mjs'], {
  stdio: 'inherit',
  cwd: serviceRoot,
  env: process.env,
});
process.exit(r.status ?? 1);
