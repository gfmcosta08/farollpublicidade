import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initDb } from './src/db.js';
import { initScheduler } from './src/scheduler.js';
import providersRouter from './src/routes/providers.js';
import squadsRouter from './src/routes/squads.js';
import runsRouter from './src/routes/runs.js';
import schedulesRouter from './src/routes/schedules.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
/** Sempre 0.0.0.0: não usar process.env.HOST — alguns PaaS definem HOST=localhost e quebram o health check (502). */
const BIND = '0.0.0.0';

/** Render faz health check assim que o processo sobe; initDb no disco pode demorar — escutamos já e marcamos pronto depois. */
let appReady = false;

const app = express();
app.use(express.json({ limit: '20mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: appReady ? 'ok' : 'starting',
    ts:     new Date().toISOString(),
  });
});

app.use((req, res, next) => {
  if (!appReady && req.path.startsWith('/api')) {
    return res.status(503).json({ error: 'Servidor a inicializar a base de dados. Tente dentro de segundos.' });
  }
  next();
});

app.use(express.static(join(__dirname, 'public')));

app.use('/api/providers', providersRouter);
app.use('/api/squads', squadsRouter);
app.use('/api/runs', runsRouter);
app.use('/api/schedules', schedulesRouter);

// SPA fallback — serve index.html for any non-API route
app.get('*', (_req, res) => res.sendFile(join(__dirname, 'public', 'index.html')));

app.listen(PORT, BIND, () => {
  console.log(`🔦 Faroll Publicidade à escuta em http://${BIND}:${PORT} (PORT env=${process.env.PORT ?? 'não definido'})`);

  (async () => {
    try {
      await initDb();
      await initScheduler();
      appReady = true;
      console.log('✅ Base de dados e scheduler prontos');
    } catch (err) {
      console.error('❌ Falha ao inicializar (processo vai terminar):', err);
      process.exit(1);
    }
  })();
});
