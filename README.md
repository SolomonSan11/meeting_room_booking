# Meeting Room Booking

## Access the application

### Local

```bash
cd meeting_room
npm install
npm start
```

Open **http://localhost:3000**

1. Choose a user from the list → **Continue**
2. Use the **Bookings** tab to create or delete bookings
3. **Owner / Admin:** **Reports** tab for summaries
4. **Admin:** **Admin** tab to add users, change roles, or delete users (their bookings are removed too)

### Test users

| Name | Role | Login id |
|------|------|----------|
| Alice Admin | admin | `u-admin-1` |
| Owen Owner | owner | `u-owner-1` |
| Uma User | user | `u-user-1` |
| Victor Visitor | user | `u-user-2` |

### Vercel

1. Push repo, import in Vercel (root = folder with `package.json`)
2. Framework: **Other** (or Express if offered) — leave output directory empty
3. Entry files: **`api/index.js`** and **`src/index.js`** (both import `express` — required by Vercel)
4. Redeploy; use “Clear cache and redeploy” if an old error persists

On Vercel the app uses **sql.js** (not native SQLite) so the DB file in `/tmp` may reset on cold starts. Local `npm start` still uses **better-sqlite3**.

### Requirements

- Node.js 18+

Optional env (see `.env.example`): `PORT`, `DATABASE_PATH`, `NODE_ENV`

### Tests

```bash
npm test
```
