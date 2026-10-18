/* =========================================================
   «Зелений підвіконник» — сценарії
   1. Малювання рослин у SVG (кожен вид — своя функція)
   2. «Проростання» рослин і поява блоків під час прокручування
   3. Вибір сторони світу, календар догляду, шапка
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) document.documentElement.classList.add('no-anim');

  /* ---------- допоміжні функції ---------- */
  function rng(seed) { // детермінований генератор випадкових чисел (mulberry32)
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function shade(hex, pct) {
    var n = parseInt(hex.slice(1), 16);
    var r = n >> 16, g = n >> 8 & 255, b = n & 255;
    var f = pct < 0 ? 0 : 255, p = Math.abs(pct) / 100;
    r = Math.round((f - r) * p + r); g = Math.round((f - g) * p + g); b = Math.round((f - b) * p + b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function f(n) { return Math.round(n * 10) / 10; }

  var uid = 0;

  function leafShape(kind, L, W) {
    if (kind === 'heart') {
      return 'M0 0 C' + f(-W * .35) + ' ' + f(-W * 1.15) + ' ' + f(L * .62) + ' ' + f(-W * 1.15) + ' ' + L + ' 0 C' +
        f(L * .62) + ' ' + f(W * 1.15) + ' ' + f(-W * .35) + ' ' + f(W * 1.15) + ' 0 0Z';
    }
    if (kind === 'lance') {
      return 'M0 0 C' + f(L * .3) + ' ' + (-W) + ' ' + f(L * .7) + ' ' + f(-W * .6) + ' ' + L + ' 0 C' +
        f(L * .7) + ' ' + f(W * .6) + ' ' + f(L * .3) + ' ' + W + ' 0 0Z';
    }
    return 'M0 0 C' + f(L * .25) + ' ' + (-W) + ' ' + f(L * .75) + ' ' + (-W) + ' ' + L + ' 0 C' +
      f(L * .75) + ' ' + W + ' ' + f(L * .25) + ' ' + W + ' 0 0Z';
  }

  function leaf(x, y, angle, kind, L, W, color, delay, extra) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(angle) + ')">' +
      '<g class="grow" style="--d:' + delay.toFixed(2) + 's">' +
      '<path d="' + leafShape(kind, L, W) + '" fill="' + color + '"' + (extra || '') + '/>' +
      '<path d="M2 0 L' + f(L * .9) + ' 0" stroke="rgba(255,255,255,.35)" stroke-width="1.2" fill="none"/>' +
      '</g></g>';
  }

  function stem(d, color, width, delay) {
    return '<path class="stem" pathLength="1" d="' + d + '" stroke="' + color + '" stroke-width="' + width +
      '" stroke-linecap="round" fill="none" style="--d:' + delay.toFixed(2) + 's"/>';
  }

  function pot(color) {
    var dark = shade(color, -18), light = shade(color, 22);
    return '<ellipse cx="100" cy="163" rx="54" ry="6" fill="#4a3527"/>' +
      '<path d="M46 176 L60 232 Q100 238 140 232 L154 176Z" fill="' + color + '" stroke="rgba(31,61,43,.18)"/>' +
      '<path d="M56 182 L66 226" stroke="' + light + '" stroke-width="5" stroke-linecap="round" opacity=".55"/>' +
      '<rect x="40" y="159" width="120" height="19" rx="5" fill="' + dark + '" stroke="rgba(31,61,43,.18)"/>' +
      '<rect x="44" y="161" width="112" height="4" rx="2" fill="' + light + '" opacity=".45"/>';
  }

  /* ---------- види рослин ---------- */
  var PLANTS = {
    monstera: function (id) {
      var L = 64, W = 36, out = '';
      var slits = '';
      [.3, .48, .66, .82].forEach(function (t) {
        slits += '<path d="M' + f(L * t - 4) + ' ' + f(-W * 1.4) + ' L' + f(L * t + 3) + ' ' + f(-W * .32) + '" />';
        slits += '<path d="M' + f(L * t - 4) + ' ' + f(W * 1.4) + ' L' + f(L * t + 3) + ' ' + f(W * .32) + '" />';
      });
      var defs = '<defs><mask id="ms' + id + '" maskUnits="userSpaceOnUse" x="-60" y="-80" width="160" height="160">' +
        '<rect x="-60" y="-80" width="160" height="160" fill="#fff"/>' +
        '<g stroke="#000" stroke-width="4.5" stroke-linecap="round">' + slits + '</g>' +
        '<ellipse cx="' + f(L * .4) + '" cy="-9" rx="4" ry="2.4" fill="#000"/><ellipse cx="' + f(L * .58) + '" cy="9" rx="4" ry="2.4" fill="#000"/>' +
        '</mask></defs>';
      var spots = [[100, 168, 62, 106, -155, .8], [100, 168, 138, 106, -25, .8], [100, 168, 78, 66, -120, .9], [100, 168, 124, 64, -60, .9], [100, 168, 100, 74, -90, .78]];
      var stems = '', leaves = '';
      spots.forEach(function (s, i) {
        var d = 'M' + s[0] + ' ' + s[1] + ' Q' + f((s[0] + s[2]) / 2) + ' ' + f(s[1] - 40) + ' ' + s[2] + ' ' + s[3];
        stems += stem(d, '#4a7a3c', 3.5, i * .15);
        var col = i % 2 ? '#2f6b3a' : '#3d7f45';
        leaves += '<g transform="translate(' + s[2] + ' ' + s[3] + ') rotate(' + s[4] + ') scale(' + s[5] + ')"><g class="grow" style="--d:' + (i * .15).toFixed(2) + 's">' +
          '<path d="' + leafShape('heart', L, W) + '" fill="' + col + '" mask="url(#ms' + id + ')"/>' +
          '<path d="M2 0 L' + f(L * .92) + ' 0" stroke="#9cc98a" stroke-width="1.4" fill="none"/></g></g>';
      });
      return defs + '<g class="sway">' + stems + leaves + '</g>';
    },

    sansevieria: function (id) {
      var r = rng(7), out = '';
      var defs = '<defs><pattern id="bands' + id + '" width="24" height="11" patternUnits="userSpaceOnUse">' +
        '<rect width="24" height="11" fill="#4c7d45"/><path d="M0 4 Q6 1 12 4 T24 4 V7 Q18 9 12 7 T0 7Z" fill="#2c5230"/></pattern></defs>';
      for (var i = 0; i < 7; i++) {
        var x = 66 + i * 11, h = 95 + r() * 55 - Math.abs(i - 3) * 9, a = (i - 3) * 5 + (r() - .5) * 6;
        out += '<g transform="translate(' + f(x) + ' 168) rotate(' + f(a) + ')"><g class="grow" style="--d:' + (i * .1).toFixed(2) + 's">' +
          '<path d="M-8 0 Q-12 ' + f(-h * .5) + ' 0 ' + f(-h) + ' Q12 ' + f(-h * .5) + ' 8 0Z" fill="url(#bands' + id + ')" stroke="#cfc96a" stroke-width="1.6"/></g></g>';
      }
      return defs + '<g class="sway">' + out + '</g>';
    },

    zamioculcas: function () {
      var out = '';
      [[-38, 105], [-14, 128], [12, 120], [36, 100]].forEach(function (s, i) {
        var a = s[0], len = s[1];
        var g = '<g transform="translate(100 168) rotate(' + a + ')">' + stem('M0 0 Q4 ' + f(-len * .5) + ' 0 ' + (-len), '#5f7f3b', 4.5, i * .12);
        for (var k = 0; k < 5; k++) {
          var t = .38 + k * .14, y = -len * t, size = 1 - k * .08;
          g += leaf(-1, y, -142, 'oval', 24 * size, 8 * size, '#2e6436', i * .12 + k * .06);
          g += leaf(1, y, -38, 'oval', 24 * size, 8 * size, '#3a7442', i * .12 + k * .06);
        }
        g += leaf(0, -len, -90, 'oval', 22, 8, '#3a7442', i * .12 + .4);
        out += g + '</g>';
      });
      return '<g class="sway">' + out + '</g>';
    },

    chlorophytum: function () {
      var r = rng(3), out = '';
      for (var i = 0; i < 15; i++) {
        var side = i % 2 ? 1 : -1, spread = 12 + r() * 72, h = 40 + r() * 55;
        var ex = 100 + side * spread, ey = 168 - h + spread * .55;
        var d = 'M' + f(100 + side * 3) + ' 166 Q' + f(100 + side * spread * .3) + ' ' + f(168 - h * 1.25) + ' ' + f(ex) + ' ' + f(ey);
        out += stem(d, '#5c9a4c', 7, i * .05);
        out += '<path class="stem" pathLength="1" d="' + d + '" stroke="#f3f6e4" stroke-width="2" fill="none" stroke-linecap="round" style="--d:' + (i * .05 + .2).toFixed(2) + 's"/>';
      }
      // вус з «дитинкою»
      out += stem('M110 160 Q160 120 172 150', '#9db46e', 2, .7);
      for (var j = 0; j < 6; j++) out += leaf(172, 150, -150 + j * 24, 'lance', 14, 3, '#6aa654', .9 + j * .05);
      return '<g class="sway">' + out + '</g>';
    },

    spathiphyllum: function () {
      var out = '';
      [[-55, 70], [-30, 88], [-8, 96], [14, 90], [38, 84], [58, 66], [-75, 52]].forEach(function (s, i) {
        var a = s[0] - 90, len = s[1];
        var rad = a * Math.PI / 180;
        var x = 100 + Math.cos(rad) * len * .55, y = 168 + Math.sin(rad) * len * .55;
        out += stem('M100 168 L' + f(x) + ' ' + f(y), '#3c7a44', 3, i * .1);
        out += leaf(x, y, a, 'lance', len * .62, 13, i % 2 ? '#2b6236' : '#357442', i * .1 + .1);
      });
      [[78, 52, -8], [126, 64, 10]].forEach(function (s, i) {
        out += stem('M100 166 Q' + (s[0] + 6) + ' 120 ' + s[0] + ' ' + s[1], '#5c9a52', 2.5, .5 + i * .2);
        out += '<g transform="translate(' + s[0] + ' ' + s[1] + ') rotate(' + s[2] + ')"><g class="grow" style="--d:' + (.9 + i * .2) + 's">' +
          '<path d="M0 6 C-16 -6 -12 -34 0 -46 C12 -34 16 -6 0 6Z" fill="#fbfaf3" stroke="#d9dccb"/>' +
          '<rect x="-3" y="-30" width="6" height="22" rx="3" fill="#e9d98a"/></g></g>';
      });
      return '<g class="sway">' + out + '</g>';
    },

    pothos: function (id, front) {
      var out = '', vines = '';
      // кілька листків угору
      [[-130, 60], [-95, 52], [-60, 62]].forEach(function (s, i) {
        var rad = s[0] * Math.PI / 180;
        var x = 100 + Math.cos(rad) * s[1], y = 166 + Math.sin(rad) * s[1];
        out += stem('M100 166 Q100 140 ' + f(x) + ' ' + f(y), '#6c9a3e', 2.5, i * .12);
        out += leaf(x, y, s[0] + 10, 'heart', 30, 15, i === 1 ? '#5f9a46' : '#4f8a3c', i * .12 + .1);
      });
      // ліани, що звисають з горщика
      [[1, 'M150 166 C185 160 182 205 172 238'], [-1, 'M52 166 C20 165 22 200 30 236']].forEach(function (v, k) {
        vines += stem(v[1], '#6c9a3e', 2.4, .3 + k * .2);
        var p = v[1].match(/-?\d+(\.\d+)?/g).map(Number);
        for (var j = 1; j <= 4; j++) {
          var t = j / 4.6, mt = 1 - t;
          var x = mt * mt * mt * p[0] + 3 * mt * mt * t * p[2] + 3 * mt * t * t * p[4] + t * t * t * p[6];
          var y = mt * mt * mt * p[1] + 3 * mt * mt * t * p[3] + 3 * mt * t * t * p[5] + t * t * t * p[7];
          vines += leaf(x, y, v[0] > 0 ? (j % 2 ? 20 : 120) : (j % 2 ? 160 : 60), 'heart', 20, 10, j % 2 ? '#5f9a46' : '#7bb257', .5 + k * .2 + j * .12,
            ' stroke="#e5d679" stroke-width=".8"');
        }
      });
      return { back: '<g class="sway">' + out + '</g>', front: vines };
    },

    ficus: function () {
      var r = rng(11), out = '';
      out += stem('M100 166 C96 140 108 120 98 92', '#7a5a3e', 6, 0);
      out += stem('M100 130 Q122 112 128 88', '#7a5a3e', 3, .3);
      out += stem('M99 118 Q78 104 72 84', '#7a5a3e', 3, .3);
      for (var i = 0; i < 46; i++) {
        var a = r() * Math.PI * 2, rr = Math.sqrt(r()) * 56;
        var x = 100 + Math.cos(a) * rr, y = 72 + Math.sin(a) * rr * .72;
        out += leaf(x, y, r() * 360, 'oval', 15 + r() * 5, 6, r() > .5 ? '#3f7d3c' : '#5d9b4d', .4 + r() * .9);
      }
      return '<g class="sway">' + out + '</g>';
    },

    aloe: function () {
      var r = rng(5), out = '';
      for (var i = 0; i < 11; i++) {
        var a = -165 + i * 15 + (r() - .5) * 8, L = 52 + (1 - Math.abs(i - 5) / 5) * 34 + r() * 8;
        var spots = '';
        for (var s = 0; s < 4; s++) spots += '<ellipse cx="' + f(L * (.2 + s * .17)) + '" cy="' + f((r() - .5) * 6) + '" rx="2.2" ry="1.2" fill="#d5e8cf"/>';
        var teeth = '';
        for (var t = 1; t < 6; t++) teeth += '<path d="M' + f(L * t / 7) + ' ' + f(-7 + t * .9) + ' l2 -3 l1 3Z M' + f(L * t / 7) + ' ' + f(7 - t * .9) + ' l2 3 l1 -3Z" fill="#c9dcb0"/>';
        out += '<g transform="translate(100 166) rotate(' + f(a) + ')"><g class="grow" style="--d:' + (Math.abs(i - 5) * .12).toFixed(2) + 's">' +
          '<path d="M0 -8 Q' + f(L * .6) + ' -8 ' + f(L) + ' 0 Q' + f(L * .6) + ' 8 0 8Z" fill="' + (i % 2 ? '#78a982' : '#8cbb93') + '"/>' + teeth + spots + '</g></g>';
      }
      return '<g class="sway">' + out + '</g>';
    }
  };

  function drawPlant(svg) {
    var kind = svg.getAttribute('data-plant');
    var color = svg.getAttribute('data-pot') || '#c8643b';
    var id = ++uid;
    var res = PLANTS[kind](id);
    if (typeof res === 'string') res = { back: res, front: '' };
    svg.innerHTML = res.back + pot(color) + res.front;
  }

  var plants = document.querySelectorAll('svg.plant');
  Array.prototype.forEach.call(plants, drawPlant);

  /* ---------- 2. Проростання і поява ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add(e.target.tagName.toLowerCase() === 'svg' ? 'is-grown' : 'is-visible');
      io.unobserve(e.target);
    });
  }, { threshold: 0.2 });
  Array.prototype.forEach.call(plants, function (p) { io.observe(p); });
  document.querySelectorAll('.reveal').forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 0.07 + 's';
    io.observe(el);
  });

  // листочки, що падають на першому екрані
  var floaters = document.querySelector('.floaters');
  if (!reduce) {
    var r = rng(42);
    for (var i = 0; i < 12; i++) {
      var leafEl = document.createElement('i');
      var size = 10 + r() * 16;
      leafEl.style.cssText = 'left:' + (r() * 100).toFixed(1) + '%;width:' + size.toFixed(0) + 'px;height:' + size.toFixed(0) +
        'px;animation-duration:' + (14 + r() * 14).toFixed(1) + 's;animation-delay:-' + (r() * 20).toFixed(1) + 's;' +
        'background:' + (r() > .5 ? '#8bbd72' : '#c9dbb0');
      floaters.appendChild(leafEl);
    }
  }

  /* ---------- 3. Сторона світу ---------- */
  var DIRS = {
    n: { t: 'Північне вікно', v: .25, a: 0, text: 'Рівне розсіяне світло без прямого сонця. Підійде тіньовитривалим рослинам; узимку їм може бракувати світла.', p: ['Заміокулькас', 'Сансевієрія', 'Спатифілум', 'Епіпремнум'] },
    e: { t: 'Східне вікно', v: .6, a: 90, text: 'М’яке ранкове сонце, а після обіду — розсіяне світло. Одне з найкращих місць для більшості тропічних рослин.', p: ['Монстера', 'Спатифілум', 'Хлорофітум', 'Епіпремнум', 'Фікус'] },
    s: { t: 'Південне вікно', v: 1, a: 180, text: 'Найбільше світла і пряме сонце майже весь день. Улітку тропічні рослини краще відсунути від скла або притінити тюлем.', p: ['Алое вера', 'Кактуси', 'Сансевієрія', 'Хлорофітум (з тюлем)'] },
    w: { t: 'Західне вікно', v: .75, a: 270, text: 'Вранці тінь, а ввечері тепле й досить сильне сонце. Ніжні рослини ставте трохи далі від скла.', p: ['Фікус', 'Монстера', 'Алое вера', 'Заміокулькас'] }
  };
  var needle = document.querySelector('.compass__needle');
  var dirBtns = document.querySelectorAll('.cbtn');
  var dirTitle = document.getElementById('dirTitle');
  var dirText = document.getElementById('dirText');
  var dirMeter = document.getElementById('dirMeter');
  var dirPlants = document.getElementById('dirPlants');
  var turns = 0, lastA = 180;

  function setDir(key) {
    var d = DIRS[key];
    // стрілка обертається найкоротшим шляхом
    var delta = ((d.a - lastA + 540) % 360) - 180;
    turns += delta;
    lastA = d.a;
    needle.style.setProperty('--a', (180 + turns) + 'deg');
    dirBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-dir') === key ? 'true' : 'false'); });
    dirTitle.textContent = d.t;
    dirText.textContent = d.text;
    dirMeter.style.setProperty('--v', d.v);
    dirPlants.innerHTML = '';
    d.p.forEach(function (name, i) {
      var li = document.createElement('li');
      li.textContent = name;
      li.style.animationDelay = i * 0.07 + 's';
      dirPlants.appendChild(li);
    });
    [dirTitle, dirText].forEach(function (el) { el.classList.remove('fade'); void el.offsetWidth; el.classList.add('fade'); });
  }
  dirBtns.forEach(function (b) { b.addEventListener('click', function () { setDir(b.getAttribute('data-dir')); }); });
  setDir('s');

  /* ---------- календар ---------- */
  var tabs = document.querySelectorAll('[data-season]');
  var panels = document.querySelectorAll('[data-panel]');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var k = t.getAttribute('data-season');
      tabs.forEach(function (x) { x.setAttribute('aria-pressed', x === t ? 'true' : 'false'); });
      panels.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-panel') === k); });
    });
  });
  // підсвічуємо поточну пору року
  var m = new Date().getMonth();
  var current = m >= 2 && m <= 4 ? 0 : m >= 5 && m <= 7 ? 1 : m >= 8 && m <= 10 ? 2 : 3;
  tabs[current].click();

  /* ---------- шапка ---------- */
  var nav = document.querySelector('.nav');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav nav a'));
  var lastY = 0;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    nav.classList.toggle('is-hidden', y > lastY && y > 400);
    lastY = y;
    var cur = null;
    links.forEach(function (a) {
      var s = document.querySelector(a.getAttribute('href'));
      if (s.getBoundingClientRect().top < innerHeight * .45) cur = a;
    });
    links.forEach(function (a) { a.classList.toggle('is-active', a === cur); });
  }, { passive: true });
})();
