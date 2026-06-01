import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databasePath:
    process.env.DATABASE_PATH ||
    (process.env.VERCEL
      ? '/tmp/meeting_room.db'
      : path.join(rootDir, 'data', 'meeting_room.db')),
  corsOrigin: process.env.CORS_ORIGIN || true,
  isProduction: process.env.NODE_ENV === 'production',
};
