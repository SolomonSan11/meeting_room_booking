import { randomUUID } from 'node:crypto';
import { getDb } from '../db/database.js';
import { badRequest, conflict, forbidden, notFound } from '../utils/errors.js';

const ROLES = ['admin', 'owner', 'user'];

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
    bookingCount: row.booking_count ?? 0,
  };
}

export function findById(id) {
  const row = getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);
  return mapUser(row);
}

export function listAll() {
  const rows = getDb()
    .prepare(
      `SELECT u.*, COUNT(b.id) AS booking_count
       FROM users u
       LEFT JOIN bookings b ON b.user_id = u.id
       GROUP BY u.id
       ORDER BY u.name ASC`
    )
    .all();
  return rows.map(mapUser);
}

export function create({ name, role }) {
  if (!ROLES.includes(role)) {
    throw badRequest('Choose a valid role: user, owner, or admin.');
  }

  const id = randomUUID();
  try {
    getDb()
      .prepare('INSERT INTO users (id, name, role) VALUES (?, ?, ?)')
      .run(id, name.trim(), role);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      throw conflict('Could not add that user. Try again.');
    }
    throw err;
  }
  return findById(id);
}

export function updateRole(id, role, actor) {
  if (!ROLES.includes(role)) {
    throw badRequest('Choose a valid role: user, owner, or admin.');
  }

  const target = findById(id);
  if (!target) {
    throw notFound('That user no longer exists.');
  }

  if (target.id === actor.id && target.role === 'admin' && role !== 'admin') {
    throw forbidden('You cannot remove your own admin access.');
  }

  const adminCount = getDb()
    .prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'")
    .get().count;

  if (target.role === 'admin' && role !== 'admin' && adminCount <= 1) {
    throw forbidden('At least one admin is required.');
  }

  getDb().prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
  return findById(id);
}

export function remove(id, actor) {
  const target = findById(id);
  if (!target) {
    throw notFound('That user no longer exists.');
  }

  if (target.id === actor.id) {
    throw forbidden('You cannot delete your own account.');
  }

  const adminCount = getDb()
    .prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'")
    .get().count;

  if (target.role === 'admin' && adminCount <= 1) {
    throw forbidden('You cannot delete the only admin.');
  }

  const bookingCount = getDb()
    .prepare('SELECT COUNT(*) AS count FROM bookings WHERE user_id = ?')
    .get(id).count;

  getDb().prepare('DELETE FROM users WHERE id = ?').run(id);

  return {
    deletedUserId: id,
    deletedUserName: target.name,
    deletedBookingsCount: bookingCount,
    policy:
      'All bookings created by this user were permanently removed (database CASCADE). Those time slots are available again.',
  };
}
