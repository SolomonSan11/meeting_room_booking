# Deployment

```bash
npm ci --omit=dev
NODE_ENV=production DATABASE_PATH=/var/data/meeting_room.db npm start
```

- Default port: **3000** (`PORT` env to change)
- Persist **`DATABASE_PATH`** (SQLite file) across restarts
- Put HTTPS in front (nginx, Render, Railway, etc.)

After deploy, put the public URL in [README.md](../README.md) under **Deployed URL**.
