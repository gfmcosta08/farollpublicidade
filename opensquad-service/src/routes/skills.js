import express from 'express';
import { listSkills } from '../services/runner.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const skills = listSkills();
    res.json({ skills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/install', async (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented',
    message: 'Skill installation must be done via CLI: npx opensquad install <skill-name>'
  });
});

router.delete('/:id', async (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented', 
    message: 'Skill removal must be done via CLI: npx opensquad uninstall <skill-name>'
  });
});

export default router;
