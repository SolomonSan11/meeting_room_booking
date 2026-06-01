import { initDatabase, closeDatabase, getDb } from './database.js';
import { config } from '../config/index.js';

const SEED_USERS = [
  { id: 'u-admin-1', name: 'Alice Admin', role: 'admin' },
  { id: 'u-owner-1', name: 'Owen Owner', role: 'owner' },
  { id: 'u-user-1', name: 'Uma User', role: 'user' },
  { id: 'u-user-2', name: 'Victor Visitor', role: 'user' },
];

await initDatabase(config.databasePath);
const db = getDb();

const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (id, name, role) VALUES (?, ?, ?)'
);

for (const user of SEED_USERS) {
  insertUser.run(user.id, user.name, user.role);
}

console.log('done:', SEED_USERS.map((u) => u.id).join(', '));
closeDatabase();
