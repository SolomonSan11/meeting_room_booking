const API_BASE = '/api';

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function getUserId() {
  return sessionStorage.getItem('userId');
}

export function setSession(userId) {
  sessionStorage.setItem('userId', userId);
}

export function clearSession() {
  sessionStorage.removeItem('userId');
}

export function hasSession() {
  return Boolean(getUserId());
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const userId = getUserId();
  if (userId) {
    headers['X-User-Id'] = userId;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = body.error || {};
    throw new ApiError(
      res.status,
      err.code || 'UNKNOWN',
      err.message || res.statusText,
      err.details
    );
  }

  return body.data;
}

export const api = {
  listAuthUsers: () => request('/auth/users'),
  getMe: () => request('/users/me'),
  listUsers: () => request('/users'),
  createUser: (payload) =>
    request('/users', { method: 'POST', body: JSON.stringify(payload) }),
  updateUserRole: (id, role) =>
    request(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  listBookings: () => request('/bookings'),
  createBooking: (payload) =>
    request('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  deleteBooking: (id) =>
    request(`/bookings/${id}`, { method: 'DELETE' }),
  groupedByUser: () => request('/bookings/grouped-by-user'),
  summary: () => request('/summary'),
};
