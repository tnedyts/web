/* НЕСКІНЧЕННІСТЬ — галерея-занурення (ефект Дросте).
   Прокручування збільшує поточний фрактал; у його центрі відкривається вікно
   в наступний, яке росте, доки не заповнить екран. Після 12-го — знову перший. */
(function () {
  'use strict';

  var section = document.querySelector('.droste');
  var canvas = document.getElementById('droste');
  if (!section || !canvas) return;
  document.documentElement.classList.add('has-droste');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d');
  var plates = Array.prototype.map.call(document.querySelectorAll('.plates li'), function (li, i) {
    var img = new Image();
    img.src = li.getAttribute('data-thumb');
    var p = {
      img: img,
      full: li.getAttribute('data-full'),
      title: li.getAttribute('data-title'),
      formula: li.getAttribute('data-formula'),
      meta: li.getAttribute('data-meta'),
      n: i + 1
    };
    var big = new Image();
    big.onload = function () { p.img = big; };
    setTimeout(function () { big.src = p.full; }, 300 + i * 120);
    return p;
  });
  var N = plates.length;
  var Z = 5.5;
  var ROT = 0.36;

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0;
  var H = 0;
  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  var grad = null;
  function borderGrad(w, h) {
    var g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    g.addColorStop(0, '#ff5fa2');
    g.addColorStop(0.35, '#ffb86b');
    g.addColorStop(0.65, '#7cf3ff');
    g.addColorStop(1, '#9c7bff');
    return g;
  }

  function draw(p, t) {
    var base = Math.floor(p);
    var f = p - base;
    /* розмір «cover» для 16:9 */
    var cw = Math.max(W, H * 16 / 9);
    var ch = cw * 9 / 16;
    var cx = W / 2;
    var cy = H / 2;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    for (var k = 0; k < 4; k++) {
      var s = Math.pow(Z, f - k);
      var plate = plates[(base + k) % N];
      var rot = (f - k) * ROT + (reduce ? 0 : Math.sin(t * 0.4) * 0.004);
      if (k === 0) {
        /* зовнішній шар повернутий — збільшуємо, щоб не відкривалися кути */
        var ca = Math.abs(Math.cos(rot));
        var sa = Math.abs(Math.sin(rot));
        s = Math.max(s, (W * ca + H * sa) / cw, (W * sa + H * ca) / ch);
      }
      var w = cw * s;
      var h = ch * s;
      if (w < 6) break;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      if (k > 0) {
        var r = Math.min(26, w * 0.04);
        /* сяйво навколо вікна */
        ctx.shadowColor = 'rgba(124,243,255,.55)';
        ctx.shadowBlur = Math.min(60, 8 + w * 0.05);
        roundRect(-w / 2, -h / 2, w, h, r);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.save();
        roundRect(-w / 2, -h / 2, w, h, r);
        ctx.clip();
      }
      if (plate.img.complete && plate.img.naturalWidth) ctx.drawImage(plate.img, -w / 2, -h / 2, w, h);
      if (k === 0 && f > 0) {
        /* зовнішній шар темнішає — фокус переходить у вікно */
        ctx.fillStyle = 'rgba(0,0,0,' + (Math.min(1, f * 1.2) * 0.62) + ')';
        ctx.fillRect(-w / 2, -h / 2, w, h);
      }
      if (k > 0) {
        ctx.restore();
        var a = Math.max(0, Math.min(1, (1 - s) * 2.2));
        if (a > 0) {
          ctx.globalAlpha = a;
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = borderGrad(w, h);
          roundRect(-w / 2, -h / 2, w, h, Math.min(26, w * 0.04));
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
      ctx.restore();
    }
  }

  /* ---------- HUD ---------- */
  var hud = {
    plate: document.getElementById('hPlate'),
    zoom: document.getElementById('hZoom'),
    title: document.getElementById('hTitle'),
    formula: document.getElementById('hFormula'),
    meta: document.getElementById('hMeta'),
    bar: document.getElementById('hBar')
  };
  var ticks = document.querySelectorAll('.rail li');
  var shown = -1;
  function setHud(p) {
    var idx = Math.round(p) % N;
    if (hud.zoom) hud.zoom.innerHTML = '×' + Math.pow(Z, p).toExponential(2).replace('.', ',').replace('e+', '·10<sup>') + '</sup>';
    if (hud.bar) hud.bar.style.transform = 'scaleX(' + (p / N) + ')';
    if (idx === shown) return;
    shown = idx;
    var pl = plates[idx];
    if (hud.plate) hud.plate.textContent = 'PL. ' + String(pl.n).padStart(2, '0') + ' / ' + N;
    var swap = function () {
      hud.title.textContent = pl.title;
      hud.formula.textContent = pl.formula;
      hud.meta.textContent = pl.meta;
    };
    if (window.gsap && !reduce) {
      gsap.timeline()
        .to([hud.title, hud.formula, hud.meta], { opacity: 0, y: -14, duration: 0.18, ease: 'power2.in' })
        .call(swap)
        .fromTo([hud.title, hud.formula, hud.meta], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.05 });
    } else swap();
    ticks.forEach(function (li, k) { li.classList.toggle('is-on', k === idx); });
  }

  /* ---------- Прокручування → рівень занурення ---------- */
  var target = 0;
  var cur = 0;
  function progress() {
    var r = section.getBoundingClientRect();
    var total = section.offsetHeight - window.innerHeight;
    return Math.max(0, Math.min(1, -r.top / total));
  }
  function onScroll() { target = progress() * N; }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  cur = target;

  ticks.forEach(function (li, k) {
    li.addEventListener('click', function () {
      var total = section.offsetHeight - window.innerHeight;
      var y = section.offsetTop + total * (k / N) + 2;
      if (window.__lenis) window.__lenis.scrollTo(y, { duration: 2.2 });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  var intro = document.querySelector('.droste__intro');
  var visible = true;
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(section);
  var t0 = performance.now();
  (function loop(now) {
    requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    cur += (target - cur) * 0.12;
    if (Math.abs(target - cur) < 0.0005) cur = target;
    draw(cur, (now - t0) / 1000);
    setHud(cur);
    if (intro) {
      var o = Math.max(0, 1 - cur * 3.2);
      intro.style.opacity = o;
      intro.style.transform = 'scale(' + (1 + cur * 2.2) + ')';
      intro.style.visibility = o < 0.01 ? 'hidden' : 'visible';
    }
  })(t0);
})();
