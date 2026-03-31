import express from 'express';
import cors from 'cors';
import squadsRouter from './routes/squads.js';
import skillsRouter from './routes/skills.js';
import logsRouter from './routes/logs.js';
import dashboardRouter from './routes/dashboard.js';

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

app.use('/squads', squadsRouter);
app.use('/skills', skillsRouter);
app.use('/logs', logsRouter);
app.use('/dashboard', dashboardRouter);

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ error: err.message, code: 'INTERNAL_ERROR' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`OpenSquad path: ${process.env.PATH_OPENSQUAD || './opensquad'}`);
});
