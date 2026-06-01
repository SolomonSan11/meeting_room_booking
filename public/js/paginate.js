export const PAGE_SIZE = 10;

export function paginate(items, page, pageSize = PAGE_SIZE) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total,
    pageSize,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
  };
}

export function mountPager(container, meta, onPageChange) {
  if (!container) return;

  if (meta.total === 0) {
    container.innerHTML = '';
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  const prevDisabled = meta.page <= 1;
  const nextDisabled = meta.page >= meta.totalPages;

  container.innerHTML = `
    <span class="pager-info">${meta.from}–${meta.to} of ${meta.total}</span>
    <div class="pager-btns">
      <button type="button" class="btn ghost btn-sm pager-prev" ${prevDisabled ? 'disabled' : ''}>Prev</button>
      <span class="pager-page">Page ${meta.page} / ${meta.totalPages}</span>
      <button type="button" class="btn ghost btn-sm pager-next" ${nextDisabled ? 'disabled' : ''}>Next</button>
    </div>`;

  container.querySelector('.pager-prev')?.addEventListener('click', () => {
    if (!prevDisabled) onPageChange(meta.page - 1);
  });
  container.querySelector('.pager-next')?.addEventListener('click', () => {
    if (!nextDisabled) onPageChange(meta.page + 1);
  });
}
