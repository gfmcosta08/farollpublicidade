import express from 'express';
import { getDashboardInfo } from '../services/runner.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { squadName } = req.query;
    
    if (!squadName) {
      return res.status(400).json({ error: 'squadName query parameter is required' });
    }

    const info = getDashboardInfo(squadName);
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/url', async (req, res) => {
  try {
    const { squadName } = req.query;
    
    if (!squadName) {
      return res.status(400).json({ error: 'squadName query parameter is required' });
    }

    const info = getDashboardInfo(squadName);
    res.json({
      squadName,
      exists: info.exists,
      serveCommand: info.serveCommand,
      note: 'Run: npx serve squads/{squadName}/dashboard'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
