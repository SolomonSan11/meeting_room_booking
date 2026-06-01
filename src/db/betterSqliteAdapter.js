import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { SCHEMA_SQL } from './schema.js';

export function createBetterSqliteAdapter(dbPath) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA_SQL);

  return {
    prepare: (sql) => db.prepare(sql),
    close: () => db.close(),
  };
}
