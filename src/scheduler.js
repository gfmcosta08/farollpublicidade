import cron from 'node-cron';
import { getDb } from './db.js';
import { startRun } from './pipeline/runner.js';

const activeCrons = new Map();

export async function initScheduler() {
  const db = getDb();
  const schedules = db.prepare('SELECT * FROM schedules WHERE active = 1').all();
  for (const s of schedules) activateCron(s);
  console.log(`Scheduler iniciado com ${schedules.length} agendamento(s) ativo(s)`);
}

export function activateCron(schedule) {
  if (activeCrons.has(schedule.id)) {
    activeCrons.get(schedule.id).stop();
    activeCrons.delete(schedule.id);
  }
  if (!cron.validate(schedule.cron_expr)) {
    console.error(`Expressão cron inválida para agendamento ${schedule.id}: ${schedule.cron_expr}`);
    return;
  }
  const task = cron.schedule(schedule.cron_expr, async () => {
    const db = getDb();
    db.prepare('UPDATE schedules SET last_run = datetime("now") WHERE id = ?').run(schedule.id);
    try {
      await startRun(schedule.squad_id, schedule.topic || 'Execução automática agendada');
    } catch (err) {
      console.error(`Erro no agendamento ${schedule.id}:`, err.message);
    }
  });
  activeCrons.set(schedule.id, task);
}

export function deactivateCron(scheduleId) {
  if (activeCrons.has(scheduleId)) {
    activeCrons.get(scheduleId).stop();
    activeCrons.delete(scheduleId);
  }
}
