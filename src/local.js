import { createApp } from './httpApp.js';
import { bootstrap } from './bootstrap.js';
import { config } from './config/index.js';
import { closeDatabase } from './db/database.js';

await bootstrap();

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
