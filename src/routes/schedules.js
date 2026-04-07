import { Router } from 'express';
import cron from 'node-cron';
import { getDb } from '../db.js';
import { activateCron, deactivateCron } from '../scheduler.js';

const router = Router();

router.get('/', (_req, res) => {
  const rows = getDb().prepare(`
    SELECT sc.*, sq.name AS squad_name
    FROM schedules sc LEFT JOIN squads sq ON sc.squad_id = sq.id
    ORDER BY sc.created_at DESC
  `).all();
  res.json(rows.map(r => ({ ...r, active: Boolean(r.active) })));
});

router.post('/', (req, res) => {
  const { squad_id, cron_expr, topic, active = true } = req.body;
  if (!squad_id || !cron_expr) {
    return res.status(400).json({ error: 'squad_id e cron_expr são obrigatórios' });
  }
  if (!cron.validate(cron_expr)) {
    return res.status(400).json({ error: 'Expressão cron inválida' });
  }
  const db = getDb();
  const result = db
    .prepare('INSERT INTO schedules (squad_id, cron_expr, topic, active) VALUES (?, ?, ?, ?)')
    .run(squad_id, cron_expr, topic || '', active ? 1 : 0);

  if (active) {
    const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(result.lastInsertRowid);
    activateCron(schedule);
  }
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const sc = db.prepare('SELECT * FROM schedules WHERE id = ?').get(req.params.id);
  if (!sc) return res.status(404).json({ error: 'Agendamento não encontrado' });

  const { cron_expr, topic, active } = req.body;
  if (cron_expr && !cron.validate(cron_expr)) {
    return res.status(400).json({ error: 'Expressão cron inválida' });
  }

  db.prepare('UPDATE schedules SET cron_expr=?, topic=?, active=? WHERE id=?').run(
    cron_expr ?? sc.cron_expr,
    topic     ?? sc.topic,
    active    !== undefined ? (active ? 1 : 0) : sc.active,
    req.params.id,
  );

  const updated = db.prepare('SELECT * FROM schedules WHERE id = ?').get(req.params.id);
  if (updated.active) activateCron(updated);
  else deactivateCron(Number(req.params.id));

  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  deactivateCron(Number(req.params.id));
  getDb().prepare('DELETE FROM schedules WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
