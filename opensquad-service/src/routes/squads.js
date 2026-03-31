import express from 'express';
import { listSquads, getSquadDetails, runSquad } from '../services/runner.js';
import { LogService } from '../services/logService.js';

const router = express.Router();
const logService = new LogService();

router.get('/', async (req, res) => {
  try {
    const squads = listSquads();
    res.json({ squads });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/run/:executionId', async (req, res) => {
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

router.post('/run', async (req, res) => {
  try {
    const { squadName, input } = req.body;

    if (!squadName) {
      return res.status(400).json({ error: 'squadName is required' });
    }

    const executionId = await logService.startExecution(squadName);

    res.json({
      executionId,
      message: 'Squad execution started',
      status: 'running',
    });

    runSquad(squadName, input)
      .then(async (result) => {
        await logService.finishExecution(executionId, result);
      })
      .catch(async (error) => {
        await logService.failExecution(executionId, error.message);
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const squad = getSquadDetails(req.params.id);
    res.json({ squad });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
