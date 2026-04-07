import { Router } from 'express';
import { getDb } from '../db.js';
import { startRun, runEmitters } from '../pipeline/runner.js';

const router = Router();

router.post('/', async (req, res) => {
  const { squad_id, topic, additional_context } = req.body;
  if (!squad_id || !topic) {
    return res.status(400).json({ error: 'squad_id e topic são obrigatórios' });
  }
  try {
    const runId = await startRun(Number(squad_id), topic, additional_context || '');
    res.status(201).json({ run_id: runId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  const { squad_id, limit = 30 } = req.query;
  const db = getDb();
  const rows = squad_id
    ? db.prepare(`
        SELECT r.*, s.name AS squad_name FROM runs r
        LEFT JOIN squads s ON r.squad_id = s.id
        WHERE r.squad_id = ? ORDER BY r.created_at DESC LIMIT ?
      `).all(squad_id, Number(limit))
    : db.prepare(`
        SELECT r.*, s.name AS squad_name FROM runs r
        LEFT JOIN squads s ON r.squad_id = s.id
        ORDER BY r.created_at DESC LIMIT ?
      `).all(Number(limit));
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const run = db.prepare('SELECT * FROM runs WHERE id = ?').get(req.params.id);
  if (!run) return res.status(404).json({ error: 'Run não encontrado' });
  const outputs = db
    .prepare('SELECT id, type, filename, created_at FROM outputs WHERE run_id = ?')
    .all(run.id);
  res.json({ ...run, outputs });
});

// SSE stream — client opens this and receives live progress events
router.get('/:id/stream', (req, res) => {
  const runId = Number(req.params.id);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  // If run already finished, return immediately
  const run = getDb().prepare('SELECT * FROM runs WHERE id = ?').get(runId);
  if (!run) {
    send({ type: 'error', message: 'Run não encontrado' });
    return res.end();
  }
  if (run.status === 'completed' || run.status === 'failed') {
    const outputs = getDb()
      .prepare('SELECT id, type, filename FROM outputs WHERE run_id = ?')
      .all(runId);
    send({ type: run.status === 'failed' ? 'error' : 'complete', runId, outputs, error: run.error });
    return res.end();
  }

  const emitter = runEmitters.get(runId);
  if (!emitter) {
    send({ type: 'error', message: 'Run não está ativo' });
    return res.end();
  }

  const handler = (event) => {
    send(event);
    if (event.type === 'complete' || event.type === 'error') {
      emitter.off('event', handler);
      res.end();
    }
  };

  emitter.on('event', handler);
  req.on('close', () => emitter.off('event', handler));
});

// Download a specific output file
router.get('/:id/outputs/:filename', (req, res) => {
  const output = getDb()
    .prepare('SELECT * FROM outputs WHERE run_id = ? AND filename = ?')
    .get(req.params.id, req.params.filename);

  if (!output) return res.status(404).json({ error: 'Arquivo não encontrado' });

  if (output.type === 'image') {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${output.filename}"`);
    return res.send(Buffer.from(output.content, 'base64'));
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${output.filename}"`);
  res.send(output.content);
});

export default router;
