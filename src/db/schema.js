export const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'owner', 'user')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
  CREATE INDEX IF NOT EXISTS idx_bookings_start_end ON bookings(start_time, end_time);
`;
