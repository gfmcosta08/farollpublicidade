import express from 'express';
import squadsRouter from './squads.js';
import skillsRouter from './skills.js';
import logsRouter from './logs.js';
import { listSquads, getDashboardInfo } from '../services/runner.js';
import { LogService } from '../services/logService.js';

const router = express.Router();
const logService = new LogService();

router.get('/dashboard', async (req, res) => {
  try {
    const squads = listSquads();
    const executions = await logService.getAllExecutions(50);
    const recent_errors = executions.filter(
      (e) => e.status === 'error' || e.status === 'failed'
    );
    res.json({
      total_squads: squads.length,
      recent_executions: executions.slice(0, 5),
      recent_errors: recent_errors.slice(0, 5),
      stats: {
        total_squads: squads.length,
        running: executions.filter((e) => e.status === 'running').length,
        completed: executions.filter((e) => e.status === 'success').length,
        failed: executions.filter((e) =>
          ['error', 'failed'].includes(e.status)
        ).length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard/:squadName/url', async (req, res) => {
  try {
    const { squadName } = req.params;
    const info = getDashboardInfo(squadName);
    res.json({
      squadName,
      exists: info.exists,
      serveCommand: info.path
        ? `npx serve squads/${squadName}/dashboard`
        : undefined,
      note: 'A partir da raiz do OpenSquad',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard/:squadName', async (req, res) => {
  try {
    const { squadName } = req.params;
    const info = getDashboardInfo(squadName);
    res.json({
      squadName,
      dashboardPath: info.path,
      exists: info.exists,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.use('/squads', squadsRouter);
router.use('/skills', skillsRouter);
router.use('/logs', logsRouter);

export default router;
