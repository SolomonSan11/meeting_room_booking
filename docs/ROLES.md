# Roles and permissions

## Admin

Can:

- Create users (`POST /api/users`)
- Delete users (`DELETE /api/users/:id`)
- Change user roles (`PATCH /api/users/:id/role`)
- View all users (`GET /api/users`)
- View all bookings (`GET /api/bookings`)
- Delete any booking (`DELETE /api/bookings/:id`)

Also has owner features: grouped bookings and usage summary.

Cannot (by design):

- Delete their own account
- Remove their own admin role if they are the only admin
- Delete the last admin account

### Deleting a user — system behaviour

When an admin deletes a user:

1. The **user row is removed** from the database.
2. **All bookings** where `userId` matches that user are **permanently deleted** automatically (`ON DELETE CASCADE` on the foreign key). They are **not** reassigned to another user and **not** soft-deleted.
3. Those time slots become **available** for new bookings immediately.
4. The API response includes `deletedBookingsCount` so the UI can confirm how many bookings were removed.

Example delete response:

```json
{
  "success": true,
  "data": {
    "deletedUserId": "...",
    "deletedUserName": "Jane",
    "deletedBookingsCount": 3,
    "policy": "All bookings created by this user were permanently removed..."
  },
  "message": "..."
}
```

## Owner

- Create and view bookings
- Delete **any** booking
- Grouped bookings by user
- Usage summary

Cannot create, delete, or change users.

## User

- Create and view all bookings
- Delete **only their own** bookings

Cannot manage users or delete others’ bookings.
