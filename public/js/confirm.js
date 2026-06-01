let pendingResolve = null;

function getModal() {
  return document.getElementById('confirm-modal');
}

function closeModal(result) {
  const modal = getModal();
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.classList.remove('modal-open');
  if (pendingResolve) {
    pendingResolve(result);
    pendingResolve = null;
  }
}

function initConfirm() {
  const modal = getModal();
  if (!modal || modal.dataset.ready) return;

  modal.dataset.ready = '1';

  modal.querySelector('[data-confirm-cancel]')?.addEventListener('click', () => {
    closeModal(false);
  });

  modal.querySelector('[data-confirm-ok]')?.addEventListener('click', () => {
    closeModal(true);
  });

  modal.querySelector('.modal-backdrop')?.addEventListener('click', () => {
    closeModal(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal(false);
    }
  });
}

export function confirmAction({
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
}) {
  initConfirm();
  const modal = getModal();
  const titleEl = modal.querySelector('[data-confirm-title]');
  const messageEl = modal.querySelector('[data-confirm-message]');
  const okBtn = modal.querySelector('[data-confirm-ok]');

  titleEl.textContent = title;
  messageEl.textContent = message;
  okBtn.textContent = confirmLabel;
  okBtn.className = danger ? 'btn danger' : 'btn primary';

  modal.querySelector('[data-confirm-cancel]').textContent = cancelLabel;

  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  okBtn.focus();

  return new Promise((resolve) => {
    pendingResolve = resolve;
  });
}
