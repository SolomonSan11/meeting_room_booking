import { randomUUID } from 'node:crypto';
import { getDb } from '../db/database.js';
import {
  assertValidRange,
  rangesOverlap,
} from '../utils/time.js';
import { badRequest, conflict, forbidden, notFound } from '../utils/errors.js';
import { formatBookingRange } from '../utils/format.js';

function mapBooking(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    startTime: row.start_time,
    endTime: row.end_time,
    createdAt: row.created_at,
    userName: row.user_name ?? undefined,
  };
}

export function listAll() {
  const rows = getDb()
    .prepare(
      `SELECT b.*, u.name AS user_name
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       ORDER BY b.start_time ASC`
    )
    .all();
  return rows.map(mapBooking);
}

export function findById(id) {
  const row = getDb()
    .prepare(
      `SELECT b.*, u.name AS user_name
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       WHERE b.id = ?`
    )
    .get(id);
  return mapBooking(row);
}

function findOverlapping(startMs, endMs, excludeId = null) {
  const rows = getDb()
    .prepare(
      `SELECT id, start_time, end_time FROM bookings
       ${excludeId ? 'WHERE id != ?' : ''}`
    )
    .all(...(excludeId ? [excludeId] : []));

  return rows.filter((row) => {
    const existingStart = Date.parse(row.start_time);
    const existingEnd = Date.parse(row.end_time);
    return rangesOverlap(startMs, endMs, existingStart, existingEnd);
  });
}

export function create({ startTime, endTime }, user) {
  const range = assertValidRange(startTime, endTime);
  if (!range.ok) {
    throw badRequest(range.error);
  }

  const overlaps = findOverlapping(range.startMs, range.endMs);
  if (overlaps.length > 0) {
    const conflicts = overlaps.map((b) => ({
      startTime: b.start_time,
      endTime: b.end_time,
      label: formatBookingRange(b.start_time, b.end_time),
    }));
    const hint =
      conflicts.length === 1
        ? `It overlaps: ${conflicts[0].label}.`
        : `It overlaps ${conflicts.length} existing bookings.`;
    throw conflict(`The room is already booked for that time. ${hint}`, {
      conflicts,
    });
  }

  const id = randomUUID();
  const createdAt = new Date().toISOString();

  getDb()
    .prepare(
      `INSERT INTO bookings (id, user_id, start_time, end_time, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(id, user.id, startTime, endTime, createdAt);

  return findById(id);
}

export function remove(id, actor) {
  const booking = findById(id);
  if (!booking) {
    throw notFound('That booking no longer exists.');
  }

  const canDeleteAny = ['admin', 'owner'].includes(actor.role);
  const isOwner = booking.userId === actor.id;

  if (!canDeleteAny && !isOwner) {
    throw forbidden('You can only delete bookings you created.');
  }

  getDb().prepare('DELETE FROM bookings WHERE id = ?').run(id);
  return { deletedBookingId: id };
}

export function listGroupedByUser() {
  const bookings = listAll();
  const grouped = {};

  for (const booking of bookings) {
    if (!grouped[booking.userId]) {
      grouped[booking.userId] = {
        userId: booking.userId,
        userName: booking.userName,
        bookings: [],
      };
    }
    grouped[booking.userId].bookings.push(booking);
  }

  return Object.values(grouped).sort((a, b) =>
    (a.userName || '').localeCompare(b.userName || '')
  );
}

export function usageSummary() {
  const rows = getDb()
    .prepare(
      `SELECT u.id AS userId, u.name AS userName, u.role,
              COUNT(b.id) AS totalBookings
       FROM users u
       LEFT JOIN bookings b ON b.user_id = u.id
       GROUP BY u.id
       ORDER BY totalBookings DESC, u.name ASC`
    )
    .all();

  const totalBookings = rows.reduce((sum, r) => sum + r.totalBookings, 0);

  return {
    totalBookings,
    perUser: rows.map((r) => ({
      userId: r.userId,
      userName: r.userName,
      role: r.role,
      totalBookings: r.totalBookings,
    })),
  };
}
