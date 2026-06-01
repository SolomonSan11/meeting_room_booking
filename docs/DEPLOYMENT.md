# Deployment

## Vercel

Uses **`src/index.js`** (`export default` Express app) + `vercel.json`.

- Do not use `src/app.js` (wrong export) or delete `src/index.js`
- Framework **Other**, root = project folder, redeploy with cache clear if needed
- DB defaults to `/tmp/meeting_room.db` (ephemeral on serverless)

## Node server (Railway, Render, VPS)

```bash
npm ci --omit=dev
NODE_ENV=production DATABASE_PATH=/var/data/meeting_room.db npm start
```

- Default port: **3000** (`PORT` env)
- Persist **`DATABASE_PATH`** across restarts

Put your URL in [README.md](../README.md).
