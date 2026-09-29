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

  /* ---- voice slider: progress bar + mouse drag ---- */
  const slider = document.querySelector('.voice__slider');
  const thumb = document.querySelector('.voice__thumb');
  const bar = document.querySelector('.voice__progress');
  if (slider && thumb && bar) {
    const update = () => {
      const max = slider.scrollWidth - slider.clientWidth;
      const barW = bar.clientWidth;
      const thumbW = barW * 0.2525; // design: 101 / 400
      thumb.style.width = thumbW + 'px';
      const p = max > 0 ? slider.scrollLeft / max : 0;
      thumb.style.transform = `translateX(${(barW - thumbW) * p}px)`;
      bar.style.visibility = max > 0 ? 'visible' : 'hidden';
    };
    slider.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    let startX = 0, startLeft = 0, dragging = false, moved = false;
    slider.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      dragging = true; moved = false;
      startX = e.clientX; startLeft = slider.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) { moved = true; slider.classList.add('is-drag'); }
      slider.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      slider.classList.remove('is-drag');
    });
    slider.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
  }
})();
