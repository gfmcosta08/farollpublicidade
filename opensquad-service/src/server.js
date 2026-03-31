import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import squadsRouter from './routes/squads.js';
import skillsRouter from './routes/skills.js';
import logsRouter from './routes/logs.js';
import dashboardRouter from './routes/dashboard.js';
import adminPublicidadeRouter from './routes/adminPublicidade.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDist = path.join(__dirname, '..', '..', 'publicidade-frontend', 'dist');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'opensquad-service', timestamp: new Date().toISOString() });
});

app.use('/api/admin/publicidade', adminPublicidadeRouter);

app.use('/squads', squadsRouter);
app.use('/skills', skillsRouter);
app.use('/logs', logsRouter);
app.use('/dashboard', dashboardRouter);

if (existsSync(publicDist)) {
  app.use(
    '/admin/publicidade',
    express.static(publicDist, { index: 'index.html' })
  );
  app.use('/admin/publicidade', (req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.includes('/assets/')) {
      return res.status(404).end();
    }
    res.sendFile(path.join(publicDist, 'index.html'));
  });
  app.get('/', (_req, res) => {
    res.redirect(302, '/admin/publicidade/');
  });
} else {
  app.get('/', (_req, res) => {
    res.json({
      message:
        'API — faça build do frontend (npm run build em publicidade-frontend) para servir a UI em /admin/publicidade',
      health: '/health',
      api: '/api/admin/publicidade',
    });
  });
}

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ error: err.message, code: 'INTERNAL_ERROR' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`OpenSquad path: ${process.env.PATH_OPENSQUAD || './opensquad'}`);
  if (existsSync(publicDist)) {
    console.log(`UI: http://localhost:${PORT}/admin/publicidade/`);
  }
});
