/* =========================================================
   «Левове місто» — сценарії
   1. Силует міста в SVG: кам'яниці, вежі, Ратуша з годинником
   2. Режим «день / ніч» (зберігається в браузері)
   3. Ілюстрації карток, стрічка часу, схема пам'яток, вікторина
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var FACADES = ['#e9c46a', '#d98e73', '#a8c3a0', '#e7b7a6', '#f1e3c6', '#b9a3c9', '#9fc2c9', '#e6a96b'];

  /* ---------- кам'яниця ---------- */
  function house(x, w, h, color, R, base) {
    base = base || 260;
    var top = base - h, s = '';
    s += '<rect x="' + x + '" y="' + top + '" width="' + w + '" height="' + h + '" fill="' + color + '" stroke="rgba(0,0,0,.15)"/>';
    var roof = Math.floor(R() * 3);
    if (roof === 0) s += '<path d="M' + (x - 2) + ' ' + top + 'L' + (x + w / 2) + ' ' + (top - w * 0.38) + 'L' + (x + w + 2) + ' ' + top + 'Z" fill="#7b4a3a"/>';
    else if (roof === 1) {
      var st = w / 5;
      s += '<path d="M' + x + ' ' + top + 'v-10h' + st + 'v-10h' + st + 'v-10h' + st + 'v10h' + st + 'v10h' + st + 'v10Z" fill="' + color + '" stroke="rgba(0,0,0,.15)"/>';
    } else {
      s += '<rect x="' + (x - 3) + '" y="' + (top - 8) + '" width="' + (w + 6) + '" height="8" fill="#6d5c4d"/>';
      for (var b = x + 4; b < x + w - 4; b += 8) s += '<rect x="' + b + '" y="' + (top - 16) + '" width="4" height="8" fill="#6d5c4d"/>';
    }
    // карниз між поверхами
    var floors = Math.max(2, Math.floor((h - 26) / 34));
    var cols = w > 80 ? 4 : 3;
    var gx = w / (cols + 1);
    for (var f = 0; f < floors; f++) {
      var wy = top + 14 + f * 34;
      s += '<rect x="' + x + '" y="' + (wy - 6) + '" width="' + w + '" height="2" fill="rgba(0,0,0,.12)"/>';
      for (var c = 1; c <= cols; c++) {
        var lit = R() < 0.62 ? 1 : 0.08;
        s += '<rect class="win" style="--lit:' + lit + '" x="' + (x + gx * c - 6) + '" y="' + wy + '" width="12" height="20" rx="' + (f === 0 ? 6 : 1) + '"/>';
      }
    }
    // двері
    s += '<path d="M' + (x + w / 2 - 9) + ' ' + base + 'v-20a9 9 0 0 1 18 0v20Z" fill="#5a3b2c"/>';
    return s;
  }

  function ratusha(cx, base) {
    var s = '';
    s += '<rect x="' + (cx - 90) + '" y="' + (base - 110) + '" width="180" height="110" fill="#efe6d2" stroke="rgba(0,0,0,.15)"/>';
    for (var i = 0; i < 6; i++) s += '<rect class="win" style="--lit:1" x="' + (cx - 78 + i * 28) + '" y="' + (base - 92) + '" width="12" height="22" rx="1"/><rect class="win" style="--lit:.6" x="' + (cx - 78 + i * 28) + '" y="' + (base - 54) + '" width="12" height="22" rx="1"/>';
    s += '<rect x="' + (cx - 30) + '" y="' + (base - 225) + '" width="60" height="120" fill="#f3ecdc" stroke="rgba(0,0,0,.18)"/>';
    s += '<rect x="' + (cx - 36) + '" y="' + (base - 232) + '" width="72" height="10" fill="#ddd2bb"/>';
    s += '<path d="M' + (cx - 26) + ' ' + (base - 232) + 'q26 -40 52 0z" fill="#4f7f6b"/>';
    s += '<rect x="' + (cx - 4) + '" y="' + (base - 262) + '" width="8" height="24" fill="#4f7f6b"/>';
    s += '<path d="M' + cx + ' ' + (base - 262) + 'v-20" stroke="#333" stroke-width="2"/>';
    s += '<g class="flag"><rect x="' + cx + '" y="' + (base - 282) + '" width="24" height="7" fill="#0057b7"/><rect x="' + cx + '" y="' + (base - 275) + '" width="24" height="7" fill="#ffd700"/></g>';
    // годинник
    var cy = base - 190;
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="19" fill="#fffdf4" stroke="#b08d2a" stroke-width="3"/>';
    for (var k = 0; k < 12; k++) {
      var a = k * Math.PI / 6;
      s += '<circle cx="' + (cx + Math.sin(a) * 15).toFixed(1) + '" cy="' + (cy - Math.cos(a) * 15).toFixed(1) + '" r="1.2" fill="#333"/>';
    }
    s += '<line class="clock-hand" id="hHand" x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - 9) + '" stroke-width="3" style="transform-origin:' + cx + 'px ' + cy + 'px"/>';
    s += '<line class="clock-hand" id="mHand" x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - 14) + '" stroke-width="2" style="transform-origin:' + cx + 'px ' + cy + 'px"/>';
    s += '<rect class="win" style="--lit:1" x="' + (cx - 8) + '" y="' + (base - 160) + '" width="16" height="26" rx="8"/>';
    return s;
  }

  function farTowers() {
    // далекі силуети: бані, шпилі, вежа, Замкова гора
    return '<g class="far">' +
      '<path d="M140 260V170h30v-20a25 25 0 0 1 50 0v20h30v90z"/><path d="M195 125v-14"/><rect x="193" y="104" width="4" height="12"/>' +
      '<path d="M470 260V150h16l10-70 10 70h16v110z"/>' +
      '<path d="M870 260V120h28v140z"/><path d="M866 120l18-30 18 30z"/>' +
      '<path d="M960 260v-90h20a38 38 0 0 1 76 0h20v90z"/><rect x="1014" y="110" width="4" height="22"/>' +
      '<path d="M1180 260v-120l18-40 18 40v120z"/>' +
      '<path d="M1260 260C1290 170 1340 120 1400 110C1430 120 1440 140 1440 160V260z"/><rect x="1396" y="70" width="3" height="42"/><rect x="1399" y="70" width="18" height="6" fill="#0057b7"/><rect x="1399" y="76" width="18" height="6" fill="#ffd700"/>' +
      '</g>';
  }

  function buildSkyline(svg) {
    var R = rng(1256), s = '';
    for (var i = 0; i < 46; i++) s += '<circle class="star" cx="' + Math.round(R() * 1440) + '" cy="' + Math.round(R() * 120) + '" r="' + (R() * 1.4 + .5).toFixed(1) + '" style="animation-delay:-' + (R() * 3).toFixed(1) + 's"/>';
    [[40, 40, 70], [120, 70, 95], [80, 24, 120]].forEach(function (c, k) {
      s += '<g class="cloud" style="animation-duration:' + c[2] + 's;animation-delay:-' + (k * 30) + 's"><ellipse cx="0" cy="' + c[0] + '" rx="46" ry="12"/><ellipse cx="24" cy="' + (c[0] - 8) + '" rx="28" ry="12"/><ellipse cx="-22" cy="' + (c[0] - 4) + '" rx="22" ry="9"/></g>';
    });
    s += '<path class="bird" d="M0 60q6 -6 12 0q6 -6 12 0"/><path class="bird" style="animation-delay:-4s" d="M30 70q5 -5 10 0q5 -5 10 0"/>';
    s += farTowers();
    var x = -10, k = 0;
    while (x < 1450) {
      if (x > 610 && x < 830) { x = 830; continue; }
      var w = 60 + Math.round(R() * 50);
      if (x < 640 && x + w > 630) w = Math.max(30, 630 - x);
      var h = 105 + Math.round(R() * 70);
      s += house(x, w, h, FACADES[k++ % FACADES.length], R);
      x += w;
    }
    s += '<g transform="translate(720 260) scale(.82) translate(-720 -260)">' + ratusha(720, 260) + '</g>';
    svg.innerHTML = s;
  }

  var sky = document.getElementById('skyline');
  if (sky) buildSkyline(sky);

  // годинник Ратуші і час у підвалі
  function tickClock() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    var hh = document.getElementById('hHand'), mh = document.getElementById('mHand');
    if (hh) { hh.style.transform = 'rotate(' + ((h % 12) * 30 + m / 2) + 'deg)'; mh.style.transform = 'rotate(' + (m * 6) + 'deg)'; }
    document.querySelectorAll('[data-clock]').forEach(function (el) { el.textContent = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); });
  }
  tickClock();
  setInterval(tickClock, 15000);

  /* ---------- 2. День / ніч ---------- */
  var btn = document.getElementById('dayNight');
  function syncBtn() {
    var night = root.classList.contains('night');
    btn.setAttribute('aria-pressed', night ? 'true' : 'false');
    btn.querySelector('.daynight__txt').textContent = night ? 'День' : 'Ніч';
  }
  btn.addEventListener('click', function () {
    root.classList.toggle('night');
    try { localStorage.setItem('lviv-night', root.classList.contains('night') ? '1' : '0'); } catch (e) { /* без збереження */ }
    syncBtn();
  });
  syncBtn();
  // вночі вікна то запалюються, то гаснуть
  if (!reduce) {
    setInterval(function () {
      if (!root.classList.contains('night')) return;
      var wins = document.querySelectorAll('.skyline .win');
      var w = wins[Math.floor(Math.random() * wins.length)];
      if (w) w.style.setProperty('--lit', w.style.getPropertyValue('--lit') === '1' ? '0.08' : '1');
    }, 700);
  }

  /* ---------- 3. Ілюстрації карток ---------- */
  var ART = {
    rynok: function () {
      var R = rng(3), s = '';
      var xs = [0, 46, 92, 150, 196];
      xs.forEach(function (x, i) { if (i !== 2) s += house(x + (i > 2 ? 10 : 0), 46, 70 + Math.round(R() * 30), FACADES[(i * 3) % 8], R, 150); });
      s += '<rect x="96" y="40" width="40" height="110" fill="#f3ecdc" stroke="rgba(0,0,0,.2)"/><path d="M100 40q16 -26 32 0z" fill="#4f7f6b"/><circle cx="116" cy="66" r="9" fill="#fffdf4" stroke="#b08d2a" stroke-width="2"/>';
      return s;
    },
    opera: function () {
      var s = '<rect x="20" y="70" width="200" height="80" fill="#efe1c3" stroke="rgba(0,0,0,.2)"/>';
      s += '<rect x="80" y="50" width="80" height="30" fill="#e8d6b1"/><path d="M90 50a30 22 0 0 1 60 0z" fill="#5e8a7a"/>';
      for (var i = 0; i < 7; i++) s += '<rect x="' + (34 + i * 27) + '" y="92" width="8" height="40" fill="#cdb98f"/><rect class="win" style="--lit:1" x="' + (45 + i * 27) + '" y="100" width="10" height="20" rx="5"/>';
      s += '<path d="M100 50l-6 -14l6 4l6 -4z M140 50l-6 -14l6 4l6 -4z" fill="#c9a227"/><circle cx="120" cy="30" r="5" fill="#c9a227"/>';
      s += '<rect x="20" y="66" width="200" height="6" fill="#d8c49c"/>';
      return s;
    },
    castle: function () {
      var s = '<path d="M0 150C40 90 90 60 130 58C170 60 210 100 240 150Z" fill="#7da37a"/>';
      s += '<path d="M95 62c10 -20 60 -20 70 0z" fill="#6b9367"/><rect x="128" y="18" width="3" height="40" fill="#555"/><rect x="131" y="18" width="24" height="8" fill="#0057b7"/><rect x="131" y="26" width="24" height="8" fill="#ffd700"/>';
      s += '<path d="M30 150v-30h18v30M180 150v-26h14v26" fill="#a39a8a"/>';
      for (var i = 0; i < 5; i++) s += '<circle cx="' + (40 + i * 40) + '" cy="' + (128 - (i % 2) * 6) + '" r="12" fill="#5e8a5a"/>';
      return s;
    }
  };
  document.querySelectorAll('[data-art]').forEach(function (svg) { svg.innerHTML = ART[svg.getAttribute('data-art')](); });

  /* ---------- поява й лічильники ---------- */
  function countUp(el) {
    var to = +el.getAttribute('data-to'), from = to > 1000 ? to - 120 : 0, t0 = null;
    if (reduce) return;
    requestAnimationFrame(function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1400, 1);
      el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    });
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      e.target.querySelectorAll('[data-to]').forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 0.07 + 's'; io.observe(el); });

  /* ---------- стрічка часу: великий рік у бічній панелі ---------- */
  var bigYear = document.getElementById('bigYear');
  if (bigYear) {
    var evs = Array.prototype.slice.call(document.querySelectorAll('.ev'));
    var bar = document.getElementById('yearBar');
    var first = 1256, last = 1998, shown = first;
    var onScroll = function () {
      var cur = evs[0];
      evs.forEach(function (e) { if (e.getBoundingClientRect().top < innerHeight * 0.55) cur = e; });
      var y = +cur.querySelector('.ev__year').textContent;
      if (y !== shown) {
        shown = y;
        bigYear.textContent = y;
        bigYear.animate([{ transform: 'translateY(8px)', opacity: .3 }, { transform: 'none', opacity: 1 }], { duration: 350 });
      }
      bar.style.width = ((y - first) / (last - first) * 100).toFixed(1) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- схема пам'яток ---------- */
  var map = document.getElementById('map');
  if (map) {
    var scN = document.getElementById('scN'), scT = document.getElementById('scT'), scD = document.getElementById('scD');
    var select = function (n) {
      document.querySelectorAll('[data-pin]').forEach(function (el) { el.classList.toggle('is-on', el.getAttribute('data-pin') === String(n)); });
      var row = document.querySelector('tr.sight[data-pin="' + n + '"]');
      scN.textContent = n;
      scT.textContent = row.querySelector('th').textContent;
      scD.textContent = row.lastElementChild.textContent;
    };
    document.querySelectorAll('[data-pin]').forEach(function (el) {
      var n = el.getAttribute('data-pin');
      el.addEventListener('mouseenter', function () { select(n); });
      el.addEventListener('focus', function () { select(n); });
      if (el.classList.contains('pin')) {
        el.addEventListener('click', function () { document.querySelector('tr.sight[data-pin="' + n + '"]').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); });
        el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.dispatchEvent(new Event('click')); } });
      }
    });
    var hashRow = location.hash && document.querySelector(location.hash);
    select(hashRow && hashRow.getAttribute('data-pin') || 1);
  }

  /* ---------- вікторина ---------- */
  var qText = document.getElementById('qText');
  if (qText) {
    var Q = [
      ['Ідеальний ранок у Львові — це…', [['кава на площі Ринок', 0], ['прогулянка на Високий замок', 2], ['гарячий шоколад під дощем', 1], ['сніданок у бабусі', 3]]],
      ['Що візьмете із собою додому?', [['пачку кави', 0], ['коробку цукерок', 1], ['парасольку', 2], ['баночку варення', 3]]],
      ['Ваш ідеальний вечір…', [['опера', 1], ['вуличний музикант на Ринку', 0], ['ліхтарі й бруківка', 2], ['родинна вечеря', 3]]]
    ];
    var RES = [
      ['Пляцок «Захер»', 'Класичний і впевнений, як віденська кав’ярня.'],
      ['Гарячий шоколад', 'Ви — тепло й затишок у дощовий вечір.'],
      ['Сирник по-львівськи', 'Ніжний, але з характером, як старі вулички.'],
      ['Маковий пляцок', 'Домашній і щирий, як свято за великим столом.']
    ];
    var score = [0, 0, 0, 0], step = 0;
    var qOpts = document.getElementById('qOpts'), qStep = document.getElementById('qStep'), qResult = document.getElementById('qResult');
    var show = function () {
      if (step >= Q.length) {
        var best = score.indexOf(Math.max.apply(null, score));
        qStep.textContent = 'Результат';
        qText.textContent = 'Ви — ' + RES[best][0] + '!';
        qResult.textContent = RES[best][1];
        qOpts.innerHTML = '';
        var again = document.createElement('button');
        again.type = 'button'; again.className = 'qopt'; again.textContent = 'Пройти ще раз';
        again.addEventListener('click', function () { score = [0, 0, 0, 0]; step = 0; qResult.textContent = 'Дайте відповіді — і дізнаєтеся.'; show(); });
        qOpts.appendChild(again);
        return;
      }
      qStep.textContent = 'Питання ' + (step + 1) + ' з ' + Q.length;
      qText.textContent = Q[step][0];
      qOpts.innerHTML = '';
      Q[step][1].forEach(function (o) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'qopt'; b.textContent = o[0];
        b.addEventListener('click', function () { score[o[1]]++; step++; show(); });
        qOpts.appendChild(b);
      });
    };
    show();
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-top]')) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }
  });
})();
