import { api, setSession, clearSession, hasSession } from './api.js';
import { showToast, clearToasts } from './toast.js';
import { confirmAction } from './confirm.js';
import { friendlyErrorMessage } from './errors.js';
import { paginate, mountPager } from './paginate.js';

const $ = (id) => document.getElementById(id);

const SLOTS = {
  login: 'login-toast',
  bookingForm: 'booking-form-toast',
  bookingsList: 'bookings-list-toast',
  adminForm: 'admin-form-toast',
  adminList: 'admin-list-toast',
  fallback: 'toast-fallback',
};

const GROUP_PAGE_SIZE = 8;

let currentUser = null;
let allBookings = [];
let allUsers = [];
let allGrouped = [];
let allSummaryUsers = [];

const listState = {
  bookings: { page: 1, query: '', filter: 'upcoming' },
  users: { page: 1, query: '' },
  grouped: { page: 1, query: '' },
  summary: { page: 1, query: '' },
};

let activeTab = 'bookings';

async function withLoading(btn, fn) {
  const label = btn.textContent;
  btn.disabled = true;
  btn.classList.add('loading');
  btn.textContent = '…';
  try {
    return await fn();
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.textContent = label;
  }
}

function showFallbackToast(message, type) {
  const slot = $(SLOTS.fallback);
  slot.classList.remove('hidden');
  showToast(message, type, slot);
}

function handleError(err, slotId = SLOTS.fallback) {
  const msg = friendlyErrorMessage(err);
  if (slotId === SLOTS.fallback) {
    showFallbackToast(msg, 'error');
  } else {
    showToast(msg, 'error', slotId);
  }
}

function formatDt(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function localInputToIso(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function canDeleteBooking(booking, user) {
  if (['admin', 'owner'].includes(user.role)) return true;
  return booking.userId === user.id;
}

function norm(s) {
  return String(s || '').toLowerCase();
}

function filterBookings(bookings) {
  const now = Date.now();
  const { query, filter } = listState.bookings;
  const q = norm(query);

  return bookings.filter((b) => {
    if (q && !norm(b.userName).includes(q) && !norm(b.userId).includes(q)) {
      return false;
    }
    const end = Date.parse(b.endTime);
    if (filter === 'upcoming') return end >= now;
    if (filter === 'past') return end < now;
    return true;
  });
}

function filterUsers(users) {
  const q = norm(listState.users.query);
  if (!q) return users;
  return users.filter(
    (u) => norm(u.name).includes(q) || norm(u.role).includes(q)
  );
}

function filterGrouped(groups) {
  const q = norm(listState.grouped.query);
  if (!q) return groups;
  return groups.filter((g) => norm(g.userName).includes(q));
}

function filterSummaryRows(rows) {
  const q = norm(listState.summary.query);
  if (!q) return rows;
  return rows.filter(
    (u) => norm(u.userName).includes(q) || norm(u.role).includes(q)
  );
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.main-tabs .tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    const show = panel.dataset.tabPanel === tab;
    panel.classList.toggle('hidden', !show);
  });
}

function setupTabsForRole(user) {
  const reportsTab = $('tab-reports');
  const adminTab = $('tab-admin');
  const isOwnerOrAdmin = ['owner', 'admin'].includes(user.role);

  reportsTab.classList.toggle('hidden', !isOwnerOrAdmin);
  adminTab.classList.toggle('hidden', user.role !== 'admin');

  if (!isOwnerOrAdmin && activeTab !== 'bookings') {
    switchTab('bookings');
  } else if (user.role === 'owner' && activeTab === 'admin') {
    switchTab('bookings');
  } else if (activeTab === 'reports' && !isOwnerOrAdmin) {
    switchTab('bookings');
  } else if (activeTab === 'admin' && user.role !== 'admin') {
    switchTab('bookings');
  } else {
    switchTab(activeTab);
  }
}

