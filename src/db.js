/**
 * Banco de dados usando node:sqlite — nativo do Node.js 22.5+, sem dependências externas.
 * API idêntica ao better-sqlite3 (síncrono).
 */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const DB_PATH = process.env.DB_PATH || './data/faroll.db';

let db;

export function getDb() {
  if (!db) throw new Error('Banco de dados não inicializado');
  return db;
}

export async function initDb() {
  mkdirSync(dirname(DB_PATH === ':memory:' ? './data/x' : DB_PATH), { recursive: true });

  db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS providers (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL CHECK(name IN ('openai','anthropic','minimax')),
      label      TEXT NOT NULL,
      api_key    TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS squads (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      description TEXT,
      domain      TEXT DEFAULT 'outro',
      platforms   TEXT DEFAULT '[]',
      provider_id INTEGER REFERENCES providers(id) ON DELETE SET NULL,
      model       TEXT,
      agents      TEXT DEFAULT '["pesquisador","redator","designer","revisor"]',
      auto_publish INTEGER DEFAULT 0,
      ig_token    TEXT,
      ig_user_id  TEXT,
      imgbb_key   TEXT,
      ref_links   TEXT DEFAULT '[]',
      ref_notes   TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS runs (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      squad_id     INTEGER REFERENCES squads(id) ON DELETE CASCADE,
      topic        TEXT,
      status       TEXT DEFAULT 'pending',
      started_at   TEXT,
      completed_at TEXT,
      error        TEXT,
      created_at   TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS outputs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id     INTEGER REFERENCES runs(id) ON DELETE CASCADE,
      type       TEXT NOT NULL,
      filename   TEXT,
      content    TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      squad_id   INTEGER REFERENCES squads(id) ON DELETE CASCADE,
      cron_expr  TEXT NOT NULL,
      topic      TEXT,
      active     INTEGER DEFAULT 1,
      last_run   TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const squadCols = db.prepare('PRAGMA table_info(squads)').all();
  if (!squadCols.some((c) => c.name === 'openai_image_key')) {
    db.exec('ALTER TABLE squads ADD COLUMN openai_image_key TEXT');
  }

  console.log(`Banco inicializado em ${DB_PATH}`);
}
