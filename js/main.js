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

  /* ---- case: carousel on SP (active card + dots) ---- */
  const caseList = document.querySelector('.case__list');
  if (caseList) {
    const cards = Array.from(caseList.children);
    const dots = document.createElement('div');
    dots.className = 'case__dots';
    const centerOf = (card) => card.offsetLeft - (caseList.clientWidth - card.offsetWidth) / 2;
    cards.forEach((card, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `${i + 1}件目の事例を表示`);
      b.addEventListener('click', () => caseList.scrollTo({ left: centerOf(card), behavior: 'smooth' }));
      dots.appendChild(b);
    });
    caseList.after(dots);
    let ticking = false;
    const update = () => {
      ticking = false;
      const c = caseList.scrollLeft + caseList.clientWidth / 2;
      let best = 0, bestD = Infinity;
      cards.forEach((card, i) => {
        const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - c);
        if (d < bestD) { bestD = d; best = i; }
      });
      cards.forEach((card, i) => card.classList.toggle('is-active', i === best));
      Array.from(dots.children).forEach((b, i) => b.classList.toggle('is-active', i === best));
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    caseList.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ---- SP fixed CTA: show after the hero buttons, hide around contact / footer ---- */
  const spCta = document.getElementById('spCta');
  if (spCta) {
    const heroCta = document.querySelector('.hero__cta');
    const ends = [document.getElementById('contact'), document.querySelector('.footer')].filter(Boolean);
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const pastHero = heroCta ? heroCta.getBoundingClientRect().bottom < 0 : window.scrollY > vh;
      const atEnd = ends.some((el) => el.getBoundingClientRect().top < vh);
      const show = pastHero && !atEnd;
      spCta.classList.toggle('is-show', show);
      spCta.inert = !show;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }
})();
