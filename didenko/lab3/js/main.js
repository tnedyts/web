/* «Смерекова Хата» — публічна частина сайту (рендер з CMS) */
(function () {
  var html = document.documentElement, SHOT = html.classList.contains('shot');
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var C = CMS.load(), E = CMS.esc, page = document.body.getAttribute('data-page');
  var TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  var MONTHS = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];

  function toast(msg, type) {
    var t = $('.toast'); t.textContent = msg; t.className = 'toast show ' + (type || '');
    clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('show'); }, 2800);
  }

  /* ---------- шапка, меню, футер з CMS ---------- */
  document.title = document.title.replace('Смерекова Хата', C.site.name);
  $$('[data-cms]').forEach(function (el) { var v = CMS.get(C, el.getAttribute('data-cms')); if (v != null) el.textContent = v; });
  $$('[data-cms-html]').forEach(function (el) { var v = CMS.get(C, el.getAttribute('data-cms-html')) || ''; el.innerHTML = v.split(/\n\s*\n/).map(function (p) { return '<p>' + E(p) + '</p>'; }).join(''); });
  var here = location.pathname.split('/').pop() || 'index.html';
  $('#nav').innerHTML = C.menu.map(function (m) { return '<a href="' + E(m.href) + '"' + (m.href.split('#')[0] === here ? ' class="active"' : '') + '>' + E(m.label) + '</a>'; }).join('') + '<a class="nav-book" href="rooms.html#booking">Забронювати</a>';
  $('#fmenu').innerHTML = C.menu.map(function (m) { return '<li><a href="' + E(m.href) + '">' + E(m.label) + '</a></li>'; }).join('');
  $$('.f-phone').forEach(function (e) { e.textContent = C.site.phone; e.href = 'tel:' + C.site.phone.replace(/\s/g, ''); });
  $$('.f-mail').forEach(function (e) { e.textContent = C.site.email; e.href = 'mailto:' + C.site.email; });

  var burger = $('.burger'), nav = $('#nav');
  burger.addEventListener('click', function () { var o = nav.classList.toggle('open'); burger.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); document.body.classList.toggle('menu-open', o); });
  var header = $('.header');
  function onScroll() { header.classList.toggle('scrolled', scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- прелоадер і переходи ---------- */
  function hidePre() { var p = $('#preloader'); if (p) { p.classList.add('done'); setTimeout(function () { p.remove(); }, 700); } }
  if (SHOT) hidePre(); else { window.addEventListener('load', function () { setTimeout(hidePre, 400); }); setTimeout(hidePre, 1000); }
  document.body.classList.add('ready');
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a || SHOT || REDUCED || e.ctrlKey || e.metaKey || a.target === '_blank') return;
    var h = a.getAttribute('href'); if (!h || h.charAt(0) === '#' || /^(https?:|mailto:|tel:)/.test(h)) return;
    if (h.split('#')[0] === here && h.indexOf('#') > -1) return;
    e.preventDefault(); document.body.classList.add('leaving'); setTimeout(function () { location.href = h; }, 420);
  });
  window.addEventListener('pageshow', function () { document.body.classList.remove('leaving'); });

  /* ---------- reveal, лічильники, паралакс ---------- */
  function countUp(el) {
    var end = +el.getAttribute('data-count');
    if (SHOT || REDUCED) { el.textContent = end.toLocaleString('uk-UA'); return; }
    var t0 = performance.now(); (function f(t) { var k = Math.min(1, (t - t0) / 1800); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 4))).toLocaleString('uk-UA'); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  function reveal() {
    var els = $$('.reveal:not(.in), [data-count]:not(.counted)');
    if (SHOT || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); if (e.hasAttribute('data-count')) { e.classList.add('counted'); countUp(e); } }); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (!x.isIntersecting) return; var t = x.target; t.classList.add('in'); if (t.hasAttribute('data-count') && !t.classList.contains('counted')) { t.classList.add('counted'); countUp(t); } io.unobserve(t); }); }, { threshold: .15 });
    els.forEach(function (e) { io.observe(e); });
  }
  function parallax() {
    var els = $$('[data-par]'); if (!els.length || SHOT || REDUCED) return;
    window.addEventListener('scroll', function () { els.forEach(function (el) { var r = el.parentNode.getBoundingClientRect(); el.style.transform = 'translate3d(0,' + (r.top * -+el.getAttribute('data-par')).toFixed(1) + 'px,0) scale(1.12)'; }); }, { passive: true });
  }

  /* ---------- снігопад (canvas) ---------- */
  function snow(cv) {
    var ctx = cv.getContext('2d'), W, H, dpr = Math.min(2, devicePixelRatio || 1), fl = [];
    function size() { W = cv.offsetWidth; H = cv.offsetHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    for (var i = 0; i < 160; i++) fl.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2.6 + .6, v: Math.random() * .8 + .3, w: Math.random() * 6.28, d: Math.random() * .6 + .2 });
    var mx = 0; addEventListener('mousemove', function (e) { mx = (e.clientX / innerWidth - .5) * 1.2; });
    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < fl.length; i++) {
        var f = fl[i]; ctx.globalAlpha = .35 + f.r / 5; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
        if (!SHOT && !REDUCED) { f.y += f.v * (1 + f.r * .3); f.w += .01; f.x += Math.sin(f.w) * f.d + mx; if (f.y > H + 5) { f.y = -5; f.x = Math.random() * W; } if (f.x > W + 5) f.x = -5; if (f.x < -5) f.x = W + 5; }
      }
      if (!SHOT && !REDUCED) requestAnimationFrame(tick);
    }
    tick();
  }

  /* ---------- слайдер ---------- */
  function slider(el, slides) {
    var cur = 0, timer, DUR = 6500;
    el.innerHTML = slides.map(function (s, i) {
      return '<div class="slide' + (i === 0 ? ' active' : '') + '"><div class="slide-bg">' + sceneSVG(s.scene, { label: s.title }) + '</div><div class="slide-shade"></div><div class="wrap slide-txt"><span class="script">' + E(C.site.tagline) + '</span><h1>' + E(s.title) + '</h1><p>' + E(s.text) + '</p><div class="slide-btns"><a class="btn btn-gold" href="' + E(s.href || 'rooms.html') + '">' + E(s.cta || 'Детальніше') + '</a><a class="btn btn-line" href="about.html">Про готель</a></div></div></div>';
    }).join('') + '<canvas class="snow" aria-hidden="true"></canvas><div class="fog f1"></div><div class="fog f2"></div>' +
      '<div class="slider-ui wrap"><div class="dots">' + slides.map(function (s, i) { return '<button class="dot' + (i === 0 ? ' on' : '') + '" aria-label="Слайд ' + (i + 1) + '"><i></i></button>'; }).join('') + '</div><span class="counter"><b>01</b> / ' + String(slides.length).padStart(2, '0') + '</span><div class="arrows"><button class="arr prev" aria-label="Попередній слайд">←</button><button class="arr next" aria-label="Наступний слайд">→</button></div></div>';
    var S = $$('.slide', el), D = $$('.dot', el);
    function go(n) {
      S[cur].classList.remove('active'); D[cur].classList.remove('on'); cur = (n + S.length) % S.length;
      S[cur].classList.add('active'); D[cur].classList.add('on'); $('.counter b', el).textContent = String(cur + 1).padStart(2, '0');
      restart();
    }
    function restart() { clearInterval(timer); if (!SHOT && !REDUCED) timer = setInterval(function () { go(cur + 1); }, DUR); }
    $('.prev', el).addEventListener('click', function () { go(cur - 1); });
    $('.next', el).addEventListener('click', function () { go(cur + 1); });
    D.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });
    var x0 = null; el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1)); x0 = null; });
    el.addEventListener('mouseenter', function () { clearInterval(timer); el.classList.add('paused'); });
    el.addEventListener('mouseleave', function () { el.classList.remove('paused'); restart(); });
    restart(); snow($('.snow', el));
  }

  /* ---------- галерея + лайтбокс ---------- */
  function gallery(el, items) {
    el.innerHTML = items.map(function (g, i) { return '<button class="g-item reveal" style="--i:' + (i % 4) + '" data-i="' + i + '"><span class="g-img">' + sceneSVG(g.scene, { label: g.title }) + '</span><span class="g-cap">' + E(g.title) + '</span><span class="g-zoom">+</span></button>'; }).join('');
    var lb = $('#lightbox'), cur = 0;
    function show(i) { cur = (i + items.length) % items.length; $('.lb-img', lb).innerHTML = sceneSVG(items[cur].scene, { label: items[cur].title }); $('.lb-cap', lb).innerHTML = '<b>' + E(items[cur].title) + '</b><span>' + (cur + 1) + ' / ' + items.length + '</span>'; lb.classList.remove('anim'); void lb.offsetWidth; lb.classList.add('anim'); }
    el.addEventListener('click', function (e) { var b = e.target.closest('.g-item'); if (!b) return; show(+b.getAttribute('data-i')); lb.classList.add('open'); document.body.style.overflow = 'hidden'; });
    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }
    $('.lb-close', lb).onclick = close; $('.lb-prev', lb).onclick = function () { show(cur - 1); }; $('.lb-next', lb).onclick = function () { show(cur + 1); };
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
  }

  /* ---------- календар подій ---------- */
  function calendar(el, events, listEl) {
    var first = events.map(function (e) { return e.date; }).filter(function (d) { return d >= iso(TODAY); }).sort()[0];
    var view = first ? new Date(first.slice(0, 7) + '-01T00:00:00') : new Date(TODAY.getFullYear(), TODAY.getMonth(), 1), sel = first || iso(TODAY);
    if (view - new Date(TODAY.getFullYear(), TODAY.getMonth(), 1) > 0) view = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
    function draw() {
      var y = view.getFullYear(), m = view.getMonth(), start = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
      var h = '<div class="cal-head"><button class="cal-nav" data-d="-1" aria-label="Попередній місяць">‹</button><b>' + MONTHS[m] + ' ' + y + '</b><button class="cal-nav" data-d="1" aria-label="Наступний місяць">›</button></div><div class="cal-grid">';
      ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].forEach(function (d) { h += '<span class="cal-wd">' + d + '</span>'; });
      for (var i = 0; i < start; i++) h += '<span></span>';
      for (var d = 1; d <= days; d++) {
        var ds = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'), ev = events.filter(function (e) { return e.date === ds; });
        h += '<button class="cal-day' + (ev.length ? ' has' : '') + (ds === iso(TODAY) ? ' today' : '') + (ds === sel ? ' sel' : '') + '" data-ds="' + ds + '">' + d + (ev.length ? '<i></i>' : '') + '</button>';
      }
      el.innerHTML = h + '</div><p class="cal-legend"><i></i> день з подією · <u></u> сьогодні</p>';
      list();
    }
    function list() {
      if (!listEl) return;
      var ev = events.filter(function (e) { return e.date === sel; });
      var up = events.filter(function (e) { return e.date >= iso(TODAY); }).sort(function (a, b) { return a.date.localeCompare(b.date); });
      listEl.innerHTML = '<h4>' + (ev.length ? 'Події ' + CMS.fmtDate(sel) : 'Найближчі події') + '</h4>' + (ev.length ? ev : up.slice(0, 4)).map(function (e) {
        return '<article class="ev"><div class="ev-date"><b>' + +e.date.slice(8) + '</b><span>' + MONTHS[+e.date.slice(5, 7) - 1].slice(0, 3) + '</span></div><div><h5>' + E(e.title) + '</h5><p>' + E(e.text) + '</p><small>🕒 ' + E(e.time || '') + '</small></div></article>';
      }).join('') || '<p class="muted">Подій поки не заплановано.</p>';
    }
    el.addEventListener('click', function (e) {
      var n = e.target.closest('.cal-nav'), d = e.target.closest('.cal-day');
      if (n) { view.setMonth(view.getMonth() + +n.getAttribute('data-d')); draw(); }
      if (d) { sel = d.getAttribute('data-ds'); $$('.cal-day', el).forEach(function (x) { x.classList.toggle('sel', x === d); }); list(); }
    });
    draw();
  }

  /* ---------- картки ---------- */
  function roomCard(r, i) {
    return '<article class="room reveal" style="--i:' + (i % 3) + '"><div class="room-img">' + sceneSVG(r.scene, { label: r.name }) + '<span class="price">від <b>' + CMS.money(r.price) + '</b> / ніч</span></div><div class="room-body"><h3>' + E(r.name) + '</h3><div class="room-meta"><span>👥 до ' + r.guests + ' гостей</span><span>📐 ' + r.area + ' м²</span></div><p>' + E(r.desc) + '</p><a class="link-arrow" href="rooms.html#' + E(r.id) + '">Детальніше <span>→</span></a></div></article>';
  }
  function newsCard(n, i) {
    return '<article class="news reveal" style="--i:' + (i % 3) + '"><div class="news-top"><span class="tag">' + E(n.tag) + '</span><time>' + CMS.fmtDate(n.date) + '</time></div><h3>' + E(n.title) + '</h3><p>' + E(n.text) + '</p></article>';
  }
  var ICONS = {
    leaf: '<svg viewBox="0 0 48 48"><path d="M8 40 C 8 18 22 8 42 6 C 40 28 28 40 8 40Z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M8 40 L32 16" stroke="currentColor" stroke-width="2.5"/></svg>',
    home: '<svg viewBox="0 0 48 48"><path d="M6 22 L24 6 L42 22 M10 18 V42 H38 V18" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M20 42 V30 h8 v12" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>',
    heart: '<svg viewBox="0 0 48 48"><path d="M24 40 S6 30 6 17 C6 10 12 6 17 6 c3 0 6 2 7 5 c1 -3 4 -5 7 -5 c5 0 11 4 11 11 C42 30 24 40 24 40Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>'
  };

  /* ---------- форми ---------- */
  function validate(form, rules) {
    var ok = true;
    Object.keys(rules).forEach(function (n) {
      var el = form[n], err = rules[n](el.value.trim()), f = el.closest('.field');
      f.classList.toggle('bad', !!err); $('.err', f).textContent = err || ''; if (err) ok = false;
    });
    if (!ok) { form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); }
    return ok;
  }
  var reMail = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i, rePhone = /^[+\d][\d\s()-]{8,}$/;

  /* ================= СТОРІНКИ ================= */
  var pages = {
    home: function () {
      slider($('#slider'), C.slides);
      $('#stats').innerHTML = C.home.stats.map(function (s, i) { return '<div class="stat reveal" style="--i:' + i + '"><b data-count="' + s.n + '">0</b><span>' + E(s.label) + '</span></div>'; }).join('');
      $('#introArt').innerHTML = '<div class="ia ia1" data-par=".05">' + sceneSVG('fog', { label: 'Туман у горах' }) + '</div><div class="ia ia2">' + sceneSVG('room2', { label: 'Номер' }) + '</div>';
      $('#homeRooms').innerHTML = C.rooms.filter(function (r) { return r.active; }).slice(0, 3).map(roomCard).join('');
      var exp = [['spa', 'Чани і спа', 'chan', 'Мідні чани на дровах, сауна з видом на гори та масажі з карпатськими травами.'], ['tour', 'Екскурсії', 'hoverla', 'Говерла, водоспад Пробій, полонина з вівчарями й джипи на Драгобрат.'], ['food', 'Ресторан «Ватра»', 'food', 'Бануш, форель із ставу, гриби з нашого лісу й хліб із печі.']];
      $('#homeExp').innerHTML = exp.map(function (x, i) { return '<a class="exp reveal" style="--i:' + i + '" href="experiences.html#' + x[0] + '"><span class="exp-img">' + sceneSVG(x[2], { label: x[1] }) + '</span><span class="exp-txt"><small>0' + (i + 1) + '</small><b>' + x[1] + '</b><em>' + x[3] + '</em></span></a>'; }).join('');
      gallery($('#gallery'), C.gallery);
      calendar($('#cal'), C.events, $('#calList'));
      $('#homeNews').innerHTML = C.news.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).slice(0, 3).map(newsCard).join('');
      var qb = $('#quickBook'), d1 = new Date(TODAY.getTime() + 7 * 864e5), d2 = new Date(TODAY.getTime() + 9 * 864e5);
      qb.from.value = iso(d1); qb.to.value = iso(d2); qb.from.min = qb.to.min = iso(TODAY);
      qb.addEventListener('submit', function (e) { e.preventDefault(); location.href = 'rooms.html?from=' + qb.from.value + '&to=' + qb.to.value + '&guests=' + qb.guests.value + '#booking'; });
    },

    about: function () {
      $('#values').innerHTML = C.about.values.map(function (v, i) { return '<div class="value reveal" style="--i:' + i + '"><span class="v-ico">' + (ICONS[v.icon] || ICONS.leaf) + '</span><h3>' + E(v.title) + '</h3><p>' + E(v.text) + '</p></div>'; }).join('');
      $('#aboutArt').innerHTML = sceneSVG('autumn', { label: 'Осінь у Яблуниці' });
      $('#stats').innerHTML = C.home.stats.map(function (s, i) { return '<div class="stat reveal" style="--i:' + i + '"><b data-count="' + s.n + '">0</b><span>' + E(s.label) + '</span></div>'; }).join('');
      gallery($('#gallery'), C.gallery);
    },

    rooms: function () {
      var R = C.rooms.filter(function (r) { return r.active; });
      $('#roomList').innerHTML = R.map(function (r, i) {
        return '<article class="room-row reveal" id="' + E(r.id) + '"><div class="rr-img">' + sceneSVG(r.scene, { label: r.name }) + '</div><div class="rr-body"><span class="script">№ 0' + (i + 1) + '</span><h2>' + E(r.name) + '</h2><div class="room-meta"><span>👥 до ' + r.guests + ' гостей</span><span>📐 ' + r.area + ' м²</span></div><p>' + E(r.desc) + '</p><ul class="feat">' + r.features.map(function (f) { return '<li>' + E(f) + '</li>'; }).join('') + '</ul><div class="rr-foot"><div class="rr-price"><small>за ніч від</small><b>' + CMS.money(r.price) + '</b></div><a class="btn btn-gold" href="#booking" data-pick="' + E(r.id) + '">Забронювати</a></div></div></article>';
      }).join('');
      /* бронювання */
      var f = $('#bookForm'), sel = f.room, st = { from: null, to: null }, view = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
      sel.innerHTML = R.map(function (r) { return '<option value="' + E(r.id) + '">' + E(r.name) + ' — ' + CMS.money(r.price) + '</option>'; }).join('');
      var q = new URLSearchParams(location.search);
      if (q.get('from') && q.get('to') && q.get('to') > q.get('from')) { st.from = q.get('from'); st.to = q.get('to'); view = new Date(st.from.slice(0, 7) + '-01T00:00:00'); }
      if (q.get('guests')) f.guests.value = q.get('guests');
      if (SHOT && !st.from) { st.from = iso(new Date(TODAY.getTime() + 5 * 864e5)); st.to = iso(new Date(TODAY.getTime() + 8 * 864e5)); }
      document.addEventListener('click', function (e) { var p = e.target.closest('[data-pick]'); if (p) { sel.value = p.getAttribute('data-pick'); draw(); } });
      function busy(ds) { var r = sel.value; return C.bookings.some(function (b) { return b.room === r && b.status !== 'Скасовано' && ds >= b.from && ds < b.to; }); }
      function draw() {
        var h = '';
        for (var k = 0; k < 2; k++) {
          var v = new Date(view.getFullYear(), view.getMonth() + k, 1), y = v.getFullYear(), m = v.getMonth(), start = (v.getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
          h += '<div class="bc-month"><div class="cal-head">' + (k === 0 ? '<button type="button" class="cal-nav" data-d="-1" aria-label="Назад">‹</button>' : '<span></span>') + '<b>' + MONTHS[m] + ' ' + y + '</b>' + (k === 1 ? '<button type="button" class="cal-nav" data-d="1" aria-label="Вперед">›</button>' : '<span></span>') + '</div><div class="cal-grid">';
          ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].forEach(function (d) { h += '<span class="cal-wd">' + d + '</span>'; });
          for (var i = 0; i < start; i++) h += '<span></span>';
          for (var d = 1; d <= days; d++) {
            var ds = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'), past = ds < iso(TODAY), b = busy(ds);
            var cls = 'cal-day' + (past ? ' past' : '') + (b ? ' busy' : '') + (ds === st.from ? ' from' : '') + (ds === st.to ? ' to' : '') + (st.from && st.to && ds > st.from && ds < st.to ? ' in' : '');
            h += '<button type="button" class="' + cls + '" data-ds="' + ds + '"' + (past || b ? ' disabled' : '') + '>' + d + '</button>';
          }
          h += '</div></div>';
        }
        $('#bookCal').innerHTML = h; calc();
      }
      function calc() {
        var r = R.filter(function (x) { return x.id === sel.value; })[0], n = st.from && st.to ? CMS.nights(st.from, st.to) : 0, g = +f.guests.value;
        var extra = Math.max(0, g - r.guests) * 600 * n;
        $('#sum').innerHTML = '<div><span>Заїзд</span><b>' + (st.from ? CMS.fmtDate(st.from) : '—') + '</b></div><div><span>Виїзд</span><b>' + (st.to ? CMS.fmtDate(st.to) : '—') + '</b></div><div><span>Ночей</span><b>' + n + '</b></div>' + (extra ? '<div><span>Додаткові місця</span><b>' + CMS.money(extra) + '</b></div>' : '') + '<div class="total"><span>Разом</span><b>' + CMS.money(n * r.price + extra) + '</b></div>';
        $('#sumNote').textContent = g > r.guests ? 'Номер розрахований на ' + r.guests + ' гостей; кожне додаткове місце — 600 грн/ніч.' : 'Сніданок і чай із травами входять у вартість.';
        return n * r.price + extra;
      }
      $('#bookCal').addEventListener('click', function (e) {
        var n = e.target.closest('.cal-nav'), d = e.target.closest('.cal-day:not([disabled])');
        if (n) { view.setMonth(view.getMonth() + +n.getAttribute('data-d')); if (view < new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)) view = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1); draw(); return; }
        if (!d) return; var ds = d.getAttribute('data-ds');
        if (!st.from || st.to || ds <= st.from) { st.from = ds; st.to = null; }
        else {
          var a = new Date(st.from), b = new Date(ds), clash = false;
          for (var t = new Date(a); t < b; t.setDate(t.getDate() + 1)) if (busy(iso(t))) clash = true;
          if (clash) { toast('У цьому діапазоні є зайняті дати', 'warn'); return; }
          st.to = ds;
        }
        draw();
      });
      sel.addEventListener('change', function () { st.from = st.to = null; draw(); });
      f.guests.addEventListener('change', calc);
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate(f, { name: function (v) { return v.length < 2 ? 'Вкажіть ім’я' : ''; }, phone: function (v) { return rePhone.test(v) ? '' : 'Телефон у форматі +380…'; } })) return;
        if (!st.from || !st.to) { toast('Оберіть дати заїзду та виїзду в календарі', 'warn'); $('#bookCal').classList.remove('shake'); void $('#bookCal').offsetWidth; $('#bookCal').classList.add('shake'); return; }
        var total = calc(), b = { id: CMS.uid('b'), created: iso(TODAY), name: f.name.value.trim(), phone: f.phone.value.trim(), room: sel.value, from: st.from, to: st.to, guests: +f.guests.value, total: total, status: 'Нове', note: f.note.value.trim() };
        var fresh = CMS.load(); fresh.bookings.unshift(b);
        if (!CMS.save(fresh)) { toast('Не вдалося зберегти бронювання (localStorage недоступний)', 'warn'); return; }
        C = fresh;
        $('.book-card').classList.add('done'); $('#okText').textContent = b.name.split(' ')[0] + ', ми отримали запит на ' + CMS.fmtDate(b.from) + ' — ' + CMS.fmtDate(b.to) + '. Адміністратор зателефонує протягом 30 хвилин.';
      });
      $('#again').addEventListener('click', function () { f.reset(); st.from = st.to = null; $('.book-card').classList.remove('done'); draw(); });
      draw();
    },

    experiences: function () {
      function grid(cat) {
        return C.services.filter(function (s) { return s.cat === cat; }).map(function (s, i) {
          return '<article class="svc reveal" style="--i:' + (i % 3) + '"><div class="svc-img">' + sceneSVG(s.scene, { label: s.name }) + '</div><div class="svc-body"><h3>' + E(s.name) + '</h3><p>' + E(s.text) + '</p><div class="svc-foot"><b>' + CMS.money(s.price) + '</b><span>' + E(s.unit) + '</span></div></div></article>';
        }).join('');
      }
      $('#spa').innerHTML = grid('spa'); $('#tour').innerHTML = grid('tour');
      $('#foodMenu').innerHTML = C.services.filter(function (s) { return s.cat === 'food'; }).map(function (s, i) { return '<li class="reveal" style="--i:' + (i % 3) + '"><div><b>' + E(s.name) + '</b><span>' + E(s.text) + '</span></div><i></i><em>' + CMS.money(s.price) + '<small>' + E(s.unit) + '</small></em></li>'; }).join('');
      $('#foodArt').innerHTML = sceneSVG('food', { label: 'Бануш у ресторані «Ватра»' });
      $('#fireArt').innerHTML = sceneSVG('fire', { label: 'Ватра' }).replace('xMidYMid slice', 'xMidYMax slice');
      var tabs = $$('.tabs button');
      tabs.forEach(function (t) { t.addEventListener('click', function () { var s = $('#' + t.getAttribute('data-t') + 'Sec'); s.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' }); }); });
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) tabs.forEach(function (t) { t.classList.toggle('on', t.getAttribute('data-t') + 'Sec' === x.target.id); }); }); }, { rootMargin: '-45% 0px -50% 0px' });
        $$('.exp-sec').forEach(function (s) { io.observe(s); });
      }
    },

    news: function () {
      var N = C.news.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }), tag = 'all';
      var tags = N.map(function (n) { return n.tag; }).filter(function (t, i, a) { return a.indexOf(t) === i; });
      $('#ntags').innerHTML = '<button class="chip on" data-tag="all">Усі</button>' + tags.map(function (t) { return '<button class="chip" data-tag="' + E(t) + '">' + E(t) + '</button>'; }).join('');
      function draw() { $('#newsList').innerHTML = N.filter(function (n) { return tag === 'all' || n.tag === tag; }).map(newsCard).join(''); reveal(); }
      $('#ntags').addEventListener('click', function (e) { var b = e.target.closest('[data-tag]'); if (!b) return; tag = b.getAttribute('data-tag'); $$('#ntags .chip').forEach(function (c) { c.classList.toggle('on', c === b); }); draw(); });
      draw();
      calendar($('#cal'), C.events, $('#calList'));
    },

    contacts: function () {
      $('#addr').textContent = C.site.address;
      renderUAMap($('#map'), { home: { name: 'Яблуниця', lon: C.site.lon, lat: C.site.lat, label: C.site.name, tip: C.site.name + ' · Яблуниця, 900 м н.р.м.' }, cities: ['Івано-Франківськ', 'Львів', 'Ужгород', 'Київ', 'Вінниця', 'Одеса', 'Харків', 'Дніпро', 'Полтава', 'Чернігів'], labelBelow: true });
      $('#gmap').href = 'https://www.google.com/maps?q=' + C.site.lat + ',' + C.site.lon;
      var f = $('#contactForm');
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate(f, { name: function (v) { return v.length < 2 ? 'Вкажіть ім’я' : ''; }, email: function (v) { return reMail.test(v) ? '' : 'Некоректний e-mail'; }, text: function (v) { return v.length < 10 ? 'Напишіть хоча б 10 символів' : ''; } })) return;
        var fresh = CMS.load(); fresh.messages.unshift({ id: CMS.uid('m'), date: iso(TODAY), name: f.name.value.trim(), email: f.email.value.trim(), text: f.text.value.trim() }); CMS.save(fresh);
        $('.cform-card').classList.add('done');
      });
      $('#again').addEventListener('click', function () { f.reset(); $('.cform-card').classList.remove('done'); });
    }
  };
  /* фонові сцени для героїв внутрішніх сторінок */
  $$('[data-scene]').forEach(function (el) { el.innerHTML = sceneSVG(el.getAttribute('data-scene'), { label: el.getAttribute('data-label') || 'Карпатський пейзаж', seed: +el.getAttribute('data-seed') || 0 }); });
  $$('canvas.snow[data-auto]').forEach(function (cv) { snow(cv); });
  if (pages[page]) pages[page]();
  parallax(); reveal();
})();
