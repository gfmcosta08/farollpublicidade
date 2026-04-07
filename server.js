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
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(express.static(join(__dirname, 'public')));

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

app.use('/api/providers', providersRouter);
app.use('/api/squads', squadsRouter);
app.use('/api/runs', runsRouter);
app.use('/api/schedules', schedulesRouter);

// SPA fallback — serve index.html for any non-API route
app.get('*', (_req, res) => res.sendFile(join(__dirname, 'public', 'index.html')));

await initDb();
await initScheduler();

app.listen(PORT, () => console.log(`🔦 Faroll Publicidade rodando na porta ${PORT}`));
