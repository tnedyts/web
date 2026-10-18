/* =========================================================
   «Мережа мереж» — сценарії
   1. Жива мережа на canvas: вузли, з'єднання, пакети
   2. Вікна, що перетягуються; «модем»; годинник
   3. Лабораторія пакетів
   4. Поява блоків, лічильники, активний пункт меню
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Мережа ---------- */
  var canvas = document.getElementById('net');
  var ctx = canvas.getContext('2d');
  var hero = document.querySelector('.hero');
  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var nodes = [], packets = [], mouse = { x: -999, y: -999 };
  var COLORS = ['#2b50ff', '#ff3d81', '#8ccf00'];
  var LINK = 150;

  function resize() {
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.round(Math.min(90, W * H / 16000));
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, s: Math.random() < .12 ? 7 : 4 });
    }
  }
  resize();
  window.addEventListener('resize', resize);
  hero.addEventListener('mousemove', function (e) {
    var r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  hero.addEventListener('mouseleave', function () { mouse.x = mouse.y = -999; });

  function neighbours(n) {
    return nodes.filter(function (m) { return m !== n && Math.hypot(m.x - n.x, m.y - n.y) < LINK; });
  }
  function spawnPacket() {
    var from = nodes[Math.floor(Math.random() * nodes.length)];
    var nb = neighbours(from);
    if (!nb.length) return;
    packets.push({ a: from, b: nb[Math.floor(Math.random() * nb.length)], t: 0, hops: 0, c: COLORS[Math.floor(Math.random() * 3)] });
  }

  var heroVisible = true;
  new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; }).observe(hero);

  function frame() {
    requestAnimationFrame(frame);
    if (!heroVisible) return;
    ctx.clearRect(0, 0, W, H);
    // рух вузлів
    nodes.forEach(function (n) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });
    // з'єднання
    ctx.lineWidth = 1;
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = 'rgba(18,18,18,' + (0.22 * (1 - d / LINK)).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      // курсор теж «вузол»
      var dm = Math.hypot(nodes[i].x - mouse.x, nodes[i].y - mouse.y);
      if (dm < LINK * 1.3) {
        ctx.strokeStyle = 'rgba(43,80,255,' + (0.6 * (1 - dm / (LINK * 1.3))).toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    // вузли — квадратики
    nodes.forEach(function (n) {
      ctx.fillStyle = n.s > 4 ? '#ff3d81' : '#121212';
      ctx.fillRect(n.x - n.s / 2, n.y - n.s / 2, n.s, n.s);
    });
    // пакети
    if (Math.random() < 0.18 && packets.length < 60) spawnPacket();
    packets = packets.filter(function (p) {
      p.t += 0.022;
      if (p.t >= 1) {
        if (p.hops > 5) return false;
        var nb = neighbours(p.b).filter(function (m) { return m !== p.a; });
        if (!nb.length) return false;
        p.a = p.b; p.b = nb[Math.floor(Math.random() * nb.length)]; p.t = 0; p.hops++;
      }
      var x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
      ctx.fillStyle = p.c;
      ctx.fillRect(x - 3, y - 3, 6, 6);
      return Math.hypot(p.a.x - p.b.x, p.a.y - p.b.y) < LINK * 1.2;
    });
  }
  if (reduce) {
    // статичний кадр без руху
    nodes.forEach(function (n) { n.vx = n.vy = 0; });
  }
  frame();

  /* ---------- 2. Вікна, модем, годинник ---------- */
  document.querySelectorAll('[data-drag]').forEach(function (win) {
    var bar = win.querySelector('.win__bar'), sx, sy, ox, oy, dragging = false;
    bar.addEventListener('pointerdown', function (e) {
      dragging = true;
      var r = win.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      win.style.left = r.left - hr.left + 'px'; win.style.top = r.top - hr.top + 'px';
      win.style.right = 'auto'; win.style.bottom = 'auto';
      sx = e.clientX; sy = e.clientY; ox = r.left - hr.left; oy = r.top - hr.top;
      bar.setPointerCapture(e.pointerId);
      win.style.zIndex = 5;
    });
    bar.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var x = Math.max(0, Math.min(hero.clientWidth - win.offsetWidth, ox + e.clientX - sx));
      var y = Math.max(60, Math.min(hero.clientHeight - win.offsetHeight, oy + e.clientY - sy));
      win.style.left = x + 'px'; win.style.top = y + 'px';
    });
    bar.addEventListener('pointerup', function () { dragging = false; win.style.zIndex = 3; });
    win.querySelector('.win__bar i').addEventListener('click', function () { win.style.display = 'none'; });
  });

  var baud = document.getElementById('baud');
  var steps = [0, 300, 1200, 2400, 9600, 14400, 28800, 33600, 56000];
  var bi = 0;
  setInterval(function () { bi = (bi + 1) % steps.length; baud.textContent = steps[bi].toLocaleString('uk-UA'); }, 700);

  var clock = document.getElementById('clock');
  var uptime = document.getElementById('uptime');
  var started = Date.now();
  function tick() {
    var d = new Date();
    clock.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    var s = Math.floor((Date.now() - started) / 1000);
    uptime.textContent = s < 60 ? s + ' с' : Math.floor(s / 60) + ' хв ' + (s % 60) + ' с';
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- 3. Лабораторія пакетів ---------- */
  var lane = document.getElementById('lane');
  var form = document.getElementById('sendForm');
  var input = document.getElementById('msg');
  var out = document.getElementById('received');
  var POS = { a: [8, 50], r1: [50, 14], r2: [50, 50], r3: [50, 86], b: [90, 50] };
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  ['r1', 'r2', 'r3'].forEach(function (r) {
    ['a', 'b'].forEach(function (end) {
      var l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', POS[end][0] + '%'); l.setAttribute('y1', POS[end][1] + '%');
      l.setAttribute('x2', POS[r][0] + '%'); l.setAttribute('y2', POS[r][1] + '%');
      svg.appendChild(l);
    });
  });
  lane.insertBefore(svg, lane.firstChild);

  function px(key) { return [POS[key][0] / 100 * lane.clientWidth, POS[key][1] / 100 * lane.clientHeight]; }

  var sending = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;
    var text = input.value.trim() || 'Привіт!';
    var chunks = [];
    for (var i = 0; i < text.length; i += 4) chunks.push(text.slice(i, i + 4));
    var got = new Array(chunks.length), arrived = 0;
    sending = true;
    out.textContent = '…';
    chunks.forEach(function (chunk, idx) {
      var el = document.createElement('span');
      el.className = 'pkt';
      el.innerHTML = '<small>#' + (idx + 1) + '</small>';
      el.appendChild(document.createTextNode(chunk));
      lane.appendChild(el);
      var via = ['r1', 'r2', 'r3'][Math.floor(Math.random() * 3)];
      var A = px('a'), R = px(via), B = px('b');
      var dur = reduce ? 10 : 1100 + Math.random() * 1900;
      var anim = el.animate([
        { transform: 'translate(' + A[0] + 'px,' + A[1] + 'px) translate(-50%,-50%)', opacity: 0 },
        { transform: 'translate(' + A[0] + 'px,' + A[1] + 'px) translate(-50%,-50%)', opacity: 1, offset: 0.05 },
        { transform: 'translate(' + R[0] + 'px,' + R[1] + 'px) translate(-50%,-50%)', offset: 0.5 },
        { transform: 'translate(' + B[0] + 'px,' + B[1] + 'px) translate(-50%,-50%)', opacity: 1, offset: 0.95 },
        { transform: 'translate(' + B[0] + 'px,' + B[1] + 'px) translate(-50%,-50%)', opacity: 0 }
      ], { duration: dur, delay: reduce ? 0 : idx * 160, easing: 'ease-in-out', fill: 'forwards' });
      anim.onfinish = function () {
        el.remove();
        got[idx] = chunk;
        arrived++;
        // показуємо, що пакети приходять не по черзі
        out.textContent = got.map(function (c) { return c === undefined ? '▯▯▯▯' : c; }).join('');
        if (arrived === chunks.length) {
          out.textContent = text + '  ✓ зібрано з ' + chunks.length + ' пакетів';
          sending = false;
        }
      };
    });
  });

  /* ---------- 4. Поява, лічильники, меню ---------- */
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-to')), dec = String(to).indexOf('.') > -1 ? 1 : 0, t0 = null;
    if (reduce) { el.textContent = String(to).replace('.', ','); return; }
    requestAnimationFrame(function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1400, 1);
      el.textContent = (to * (1 - Math.pow(1 - p, 4))).toFixed(dec).replace('.', ',');
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
  document.querySelectorAll('.reveal').forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 0.07 + 's';
    io.observe(el);
  });

  var links = Array.prototype.slice.call(document.querySelectorAll('.menu nav a'));
  window.addEventListener('scroll', function () {
    var cur = null;
    links.forEach(function (a) {
      if (document.querySelector(a.getAttribute('href')).getBoundingClientRect().top < innerHeight * .4) cur = a;
    });
    links.forEach(function (a) { a.classList.toggle('is-active', a === cur); });
  }, { passive: true });
})();
