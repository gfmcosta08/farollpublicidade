import { Router } from 'express';
import { getDb } from '../db.js';
import { encrypt, decrypt } from '../crypto.js';

const router = Router();

const ALLOWED = ['openai', 'google'];

export const MODELS = {
  openai: [
    { id: 'gpt-4o',        label: 'GPT-4o (Flagship)' },
    { id: 'gpt-4o-mini',   label: 'GPT-4o Mini (Recomendado)' },
    { id: 'gpt-4-turbo',   label: 'GPT-4 Turbo' },
    { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { id: 'o1',            label: 'o1' },
    { id: 'o1-mini',       label: 'o1-mini' },
    { id: 'o3-mini',       label: 'o3-mini' },
  ],
  google: [
    { id: 'gemini-2.0-flash',       label: 'Gemini 2.0 Flash (Recomendado)' },
    { id: 'gemini-2.0-flash-001',   label: 'Gemini 2.0 Flash 001' },
    { id: 'gemini-1.5-pro',         label: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.5-flash',       label: 'Gemini 1.5 Flash' },
    { id: 'gemini-2.5-flash-preview-05-20', label: 'Gemini 2.5 Flash Preview' },
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
  if (!ALLOWED.includes(name)) {
    return res.status(400).json({ error: 'name deve ser openai ou google' });
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
