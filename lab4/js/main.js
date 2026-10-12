/* Горизонт подій — анімації сторінки (GSAP + ScrollTrigger + SplitText + Lenis) */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var BH = window.BlackHole;
  var loader = document.getElementById('loader');

  if (!hasGsap) {
    if (loader) loader.style.display = 'none';
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* ---------- Плавне прокручування ---------- */
  var lenis = null;
  if (!reduce && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    window.__lenis = lenis;
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var target = id === '#top' ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.8, easing: function (x) { return 1 - Math.pow(1 - x, 4); } });
      else window.scrollTo({ top: target === 0 ? 0 : target.offsetTop, behavior: 'smooth' });
    });
  });

  /* ---------- Курсор і магнітні елементи ---------- */
  if (finePointer && !reduce) {
    var cursor = document.querySelector('.cursor');
    var dot = document.querySelector('.cursor__dot');
    var ring = document.querySelector('.cursor__ring');
    var dx = gsap.quickTo(dot, 'x', { duration: 0.08 });
    var dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
    var rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
    var ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
    window.addEventListener('pointermove', function (e) { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.querySelectorAll('a, button, input, .card').forEach(function (el) {
      el.addEventListener('pointerenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('pointerleave', function () { cursor.classList.remove('is-hover'); });
    });
    document.querySelectorAll('.magnetic').forEach(function (el) {
      var mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, .4)' });
      var my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, .4)' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.35);
        my((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener('pointerleave', function () { mx(0); my(0); });
    });
  } else {
    var c = document.querySelector('.cursor');
    if (c) c.style.display = 'none';
  }

  /* ---------- Кнопка диска ---------- */
  var calmBtn = document.getElementById('calmBtn');
  if (calmBtn) {
    calmBtn.addEventListener('click', function () {
      if (!BH) return;
      var on = BH.toggleDisk();
      calmBtn.setAttribute('aria-pressed', on ? 'false' : 'true');
    });
  }

  /* ---------- Навігація і прогрес ---------- */
  var nav = document.querySelector('.nav');
  ScrollTrigger.create({
    start: 80,
    onUpdate: function (self) { nav.classList.toggle('is-scrolled', self.scroll() > 80); }
  });
  gsap.to('#progressBar', { scaleY: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  /* ---------- Заголовок першого екрана ---------- */
  var heroSplit = new SplitText('.hero__line', { type: 'chars', charsClass: 'char' });
  gsap.set(heroSplit.chars, { opacity: 0 });
  /* Градієнт «розжареного диска» по літерах курсивного рядка */
  var hot = document.querySelectorAll('.hero__line--italic .char');
  var heat = gsap.utils.interpolate(['#fff4e0', '#f4b563', '#ff7a2f']);
  hot.forEach(function (ch, i) { ch.style.color = heat(i / Math.max(1, hot.length - 1)); });

  function intro() {
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo(heroSplit.chars, {
      filter: 'blur(18px)',
      x: function () { return gsap.utils.random(-260, 260); },
      y: function () { return gsap.utils.random(-180, 180); },
      rotate: function () { return gsap.utils.random(-90, 90); },
      scale: function () { return gsap.utils.random(0.2, 2.2); }
    }, {
      filter: 'blur(0px)', x: 0, y: 0, rotate: 0, scale: 1,
      duration: 2.2,
      stagger: { each: 0.045, from: 'center' }
    }, 0)
      .to(heroSplit.chars, { opacity: 1, duration: 1.2, stagger: { each: 0.045, from: 'center' } }, 0)
      .from('.hero__kicker, .hero__lead, .hero .hero__cta, .hero__coords, .nav', { opacity: 0, y: 30, duration: 1.4, stagger: 0.12 }, 0.9);
    if (BH) tl.from(BH.state, { zoom: 70, tilt: 0.5, duration: 3.4, ease: 'power3.out' }, 0);
    if (lenis) tl.call(function () { lenis.start(); }, null, 0.6);
  }

  /* ---------- Екран завантаження ---------- */
  var counter = { v: 0 };
  var countEl = document.getElementById('loaderCount');
  var loadTl = gsap.timeline();
  loadTl.to(counter, {
    v: 100,
    duration: reduce ? 0.2 : 1.8,
    ease: 'power2.inOut',
    onUpdate: function () { countEl.textContent = Math.round(counter.v); }
  })
    .to(loader, { clipPath: 'circle(0% at 50% 50%)', duration: reduce ? 0.2 : 1.3, ease: 'expo.inOut' })
    .set(loader, { display: 'none' })
    .call(intro, null, '-=0.9');

  /* ---------- Перший екран: падіння до діри під час прокручування ---------- */
  var canvas = document.getElementById('bh');
  if (BH) {
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } })
      .to(BH.state, { zoom: 15, tilt: 0.42, shiftY: -0.05, ease: 'none' }, 0)
      .to('.hero__title', { yPercent: -30, opacity: 0, filter: 'blur(10px)', ease: 'none' }, 0)
      .to('.hero__lead, .hero .hero__cta, .hero__kicker', { y: -60, opacity: 0, ease: 'none' }, 0);

    gsap.to(canvas, {
      opacity: 0.22,
      ease: 'none',
      scrollTrigger: { trigger: '.essence', start: 'top bottom', end: 'top 30%', scrub: true }
    });
    gsap.timeline({ scrollTrigger: { trigger: '.finale', start: 'top bottom', end: 'center center', scrub: 1, refreshPriority: -1 } })
      .to(canvas, { opacity: 1, ease: 'none' }, 0)
      .to(BH.state, { zoom: 30, tilt: 0.06, shiftY: 0.12, ease: 'none' }, 0);
  }

  /* ---------- Заголовки секцій ---------- */
  document.querySelectorAll('.eyebrow').forEach(function (h) {
    var span = h.querySelector('span');
    var split = new SplitText(h, { type: 'words', wordsClass: 'word', ignore: span ? 'span' : undefined });
    gsap.from(split.words, {
      yPercent: 110, opacity: 0, rotate: 4, duration: 1.2, ease: 'expo.out', stagger: 0.06,
      scrollTrigger: { trigger: h, start: 'top 85%' }
    });
  });

  /* ---------- Слова, що «загоряються» під час прокручування ---------- */
  document.querySelectorAll('.reveal-words').forEach(function (el) {
    var split = new SplitText(el, { type: 'words', wordsClass: 'word' });
    gsap.fromTo(split.words, { opacity: 0.12 }, {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true }
    });
  });

  gsap.utils.toArray('.essence__cols p, .formula__note, .legend li').forEach(function (el) {
    gsap.from(el, { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  /* ---------- Формула ---------- */
  gsap.from('.formula__eq > *', {
    y: 80, opacity: 0, rotateX: -60, transformOrigin: '50% 100%', duration: 1.4, ease: 'expo.out', stagger: 0.08,
    scrollTrigger: { trigger: '.formula__eq', start: 'top 85%' }
  });
  gsap.from('.calc', {
    y: 100, opacity: 0, rotateY: -12, duration: 1.6, ease: 'expo.out',
    scrollTrigger: { trigger: '.calc', start: 'top 90%' }
  });

  /* ---------- Калькулятор горизонту ---------- */
  var range = document.getElementById('massRange');
  var massOut = document.getElementById('massOut');
  var radiusOut = document.getElementById('radiusOut');
  var compareOut = document.getElementById('compareOut');
  var orb = document.getElementById('calcOrb');
  var LMIN = Math.log10(3.003e-6);
  var LMAX = Math.log10(6.6e10);
  var named = [
    { m: 3.003e-6, n: 'маса Землі' },
    { m: 9.55e-4, n: 'маса Юпітера' },
    { m: 1, n: 'маса Сонця' },
    { m: 4.3e6, n: 'Стрілець A*' },
    { m: 6.5e9, n: 'M87*' },
    { m: 6.6e10, n: 'TON 618' }
  ];

  function fmt(x, digits) {
    return x.toLocaleString('uk-UA', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  }
  function massLabel(m) {
    if (m >= 1e9) return fmt(m / 1e9, 1) + ' млрд M☉';
    if (m >= 1e6) return fmt(m / 1e6, 1) + ' млн M☉';
    if (m >= 1e3) return fmt(m / 1e3, 1) + ' тис. M☉';
    if (m >= 0.1) return fmt(m, 2) + ' M☉';
    return fmt(m / 3.003e-6, m < 3e-5 ? 2 : 0) + ' мас Землі';
  }
  function radiusLabel(km) {
    if (km < 1e-3) return fmt(km * 1e6, 1) + ' мм';
    if (km < 1) return fmt(km * 1000, 1) + ' м';
    if (km < 1e6) return fmt(km, km < 100 ? 2 : 0) + ' км';
    var au = km / 1.496e8;
    if (au < 1) return fmt(km / 1e6, 1) + ' млн км';
    return fmt(au, 0) + ' а. о.';
  }
  function compare(km) {
    if (km < 0.02e-3) return 'Менше за піщинку';
    if (km < 0.03e-3) return 'Як горошина';
    if (km < 1e-3) return 'Як апельсин';
    if (km < 0.1) return 'Як багатоповерхівка';
    if (km < 10) return 'Як невелике місто';
    if (km < 1000) return 'Як відстань від Києва до Львова';
    if (km < 6.96e5) return 'Як планета';
    var au = km / 1.496e8;
    if (au < 1) return 'У ' + fmt(km / 6.96e5, 0) + ' разів більший за радіус Сонця';
    if (au < 30) return 'Більший за орбіту Землі';
    return 'У ' + fmt(au / 30, 0) + ' разів більший за орбіту Нептуна';
  }
  function updateCalc() {
    var t = range.value / 1000;
    var lm = LMIN + (LMAX - LMIN) * t;
    var m = Math.pow(10, lm);
    var snap = null;
    named.forEach(function (o) { if (Math.abs(Math.log10(o.m) - lm) < 0.18) snap = o; });
    if (snap) m = snap.m;
    var km = 2.953 * m;
    massOut.textContent = massLabel(m) + (snap ? ' · ' + snap.n : '');
    radiusOut.textContent = radiusLabel(km);
    compareOut.textContent = compare(km);
    orb.style.setProperty('--s', (14 + t * 170).toFixed(1) + 'px');
  }
  if (range) {
    range.addEventListener('input', updateCalc);
    updateCalc();
  }

  /* ---------- Анатомія ---------- */
  var parts = document.querySelectorAll('.anatomy__svg .part');
  var items = document.querySelectorAll('.anatomy__list li');
  function activate(name) {
    parts.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-part') === name); });
  }
  items.forEach(function (li) {
    ScrollTrigger.create({
      trigger: li,
      start: 'top 60%',
      end: 'bottom 40%',
      onToggle: function (self) {
        li.classList.toggle('is-active', self.isActive);
        if (self.isActive) activate(li.getAttribute('data-part'));
      }
    });
  });
  document.querySelectorAll('.anatomy__svg .ring, .anatomy__svg .horizon').forEach(function (el) {
    var len = el.getTotalLength ? el.getTotalLength() : 1000;
    if (!el.classList.contains('ring--dash')) gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(el, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', scrollTrigger: { trigger: '.anatomy', start: 'top 70%' } });
  });
  gsap.from('.anatomy__svg', { scale: 0.6, rotate: -40, opacity: 0, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: '.anatomy', start: 'top 70%' } });

  /* ---------- Картки з 3D-нахилом ---------- */
  gsap.from('.card', {
    y: 120, opacity: 0, rotateX: -35, transformOrigin: '50% 0%', duration: 1.5, ease: 'expo.out', stagger: 0.1,
    scrollTrigger: { trigger: '.types__grid', start: 'top 85%' }
  });
  if (finePointer && !reduce) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      var rX = gsap.quickTo(card, 'rotationX', { duration: 0.8, ease: 'power3' });
      var rY = gsap.quickTo(card, 'rotationY', { duration: 0.8, ease: 'power3' });
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        rY((px - 0.5) * 22);
        rX((0.5 - py) * 22);
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
      });
      card.addEventListener('pointerleave', function () { rX(0); rY(0); });
    });
  }

  /* ---------- Спагетифікація ---------- */
  var mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', function () {
    var word = new SplitText('.spaghetti__word', { type: 'chars', charsClass: 'char' });
    var tl = gsap.timeline({
      scrollTrigger: { trigger: '.spaghetti', start: 'top top', end: 'bottom bottom', scrub: 1 }
    });
    tl.from(word.chars, { opacity: 0, yPercent: -120, rotateX: 90, stagger: 0.02, duration: 0.25, ease: 'power3.out' }, 0)
      .to('.spaghetti__hole', { scale: 1.25, y: '-12%', duration: 1, ease: 'power2.in' }, 0.2)
      .to(word.chars, {
        scaleY: function (i) { return 4 + Math.abs(i - word.chars.length / 2) * 0.35; },
        scaleX: 0.28,
        y: function (i) { return window.innerHeight * (0.32 + Math.abs(i - word.chars.length / 2) * 0.012); },
        x: function (i) { return (word.chars.length / 2 - i) * 12; },
        color: '#ffb35c',
        stagger: { each: 0.03, from: 'edges' },
        duration: 0.7,
        ease: 'power2.in'
      }, 0.35)
      .to(word.chars, { opacity: 0, stagger: { each: 0.02, from: 'edges' }, duration: 0.2 }, 0.9)
      .from('.spaghetti__text', { opacity: 0, y: 40, duration: 0.3 }, 0.45);
    return function () { word.revert(); };
  });

  /* ---------- Горизонтальна стрічка історії ---------- */
  mm.add('(min-width: 801px) and (prefers-reduced-motion: no-preference)', function () {
    var track = document.querySelector('.history__track');
    var dist = function () { return track.scrollWidth - window.innerWidth; };
    var tween = gsap.to(track, {
      x: function () { return -dist(); },
      ease: 'none',
      scrollTrigger: {
        trigger: '.history',
        pin: '.history__pin',
        start: 'top top',
        end: function () { return '+=' + dist(); },
        scrub: 1,
        invalidateOnRefresh: true
      }
    });
    gsap.utils.toArray('.event').forEach(function (ev) {
      gsap.from(ev.querySelector('h4'), {
        yPercent: 60, opacity: 0, scale: 0.8, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: ev, containerAnimation: tween, start: 'left 85%' }
      });
      gsap.from(ev, {
        rotateY: -25, opacity: 0.2, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: ev, containerAnimation: tween, start: 'left 95%', end: 'left 60%', scrub: true }
      });
    });
  });

  /* ---------- Лічильники ---------- */
  document.querySelectorAll('.count').forEach(function (el) {
    var to = parseFloat(el.getAttribute('data-to'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var o = { v: 0 };
    gsap.to(o, {
      v: to, duration: 2.4, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: function () { el.textContent = o.v.toLocaleString('uk-UA', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
    });
  });
  gsap.from('.stat', { y: 60, opacity: 0, duration: 1.2, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.numbers__grid', start: 'top 85%' } });

  /* ---------- Міфи ---------- */
  document.querySelectorAll('.myth').forEach(function (m) {
    var s = m.querySelector('s');
    var tl = gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 70%' } });
    tl.from(m.querySelector('.myth__false'), { x: -60, opacity: 0, duration: 1, ease: 'expo.out' })
      .to(s, { '--strike': '100%', duration: 0.9, ease: 'power2.inOut', onComplete: function () { m.classList.add('is-on'); } }, '+=0.15')
      .from(m.querySelector('.myth__true'), { x: 60, opacity: 0, filter: 'blur(8px)', duration: 1, ease: 'expo.out' }, '-=0.3');
  });

  /* ---------- Термінал: рядки друкуються по черзі ---------- */
  var lines = gsap.utils.toArray('#terminal .line');
  gsap.set(lines, { opacity: 0 });
  ScrollTrigger.create({
    trigger: '.terminal',
    start: 'top 75%',
    once: true,
    onEnter: function () {
      var tl = gsap.timeline();
      lines.forEach(function (line) {
        var kbd = line.querySelector('kbd');
        tl.set(line, { opacity: 1 });
        if (kbd && !reduce) {
          var text = kbd.textContent;
          var o = { n: 0 };
          kbd.textContent = '';
          tl.to(o, {
            n: text.length, duration: text.length * 0.028, ease: 'none',
            onUpdate: function () { kbd.textContent = text.slice(0, Math.round(o.n)); }
          });
          tl.to({}, { duration: 0.25 });
        } else {
          tl.from(line, { opacity: 0, x: -10, duration: 0.25 }).to({}, { duration: 0.18 });
        }
      });
    }
  });

  /* ---------- Цитата і фінал ---------- */
  gsap.from('.quote__block footer', { opacity: 0, y: 20, duration: 1, scrollTrigger: { trigger: '.quote', start: 'top 60%' } });
  var fin = new SplitText('.finale__title', { type: 'lines,words', linesClass: 'line-mask', wordsClass: 'word' });
  gsap.from(fin.words, {
    yPercent: 100, opacity: 0, rotate: 3, duration: 1.4, ease: 'expo.out', stagger: 0.04,
    scrollTrigger: { trigger: '.finale', start: 'top 60%' }
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
