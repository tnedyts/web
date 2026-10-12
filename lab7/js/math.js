/* НЕСКІНЧЕННІСТЬ — математика: орбіта z → z² + c та сніжинка Коха */
(function () {
  'use strict';

  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  /* ---------- Орбіта ---------- */
  var mapC = document.getElementById('orbitMap');
  var orbC = document.getElementById('orbitPlot');
  if (mapC && orbC) {
    var mctx = mapC.getContext('2d');
    var octx = orbC.getContext('2d');
    var V = { x0: -2.2, x1: 0.9, y0: -1.2, y1: 1.2 };
    var C = { x: -0.12, y: 0.75 };
    var bg = null;
    function sizeAll() {
      [mapC, orbC].forEach(function (c) { c.width = c.offsetWidth * dpr; c.height = c.offsetHeight * dpr; });
      var w = mapC.width;
      var h = mapC.height;
      var img = mctx.createImageData(w, h);
      for (var py = 0; py < h; py++) {
        for (var px = 0; px < w; px++) {
          var cr = V.x0 + (V.x1 - V.x0) * px / w;
          var ci = V.y1 - (V.y1 - V.y0) * py / h;
          var zr = 0;
          var zi = 0;
          var n = 0;
          while (n < 60 && zr * zr + zi * zi < 4) { var t = zr * zr - zi * zi + cr; zi = 2 * zr * zi + ci; zr = t; n++; }
          var o = (py * w + px) * 4;
          var v = n === 60 ? 0 : Math.pow(n / 60, 0.5);
          img.data[o] = n === 60 ? 20 : 30 + 200 * v;
          img.data[o + 1] = n === 60 ? 14 : 20 + 120 * v;
          img.data[o + 2] = n === 60 ? 40 : 70 + 180 * v;
          img.data[o + 3] = 255;
        }
      }
      bg = img;
      render();
    }
    function render() {
      var w = mapC.width;
      var h = mapC.height;
      mctx.putImageData(bg, 0, 0);
      var px = (C.x - V.x0) / (V.x1 - V.x0) * w;
      var py = (V.y1 - C.y) / (V.y1 - V.y0) * h;
      mctx.strokeStyle = '#fff';
      mctx.lineWidth = 2 * dpr;
      mctx.beginPath();
      mctx.arc(px, py, 7 * dpr, 0, 6.283);
      mctx.stroke();

      /* орбіта */
      var ow = orbC.width;
      var oh = orbC.height;
      octx.fillStyle = '#07060c';
      octx.fillRect(0, 0, ow, oh);
      var sc = oh / 4.4;
      var ox = ow / 2;
      var oy = oh / 2;
      octx.strokeStyle = 'rgba(241,238,248,.12)';
      octx.lineWidth = 1 * dpr;
      octx.beginPath();
      octx.moveTo(0, oy); octx.lineTo(ow, oy); octx.moveTo(ox, 0); octx.lineTo(ox, oh);
      octx.stroke();
      octx.beginPath();
      octx.arc(ox, oy, 2 * sc, 0, 6.283);
      octx.setLineDash([4 * dpr, 6 * dpr]);
      octx.stroke();
      octx.setLineDash([]);
      var zr = 0;
      var zi = 0;
      var escaped = -1;
      var pts = [[0, 0]];
      for (var n = 0; n < 80; n++) {
        var t = zr * zr - zi * zi + C.x;
        zi = 2 * zr * zi + C.y;
        zr = t;
        pts.push([zr, zi]);
        if (zr * zr + zi * zi > 4) { escaped = n + 1; break; }
      }
      var g = octx.createLinearGradient(0, 0, ow, oh);
      g.addColorStop(0, '#ff5fa2');
      g.addColorStop(0.5, '#7cf3ff');
      g.addColorStop(1, '#9c7bff');
      octx.strokeStyle = g;
      octx.lineWidth = 1.4 * dpr;
      octx.beginPath();
      pts.forEach(function (p, i) {
        var x = ox + Math.max(-6, Math.min(6, p[0])) * sc;
        var y = oy - Math.max(-6, Math.min(6, p[1])) * sc;
        if (i === 0) octx.moveTo(x, y); else octx.lineTo(x, y);
      });
      octx.stroke();
      pts.forEach(function (p, i) {
        var x = ox + Math.max(-6, Math.min(6, p[0])) * sc;
        var y = oy - Math.max(-6, Math.min(6, p[1])) * sc;
        octx.fillStyle = i === 0 ? '#fff' : 'rgba(255,255,255,' + Math.max(0.25, 1 - i / 60) + ')';
        octx.beginPath();
        octx.arc(x, y, (i === 0 ? 4 : 2.2) * dpr, 0, 6.283);
        octx.fill();
      });
      var out = document.getElementById('orbitOut');
      var cs = C.x.toFixed(3).replace('.', ',') + (C.y < 0 ? ' − ' : ' + ') + Math.abs(C.y).toFixed(3).replace('.', ',') + 'i';
      out.innerHTML = escaped > 0
        ? 'c = <b>' + cs + '</b> · орбіта втекла за ' + escaped + ' крок(ів) — точка <b>поза множиною</b>'
        : 'c = <b>' + cs + '</b> · за 80 кроків орбіта не втекла — точка <b>у множині</b>';
    }
    function pick(e) {
      var r = mapC.getBoundingClientRect();
      C.x = V.x0 + (V.x1 - V.x0) * Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      C.y = V.y1 - (V.y1 - V.y0) * Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
      render();
    }
    mapC.addEventListener('pointermove', function (e) { if (e.buttons || e.pointerType === 'mouse') pick(e); });
    mapC.addEventListener('pointerdown', function (e) { mapC.setPointerCapture(e.pointerId); pick(e); });
    sizeAll();
    window.addEventListener('resize', sizeAll);
  }

  /* ---------- Сніжинка Коха ---------- */
  var kc = document.getElementById('koch');
  var kr = document.getElementById('kochRange');
  if (kc && kr) {
    var kx = kc.getContext('2d');
    var shown = 0;
    var anim = null;
    function koch(level) {
      var s = kc.width * 0.62;
      var h = s * Math.sqrt(3) / 2;
      var cx = kc.width / 2;
      var cy = kc.height / 2;
      var pts = [[cx - s / 2, cy - h / 3], [cx + s / 2, cy - h / 3], [cx, cy + h * 2 / 3]];
      var cur = pts.concat([pts[0]]);
      for (var l = 0; l < level; l++) {
        var next = [];
        for (var i = 0; i < cur.length - 1; i++) {
          var a = cur[i];
          var b = cur[i + 1];
          var dx = (b[0] - a[0]) / 3;
          var dy = (b[1] - a[1]) / 3;
          var p1 = [a[0] + dx, a[1] + dy];
          var p3 = [a[0] + 2 * dx, a[1] + 2 * dy];
          var p2 = [p1[0] + dx * 0.5 + dy * Math.sqrt(3) / 2, p1[1] + dy * 0.5 - dx * Math.sqrt(3) / 2];
          next.push(a, p1, p2, p3);
        }
        next.push(cur[cur.length - 1]);
        cur = next;
      }
      return cur;
    }
    function drawK(level) {
      kx.clearRect(0, 0, kc.width, kc.height);
      var pts = koch(level);
      var g = kx.createLinearGradient(0, 0, kc.width, kc.height);
      g.addColorStop(0, '#ff5fa2');
      g.addColorStop(0.4, '#ffb86b');
      g.addColorStop(0.7, '#7cf3ff');
      g.addColorStop(1, '#9c7bff');
      kx.beginPath();
      pts.forEach(function (p, i) { if (i === 0) kx.moveTo(p[0], p[1]); else kx.lineTo(p[0], p[1]); });
      kx.closePath();
      kx.fillStyle = 'rgba(156,123,255,.08)';
      kx.fill();
      kx.strokeStyle = g;
      kx.lineWidth = 1.6 * dpr;
      kx.shadowColor = 'rgba(124,243,255,.6)';
      kx.shadowBlur = 12 * dpr;
      kx.stroke();
      kx.shadowBlur = 0;
      var segs = 3 * Math.pow(4, level);
      var per = 3 * Math.pow(4 / 3, level);
      var area = 1 + (3 / 5) * (1 - Math.pow(4 / 9, level));
      document.getElementById('kLevel').textContent = level;
      document.getElementById('kSegs').textContent = segs.toLocaleString('uk-UA');
      document.getElementById('kPer').textContent = '×' + (per / 3).toFixed(2).replace('.', ',');
      document.getElementById('kArea').textContent = '×' + area.toFixed(3).replace('.', ',');
    }
    function size() { kc.width = kc.offsetWidth * dpr; kc.height = kc.offsetHeight * dpr; drawK(shown); }
    kr.addEventListener('input', function () { shown = parseInt(kr.value, 10); drawK(shown); clearInterval(anim); });
    size();
    window.addEventListener('resize', size);
    /* сама «росте», поки користувач не торкнувся повзунка */
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      anim = setInterval(function () { shown = (shown + 1) % 7; kr.value = shown; drawK(shown); }, 1600);
    }
  }
})();
