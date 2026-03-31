/**
 * Build unificado (Render + Windows + macOS): OpenSquad + Vite → static-ui
 * Uso: npm run build
 */
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, rmSync, cpSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceRoot = __dirname;

function run(cmd, args, opts = {}) {
  const cwd = opts.cwd ?? serviceRoot;
  console.log(`==> ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: true,
    cwd,
    env: process.env,
  });
  if (r.error) throw r.error;
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log('==> npm install (serviço)');
run('npm', ['install']);

const opensquadDir = join(serviceRoot, 'opensquad');
if (!existsSync(opensquadDir)) {
  console.log('==> git clone opensquad');
  run('git', [
    'clone',
    '--depth',
    '1',
    'https://github.com/renatoasse/opensquad.git',
    'opensquad',
  ]);
}
console.log('==> npm install (opensquad)');
run('npm', ['install'], { cwd: opensquadDir });

const feRoot = join(serviceRoot, '..', 'publicidade-frontend');
console.log('==> Frontend Vite → static-ui');
run('npm', ['install'], { cwd: feRoot });
run('npm', ['run', 'build'], { cwd: feRoot });

const distDir = join(feRoot, 'dist');
const staticUi = join(serviceRoot, 'static-ui');
rmSync(staticUi, { recursive: true, force: true });
cpSync(distDir, staticUi, { recursive: true });

if (!existsSync(join(staticUi, 'index.html'))) {
  console.error('Erro: static-ui/index.html não encontrado');
  process.exit(1);
}
console.log('==> static-ui OK');
console.log('==> build ok');
