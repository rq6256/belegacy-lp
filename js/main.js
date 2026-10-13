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
  const docNames = {
    guide: '地方企業のための採用SNSガイドライン',
    media: 'ビーレガシー メディア説明資料',
  };
  const docName = modals.document ? modals.document.querySelector('[data-doc-name]') : null;
  const docDefault = docName ? docName.textContent : '';
  document.querySelectorAll('[data-modal]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      if (trigger.dataset.modal === 'document' && docName) {
        docName.textContent = docNames[trigger.dataset.doc] || docDefault;
      }
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

  /* ---- document slider: arrows, dots, swipe / trackpad, mouse drag ---- */
  document.querySelectorAll('.doc-slider').forEach((slider) => {
    const track = slider.querySelector('.doc-slider__track');
    const slides = Array.from(track.children);
    const prev = slider.querySelector('.doc-slider__nav--prev');
    const next = slider.querySelector('.doc-slider__nav--next');
    const dotsBox = slider.querySelector('.doc-slider__dots');
    const edge = () => parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0;
    const maxScroll = () => track.scrollWidth - track.clientWidth;
    const posOf = (i) => Math.min(slides[i].offsetLeft - edge(), maxScroll());
    // distinct stop positions (several slides can share the last one when more than one is visible)
    let stops = [];
    let dots = [];
    const buildStops = () => {
      const max = maxScroll();
      stops = [];
      slides.forEach((_, i) => { const p = Math.max(0, Math.round(posOf(i))); if (!stops.some((q) => Math.abs(q - p) < 3)) stops.push(p); });
      if (max > 0 && Math.abs(stops[stops.length - 1] - max) > 2) stops.push(Math.round(max));
      if (dots.length !== stops.length) {
        dotsBox.textContent = '';
        dots = stops.map((_, i) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-label', `${i + 1}番目の位置へ移動`);
          b.addEventListener('click', () => goTo(i));
          dotsBox.appendChild(b);
          return b;
        });
      }
      dotsBox.hidden = stops.length < 2;
    };
    const goTo = (i) => track.scrollTo({ left: stops[Math.max(0, Math.min(stops.length - 1, i))], behavior: 'smooth' });
    const current = () => {
      let best = 0, bestD = Infinity;
      stops.forEach((p, i) => { const d = Math.abs(p - track.scrollLeft); if (d < bestD) { bestD = d; best = i; } });
      return best;
    };
    buildStops();
    let raf = 0;
    const update = () => {
      raf = 0;
      const idx = current();
      dots.forEach((b, i) => b.classList.toggle('is-active', i === idx));
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= maxScroll() - 2;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('resize', () => { buildStops(); onScroll(); });
    prev.addEventListener('click', () => goTo(current() - 1));
    next.addEventListener('click', () => goTo(current() + 1));
    track.addEventListener('scroll', onScroll, { passive: true });
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current() - 1); }
    });

    // mouse drag (touch devices use native swipe)
    let startX = 0, startLeft = 0, dragging = false, moved = false;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) { moved = true; track.classList.add('is-dragging'); }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    const endDrag = (e) => {
      if (!dragging) return;
      dragging = false;
      if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
      if (!moved) return;
      const dx = e.clientX - startX;
      const from = stops.reduce((bi, p, i) => (Math.abs(p - startLeft) < Math.abs(stops[bi] - startLeft) ? i : bi), 0);
      track.classList.remove('is-dragging');
      // a short flick moves one slide in the drag direction
      let target = current();
      if (Math.abs(dx) > 40 && target === from) target = from + (dx < 0 ? 1 : -1);
      goTo(target);
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    update();
  });

  /* ---- floating banner (PC / tablet): closable, hidden near the document / contact sections ---- */
  const fbanner = document.getElementById('fbanner');
  if (fbanner) {
    const KEY = 'bl-fbanner-closed';
    let closed = false;
    try { closed = sessionStorage.getItem(KEY) === '1'; } catch (e) { /* storage unavailable */ }
    const zones = [document.getElementById('document'), document.getElementById('contact'), document.querySelector('.footer')].filter(Boolean);
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const inZone = zones.some((el) => { const r = el.getBoundingClientRect(); return r.top < vh && r.bottom > 0; });
      const hide = closed || inZone;
      fbanner.classList.toggle('is-hidden', hide);
      fbanner.inert = hide;
    };
    fbanner.querySelector('.fbanner__close').addEventListener('click', () => {
      closed = true;
      try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* storage unavailable */ }
      update();
    });
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  const sp = window.matchMedia('(max-width: 767px)');

  /* ---- results: carousel (same behaviour as the case list) ---- */
  const list = document.querySelector('.results__list');
  if (list) {
    const cards = Array.from(list.children);
    const dots = document.createElement('div');
    dots.className = 'case__dots';
    const centerOf = (card) => card.offsetLeft - (list.clientWidth - card.offsetWidth) / 2;
    cards.forEach((card, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `実績${i + 1}を表示`);
      b.addEventListener('click', () => list.scrollTo({ left: centerOf(card), behavior: 'smooth' }));
      dots.appendChild(b);
    });
    list.after(dots);
    let ticking = false;
    const update = () => {
      ticking = false;
      const c = list.scrollLeft + list.clientWidth / 2;
      let best = 0, bestD = Infinity;
      cards.forEach((card, i) => {
        const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - c);
        if (d < bestD) { bestD = d; best = i; }
      });
      cards.forEach((card, i) => card.classList.toggle('is-active', i === best));
      Array.from(dots.children).forEach((b, i) => b.classList.toggle('is-active', i === best));
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    list.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ---- scroll reveal (SP only) ---- */
  if (sp.matches && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll(
      '.sec-head, .about__mock, .about__body, .results > .label, .results > .sub-ttl, ' +
      '.steps__panel, .scard, .fcard, .ucard, .flcard, .voice__item, .faq__item, .doc__worries li, .doc__text, .contact__item'
    );
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach((el) => { el.classList.add('js-reveal'); io.observe(el); });
  }
})();
