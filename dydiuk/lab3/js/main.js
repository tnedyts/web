/* =========================================================
   «Вертикаль» — логіка сайту: рендер контенту з CMS, слайдер,
   галерея з лайтбоксом, календар, карта, форма, анімації.
   © 2026 Олександр Дидюк
   ========================================================= */
(function () {
  'use strict';
  var html = document.documentElement;
  var SHOT = html.classList.contains('shot');
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var D = window.CMS ? window.CMS.get() : (window.VERT_DEFAULT || {});
  var esc = window.CMS ? window.CMS.esc : function (s) { return String(s); };
  var page = document.body.getAttribute('data-page') || '';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var TODAY = new Date(2026, 9, 21); // «сьогодні» для демонстраційного календаря
  (function () { var n = new Date(); if (n.getFullYear() >= 2026 && n > TODAY) TODAY = new Date(n.getFullYear(), n.getMonth(), n.getDate()); })();

  var TYPE_COLORS = { 'Змагання': '#ff6b1a', 'Тренування': '#c6ff3d', 'Лекція': '#3dd9ff', 'Діти': '#ffd43d', 'Кіно': '#a46bff' };
  function typeColor(t) { return TYPE_COLORS[t] || '#ff3d7f'; }
  var HOLD_COLORS = ['#c6ff3d', '#ff6b1a', '#3dd9ff', '#ff3d7f', '#ffd43d', '#a46bff'];

  var ICONS = {
    spark: '<path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5 19 19M19 5l-3.5 3.5M8.5 15.5 5 19"/>',
    boulder: '<path d="M3 20 8 9l4 5 3-4 6 10z"/><circle cx="16" cy="5" r="2"/>',
    rope: '<path d="M12 2v6"/><path d="M12 8c-4 0-4 4 0 4s4 4 0 4-4 4 0 4"/><circle cx="12" cy="2.5" r="1.5"/>',
    group: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6M14 20c0-2.6 1.4-5 4-5s4 2 4 5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    flag: '<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>',
    people: '<circle cx="9" cy="7" r="3"/><path d="M3 21c0-4 2.7-7 6-7s6 3 6 7"/><path d="M16 4a3 3 0 0 1 0 6M18 14c2 .8 3 3.5 3 7"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'
  };
  function icon(name) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.spark) + '</svg>'; }
  var ARROW = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* ---------- псевдовипадкові зачепи ---------- */
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function blobPath(r, cx, cy, s) {
    var n = 5 + Math.floor(r() * 4), pts = [], i, d = '';
    for (i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2 + (r() - .5) * .5, rr = s * (.62 + r() * .5);
      pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a) * (.72 + r() * .28)]);
    }
    for (i = 0; i < n; i++) {
      var p0 = pts[i], p1 = pts[(i + 1) % n], m = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      if (i === 0) { var pl = pts[n - 1]; d += 'M' + ((pl[0] + p0[0]) / 2).toFixed(1) + ',' + ((pl[1] + p0[1]) / 2).toFixed(1); }
      d += 'Q' + p0[0].toFixed(1) + ',' + p0[1].toFixed(1) + ' ' + m[0].toFixed(1) + ',' + m[1].toFixed(1);
    }
    return d + 'Z';
  }
  function holdSVG(r, cx, cy, s, col, cls, style) {
    var d = blobPath(r, cx, cy, s);
    return '<g class="hold' + (cls ? ' ' + cls : '') + '" style="--c:' + col + ';' + (style || '') + '">' +
      '<path d="' + d + '" fill="#000" opacity=".4" transform="translate(' + (s * .18).toFixed(1) + ',' + (s * .24).toFixed(1) + ')"/>' +
      '<path d="' + d + '" fill="' + col + '"/>' +
      '<circle cx="' + (cx - s * .28).toFixed(1) + '" cy="' + (cy - s * .3).toFixed(1) + '" r="' + (s * .22).toFixed(1) + '" fill="#fff" opacity=".3"/>' +
      '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + Math.max(1.8, s * .1).toFixed(1) + '" fill="#000" opacity=".5"/></g>';
  }
  function decoHolds(el, count, seed) {
    var W = 600, H = 400, r = rng(seed), out = '';
    for (var i = 0; i < count; i++) {
      out += holdSVG(r, 30 + r() * (W - 60), 30 + r() * (H - 60), 7 + r() * 13, HOLD_COLORS[Math.floor(r() * HOLD_COLORS.length)], '', '--d:' + (i * 0.06).toFixed(2) + 's');
    }
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + out + '</svg>';
  }

  function buildHeroWall(el) {
    var W = 900, H = 1000, r = rng(7), s = '';
    s += '<defs><pattern id="bolts" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="2" fill="#0b0c0e"/></pattern>' +
      '<linearGradient id="wl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2f37"/><stop offset="1" stop-color="#15171b"/></linearGradient>' +
      '<radialGradient id="spot" cx="60%" cy="20%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>';
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#wl)"/>';
    s += '<g class="layer" data-depth="6"><g transform="rotate(-9 450 500)">';
    var shades = ['#252930', '#2a2f37', '#22252b', '#2e333c'];
    for (var i = -2; i < 9; i++) for (var j = -2; j < 10; j++) {
      s += '<rect x="' + (i * 160) + '" y="' + (j * 160) + '" width="157" height="157" fill="' + shades[Math.floor(r() * 4)] + '"/>';
    }
    s += '<rect x="-320" y="-320" width="1760" height="1920" fill="url(#bolts)" opacity=".8"/></g>';
    // об'єми
    [[640, 260, 130], [260, 700, 110], [780, 780, 90]].forEach(function (v) {
      var cx = v[0], cy = v[1], z = v[2];
      s += '<polygon points="' + cx + ',' + (cy - z) + ' ' + (cx + z) + ',' + (cy + z * .6) + ' ' + (cx - z * .9) + ',' + (cy + z * .7) + '" fill="#363c46"/>' +
        '<polygon points="' + cx + ',' + (cy - z) + ' ' + (cx + z) + ',' + (cy + z * .6) + ' ' + (cx + z * .1) + ',' + (cy + z * .2) + '" fill="#454c58"/>';
    });
    s += '</g>';
    // фонові зачепи
    s += '<g class="layer" data-depth="14">';
    for (i = 0; i < 46; i++) {
      s += holdSVG(r, 30 + r() * (W - 60), 30 + r() * (H - 60), 9 + r() * 15, HOLD_COLORS[1 + Math.floor(r() * 5)], '', '--d:' + (0.25 + i * 0.018).toFixed(2) + 's');
    }
    s += '</g>';
    // LED-траса
    var route = [[520, 940], [430, 830], [560, 720], [470, 610], [610, 500], [520, 390], [660, 280], [570, 170], [690, 70]];
    var path = 'M' + route.map(function (p) { return p[0] + ',' + p[1]; }).join(' L');
    s += '<g class="layer" data-depth="26"><path class="route-line" d="' + path + '"/>';
    route.forEach(function (p, k) {
      s += holdSVG(r, p[0], p[1], 22 + r() * 8, '#c6ff3d', 'led', '--d:' + (0.5 + k * 0.06).toFixed(2) + 's;--ld:' + (1.2 + k * 0.32).toFixed(2) + 's');
    });
    s += '<g transform="translate(690 70)"><rect x="-28" y="-62" width="56" height="26" fill="#ff6b1a" transform="skewX(-10)"/><text x="0" y="-43" text-anchor="middle" font-family="Oswald,sans-serif" font-weight="700" font-size="16" fill="#16181c">TOP</text></g>';
    s += '</g><rect width="' + W + '" height="' + H + '" fill="url(#spot)" pointer-events="none"/>';
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice">' + s + '</svg>';
    if (REDUCED || SHOT) return;
    var layers = $$('.layer', el);
    window.addEventListener('mousemove', function (e) {
      var x = e.clientX / window.innerWidth - .5, y = e.clientY / window.innerHeight - .5;
      layers.forEach(function (l) { var d = +l.getAttribute('data-depth'); l.style.transform = 'translate(' + (-x * d) + 'px,' + (-y * d) + 'px)'; });
    });
  }

  /* ---------- застосування CMS до спільних елементів ---------- */
  function getPath(obj, p) { return p.split('.').reduce(function (o, k) { return o ? o[k] : undefined; }, obj); }
  function applyCommon() {
    $$('[data-cms]').forEach(function (el) {
      var v = getPath(D, el.getAttribute('data-cms'));
      if (v == null) return;
      el.textContent = v;
      var h = el.getAttribute('data-href');
      if (h === 'tel') el.setAttribute('href', 'tel:' + String(v).replace(/[^+\d]/g, ''));
      if (h === 'mailto') el.setAttribute('href', 'mailto:' + v);
    });
    var def = (window.VERT_DEFAULT && window.VERT_DEFAULT.site.name) || 'Вертикаль';
    if (D.site && D.site.name && D.site.name !== def) document.title = document.title.split(def).join(D.site.name);
    var an = $('#announce');
    if (an) { if (D.site && D.site.announce) $('#announceText').textContent = D.site.announce; else an.hidden = true; }
    var file = (location.pathname.split('/').pop() || 'index.html');
    if (D.menu && D.menu.length) {
      var links = D.menu.map(function (m) {
        var act = m.href.split('#')[0] === file;
        return '<a href="' + esc(m.href) + '"' + (act ? ' class="active" aria-current="page"' : '') + '>' + esc(m.label) + '</a>';
      }).join('');
      var nav = $('#nav'); if (nav) nav.innerHTML = links;
      var fm = $('#ftrMenu'); if (fm) fm.innerHTML = D.menu.map(function (m) { return '<a href="' + esc(m.href) + '">' + esc(m.label) + '</a>'; }).join('');
    }
  }

  /* ---------- рендер модулів ---------- */
  function renderStats() {
    $$('#stats-grid').forEach(function (el) {
      el.innerHTML = (D.stats || []).map(function (s, i) {
        return '<div class="stat reveal" data-d="' + i + '"><b><span data-count="' + s.value + '">0</span><small>' + esc(s.suffix) + '</small></b><span>' + esc(s.label) + '</span></div>';
      }).join('');
    });
  }
  function renderServices(full) {
    var el = $('#svcGrid'); if (!el) return;
    var list = D.services || [];
    el.innerHTML = list.map(function (s, i) {
      return '<article class="svc reveal" data-d="' + (i % 3) + '" id="svc-' + esc(s.id) + '"><span class="svc-num">0' + (i + 1) + '</span><div class="svc-ico">' + icon(s.icon) + '</div><h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p><div class="svc-price">' + esc(s.price) + ' <small>' + esc(s.unit) + '</small></div>' +
        (full ? '<div class="svc-tags">' + (s.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' : '') + '</article>';
    }).join('');
  }
  function renderPasses() {
    var el = $('#passes-grid'); if (!el) return;
    el.innerHTML = (D.passes || []).map(function (p, i) {
      return '<article class="pass reveal' + (p.hot ? ' hot' : '') + '" data-d="' + i + '">' + (p.hot ? '<span class="pass-badge">Найпопулярніший</span>' : '') +
        '<h3>' + esc(p.name) + '</h3><div class="pass-price"><b>' + Number(p.price).toLocaleString('uk-UA') + '</b><span>₴ / ' + esc(p.period) + '</span></div>' +
        '<ul>' + (p.features || []).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
        '<a class="btn ' + (p.hot ? 'btn-lime' : 'btn-ghost') + '" href="contacts.html#form"><span>Придбати</span>' + ARROW + '</a></article>';
    }).join('');
  }
  function renderKids() {
    var el = $('#kidsGrid'); if (!el) return;
    var cols = ['#ffd43d', '#3dd9ff', '#ff3d7f'];
    el.innerHTML = (D.kids || []).map(function (k, i) {
      return '<article class="kid reveal" data-d="' + i + '" style="--c:' + cols[i % 3] + '"><span class="kid-blob"></span><span class="kid-age">' + esc(k.age) + '</span><h3>' + esc(k.name) + '</h3><p>' + esc(k.text) + '</p><div class="kid-meta"><span>' + esc(k.schedule) + '</span><b>' + esc(k.price) + '</b></div></article>';
    }).join('');
  }
  function sortedEvents() { return (D.events || []).slice().sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); }); }
  function evHTML(e, i) {
    var p = e.date.split('-');
    return '<article class="ev reveal" data-d="' + (i % 4) + '" style="--c:' + typeColor(e.type) + '"><div class="ev-date"><b>' + (+p[2]) + '</b><span>' + window.CMS.months[+p[1] - 1].slice(0, 3) + ' · ' + esc(e.time) + '</span></div>' +
      '<div><h3>' + esc(e.title) + '</h3><p>' + esc(e.place) + ' — ' + esc(e.text) + '</p></div><span class="ev-type">' + esc(e.type) + '</span></article>';
  }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function renderEvents() {
    var up = sortedEvents().filter(function (e) { return e.date >= iso(TODAY); });
    var a = $('#evUpcoming'); if (a) a.innerHTML = up.slice(0, 4).map(evHTML).join('') || '<p class="cd-empty">Найближчим часом подій немає.</p>';
    var b = $('#evAll'); if (b) b.innerHTML = up.map(evHTML).join('') || '<p class="cd-empty">Подій немає.</p>';
  }
  function newsCard(n, i) {
    return '<article class="news-card reveal" data-d="' + (i % 3) + '" data-cat="' + esc(n.cat) + '"><div class="nc-img"><img src="' + esc(n.img || 'img/gallery/n1.svg') + '" alt=""><span class="nc-cat">' + esc(n.cat) + '</span></div>' +
      '<div class="nc-body"><span class="nc-date">' + window.CMS.fmtDate(n.date) + '</span><h3>' + esc(n.title) + '</h3><p>' + esc(n.excerpt) + '</p><span class="nc-more">Читати</span></div>' +
      '<a class="stretched" href="news.html?id=' + encodeURIComponent(n.id) + '" aria-label="' + esc(n.title) + '"></a></article>';
  }
  function sortedNews() { return (D.news || []).slice().sort(function (a, b) { return b.date.localeCompare(a.date); }); }
  function renderNewsLatest() { var el = $('#newsLatest'); if (el) el.innerHTML = sortedNews().slice(0, 3).map(newsCard).join(''); }

  function renderGallery(sel, limit) {
    var el = $(sel); if (!el) return;
    var g = (D.gallery || []).slice(0, limit || 99);
    el.innerHTML = g.map(function (it, i) {
      return '<button type="button" class="g-item reveal" data-d="' + (i % 4) + '" data-i="' + i + '"><img src="' + esc(it.img) + '" alt="' + esc(it.title) + '"><span>' + esc(it.title) + '</span><i>+</i></button>';
    }).join('');
    $$('.g-item', el).forEach(function (b) { b.addEventListener('click', function () { openLB(g, +b.getAttribute('data-i')); }); });
  }

  /* ---------- лайтбокс ---------- */
  var LB = { list: [], i: 0 };
  function openLB(list, i) {
    var lb = $('#lightbox'); if (!lb) return;
    LB.list = list; LB.i = i; showLB(); lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add('open'); });
    document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus();
  }
  function showLB() {
    var lb = $('#lightbox'), it = LB.list[LB.i]; var img = $('img', lb);
    img.style.transform = 'scale(.94)'; img.src = it.img; img.alt = it.title;
    setTimeout(function () { img.style.transform = ''; }, 30);
    $('figcaption', lb).innerHTML = esc(it.title) + '<small>' + (LB.i + 1) + ' / ' + LB.list.length + '</small>';
  }
  function closeLB() { var lb = $('#lightbox'); lb.classList.remove('open'); document.body.style.overflow = ''; setTimeout(function () { lb.hidden = true; }, 300); }
  function stepLB(d) { LB.i = (LB.i + d + LB.list.length) % LB.list.length; showLB(); }
  function initLB() {
    var lb = $('#lightbox'); if (!lb) return;
    $('.lb-close', lb).addEventListener('click', closeLB);
    $('.lb-prev', lb).addEventListener('click', function () { stepLB(-1); });
    $('.lb-next', lb).addEventListener('click', function () { stepLB(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLB(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLB(); if (e.key === 'ArrowLeft') stepLB(-1); if (e.key === 'ArrowRight') stepLB(1);
    });
    var sx = 0; lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) stepLB(dx < 0 ? 1 : -1); });
  }

  /* ---------- слайдер ---------- */
  function initSlider() {
    var root = $('#slider'); if (!root) return;
    var slides = D.slides || []; if (!slides.length) { root.style.display = 'none'; return; }
    $('#slides').innerHTML = slides.map(function (s, i) {
      return '<div class="slide' + (i === 0 ? ' active' : '') + '" role="group" aria-roledescription="слайд" aria-label="' + (i + 1) + ' з ' + slides.length + '"><img src="' + esc(s.img) + '" alt=""><span class="slide-num">0' + (i + 1) + '</span><div class="slide-body"><span class="kicker">' + esc(s.kicker) + '</span><h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p>' +
        (s.cta ? '<a class="btn btn-lime" href="' + esc(s.href || '#') + '"><span>' + esc(s.cta) + '</span>' + ARROW + '</a>' : '') + '</div></div>';
    }).join('');
    var dots = $('#slDots');
    dots.innerHTML = slides.map(function (s, i) { return '<button type="button" role="tab" aria-label="Слайд ' + (i + 1) + '"' + (i === 0 ? ' class="active" aria-selected="true"' : '') + '></button>'; }).join('');
    var els = $$('.slide', root), ds = $$('button', dots), bar = $('.sl-progress span', root), cur = 0, timer = null, DUR = 6000;
    root.style.setProperty('--dur', DUR + 'ms');
    function go(n) {
      els[cur].classList.remove('active'); ds[cur].classList.remove('active'); ds[cur].removeAttribute('aria-selected');
      cur = (n + els.length) % els.length;
      els[cur].classList.add('active'); ds[cur].classList.add('active'); ds[cur].setAttribute('aria-selected', 'true');
      restart();
    }
    function restart() {
      clearTimeout(timer); if (SHOT) return;
      bar.classList.remove('run'); void bar.offsetWidth; bar.classList.add('run');
      timer = setTimeout(function () { go(cur + 1); }, DUR);
    }
    $('.sl-prev', root).addEventListener('click', function () { go(cur - 1); });
    $('.sl-next', root).addEventListener('click', function () { go(cur + 1); });
    ds.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });
    root.addEventListener('mouseenter', function () { clearTimeout(timer); bar.classList.remove('run'); });
    root.addEventListener('mouseleave', restart);
    var sx = 0; root.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1)); });
    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') go(cur - 1); if (e.key === 'ArrowRight') go(cur + 1); });
    restart();
  }

  /* ---------- календар ---------- */
  function initCalendar() {
    var grid = $('#calGrid'); if (!grid) return;
    var evs = sortedEvents();
    var types = []; evs.forEach(function (e) { if (types.indexOf(e.type) < 0) types.push(e.type); });
    var active = types.slice();
    var view = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
    var firstUp = evs.filter(function (e) { return e.date >= iso(TODAY); })[0];
    var sel = firstUp ? firstUp.date : iso(TODAY);
    var fl = $('#calFilters');
    fl.innerHTML = types.map(function (t) { return '<button type="button" class="chip active" data-t="' + esc(t) + '" style="--c:' + typeColor(t) + '"><span>' + esc(t) + '</span></button>'; }).join('');
    $$('.chip', fl).forEach(function (c) {
      c.addEventListener('click', function () {
        var t = c.getAttribute('data-t'), k = active.indexOf(t);
        if (k >= 0) active.splice(k, 1); else active.push(t);
        c.classList.toggle('active', k < 0); draw(0); showDay(sel);
      });
    });
    function dayEvents(d) { return evs.filter(function (e) { return e.date === d && active.indexOf(e.type) >= 0; }); }
    function draw(dir) {
      $('#calTitle').textContent = window.CMS.monthsNom[view.getMonth()] + ' ' + view.getFullYear();
      var start = (view.getDay() + 6) % 7, d0 = new Date(view.getFullYear(), view.getMonth(), 1 - start), out = '';
      for (var i = 0; i < 42; i++) {
        var d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + i), key = iso(d), list = dayEvents(key);
        if (i === 35 && d.getMonth() !== view.getMonth()) break;
        var cls = 'cal-cell' + (d.getMonth() !== view.getMonth() ? ' out' : '') + (key === iso(TODAY) ? ' today' : '') + (list.length ? ' has' : '') + (key === sel ? ' sel' : '');
        out += '<button type="button" class="' + cls + '" data-day="' + key + '"' + (list.length ? '' : ' tabindex="-1"') + ' aria-label="' + d.getDate() + ' ' + window.CMS.months[d.getMonth()] + (list.length ? ', подій: ' + list.length : '') + '"><span class="d">' + d.getDate() + '</span>' +
          (list.length ? '<span class="cal-t">' + esc(list[0].title) + '</span><span class="cal-dots">' + list.map(function (e) { return '<i style="--c:' + typeColor(e.type) + '"></i>'; }).join('') + '</span>' : '') + '</button>';
      }
      grid.innerHTML = out;
      if (dir && !REDUCED) { grid.style.setProperty('--from', (dir * 30) + 'px'); grid.classList.remove('anim'); void grid.offsetWidth; grid.classList.add('anim'); }
      $$('.cal-cell', grid).forEach(function (c) {
        c.addEventListener('click', function () { sel = c.getAttribute('data-day'); $$('.cal-cell.sel', grid).forEach(function (x) { x.classList.remove('sel'); }); c.classList.add('sel'); showDay(sel); });
      });
    }
    function showDay(key) {
      var p = key.split('-'), list = dayEvents(key);
      $('#calDay').innerHTML = '<span class="kicker">' + ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П’ятниця', 'Субота'][new Date(+p[0], +p[1] - 1, +p[2]).getDay()] + '</span><h3>' + (+p[2]) + ' ' + window.CMS.months[+p[1] - 1] + '</h3>' +
        (list.length ? list.map(function (e) { return '<div class="cd-ev" style="--c:' + typeColor(e.type) + '"><span class="t">' + esc(e.time) + ' · ' + esc(e.type) + '</span><h4>' + esc(e.title) + '</h4><p>' + esc(e.text) + '</p><span class="pl">📍 ' + esc(e.place) + '</span></div>'; }).join('') + '<a class="btn btn-lime sm" href="contacts.html#form"><span>Зареєструватися</span>' + ARROW + '</a>'
          : '<p class="cd-empty">На цей день подій не заплановано. Оберіть день із кольоровою позначкою — або просто приходьте лазити: ми працюємо щодня.</p>');
    }
    $$('.cal-nav').forEach(function (b) {
      b.addEventListener('click', function () { var dir = +b.getAttribute('data-dir'); view = new Date(view.getFullYear(), view.getMonth() + dir, 1); draw(dir); });
    });
    draw(0); showDay(sel);
  }

  /* ---------- новини ---------- */
  function initNews() {
    var grid = $('#newsAll'); if (!grid) return;
    var list = sortedNews();
    var id = new URLSearchParams(location.search).get('id');
    if (id) {
      var idx = -1; list.forEach(function (n, i) { if (n.id === id) idx = i; });
      if (idx >= 0) { renderArticle(list, idx); return; }
    }
    grid.innerHTML = list.map(newsCard).join('');
    var cats = ['Усі']; list.forEach(function (n) { if (cats.indexOf(n.cat) < 0) cats.push(n.cat); });
    var cur = 'Усі', q = '';
    $('#newsCats').innerHTML = cats.map(function (c, i) {
      var cnt = c === 'Усі' ? list.length : list.filter(function (n) { return n.cat === c; }).length;
      return '<button type="button" class="chip' + (i === 0 ? ' active' : '') + '" data-c="' + esc(c) + '"><span>' + esc(c) + '<i>' + cnt + '</i></span></button>';
    }).join('');
    function apply() {
      var shown = 0;
      $$('.news-card', grid).forEach(function (c, i) {
        var n = list[i], ok = (cur === 'Усі' || n.cat === cur) && (!q || (n.title + ' ' + n.excerpt + ' ' + n.body).toLowerCase().indexOf(q) >= 0);
        c.classList.toggle('hide', !ok); if (ok) shown++;
      });
      $('#newsEmpty').hidden = shown > 0;
    }
    $$('#newsCats .chip').forEach(function (b) { b.addEventListener('click', function () { $$('#newsCats .chip').forEach(function (x) { x.classList.remove('active'); }); b.classList.add('active'); cur = b.getAttribute('data-c'); apply(); }); });
    $('#newsSearch').addEventListener('input', function (e) { q = e.target.value.trim().toLowerCase(); apply(); });
  }
  function renderArticle(list, i) {
    var n = list[i], sec = $('#article');
    document.body.classList.add('reading');
    document.title = n.title + ' — ' + ((D.site && D.site.name) || 'Вертикаль');
    var prev = list[i + 1], next = list[i - 1];
    sec.hidden = false;
    sec.innerHTML = '<div class="wrap"><article class="article"><a class="article-back" href="news.html">← Усі новини</a>' +
      '<div class="article-img reveal"><img src="' + esc(n.img || 'img/gallery/n1.svg') + '" alt=""></div>' +
      '<div class="meta"><span class="nc-cat">' + esc(n.cat) + '</span><span>' + window.CMS.fmtDate(n.date) + '</span><span>' + Math.max(1, Math.round(String(n.body).split(/\s+/).length / 160)) + ' хв читання</span></div>' +
      '<h2 class="reveal">' + esc(n.title) + '</h2><div class="article-body reveal">' + String(n.body || '').split(/\n\s*\n|\n/).filter(Boolean).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
      '<nav class="article-nav">' + (prev ? '<a class="link-arrow" href="news.html?id=' + encodeURIComponent(prev.id) + '">← Попередня</a>' : '<span></span>') + (next ? '<a class="link-arrow" href="news.html?id=' + encodeURIComponent(next.id) + '">Наступна →</a>' : '') + '</nav></article></div>';
    var ls = $('.news-list-sec'); if (ls) ls.hidden = true;
    sec.style.paddingTop = '50px';
  }

  /* ---------- сторінка «Про нас» ---------- */
  function renderAbout() {
    var a = D.about || {};
    if ($('#aboutTitle') && a.title) $('#aboutTitle').textContent = a.title;
    if ($('#aboutLead')) $('#aboutLead').textContent = a.lead || '';
    if ($('#aboutText')) $('#aboutText').innerHTML = String(a.text || '').split(/\n\s*\n|\n/).filter(Boolean).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    var v = $('#values'); if (v) v.innerHTML = (a.values || []).map(function (x, i) { return '<div class="value reveal" data-d="' + i + '">' + icon(x.icon) + '<h3>' + esc(x.title) + '</h3><p>' + esc(x.text) + '</p></div>'; }).join('');
    var t = $('#team'); if (t) t.innerHTML = (D.trainers || []).map(function (c, i) { return '<article class="coach reveal" data-d="' + i + '"><div class="coach-img"><img src="' + esc(c.img) + '" alt="Ілюстрований портрет: ' + esc(c.name) + '"></div><div class="coach-body"><h3>' + esc(c.name) + '</h3><span class="role">' + esc(c.role) + '</span><p>' + esc(c.text) + '</p></div></article>'; }).join('');
  }

  /* ---------- карта ---------- */
  function initMap() {
    var box = $('#uaMap'); if (!box || !window.UA_MAP) return;
    var P = window.UA_MAP.project, s = D.site || {};
    var home = P(+s.lon || 30.487, +s.lat || 50.4795);
    var g = '<g class="ua-grid">';
    for (var x = 50; x < 1000; x += 100) g += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="673"/>';
    for (var y = 40; y < 673; y += 100) g += '<line x1="0" y1="' + y + '" x2="1000" y2="' + y + '"/>';
    g += '</g>';
    var links = '', pts = '';
    (D.partners || []).forEach(function (p, i) {
      var q = P(p.lon, p.lat), mx = (q[0] + home[0]) / 2, my = Math.min(q[1], home[1]) - 70;
      links += '<path class="map-link" d="M' + home[0].toFixed(1) + ',' + home[1].toFixed(1) + ' Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' + q[0].toFixed(1) + ',' + q[1].toFixed(1) + '"/>';
      pts += '<g class="map-pt" tabindex="0" data-n="' + esc(p.city) + '" data-t="' + esc(p.text) + '"><circle class="dot" cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="8"/><text x="' + (p.left ? q[0] : q[0] + 14).toFixed(1) + '" y="' + (q[1] + (p.left ? 40 : 9)).toFixed(1) + '"' + (p.left ? ' text-anchor="middle"' : '') + '>' + esc(p.city) + '</text></g>';
    });
    var hm = '<g class="map-pt home" tabindex="0" data-n="' + esc(s.name || 'Вертикаль') + ' · Київ" data-t="' + esc(s.address || '') + '"><circle class="map-pulse" cx="' + home[0] + '" cy="' + home[1] + '" r="10"/><circle class="map-pulse p2" cx="' + home[0] + '" cy="' + home[1] + '" r="10"/><circle class="dot" cx="' + home[0] + '" cy="' + home[1] + '" r="11"/><text x="' + (home[0] + 18) + '" y="' + (home[1] - 14) + '">Київ · ' + esc(s.name || 'Вертикаль') + '</text></g>';
    box.insertAdjacentHTML('afterbegin', '<svg viewBox="0 0 1000 673" role="img" aria-label="Карта України з позначкою скеледрому в Києві та партнерськими містами">' + g + '<path class="ua-shape" d="' + window.UA_MAP.path + '"/>' + links + pts + hm + '</svg>');
    var tip = $('#mapTip');
    $$('.map-pt', box).forEach(function (pt) {
      function show() {
        var c = $('.dot', pt), br = box.getBoundingClientRect(), r = c.getBoundingClientRect();
        tip.innerHTML = '<b>' + pt.getAttribute('data-n') + '</b>' + pt.getAttribute('data-t');
        tip.style.left = (r.left + r.width / 2 - br.left) + 'px'; tip.style.top = (r.top - br.top) + 'px'; tip.classList.add('show');
      }
      pt.addEventListener('mouseenter', show); pt.addEventListener('focus', show);
      pt.addEventListener('mouseleave', function () { tip.classList.remove('show'); }); pt.addEventListener('blur', function () { tip.classList.remove('show'); });
    });
    var gm = $('#gmaps'); if (gm && s.lat && s.lon) gm.href = 'https://www.google.com/maps?q=' + s.lat + ',' + s.lon;
  }

  /* ---------- форма ---------- */
  function initForm() {
    var f = $('#cform'); if (!f) return;
    var rules = {
      name: function (v) { return v.trim().length >= 2; },
      phone: function (v) { return /^\+?3?8?0\d{9}$/.test(v.replace(/[\s()-]/g, '')); },
      email: function (v) { return !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
      message: function (v) { return v.trim().length >= 10; }
    };
    function check(name) {
      var el = f.elements[name], ok = rules[name](el.value), fld = el.closest('.field');
      fld.classList.toggle('bad', !ok); fld.classList.toggle('ok', ok && !!el.value.trim()); return ok;
    }
    Object.keys(rules).forEach(function (n) {
      f.elements[n].addEventListener('blur', function () { if (f.elements[n].value) check(n); });
      f.elements[n].addEventListener('input', function () { if (f.elements[n].closest('.field').classList.contains('bad')) check(n); });
    });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true; Object.keys(rules).forEach(function (n) { if (!check(n)) ok = false; });
      var ag = f.elements.agree; ag.closest('.check').classList.toggle('bad', !ag.checked); if (!ag.checked) ok = false;
      if (!ok) { var b = $('.bad input, .bad textarea', f); if (b) b.focus(); return; }
      var topic = (f.querySelector('input[name=topic]:checked') || {}).value || '';
      window.CMS.addMessage({ name: f.elements.name.value.trim(), phone: f.elements.phone.value.trim(), email: f.elements.email.value.trim(), topic: topic, message: f.elements.message.value.trim() });
      $('#fsName').textContent = f.elements.name.value.trim();
      f.classList.add('sent');
    });
    $('#fsAgain').addEventListener('click', function () { f.reset(); $$('.field', f).forEach(function (x) { x.classList.remove('ok', 'bad'); }); f.classList.remove('sent'); });
  }

  /* ---------- загальні анімації ---------- */
  function counters(root) {
    $$('[data-count]', root).forEach(function (el) {
      var target = +el.getAttribute('data-count');
      var fmt = function (v) { return Math.round(v).toLocaleString('uk-UA'); };
      if (SHOT || REDUCED) { el.textContent = fmt(target); return; }
      var io = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return; io.disconnect();
        var t0 = performance.now(), dur = 1600;
        (function tick(t) { var k = Math.min(1, (t - t0) / dur); el.textContent = fmt(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); })(t0);
      }, { threshold: .4 });
      io.observe(el);
    });
  }
  function reveal() {
    var els = $$('.reveal');
    if (SHOT || REDUCED || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
  }
  function heroTitle() {
    var h = $('.ht-line'); if (!h) return;
    var words = h.textContent.trim().split(/\s+/);
    h.innerHTML = words.map(function (w) { return '<span class="w">' + esc(w) + '</span>'; }).join(' ');
  }
  function liveNow() {
    var el = $('#liveNow'); if (!el || SHOT || REDUCED) return;
    var v = 47; setInterval(function () { v = Math.max(28, Math.min(72, v + Math.round((Math.random() - .45) * 4))); el.textContent = v; }, 2800);
  }
  function header() {
    var hdr = $('#hdr'), burger = $('.burger'), nav = $('#nav');
    var onS = function () { hdr.classList.toggle('scrolled', window.scrollY > 10); };
    window.addEventListener('scroll', onS, { passive: true }); onS();
    if (burger) burger.addEventListener('click', function () {
      var o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o ? 'true' : 'false'); document.body.style.overflow = o ? 'hidden' : '';
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) burger.click(); });
  }
  function ripple() {
    document.addEventListener('pointerdown', function (e) {
      var b = e.target.closest('.btn'); if (!b || REDUCED) return;
      var r = b.getBoundingClientRect(), s = document.createElement('span'), d = Math.max(r.width, r.height);
      s.className = 'ripple'; s.style.width = s.style.height = d + 'px'; s.style.left = (e.clientX - r.left - d / 2) + 'px'; s.style.top = (e.clientY - r.top - d / 2) + 'px';
      b.appendChild(s); setTimeout(function () { s.remove(); }, 650);
    });
  }
  function transitions() {
    var wipe = $('.wipe'); if (!wipe || SHOT || REDUCED) return;
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
      var href = a.getAttribute('href') || '';
      if (!/\.html(\?|#|$)/.test(href) || /^https?:/.test(href)) return;
      var url = new URL(href, location.href);
      if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
      e.preventDefault(); wipe.classList.add('in');
      setTimeout(function () { location.href = href; }, 380);
    });
    window.addEventListener('pageshow', function () { wipe.classList.remove('in'); });
  }
  function preloader() {
    var p = $('.preloader'); if (!p) return;
    if (SHOT) { p.remove(); return; }
    var done = function () { p.classList.add('done'); setTimeout(function () { p.remove(); }, 500); };
    if (document.readyState === 'complete') setTimeout(done, 450); else window.addEventListener('load', function () { setTimeout(done, 350); });
    setTimeout(done, 1000);
  }
  function parallax() {
    if (SHOT || REDUCED) return;
    var items = $$('.phero-holds, .cta-holds');
    if (!items.length) return;
    window.addEventListener('scroll', function () {
      items.forEach(function (el) { var r = el.parentNode.getBoundingClientRect(); el.style.transform = 'translateY(' + (r.top * -0.15).toFixed(1) + 'px)'; });
    }, { passive: true });
  }
  function toast(msg) { var t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); setTimeout(function () { t.classList.remove('show'); }, 2600); }
  window.vToast = toast;

  /* ---------- старт ---------- */
  applyCommon();
  heroTitle();
  if ($('#heroWall')) buildHeroWall($('#heroWall'));
  $$('[data-holds]').forEach(function (el, i) { decoHolds(el, +el.getAttribute('data-holds') || 10, 31 + i * 7 + page.length); });
  renderStats();
  if (page === 'home') { renderServices(false); renderEvents(); renderNewsLatest(); renderGallery('#galleryHome', 8); initSlider(); }
  if (page === 'services') { renderServices(true); renderPasses(); renderKids(); }
  if (page === 'about') { renderAbout(); renderGallery('#gallery'); }
  if (page === 'events') { initCalendar(); renderEvents(); }
  if (page === 'news') initNews();
  if (page === 'contacts') { initMap(); initForm(); }
  initLB(); header(); ripple(); transitions(); preloader(); parallax(); liveNow();
  counters(document); reveal();
  // анімація смуг складності
  if (!SHOT && 'IntersectionObserver' in window) {
    var gio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); } }); }, { threshold: .3 });
    $$('.grades li').forEach(function (l) { gio.observe(l); });
  }
  if (location.hash && !SHOT) { var tgt = document.getElementById(location.hash.slice(1)); if (tgt) setTimeout(function () { tgt.scrollIntoView({ behavior: 'smooth' }); }, 300); }
  try { window.CMS.trackView(page || 'other'); } catch (e) {}
})();
