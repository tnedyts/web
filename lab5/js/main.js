/* ВЕРШИНИ — гори, паралакс, сніг, переходи між сторінками та інтерактивні таблиці */
(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Топографічні горизонталі на тлі (безшовна плитка) ---------- */
  (function topo() {
    var el = document.querySelector('.topo');
    if (!el) return;
    var T = 960;
    var G = 6;
    var n = T / G;
    var rnd = rng(1234);
    var waves = [];
    for (var k = 0; k < 14; k++) {
      waves.push({ fx: Math.round(rnd() * 6) - 3 || 1, fy: Math.round(rnd() * 6) - 3 || 2, a: 0.4 + rnd() * (k < 4 ? 1.2 : 0.5), p: rnd() * 6.283 });
    }
    function f(x, y) {
      var v = 0;
      for (var i = 0; i < waves.length; i++) { var w = waves[i]; v += w.a * Math.sin(6.283 * (w.fx * x + w.fy * y) / T + w.p); }
      return v;
    }
    var field = new Float32Array((n + 1) * (n + 1));
    var mn = 1e9;
    var mx = -1e9;
    for (var j = 0; j <= n; j++) for (var i = 0; i <= n; i++) { var v = f(i * G, j * G); field[j * (n + 1) + i] = v; if (v < mn) mn = v; if (v > mx) mx = v; }
    var c = document.createElement('canvas');
    c.width = c.height = T;
    var x = c.getContext('2d');
    var L = 26;
    for (var l = 1; l < L; l++) {
      var iso = mn + (mx - mn) * l / L;
      var major = l % 5 === 0;
      x.strokeStyle = major ? 'rgba(169,200,255,.16)' : 'rgba(169,200,255,.075)';
      x.lineWidth = major ? 1.4 : 0.9;
      x.beginPath();
      for (j = 0; j < n; j++) {
        for (i = 0; i < n; i++) {
          var a = field[j * (n + 1) + i];
          var b = field[j * (n + 1) + i + 1];
          var cc = field[(j + 1) * (n + 1) + i + 1];
          var d = field[(j + 1) * (n + 1) + i];
          var idx = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (cc > iso ? 2 : 0) | (d > iso ? 1 : 0);
          if (idx === 0 || idx === 15) continue;
          var X = i * G;
          var Y = j * G;
          var pt = function (p, q, x1, y1, x2, y2) { var t = (iso - p) / (q - p); return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]; };
          var top = pt(a, b, X, Y, X + G, Y);
          var right = pt(b, cc, X + G, Y, X + G, Y + G);
          var bottom = pt(d, cc, X, Y + G, X + G, Y + G);
          var left = pt(a, d, X, Y, X, Y + G);
          var segs = { 1: [left, bottom], 2: [bottom, right], 3: [left, right], 4: [top, right], 5: [left, top, bottom, right], 6: [top, bottom], 7: [left, top], 8: [left, top], 9: [top, bottom], 10: [left, bottom, top, right], 11: [top, right], 12: [left, right], 13: [bottom, right], 14: [left, bottom] }[idx];
          for (var sgi = 0; sgi < segs.length; sgi += 2) { x.moveTo(segs[sgi][0], segs[sgi][1]); x.lineTo(segs[sgi + 1][0], segs[sgi + 1][1]); }
        }
      }
      x.stroke();
    }
    el.style.backgroundImage = 'url(' + c.toDataURL() + ')';
    el.style.backgroundSize = T + 'px ' + T + 'px';
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { el.style.backgroundPosition = '0 ' + (-window.scrollY * 0.22).toFixed(1) + 'px'; ticking = false; });
    }, { passive: true });
  })();

  var route = document.querySelector('table.route');
  if (route) {
    doc.classList.add('climb');
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  }
  var hasGsap = typeof window.gsap !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  else {
    var cur = document.querySelector('.curtain');
    if (cur) cur.style.display = 'none';
  }

  /* ---------- Генератор гірських хребтів ---------- */
  function rng(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }
  function ridgePoints(o) {
    var r = rng(o.seed);
    var n = 512;
    var pts = new Array(n + 1);
    /* дрібні деталі: зміщення середньої точки */
    var det = new Array(n + 1);
    det[0] = 0;
    det[n] = 0;
    var step = n;
    var a = o.detail || 30;
    while (step > 1) {
      var half = Math.floor(step / 2);
      for (var i = half; i < n; i += step) det[i] = (det[i - half] + det[Math.min(n, i + half)]) / 2 + (r() - 0.5) * a;
      a *= o.rough;
      step = half;
    }
    for (i = 0; i <= n; i++) if (det[i] === undefined) det[i] = 0;
    /* великі «намети» вершин */
    var tents = (o.peaks || []).slice();
    for (var k = 0; k < (o.count || 0); k++) {
      tents.push({ x: r(), w: o.wmin + r() * (o.wmax - o.wmin), h: o.hmin + r() * (o.hmax - o.hmin) });
    }
    for (i = 0; i <= n; i++) {
      var x = i / n;
      var m = 0;
      for (k = 0; k < tents.length; k++) {
        var t = tents[k];
        var d = Math.abs(x - t.x) / t.w;
        if (d < 1) {
          var v = t.h * Math.pow(1 - d, 1.25);
          if (v > m) m = v;
        }
      }
      pts[i] = o.base - m - det[i] * (0.4 + 0.6 * (m / (o.hmax || 100)));
    }
    /* згладжування */
    for (var pass = 0; pass < (o.smooth || 1); pass++) {
      for (i = 1; i < n; i++) pts[i] = (pts[i - 1] + pts[i] * 2 + pts[i + 1]) / 4;
    }
    return pts;
  }
  function ridgePath(pts, w, h, closed) {
    var n = pts.length - 1;
    var d = closed ? 'M0 ' + h + ' L0 ' + pts[0].toFixed(1) : 'M0 ' + pts[0].toFixed(1);
    for (var i = 1; i <= n; i++) d += ' L' + (i / n * w).toFixed(1) + ' ' + pts[i].toFixed(1);
    if (closed) d += ' L' + w + ' ' + h + ' Z';
    return d;
  }
  var LAYERS = [
    { base: 380, detail: 60, rough: .56, count: 7, wmin: .06, wmax: .16, hmin: 90, hmax: 190, smooth: 1, top: '#eeeaf9', c1: '#938dc9', c2: '#6c66a8', rim: 'rgba(255,214,190,.55)', peaks: [] },
    { base: 440, detail: 70, rough: .55, count: 5, wmin: .07, wmax: .15, hmin: 110, hmax: 210, smooth: 1, top: '#ffffff', c1: '#625d9f', c2: '#4a4688', rim: 'rgba(255,200,180,.7)', peaks: [{ x: .5, w: .17, h: 320 }] },
    { base: 540, detail: 50, rough: .55, count: 3, wmin: .06, wmax: .12, hmin: 60, hmax: 120, smooth: 1, top: '#8f8bc2', c1: '#3a3a74', c2: '#28285c', rim: 'rgba(255,180,170,.4)', peaks: [{ x: .1, w: .14, h: 190 }, { x: .88, w: .16, h: 210 }, { x: .5, w: .3, h: 165 }] },
    { base: 600, detail: 20, rough: .5, count: 5, wmin: .08, wmax: .2, hmin: 30, hmax: 80, smooth: 2, top: '#2b2c64', c1: '#1f2052', c2: '#171842', peaks: [] },
    { base: 655, detail: 14, rough: .55, count: 6, wmin: .1, wmax: .25, hmin: 10, hmax: 40, smooth: 2, top: '#131737', c1: '#0e1231', c2: '#0a0f24', peaks: [] }
  ];
  var W = 1600;
  var H = 700;
  document.querySelectorAll('.hero').forEach(function (hero, hi) {
    var seed = parseInt(hero.getAttribute('data-seed') || '11', 10);
    hero.querySelectorAll('.hero__layer').forEach(function (svg) {
      var k = parseInt(svg.getAttribute('data-layer'), 10) - 1;
      var L = LAYERS[k];
      var o = Object.assign({}, L, { seed: seed * 97 + k * 131 + 7 });
      if (hero.classList.contains('hero--page')) o.peaks = L.peaks.map(function (p) { return { x: 1 - p.x * 0.8, h: p.h * 0.85, w: p.w }; });
      var pts = ridgePoints(o);
      var id = 'g' + hi + '-' + k;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('preserveAspectRatio', 'xMidYMax slice');
      svg.innerHTML =
        '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + L.top + '"/><stop offset=".22" stop-color="' + L.c1 + '"/><stop offset="1" stop-color="' + L.c2 + '"/>' +
        '</linearGradient></defs>' +
        '<path d="' + ridgePath(pts, W, H, true) + '" fill="url(#' + id + ')"/>' +
        (L.rim ? '<path d="' + ridgePath(pts, W, H, false) + '" fill="none" stroke="' + L.rim + '" stroke-width="1.6"/>' : '');
    });
  });

  /* Невеликі ілюстрації гір у картках (data-art) */
  document.querySelectorAll('[data-art]').forEach(function (el, i) {
    var seed = parseInt(el.getAttribute('data-art'), 10) || i + 3;
    var pts1 = ridgePoints({ seed: seed * 13, base: 190, detail: 14, rough: .5, count: 3, wmin: .1, wmax: .2, hmin: 40, hmax: 80, peaks: [{ x: .62, w: .25, h: 130 }] });
    var pts2 = ridgePoints({ seed: seed * 29, base: 215, detail: 10, rough: .5, count: 4, wmin: .1, wmax: .3, hmin: 15, hmax: 45, smooth: 2 });
    el.innerHTML = '<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
      '<defs><linearGradient id="a' + i + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f2fb"/><stop offset=".3" stop-color="#6f6aa8"/><stop offset="1" stop-color="#3b3a74"/></linearGradient></defs>' +
      '<circle cx="290" cy="90" r="34" fill="#ffe2b0" opacity=".9"/>' +
      '<path d="' + ridgePath(pts1, 400, 220, true) + '" fill="url(#a' + i + ')"/>' +
      '<path d="' + ridgePath(pts2, 400, 220, true) + '" fill="#1d1f4d"/>' +
      '</svg>';
  });

  /* ---------- Зорі ---------- */
  function stars(canvas) {
    var ctx = canvas.getContext('2d');
    var list = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      list = [];
      var n = Math.round(canvas.offsetWidth * canvas.offsetHeight / 4200);
      for (var i = 0; i < n; i++) {
        list.push({ x: Math.random(), y: Math.pow(Math.random(), 1.6) * 0.62, r: Math.random() * 1.2 + 0.25, p: Math.random() * 6.28, s: 0.5 + Math.random() * 2 });
      }
    }
    size();
    window.addEventListener('resize', size);
    return function (t, fade) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (fade <= 0.01) return;
      for (var i = 0; i < list.length; i++) {
        var s = list[i];
        var a = (0.55 + 0.45 * Math.sin(t * s.s + s.p)) * (1 - s.y / 0.7) * fade;
        ctx.globalAlpha = a;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r * dpr, 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
  }

  /* ---------- Сніг, що реагує на рух миші ---------- */
  var wind = 0;
  var windTarget = 0.4;
  var lastX = null;
  window.addEventListener('pointermove', function (e) {
    if (lastX !== null) windTarget = Math.max(-6, Math.min(6, windTarget * 0.6 + (e.clientX - lastX) * 0.08));
    lastX = e.clientX;
  }, { passive: true });
  function snow(canvas) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var flakes = [];
    function size() {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      var n = Math.min(220, Math.round(canvas.offsetWidth / 7));
      flakes = [];
      for (var i = 0; i < n; i++) flakes.push(make(true));
    }
    function make(any) {
      var z = Math.random();
      return { x: Math.random() * canvas.width, y: any ? Math.random() * canvas.height : -10, z: z, r: (0.6 + z * 2.6) * dpr, vy: (0.4 + z * 1.4) * dpr, ph: Math.random() * 6.28 };
    }
    size();
    window.addEventListener('resize', size);
    return function (t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      wind += (windTarget - wind) * 0.03;
      windTarget += (0.4 - windTarget) * 0.01;
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.y += f.vy;
        f.x += (wind * (0.4 + f.z) + Math.sin(t * 1.2 + f.ph) * 0.4) * dpr;
        if (f.y > canvas.height + 10) flakes[i] = f = make(false);
        if (f.x > canvas.width + 10) f.x = -10;
        if (f.x < -10) f.x = canvas.width + 10;
        ctx.globalAlpha = 0.35 + f.z * 0.55;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
  }

  var hero = document.querySelector('.hero');
  var heroState = { stars: 1 };
  if (hero) {
    var drawStars = hero.querySelector('.hero__stars') ? stars(hero.querySelector('.hero__stars')) : null;
    var drawSnow = !reduce && hero.querySelector('.hero__snow') ? snow(hero.querySelector('.hero__snow')) : null;
    var heroVisible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; }).observe(hero);
    }
    (function loop(now) {
      requestAnimationFrame(loop);
      if (!heroVisible || document.hidden) return;
      var t = now / 1000;
      if (drawStars) drawStars(t, heroState.stars);
      if (drawSnow) drawSnow(t);
    })(0);
  }

  /* ---------- Мобільне меню ---------- */
  var toggle = document.querySelector('.menu__toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var m = document.querySelector('table.menu');
      var open = m.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- Таблиці, що сортуються ---------- */
  document.querySelectorAll('table.sortable').forEach(function (table) {
    var tbody = table.querySelector('tbody');
    table.querySelectorAll('th[data-sort]').forEach(function (th) {
      th.setAttribute('tabindex', '0');
      function run() {
        var col = parseInt(th.getAttribute('data-col'), 10);
        var asc = !th.classList.contains('is-asc');
        table.querySelectorAll('th[data-sort]').forEach(function (o) { o.classList.remove('is-asc', 'is-desc'); });
        th.classList.add(asc ? 'is-asc' : 'is-desc');
        var rows = Array.prototype.slice.call(tbody.rows);
        rows.sort(function (a, b) {
          var x = a.cells[col].getAttribute('data-v') || a.cells[col].textContent.trim();
          var y = b.cells[col].getAttribute('data-v') || b.cells[col].textContent.trim();
          var nx = parseFloat(x);
          var ny = parseFloat(y);
          var c = (!isNaN(nx) && !isNaN(ny)) ? nx - ny : x.localeCompare(y, 'uk');
          return asc ? c : -c;
        });
        rows.forEach(function (r) { tbody.appendChild(r); });
        if (hasGsap && !reduce) gsap.fromTo(rows, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.025, ease: 'power3.out' });
      }
      th.addEventListener('click', run);
      th.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run(); } });
    });
  });

  /* ---------- Силует висот восьмитисячників ---------- */
  var sky = document.getElementById('skyline');
  if (sky) {
    var src = document.querySelectorAll('#peaksTable tbody tr');
    var data = Array.prototype.map.call(src, function (tr) {
      return { name: tr.getAttribute('data-name'), h: parseFloat(tr.getAttribute('data-h')), row: tr };
    });
    var sw = 1000;
    var sh = 360;
    var minH = 7600;
    var maxH = 8900;
    var step = sw / data.length;
    var svg = '<defs><linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f2fb"/><stop offset=".18" stop-color="#9b95cf"/><stop offset="1" stop-color="#2a2a60"/></linearGradient></defs>';
    [8000, 8500].forEach(function (g) {
      var y = sh - (g - minH) / (maxH - minH) * sh;
      svg += '<line class="grid-line" x1="0" x2="' + sw + '" y1="' + y + '" y2="' + y + '"/><text x="' + (sw - 4) + '" y="' + (y - 6) + '" text-anchor="end">' + g + ' м</text>';
    });
    data.forEach(function (p, i) {
      var cx = step * i + step / 2;
      var top = sh - (p.h - minH) / (maxH - minH) * sh;
      var half = step * 0.9;
      svg += '<g class="peak-g" data-i="' + i + '"><path class="peak" d="M' + (cx - half) + ' ' + sh + ' L' + (cx - 6) + ' ' + (top + 8) + ' L' + cx + ' ' + top + ' L' + (cx + 8) + ' ' + (top + 12) + ' L' + (cx + half) + ' ' + sh + ' Z"/>' +
        '<text class="h-label" x="' + cx + '" y="' + (top - 10) + '" text-anchor="middle">' + p.h + '</text></g>';
    });
    sky.innerHTML = svg;
    sky.setAttribute('viewBox', '0 -30 ' + sw + ' ' + (sh + 30));
    var tip = document.querySelector('.tip');
    sky.querySelectorAll('.peak-g').forEach(function (g) {
      var p = data[parseInt(g.getAttribute('data-i'), 10)];
      g.addEventListener('pointerenter', function () {
        g.querySelector('.peak').classList.add('is-hot');
        p.row.style.background = 'rgba(255,184,107,.14)';
        if (tip) {
          tip.innerHTML = '<b>' + p.name + '</b>' + p.h.toLocaleString('uk-UA') + ' м над рівнем моря';
          tip.classList.add('is-on');
        }
      });
      g.addEventListener('pointermove', function (e) {
        if (!tip) return;
        var r = sky.parentNode.getBoundingClientRect();
        tip.style.left = (e.clientX - r.left) + 'px';
        tip.style.top = (e.clientY - r.top) + 'px';
      });
      g.addEventListener('pointerleave', function () {
        g.querySelector('.peak').classList.remove('is-hot');
        p.row.style.background = '';
        if (tip) tip.classList.remove('is-on');
      });
    });
    if (hasGsap && !reduce) {
      gsap.from(sky.querySelectorAll('.peak-g'), {
        scaleY: 0, transformOrigin: '50% 100%', opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.06,
        scrollTrigger: { trigger: sky, start: 'top 80%' }
      });
    }
  }

  /* ---------- Профіль Чорногори з туристом ---------- */
  var ridgeSvg = document.getElementById('ridgeSvg');
  if (ridgeSvg) {
    var pts = Array.prototype.map.call(document.querySelectorAll('#ridgeData li'), function (li) {
      return { x: parseFloat(li.getAttribute('data-x')), h: parseFloat(li.getAttribute('data-h')), name: li.textContent.trim() };
    });
    var rw = 1000;
    var rh = 340;
    var lo = 1300;
    var hi = 2150;
    function Y(h) { return rh - 20 - (h - lo) / (hi - lo) * (rh - 90); }
    var r = rng(4242);
    var line = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i];
      var b = pts[i + 1];
      var x0 = a.x * rw;
      var x1 = b.x * rw;
      var steps = 18;
      for (var s = 0; s < steps; s++) {
        var t = s / steps;
        var dip = Math.sin(t * Math.PI) * (90 + r() * 70);
        var h = a.h + (b.h - a.h) * t - dip + (r() - 0.5) * 18;
        line.push([x0 + (x1 - x0) * t, Y(h)]);
      }
    }
    var last = pts[pts.length - 1];
    line.push([last.x * rw, Y(last.h)]);
    var start = [[0, Y(1450)], [pts[0].x * rw * 0.5, Y(1750)]];
    var end = [[(last.x * rw + rw) / 2, Y(1700)], [rw, Y(1400)]];
    var all = start.concat(line, end);
    var dLine = 'M' + all.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L');
    var dFill = dLine + ' L' + rw + ' ' + rh + ' L0 ' + rh + ' Z';
    var routeD = 'M' + line.map(function (p) { return p[0].toFixed(1) + ' ' + (p[1] - 4).toFixed(1); }).join(' L');
    var labels = pts.map(function (p, k) {
      var up = k % 2 === 0;
      var y = Y(p.h);
      return '<g class="pt" data-k="' + k + '"><circle cx="' + (p.x * rw) + '" cy="' + y + '" r="6"/>' +
        '<text x="' + (p.x * rw) + '" y="' + (up ? y - 34 : y - 20) + '" text-anchor="middle">' + p.name + '</text>' +
        '<text class="alt" x="' + (p.x * rw) + '" y="' + (up ? y - 18 : y - 4 - 0) + '" text-anchor="middle" dy="' + (up ? 0 : -0) + '">' + p.h + ' м</text></g>';
    }).join('');
    ridgeSvg.setAttribute('viewBox', '0 0 ' + rw + ' ' + rh);
    ridgeSvg.innerHTML = '<defs><linearGradient id="ridgeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f6aa8"/><stop offset="1" stop-color="#121a3a"/></linearGradient></defs>' +
      '<path class="ridge__fill" d="' + dFill + '"/><path class="ridge__line" d="' + dLine + '"/>' +
      '<path class="ridge__route" id="route" d="' + routeD + '"/>' + labels +
      '<circle class="ridge__hiker" id="hiker" r="8" cx="' + line[0][0] + '" cy="' + (line[0][1] - 4) + '"/>';
    var route = document.getElementById('route');
    var hiker = document.getElementById('hiker');
    var len = route.getTotalLength();
    route.style.strokeDasharray = '8 8';
    var ptEls = ridgeSvg.querySelectorAll('.pt');
    function place(p) {
      var q = route.getPointAtLength(len * p);
      hiker.setAttribute('cx', q.x);
      hiker.setAttribute('cy', q.y);
      route.style.strokeDashoffset = 0;
      route.style.clipPath = 'inset(0 ' + ((1 - q.x / rw) * 100).toFixed(2) + '% 0 0)';
      ptEls.forEach(function (el, k) { el.classList.toggle('is-hot', Math.abs(pts[k].x * rw - q.x) < 18); });
    }
    place(0);
    if (hasGsap) {
      var o = { p: 0 };
      gsap.to(o, {
        p: 1, ease: 'none',
        scrollTrigger: { trigger: '.ridge', start: 'top 75%', end: 'bottom 20%', scrub: 0.6 },
        onUpdate: function () { place(o.p); }
      });
    }
    document.querySelectorAll('#hillsTable tbody tr[data-k]').forEach(function (tr) {
      var k = parseInt(tr.getAttribute('data-k'), 10);
      tr.addEventListener('pointerenter', function () { if (ptEls[k]) ptEls[k].classList.add('is-hot'); });
      tr.addEventListener('pointerleave', function () { if (ptEls[k]) ptEls[k].classList.remove('is-hot'); });
    });
  }

  /* ---------- Висотомір ---------- */
  var alt = document.getElementById('altRange');
  if (alt) {
    var out = {
      v: document.getElementById('altValue'), n: document.getElementById('altName'),
      p: document.getElementById('altP'), t: document.getElementById('altT'), b: document.getElementById('altB'),
      mp: document.getElementById('meterP'), mt: document.getElementById('meterT'), mb: document.getElementById('meterB')
    };
    var marks = [
      [0, 'Рівень моря'], [2061, 'Говерла'], [4808, 'Монблан'], [5642, 'Ельбрус'],
      [5895, 'Кіліманджаро'], [6961, 'Аконкагуа'], [8000, 'Зона смерті'], [8849, 'Еверест']
    ];
    function zone(h) {
      if (h >= 8000) return 'Зона смерті';
      if (h >= 5500) return 'Екстремальна висота';
      if (h >= 3500) return 'Дуже велика висота';
      if (h >= 1500) return 'Велика висота';
      return 'Низькогір\'я';
    }
    function upd() {
      var h = parseInt(alt.value, 10);
      var near = null;
      marks.forEach(function (m) { if (Math.abs(m[0] - h) < 70) near = m; });
      if (near) { h = near[0]; }
      var p = Math.exp(-h / 8434) * 100;
      var t = 15 - 6.5 * h / 1000;
      var b = 100 - h / 300;
      out.v.innerHTML = h.toLocaleString('uk-UA') + '<small>М</small>';
      out.n.textContent = (near ? near[1] + ' · ' : '') + zone(h);
      out.p.textContent = Math.round(p) + ' %';
      out.t.textContent = (t > 0 ? '+' : '') + t.toFixed(1).replace('.', ',') + ' °C';
      out.b.textContent = b.toFixed(0) + ' °C';
      out.mp.style.transform = 'scaleX(' + (p / 100) + ')';
      out.mt.style.transform = 'scaleX(' + Math.max(0, (t + 45) / 60) + ')';
      out.mb.style.transform = 'scaleX(' + ((b - 60) / 40) + ')';
    }
    alt.addEventListener('input', upd);
    upd();
  }

  /* ---------- Чекліст спорядження ---------- */
  var checks = document.querySelectorAll('table.check input[type="checkbox"]');
  if (checks.length) {
    var KEY = 'vershyny-pack';
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { saved = {}; }
    var bar = document.getElementById('packBar');
    var pct = document.getElementById('packPct');
    function sync() {
      var done = 0;
      checks.forEach(function (c) { if (c.checked) done++; c.closest('tr').classList.toggle('is-done', c.checked); });
      var v = done / checks.length;
      bar.style.transform = 'scaleX(' + v + ')';
      pct.textContent = Math.round(v * 100) + '%';
    }
    checks.forEach(function (c) {
      if (saved[c.id]) c.checked = true;
      c.addEventListener('change', function () {
        saved[c.id] = c.checked;
        try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* приватний режим */ }
        sync();
        if (c.checked && hasGsap && !reduce) gsap.fromTo(c.nextElementSibling, { scale: 0.6 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, .4)' });
      });
    });
    sync();
  }

  if (!hasGsap) return;

  /* ---------- Плавне прокручування ---------- */
  var lenis = null;
  if (!reduce && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Завіса між сторінками ---------- */
  var curtain = document.querySelector('.curtain');
  var cSvg = curtain ? curtain.querySelector('svg') : null;
  var cLabel = curtain ? curtain.querySelector('.curtain__label') : null;
  function toBottom() {
    /* старт — у таборі Лукла: останній рядок маршруту по центру екрана */
    var rows = route.querySelectorAll('tr.camp');
    var lastRow = rows[rows.length - 1];
    var r = lastRow.getBoundingClientRect();
    var y = Math.max(0, r.top + window.scrollY + Math.min(r.height / 2, window.innerHeight * 0.35) - window.innerHeight / 2);
    window.scrollTo(0, y);
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
  }
  function reveal() {
    if (route) { toBottom(); setTimeout(toBottom, 60); }
    var start = route ? climbStart : intro;
    if (!curtain) { start(); return; }
    gsap.timeline()
      .set(cSvg, { yPercent: 0 })
      .to(cLabel, { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' }, 0)
      .to(cSvg, { yPercent: 100, duration: reduce ? 0.01 : 1.2, ease: 'expo.inOut' }, 0.1)
      .call(start, null, 0.55);
  }
  if (curtain) {
    document.querySelectorAll('a[href$=".html"]').forEach(function (a) {
      if (a.target === '_blank' || a.hostname !== window.location.hostname) return;
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        var href = a.getAttribute('href');
        cLabel.textContent = a.getAttribute('data-label') || a.textContent.trim();
        gsap.timeline()
          .set(cSvg, { yPercent: 100 })
          .set(cLabel, { opacity: 0, y: 30 })
          .to(cSvg, { yPercent: 0, duration: reduce ? 0.01 : 0.9, ease: 'expo.inOut' })
          .to(cLabel, { opacity: 1, y: 0, duration: 0.35 }, '-=0.35')
          .call(function () { window.location.href = href; }, null, '+=0.05');
      });
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) gsap.set(cSvg, { yPercent: 100 }); });
  }

  /* ---------- Поява заголовка ---------- */
  var title = document.querySelector('.hero__title');
  if (title) {
    var text = title.textContent.trim();
    title.setAttribute('aria-label', text);
    title.innerHTML = text.split('').map(function (c) {
      return '<span class="mask" aria-hidden="true"><span class="ch">' + (c === ' ' ? '&nbsp;' : c) + '</span></span>';
    }).join('');
    gsap.set(title.querySelectorAll('.ch'), { yPercent: 110 });
  }
  function intro() {
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    if (title) tl.to(title.querySelectorAll('.ch'), { yPercent: 0, duration: 1.6, stagger: 0.07 }, 0);
    tl.from('.hero__layer', { yPercent: function (i) { return 12 + i * 6; }, duration: 2.2, stagger: 0.08 }, 0)
      .from('.hero__sun', { yPercent: 60, opacity: 0, duration: 2.6 }, 0)
      .from('.hero__kicker, .hero__meta', { opacity: 0, y: 20, duration: 1.2, stagger: 0.15 }, 0.6);
  }
  reveal();

  /* ---------- Паралакс гір під час прокручування і руху миші ---------- */
  if (hero && !reduce) {
    var depth = { 1: 0.75, 2: 0.62, 3: 0.38, 4: 0.18, 5: 0.0 };
    var tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    hero.querySelectorAll('.hero__layer').forEach(function (l) {
      tl.to(l, { y: function () { return hero.offsetHeight * depth[l.getAttribute('data-layer')]; }, ease: 'none' }, 0);
    });
    tl.to('.hero__title', { y: function () { return hero.offsetHeight * 0.7; }, ease: 'none' }, 0)
      .to('.hero__sun', { yPercent: -70, scale: 1.25, ease: 'none' }, 0)
      .to(heroState, { stars: 0, ease: 'none' }, 0)
      .to(hero, { '--sky1': '#1b2a5c', '--sky2': '#3b4f93', '--sky3': '#7a76b8', '--sky4': '#ffb3a0', '--sky5': '#ffe2b8', ease: 'none' }, 0)
      .to('.hero__kicker, .hero__meta', { opacity: 0, ease: 'none' }, 0);

    var layers = Array.prototype.slice.call(hero.querySelectorAll('.hero__layer'));
    var movers = layers.map(function (l) { return gsap.quickTo(l, 'x', { duration: 1.2, ease: 'power3' }); });
    window.addEventListener('pointermove', function (e) {
      var m = e.clientX / window.innerWidth - 0.5;
      layers.forEach(function (l, i) { movers[i](-m * (8 + i * 14)); });
    }, { passive: true });
  }

  /* ---------- Поява вмісту ---------- */
  gsap.utils.toArray('.h2').forEach(function (h) {
    gsap.from(h, { yPercent: 40, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
  });
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    gsap.from(el, { y: 50, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
  gsap.utils.toArray('table.features').forEach(function (t) {
    gsap.from(t.querySelectorAll('td'), { y: 80, opacity: 0, rotateX: -25, transformOrigin: '50% 0', duration: 1.3, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: t, start: 'top 85%' } });
  });
  gsap.utils.toArray('table.data, table.zones, table.check').forEach(function (t) {
    gsap.from(t.querySelectorAll('tbody tr'), { opacity: 0, x: -40, duration: 0.9, ease: 'power3.out', stagger: 0.05, scrollTrigger: { trigger: t, start: 'top 85%' } });
  });
  document.querySelectorAll('.bar').forEach(function (b) {
    b.classList.add('is-off');
    ScrollTrigger.create({ trigger: b, start: 'top 95%', once: true, onEnter: function () { b.classList.remove('is-off'); } });
  });
  gsap.utils.toArray('.side-card').forEach(function (c, i) {
    gsap.from(c, { y: 60, opacity: 0, duration: 1.2, delay: i * 0.08, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 92%' } });
  });
  document.querySelectorAll('.count').forEach(function (el) {
    var to = parseFloat(el.getAttribute('data-to'));
    var o = { v: 0 };
    gsap.to(o, {
      v: to, duration: 2.2, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 92%' },
      onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString('uk-UA'); }
    });
  });

  /* ---------- Магнітні кнопки ---------- */
  if (window.matchMedia('(hover: hover)').matches && !reduce) {
    document.querySelectorAll('.btn').forEach(function (el) {
      var mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, .4)' });
      var my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, .4)' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.3);
        my((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('pointerleave', function () { mx(0); my(0); });
    });
  }


  /* ---------- Сходження: висота залежить від прокручування (знизу вгору) ---------- */
  function climbStart() {
    var hint = document.querySelector('.start-hint');
    var camps = Array.prototype.slice.call(route.querySelectorAll('tr.camp'));
    var list = document.getElementById('campList');
    var out = {
      now: document.getElementById('altNow'), name: document.getElementById('altName'),
      o2b: document.getElementById('o2Bar'), o2: document.getElementById('o2Out'),
      t: document.getElementById('tOut'), b: document.getElementById('bOut')
    };
    var centers = [];
    function measure() { centers = camps.map(function (tr) { var r = tr.getBoundingClientRect(); return r.top + window.scrollY + Math.min(r.height / 2, window.innerHeight * 0.35); }); }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    var lis = camps.map(function (tr, i) {
      var li = document.createElement('li');
      li.innerHTML = '<span>' + tr.getAttribute('data-name') + '</span><span>' + Number(tr.getAttribute('data-alt')).toLocaleString('uk-UA') + '</span>';
      li.addEventListener('click', function () {
        measure();
        var y = centers[i] - window.innerHeight / 2;
        if (window.__lenis) window.__lenis.scrollTo(y, { duration: 2.2 });
        else window.scrollTo({ top: y, behavior: 'smooth' });
      });
      list.appendChild(li);
      return li;
    });
    /* альпініст на лінії маршруту */
    var climber = document.createElement('div');
    climber.className = 'climber';
    climber.innerHTML = '<svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="13" fill="#0a0f24" stroke="#ffb86b" stroke-width="2"/><circle cx="15" cy="9" r="2.6" fill="#f2f4fb"/><path d="M15 12 L14 18 L11 23 M14 18 L17 23 M14 13 L19 16 M14 13 L10 16 M19 10 L21 24" stroke="#f2f4fb" stroke-width="1.8" fill="none" stroke-linecap="round"/><rect x="15" y="12" width="4" height="5" rx="1" fill="#ffb86b"/></svg>';
    document.body.appendChild(climber);
    /* сніг, що густішає з висотою */
    var sn = document.createElement('canvas');
    sn.className = 'snowfall';
    sn.setAttribute('aria-hidden', 'true');
    document.body.appendChild(sn);
    var sx = sn.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function ssize() { sn.width = window.innerWidth * dpr; sn.height = window.innerHeight * dpr; }
    ssize();
    window.addEventListener('resize', ssize);
    var flakes = [];
    for (var k = 0; k < 260; k++) flakes.push({ x: Math.random(), y: Math.random(), z: Math.random(), ph: Math.random() * 6.28 });

    var wind0 = 0;
    var shown = 2860;
    var last = -1;
    var lo = [20, 32, 69];
    var hi = [3, 4, 11];
    (function loop(now) {
      requestAnimationFrame(loop);
      var y = window.scrollY + window.innerHeight / 2;
      var h;
      if (y <= centers[0]) h = 8849;
      else if (y >= centers[centers.length - 1]) h = +camps[camps.length - 1].getAttribute('data-alt');
      else {
        for (var i = 0; i < centers.length - 1; i++) {
          if (y >= centers[i] && y < centers[i + 1]) {
            var t = (y - centers[i]) / (centers[i + 1] - centers[i]);
            var a0 = +camps[i].getAttribute('data-alt');
            var a1 = +camps[i + 1].getAttribute('data-alt');
            h = a0 + (a1 - a0) * t;
            break;
          }
        }
      }
      shown += (h - shown) * 0.12;
      var hv = Math.round(shown);
      if (hv !== last) {
        last = hv;
        out.now.textContent = hv.toLocaleString('uk-UA');
        var o2 = Math.exp(-hv / 8434) * 100;
        out.o2.textContent = Math.round(o2) + ' %';
        out.o2b.style.transform = 'scaleX(' + (o2 / 100) + ')';
        var tc = 15 - 6.5 * hv / 1000;
        out.t.textContent = (tc > 0 ? '+' : '−') + Math.abs(tc).toFixed(1).replace('.', ',') + ' °C';
        out.b.textContent = Math.round(100 - hv / 300) + ' °C';
        var near = 0;
        var best = 1e9;
        camps.forEach(function (tr, j) { var d = Math.abs(centers[j] - y); if (d < best) { best = d; near = j; } });
        camps.forEach(function (tr, j) { tr.classList.toggle('is-here', j === near); });
        lis.forEach(function (li, j) { li.classList.toggle('is-on', j === near); });
        out.name.textContent = hv > 8800 ? 'Вершина світу' : camps[near].getAttribute('data-name');
        var k2 = Math.max(0, Math.min(1, (hv - 2860) / (8849 - 2860)));
        document.body.style.backgroundColor = 'rgb(' + lo.map(function (c, m) { return Math.round(c + (hi[m] - c) * k2); }).join(',') + ')';
        if (hint && window.scrollY < document.documentElement.scrollHeight - window.innerHeight * 1.6) hint.classList.add('is-gone');
      }
      /* позиція альпініста */
      var td = camps[0].querySelector('td.camp__alt');
      var rr = td.getBoundingClientRect();
      climber.style.left = (rr.right - 1) + 'px';
      climber.style.top = (window.innerHeight / 2) + 'px';
      /* сніг */
      var dens = Math.max(0, Math.min(1, (shown - 3000) / 5800));
      sx.clearRect(0, 0, sn.width, sn.height);
      if (reduce || dens <= 0.02) return;
      var count = Math.round(flakes.length * dens);
      var wind = 0.4 + dens * 3.2 + wind0;
      sx.fillStyle = '#fff';
      for (var f = 0; f < count; f++) {
        var fl = flakes[f];
        fl.y += (0.0012 + fl.z * 0.0026);
        fl.x += (wind * (0.4 + fl.z) * 0.0009) + Math.sin(now / 900 + fl.ph) * 0.0004;
        if (fl.y > 1.02) { fl.y = -0.02; fl.x = Math.random(); }
        if (fl.x > 1.02) fl.x = -0.02;
        if (fl.x < -0.02) fl.x = 1.02;
        sx.globalAlpha = (0.25 + fl.z * 0.6) * Math.min(1, dens * 1.4);
        sx.beginPath();
        sx.arc(fl.x * sn.width, fl.y * sn.height, (0.6 + fl.z * 2.2) * dpr, 0, 6.283);
        sx.fill();
      }
      sx.globalAlpha = 1;
    })(0);
    window.addEventListener('pointermove', function (e) { wind0 = (e.clientX / window.innerWidth - 0.5) * 2; }, { passive: true });

    /* вершина: заголовок і прапор з'являються, коли ви дійшли до верху */
    if (hero) {
      var flag = document.createElement('div');
      flag.className = 'summit-flag';
      flag.setAttribute('aria-hidden', 'true');
      flag.innerHTML = '<svg viewBox="0 0 70 90"><path d="M4 90 V6" stroke="#f2f4fb" stroke-width="3"/><path class="cloth" d="M5 8 L62 14 L56 30 L64 44 L5 40 Z" fill="#ffb86b"/><path class="cloth" d="M5 22 L40 25" stroke="#ff8f8f" stroke-width="5"/></svg>';
      hero.appendChild(flag);
      var done = false;
      ScrollTrigger.create({
        trigger: hero, start: 'bottom 55%',
        onLeaveBack: function () {
          if (done) return;
          done = true;
          intro();
          gsap.to(flag, { scaleY: 1, duration: 1.2, ease: 'elastic.out(1, .5)', delay: 0.8 });
        }
      });
    }
    measure();
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
