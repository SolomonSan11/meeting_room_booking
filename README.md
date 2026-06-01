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

### Deployed URL

If hosted online, open:

**`https://YOUR-DEPLOY-URL`** ← replace after deploy

Same steps as above. Health check: `GET /api/health`

### Test users

| Name | Role | Login id |
|------|------|----------|
| Alice Admin | admin | `u-admin-1` |
| Owen Owner | owner | `u-owner-1` |
| Uma User | user | `u-user-1` |
| Victor Visitor | user | `u-user-2` |

### Requirements

- Node.js 18+

Optional env (see `.env.example`): `PORT`, `DATABASE_PATH`, `NODE_ENV`

### Tests

```bash
npm test
```
