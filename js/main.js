(() => {
  'use strict';

  /* ---- header: hamburger ---- */
  const header = document.querySelector('.header');
  const toggle = document.querySelector('.header__toggle');
  if (header && toggle) {
    const setOpen = (open) => {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    };
    toggle.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
    header.querySelectorAll('.header__nav a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* ---- marquee: duplicate contents for a seamless loop ---- */
  document.querySelectorAll('.marquee__track').forEach((track) => {
    Array.from(track.children).forEach((el) => {
      const clone = el.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      if (clone.tagName === 'IMG') clone.alt = '';
      clone.querySelectorAll('img').forEach((img) => { img.alt = ''; });
      track.appendChild(clone);
    });
  });

  /* ---- modals: consultation calendar / document request ---- */
  const modals = {
    consult: document.getElementById('modal-consult'),
    document: document.getElementById('modal-document'),
  };
  const root = document.documentElement;
  const closeAll = () => {
    Object.values(modals).forEach((m) => { if (m && m.open) m.close(); });
  };
  const openModal = (name) => {
    const modal = modals[name];
    if (!modal || typeof modal.showModal !== 'function') return false;
    closeAll();
    const frame = modal.querySelector('iframe[data-src]');
    if (frame && !frame.src) frame.src = frame.dataset.src;
    if (header) header.classList.remove('is-open');
    modal.showModal();
    root.classList.add('is-modal-open');
    return true;
  };
  Object.values(modals).forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('close', () => {
      if (!Object.values(modals).some((m) => m && m.open)) root.classList.remove('is-modal-open');
    });
    // close when clicking the backdrop
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
    modal.querySelectorAll('[data-modal-close]').forEach((btn) => btn.addEventListener('click', () => modal.close()));
  });
  document.querySelectorAll('[data-modal]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      if (openModal(trigger.dataset.modal)) e.preventDefault();
    });
  });
})();
