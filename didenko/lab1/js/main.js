/* «Кидай кубик» — інтерактив сайту */
(function () {
  var html = document.documentElement, SHOT = html.classList.contains('shot');
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var page = document.body.getAttribute('data-page');
  var Y = '#ffc93c', CO = '#ff6b5b', IN = '#2a2466', MI = '#5fd3c3', W = '#fffaf0';
  var meeple = window.meepleSVG, isoDie = window.isoDie;
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function byId(id) { return GAMES.filter(function (g) { return g.id === id; })[0]; }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function plural(n, a, b, c) { var m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c; }
  function toast(msg) { var t = $('.toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('show'); }, 2600); }

  /* ---------- шапка, меню, прелоадер, переходи ---------- */
  $$('#nav a').forEach(function (a) { if (a.getAttribute('data-p') === page) a.classList.add('active'); });
  var burger = $('.burger'), nav = $('#nav');
  burger.addEventListener('click', function () { var o = nav.classList.toggle('open'); burger.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); document.body.classList.toggle('menu-open', o); });
  var header = $('.header');
  function onScroll() { header.classList.toggle('scrolled', scrollY > 30); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function hidePre() { var p = $('#preloader'); if (p && !p.classList.contains('done')) { p.classList.add('done'); setTimeout(function () { p.remove(); }, 600); } }
  if (SHOT) hidePre(); else { addEventListener('load', function () { setTimeout(hidePre, 250); }); setTimeout(hidePre, 900); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a || SHOT || REDUCED || e.ctrlKey || e.metaKey || e.shiftKey || a.target === '_blank') return;
    var h = a.getAttribute('href'); if (!h || h.charAt(0) === '#' || /^(https?:|mailto:|tel:)/.test(h)) return;
    e.preventDefault(); document.body.classList.add('leaving'); setTimeout(function () { location.href = h; }, 380);
  });
  addEventListener('pageshow', function () { document.body.classList.remove('leaving'); });

  /* ---------- список бажань ---------- */
  var wish = store('kk_wish') || [];
  function paintWish() { $('#wishN').textContent = wish.length; $('.wish-link').classList.toggle('has', wish.length > 0); }
  function toggleWish(id) {
    var i = wish.indexOf(id); if (i > -1) wish.splice(i, 1); else wish.push(id);
    store('kk_wish', wish); paintWish();
    var w = $('.wish-link'); w.classList.remove('bump'); void w.offsetWidth; w.classList.add('bump');
    toast(i > -1 ? 'Прибрано зі списку бажань' : '«' + byId(id).name + '» — у списку бажань ♥');
    return i === -1;
  }
  paintWish();

  /* ---------- reveal і лічильники ---------- */
  function countUp(el) {
    var end = +el.getAttribute('data-count');
    if (SHOT || REDUCED) { el.textContent = end; return; }
    var t0 = performance.now(); (function f(t) { var k = Math.min(1, (t - t0) / 1600); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  var io = !SHOT && 'IntersectionObserver' in window ? new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (!x.isIntersecting) return; var t = x.target; t.classList.add('in'); $$('[data-count]', t).concat(t.hasAttribute('data-count') ? [t] : []).forEach(function (c) { if (!c.counted) { c.counted = 1; countUp(c); } }); if (t._onIn) t._onIn(); io.unobserve(t); });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' }) : null;
  function reveal(root) {
    $$('.reveal:not(.in), .counters .cnt', root).forEach(function (e) {
      if (io) io.observe(e); else { e.classList.add('in'); $$('[data-count]', e).forEach(countUp); if (e._onIn) e._onIn(); }
    });
  }

  /* ---------- модалка гри ---------- */
  var modal = $('#modal');
  function weightDots(w) { var s = ''; for (var i = 1; i <= 5; i++) s += '<i class="' + (w >= i ? 'f' : w >= i - .5 ? 'h' : '') + '"></i>'; return s; }
  function openGame(id) {
    var g = byId(id); if (!g || !modal) return;
    var on = wish.indexOf(id) > -1, hasRules = ['carcassonne', 'catan', 'dixit', 'codenames', 'pandemic'].indexOf(id) > -1;
    $('#mBody').innerHTML = '<div class="m-cover">' + coverSVG(g, true) + '</div><div class="m-info"><span class="eyebrow">' + g.genres.map(function (x) { return GENRES[x]; }).join(' · ') + '</span><h3>' + esc(g.name) + '</h3><p class="m-orig">' + esc(g.orig) + ', ' + g.year + '</p>' +
      '<div class="m-stats"><div><b>' + g.min + (g.max > g.min ? '–' + g.max : '') + '</b><span>гравців</span></div><div><b>' + g.time + '</b><span>хвилин</span></div><div><b>' + g.age + '+</b><span>років</span></div><div><b class="wdots">' + weightDots(g.weight) + '</b><span>складність ' + g.weight.toFixed(1) + '</span></div></div>' +
      '<p>' + esc(g.desc) + '</p><div class="m-why"><b>Чому я її люблю</b><p>' + esc(g.why) + '</p></div>' +
      '<div class="m-btns"><button class="btn ' + (on ? 'btn-co' : 'btn-ind') + '" id="mWish">' + (on ? '♥ У списку бажань' : '♡ Додати до списку') + '</button>' + (hasRules ? '<a class="btn btn-line" href="rules.html#' + id + '">Правила гри</a>' : '') + '</div></div>';
    $('#mWish').addEventListener('click', function () { var now = toggleWish(id); this.className = 'btn ' + (now ? 'btn-co' : 'btn-ind'); this.textContent = now ? '♥ У списку бажань' : '♡ Додати до списку'; if (page === 'catalog') drawCatalog && drawCatalog(); });
    modal.classList.add('open'); document.body.style.overflow = 'hidden';
  }
  function closeModal() { if (!modal) return; modal.classList.remove('open'); document.body.style.overflow = ''; }
  if (modal) {
    modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('.m-x')) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  }
  document.addEventListener('click', function (e) { var c = e.target.closest('[data-open]'); if (c && !e.target.closest('.wish-btn')) { e.preventDefault(); openGame(c.getAttribute('data-open')); } });

  function gameCard(g, i) {
    var on = wish.indexOf(g.id) > -1;
    return '<article class="gcard reveal" style="--i:' + (i % 4) + '"><button class="g-box" data-open="' + g.id + '" aria-label="Відкрити опис гри ' + esc(g.name) + '">' + coverSVG(g) + '<span class="g-more">Детальніше</span></button>' +
      '<button class="wish-btn' + (on ? ' on' : '') + '" data-wish="' + g.id + '" aria-label="Список бажань" aria-pressed="' + on + '">♥</button>' +
      '<div class="g-body"><div class="g-tags">' + g.genres.map(function (x) { return '<span class="tag t-' + x + '">' + GENRES[x] + '</span>'; }).join('') + '</div><h3>' + esc(g.name) + '</h3>' +
      '<ul class="g-meta"><li title="Гравців">👥 ' + g.min + (g.max > g.min ? '–' + g.max : '') + '</li><li title="Тривалість">⏱ ' + g.time + ' хв</li><li title="Вік">🔞 ' + g.age + '+</li></ul>' +
      '<div class="g-weight" title="Складність ' + g.weight.toFixed(1) + ' з 5"><span>Складність</span><b class="wdots">' + weightDots(g.weight) + '</b></div></div></article>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-wish]'); if (!b) return;
    var on = toggleWish(b.getAttribute('data-wish')); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    if (page === 'catalog' && drawCatalog) drawCatalog();
  });

  /* ---------- декоративні SVG-композиції ---------- */
  function svgWrap(vb, inner, cls) { return '<svg viewBox="' + vb + '" class="' + (cls || '') + '" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>'; }
  function heroArt() {
    var s = '<defs><radialGradient id="hglow"><stop offset="0" stop-color="#7b5cd6" stop-opacity=".55"/><stop offset="1" stop-color="#7b5cd6" stop-opacity="0"/></radialGradient></defs><circle cx="260" cy="250" r="230" fill="url(#hglow)"/>';
    /* ізометрична платформа */
    s += '<g class="lay" data-d="6"><path d="M260 330 L460 445 L260 560 L60 445Z" fill="#3b33a0"/><path d="M60 445 L260 560 V590 L60 475Z" fill="#231d63"/><path d="M460 445 L260 560 V590 L460 475Z" fill="#2c2580"/>';
    for (var i = 1; i < 6; i++) s += '<path d="M' + (60 + i * 33.3) + ' ' + (445 - i * 19.2) + ' L' + (260 + i * 33.3) + ' ' + (560 - i * 19.2) + '" stroke="#fff" stroke-opacity=".07"/><path d="M' + (260 - i * 33.3) + ' ' + (330 + i * 19.2) + ' L' + (460 - i * 33.3) + ' ' + (445 + i * 19.2) + '" stroke="#fff" stroke-opacity=".07"/>';
    s += '</g>';
    s += '<g class="lay fl1" data-d="14">' + isoDie(200, 360, 70, Y, '#f0a91c', '#d48e0a', IN, [5, 2, 3]) + '</g>';
    s += '<g class="lay fl2" data-d="22">' + isoDie(330, 300, 56, CO, '#e0503f', '#c23d2e', W, [6, 4, 1]) + '</g>';
    s += '<g class="lay fl3" data-d="30">' + isoDie(380, 170, 40, W, '#ddd6f5', '#bfb4ea', IN, [3, 5, 2]) + '</g>';
    s += '<g class="lay fl4" data-d="18">' + meeple(120, 470, 1.25, MI, -8) + meeple(400, 470, 1.1, Y, 6) + meeple(300, 515, 1, CO) + '</g>';
    s += '<g class="lay fl5" data-d="34"><g transform="translate(120 170) rotate(-14)"><rect x="-45" y="-64" width="90" height="128" rx="10" fill="' + W + '"/><rect x="-36" y="-55" width="72" height="110" rx="6" fill="none" stroke="' + IN + '" stroke-width="2" stroke-dasharray="4 4"/><path d="M0 22 C-26 4 -22 -18 -8 -18 C-2 -18 0 -12 0 -10 C0 -12 2 -18 8 -18 C22 -18 26 4 0 22Z" fill="' + CO + '"/><text x="-28" y="-36" font-family="Rubik" font-weight="700" font-size="20" fill="' + CO + '">7</text></g></g>';
    s += '<g class="lay fl6" data-d="26"><g transform="translate(196 92) rotate(10)"><rect x="-38" y="-54" width="76" height="108" rx="9" fill="' + MI + '"/><path d="M-20 -10 L0 -34 L20 -10 L0 14Z" fill="' + W + '"/><circle cy="30" r="9" fill="' + IN + '"/></g></g>';
    s += '<g class="lay sp" data-d="40" fill="' + Y + '"><path d="M450 90 l5 12 12 5 -12 5 -5 12 -5 -12 -12 -5 12 -5z"/><path d="M60 300 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="' + MI + '"/><circle cx="470" cy="300" r="6" fill="' + CO + '"/><circle cx="40" cy="120" r="5"/></g>';
    return svgWrap('0 0 520 600', s, 'hero-svg');
  }
  function decoArt(kind) {
    if (kind === 'catalog') {
      var g = [byId('azul'), byId('catan'), byId('dixit')], s = '';
      g.forEach(function (x, i) { s += '<g transform="translate(' + (40 + i * 80) + ' ' + (30 + (i % 2) * 24) + ') rotate(' + (-10 + i * 10) + ' 80 80)"><rect x="4" y="8" width="160" height="160" rx="10" fill="#000" opacity=".25"/>' + coverSVG(x).replace('<svg ', '<svg x="0" y="0" width="160" height="160" ') + '</g>'; });
      return svgWrap('0 0 380 260', s + meeple(330, 230, .9, Y, 10));
    }
    if (kind === 'rules') return svgWrap('0 0 380 260', '<g transform="translate(110 130) rotate(-12)"><rect x="-70" y="-95" width="140" height="190" rx="14" fill="' + W + '"/><path d="M-46 -60 h92 M-46 -36 h70 M-46 -12 h86 M-46 12 h60 M-46 36 h80" stroke="' + IN + '" stroke-opacity=".35" stroke-width="7" stroke-linecap="round"/><circle cx="-46" cy="66" r="10" fill="' + CO + '"/><text x="-50" y="71" font-size="13" font-weight="700" fill="#fff" font-family="Rubik">1</text></g>' + isoDie(260, 120, 54, Y, '#f0a91c', '#d48e0a', IN, [4, 6, 2]) + meeple(310, 236, 1, CO, 8) + meeple(220, 240, .8, MI, -6));
    if (kind === 'club') return svgWrap('0 0 380 260', '<ellipse cx="190" cy="200" rx="170" ry="46" fill="#3b33a0"/><ellipse cx="190" cy="192" rx="150" ry="36" fill="#2f7d4f"/>' + meeple(80, 160, 1.1, Y, -6) + meeple(150, 150, 1.2, CO) + meeple(230, 150, 1.2, MI) + meeple(300, 162, 1.05, W, 6) + isoDie(190, 176, 20, W, '#ddd6f5', '#bfb4ea', IN, [6, 1, 2]) + '<path d="M190 20 v40" stroke="' + W + '" stroke-opacity=".4" stroke-width="2"/><path d="M166 60 h48 l-8 -14 h-32z" fill="' + Y + '"/><path d="M166 60 L110 180 H270 L214 60Z" fill="' + Y + '" opacity=".12"/>');
    return '';
  }
  $$('[data-art]').forEach(function (el) { el.innerHTML = decoArt(el.getAttribute('data-art')); });

  /* мишачий паралакс для шарів */
  function mouseParallax(root) {
    if (SHOT || REDUCED || !root) return;
    var L = $$('.lay', root);
    root.addEventListener('mousemove', function (e) { var r = root.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; L.forEach(function (l) { var d = +l.getAttribute('data-d'); l.style.transform = 'translate(' + (-x * d).toFixed(1) + 'px,' + (-y * d).toFixed(1) + 'px)'; }); });
    root.addEventListener('mouseleave', function () { L.forEach(function (l) { l.style.transform = ''; }); });
  }

  /* ---------- canvas: кидок кубиків ---------- */
  function diceCanvas(cv) {
    var ctx = cv.getContext('2d'), W0, H0, dpr = Math.min(2, devicePixelRatio || 1), dice = [], n = 2, rolling = false, hist = [];
    function size() { W0 = cv.clientWidth; H0 = cv.clientHeight; cv.width = W0 * dpr; cv.height = H0 * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); if (!rolling) place(); draw(); }
    var PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
    var COLS = [[Y, '#e0a010', IN], [CO, '#c94434', '#fff'], [W, '#cfc6ef', IN]];
    function place() { dice = []; for (var i = 0; i < n; i++) dice.push({ x: W0 / 2 + (i - (n - 1) / 2) * 110, y: H0 / 2 + 10, a: (i - 1) * .25, v: [3, 5, 6][i], s: Math.min(78, W0 / 6), col: COLS[i], z: 0 }); }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
    function draw() {
      var g = ctx.createRadialGradient(W0 / 2, H0 / 2, 20, W0 / 2, H0 / 2, W0 * .7); g.addColorStop(0, '#2f9a63'); g.addColorStop(1, '#14502f');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W0, H0);
      ctx.globalAlpha = .06; ctx.fillStyle = '#fff'; for (var yy = 0; yy < H0; yy += 6) ctx.fillRect(0, yy, W0, 1); ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.setLineDash([8, 8]); ctx.lineWidth = 2; rr(18, 18, W0 - 36, H0 - 36, 18); ctx.stroke(); ctx.setLineDash([]);
      dice.forEach(function (d) {
        var s = d.s * (1 + d.z * .004);
        ctx.save(); ctx.translate(d.x + 8 + d.z * .3, d.y + 12 + d.z * .5); ctx.rotate(d.a); ctx.fillStyle = 'rgba(0,0,0,' + (.3 - d.z * .002) + ')'; rr(-s / 2, -s / 2, s, s, s * .2); ctx.fill(); ctx.restore();
        ctx.save(); ctx.translate(d.x, d.y - d.z); ctx.rotate(d.a);
        var gg = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2); gg.addColorStop(0, d.col[0]); gg.addColorStop(1, d.col[1]);
        ctx.fillStyle = gg; rr(-s / 2, -s / 2, s, s, s * .2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; rr(-s / 2 + 3, -s / 2 + 3, s - 6, s - 6, s * .17); ctx.stroke();
        ctx.fillStyle = d.col[2]; PIPS[d.v].forEach(function (p) { ctx.beginPath(); ctx.arc(p[0] * s * .26, p[1] * s * .26, s * .085, 0, 6.283); ctx.fill(); });
        ctx.restore();
      });
    }
    function roll() {
      if (rolling) return; rolling = true; $('#rollBtn').disabled = true; $('#rollRes').textContent = '…';
      var s = Math.min(78, W0 / 6);
      dice = []; for (var i = 0; i < n; i++) dice.push({ x: 40 + Math.random() * 60, y: 40 + Math.random() * (H0 - 80), vx: 9 + Math.random() * 6, vy: (Math.random() - .5) * 12, a: Math.random() * 6, va: (Math.random() - .5) * .6, v: 1 + (Math.random() * 6 | 0), s: s, col: COLS[i], z: 60 + Math.random() * 40, vz: 0, t: 0 });
      var res = dice.map(function () { return 1 + (Math.random() * 6 | 0); });
      if (REDUCED) { dice.forEach(function (d, i) { d.x = W0 / 2 + (i - (n - 1) / 2) * 110; d.y = H0 / 2; d.z = 0; d.v = res[i]; d.a = 0; }); draw(); finish(res); return; }
      var frames = 0;
      (function step() {
        frames++; var moving = false;
        dice.forEach(function (d, i) {
          d.vz -= 1.4; d.z += d.vz; if (d.z < 0) { d.z = 0; d.vz = Math.abs(d.vz) > 3 ? -d.vz * .45 : 0; d.vx *= .82; d.vy *= .82; d.va *= .8; }
          d.x += d.vx; d.y += d.vy; d.a += d.va; d.vx *= .985; d.vy *= .985;
          var h = d.s / 2 + 22; if (d.x < h) { d.x = h; d.vx = Math.abs(d.vx) * .7; } if (d.x > W0 - h) { d.x = W0 - h; d.vx = -Math.abs(d.vx) * .7; } if (d.y < h) { d.y = h; d.vy = Math.abs(d.vy) * .7; } if (d.y > H0 - h) { d.y = H0 - h; d.vy = -Math.abs(d.vy) * .7; }
          var sp = Math.abs(d.vx) + Math.abs(d.vy) + Math.abs(d.vz);
          if (sp > .6 || d.z > 0) { moving = true; if (frames % 4 === 0) d.v = 1 + (Math.random() * 6 | 0); } else { d.v = res[i]; d.a += (Math.round(d.a / (Math.PI / 2)) * Math.PI / 2 - d.a) * .2; }
        });
        /* розштовхування кубиків */
        for (var a = 0; a < dice.length; a++) for (var b = a + 1; b < dice.length; b++) { var A = dice[a], B = dice[b], dx = B.x - A.x, dy = B.y - A.y, dist = Math.sqrt(dx * dx + dy * dy), min = A.s * 1.05; if (dist < min && dist > 0) { var k = (min - dist) / 2 / dist; A.x -= dx * k; A.y -= dy * k; B.x += dx * k; B.y += dy * k; var t = A.vx; A.vx = B.vx * .8; B.vx = t * .8; t = A.vy; A.vy = B.vy * .8; B.vy = t * .8; } }
        draw();
        if (moving && frames < 260) requestAnimationFrame(step); else { dice.forEach(function (d, i) { d.v = res[i]; d.z = 0; }); draw(); finish(res); }
      })();
    }
    function finish(res) {
      rolling = false; $('#rollBtn').disabled = false;
      var sum = res.reduce(function (a, b) { return a + b; }, 0), el = $('#rollRes'); el.textContent = sum; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
      hist.unshift(res.join('+') + (res.length > 1 ? '=' + sum : '')); hist = hist.slice(0, 8);
      var dbl = res.length > 1 && res.every(function (x) { return x === res[0]; });
      $('#rollHist').innerHTML = (dbl ? '<b class="dbl">Дубль! Ходіть ще раз 🎉</b> ' : '') + 'Останні кидки: ' + hist.map(function (h, i) { return '<span' + (i ? '' : ' class="last"') + '>' + h + '</span>'; }).join('');
    }
    $$('.dice-n button').forEach(function (b) { b.addEventListener('click', function () { if (rolling) return; n = +b.getAttribute('data-n'); $$('.dice-n button').forEach(function (x) { x.classList.toggle('on', x === b); }); place(); draw(); }); });
    $('#rollBtn').addEventListener('click', roll);
    cv.addEventListener('click', roll);
    addEventListener('resize', size); size();
  }

  /* ---------- футер: кубик-порадник ---------- */
  var ADV = ['Сьогодні — «Кодові імена»: швидко і весело.', 'Випало 2: ідеальний вечір для «Печворку» вдвох.', 'Випало 3: «Азул» і чай з лимоном.', 'Випало 4: час рятувати світ у «Пандемії».', 'Випало 5: збирайте компанію на «Колонізаторів»!', 'Випало 6: розкладайте «Тераформування Марса» — на весь вечір.'];
  var fr = $('#footRoll');
  fr.addEventListener('click', function () { var v = 1 + (Math.random() * 6 | 0); fr.textContent = '⚀⚁⚂⚃⚄⚅'.charAt(v - 1); fr.classList.remove('spin'); void fr.offsetWidth; fr.classList.add('spin'); $('#footMsg').textContent = ADV[v - 1]; });

  /* ================= СТОРІНКИ ================= */
  var drawCatalog = null;
  var P = {
    home: function () {
      $('#heroArt').innerHTML = heroArt(); mouseParallax($('.hero'));
      var names = GAMES.map(function (g) { return '<span>' + esc(g.name) + '</span><i>✦</i>'; }).join('');
      $('#marquee').innerHTML = names + names;
      var GF = [
        ['strategy', 'Стратегії', '♜', 'Плануєте на кілька ходів уперед, будуєте економіку, ділите карту. Партія триває годину-дві й дарує відчуття, що ви — геній.', 'Колонізатори, Тераформування Марса, Рут'],
        ['party', 'Вечірні', '🎉', 'Пояснюються за хвилину, підходять для 6–8 людей і будь-якого рівня досвіду. Головне тут — сміх і асоціації.', 'Кодові імена, Діксіт, Тільки одне'],
        ['coop', 'Кооперативи', '🤝', 'Усі граєте разом проти гри: рятуєте світ від хвороб чи розслідуєте вбивство привида. Перемагаєте або програєте всі.', 'Пандемія, Ханабі, Містеріум'],
        ['family', 'Сімейні', '🏡', 'Прості правила, яскраві компоненти й короткі партії. Чудово для дітей, батьків і перших кроків у хобі.', 'Каркасон, Квиток на потяг, Королівство доміно']
      ];
      $('#genreFlip').innerHTML = GF.map(function (x, i) { return '<div class="flip reveal" style="--i:' + i + '" tabindex="0"><div class="flip-in"><div class="fl-front t-' + x[0] + '"><span class="fl-ico">' + x[2] + '</span><b>' + x[1] + '</b><small>переверни картку ↻</small></div><div class="fl-back"><b>' + x[1] + '</b><p>' + x[3] + '</p><small>Наприклад: ' + x[4] + '</small></div></div></div>'; }).join('');
      $$('.flip').forEach(function (f) { f.addEventListener('click', function () { f.classList.toggle('turned'); }); });
      var cg = byId('carcassonne');
      $('#gotwBox').innerHTML = '<div class="box-3d" data-open="carcassonne" role="button" tabindex="0" aria-label="Відкрити опис гри Каркасон"><div class="bx-front">' + coverSVG(cg, true) + '</div><div class="bx-side"></div><div class="bx-top"></div></div><span class="gotw-badge">★ гра тижня</span>';
      $('#picks').innerHTML = ['carcassonne', 'codenames', 'ticket', 'azul'].map(function (id, i) { return gameCard(byId(id), i); }).join('');
      $('#ctaArt').innerHTML = decoArt('club');
      diceCanvas($('#diceCanvas'));
      var q = new URLSearchParams(location.search); if (q.get('game')) openGame(q.get('game'));
    },

    catalog: function () {
      var st = { q: '', g: 'all', p: 0, t: 0, w: 5, sort: 'name', wish: false };
      var q = new URLSearchParams(location.search);
      if (q.get('q')) { st.q = q.get('q'); $('#q').value = st.q; }
      if (q.get('wish')) { st.wish = true; }
      $('#gChips').innerHTML = '<button class="chip on" data-g="all">Усі жанри</button>' + Object.keys(GENRES).map(function (k) { return '<button class="chip c-' + k + '" data-g="' + k + '">' + GENRES[k] + ' <i>' + GAMES.filter(function (g) { return g.genres.indexOf(k) > -1; }).length + '</i></button>'; }).join('');
      function match(g) {
        var t = st.q.toLowerCase().trim();
        if (t && (g.name + ' ' + g.orig + ' ' + g.desc + ' ' + g.genres.map(function (x) { return GENRES[x]; }).join(' ')).toLowerCase().indexOf(t) < 0) return false;
        if (st.g !== 'all' && g.genres.indexOf(st.g) < 0) return false;
        if (st.p) { if (st.p === 6 ? g.max < 6 : (g.min > st.p || g.max < st.p)) return false; }
        if (st.t === 1 && g.time > 30) return false; if (st.t === 2 && (g.time <= 30 || g.time > 60)) return false; if (st.t === 3 && g.time <= 60) return false;
        if (g.weight > st.w + 1e-9) return false;
        if (st.wish && wish.indexOf(g.id) < 0) return false;
        return true;
      }
      drawCatalog = function () {
        var list = GAMES.filter(match).sort(function (a, b) { return st.sort === 'name' ? a.name.localeCompare(b.name, 'uk') : st.sort === 'year' ? b.year - a.year : a[st.sort] - b[st.sort]; });
        $('#grid').innerHTML = list.map(gameCard).join('');
        $('#count').textContent = list.length; $('#empty').hidden = list.length > 0;
        $('#wishOnly').classList.toggle('on', st.wish); $('#wishOnly').setAttribute('aria-pressed', st.wish);
        reveal($('#grid'));
      };
      $('#q').addEventListener('input', function () { st.q = this.value; drawCatalog(); });
      $('#fPlayers').addEventListener('change', function () { st.p = +this.value; drawCatalog(); });
      $('#sort').addEventListener('change', function () { st.sort = this.value; drawCatalog(); });
      $('#fWeight').addEventListener('input', function () { st.w = +this.value; $('#wVal').textContent = st.w.toFixed(1); this.style.setProperty('--p', ((st.w - 1) / 4 * 100) + '%'); drawCatalog(); });
      $('#gChips').addEventListener('click', function (e) { var b = e.target.closest('[data-g]'); if (!b) return; st.g = b.getAttribute('data-g'); $$('#gChips .chip').forEach(function (c) { c.classList.toggle('on', c === b); }); drawCatalog(); });
      $('#tChips').addEventListener('click', function (e) { var b = e.target.closest('[data-t]'); if (!b) return; st.t = +b.getAttribute('data-t'); $$('#tChips .chip').forEach(function (c) { c.classList.toggle('on', c === b); }); drawCatalog(); });
      $('#wishOnly').addEventListener('click', function () { st.wish = !st.wish; drawCatalog(); });
      function reset() { st = { q: '', g: 'all', p: 0, t: 0, w: 5, sort: st.sort, wish: false }; $('#q').value = ''; $('#fPlayers').value = '0'; $('#fWeight').value = 5; $('#fWeight').style.setProperty('--p', '100%'); $('#wVal').textContent = '5.0'; $$('#gChips .chip, #tChips .chip').forEach(function (c, i) { c.classList.toggle('on', c.getAttribute('data-g') === 'all' || c.getAttribute('data-t') === '0'); }); drawCatalog(); }
      $('#reset').addEventListener('click', reset); $('#reset2').addEventListener('click', reset);
      $('#fWeight').style.setProperty('--p', '100%');
      drawCatalog();
      if (q.get('game')) openGame(q.get('game'));
    },

    rules: function () {
      $$('[data-cover]').forEach(function (el) { el.innerHTML = coverSVG(byId(el.getAttribute('data-cover'))); el.setAttribute('data-open', el.getAttribute('data-cover')); el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0'); });
      $$('[data-meta]').forEach(function (el) { var g = byId(el.getAttribute('data-meta')); el.innerHTML = '<div><b>' + g.min + '–' + g.max + '</b><span>гравців</span></div><div><b>' + g.time + '</b><span>хв</span></div><div><b>' + g.age + '+</b><span>вік</span></div>'; });
      $$('[data-ico]').forEach(function (el) { var g = byId(el.getAttribute('data-ico')); el.style.background = g.c1; });
      var tabs = $$('.r-tabs [role=tab]');
      function show(id, focus) {
        tabs.forEach(function (t) { var on = t.getAttribute('data-tab') === id; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
        $$('.r-panel').forEach(function (p) { var on = p.id === 'p-' + id; p.hidden = !on; p.classList.toggle('on', on); });
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { show(t.getAttribute('data-tab')); history.replaceState(null, '', '#' + t.getAttribute('data-tab')); });
        t.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; show(n.getAttribute('data-tab'), true); } });
      });
      var h = location.hash.slice(1); if (h && $('#p-' + h)) { show(h); setTimeout(function () { $('.r-tabs').scrollIntoView(); }, 50); }

      /* анкета */
      var Q = [
        { k: 'p', t: 'Скільки вас буде за столом?', o: [['2', 'Двоє', '👫'], ['3', 'Троє-четверо', '👨‍👩‍👦'], ['5', 'П’ятеро-шестеро', '🧑‍🤝‍🧑'], ['7', 'Сім і більше', '🎉']] },
        { k: 't', t: 'Скільки часу на одну партію?', o: [['20', 'До 30 хвилин', '⚡'], ['45', 'Близько години', '☕'], ['90', 'Хоч увесь вечір', '🌙']] },
        { k: 'm', t: 'Який настрій вечора?', o: [['party', 'Сміятися й спілкуватися', '😂'], ['coop', 'Грати разом проти гри', '🤝'], ['strategy', 'Позмагатися розумом', '🧠'], ['family', 'Щось затишне й спокійне', '🍵']] },
        { k: 'e', t: 'Наскільки компанія досвідчена?', o: [['1', 'Новачки — перша настілка', '🌱'], ['2', 'Трохи грали', '🎲'], ['3', 'Досвідчені гравці', '🏆']] }
      ];
      var ans = {}, stepI = 0, stage = $('#qStage');
      function bar() { $('#qBar').style.width = (stepI / Q.length * 100) + '%'; }
      function ask() {
        bar(); var q = Q[stepI];
        stage.innerHTML = '<div class="q-step"><small>Запитання ' + (stepI + 1) + ' з ' + Q.length + '</small><h3>' + q.t + '</h3><div class="q-opts">' + q.o.map(function (o) { return '<button class="q-opt' + (ans[q.k] === o[0] ? ' on' : '') + '" data-v="' + o[0] + '"><span>' + o[2] + '</span>' + o[1] + '</button>'; }).join('') + '</div>' + (stepI ? '<button class="link q-back">← назад</button>' : '') + '</div>';
      }
      function score(g) {
        var p = +ans.p, t = +ans.t, e = +ans.e, s = 0;
        if (p >= g.min && p <= g.max) s += 4; else if (p === 7 && g.max >= 6) s += 3; else if (p === 3 && g.min <= 4 && g.max >= 3) s += 4; else if (p === 5 && g.max >= 5) s += 3; else s -= 6;
        s -= Math.abs(g.time - t) / 20;
        if (g.genres.indexOf(ans.m) > -1) s += 4;
        var ideal = e === 1 ? 1.3 : e === 2 ? 2 : 3; s -= Math.abs(g.weight - ideal) * 2;
        return s;
      }
      function result() {
        stepI = Q.length; bar();
        var top = GAMES.map(function (g) { return [score(g), g]; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, 3);
        stage.innerHTML = '<div class="q-res"><small>Ваша ідеальна трійка</small><h3>Спробуйте ці ігри</h3><ol class="q-top">' + top.map(function (x, i) { var g = x[1]; return '<li style="--i:' + i + '"><button class="q-g" data-open="' + g.id + '"><span class="q-cov">' + coverSVG(g) + '</span><span class="q-txt"><b>' + (i + 1) + '. ' + esc(g.name) + '</b><em>' + g.min + '–' + g.max + ' гравців · ' + g.time + ' хв · складність ' + g.weight.toFixed(1) + '</em><span>' + esc(g.why) + '</span></span></button></li>'; }).join('') + '</ol><button class="btn btn-ind q-again">Пройти ще раз ↻</button></div>';
        store('kk_quiz', ans);
      }
      stage.addEventListener('click', function (e) {
        var o = e.target.closest('.q-opt'); if (o) { ans[Q[stepI].k] = o.getAttribute('data-v'); o.classList.add('on'); stage.classList.add('out'); setTimeout(function () { stage.classList.remove('out'); stepI++; if (stepI < Q.length) ask(); else result(); }, SHOT ? 0 : 260); return; }
        if (e.target.closest('.q-back')) { stepI--; ask(); }
        if (e.target.closest('.q-again')) { ans = {}; stepI = 0; ask(); }
      });
      if (SHOT) { ans = { p: '3', t: '45', m: 'family', e: '1' }; result(); } else ask();
      $('#quizArt').innerHTML = svgWrap('0 0 300 160', isoDie(70, 50, 44, Y, '#f0a91c', '#d48e0a', IN, [2, 3, 6]) + isoDie(160, 80, 34, CO, '#e0503f', '#c23d2e', W, [5, 1, 4]) + meeple(240, 140, 1, MI, 8) + '<text x="200" y="40" font-family="Rubik" font-weight="700" font-size="54" fill="' + Y + '">?</text>');
    },

    club: function () {
      var T = new Date(); T.setHours(0, 0, 0, 0);
      function next(dow, k) { var d = new Date(T); d.setDate(d.getDate() + ((dow - d.getDay() + 7) % 7 || 7) + k * 7); return d; }
      var M = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'], D = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П’ятниця', 'Субота'];
      var EV = [
        { d: next(5, 0), time: '18:30', type: 'open', title: 'Відкритий вечір: вечірки та новинки', text: 'Кодові імена, Тільки одне й прем’єра «Каскадії» в клубі.', seats: 24, games: ['codenames', 'just-one', 'cascadia'] },
        { d: next(0, 0), time: '12:00', type: 'family', title: 'Сімейна неділя', text: 'Ігри для дітей від 6 років і їхніх батьків: Королівство доміно, Каркасон, Король Токіо.', seats: 16, games: ['kingdomino', 'carcassonne', 'king-tokyo'] },
        { d: next(6, 0), time: '15:00', type: 'tour', title: 'Турнір «Каркасон-2026»', text: 'Швейцарська система, 4 тури по 45 хвилин. Призи — доповнення до гри.', seats: 20, games: ['carcassonne'] },
        { d: next(5, 1), time: '18:30', type: 'open', title: 'Вечір кооперативів', text: 'Рятуємо світ у «Пандемії», запускаємо феєрверк у «Ханабі» й розслідуємо справу в «Містеріумі».', seats: 20, games: ['pandemic', 'hanabi', 'mysterium'] },
        { d: next(3, 1), time: '19:00', type: 'heavy', title: 'Стратегічна середа', text: 'Довгі партії для досвідчених: «Тераформування Марса» та «Рут». Бажано знати правила.', seats: 8, games: ['mars', 'root'] },
        { d: next(5, 2), time: '18:30', type: 'open', title: 'Вечір для новачків', text: 'Пояснюємо правила з нуля. Ідеальний шанс привести друзів, які «ніколи не грали».', seats: 24, games: ['ticket', 'azul', 'dixit'] }
      ].sort(function (a, b) { return a.d - b.d; });
      var TYPES = { open: ['Відкритий', 'co'], family: ['Сімейний', 'mi'], tour: ['Турнір', 'y'], heavy: ['Хардкор', 'in'] };
      var reg = store('kk_signup') || {};
      function sched() {
        $('#schedule').innerHTML = EV.map(function (e, i) {
          var key = e.d.toISOString().slice(0, 10) + e.type, mine = !!reg[key], taken = Math.round(e.seats * (.45 + ((i * 37) % 40) / 100)) + (mine ? 1 : 0), left = Math.max(0, e.seats - taken);
          return '<article class="ev reveal ' + (mine ? 'mine' : '') + '" style="--i:' + (i % 3) + '"><div class="ev-date t-' + TYPES[e.type][1] + '"><b>' + e.d.getDate() + '</b><span>' + M[e.d.getMonth()] + '</span><small>' + D[e.d.getDay()] + '</small></div><div class="ev-body"><span class="ev-type t-' + TYPES[e.type][1] + '">' + TYPES[e.type][0] + ' · ' + e.time + '</span><h3>' + e.title + '</h3><p>' + e.text + '</p><div class="ev-games">' + e.games.map(function (id) { var g = byId(id); return '<button class="ev-g" data-open="' + id + '" style="--c:' + g.c1 + '">' + esc(g.name) + '</button>'; }).join('') + '</div><div class="ev-foot"><div class="seats"><i style="width:' + (taken / e.seats * 100) + '%"></i></div><small>' + (left ? 'вільно ' + left + ' ' + plural(left, 'місце', 'місця', 'місць') + ' з ' + e.seats : 'місць немає') + '</small><button class="btn ' + (mine ? 'btn-co' : 'btn-ind') + ' btn-sm" data-reg="' + key + '"' + (!left && !mine ? ' disabled' : '') + '>' + (mine ? '✓ Ви записані' : 'Записатися') + '</button></div></div></article>';
        }).join('');
        reveal($('#schedule'));
      }
      $('#schedule').addEventListener('click', function (e) {
        var b = e.target.closest('[data-reg]'); if (!b) return; var k = b.getAttribute('data-reg');
        if (reg[k]) { delete reg[k]; toast('Запис скасовано'); } else { reg[k] = 1; toast('Ви записані! Чекаємо на вас 🎲'); }
        store('kk_signup', reg); sched();
      });
      sched();
      /* галерея */
      var G = [['table', 'Перша партія в «Каркасон» у новому сезоні'], ['party', 'Вечір «Кодових імен» на 14 гравців'], ['tourney', 'Фінал весняного турніру'], ['cozy', 'Затишна субота з «Азулом»'], ['kids', 'Сімейна неділя: діти виграли'], ['night', 'Нічний марафон «Діксіту»'], ['win', 'Нагородження переможців'], ['snacks', 'Перерва на чай і печиво']];
      $('#gallery').innerHTML = G.map(function (g, i) { return '<button class="g-item reveal" style="--i:' + (i % 4) + '" data-i="' + i + '"><span class="g-img">' + sceneSVG(g[0]) + '</span><span class="g-cap">' + g[1] + '</span><span class="g-zoom">⤢</span></button>'; }).join('');
      var lb = $('#lightbox'), cur = 0;
      function lshow(i) { cur = (i + G.length) % G.length; $('.lb-img', lb).innerHTML = sceneSVG(G[cur][0]); $('.lb-cap', lb).innerHTML = '<b>' + G[cur][1] + '</b><span>' + (cur + 1) + ' / ' + G.length + '</span>'; lb.classList.remove('anim'); void lb.offsetWidth; lb.classList.add('anim'); }
      $('#gallery').addEventListener('click', function (e) { var b = e.target.closest('.g-item'); if (!b) return; lshow(+b.getAttribute('data-i')); lb.classList.add('open'); document.body.style.overflow = 'hidden'; });
      function lclose() { lb.classList.remove('open'); document.body.style.overflow = ''; }
      $('.lb-x', lb).onclick = lclose; $('.lb-prev', lb).onclick = function () { lshow(cur - 1); }; $('.lb-next', lb).onclick = function () { lshow(cur + 1); };
      lb.addEventListener('click', function (e) { if (e.target === lb) lclose(); });
      document.addEventListener('keydown', function (e) { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') lclose(); if (e.key === 'ArrowLeft') lshow(cur - 1); if (e.key === 'ArrowRight') lshow(cur + 1); });
      /* рейтинг */
      var PL = [['Олена Мельник', 'Каркасон', 47, 12, MI], ['Андрій Ковальчук', 'Колонізатори', 44, 11, Y], ['Ірина Савчук', 'Азул', 39, 9, CO], ['Максим Бондар', 'Тераформування Марса', 35, 8, '#7b5cd6'], ['Софія Гнатюк', 'Діксіт', 31, 6, '#4fb0e8'], ['Тарас Лисенко', 'Кодові імена', 28, 6, '#e0a21b'], ['Дарина Петренко', 'Крила', 24, 5, '#6aa84f'], ['Ярослав Діденко', 'Каркасон', 21, 3, '#ff9f43'], ['Віктор Шевчук', 'Пандемія', 18, 3, '#c2304f'], ['Марта Гуменюк', 'Сплендор', 15, 2, '#2f78c4']];
      var mx = PL[0][2];
      $('#podium').innerHTML = [1, 0, 2].map(function (i) { var p = PL[i]; return '<div class="pod p' + (i + 1) + ' reveal" style="--i:' + i + '"><div class="pod-ava">' + svgWrap('-40 -60 80 90', meeple(0, 0, 1.4, p[4])) + '</div><b>' + p[0] + '</b><span>' + p[2] + ' очок</span><div class="pod-col"><em>' + (i + 1) + '</em></div></div>'; }).join('');
      $('#rating').innerHTML = '<div class="r-head"><span>#</span><span>Гравець</span><span>Улюблена гра</span><span>Перемог</span><span>Очки</span></div>' + PL.map(function (p, i) { return '<div class="r-row' + (p[0] === 'Ярослав Діденко' ? ' me' : '') + '"><span class="r-n">' + (i + 1) + '</span><span class="r-name"><i style="background:' + p[4] + '"></i>' + p[0] + (p[0] === 'Ярослав Діденко' ? ' <small>(автор)</small>' : '') + '</span><span class="r-fav">' + p[1] + '</span><span class="r-w">' + p[3] + '</span><span class="r-bar"><i style="--w:' + (p[2] / mx * 100).toFixed(0) + '%"></i><b>' + p[2] + '</b></span></div>'; }).join('');
    },

    author: function () {
      $('#ava').innerHTML = svgWrap('0 0 240 240', '<defs><clipPath id="avc"><circle cx="120" cy="120" r="112"/></clipPath><linearGradient id="avg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b33a0"/><stop offset="1" stop-color="#1b1740"/></linearGradient></defs><circle cx="120" cy="120" r="118" fill="' + Y + '"/><g clip-path="url(#avc)"><rect width="240" height="240" fill="url(#avg)"/>' +
        '<g opacity=".25">' + isoDie(40, 50, 22, W, '#ccc', '#aaa', IN, [5, 2, 3]) + isoDie(200, 40, 18, Y, '#e0a010', '#c48a0a', IN, [3, 1, 2]) + '</g>' +
        '<path d="M40 250 C 44 192 80 174 120 174 C 160 174 196 192 200 250Z" fill="' + CO + '"/><path d="M100 174 L120 196 L140 174" fill="' + W + '"/><path d="M106 148 h28 v30 c-8 7 -20 7 -28 0z" fill="#d9a882"/>' +
        '<ellipse cx="120" cy="114" rx="38" ry="44" fill="#efc9a2"/><path d="M80 112 C 74 66 104 54 124 58 C 150 58 168 78 160 114 C 156 94 146 82 132 80 C 122 88 100 82 92 90 C 86 96 82 104 80 112Z" fill="#4a3426"/>' +
        '<ellipse cx="82" cy="118" rx="6" ry="9" fill="#e2b892"/><ellipse cx="158" cy="118" rx="6" ry="9" fill="#e2b892"/><g fill="none" stroke="' + IN + '" stroke-width="2.6"><rect x="92" y="106" width="22" height="16" rx="6"/><rect x="126" y="106" width="22" height="16" rx="6"/><path d="M114 112 h12"/></g>' +
        '<circle cx="103" cy="114" r="2.6" fill="' + IN + '"/><circle cx="137" cy="114" r="2.6" fill="' + IN + '"/><path d="M110 138 q10 9 20 0" stroke="#a5654f" stroke-width="2.8" fill="none" stroke-linecap="round"/>' +
        '<g transform="translate(160 192) rotate(-12)">' + isoDie(0, -10, 24, Y, '#e0a010', '#c48a0a', IN, [6, 4, 5]) + '</g><circle cx="168" cy="208" r="14" fill="#efc9a2"/></g>') ;
      $('#fav').innerHTML = ['carcassonne', 'mars', 'codenames', 'azul', 'root'].map(function (id, i) { var g = byId(id); return '<li class="reveal" style="--i:' + i + '"><button class="fav-g" data-open="' + id + '"><span class="fav-n">' + (i + 1) + '</span><span class="fav-c">' + coverSVG(g) + '</span><span><b>' + esc(g.name) + '</b><small>' + esc(g.why) + '</small></span></button></li>'; }).join('');
      renderUAMap($('#map'), { home: { name: 'Житомир', lon: 28.66, lat: 50.25, label: 'Житомир — дім', tip: 'Житомир · тут живе автор і збирається клуб' }, cities: ['Київ', 'Львів', 'Рівне', 'Вінниця', 'Одеса', 'Харків', 'Чернігів', 'Дніпро', 'Ужгород', 'Полтава'], labelBelow: true });
      var f = $('#contactForm'), card = $('.form-card');
      $('#f-msg').addEventListener('input', function () { $('#msgLen').textContent = this.value.length + ' / 500'; });
      var rules = { name: function (v) { return v.length < 2 ? 'Вкажіть ім’я (мінімум 2 літери)' : ''; }, email: function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v) ? '' : 'Схоже, e-mail некоректний'; }, topic: function (v) { return v ? '' : 'Оберіть тему'; }, message: function (v) { return v.length < 10 ? 'Напишіть хоча б 10 символів' : ''; } };
      Object.keys(rules).forEach(function (n) { f.elements[n].addEventListener('blur', function () { check(n); }); });
      function check(n) { var el = f.elements[n], err = rules[n](el.value.trim()), fl = el.closest('.field'); fl.classList.toggle('bad', !!err); fl.classList.toggle('good', !err); $('.err', fl).textContent = err; return !err; }
      f.addEventListener('submit', function (e) {
        e.preventDefault(); var ok = Object.keys(rules).map(check).every(Boolean);
        if (!ok) { f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); return; }
        var btn = $('button[type=submit]', f); btn.classList.add('loading');
        setTimeout(function () { btn.classList.remove('loading'); $('#okName').textContent = f.elements.name.value.trim().split(' ')[0]; card.classList.add('done'); }, SHOT ? 0 : 700);
      });
      $('#again').addEventListener('click', function () { f.reset(); $$('.field', f).forEach(function (x) { x.classList.remove('good', 'bad'); }); $('#msgLen').textContent = '0 / 500'; card.classList.remove('done'); });
    }
  };
  if (P[page]) P[page]();
  reveal(document);
})();
