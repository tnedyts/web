/* Горизонт подій — прокручування = падіння зонда в чорну діру Стрілець A*.
   Камера наближається від 60 Rs до горизонту; текстові «станції» пролітають у 3D,
   а HUD рахує відстань, швидкість утечі, червоний зсув і сповільнення часу. */
(function () {
  'use strict';

  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var BH = window.BlackHole;
  var loader = document.getElementById('loader');
  var stations = Array.prototype.slice.call(document.querySelectorAll('.station'));
  var N = stations.length;
  var fly = !reduce && hasGsap;
  if (fly) html.classList.add('fly');

  function fmt(x, d) { return x.toLocaleString('uk-UA', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function sci(x) {
    if (x >= 0.01) return fmt(x, x < 1 ? 3 : 1);
    var e = Math.floor(Math.log10(x));
    var m = x / Math.pow(10, e);
    var sup = String(e).replace('-', '⁻').replace(/\d/g, function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]; });
    return fmt(m, 1) + '·10' + sup;
  }

  /* ---------- Курсор ---------- */
  if (fine && !reduce && hasGsap) {
    var cursor = document.querySelector('.cursor');
    var dx = gsap.quickTo('.cursor__dot', 'x', { duration: 0.08 });
    var dy = gsap.quickTo('.cursor__dot', 'y', { duration: 0.08 });
    var rx = gsap.quickTo('.cursor__ring', 'x', { duration: 0.5, ease: 'power3' });
    var ry = gsap.quickTo('.cursor__ring', 'y', { duration: 0.5, ease: 'power3' });
    window.addEventListener('pointermove', function (e) { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.querySelectorAll('a, button, input, .hud__gauge li').forEach(function (el) {
      el.addEventListener('pointerenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('pointerleave', function () { cursor.classList.remove('is-hover'); });
    });
  } else {
    var c0 = document.querySelector('.cursor');
    if (c0) c0.style.display = 'none';
  }

  /* ---------- Калькулятор радіуса ---------- */
  var range = document.getElementById('massRange');
  if (range) {
    var LMIN = Math.log10(3.003e-6);
    var LMAX = Math.log10(6.6e10);
    var named = [[3.003e-6, 'Земля'], [9.55e-4, 'Юпітер'], [1, 'Сонце'], [4.3e6, 'Стрілець A*'], [6.5e9, 'M87*'], [6.6e10, 'TON 618']];
    var mOut = document.getElementById('massOut');
    var rOut = document.getElementById('radiusOut');
    var cOut = document.getElementById('compareOut');
    var upd = function () {
      var lm = LMIN + (LMAX - LMIN) * range.value / 1000;
      var m = Math.pow(10, lm);
      var snap = null;
      named.forEach(function (o) { if (Math.abs(Math.log10(o[0]) - lm) < 0.18) snap = o; });
      if (snap) m = snap[0];
      var km = 2.953 * m;
      var ml = m >= 1e9 ? fmt(m / 1e9, 1) + ' млрд M☉' : m >= 1e6 ? fmt(m / 1e6, 1) + ' млн M☉' : m >= 0.1 ? fmt(m, 2) + ' M☉' : fmt(m / 3.003e-6, 1) + ' мас Землі';
      mOut.textContent = ml + (snap ? ' · ' + snap[1] : '');
      rOut.textContent = km < 1e-3 ? fmt(km * 1e6, 1) + ' мм' : km < 1 ? fmt(km * 1000, 1) + ' м' : km < 1e6 ? fmt(km, km < 100 ? 2 : 0) + ' км' : km < 1.496e8 ? fmt(km / 1e6, 1) + ' млн км' : fmt(km / 1.496e8, 0) + ' а. о.';
      cOut.textContent = km < 0.03e-3 ? 'як горошина' : km < 1e-3 ? 'як апельсин' : km < 0.1 ? 'як будинок' : km < 10 ? 'як невелике місто' : km < 1000 ? 'як від Києва до Львова' : km < 6.96e5 ? 'як планета' : km < 1.496e8 ? 'більший за Сонце' : km < 4.5e9 ? 'більший за орбіту Землі' : 'більший за орбіту Нептуна';
    };
    range.addEventListener('input', upd);
    upd();
  }

  var diskBtn = document.getElementById('diskBtn');
  if (diskBtn) diskBtn.addEventListener('click', function () {
    if (!BH) return;
    var on = BH.toggleDisk();
    diskBtn.textContent = on ? 'диск: обертається' : 'диск: зупинено';
    diskBtn.setAttribute('aria-pressed', on ? 'false' : 'true');
  });

  if (!hasGsap) { if (loader) loader.style.display = 'none'; return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Простір для прокручування ---------- */
  var SEG = 1.25;
  if (fly) document.body.style.height = ((N - 1) * SEG * 100 + 100) + 'vh';

  var lenis = null;
  if (!reduce && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.8 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  function maxScroll() { return Math.max(1, document.documentElement.scrollHeight - window.innerHeight); }
  function scrollToP(p, dur) {
    var y = p * maxScroll();
    if (lenis) lenis.scrollTo(y, { duration: dur || 2.4, easing: function (x) { return 1 - Math.pow(1 - x, 3); } });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }

  /* ---------- Шкала станцій у HUD ---------- */
  var gauge = document.getElementById('gauge');
  var rs = stations.map(function (s) { return parseFloat(s.getAttribute('data-r')); });
  stations.forEach(function (s, i) {
    var li = document.createElement('li');
    li.textContent = (rs[i] < 1 ? '< 1' : fmt(rs[i], rs[i] < 2 ? 2 : 0)) + ' Rs · ' + s.getAttribute('data-phase');
    li.addEventListener('click', function () { scrollToP(i / (N - 1)); });
    gauge.appendChild(li);
  });
  var gaugeItems = gauge.querySelectorAll('li');
  document.getElementById('again').addEventListener('click', function (e) { e.preventDefault(); scrollToP(0, 3); });

  /* ---------- Спагетифікація: літери слова ---------- */
  var sp = document.querySelector('.spaghetti');
  var spChars = [];
  if (sp) {
    var txt = sp.textContent;
    sp.innerHTML = txt.split('').map(function (c) { return '<span class="ch" aria-hidden="true">' + c + '</span>'; }).join('');
    spChars = Array.prototype.slice.call(sp.querySelectorAll('.ch'));
  }

  /* ---------- Журнал зонда ---------- */
  var lines = Array.prototype.slice.call(document.querySelectorAll('#terminal .line'));
  var logShown = false;
  if (fly) gsap.set(lines, { opacity: 0 });
  function showLog() {
    if (logShown || !fly) return;
    logShown = true;
    var tl = gsap.timeline();
    lines.forEach(function (line) {
      var k = line.querySelector('kbd');
      tl.set(line, { opacity: 1 });
      if (k) {
        var t = k.textContent;
        var o = { n: 0 };
        k.textContent = '';
        tl.to(o, { n: t.length, duration: t.length * 0.03, ease: 'none', onUpdate: function () { k.textContent = t.slice(0, Math.round(o.n)); } });
      } else tl.from(line, { opacity: 0, x: -10, duration: 0.25 });
      tl.to({}, { duration: 0.2 });
    });
  }

  /* ---------- HUD ---------- */
  var hud = document.querySelector('.hud');
  var H = {
    r: document.getElementById('hR'), km: document.getElementById('hKm'), esc: document.getElementById('hEsc'),
    z: document.getElementById('hZ'), tide: document.getElementById('hTide'), dil: document.getElementById('hDil'),
    mine: document.getElementById('hMine'), earth: document.getElementById('hEarth'), phase: document.getElementById('hPhase'),
    bar: document.getElementById('hBar')
  };
  function clock(s) {
    var h = Math.floor(s / 3600);
    var m = Math.floor(s / 60) % 60;
    var ss = Math.floor(s % 60);
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
  }

  /* r(p): кусково-лінійно в логарифмічному масштабі між станціями */
  function rAt(p) {
    var x = p * (N - 1);
    var i = Math.min(N - 2, Math.floor(x));
    var t = Math.max(0, Math.min(1, x - i));
    return Math.exp(Math.log(rs[i]) + (Math.log(rs[i + 1]) - Math.log(rs[i])) * t);
  }

  var mine = 0;
  var earth = 0;
  var lost = false;
  var lastPhase = '';
  var cur = 0;
  var last = performance.now();
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };

  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    var p = fly ? Math.min(1, Math.max(0, window.scrollY / maxScroll())) : 0.12;
    cur += (p - cur) * 0.2;
    if (Math.abs(p - cur) < 0.0002) cur = p;
    var r = rAt(cur);

    /* камера */
    if (BH) {
      BH.state.zoom = Math.max(0.6, r);
      BH.state.yaw = cur * 2.2;
      /* ближче до діри тінь займає півнеба: ширшаємо кут огляду
         і повертаємо погляд убік, щоб бачити межу тіні та диск */
      var near01 = Math.max(0, Math.min(1, (Math.log(40) - Math.log(Math.max(r, 1))) / Math.log(40)));
      BH.state.tilt = 0.14 + 0.24 * Math.sin(Math.min(1, near01 * 1.4) * Math.PI);
      BH.state.fl = 1.7 - 1.25 * near01;
      BH.state.look = 1.15 * near01 * near01 * near01;
      BH.state.shiftY = 0.05 * near01;
    }

    /* перетин горизонту */
    if (r < 1 && !lost) {
      lost = true;
      hud.classList.add('is-lost');
      gsap.fromTo('#flash', { opacity: 0.9 }, { opacity: 0, duration: 1.2, ease: 'power2.out' });
      showLog();
    } else if (r >= 1 && lost) {
      lost = false;
      hud.classList.remove('is-lost');
    }

    /* прилади */
    mine += dt;
    var dil = r > 1 ? 1 / Math.sqrt(1 - 1 / r) : Infinity;
    if (r > 1) earth += dt * dil;
    H.r.textContent = r > 1 ? fmt(r, r < 10 ? 2 : 1) : '< 1';
    H.km.textContent = r > 1 ? fmt(r * 12.7, 0) + ' млн км' : 'під горизонтом';
    H.esc.textContent = r > 1 ? fmt(Math.sqrt(1 / r) * 100, 1) + ' % c' : '> c';
    H.z.textContent = r > 1 ? 'z = ' + sci(dil - 1) : 'z = ∞';
    H.tide.textContent = sci(1.11e-3 / Math.pow(r, 3)) + ' м/с²';
    H.dil.textContent = r > 1 ? '×' + fmt(dil, dil < 10 ? 3 : 1) : '×∞';
    H.mine.textContent = clock(mine);
    H.earth.textContent = r > 1 ? clock(earth) : '∞';
    H.bar.style.transform = 'scaleX(' + cur + ')';

    /* станції */
    var w = 0.62 / (N - 1);
    var near = 0;
    var best = 9;
    stations.forEach(function (s, i) {
      var c = i / (N - 1);
      if (Math.abs(cur - c) < best) { best = Math.abs(cur - c); near = i; }
      if (!fly) return;
      var q = (cur - (c - w)) / (2 * w);
      if (i === 0) q = Math.max(q, 0.01);
      if (i === N - 1) q = Math.min(q, 0.99);
      if (q <= 0 || q >= 1) { if (s.style.visibility !== 'hidden') s.style.visibility = 'hidden'; s.classList.remove('is-live'); return; }
      var side = parseFloat(s.getAttribute('data-x') || '0');
      var z;
      var o;
      var b;
      var x;
      var rot;
      if (q < 0.36) {
        var t = ease(q / 0.36);
        z = -1500 * (1 - t); o = t; b = (1 - t) * 10; x = side * 14 * (1 - t); rot = side * -14 * (1 - t);
      } else if (q < 0.64) {
        z = 0; o = 1; b = 0; x = 0; rot = 0;
      } else {
        var u = (q - 0.64) / 0.36;
        z = 1100 * u * u; o = 1 - u; b = u * 12; x = -side * 10 * u; rot = side * 10 * u;
      }
      if (i === 0 && q < 0.5) { z = 0; o = 1; b = 0; x = 0; rot = 0; }
      if (i === N - 1 && q > 0.5) { z = 0; o = 1; b = 0; x = 0; rot = 0; }
      s.style.visibility = 'visible';
      s.style.opacity = o.toFixed(3);
      s.style.filter = b > 0.2 ? 'blur(' + b.toFixed(1) + 'px)' : 'none';
      s.style.transform = 'translate(-50%,-50%) translate3d(' + x.toFixed(2) + 'vw,' + ((0.5 - q) * 30).toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateY(' + rot.toFixed(2) + 'deg)';
      s.classList.toggle('is-live', q > 0.3 && q < 0.7);
      /* спагетифікація всередині станції ISCO */
      if (sp && s.contains(sp) && spChars.length) {
        var k = Math.max(0, (q - 0.42) / 0.5);
        var mid = (spChars.length - 1) / 2;
        spChars.forEach(function (ch, j) {
          var d = 1 - Math.abs(j - mid) / mid;
          ch.style.transform = 'translateY(' + (k * k * 120 * (0.4 + d)).toFixed(1) + 'px) scaleY(' + (1 + k * k * 5 * (0.3 + d)).toFixed(3) + ') scaleX(' + (1 - k * 0.55).toFixed(3) + ')';
          ch.style.color = k > 0.05 ? 'rgb(239,' + Math.round(232 - 60 * k) + ',' + Math.round(220 - 140 * k) + ')' : '';
        });
      }
      if (i === N - 1 && q > 0.4) showLog();
    });
    var ph = stations[near].getAttribute('data-phase');
    if (ph !== lastPhase) {
      lastPhase = ph;
      H.phase.textContent = ph;
      gaugeItems.forEach(function (li, i) { li.classList.toggle('is-on', i === near); });
      if (!reduce) gsap.fromTo(H.phase, { opacity: 0, x: 12 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' });
    }
  }

  /* ---------- Завантаження та старт ---------- */
  var counter = { v: 0 };
  var cEl = document.getElementById('loaderCount');
  function start() {
    requestAnimationFrame(frame);
    if (lenis) lenis.start();
    if (reduce) return;
    var title = document.querySelector('.hero__title');
    gsap.from(title.querySelectorAll('.hero__line'), { yPercent: 60, opacity: 0, filter: 'blur(16px)', duration: 2, ease: 'expo.out', stagger: 0.18 });
    gsap.from('.station--hero .kicker, .station--hero .lead, .station--hero .cue', { opacity: 0, y: 20, duration: 1.4, ease: 'power3.out', stagger: 0.12, delay: 0.5 });
    gsap.from('.hud > *', { opacity: 0, duration: 1.2, stagger: 0.08, delay: 0.8 });
  }
  gsap.timeline()
    .to(counter, { v: 100, duration: reduce ? 0.2 : 1.6, ease: 'power2.inOut', onUpdate: function () { cEl.textContent = Math.round(counter.v); } })
    .to(loader, { clipPath: 'circle(0% at 50% 50%)', duration: reduce ? 0.2 : 1.2, ease: 'expo.inOut' })
    .set(loader, { display: 'none' })
    .call(start, null, '-=0.8');
})();
