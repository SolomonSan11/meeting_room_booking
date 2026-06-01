import { config } from '../config/index.js';
import { createBetterSqliteAdapter } from './betterSqliteAdapter.js';
import { createSqlJsAdapter } from './sqlJsAdapter.js';

let db;

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export async function initDatabase(dbPath = config.databasePath) {
  if (process.env.VERCEL) {
    db = await createSqlJsAdapter(dbPath);
  } else {
    db = createBetterSqliteAdapter(dbPath);
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = undefined;
  }
}
