import express from 'express';
import { LogService } from '../services/logService.js';

const router = express.Router();
const logService = new LogService();

router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const logs = await logService.getAllExecutions(parseInt(limit), parseInt(offset));
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/execution/:executionId', async (req, res) => {
  try {
    const execution = await logService.getExecution(req.params.executionId);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    res.json({ execution });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:executionId', async (req, res) => {
  try {
    const execution = await logService.getExecution(req.params.executionId);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    res.json({ execution });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
