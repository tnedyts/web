/* НЕСКІНЧЕННІСТЬ — природа: дерево, що росте й гойдається, та папороть Барнслі */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function onView(el, cb) {
    var seen = false;
    new IntersectionObserver(function (e) {
      e.forEach(function (x) { if (x.isIntersecting && !seen) { seen = true; cb(); } });
    }, { threshold: 0.25 }).observe(el);
  }

  /* ---------- Дерево ---------- */
  var tc = document.getElementById('tree');
  if (tc) {
    var tx = tc.getContext('2d');
    var grow = reduce ? 1 : 0;
    var wind = 0;
    var windT = 0;
    var MAX = 11;
    function size() { tc.width = tc.offsetWidth * dpr; tc.height = tc.offsetHeight * dpr; }
    size();
    window.addEventListener('resize', size);
    tc.addEventListener('pointermove', function (e) {
      var r = tc.getBoundingClientRect();
      windT = ((e.clientX - r.left) / r.width - 0.5) * 2;
    });
    tc.addEventListener('pointerleave', function () { windT = 0; });
    var colors = ['#5a3cff', '#7b5cff', '#9c7bff', '#7cf3ff', '#7cf3ff', '#a8f7ff', '#ff9fc6', '#ff5fa2', '#ffb86b', '#ffd08a', '#fff1d6', '#ffffff'];
    function branch(x, y, len, ang, depth, t) {
      if (depth > MAX) return;
      var vis = Math.max(0, Math.min(1, grow * (MAX + 1) - depth));
      if (vis <= 0) return;
      var sway = Math.sin(t * 1.3 + depth * 0.7) * 0.02 * depth + wind * 0.035 * depth;
      var a = ang + sway;
      var l = len * vis;
      var x2 = x + Math.cos(a) * l;
      var y2 = y + Math.sin(a) * l;
      tx.strokeStyle = colors[depth];
      tx.lineWidth = Math.max(0.6, (MAX - depth + 1) * 1.15) * dpr;
      tx.beginPath();
      tx.moveTo(x, y);
      tx.lineTo(x2, y2);
      tx.stroke();
      if (depth === MAX && vis > 0.9) {
        tx.fillStyle = 'rgba(255,240,220,.9)';
        tx.beginPath();
        tx.arc(x2, y2, 1.6 * dpr, 0, 6.283);
        tx.fill();
      }
      if (vis < 1) return;
      var spread = 0.42 + Math.sin(depth * 1.7) * 0.08;
      branch(x2, y2, len * 0.76, a - spread, depth + 1, t);
      branch(x2, y2, len * 0.72, a + spread * 0.9, depth + 1, t);
    }
    var tvis = false;
    new IntersectionObserver(function (e) { tvis = e[0].isIntersecting; }).observe(tc);
    onView(tc, function () {
      if (window.gsap && !reduce) gsap.to({ v: 0 }, { v: 1, duration: 4.5, ease: 'power2.inOut', onUpdate: function () { grow = this.targets()[0].v; } });
      else grow = 1;
    });
    (function loop(now) {
      requestAnimationFrame(loop);
      if (!tvis) return;
      wind += (windT - wind) * 0.04;
      tx.clearRect(0, 0, tc.width, tc.height);
      tx.lineCap = 'round';
      tx.shadowColor = 'rgba(124,243,255,.35)';
      tx.shadowBlur = 8 * dpr;
      branch(tc.width / 2, tc.height * 0.98, tc.height * 0.17, -Math.PI / 2, 0, reduce ? 0 : now / 1000);
      tx.shadowBlur = 0;
    })(0);
  }

  /* ---------- Папороть ---------- */
  var fc = document.getElementById('fern');
  if (fc) {
    var fx = fc.getContext('2d');
    var px = 0;
    var py = 0;
    var count = 0;
    var LIMIT = 260000;
    function fsize() {
      fc.width = fc.offsetWidth * dpr;
      fc.height = fc.offsetHeight * dpr;
      fx.fillStyle = '#05040a';
      fx.fillRect(0, 0, fc.width, fc.height);
      count = 0;
    }
    fsize();
    window.addEventListener('resize', fsize);
    var out = document.getElementById('fernCount');
    function step(n) {
      var w = fc.width;
      var h = fc.height;
      for (var i = 0; i < n; i++) {
        var r = Math.random();
        var nx;
        var ny;
        if (r < 0.01) { nx = 0; ny = 0.16 * py; }
        else if (r < 0.86) { nx = 0.85 * px + 0.04 * py; ny = -0.04 * px + 0.85 * py + 1.6; }
        else if (r < 0.93) { nx = 0.2 * px - 0.26 * py; ny = 0.23 * px + 0.22 * py + 1.6; }
        else { nx = -0.15 * px + 0.28 * py; ny = 0.26 * px + 0.24 * py + 0.44; }
        px = nx;
        py = ny;
        var X = w / 2 + px * h / 12.5;
        var Y = h - py * h / 11.5 - h * 0.035;
        var k = py / 10;
        fx.fillStyle = 'rgba(' + Math.round(80 + 120 * k) + ',' + Math.round(200 + 50 * k) + ',' + Math.round(150 + 100 * (1 - k)) + ',.55)';
        fx.fillRect(X, Y, dpr, dpr);
      }
      count += n;
      if (out) out.textContent = count.toLocaleString('uk-UA');
    }
    onView(fc, function () {
      (function loop() {
        if (count >= LIMIT) return;
        step(reduce ? LIMIT : 2600);
        requestAnimationFrame(loop);
      })();
    });
  }
})();
