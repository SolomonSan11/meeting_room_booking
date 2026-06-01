import { initDatabase, getDb } from './db/database.js';
import { config } from './config/index.js';

let ready = false;

export function bootstrap() {
  if (ready) return;
  initDatabase(config.databasePath);

  const count = getDb().prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (count === 0) {
    const users = [
      { id: 'u-admin-1', name: 'Alice Admin', role: 'admin' },
      { id: 'u-owner-1', name: 'Owen Owner', role: 'owner' },
      { id: 'u-user-1', name: 'Uma User', role: 'user' },
      { id: 'u-user-2', name: 'Victor Visitor', role: 'user' },
    ];
    const insert = getDb().prepare(
      'INSERT INTO users (id, name, role) VALUES (?, ?, ?)'
    );
    for (const u of users) {
      insert.run(u.id, u.name, u.role);
    }
  }

  ready = true;
}
