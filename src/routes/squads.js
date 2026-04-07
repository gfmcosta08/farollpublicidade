import { Router } from 'express';
import { getDb } from '../db.js';
import { encrypt, decrypt } from '../crypto.js';

const router = Router();

function parseSquad(row) {
  return {
    ...row,
    platforms:   JSON.parse(row.platforms   || '[]'),
    agents:      JSON.parse(row.agents      || '[]'),
    ref_links:   JSON.parse(row.ref_links   || '[]'),
    auto_publish: Boolean(row.auto_publish),
    ig_token:    row.ig_token    ? '••••••' : null,
    ig_user_id:  row.ig_user_id  || null,
    imgbb_key:          row.imgbb_key          ? '••••••' : null,
    openai_image_key:   row.openai_image_key   ? '••••••' : null,
  };
}

router.get('/', (_req, res) => {
  const rows = getDb().prepare(`
    SELECT s.*, p.name AS provider_name, p.label AS provider_label
    FROM squads s LEFT JOIN providers p ON s.provider_id = p.id
    ORDER BY s.created_at DESC
  `).all();
  res.json(rows.map(parseSquad));
});

router.get('/:id', (req, res) => {
  const row = getDb().prepare(`
    SELECT s.*, p.name AS provider_name, p.label AS provider_label
    FROM squads s LEFT JOIN providers p ON s.provider_id = p.id
    WHERE s.id = ?
  `).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Squad não encontrado' });
  res.json(parseSquad(row));
});

router.post('/', (req, res) => {
  const {
    name, description, domain, platforms, provider_id, model, agents,
    auto_publish, ig_token, ig_user_id, imgbb_key, ref_links, ref_notes,
    openai_image_key,
  } = req.body;
  if (!name) return res.status(400).json({ error: 'name é obrigatório' });

  const result = getDb().prepare(`
    INSERT INTO squads
      (name, description, domain, platforms, provider_id, model, agents,
       auto_publish, ig_token, ig_user_id, imgbb_key, ref_links, ref_notes, openai_image_key)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    description || '',
    domain || 'outro',
    JSON.stringify(platforms || []),
    provider_id || null,
    model || null,
    JSON.stringify(agents || ['pesquisador', 'redator', 'designer', 'revisor']),
    auto_publish ? 1 : 0,
    ig_token  ? encrypt(ig_token)  : null,
    ig_user_id  || null,
    imgbb_key ? encrypt(imgbb_key) : null,
    JSON.stringify(ref_links || []),
    ref_notes || null,
    openai_image_key ? encrypt(openai_image_key) : null,
  );
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const sq = db.prepare('SELECT * FROM squads WHERE id = ?').get(req.params.id);
  if (!sq) return res.status(404).json({ error: 'Squad não encontrado' });

  const {
    name, description, domain, platforms, provider_id, model, agents,
    auto_publish, ig_token, ig_user_id, imgbb_key, ref_links, ref_notes,
    openai_image_key,
  } = req.body;

  let nextOpenaiImg = sq.openai_image_key;
  if (openai_image_key !== undefined) {
    nextOpenaiImg = openai_image_key ? encrypt(openai_image_key) : null;
  }

  db.prepare(`
    UPDATE squads SET
      name=?, description=?, domain=?, platforms=?, provider_id=?, model=?, agents=?,
      auto_publish=?, ig_token=?, ig_user_id=?, imgbb_key=?, ref_links=?, ref_notes=?,
      openai_image_key=?
    WHERE id=?
  `).run(
    name         ?? sq.name,
    description  ?? sq.description,
    domain       ?? sq.domain,
    JSON.stringify(platforms ?? JSON.parse(sq.platforms || '[]')),
    provider_id  !== undefined ? provider_id : sq.provider_id,
    model        ?? sq.model,
    JSON.stringify(agents    ?? JSON.parse(sq.agents || '[]')),
    auto_publish !== undefined ? (auto_publish ? 1 : 0) : sq.auto_publish,
    ig_token     ? encrypt(ig_token)  : sq.ig_token,
    ig_user_id   ?? sq.ig_user_id,
    imgbb_key    ? encrypt(imgbb_key) : sq.imgbb_key,
    JSON.stringify(ref_links ?? JSON.parse(sq.ref_links || '[]')),
    ref_notes    ?? sq.ref_notes,
    nextOpenaiImg,
    req.params.id,
  );
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  getDb().prepare('DELETE FROM squads WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export function getSquadFull(id) {
  const row = getDb().prepare('SELECT * FROM squads WHERE id = ?').get(id);
  if (!row) return null;
  return {
    ...row,
    platforms:    JSON.parse(row.platforms    || '[]'),
    agents:       JSON.parse(row.agents       || '[]'),
    ref_links:    JSON.parse(row.ref_links    || '[]'),
    auto_publish: Boolean(row.auto_publish),
    ig_token:     row.ig_token   ? decrypt(row.ig_token)   : null,
    ig_user_id:   row.ig_user_id || null,
    imgbb_key:         row.imgbb_key         ? decrypt(row.imgbb_key)         : null,
    openai_image_key:  row.openai_image_key  ? decrypt(row.openai_image_key) : null,
  };
}

export default router;
