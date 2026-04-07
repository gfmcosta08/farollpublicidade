import { Router } from 'express';
import { getDb } from '../db.js';
import { encrypt, decrypt } from '../crypto.js';

const router = Router();

export const MODELS = {
  openai: [
    { id: 'gpt-4o',              label: 'GPT-4o (Flagship)' },
    { id: 'gpt-4o-mini',         label: 'GPT-4o Mini (Recomendado ⚡)' },
    { id: 'gpt-4-turbo',         label: 'GPT-4 Turbo' },
    { id: 'gpt-3.5-turbo',       label: 'GPT-3.5 Turbo (Econômico)' },
    { id: 'o1',                  label: 'o1 (Raciocínio Avançado)' },
    { id: 'o1-mini',             label: 'o1-mini' },
    { id: 'o3-mini',             label: 'o3-mini' },
  ],
  anthropic: [
    { id: 'claude-opus-4-5',              label: 'Claude Opus 4.5 (Mais Capaz)' },
    { id: 'claude-sonnet-4-5',            label: 'Claude Sonnet 4.5 (Recomendado ⚡)' },
    { id: 'claude-3-7-sonnet-20250219',   label: 'Claude 3.7 Sonnet' },
    { id: 'claude-3-5-sonnet-20241022',   label: 'Claude 3.5 Sonnet' },
    { id: 'claude-haiku-3-5',             label: 'Claude Haiku 3.5 (Rápido)' },
    { id: 'claude-3-5-haiku-20241022',    label: 'Claude 3.5 Haiku' },
    { id: 'claude-3-opus-20240229',       label: 'Claude 3 Opus' },
    { id: 'claude-3-haiku-20240307',      label: 'Claude 3 Haiku (Econômico)' },
  ],
  minimax: [
    { id: 'MiniMax-Text-01',   label: 'MiniMax Text-01 (Flagship)' },
    { id: 'abab6.5s-chat',     label: 'abab6.5s (Recomendado ⚡)' },
    { id: 'abab6.5-chat',      label: 'abab6.5' },
    { id: 'abab5.5s-chat',     label: 'abab5.5s (Econômico)' },
  ],
};

router.get('/', (_req, res) => {
  const rows = getDb()
    .prepare('SELECT id, name, label, created_at FROM providers ORDER BY created_at DESC')
    .all();
  res.json(rows);
});

router.get('/models', (_req, res) => res.json(MODELS));

router.get('/:id/models', (req, res) => {
  const provider = getDb().prepare('SELECT name FROM providers WHERE id = ?').get(req.params.id);
  if (!provider) return res.status(404).json({ error: 'Provider não encontrado' });
  res.json(MODELS[provider.name] || []);
});

router.post('/', (req, res) => {
  const { name, label, api_key } = req.body;
  if (!name || !api_key) return res.status(400).json({ error: 'name e api_key são obrigatórios' });
  if (!['openai', 'anthropic', 'minimax'].includes(name)) {
    return res.status(400).json({ error: 'name deve ser openai, anthropic ou minimax' });
  }
  const result = getDb()
    .prepare('INSERT INTO providers (name, label, api_key) VALUES (?, ?, ?)')
    .run(name, label || name, encrypt(api_key));
  res.status(201).json({ id: result.lastInsertRowid, name, label: label || name });
});

router.delete('/:id', (req, res) => {
  getDb().prepare('DELETE FROM providers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export function getProviderCredentials(providerId) {
  const row = getDb().prepare('SELECT name, api_key FROM providers WHERE id = ?').get(providerId);
  if (!row) throw new Error('Provider não encontrado');
  return { name: row.name, api_key: decrypt(row.api_key) };
}

export default router;
