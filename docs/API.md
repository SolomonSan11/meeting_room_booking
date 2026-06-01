# API

Base: `/api` · Auth header: `X-User-Id`

| Method | Path | Notes |
|--------|------|--------|
| GET | `/health` | health check |
| GET | `/auth/users` | login list (public) |
| GET | `/users/me` | current user |
| GET | `/users` | admin |
| POST | `/users` | admin |
| PATCH | `/users/:id/role` | admin |
| DELETE | `/users/:id` | admin — deletes user + their bookings |
| GET | `/bookings` | all bookings |
| POST | `/bookings` | create |
| DELETE | `/bookings/:id` | own (user) or any (owner/admin) |
| GET | `/bookings/grouped-by-user` | owner, admin |
| GET | `/summary` | owner, admin |

Role rules: [ROLES.md](./ROLES.md)
