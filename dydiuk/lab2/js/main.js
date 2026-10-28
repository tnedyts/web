/* Зоряний щоденник — логіка блогу · © 2026 Олександр Дидюк */
(function () {
  'use strict';
  var html = document.documentElement;
  var SHOT = html.classList.contains('shot');
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PAGE = document.body.getAttribute('data-page');
  var CATS = window.ZD_CATEGORIES || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Сховище (localStorage з try/catch) ---------- */
  var store = {
    get: function (k, def) { try { var v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var MONTHS = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
  var MONTHS_N = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
  var fmtDate = function (iso) { var d = new Date(iso + 'T12:00:00'); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); };
  var plural = function (n, a, b, c) { var m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c); };
  var strip = function (h) { return String(h).replace(/<[^>]+>/g, ' '); };
  var words = function (p) { return strip((p.body || []).join(' ')).split(/\s+/).filter(Boolean).length; };
  var readMin = function (p) { return Math.max(1, Math.round(words(p) / 130)); };

  var ICON = {
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5C19 15.6 12 20 12 20z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    tele: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="22" y="6" width="14" height="40" rx="3" transform="rotate(30 29 26)"/><path d="M18 58h28M22 58l6-16h8l6 16"/></svg>'
  };

  /* ---------- Дані: записи, лайки, коментарі ---------- */
  function allPosts() {
    var user = store.get('zd-user-posts', []);
    if (!Array.isArray(user)) user = [];
    var list = (window.ZD_POSTS || []).concat(user.map(function (p) { p.user = true; return p; }));
    return list.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  }
  function getLiked() { return store.get('zd-liked', {}) || {}; }
  function likeCount(p) { return (p.likes || 0) + (getLiked()[p.id] ? 1 : 0); }
  function userComments(id) { var all = store.get('zd-comments', {}) || {}; return Array.isArray(all[id]) ? all[id] : []; }
  function commentCount(p) { return (p.comments || []).length + userComments(p.id).length; }
  var POSTS = allPosts();
  var catOf = function (p) { return CATS[p.cat] || { name: 'Інше', color: '#9ba3d4' }; };

  /* ---------- Тост ---------- */
  var toastT;
  function toast(msg) {
    var t = $('.toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* ---------- Прелоадер ---------- */
  var pre = $('.preloader');
  function hidePre() { if (pre) pre.classList.add('done'); }
  if (SHOT) hidePre(); else { window.addEventListener('load', function () { setTimeout(hidePre, 250); }); setTimeout(hidePre, 900); }

  /* ---------- Зоряне небо (canvas) ---------- */
  var cv = $('#sky');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), W, H, DPR = Math.min(window.devicePixelRatio || 1, 2);
    var stars = [], meteors = [], mouseX = 0, mouseY = 0, scrollY = 0;
    var resize = function () {
      W = window.innerWidth; H = SHOT ? document.documentElement.scrollHeight : window.innerHeight;
      if (SHOT) { cv.style.position = 'absolute'; cv.style.height = H + 'px'; var nb = $('.nebula'); if (nb) { nb.style.position = 'absolute'; nb.style.height = H + 'px'; } }
      cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var n = Math.round(W * H / 3200);
      stars = [];
      for (var i = 0; i < n; i++) {
        var layer = Math.random() < 0.6 ? 0 : Math.random() < 0.75 ? 1 : 2;
        stars.push({ x: Math.random() * W, y: Math.random() * H, r: [0.6, 1.05, 1.6][layer] * (0.6 + Math.random() * 0.6), l: layer,
          tw: Math.random() * 6.28, sp: 0.6 + Math.random() * 2, c: Math.random() < 0.12 ? '255,214,150' : Math.random() < 0.2 ? '170,190,255' : '255,255,255' });
      }
    };
    var spawn = function () {
      var x = Math.random() * W * 0.9 + W * 0.1, y = Math.random() * H * 0.45;
      var a = Math.PI * (0.72 + Math.random() * 0.12);
      meteors.push({ x: x, y: y, vx: Math.cos(a) * 14, vy: Math.sin(a) * 14, life: 0, max: 50 + Math.random() * 30 });
    };
    var draw = function (t) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var k = (s.l + 1) * 4;
        var px = s.x + mouseX * k, py = ((s.y - scrollY * (0.03 + s.l * 0.05)) % H + H) % H + mouseY * k;
        var a = 0.45 + 0.55 * Math.abs(Math.sin(s.tw + t * 0.001 * s.sp));
        ctx.fillStyle = 'rgba(' + s.c + ',' + a.toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(px, py, s.r, 0, 6.283); ctx.fill();
        if (s.l === 2 && a > 0.85) {
          ctx.strokeStyle = 'rgba(' + s.c + ',' + ((a - 0.85) * 2).toFixed(2) + ')'; ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(px - 5, py); ctx.lineTo(px + 5, py); ctx.moveTo(px, py - 5); ctx.lineTo(px, py + 5); ctx.stroke();
        }
      }
      for (var j = meteors.length - 1; j >= 0; j--) {
        var m = meteors[j]; m.life++; m.x += m.vx; m.y += m.vy;
        var p = m.life / m.max, al = p < 0.2 ? p * 5 : 1 - (p - 0.2) / 0.8;
        var g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 9, m.y - m.vy * 9);
        g.addColorStop(0, 'rgba(255,255,255,' + al + ')'); g.addColorStop(1, 'rgba(125,211,252,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 9, m.y - m.vy * 9); ctx.stroke();
        if (m.life >= m.max) meteors.splice(j, 1);
      }
    };
    resize();
    window.addEventListener('resize', resize);
    if (SHOT || REDUCED) {
      var still = function () { resize(); if (SHOT) meteors = [{ x: W * 0.8, y: 160, vx: -10, vy: 6, life: 12, max: 60 }]; draw(0); };
      still(); window.addEventListener('load', still); setTimeout(still, 300);
    } else {
      window.addEventListener('mousemove', function (e) { mouseX = (e.clientX / W - 0.5); mouseY = (e.clientY / H - 0.5); });
      window.addEventListener('scroll', function () { scrollY = window.scrollY; }, { passive: true });
      var next = 1200;
      var loop = function (t) {
        if (t > next) { spawn(); next = t + 1800 + Math.random() * 3500; }
        draw(t); requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }

  /* ---------- Шапка, меню ---------- */
  var header = $('.header');
  var bar = $('.progress');
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 10);
    if (bar) {
      var art = $('#content'), p;
      if (art && PAGE === 'post') {
        var r = art.getBoundingClientRect();
        p = Math.min(1, Math.max(0, (window.innerHeight * 0.4 - r.top) / r.height));
      } else {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        p = h > 0 ? y / h : 0;
      }
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  var burger = $('.burger');
  if (burger) burger.addEventListener('click', function () {
    var o = html.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', o ? 'true' : 'false');
  });
  $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { html.classList.remove('menu-open'); }); });

  /* ---------- Reveal + лічильники ---------- */
  function countUp(el) {
    var raw = el.getAttribute('data-count');
    var end = raw === 'posts' ? POSTS.length : parseFloat(raw) || 0;
    var fmt = function (v) { return Math.round(v).toLocaleString('uk-UA').replace(/,/g, ' '); };
    if (SHOT || REDUCED) { el.textContent = fmt(end); return; }
    var t0 = null;
    var step = function (t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1600); el.textContent = fmt(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  var io = (!SHOT && !REDUCED && 'IntersectionObserver' in window) ? new IntersectionObserver(function (en) {
    en.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(countUp);
      if (e.target.hasAttribute('data-count')) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }) : null;
  function observe(root) {
    $$('.reveal, .post-cover, #statsBox', root).forEach(function (el) {
      if (el.classList.contains('in')) return;
      if (io) io.observe(el); else { el.classList.add('in'); $$('[data-count]', el).forEach(countUp); }
    });
  }

  /* паралакс орбітальної моделі */
  var orr = $('[data-parallax]');
  if (orr && !SHOT && !REDUCED) {
    window.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 24, y = (e.clientY / window.innerHeight - 0.5) * 24;
      orr.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
    });
  }

  /* ---------- Підписка ---------- */
  function rocket(from) {
    if (SHOT || REDUCED) return;
    var r = document.createElement('div'); r.className = 'rocket';
    r.innerHTML = '<svg viewBox="0 0 48 48"><path d="M24 4c8 6 11 16 9 26H15C13 20 16 10 24 4z" fill="#e8ecff"/><circle cx="24" cy="18" r="4" fill="#7dd3fc"/><path d="M15 30l-6 8 8-2zM33 30l6 8-8-2z" fill="#8b7dff"/><path d="M19 36h10l-5 10z" fill="#ffc861"/></svg>';
    var b = from.getBoundingClientRect();
    r.style.left = (b.left + b.width / 2 - 23) + 'px'; r.style.top = (b.top - 10) + 'px';
    document.body.appendChild(r);
    r.animate([{ transform: 'translateY(0) rotate(0)', opacity: 1 }, { transform: 'translateY(-60px) rotate(-4deg)', opacity: 1, offset: 0.3 }, { transform: 'translate(40px,-' + (b.top + 120) + 'px) rotate(10deg)', opacity: 0 }], { duration: 1400, easing: 'cubic-bezier(.5,0,.8,.4)' }).onfinish = function () { r.remove(); };
  }
  $$('[data-sub]').forEach(function (f) {
    var input = $('input', f), msg = $('.msg', f), btn = $('button', f);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim().toLowerCase();
      f.classList.remove('invalid');
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) {
        void f.offsetWidth; f.classList.add('invalid');
        msg.className = 'msg err'; msg.textContent = v ? 'Перевірте адресу: схоже, в ній помилка.' : 'Введіть e-mail, щоб підписатися.';
        input.focus(); return;
      }
      var subs = store.get('zd-subs', []); if (!Array.isArray(subs)) subs = [];
      if (subs.indexOf(v) > -1) { msg.className = 'msg ok'; msg.textContent = 'Ви вже з нами! Перший лист прийде найближчим часом.'; return; }
      subs.push(v); store.set('zd-subs', subs);
      rocket(btn);
      msg.className = 'msg ok'; msg.textContent = '✦ Готово! Підписку оформлено на ' + v + '. Ясного неба!';
      input.value = '';
      toast('Ви підписалися на «Небо на два тижні»');
    });
  });

  /* ---------- Рендер картки ---------- */
  function hl(text, q) {
    var t = esc(text);
    if (!q) return t;
    var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return t.replace(re, '<mark>$1</mark>');
  }
  function card(p, i, q) {
    var c = catOf(p);
    return '<a class="card panel reveal" data-d="' + (i % 2) + '" href="post.html?id=' + encodeURIComponent(p.id) + '">' +
      '<div class="cover"><img src="' + esc(p.cover) + '" alt=""><span class="cat" style="--c:' + c.color + '">' + esc(c.name) + '</span>' + (p.user ? '<span class="user-badge">Мій запис</span>' : '') + '</div>' +
      '<div class="body"><h3>' + hl(p.title, q) + '</h3><p>' + hl(p.excerpt || '', q) + '</p>' +
      '<div class="tags">' + (p.tags || []).slice(0, 3).map(function (t) { return '<span class="tag">#' + esc(t) + '</span>'; }).join('') + '</div>' +
      '<div class="meta"><span>' + ICON.cal + fmtDate(p.date) + '</span><span>' + ICON.clock + readMin(p) + ' хв</span><span>' + ICON.heart + likeCount(p) + '</span><span>' + ICON.chat + commentCount(p) + '</span></div></div></a>';
  }

  /* ---------- Фаза Місяця ---------- */
  function moonWidget(box) {
    var now = SHOT ? new Date('2026-10-20T20:00:00Z') : new Date();
    var syn = 29.530588853, ref = Date.UTC(2000, 0, 6, 18, 14);
    var age = ((now - ref) / 864e5) % syn; if (age < 0) age += syn;
    var p = age / syn, illum = (1 - Math.cos(2 * Math.PI * p)) / 2;
    var names = [[0.03, 'Новий Місяць'], [0.22, 'Молодий серп'], [0.28, 'Перша чверть'], [0.47, 'Зростаючий Місяць'], [0.53, 'Повня'], [0.72, 'Спадний Місяць'], [0.78, 'Остання чверть'], [0.97, 'Старий серп'], [1.01, 'Новий Місяць']];
    var name = names.filter(function (n) { return p < n[0]; })[0][1];
    var R = 50, cx = 60, cy = 60, rx = Math.abs(Math.cos(2 * Math.PI * p)) * R, d;
    if (p < 0.5) d = 'M' + cx + ',' + (cy - R) + ' A' + R + ',' + R + ' 0 0 1 ' + cx + ',' + (cy + R) + ' A' + rx + ',' + R + ' 0 0 ' + (p < 0.25 ? 0 : 1) + ' ' + cx + ',' + (cy - R) + 'Z';
    else d = 'M' + cx + ',' + (cy - R) + ' A' + R + ',' + R + ' 0 0 0 ' + cx + ',' + (cy + R) + ' A' + rx + ',' + R + ' 0 0 ' + (p < 0.75 ? 0 : 1) + ' ' + cx + ',' + (cy - R) + 'Z';
    var toFull = ((0.5 - p + 1) % 1) * syn;
    var full = new Date(now.getTime() + toFull * 864e5);
    box.innerHTML = '<svg viewBox="0 0 120 120" aria-hidden="true"><defs><radialGradient id="mg" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#d9d3c2"/></radialGradient></defs>' +
      '<circle cx="60" cy="60" r="50" fill="#1a1d40"/><path d="' + d + '" fill="url(#mg)"/>' +
      '<circle cx="45" cy="44" r="6" fill="#000" opacity=".08"/><circle cx="70" cy="70" r="9" fill="#000" opacity=".07"/><circle cx="76" cy="40" r="4" fill="#000" opacity=".08"/></svg>' +
      '<div><span class="mono">Місяць сьогодні</span><h3>' + name + '</h3><p>Освітлено ' + Math.round(illum * 100) + '% · вік ' + age.toFixed(1) + ' діб.<br>Наступна повня: ' + full.getDate() + ' ' + MONTHS[full.getMonth()] + '.</p></div>';
  }
  var EVENTS = [
    { d: '2026-10-04', t: 'Сатурн у протистоянні', x: 'Кільця розкриваються — найкращий час для телескопа.' },
    { d: '2026-10-21', t: 'Максимум Оріонід', x: 'До 20 швидких метеорів за годину від комети Галлея.' },
    { d: '2026-11-05', t: 'Південні Тауриди', x: 'Повільні яскраві боліди, дивіться після півночі.' },
    { d: '2026-11-17', t: 'Максимум Леонід', x: 'Швидкі метеори з «гриви» Лева, перед світанком.' },
    { d: '2026-12-14', t: 'Максимум Гемінід', x: 'Найкращий потік року: до 120 метеорів за годину.' },
    { d: '2026-12-22', t: 'Урсиди', x: 'Скромний потік біля Малої Ведмедиці в найдовші ночі.' },
    { d: '2027-01-03', t: 'Квадрантиди', x: 'Короткий, але інтенсивний пік на початку року.' }
  ];
  function eventsWidget(box) {
    var today = SHOT ? '2026-10-20' : new Date().toISOString().slice(0, 10);
    var fut = EVENTS.filter(function (e) { return e.d >= today; });
    if (fut.length < 4) fut = EVENTS.slice(-4);
    box.innerHTML = fut.slice(0, 4).map(function (e, i) {
      return '<div class="event' + (i === 0 ? ' next' : '') + '"><span class="d">' + fmtDate(e.d) + '</span><h4>' + e.t + '</h4><p>' + e.x + '</p></div>';
    }).join('');
  }

  /* ================= ГОЛОВНА ================= */
  if (PAGE === 'home') {
    moonWidget($('#moon')); eventsWidget($('#events'));
    var f = POSTS[0];
    if (f) {
      var fc = catOf(f);
      $('#featured').innerHTML = '<a class="panel featured reveal" href="post.html?id=' + encodeURIComponent(f.id) + '"><div class="cover"><img src="' + esc(f.cover) + '" alt=""></div><div class="body"><span class="kicker" style="color:' + fc.color + '">Свіжий запис · ' + esc(fc.name) + '</span><h2>' + esc(f.title) + '</h2><p>' + esc(f.excerpt) + '</p><div class="meta" style="margin-bottom:24px"><span>' + ICON.cal + fmtDate(f.date) + '</span><span>' + ICON.clock + readMin(f) + ' хв читання</span><span>' + ICON.heart + likeCount(f) + '</span></div><span class="btn btn-gold" style="align-self:flex-start">Читати ' + ICON.arrow + '</span></div></a>';
    }
    var params = new URLSearchParams(location.search);
    var state = { cat: params.get('cat') || 'all', tag: params.get('tag') || '', q: params.get('q') || '', sort: 'new' };
    if (state.cat !== 'all' && !CATS[state.cat]) state.cat = 'all';
    var qIn = $('#q'), sortIn = $('#sort');
    qIn.value = state.q;
    var counts = {}; POSTS.forEach(function (p) { counts[p.cat] = (counts[p.cat] || 0) + 1; });
    $('#chips').innerHTML = '<button class="chip" data-cat="all">Усі <small>' + POSTS.length + '</small></button>' +
      Object.keys(CATS).map(function (k) { return '<button class="chip" data-cat="' + k + '" style="--c:' + CATS[k].color + '"><i></i>' + CATS[k].name + ' <small>' + (counts[k] || 0) + '</small></button>'; }).join('');
    $('#catList').innerHTML = Object.keys(CATS).map(function (k) { return '<a href="?cat=' + k + '#feed" data-cat="' + k + '"><span><i style="background:' + CATS[k].color + '"></i>' + CATS[k].name + '</span><small>' + (counts[k] || 0) + '</small></a>'; }).join('');
    var tagCount = {}; POSTS.forEach(function (p) { (p.tags || []).forEach(function (t) { tagCount[t] = (tagCount[t] || 0) + 1; }); });
    $('#cloud').innerHTML = Object.keys(tagCount).sort(function (a, b) { return tagCount[b] - tagCount[a]; }).map(function (t) { return '<button class="tag" data-tag="' + esc(t) + '" style="font-size:' + (11 + tagCount[t] * 1.3) + 'px">#' + esc(t) + '</button>'; }).join('');
    $('#popular').innerHTML = POSTS.slice().sort(function (a, b) { return likeCount(b) - likeCount(a); }).slice(0, 4).map(function (p) { return '<a href="post.html?id=' + encodeURIComponent(p.id) + '"><img src="' + esc(p.cover) + '" alt=""><div><b>' + esc(p.title) + '</b><span>♥ ' + likeCount(p) + ' · ' + readMin(p) + ' хв</span></div></a>'; }).join('');

    var render = function () {
      $$('#chips .chip').forEach(function (c) { c.classList.toggle('on', c.getAttribute('data-cat') === state.cat); });
      var q = state.q.trim().toLowerCase();
      var list = POSTS.filter(function (p) {
        if (state.cat !== 'all' && p.cat !== state.cat) return false;
        if (state.tag && (p.tags || []).indexOf(state.tag) < 0) return false;
        if (q) { var hay = (p.title + ' ' + p.excerpt + ' ' + (p.tags || []).join(' ') + ' ' + strip((p.body || []).join(' '))).toLowerCase(); if (hay.indexOf(q) < 0) return false; }
        return true;
      });
      if (state.sort === 'old') list.reverse();
      if (state.sort === 'pop') list.sort(function (a, b) { return likeCount(b) - likeCount(a); });
      if (state.sort === 'long') list.sort(function (a, b) { return words(b) - words(a); });
      var af = $('#activeFilter'), parts = [];
      if (state.tag) parts.push('тег <b style="color:var(--cyan)">#' + esc(state.tag) + '</b>');
      if (q) parts.push('пошук «<b style="color:var(--gold)">' + esc(state.q) + '</b>»');
      af.classList.toggle('show', parts.length > 0);
      af.innerHTML = parts.length ? 'Знайдено ' + list.length + ' ' + plural(list.length, 'запис', 'записи', 'записів') + ': ' + parts.join(', ') + ' <button type="button" id="resetF">Скинути ×</button>' : '';
      var rb = $('#resetF'); if (rb) rb.addEventListener('click', function () { state.tag = ''; state.q = ''; qIn.value = ''; render(); });
      $('#grid').innerHTML = list.length ? list.map(function (p, i) { return card(p, i, q); }).join('') :
        '<div class="empty panel">' + ICON.tele + '<h3 style="margin-bottom:8px">Нічого не знайдено</h3><p>У цій частині неба порожньо. Спробуйте інше слово або скиньте фільтри.</p></div>';
      observe($('#grid'));
      var u = new URLSearchParams();
      if (state.cat !== 'all') u.set('cat', state.cat); if (state.tag) u.set('tag', state.tag); if (state.q) u.set('q', state.q);
      try { history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : '') + location.hash); } catch (e) {}
    };
    $('#chips').addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (!b) return; state.cat = b.getAttribute('data-cat'); render(); });
    $('#catList').addEventListener('click', function (e) { var a = e.target.closest('a'); if (!a) return; e.preventDefault(); state.cat = a.getAttribute('data-cat'); render(); $('#feed').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' }); });
    $('#cloud').addEventListener('click', function (e) { var b = e.target.closest('[data-tag]'); if (!b) return; state.tag = b.getAttribute('data-tag'); render(); $('#feed').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' }); });
    var qt; qIn.addEventListener('input', function () { clearTimeout(qt); qt = setTimeout(function () { state.q = qIn.value; render(); }, 180); });
    sortIn.addEventListener('change', function () { state.sort = sortIn.value; render(); });
    document.addEventListener('keydown', function (e) { if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { e.preventDefault(); qIn.focus(); } });
    render();
  }

  /* ================= ЗАПИС ================= */
  if (PAGE === 'post') {
    var id = new URLSearchParams(location.search).get('id');
    var idx = -1;
    POSTS.forEach(function (p, i) { if (p.id === id) idx = i; });
    if (idx < 0 && !id) idx = 0;
    var post = POSTS[idx];
    if (!post) {
      $('#post').innerHTML = '<div class="wrap section" style="text-align:center"><div class="panel empty">' + ICON.tele + '<h2 class="h2" style="margin:10px 0">Запис загубився в космосі</h2><p>Можливо, його видалили або посилання неповне.</p><a class="btn btn-gold" href="index.html">До стрічки ' + ICON.arrow + '</a></div></div>';
    } else {
      var c = catOf(post);
      document.title = post.title + ' — Зоряний щоденник';
      $('#postHead').innerHTML = '<div class="crumbs"><a href="index.html">Стрічка</a><span>/</span><a href="index.html?cat=' + post.cat + '#feed">' + esc(c.name) + '</a><span>/</span><span>' + esc(post.title.slice(0, 40)) + '…</span></div>' +
        '<span class="kicker reveal" style="color:' + c.color + '">' + esc(c.name) + (post.user ? ' · Мій запис' : '') + '</span><h1 class="reveal" data-d="1">' + esc(post.title) + '</h1>' +
        '<div class="meta reveal" data-d="2"><span>' + ICON.cal + fmtDate(post.date) + '</span><span>' + ICON.clock + readMin(post) + ' хв читання · ' + words(post) + ' слів</span><span>' + ICON.heart + '<b id="lc1">' + likeCount(post) + '</b></span><span>' + ICON.chat + '<b class="cc">' + commentCount(post) + '</b></span></div>' +
        '<div class="post-cover"><img src="' + esc(post.cover) + '" alt="Ілюстрація до запису"></div>';
      var content = $('#content');
      content.innerHTML = (post.body || []).join('');
      var heads = $$('h3', content);
      heads.forEach(function (h, i) { h.id = 'h-' + (i + 1); });
      $('#tocSide').innerHTML = '<h4>Зміст</h4>' + (heads.length ? heads.map(function (h) { return '<a href="#' + h.id + '">' + esc(h.textContent) + '</a>'; }).join('') : '<p class="muted" style="font-size:14px;margin:0">Короткий запис без розділів</p>') + '<div class="time">' + readMin(post) + ' хв читання<br>' + words(post) + ' слів</div>';
      $('#postTags').innerHTML = (post.tags || []).map(function (t) { return '<a class="tag" href="index.html?tag=' + encodeURIComponent(t) + '#feed">#' + esc(t) + '</a>'; }).join('');
      var liked = !!getLiked()[post.id];
      $('#rail').innerHTML = '<button class="icon-btn like-btn' + (liked ? ' liked' : '') + '" aria-label="Подобається">' + ICON.heart + '<small id="lc2">' + likeCount(post) + '</small></button>' +
        '<button class="icon-btn" data-copy aria-label="Скопіювати посилання" style="margin-top:14px">' + ICON.link + '</button><a class="icon-btn" href="#comments" aria-label="До коментарів">' + ICON.chat + '</a><a class="icon-btn" href="#top" aria-label="Нагору">' + ICON.up + '</a>';
      $('#actions').innerHTML = '<button class="like-big' + (liked ? ' liked' : '') + '">' + ICON.heart + '<span>' + (liked ? 'Вам подобається' : 'Подобається') + '</span> · <b id="lc3">' + likeCount(post) + '</b></button><button class="btn btn-ghost btn-sm" data-copy>' + ICON.link + ' Копіювати посилання</button><a class="btn btn-ghost btn-sm" href="mailto:?subject=' + encodeURIComponent(post.title) + '&body=' + encodeURIComponent(location.href) + '">Надіслати другу</a>';
      var setLikes = function () {
        var on = !!getLiked()[post.id], n = likeCount(post);
        ['#lc1', '#lc2', '#lc3'].forEach(function (s) { var e = $(s); if (e) e.textContent = n; });
        $$('.like-btn, .like-big').forEach(function (b) { b.classList.toggle('liked', on); });
        var s = $('.like-big span'); if (s) s.textContent = on ? 'Вам подобається' : 'Подобається';
      };
      var burst = function (el) {
        if (REDUCED) return;
        for (var i = 0; i < 10; i++) {
          var s = document.createElement('i'); s.className = 'burst';
          var a = i / 10 * 6.283; s.style.setProperty('--x', Math.cos(a) * 34 + 'px'); s.style.setProperty('--y', Math.sin(a) * 34 + 'px');
          s.style.background = ['#ffc861', '#f472b6', '#7dd3fc'][i % 3];
          el.appendChild(s); setTimeout(function (x) { return function () { x.remove(); }; }(s), 750);
        }
      };
      $$('.like-btn, .like-big').forEach(function (b) {
        b.addEventListener('click', function () {
          var L = getLiked(); if (L[post.id]) delete L[post.id]; else { L[post.id] = true; burst(b); }
          store.set('zd-liked', L); setLikes();
          toast(L[post.id] ? 'Дякую! Запис додано до вподобаних' : 'Вподобання скасовано');
        });
      });
      $$('[data-copy]').forEach(function (b) {
        b.addEventListener('click', function () {
          var done = function () { toast('Посилання скопійовано'); };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(location.href).then(done, done); else done();
        });
      });
      // коментарі
      var colors = ['#ffc861', '#f472b6', '#7dd3fc', '#a78bfa', '#34d399', '#fb923c'];
      var renderComments = function () {
        var mine = userComments(post.id);
        var list = (post.comments || []).map(function (x) { return { c: x, mine: false }; }).concat(mine.map(function (x, i) { return { c: x, mine: true, i: i }; }));
        $('#cList').innerHTML = list.length ? list.slice().reverse().map(function (o) {
          var n = o.c.name || 'Гість', col = colors[n.charCodeAt(0) % colors.length];
          return '<div class="comment panel"><span class="ava" style="background:' + col + '">' + esc(n.charAt(0).toUpperCase()) + '</span><div><b>' + esc(n) + '</b><span class="when">' + fmtDate(o.c.date) + '</span>' + (o.mine ? '<button class="del" data-i="' + o.i + '">видалити</button>' : '') + '<p>' + esc(o.c.text) + '</p></div></div>';
        }).join('') : '<p class="muted">Ще немає коментарів. Будьте першим!</p>';
        $$('.cc').forEach(function (e) { e.textContent = commentCount(post); });
        $('#cCount').textContent = commentCount(post);
      };
      $('#comments').innerHTML = '<h3>Коментарі <small id="cCount">0</small></h3>' +
        '<form class="panel c-form" id="cForm" novalidate><div class="row"><div class="field"><label for="c-name">Ваше ім’я</label><input id="c-name" maxlength="40" placeholder="Як до вас звертатися?"><span class="err">Вкажіть ім’я (2+ символи)</span></div></div>' +
        '<div class="field"><label for="c-text">Коментар</label><textarea id="c-text" rows="3" maxlength="800" placeholder="Поділіться враженнями чи запитанням…"></textarea><span class="err">Коментар — щонайменше 5 символів</span></div>' +
        '<div><button class="btn btn-gold btn-sm" type="submit">Надіслати ' + ICON.arrow + '</button></div></form><div class="c-list" id="cList"></div>';
      var savedName = store.get('zd-name', '');
      if (savedName) $('#c-name').value = savedName;
      $('#cForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var n = $('#c-name'), t = $('#c-text'), ok = true;
        [[n, 2], [t, 5]].forEach(function (pair) {
          var fld = pair[0].closest('.field'); fld.classList.remove('invalid');
          if (pair[0].value.trim().length < pair[1]) { void fld.offsetWidth; fld.classList.add('invalid'); ok = false; }
        });
        if (!ok) return;
        var all = store.get('zd-comments', {}) || {};
        if (!Array.isArray(all[post.id])) all[post.id] = [];
        all[post.id].push({ name: n.value.trim(), text: t.value.trim(), date: new Date().toISOString().slice(0, 10) });
        store.set('zd-comments', all); store.set('zd-name', n.value.trim());
        t.value = ''; renderComments(); toast('Коментар опубліковано');
      });
      $('#cList').addEventListener('click', function (e) {
        var b = e.target.closest('.del'); if (!b) return;
        var all = store.get('zd-comments', {}) || {};
        if (Array.isArray(all[post.id])) { all[post.id].splice(+b.getAttribute('data-i'), 1); store.set('zd-comments', all); }
        renderComments(); toast('Коментар видалено');
      });
      renderComments();
      // попередній / наступний
      var newer = POSTS[idx - 1], older = POSTS[idx + 1];
      $('#prevnext').innerHTML = (older ? '<a class="panel" href="post.html?id=' + encodeURIComponent(older.id) + '"><small>← Попередній запис</small><b>' + esc(older.title) + '</b></a>' : '<span></span>') +
        (newer ? '<a class="panel" href="post.html?id=' + encodeURIComponent(newer.id) + '"><small>Наступний запис →</small><b>' + esc(newer.title) + '</b></a>' : '<span></span>');
      var rel = POSTS.filter(function (p) { return p.id !== post.id; }).map(function (p) {
        var s = (p.cat === post.cat ? 3 : 0) + (p.tags || []).filter(function (t) { return (post.tags || []).indexOf(t) > -1; }).length; return { p: p, s: s };
      }).sort(function (a, b) { return b.s - a.s; }).slice(0, 3);
      $('#related').innerHTML = rel.map(function (o, i) { return card(o.p, i); }).join('');
      // активний розділ змісту
      if ('IntersectionObserver' in window && heads.length) {
        var tio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) $$('#tocSide a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); }); }); }, { rootMargin: '0px 0px -70% 0px' });
        heads.forEach(function (h) { tio.observe(h); });
      }
    }
  }

  /* ================= АРХІВ ================= */
  if (PAGE === 'archive') {
    var acat = 'all';
    var counts2 = {}; POSTS.forEach(function (p) { counts2[p.cat] = (counts2[p.cat] || 0) + 1; });
    $('#archChips').innerHTML = '<button class="chip on" data-cat="all">Усі <small>' + POSTS.length + '</small></button>' + Object.keys(CATS).map(function (k) { return '<button class="chip" data-cat="' + k + '" style="--c:' + CATS[k].color + '"><i></i>' + CATS[k].name + ' <small>' + (counts2[k] || 0) + '</small></button>'; }).join('');
    var renderArch = function () {
      var list = POSTS.filter(function (p) { return acat === 'all' || p.cat === acat; });
      var groups = {};
      list.forEach(function (p) { var y = p.date.slice(0, 4), m = +p.date.slice(5, 7) - 1; groups[y] = groups[y] || {}; (groups[y][m] = groups[y][m] || []).push(p); });
      $('#archive').innerHTML = Object.keys(groups).sort().reverse().map(function (y) {
        return '<div class="year"><h2 class="reveal">' + y + '</h2>' + Object.keys(groups[y]).sort(function (a, b) { return b - a; }).map(function (m) {
          var ps = groups[y][m];
          return '<div class="month reveal"><h3>' + MONTHS_N[m] + '<small>' + ps.length + ' ' + plural(ps.length, 'запис', 'записи', 'записів') + '</small></h3><div>' + ps.map(function (p) {
            var c = catOf(p);
            return '<a class="a-item" href="post.html?id=' + encodeURIComponent(p.id) + '"><img src="' + esc(p.cover) + '" alt=""><div><b>' + esc(p.title) + '</b><div class="meta"><span style="color:' + c.color + '">' + esc(c.name) + '</span><span>' + ICON.clock + readMin(p) + ' хв</span><span>' + ICON.heart + likeCount(p) + '</span></div></div><span class="day">' + (+p.date.slice(8)) + '</span></a>';
          }).join('') + '</div></div>';
        }).join('') + '</div>';
      }).join('') || '<div class="panel empty">У цій рубриці поки немає записів.</div>';
      observe($('#archive'));
    };
    $('#archChips').addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (!b) return; acat = b.getAttribute('data-cat'); $$('#archChips .chip').forEach(function (c) { c.classList.toggle('on', c === b); }); renderArch(); });
    var max = Math.max.apply(null, Object.keys(CATS).map(function (k) { return counts2[k] || 0; }).concat([1]));
    $('#bars').innerHTML = Object.keys(CATS).map(function (k) { return '<div class="bar-row"><span>' + CATS[k].name + '</span><span class="track"><span class="fill" style="display:block;--w:' + ((counts2[k] || 0) / max * 100) + '%;background:' + CATS[k].color + '"></span></span><span class="n">' + (counts2[k] || 0) + '</span></div>'; }).join('');
    var totalW = POSTS.reduce(function (s, p) { return s + words(p); }, 0), totalL = POSTS.reduce(function (s, p) { return s + likeCount(p); }, 0), totalC = POSTS.reduce(function (s, p) { return s + commentCount(p); }, 0);
    $('#numbers').innerHTML = [['Записів', POSTS.length], ['Слів написано', totalW.toLocaleString('uk-UA')], ['Хвилин читання', POSTS.reduce(function (s, p) { return s + readMin(p); }, 0)], ['Вподобань', totalL], ['Коментарів', totalC]].map(function (r) { return '<a href="#" onclick="return false"><span>' + r[0] + '</span><small>' + r[1] + '</small></a>'; }).join('');
    renderArch();
  }

  /* ================= РЕДАКТОР ================= */
  function md(src) {
    var blocks = String(src || '').replace(/\r/g, '').replace(/^(##[^\n]*)\n(?!\n)/gm, '$1\n\n').split(/\n\s*\n/);
    var inline = function (s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); };
    return blocks.map(function (b) {
      b = b.trim(); if (!b) return '';
      if (/^##\s/.test(b)) return '<h3>' + inline(b.replace(/^##\s*/, '')) + '</h3>';
      if (/^>\s?/.test(b)) return '<blockquote>' + inline(b.replace(/^>\s?/gm, '')) + '</blockquote>';
      if (/^-\s/.test(b)) return '<ul>' + b.split('\n').map(function (l) { return '<li>' + inline(l.replace(/^-\s*/, '')) + '</li>'; }).join('') + '</ul>';
      return '<p>' + inline(b).replace(/\n/g, '<br>') + '</p>';
    }).filter(Boolean);
  }
  if (PAGE === 'new') {
    var form = $('#editor');
    var sel = $('#e-cat');
    sel.innerHTML = '<option value="">— оберіть —</option>' + Object.keys(CATS).map(function (k) { return '<option value="' + k + '">' + CATS[k].name + '</option>'; }).join('');
    var F = { title: $('#e-title'), cat: sel, tags: $('#e-tags'), excerpt: $('#e-excerpt'), body: $('#e-body') };
    var today = new Date().toISOString().slice(0, 10);
    $('#pvDate').textContent = fmtDate(today);
    var cover = function () { var c = $('input[name=cover]:checked'); return c ? c.value : 'img/covers/jupiter.svg'; };
    var preview = function () {
      $('#pvTitle').textContent = F.title.value.trim() || 'Ваш заголовок';
      var c = CATS[F.cat.value]; $('#pvCat').textContent = c ? c.name : 'Рубрика';
      $('#pvCat').style.color = c ? c.color : '';
      $('#pvCover').src = cover();
      var b = md(F.body.value);
      $('#pvContent').innerHTML = b.length ? b.join('') : '<p class="muted">Тут з’явиться текст запису…</p>';
      var n = F.body.value.trim().split(/\s+/).filter(Boolean).length;
      $('#wc').textContent = n + ' ' + plural(n, 'слово', 'слова', 'слів') + ' · ~' + Math.max(1, Math.round(n / 130)) + ' хв читання';
      store.set('zd-draft', { title: F.title.value, cat: F.cat.value, tags: F.tags.value, excerpt: F.excerpt.value, body: F.body.value, cover: cover() });
    };
    var d = store.get('zd-draft', null);
    if (d && typeof d === 'object') {
      F.title.value = d.title || ''; F.cat.value = d.cat || ''; F.tags.value = d.tags || ''; F.excerpt.value = d.excerpt || ''; F.body.value = d.body || '';
      var ci = $('input[name=cover][value="' + (d.cover || '') + '"]'); if (ci) ci.checked = true;
    }
    form.addEventListener('input', preview); form.addEventListener('change', preview);
    $$('.toolbar-md button').forEach(function (b) {
      b.addEventListener('click', function () {
        var ta = F.body, s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
        if (b.getAttribute('data-wrap')) { var w = b.getAttribute('data-wrap'); ta.value = v.slice(0, s) + w + (v.slice(s, e) || 'текст') + w + v.slice(e); }
        else { var ins = (s > 0 && v[s - 1] !== '\n' ? '\n\n' : '') + b.getAttribute('data-ins'); ta.value = v.slice(0, s) + ins + v.slice(s); ta.selectionStart = ta.selectionEnd = s + ins.length; }
        ta.focus(); preview();
      });
    });
    var renderMine = function () {
      var mine = store.get('zd-user-posts', []); if (!Array.isArray(mine)) mine = [];
      $('#myPosts').innerHTML = mine.length ? mine.slice().reverse().map(function (p) { return '<div class="row"><img src="' + esc(p.cover) + '" alt=""><a href="post.html?id=' + encodeURIComponent(p.id) + '"><b>' + esc(p.title) + '</b><div class="meta" style="margin-top:6px"><span>' + fmtDate(p.date) + '</span></div></a><button class="del" data-id="' + esc(p.id) + '">Видалити</button></div>'; }).join('') : '<p class="muted" style="padding:16px 20px;margin:0">Ви ще не опублікували жодного запису.</p>';
    };
    $('#myPosts').addEventListener('click', function (e) {
      var b = e.target.closest('.del'); if (!b) return;
      var mine = store.get('zd-user-posts', []).filter(function (p) { return p.id !== b.getAttribute('data-id'); });
      store.set('zd-user-posts', mine); renderMine(); toast('Запис видалено');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      var check = function (el, cond) { var f = el.closest('.field'); f.classList.remove('invalid'); if (!cond) { void f.offsetWidth; f.classList.add('invalid'); ok = false; } };
      check(F.title, F.title.value.trim().length >= 6);
      check(F.cat, !!F.cat.value);
      check(F.body, F.body.value.trim().length >= 80);
      if (!ok) { toast('Перевірте позначені поля'); return; }
      var body = md(F.body.value);
      var p = {
        id: 'u-' + Date.now().toString(36), title: F.title.value.trim(), cat: F.cat.value,
        tags: F.tags.value.split(',').map(function (t) { return t.trim(); }).filter(Boolean).slice(0, 6),
        date: today, cover: cover(), excerpt: F.excerpt.value.trim() || strip(body[0] || '').trim().slice(0, 160) + '…',
        body: body, comments: [], likes: 0
      };
      var mine = store.get('zd-user-posts', []); if (!Array.isArray(mine)) mine = [];
      mine.push(p);
      if (!store.set('zd-user-posts', mine)) { toast('Не вдалося зберегти: сховище недоступне'); return; }
      store.set('zd-draft', null);
      toast('Запис опубліковано! Переходимо до нього…');
      setTimeout(function () { location.href = 'post.html?id=' + encodeURIComponent(p.id); }, 900);
    });
    $('#draftBtn').addEventListener('click', function () { preview(); toast('Чернетку збережено в браузері'); });
    $('#clearBtn').addEventListener('click', function () { form.reset(); store.set('zd-draft', null); preview(); });
    preview(); renderMine();
  }

  observe(document);
  onScroll();
})();