function renderBookings() {
  const user = currentUser;
  const filtered = filterBookings(allBookings);
  const meta = paginate(filtered, listState.bookings.page);
  listState.bookings.page = meta.page;

  const el = $('bookings-list');
  const pager = $('bookings-pager');

  if (!filtered.length) {
    el.innerHTML =
      '<p class="empty-state">No bookings match. Try another filter or search.</p>';
    mountPager(pager, meta, () => {});
    return;
  }

  const rows = meta.items
    .map((b) => {
      const del =
        canDeleteBooking(b, user)
          ? `<button type="button" class="btn danger btn-del" data-id="${b.id}">Delete</button>`
          : '<span class="hint">—</span>';
      return `<tr>
        <td data-label="User">${escapeHtml(b.userName || b.userId)}</td>
        <td data-label="Start">${formatDt(b.startTime)}</td>
        <td data-label="End">${formatDt(b.endTime)}</td>
        <td data-label="Action">${del}</td>
      </tr>`;
    })
    .join('');

  el.innerHTML = `
    <table class="data-table">
      <thead><tr><th>User</th><th>Start</th><th>End</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;

  el.querySelectorAll('.btn-del').forEach((btn) => {
    btn.addEventListener('click', () => handleDeleteBooking(btn));
  });

  mountPager(pager, meta, (p) => {
    listState.bookings.page = p;
    renderBookings();
  });
}

function renderUsers() {
  const filtered = filterUsers(allUsers);
  const meta = paginate(filtered, listState.users.page);
  listState.users.page = meta.page;

  const el = $('users-list');
  const pager = $('users-pager');

  if (!allUsers.length) {
    el.innerHTML = '<p class="empty-state">No users yet.</p>';
    mountPager(pager, meta, () => {});
    return;
  }

  if (!filtered.length) {
    el.innerHTML = '<p class="empty-state">No users match your search.</p>';
    mountPager(pager, meta, () => {});
    return;
  }

  el.innerHTML = `
    <table class="data-table">
      <thead><tr><th>Name</th><th>Role</th><th>Bookings</th><th>Actions</th></tr></thead>
      <tbody>
        ${meta.items
          .map((u) => {
            const isSelf = u.id === currentUser.id;
            const count = u.bookingCount ?? 0;
            const roleSelect = `
              <select class="role-change" data-id="${u.id}" ${isSelf ? 'disabled' : ''}>
                ${['user', 'owner', 'admin']
                  .map(
                    (r) =>
                      `<option value="${r}" ${r === u.role ? 'selected' : ''}>${r}</option>`
                  )
                  .join('')}
              </select>`;
            const delBtn = isSelf
              ? '<span class="hint">(you)</span>'
              : `<button type="button" class="btn danger btn-del-user" data-id="${u.id}" data-name="${escapeAttr(u.name)}" data-bookings="${count}">Delete</button>`;
            return `<tr>
              <td data-label="Name">${escapeHtml(u.name)}</td>
              <td data-label="Role">${roleSelect}</td>
              <td data-label="Bookings">${count}</td>
              <td data-label="Actions">${delBtn}</td>
            </tr>`;
          })
          .join('')}
      </tbody>
    </table>`;

  el.querySelectorAll('.role-change').forEach((sel) => {
    sel.addEventListener('change', async () => {
      clearToasts(SLOTS.adminList);
      try {
        await api.updateUserRole(sel.dataset.id, sel.value);
        showToast('Role updated.', 'success', SLOTS.adminList);
        await refreshAdmin();
      } catch (e) {
        handleError(e, SLOTS.adminList);
        await refreshAdmin();
      }
    });
  });

  el.querySelectorAll('.btn-del-user').forEach((btn) => {
    btn.addEventListener('click', () => handleDeleteUser(btn));
  });

  mountPager(pager, meta, (p) => {
    listState.users.page = p;
    renderUsers();
  });
}

function renderGrouped() {
  const filtered = filterGrouped(allGrouped);
  const meta = paginate(filtered, listState.grouped.page, GROUP_PAGE_SIZE);
  listState.grouped.page = meta.page;

  const el = $('grouped-bookings');
  const pager = $('grouped-pager');

  if (!allGrouped.length) {
    el.innerHTML = '<p class="empty-state">No bookings yet.</p>';
    mountPager(pager, meta, () => {});
    return;
  }

  if (!filtered.length) {
    el.innerHTML = '<p class="empty-state">No users match your search.</p>';
    mountPager(pager, meta, () => {});
    return;
  }

  el.innerHTML = meta.items
    .map(
      (g) => `
    <details class="user-group">
      <summary>
        <span>${escapeHtml(g.userName)}</span>
        <span class="hint">${g.bookings.length} booking${g.bookings.length === 1 ? '' : 's'}</span>
      </summary>
      <div class="group-body">
        <ul>${g.bookings
          .map(
            (b) =>
              `<li>${formatDt(b.startTime)} → ${formatDt(b.endTime)}</li>`
          )
          .join('')}</ul>
      </div>
    </details>`
    )
    .join('');

  mountPager(pager, meta, (p) => {
    listState.grouped.page = p;
    renderGrouped();
  });
}

function renderSummary() {
  const filtered = filterSummaryRows(allSummaryUsers);
  const meta = paginate(filtered, listState.summary.page);
  listState.summary.page = meta.page;

  const el = $('usage-summary');
  const pager = $('summary-pager');
  const totalBookings = allSummaryUsers.reduce(
    (s, u) => s + u.totalBookings,
    0
  );

  if (!filtered.length) {
    el.innerHTML = `<p class="empty-state">No users match your search.</p>`;
    mountPager(pager, meta, () => {});
    return;
  }

  el.innerHTML = `
    <p class="hint" style="margin:0 0 0.5rem"><strong>Total bookings:</strong> ${totalBookings}</p>
    <table class="data-table">
      <thead><tr><th>User</th><th>Role</th><th>Bookings</th></tr></thead>
      <tbody>
        ${meta.items
          .map(
            (u) =>
              `<tr>
                <td data-label="User">${escapeHtml(u.userName)}</td>
                <td data-label="Role">${u.role}</td>
                <td data-label="Bookings">${u.totalBookings}</td>
              </tr>`
          )
          .join('')}
      </tbody>
    </table>`;

  mountPager(pager, meta, (p) => {
    listState.summary.page = p;
    renderSummary();
  });
}

async function handleDeleteBooking(btn) {
  const id = btn.dataset.id;
  const ok = await confirmAction({
    title: 'Delete booking?',
    message: 'This slot will be free for others to book.',
    confirmLabel: 'Delete',
    danger: true,
  });
  if (!ok) return;

  try {
    clearToasts(SLOTS.bookingsList);
    await api.deleteBooking(id);
    showToast('Booking deleted.', 'success', SLOTS.bookingsList);
    await refreshAll();
  } catch (e) {
    handleError(e, SLOTS.bookingsList);
  }
}

async function handleDeleteUser(btn) {
  const id = btn.dataset.id;
  const name = btn.dataset.name || 'this user';
  const count = Number(btn.dataset.bookings) || 0;
  const bookingLine =
    count === 0
      ? 'They have no bookings.'
      : count === 1
        ? '1 booking they made will be deleted and the slot will open up again.'
        : `${count} bookings they made will be deleted and those slots will open up again.`;
  const ok = await confirmAction({
    title: `Delete ${name}?`,
    message: `This removes their account permanently. ${bookingLine} This cannot be undone.`,
    confirmLabel: 'Delete user',
    danger: true,
  });
  if (!ok) return;

  try {
    clearToasts(SLOTS.adminList);
    const result = await api.deleteUser(id);
    const n = result.deletedBookingsCount;
    const extra =
      n > 0
        ? ` ${n} booking${n === 1 ? '' : 's'} removed.`
        : ' No bookings were linked to them.';
    showToast(`User deleted.${extra}`, 'success', SLOTS.adminList);
    await refreshAdmin();
    await refreshBookings();
    await refreshOwner();
    await loadUserSelect();
  } catch (e) {
    handleError(e, SLOTS.adminList);
  }
}

async function refreshBookings() {
  currentUser = await api.getMe();
  allBookings = await api.listBookings();
  renderBookings();
}

async function refreshOwner() {
  allGrouped = await api.groupedByUser();
  const summary = await api.summary();
  allSummaryUsers = summary.perUser || [];
  renderGrouped();
  renderSummary();
}

async function refreshAdmin() {
  currentUser = await api.getMe();
  allUsers = await api.listUsers();
  renderUsers();
}

async function refreshAll() {
  currentUser = await api.getMe();
  $('session-name').textContent = currentUser.name;
  const badge = $('session-role');
  badge.textContent = currentUser.role;
  badge.className = `role-badge ${currentUser.role}`;

  await refreshBookings();

  const isOwnerOrAdmin = ['owner', 'admin'].includes(currentUser.role);
  if (isOwnerOrAdmin) {
    await refreshOwner();
  }

  if (currentUser.role === 'admin') {
    await refreshAdmin();
  }

  setupTabsForRole(currentUser);

  const bookingsHint = $('bookings-role-hint');
  if (currentUser.role === 'admin') {
    bookingsHint.textContent =
      'Admin: use tabs for Bookings, Reports, and Admin. Lists are searchable and paginated.';
    bookingsHint.classList.remove('hidden');
  } else if (currentUser.role === 'owner') {
    bookingsHint.textContent =
      'Owner: Bookings tab for the schedule; Reports for summaries.';
    bookingsHint.classList.remove('hidden');
  } else {
    bookingsHint.classList.add('hidden');
    bookingsHint.textContent = '';
  }
}

function showLoggedIn() {
  $('login-section').classList.add('hidden');
  $('session-section').classList.remove('hidden');
  activeTab = 'bookings';
  switchTab('bookings');
}

function showLoggedOut() {
  $('login-section').classList.remove('hidden');
  $('session-section').classList.add('hidden');
  document.querySelectorAll('.tab-panel').forEach((p) => p.classList.add('hidden'));
  activeTab = 'bookings';
  Object.values(SLOTS).forEach((id) => clearToasts(id));
}

async function loadUserSelect() {
  const users = await api.listAuthUsers();
  const sel = $('user-select');
  sel.innerHTML = users
    .map(
      (u) =>
        `<option value="${u.id}">${escapeHtml(u.name)} (${u.role})</option>`
    )
    .join('');
}

async function doLogin() {
  const id = $('user-select').value;
  if (!id) return;
  setSession(id);
  clearToasts(SLOTS.login);
  try {
    showLoggedIn();
    await refreshAll();
  } catch (e) {
    clearSession();
    handleError(e, SLOTS.login);
  }
}

function bindSearch(inputId, stateKey, renderFn) {
  const input = $(inputId);
  if (!input) return;
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      listState[stateKey].query = input.value;
      listState[stateKey].page = 1;
      renderFn();
    }, 200);
  });
}

$('main-tabs')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.tab');
  if (!btn || btn.classList.contains('hidden')) return;
  switchTab(btn.dataset.tab);
});

bindSearch('bookings-search', 'bookings', renderBookings);
bindSearch('users-search', 'users', renderUsers);
bindSearch('grouped-search', 'grouped', renderGrouped);
bindSearch('summary-search', 'summary', renderSummary);

$('bookings-filter')?.addEventListener('change', (e) => {
  listState.bookings.filter = e.target.value;
  listState.bookings.page = 1;
  renderBookings();
});

$('login-btn').addEventListener('click', () =>
  withLoading($('login-btn'), doLogin)
);

document.querySelector('.login-form')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    $('login-btn').click();
  }
});

$('logout-btn').addEventListener('click', () => {
  clearSession();
  showLoggedOut();
});

$('booking-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  await withLoading(btn, async () => {
    clearToasts(SLOTS.bookingForm);
    try {
      const startTime = localInputToIso($('start-time').value);
      const endTime = localInputToIso($('end-time').value);
      await api.createBooking({ startTime, endTime });
      showToast('Booking created.', 'success', SLOTS.bookingForm);
      e.target.reset();
      await refreshAll();
    } catch (err) {
      handleError(err, SLOTS.bookingForm);
    }
  });
});

$('create-user-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  await withLoading(btn, async () => {
    clearToasts(SLOTS.adminForm);
    try {
      await api.createUser({
        name: $('new-user-name').value.trim(),
        role: $('new-user-role').value,
      });
      $('new-user-name').value = '';
      showToast('User added.', 'success', SLOTS.adminForm);
      await refreshAdmin();
      await loadUserSelect();
    } catch (err) {
      handleError(err, SLOTS.adminForm);
    }
  });
});

async function init() {
  try {
    await loadUserSelect();
    if (hasSession()) {
      showLoggedIn();
      await refreshAll();
    } else {
      showLoggedOut();
    }
  } catch (e) {
    showFallbackToast('Cannot reach the server. Is it running?', 'error');
  }
}

init();
