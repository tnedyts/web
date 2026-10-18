/* =========================================================
   «Вишита сторінка» — сценарії
   1. Мотиви: ромб, зірка, хрест, дерево життя, безконечник, роги
   2. Малювання хрестиком на canvas (з анімацією «вишивання»)
   3. Смуги-орнаменти, сорочка, галерея, лайтбокс, конструктор
   4. Вікторина регіонів, відлік до Дня вишиванки, поява блоків
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var PALETTES = {
    kyiv: { bg: '#f3ede1', c: ['#c3202f', '#1b1b1b'], name: 'Київщина' },
    poltava: { bg: '#d8cdb6', c: ['#fffdf8', '#f6f0e2'], name: 'Полтавщина' },
    hutsul: { bg: '#f3ede1', c: ['#e8772e', '#2e7d4f', '#f2c230', '#c3202f', '#1b1b1b'], name: 'Гуцульщина' },
    bukovyna: { bg: '#f3ede1', c: ['#c3202f', '#2b4fa3', '#f2c230', '#2e7d4f', '#8e2c84'], name: 'Буковина' },
    volyn: { bg: '#f3ede1', c: ['#c3202f', '#22356b'], name: 'Волинь' },
    podillia: { bg: '#f1ebdf', c: ['#1b1b1b', '#7a1420'], name: 'Поділля' },
    polissia: { bg: '#f5f0e6', c: ['#c3202f', '#a01a26'], name: 'Полісся' }
  };

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ---------- 1. Мотиви: функція (dx, dy) → номер кольору або -1 ---------- */
  var HORN = ['.XXXX..', 'X....X.', 'X.XX..X', 'X.X.X.X', 'X..XX.X', '.X....X', '..XXXX.'];
  var MOTIFS = {
    rhomb: { w: 13, h: 13, f: function (x, y) {
      var d = Math.abs(x) + Math.abs(y);
      if (d > 6) return -1;
      if (d === 6 || d === 2) return 0;
      if (d === 4 && (x === 0 || y === 0 || Math.abs(x) === Math.abs(y))) return 1;
      if (d === 0) return 1;
      return -1;
    } },
    star: { w: 15, h: 15, f: function (x, y) {
      var ax = Math.abs(x), ay = Math.abs(y), m = Math.max(ax, ay);
      if (m > 7 || ax + ay > 10) return -1;
      var arm = ax <= 1 || ay <= 1 || Math.abs(ax - ay) <= 1;
      if (!arm) return -1;
      if (ax + ay <= 2) return 1;
      if (ax === ay && ax >= 2 && ax <= 3) return -1;
      if (m >= 6) return 1;
      return 0;
    } },
    cross: { w: 13, h: 13, f: function (x, y) {
      var ax = Math.abs(x), ay = Math.abs(y);
      if (ax + ay === 0) return 1;
      if ((ax <= 1 && ay <= 6) || (ay <= 1 && ax <= 6)) return (ax === 0 || ay === 0) && Math.max(ax, ay) % 2 === 0 ? 1 : 0;
      if (Math.abs(ax - 4) + Math.abs(ay - 4) <= 1) return 1;
      return -1;
    } },
    tree: { w: 15, h: 17, f: function (x, y) {
      var ax = Math.abs(x);
      if (x === 0 && y >= -6 && y <= 8) return 0;
      var levels = [-3, 1, 5];
      for (var i = 0; i < levels.length; i++) {
        var lv = levels[i], len = 6 - i;
        if (ax >= 1 && ax <= len - 1 && y === lv - ax) return 0;
        if (Math.abs(ax - len) + Math.abs(y - (lv - len)) <= 1) return 1;
      }
      if (Math.abs(x) + Math.abs(y + 8) <= 1) return 1;
      if (y === 8 && ax <= 3) return 0;
      return -1;
    } },
    wave: { w: 16, h: 9, f: function (x, y) {
      var px = ((x + 8) % 8 + 8) % 8, tri = px < 4 ? px : 8 - px;
      if (y === tri - 2) return 0;
      if (y === tri + 1 && px % 2 === 0) return 1;
      if (Math.abs(y) === 4) return 1;
      return -1;
    } },
    horns: { w: 17, h: 9, f: function (x, y) {
      if (x === 0) return Math.abs(y) <= 3 ? 1 : -1;
      // ліва половина — дзеркальне відображення правої
      var ax = Math.abs(x), gx = ax - 2, gy = y + 3;
      if (gx < 0 || gx > 6 || gy < 0 || gy > 6) return Math.abs(y) === 4 && ax % 2 === 0 ? 1 : -1;
      return HORN[gy][gx] === 'X' ? 0 : -1;
    } }
  };

  // восьмикратно симетрична «ружа» для конструктора
  function randomRose(seed, density) {
    var R = rng(seed), half = 10, grid = {};
    for (var y = 0; y <= half; y++) {
      for (var x = y; x <= half; x++) {
        if (x * x + y * y > half * half + 4) continue;
        var near = 1 - Math.hypot(x, y) / (half + 2);
        if (R() < density * (0.55 + near * 0.6)) {
          var c = Math.floor(Math.hypot(x, y) / 3.2 + R() * 1.2);
          [[x, y], [y, x], [-x, y], [-y, x], [x, -y], [y, -x], [-x, -y], [-y, -x]].forEach(function (p) { grid[p[0] + ',' + p[1]] = c; });
        }
      }
    }
    return { w: 21, h: 21, f: function (a, b) { var v = grid[a + ',' + b]; return v === undefined ? -1 : v; } };
  }

  /* ---------- 2. Хрестик ---------- */
  function shade(hex, k) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255;
    r = Math.max(0, Math.min(255, Math.round(r * k))); g = Math.max(0, Math.min(255, Math.round(g * k))); b = Math.max(0, Math.min(255, Math.round(b * k)));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  function linen(ctx, w, h, bg, s) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(80,60,30,.09)';
    for (var y = 0; y < h; y += s) for (var x = 0; x < w; x += s) ctx.fillRect(x - .6, y - .6, 1.2, 1.2);
  }
  function stitch(ctx, x, y, s, color, white) {
    var p = s * 0.16;
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(1.2, s * 0.3);
    if (white) { ctx.shadowColor = 'rgba(70,52,25,.6)'; ctx.shadowBlur = Math.max(1.5, s * 0.3); }
    ctx.strokeStyle = shade(color, white ? 0.93 : 0.82);
    ctx.beginPath(); ctx.moveTo(x + p, y + s - p); ctx.lineTo(x + s - p, y + p); ctx.stroke();
    ctx.strokeStyle = color;
    ctx.beginPath(); ctx.moveTo(x + p, y + p); ctx.lineTo(x + s - p, y + s - p); ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // збирає список стібків для композиції: смуга мотивів з бордюрами
  function composeBand(W, H, s, motif, pal, seed) {
    var cols = Math.floor(W / s), rows = Math.floor(H / s);
    var cells = [], m = MOTIFS[motif] || motif;
    var colors = pal.c, R = rng(seed || 1);
    var shift = Math.floor(R() * colors.length);
    // бордюри зверху й знизу
    for (var cx = 0; cx < cols; cx++) {
      var t = cx % 4, zz = t < 2 ? t : 4 - t;
      cells.push([cx, 1 + zz, colors[(1 + shift) % colors.length]]);
      cells.push([cx, rows - 2 - zz, colors[(1 + shift) % colors.length]]);
    }
    // безконечник — суцільна хвиля через усю смугу
    if (motif === 'wave') {
      var wy = Math.floor(rows / 2);
      for (var wx = 2; wx < cols - 2; wx++) {
        var ph = wx % 8, tr = ph < 4 ? ph : 8 - ph;
        cells.push([wx, wy + tr - 2, colors[shift % colors.length]]);
        if (ph === 0) cells.push([wx, wy + 1, colors[(1 + shift) % colors.length]]);
        if (ph === 4) cells.push([wx, wy - 2, colors[(1 + shift) % colors.length]]);
        if (wx % 3 === 0) { cells.push([wx, wy - 5, colors[(1 + shift) % colors.length]]); cells.push([wx, wy + 4, colors[(1 + shift) % colors.length]]); }
      }
      return { cells: cells, ox: Math.floor((W - cols * s) / 2), oy: Math.floor((H - rows * s) / 2) };
    }
    // мотиви по центру
    var gap = 3, mw = m.w, mh = m.h;
    var count = Math.max(1, Math.floor((cols - gap) / (mw + gap)));
    var startX = Math.floor((cols - count * (mw + gap) + gap) / 2);
    var cy = Math.floor(rows / 2);
    for (var k = 0; k < count; k++) {
      var ox = startX + k * (mw + gap) + Math.floor(mw / 2);
      for (var dy = -Math.floor(mh / 2); dy <= Math.floor(mh / 2); dy++) {
        for (var dx = -Math.floor(mw / 2); dx <= Math.floor(mw / 2); dx++) {
          var v = m.f(dx, dy);
          if (v >= 0 && cy + dy > 4 && cy + dy < rows - 5) cells.push([ox + dx, cy + dy, colors[(v + shift + (k % 2 && colors.length > 2 ? 2 : 0)) % colors.length]]);
        }
      }
      // ромбики між мотивами
      if (k < count - 1) {
        var bx = ox + Math.floor(mw / 2) + Math.ceil(gap / 2);
        [[0, -1], [-1, 0], [1, 0], [0, 1]].forEach(function (d) { cells.push([bx + d[0], cy + d[1], colors[shift % colors.length]]); });
      }
    }
    return { cells: cells, ox: Math.floor((W - cols * s) / 2), oy: Math.floor((H - rows * s) / 2) };
  }

  function composeSingle(W, H, s, m, pal, shift) {
    var cells = [], colors = pal.c;
    var cx = Math.floor(W / s / 2), cy = Math.floor(H / s / 2);
    for (var dy = -Math.floor(m.h / 2); dy <= Math.floor(m.h / 2); dy++) {
      for (var dx = -Math.floor(m.w / 2); dx <= Math.floor(m.w / 2); dx++) {
        var v = m.f(dx, dy);
        if (v >= 0) cells.push([cx + dx, cy + dy, colors[(v + (shift || 0)) % colors.length]]);
      }
    }
    return { cells: cells, ox: Math.floor((W - Math.floor(W / s) * s) / 2), oy: Math.floor((H - Math.floor(H / s) * s) / 2) };
  }

  // малює стібки; якщо duration > 0 — поступово, «вишиваючи»
  function render(canvas, comp, s, pal, duration, done) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height, white = pal === PALETTES.poltava;
    if (canvas._raf) cancelAnimationFrame(canvas._raf);
    linen(ctx, W, H, pal.bg, s);
    ctx.save();
    ctx.translate(comp.ox, comp.oy);
    var cells = comp.cells;
    if (!duration || reduce) {
      cells.forEach(function (c) { stitch(ctx, c[0] * s, c[1] * s, s, c[2], white); });
      ctx.restore();
      if (done) done();
      return;
    }
    ctx.restore();
    var i = 0, t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var target = Math.min(cells.length, Math.ceil((t - t0) / duration * cells.length));
      ctx.save();
      ctx.translate(comp.ox, comp.oy);
      for (; i < target; i++) stitch(ctx, cells[i][0] * s, cells[i][1] * s, s, cells[i][2], white);
      ctx.restore();
      if (i < cells.length) canvas._raf = requestAnimationFrame(frame);
      else if (done) done();
    }
    canvas._raf = requestAnimationFrame(frame);
  }

  function orderFromCenter(comp, W, H, s) {
    var cx = W / s / 2, cy = H / s / 2;
    comp.cells.sort(function (a, b) {
      return Math.hypot(a[0] - cx, a[1] - cy) - Math.hypot(b[0] - cx, b[1] - cy) || Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx);
    });
    return comp;
  }

  /* ---------- 3. Елементи сторінки ---------- */
  // смуги в шапці й підвалі
  function drawBands() {
    document.querySelectorAll('canvas.band, canvas.nav__thread').forEach(function (cv) {
      var vertical = cv.classList.contains('nav__thread');
      var rect = cv.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      cv.width = Math.round(rect.width); cv.height = Math.round(rect.height);
      var s = 6, pal = { bg: vertical ? '#f7f3ec' : '#f3ede1', c: ['#c3202f', '#1b1b1b'] };
      var ctx = cv.getContext('2d');
      linen(ctx, cv.width, cv.height, pal.bg, s);
      var cols = Math.floor(cv.width / s), rows = Math.floor(cv.height / s);
      if (vertical) {
        for (var y = 0; y < rows; y++) {
          var k = y % 12, ax = k < 6 ? k : 12 - k, mid = Math.floor(cols / 2);
          stitch(ctx, (mid + Math.round(ax / 2) - 1) * s, y * s, s, '#c3202f');
          stitch(ctx, (mid - Math.round(ax / 2) + 1) * s, y * s, s, '#c3202f');
          if (y % 12 === 0) stitch(ctx, mid * s, y * s, s, '#1b1b1b');
        }
      } else {
        for (var x = 0; x < cols; x++) {
          var t = x % 8, z = t < 4 ? t : 8 - t;
          if (rows > 4) stitch(ctx, x * s, (rows - 1 - z) * s, s, '#c3202f');
          if (x % 8 === 4) stitch(ctx, x * s, (rows - 5 > 0 ? rows - 5 : 0) * s, s, '#1b1b1b');
        }
      }
    });
  }
  drawBands();
  var resizeT;
  window.addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(drawBands, 200); });

  // логотип
  var logo = document.querySelector('.logo-stitch');
  if (logo) render(logo, composeSingle(48, 48, 4, MOTIFS.star, { c: ['#c3202f', '#1b1b1b'] }, 0), 3, { bg: '#f7f3ec', c: ['#c3202f', '#1b1b1b'] }, 0);

  // малі полотна: вишиваються, коли з'являються на екрані
  function drawMini(cv, animate) {
    var pal = PALETTES[cv.getAttribute('data-palette')] || PALETTES.kyiv;
    var motif = cv.getAttribute('data-motif');
    var s, comp;
    if (cv.classList.contains('mini--sym') && motif !== 'wave') {
      s = 7;
      comp = composeSingle(cv.width, cv.height, s, MOTIFS[motif], pal, 0);
    } else {
      s = Math.max(3, Math.min(cv.width >= 200 ? 6 : 5, Math.floor(cv.height / ((MOTIFS[motif] || MOTIFS.rhomb).h + 12))));
      comp = composeBand(cv.width, cv.height, s, motif, pal, +cv.getAttribute('data-seed') || 3);
    }
    orderFromCenter(comp, cv.width, cv.height, s);
    render(cv, comp, s, pal, animate ? 900 : 0);
  }
  var minis = document.querySelectorAll('canvas.mini');
  var mio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      drawMini(e.target, true);
      mio.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  minis.forEach(function (cv) {
    var pal = PALETTES[cv.getAttribute('data-palette')] || PALETTES.kyiv;
    linen(cv.getContext('2d'), cv.width, cv.height, pal.bg, 5);
    mio.observe(cv);
  });

  // рядки таблиці регіонів вишиваються наново при наведенні
  document.querySelectorAll('tr.region').forEach(function (tr) {
    var cv = tr.querySelector('canvas');
    var sw = tr.querySelector('[data-swatches]');
    var pal = PALETTES[tr.getAttribute('data-palette')];
    sw.innerHTML = pal.c.map(function (c) { return '<span class="sw" style="background:' + c + '"></span>'; }).join('');
    tr.addEventListener('mouseenter', function () { drawMini(cv, true); });
  });

  // велика зірка на головній, що вишивається по колу
  function heroLoop(cv, motifs, pals) {
    var n = 0;
    function next() {
      var m = motifs[n % motifs.length], pal = PALETTES[pals[n % pals.length]];
      var s = Math.floor(cv.width / 26);
      var comp = orderFromCenter(composeSingle(cv.width, cv.height, s, MOTIFS[m] || m, pal, 0), cv.width, cv.height, s);
      render(cv, comp, s, pal, 4200, function () { n++; if (!reduce) setTimeout(next, 2600); });
    }
    next();
  }
  var hs = document.getElementById('heroStitch');
  if (hs) heroLoop(hs, ['star', 'rhomb', 'cross'], ['kyiv', 'hutsul', 'podillia']);
  var as = document.getElementById('authorStitch');
  if (as) heroLoop(as, [randomRose(7, .5), randomRose(19, .55)], ['bukovyna', 'kyiv']);

  // банери з трьома смугами
  [['regionsBand', [['star', 'hutsul'], ['cross', 'volyn'], ['rhomb', 'polissia']]],
   ['symbolsBand', [['tree', 'podillia'], ['horns', 'hutsul'], ['wave', 'kyiv']]],
   ['galleryBand', [['rhomb', 'bukovyna'], ['star', 'kyiv'], ['tree', 'volyn']]]].forEach(function (cfg) {
    var cv = document.getElementById(cfg[0]);
    if (!cv) return;
    var ctx = cv.getContext('2d'), W = cv.width, H = cv.height, s = 4, h3 = Math.floor(H / 3);
    linen(ctx, W, H, '#f3ede1', s);
    cfg[1].forEach(function (b, i) {
      var pal = PALETTES[b[1]];
      var comp = composeBand(W, h3, s, b[0], pal, i + 2);
      comp.oy += i * h3;
      var cells = comp.cells.slice().sort(function (a, c) { return a[0] - c[0]; });
      var k = 0;
      var go = function () {
        var step = reduce ? cells.length : 14;
        ctx.save(); ctx.translate(comp.ox, comp.oy);
        for (var e = 0; e < step && k < cells.length; e++, k++) stitch(ctx, cells[k][0] * s, cells[k][1] * s, s, cells[k][2], b[1] === 'poltava');
        ctx.restore();
        if (k < cells.length) requestAnimationFrame(go);
      };
      setTimeout(go, i * 500);
    });
  });

  // сорочка на головній
  var shirt = document.getElementById('shirt');
  if (shirt) {
    var sc = shirt.getContext('2d');
    sc.fillStyle = '#fbf8f2';
    sc.strokeStyle = '#cfc4ad';
    sc.lineWidth = 2;
    sc.beginPath();
    sc.moveTo(95, 20); sc.lineTo(165, 20); sc.lineTo(250, 70); sc.lineTo(232, 150); sc.lineTo(200, 130);
    sc.lineTo(200, 290); sc.lineTo(60, 290); sc.lineTo(60, 130); sc.lineTo(28, 150); sc.lineTo(10, 70); sc.closePath();
    sc.fill(); sc.stroke();
    sc.beginPath(); sc.moveTo(110, 20); sc.quadraticCurveTo(130, 40, 150, 20); sc.stroke();
    var pal = PALETTES.kyiv, s = 4;
    function band(x0, y0, len, horizontal, offset) {
      for (var i = 0; i < len; i++) {
        var t = (i + offset) % 6, z = t < 3 ? t : 6 - t;
        var x = horizontal ? x0 + i * s : x0 + z * s, y = horizontal ? y0 + z * s : y0 + i * s;
        stitch(sc, x, y, s, i % 6 === 3 ? pal.c[1] : pal.c[0]);
      }
    }
    var sleeveBands = [[30, 92], [216, 92]];
    sleeveBands.forEach(function (p, j) {
      for (var r = 0; r < 3; r++) for (var i = 0; i < 4; i++) stitch(sc, p[0] - (j ? 0 : 0) + i * s, p[1] + r * 10, s, r === 1 ? pal.c[1] : pal.c[0]);
    });
    band(122, 34, 30, false, 0);
    band(66, 268, 32, true, 0);
    band(104, 24, 13, true, 3);
  }

  /* ---------- галерея, лайтбокс, конструктор ---------- */
  var lb = document.getElementById('lightbox');
  var lbCanvas = document.getElementById('lbCanvas');
  var lbCap = document.getElementById('lbCap');
  document.querySelectorAll('.g__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pal = PALETTES[btn.getAttribute('data-palette')];
      var comp = composeBand(lbCanvas.width, lbCanvas.height, 12, btn.getAttribute('data-motif'), pal, 5);
      orderFromCenter(comp, lbCanvas.width, lbCanvas.height, 12);
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      lbCap.textContent = btn.getAttribute('data-title') + ' — у дусі вишивки: ' + pal.name;
      render(lbCanvas, comp, 12, pal, 1600);
      lb.querySelector('.lightbox__close').focus();
    });
  });
  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; }
  if (lb) {
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('.lightbox__close')) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });
  }

  var maker = document.getElementById('makerCanvas');
  if (maker) {
    var pals = document.getElementById('makerPals'), dens = document.getElementById('density');
    var densOut = document.getElementById('densOut'), seedOut = document.getElementById('makerSeed');
    var cur = 'hutsul', seed = 1 + Math.floor(Math.random() * 999);
    Object.keys(PALETTES).forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pal' + (k === cur ? ' is-on' : '');
      b.setAttribute('aria-pressed', k === cur ? 'true' : 'false');
      b.innerHTML = PALETTES[k].c.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '<span>' + PALETTES[k].name + '</span>';
      b.addEventListener('click', function () {
        cur = k;
        pals.querySelectorAll('.pal').forEach(function (x) { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        draw(400);
      });
      pals.appendChild(b);
    });
    var draw = function (dur) {
      var pal = PALETTES[cur], s = 18;
      var comp = orderFromCenter(composeSingle(maker.width, maker.height, s, randomRose(seed, dens.value / 100), pal, 0), maker.width, maker.height, s);
      render(maker, comp, s, pal, dur);
      seedOut.textContent = seed;
      densOut.textContent = dens.value;
    };
    dens.addEventListener('input', function () { draw(0); });
    document.getElementById('makerNew').addEventListener('click', function () { seed = 1 + Math.floor(Math.random() * 9999); draw(1400); });
    draw(1400);
  }

  /* ---------- 4. Вікторина ---------- */
  var quiz = document.getElementById('quizCanvas');
  if (quiz) {
    var keys = Object.keys(PALETTES), opts = document.getElementById('quizOpts'), res = document.getElementById('quizRes');
    var score = 0, total = 0, answer;
    var motifs = ['rhomb', 'star', 'cross', 'tree'];
    var ask = function () {
      answer = keys[Math.floor(Math.random() * keys.length)];
      var pal = PALETTES[answer];
      var comp = orderFromCenter(composeBand(quiz.width, quiz.height, 7, motifs[Math.floor(Math.random() * 4)], pal, total + 1), quiz.width, quiz.height, 7);
      render(quiz, comp, 7, pal, 800);
      var choices = [answer];
      while (choices.length < 3) { var k = keys[Math.floor(Math.random() * keys.length)]; if (choices.indexOf(k) < 0) choices.push(k); }
      choices.sort(function () { return Math.random() - .5; });
      opts.innerHTML = '';
      res.textContent = '';
      choices.forEach(function (k) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'opt'; b.textContent = PALETTES[k].name;
        b.addEventListener('click', function () {
          if (opts.dataset.done) return;
          opts.dataset.done = '1';
          total++;
          if (k === answer) { score++; b.classList.add('is-right'); res.textContent = 'Так! Це кольори краю «' + PALETTES[answer].name + '».'; }
          else {
            b.classList.add('is-wrong');
            opts.querySelectorAll('.opt').forEach(function (o) { if (o.textContent === PALETTES[answer].name) o.classList.add('is-right'); });
            res.textContent = 'Ні, це ' + PALETTES[answer].name + '.';
          }
          document.getElementById('quizScore').textContent = score;
          document.getElementById('quizTotal').textContent = total;
          setTimeout(function () { delete opts.dataset.done; ask(); }, 1800);
        });
        opts.appendChild(b);
      });
    };
    ask();
  }

  /* ---------- відлік до Дня вишиванки ---------- */
  function thirdThursday(year) {
    var d = new Date(year, 4, 1);
    var add = (4 - d.getDay() + 7) % 7;
    return new Date(year, 4, 1 + add + 14);
  }
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var day = thirdThursday(today.getFullYear());
  if (day < today) day = thirdThursday(today.getFullYear() + 1);
  var days = Math.round((day - today) / 86400000);
  var months = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
  function plural(n) {
    var a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return 'день';
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return 'дні';
    return 'днів';
  }
  var txt = days === 0 ? 'сьогодні!' : days + ' ' + plural(days);
  document.querySelectorAll('[data-days]').forEach(function (el) { el.textContent = txt; });
  document.querySelectorAll('[data-days-big]').forEach(function (el) { el.textContent = txt; });
  document.querySelectorAll('[data-day-date]').forEach(function (el) { el.textContent = 'Найближчий: ' + day.getDate() + ' ' + months[day.getMonth()] + ' ' + day.getFullYear() + ' року'; });

  /* ---------- поява блоків і кнопка «нагору» ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 0.08 + 's'; io.observe(el); });
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-top]')) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }
  });
})();
