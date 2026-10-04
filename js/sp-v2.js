(() => {
  'use strict';
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
      '.sec-head, .about__mock, .about__body, .results > .label, .results > .sub-ttl, .way, .sns__but, .worry, .bridge__ttl, ' +
      '.steps__panel, .scard, .fcard, .ucard, .flcard, .ccard__wrap, .voice__item, .faq__item, .contact__item'
    );
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach((el) => { el.classList.add('js-reveal'); io.observe(el); });
  }
})();
