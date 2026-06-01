import { createApp } from './app.js';
import { config } from './config/index.js';
import { initDatabase, closeDatabase } from './db/database.js';
import { getDb } from './db/database.js';

function seedIfEmpty() {
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
    console.log('seeded default users');
  }
}

initDatabase();
seedIfEmpty();

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`http://localhost:${config.port}`);
});

function shutdown() {
  server.close(() => {
    closeDatabase();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
