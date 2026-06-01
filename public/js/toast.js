const TOAST_MS = 4000;

function clearSlot(slot) {
  slot.querySelectorAll('.toast').forEach((t) => t.remove());
}

export function showToast(message, type = 'success', slotEl) {
  const slot =
    typeof slotEl === 'string' ? document.getElementById(slotEl) : slotEl;

  if (!slot) {
    const fallback = document.getElementById('toast-fallback');
    if (fallback) {
      return showToast(message, type, fallback);
    }
    return;
  }

  clearSlot(slot);

  if (slot.classList.contains('toast-fallback')) {
    slot.classList.remove('hidden');
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  slot.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
    if (!slot.classList.contains('toast-fallback')) {
      slot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  const timer = setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.addEventListener(
      'transitionend',
      () => toast.remove(),
      { once: true }
    );
  }, TOAST_MS);

  toast.addEventListener('click', () => {
    clearTimeout(timer);
    toast.classList.remove('toast-show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  });
}

export function clearToasts(slotEl) {
  const slot =
    typeof slotEl === 'string' ? document.getElementById(slotEl) : slotEl;
  if (slot) clearSlot(slot);
}
