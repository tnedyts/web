/* БЕЗОДНЯ — спільний скрипт для сторінок у фреймах.
   Сторінки спілкуються між собою через postMessage: сторінка у фреймі "content"
   повідомляє глибину, а меню, логотип, теми, факти та сам океан на неї реагують. */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var kind = body.getAttribute('data-frame');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var embedded = window.parent !== window;
  var MAXD = 11000;

  /* ---------- Дані про зони ---------- */
  var ZONES = [
    { key: 'sunlight', name: 'Сонячна зона', from: 0, to: 200, who: 'Кити, дельфіни, тунці, черепахи, фітопланктон', c: '#5ef2ff' },
    { key: 'twilight', name: 'Сутінкова зона', from: 200, to: 1000, who: 'Риби-ліхтарі, кальмари, вампіротеутіс', c: '#3aa8ff' },
    { key: 'midnight', name: 'Опівнічна зона', from: 1000, to: 4000, who: 'Вудильники, медуза атола, кашалоти на полюванні', c: '#7b6bff' },
    { key: 'abyss', name: 'Абісаль', from: 4000, to: 6000, who: 'Дамбо-восьминоги, голотурії, риби-триноги', c: '#b05cff' },
    { key: 'hadal', name: 'Хадаль', from: 6000, to: 11000, who: 'Риби-равлики, амфіподи, бактерії', c: '#ff7ac8' }
  ];
  function zoneOf(d) {
    for (var i = ZONES.length - 1; i >= 0; i--) if (d >= ZONES[i].from) return ZONES[i];
    return ZONES[0];
  }
  function temp(d) {
    if (d < 200) return 20 - d * 0.03;
    if (d < 1000) return 14 - (d - 200) * 0.01125;
    if (d < 4000) return 5 - (d - 1000) * 0.001;
    return Math.max(1.2, 2 - (d - 4000) * 0.00012);
  }
  function fmt(n, dec) { return n.toLocaleString('uk-UA', { maximumFractionDigits: dec || 0, minimumFractionDigits: dec || 0 }); }
  function norm(d) { return Math.log(1 + d / 40) / Math.log(1 + MAXD / 40); }

  /* ---------- Фон без «живого океану» ---------- */
  function paintStandalone(d) {
    var n = norm(d);
    var mix = function (a, b, t) { return Math.round(a + (b - a) * t); };
    var top = [mix(11, 2, n), mix(79, 6, n), mix(105, 24, n)];
    var bot = [mix(2, 0, n), mix(22, 0, n), mix(36, 4, n)];
    root.style.setProperty('--bg-top', 'rgb(' + top.join(',') + ')');
    root.style.setProperty('--bg-bot', 'rgb(' + bot.join(',') + ')');
  }

  /* ---------- Рукостискання з батьківським вікном ---------- */
  var gotHello = false;
  if (embedded) {
    try { window.parent.postMessage({ ocean: 'ready' }, '*'); } catch (e) { /* ignore */ }
    setTimeout(function () { if (!gotHello) { root.classList.add('standalone'); paintStandalone(current); } }, 450);
  } else {
    root.classList.add('standalone');
    var note = document.createElement('p');
    note.className = 'direct-note';
    note.innerHTML = 'Це сторінка одного з фреймів. <a href="index.html" target="_top">Відкрити сайт повністю →</a>';
    body.insertBefore(note, body.firstChild);
  }

  /* ---------- Розсилка глибини всім фреймам і батьківському вікну ---------- */
  function broadcast(msg) {
    if (!embedded) { onDepth(msg); return; }
    try { window.parent.postMessage(msg, '*'); } catch (e) { /* ignore */ }
    try {
      var fr = window.parent.frames;
      for (var i = 0; i < fr.length; i++) fr[i].postMessage(msg, '*');
    } catch (e2) { /* ignore */ }
  }

  /* ---------- Біолюмінесценція: передаємо рух курсора батьківському вікну ---------- */
  if (embedded) {
    var pending = null;
    window.addEventListener('pointermove', function (e) {
      if (!pending) {
        pending = { x: e.clientX, y: e.clientY };
        requestAnimationFrame(function () {
          window.parent.postMessage({ ocean: 'pointer', x: pending.x, y: pending.y }, '*');
          pending = null;
        });
      }
    }, { passive: true });
    window.addEventListener('pointerdown', function (e) {
      window.parent.postMessage({ ocean: 'pointer', x: e.clientX, y: e.clientY, burst: true }, '*');
    });
  }

  /* ---------- Реакція на глибину ---------- */
  var current = 0;
  var shown = { v: 0 };
  function onDepth(m) {
    current = m.depth;
    if (root.classList.contains('standalone')) paintStandalone(current);
    var z = zoneOf(current);
    if (kind === 'menu') updMenu(m, z);
    if (kind === 'logo') updLogo(z);
    if (kind === 'topics') updTopics(m, z);
    if (kind === 'facts') updFacts(z);
  }
  window.addEventListener('message', function (e) {
    var m = e.data;
    if (!m || !m.ocean) return;
    if (m.ocean === 'hello') {
      gotHello = true;
      root.classList.add('in-ocean');
      root.classList.remove('standalone');
      if (kind !== 'content') onDepth(m);
      else report(true);
    } else if (m.ocean === 'depth' && e.source !== window) {
      onDepth(m);
    }
  });

  /* ---------- Меню ---------- */
  function updMenu(m, z) {
    var dot = document.querySelector('.gauge__dot');
    if (dot) dot.style.top = (norm(current) * 100) + '%';
    var v = document.querySelector('.gauge__value');
    if (v) v.innerHTML = fmt(Math.round(current)) + '<small>м</small>';
    var zn = document.querySelector('.gauge__zone');
    if (zn) zn.textContent = current < 1 ? 'Поверхня' : z.name;
    if (m.page) {
      document.querySelectorAll('.f-menu li a').forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('data-page') === m.page);
      });
    }
  }
  if (kind === 'menu') {
    var ticks = document.querySelector('.gauge__ticks');
    [0, 200, 1000, 4000, 11000].forEach(function (d) {
      var s = document.createElement('span');
      s.style.top = (norm(d) * 100) + '%';
      s.textContent = d === 0 ? '0 м' : fmt(d) + ' м';
      ticks.appendChild(s);
    });
  }

  /* ---------- Логотип ---------- */
  var ro = {};
  function updLogo(z) {
    if (!ro.d) {
      ro = { d: document.getElementById('rDepth'), p: document.getElementById('rPress'), t: document.getElementById('rTemp'), l: document.getElementById('rLight') };
    }
    var target = current;
    var start = shown.v;
    var t0 = performance.now();
    (function step(now) {
      var k = Math.min(1, (now - t0) / 900);
      var e = 1 - Math.pow(1 - k, 3);
      var d = start + (target - start) * e;
      shown.v = d;
      if (ro.d) ro.d.textContent = fmt(Math.round(d)) + ' м';
      if (ro.p) ro.p.textContent = fmt(1 + d / 10) + ' атм';
      if (ro.t) ro.t.textContent = fmt(temp(d), 1) + ' °C';
      if (ro.l) ro.l.textContent = d < 1 ? '100 %' : (Math.exp(-d / 43) * 100 < 0.01 ? '0 %' : fmt(Math.exp(-d / 43) * 100, Math.exp(-d / 43) * 100 < 1 ? 2 : 0) + ' %');
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  if (kind === 'logo') {
    var title = document.querySelector('.f-logo__title a');
    var txt = title.textContent;
    title.setAttribute('aria-label', txt);
    title.innerHTML = txt.split('').map(function (c, i) {
      return '<span class="l" aria-hidden="true" style="animation-delay:' + (-i * 0.25) + 's">' + c + '</span>';
    }).join('');
    updLogo(zoneOf(0));
  }

  /* ---------- Теми ---------- */
  function updTopics(m, z) {
    document.querySelectorAll('.zones li').forEach(function (li) {
      li.classList.toggle('is-active', current > 0 && li.getAttribute('data-key') === z.key);
    });
  }

  /* ---------- Факти ---------- */
  function updFacts(z) {
    var h = document.getElementById('nowName');
    if (!h) return;
    var surf = current < 1;
    h.textContent = surf ? 'Поверхня океану' : z.name;
    document.getElementById('nowDepth').textContent = fmt(Math.round(current)) + ' м';
    document.getElementById('nowPress').textContent = fmt(1 + current / 10) + ' атм';
    document.getElementById('nowTemp').textContent = '≈ ' + fmt(temp(current), 1) + ' °C';
    document.getElementById('nowWho').textContent = surf ? 'Почніть занурення, щоб дізнатися, хто тут живе.' : 'Мешканці: ' + z.who + '.';
  }
  if (kind === 'facts') {
    var items = document.querySelectorAll('.dyk__item');
    var bar = document.querySelector('.dyk__bar i');
    var idx = 0;
    function show() {
      items.forEach(function (it, k) { it.classList.toggle('is-on', k === idx); });
      bar.classList.remove('run');
      void bar.offsetWidth;
      bar.classList.add('run');
    }
    show();
    if (!reduce) setInterval(function () { idx = (idx + 1) % items.length; show(); }, 7000);
    document.querySelector('.dyk').addEventListener('click', function () { idx = (idx + 1) % items.length; show(); });
    updFacts(zoneOf(0));

    /* Сонар */
    var rc = document.getElementById('radar');
    var rx = rc.getContext('2d');
    var blips = [];
    function rsize() { var s = rc.offsetWidth * (window.devicePixelRatio || 1); rc.width = rc.height = s; }
    rsize();
    window.addEventListener('resize', rsize);
    (function sweep(now) {
      requestAnimationFrame(sweep);
      var s = rc.width;
      var c = s / 2;
      var a = (now / 1000) * 1.4;
      rx.clearRect(0, 0, s, s);
      rx.strokeStyle = 'rgba(94,242,255,.22)';
      rx.lineWidth = 1;
      for (var r = 1; r <= 4; r++) { rx.beginPath(); rx.arc(c, c, c * r / 4.2, 0, 6.283); rx.stroke(); }
      rx.beginPath(); rx.moveTo(c, 0); rx.lineTo(c, s); rx.moveTo(0, c); rx.lineTo(s, c); rx.stroke();
      var g = rx.createConicGradient ? rx.createConicGradient(a - 1.2, c, c) : null;
      if (g) {
        g.addColorStop(0, 'rgba(94,242,255,0)');
        g.addColorStop(0.19, 'rgba(94,242,255,.35)');
        g.addColorStop(0.191, 'rgba(94,242,255,0)');
        g.addColorStop(1, 'rgba(94,242,255,0)');
        rx.fillStyle = g;
        rx.beginPath(); rx.arc(c, c, c * 0.95, 0, 6.283); rx.fill();
      }
      if (Math.random() < 0.03 + norm(current) * 0.05) {
        var ang = a + (Math.random() - 0.5) * 0.2;
        var rad = Math.random() * c * 0.85;
        blips.push({ x: c + Math.cos(ang) * rad, y: c + Math.sin(ang) * rad, life: 1 });
      }
      for (var k = blips.length - 1; k >= 0; k--) {
        var b = blips[k];
        b.life -= 0.006;
        if (b.life <= 0) { blips.splice(k, 1); continue; }
        rx.fillStyle = 'rgba(94,242,255,' + b.life + ')';
        rx.beginPath(); rx.arc(b.x, b.y, 2 + b.life * 2.5, 0, 6.283); rx.fill();
      }
    })(0);
  }

  /* ---------- Сторінки вмісту: глибина залежить від прокручування ---------- */
  var from = parseFloat(body.getAttribute('data-from') || '0');
  var to = parseFloat(body.getAttribute('data-to') || from);
  var page = body.getAttribute('data-page') || '';
  var lastSent = -1;
  function progress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  }
  function report(force) {
    if (kind !== 'content') return;
    var d = from + (to - from) * progress();
    if (!force && Math.abs(d - lastSent) < 2) return;
    lastSent = d;
    var z = zoneOf(d);
    broadcast({ ocean: 'depth', depth: d, zone: z.name, key: z.key, page: page });
  }
  if (kind === 'content') {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; report(false); });
    }, { passive: true });
    report(true);
    setTimeout(function () { report(true); }, 500);
  }

  /* ---------- Анімації сторінок вмісту ---------- */
  if (typeof window.gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  if (kind === 'content' && !reduce && typeof window.Lenis !== 'undefined') {
    var lenis = new Lenis({ lerp: 0.1 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  if (reduce) return;

  if (kind === 'content') {
    var title2 = document.querySelector('.doc__title');
    if (title2) {
      var words = title2.innerHTML.split(/(\s+|<[^>]+>)/).filter(Boolean);
      title2.innerHTML = words.map(function (w) {
        if (/^\s+$/.test(w) || /^</.test(w)) return w;
        return '<span class="w" style="display:inline-block">' + w + '</span>';
      }).join('');
      gsap.from(title2.querySelectorAll('.w'), { yPercent: 100, opacity: 0, filter: 'blur(10px)', duration: 1.4, ease: 'expo.out', stagger: 0.08, delay: 0.1 });
    }
    gsap.from('.doc__kicker, .doc__lead', { y: 30, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.12, delay: 0.25 });
    gsap.utils.toArray('.doc h2, .doc p:not(.doc__lead):not(.doc__kicker), .stat, .creature, .timeline li, .next, .author-tbl tr, .frames-map').forEach(function (el) {
      gsap.from(el, {
        y: 46, opacity: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%' }
      });
    });
    document.querySelectorAll('.count').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-to'));
      var o = { v: 0 };
      gsap.to(o, {
        v: target, duration: 2, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 95%' },
        onUpdate: function () { el.textContent = fmt(Math.round(o.v)); }
      });
    });
  }
  if (kind === 'menu') {
    gsap.from('.f-menu li', { x: -30, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.07, delay: 0.4 });
    gsap.from('.gauge', { opacity: 0, y: 20, duration: 1, delay: 0.9 });
  }
  if (kind === 'topics') {
    gsap.from('.zones li', { x: -20, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.5 });
  }
  if (kind === 'facts') {
    gsap.from('.now, .dyk, .radar', { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12, delay: 0.6 });
  }
  if (kind === 'logo') {
    gsap.from('.f-logo__title .l', { opacity: 0, filter: 'blur(14px)', duration: 1.6, ease: 'power2.out', stagger: 0.07, delay: 0.3 });
    gsap.from('.f-logo__sub, .readout', { opacity: 0, y: 14, duration: 1, stagger: 0.08, delay: 0.8 });
  }
})();
