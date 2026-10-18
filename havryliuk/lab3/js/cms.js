/* =========================================================
   Міні-CMS для статичного сайту: слайдер, галерея з переглядом,
   календар подій, новини, форма зв’язку й панель адміністратора.
   Початковий вміст сайту лежить у js/data.js, а зміни, зроблені
   в панелі керування, зберігаються в браузері (localStorage).
   ========================================================= */
(function () {
  'use strict';

  var D = window.SITE_DATA || { news: [], events: [], settings: {} };
  var KEY = document.documentElement.getAttribute('data-site') || 'site';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MONTHS = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
  var MONTHS_N = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
  var WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

  function load(name, def) {
    try { var v = JSON.parse(localStorage.getItem(KEY + ':' + name)); return v === null ? def : v; } catch (e) { return def; }
  }
  function save(name, val) {
    try { localStorage.setItem(KEY + ':' + name, JSON.stringify(val)); } catch (e) { /* сховище недоступне */ }
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function human(s) { var d = parse(s); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
  function $(s, root) { return (root || document).querySelector(s); }
  function $$(s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); }
  function typeName(t) { var x = (D.eventTypes || []).filter(function (e) { return e[0] === t; })[0]; return x ? x[1] : t; }
  function newsCat(c) { var x = (D.newsCats || []).filter(function (e) { return e[0] === c; })[0]; return x ? x[1] : c; }

  /* ---------- налаштування з панелі керування ---------- */
  var settings = Object.assign({}, D.settings, load('settings', {}));
  if (settings.accent) document.documentElement.style.setProperty('--accent', settings.accent);

  var banner = $('[data-banner]');
  if (banner && settings.bannerOn && settings.bannerText && !sessionStorageGet('banner-closed')) {
    $('[data-banner-text]', banner).textContent = settings.bannerText;
    banner.hidden = false;
    $('[data-banner-close]', banner).addEventListener('click', function () { banner.hidden = true; sessionStorageSet('banner-closed', '1'); });
  }
  function sessionStorageGet(k) { try { return sessionStorage.getItem(KEY + ':' + k); } catch (e) { return null; } }
  function sessionStorageSet(k, v) { try { sessionStorage.setItem(KEY + ':' + k, v); } catch (e) { /* немає */ } }

  /* ---------- меню на телефоні ---------- */
  var burger = $('[data-burger]'), nav = $('#site-nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('is-open', open);
    });
  }
  var head = $('.site-head');
  if (head) window.addEventListener('scroll', function () { head.classList.toggle('is-scrolled', scrollY > 20); }, { passive: true });

  /* ---------- слайдер ---------- */
  $$('[data-slider]').forEach(function (root) {
    var slides = $$('.slide', root), dots = $('.slider__dots', root), playBtn = $('[data-play]', root), live = $('[data-slider-live]', root);
    var i = 0, timer = null, playing = settings.autoplay !== false && !reduce;
    var interval = +settings.interval || 6000;
    slides.forEach(function (s, k) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'slider__dot'; b.setAttribute('aria-label', 'Слайд ' + (k + 1));
      b.addEventListener('click', function () { go(k); restart(); });
      dots.appendChild(b);
    });
    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        s.classList.toggle('is-active', k === i);
        s.setAttribute('aria-hidden', k === i ? 'false' : 'true');
        $$('a, button', s).forEach(function (a) { a.tabIndex = k === i ? 0 : -1; });
      });
      $$('.slider__dot', dots).forEach(function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      var bar = $('.slider__progress span', root);
      if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
      if (live) live.textContent = 'Слайд ' + (i + 1) + ' з ' + slides.length;
    }
    function restart() {
      clearInterval(timer);
      root.classList.toggle('is-playing', playing);
      root.style.setProperty('--interval', interval + 'ms');
      if (playing) timer = setInterval(function () { go(i + 1); }, interval);
      if (playBtn) { playBtn.setAttribute('aria-pressed', playing ? 'false' : 'true'); playBtn.setAttribute('aria-label', playing ? 'Зупинити автопрокрутку' : 'Увімкнути автопрокрутку'); }
    }
    $('[data-prev]', root).addEventListener('click', function () { go(i - 1); restart(); });
    $('[data-next]', root).addEventListener('click', function () { go(i + 1); restart(); });
    if (playBtn) playBtn.addEventListener('click', function () { playing = !playing; restart(); });
    root.addEventListener('mouseenter', function () { clearInterval(timer); root.classList.remove('is-playing'); });
    root.addEventListener('mouseleave', restart);
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(i - 1); restart(); }
      if (e.key === 'ArrowRight') { go(i + 1); restart(); }
    });
    // гортання пальцем
    var x0 = null;
    root.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    root.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) { go(dx < 0 ? i + 1 : i - 1); restart(); }
    });
    go(0); restart();
  });

  /* ---------- новини: додані в панелі керування ---------- */
  var localNews = load('news', []);
  function newsHtml(n, short) {
    return '<article class="news-item news-item--local reveal is-visible" data-cat="' + esc(n.cat) + '"><p class="news-item__meta"><span class="tag">' + esc(newsCat(n.cat)) + '</span><time datetime="' + n.date + '">' + human(n.date) + '</time><span class="tag tag--new">Нове</span></p>' +
      '<h3 class="news-item__title">' + esc(n.title) + '</h3><p>' + esc(short && n.text.length > 160 ? n.text.slice(0, 157) + '…' : n.text).replace(/\n/g, '<br>') + '</p></article>';
  }
  var newsList = $('[data-news-list]');
  if (newsList && localNews.length) {
    localNews.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).forEach(function (n) { newsList.insertAdjacentHTML('afterbegin', newsHtml(n)); });
  }
  var latest = $('[data-news-latest]');
  if (latest && localNews.length) {
    localNews.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).forEach(function (n) { latest.insertAdjacentHTML('afterbegin', newsHtml(n, true)); });
    $$('.news-item', latest).slice(3).forEach(function (n) { n.remove(); });
  }
  // фільтр новин за рубрикою
  $$('[data-nfilter]').forEach(function (b) {
    b.addEventListener('click', function () {
      var c = b.getAttribute('data-nfilter');
      $$('[data-nfilter]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      $$('.news-item', newsList).forEach(function (n) {
        n.hidden = c !== 'all' && n.getAttribute('data-cat') !== c;
      });
    });
  });

  /* ---------- події та календар ---------- */
  function allEvents() {
    return D.events.concat(load('events', []).map(function (e) { e.local = true; return e; }))
      .sort(function (a, b) { return (a.date + (a.time || '')) < (b.date + (b.time || '')) ? -1 : 1; });
  }
  function eventHtml(e) {
    var d = parse(e.date);
    return '<li class="event event--' + esc(e.type) + '"><p class="event__date"><b>' + d.getDate() + '</b>' + MONTHS[d.getMonth()].slice(0, 3) + '</p>' +
      '<div><p class="event__meta"><span class="tag tag--' + esc(e.type) + '">' + esc(typeName(e.type)) + '</span>' + (e.time ? '<span>' + esc(e.time) + '</span>' : '') + (e.place ? '<span>' + esc(e.place) + '</span>' : '') + '</p>' +
      '<h3 class="event__title">' + esc(e.title) + '</h3>' + (e.text ? '<p>' + esc(e.text) + '</p>' : '') + '</div></li>';
  }
  var upcoming = $('[data-upcoming]');
  if (upcoming) {
    var today = iso(new Date()), n = +upcoming.getAttribute('data-upcoming') || 3;
    var list = allEvents().filter(function (e) { return e.date >= today; }).slice(0, n);
    upcoming.innerHTML = list.length ? list.map(eventHtml).join('') : '<li class="event event--empty">Найближчих подій поки немає. Слідкуйте за новинами!</li>';
  }

  var cal = $('[data-calendar]');
  if (cal) {
    var now = new Date(), events = allEvents(), view = new Date(now.getFullYear(), now.getMonth(), 1), selected = iso(now), typeFilter = 'all';
    var title = $('[data-cal-title]', cal), grid = $('[data-cal-grid]', cal), dayBox = $('[data-day-events]');
    var visible = function () { return events.filter(function (e) { return typeFilter === 'all' || e.type === typeFilter; }); };
    var render = function () {
      title.textContent = MONTHS_N[view.getMonth()] + ' ' + view.getFullYear();
      var first = (view.getDay() + 6) % 7, days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate(), html = '';
      WD.forEach(function (w, k) { html += '<span class="cal__wd' + (k > 4 ? ' cal__wd--end' : '') + '" aria-hidden="true">' + w + '</span>'; });
      for (var k = 0; k < first; k++) html += '<span class="cal__pad" aria-hidden="true"></span>';
      var ev = visible();
      for (var d = 1; d <= days; d++) {
        var ds = iso(new Date(view.getFullYear(), view.getMonth(), d)), list = ev.filter(function (e) { return e.date === ds; });
        var cls = 'cal__day' + (ds === iso(now) ? ' is-today' : '') + (ds === selected ? ' is-selected' : '') + (list.length ? ' has-events' : '');
        var dots = list.slice(0, 3).map(function (e) { return '<i class="dot dot--' + esc(e.type) + '"></i>'; }).join('');
        html += '<button type="button" class="' + cls + '" data-date="' + ds + '" aria-label="' + d + ' ' + MONTHS[view.getMonth()] + (list.length ? ', подій: ' + list.length : '') + '"' + (ds === selected ? ' aria-pressed="true"' : ' aria-pressed="false"') + '><span>' + d + '</span><span class="cal__dots">' + dots + '</span></button>';
      }
      grid.innerHTML = html;
      showDay(selected);
    };
    var showDay = function (ds) {
      if (!dayBox) return;
      var list = visible().filter(function (e) { return e.date === ds; });
      $('[data-day-title]', dayBox).textContent = human(ds);
      $('[data-day-list]', dayBox).innerHTML = list.length ? list.map(eventHtml).join('') : '<li class="event event--empty">Цього дня подій немає. Оберіть день із позначкою.</li>';
    };
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-date]');
      if (!b) return;
      selected = b.getAttribute('data-date');
      $$('.cal__day', grid).forEach(function (x) { x.classList.toggle('is-selected', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      showDay(selected);
    });
    $('[data-cal-prev]', cal).addEventListener('click', function () { view.setMonth(view.getMonth() - 1); render(); });
    $('[data-cal-next]', cal).addEventListener('click', function () { view.setMonth(view.getMonth() + 1); render(); });
    $('[data-cal-today]', cal).addEventListener('click', function () { view = new Date(now.getFullYear(), now.getMonth(), 1); selected = iso(now); render(); });
    $$('[data-tfilter]').forEach(function (b) {
      b.addEventListener('click', function () {
        typeFilter = b.getAttribute('data-tfilter');
        $$('[data-tfilter]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        render(); renderAll();
      });
    });
    var allBox = $('[data-all-events]');
    var renderAll = function () {
      if (!allBox) return;
      var today = iso(new Date()), list = visible().filter(function (e) { return e.date >= today; });
      allBox.innerHTML = list.length ? list.map(eventHtml).join('') : '<li class="event event--empty">Запланованих подій цього типу немає.</li>';
    };
    render(); renderAll();
  }

  /* ---------- галерея та перегляд зображень ---------- */
  var gal = $('[data-gallery]'), lb = $('[data-lightbox]');
  if (gal) {
    var items = $$('.gitem', gal);
    $$('[data-gfilter]').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = b.getAttribute('data-gfilter');
        $$('[data-gfilter]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        items.forEach(function (it) {
          var show = c === 'all' || it.getAttribute('data-cat') === c;
          if (show && it.hidden && !reduce) it.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 350, easing: 'ease-out' });
          it.hidden = !show;
        });
      });
    });
  }
  if (lb) {
    var stage = $('.lightbox__stage', lb), cap = $('.lightbox__cap', lb), count = $('.lightbox__count', lb), cur = 0, pool = [];
    var show = function (k) {
      if (!pool.length) return;
      cur = (k + pool.length) % pool.length;
      var it = pool[cur];
      stage.innerHTML = '';
      var art = it.querySelector('svg').cloneNode(true);
      art.removeAttribute('aria-hidden'); art.setAttribute('role', 'img'); art.setAttribute('aria-label', it.querySelector('figcaption').textContent);
      stage.appendChild(art);
      cap.innerHTML = it.querySelector('figcaption').innerHTML;
      count.textContent = (cur + 1) + ' / ' + pool.length;
      if (!reduce) stage.animate([{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 300 });
    };
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-open]');
      if (!b) return;
      var scope = b.closest('[data-gallery]') || document;
      pool = $$('.gitem', scope).filter(function (it) { return !it.hidden; });
      var it = b.closest('.gitem');
      if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
      document.documentElement.classList.add('no-scroll');
      show(pool.indexOf(it));
    });
    var close = function () { if (lb.open && typeof lb.close === 'function') lb.close(); else lb.removeAttribute('open'); };
    lb.addEventListener('close', function () { document.documentElement.classList.remove('no-scroll'); });
    $('[data-lb-close]', lb).addEventListener('click', close);
    $('[data-lb-prev]', lb).addEventListener('click', function () { show(cur - 1); });
    $('[data-lb-next]', lb).addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
    var lx = null;
    stage.addEventListener('pointerdown', function (e) { lx = e.clientX; });
    stage.addEventListener('pointerup', function (e) { if (lx !== null && Math.abs(e.clientX - lx) > 50) show(e.clientX < lx ? cur + 1 : cur - 1); lx = null; });
  }

  /* ---------- форма зв’язку ---------- */
  var form = $('[data-contact]');
  if (form) {
    var params = new URLSearchParams(location.search);
    if (params.get('item') && form.elements.message) {
      form.elements.message.value = 'Мене цікавить: ' + params.get('item') + '.\n';
      if (form.elements.topic && params.get('topic')) form.elements.topic.value = params.get('topic');
    }
    var msg = $('.form__msg', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = [];
      $$('[required]', form).forEach(function (f) {
        var ok = f.type === 'checkbox' ? f.checked : f.value.trim().length > 1 && (f.type !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value.trim())) && (f.type !== 'tel' || /^[+\d][\d\s()-]{8,}$/.test(f.value.trim()));
        f.closest('p').classList.toggle('is-invalid', !ok);
        f.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok) bad.push(f);
      });
      if (bad.length) { msg.textContent = 'Перевірте позначені поля.'; msg.className = 'form__msg is-bad'; bad[0].focus(); return; }
      var inbox = load('messages', []);
      inbox.push({ id: Date.now(), date: new Date().toISOString(), name: form.elements.name.value.trim(), contact: (form.elements.contact || form.elements.email).value.trim(), topic: form.elements.topic ? form.elements.topic.options[form.elements.topic.selectedIndex].text : '', text: form.elements.message.value.trim(), read: false });
      save('messages', inbox);
      form.reset();
      msg.textContent = 'Дякуємо! Повідомлення надіслано, ми зв’яжемося з вами найближчим часом.'; msg.className = 'form__msg is-ok';
    });
  }

  /* ---------- поява блоків ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$('.reveal:not(.is-visible)').forEach(function (el, k) { el.style.transitionDelay = (k % 4) * 0.07 + 's'; io.observe(el); });
  } else $$('.reveal').forEach(function (el) { el.classList.add('is-visible'); });

  /* =========================================================
     Панель керування (admin.html)
     ========================================================= */
  var admin = $('[data-admin]');
  if (!admin) { window.CMS = { load: load, save: save, reduce: reduce }; return; }

  var loginBox = $('[data-login]'), panel = $('[data-panel]');
  var authed = function () { try { return sessionStorage.getItem(KEY + ':auth') === '1'; } catch (e) { return false; } };
  var openPanel = function () { loginBox.hidden = true; panel.hidden = false; refresh(); };
  if (authed()) openPanel();
  $('form', loginBox).addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, m = $('.form__msg', f);
    if (f.elements.user.value.trim() === D.admin.user && f.elements.pass.value === D.admin.pass) {
      sessionStorageSet('auth', '1'); openPanel();
    } else { m.textContent = 'Неправильний логін або пароль.'; m.className = 'form__msg is-bad'; f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); }
  });
  $('[data-logout]').addEventListener('click', function () { try { sessionStorage.removeItem(KEY + ':auth'); } catch (e) { /* немає */ } location.reload(); });

  // вкладки бічного меню
  var tabs = $$('[data-tab]'), panes = $$('[data-pane]');
  var openTab = function (name) {
    tabs.forEach(function (t) { t.setAttribute('aria-current', t.getAttribute('data-tab') === name ? 'page' : 'false'); });
    panes.forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== name; });
    $('[data-pane-title]').textContent = $('[data-tab="' + name + '"] .lbl').textContent;
  };
  tabs.forEach(function (t) { t.addEventListener('click', function () { openTab(t.getAttribute('data-tab')); }); });
  $$('[data-goto]').forEach(function (b) { b.addEventListener('click', function () { openTab(b.getAttribute('data-goto')); }); });

  var toast = $('[data-toast]'), toastT;
  var notify = function (text) { toast.textContent = text; toast.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('is-on'); }, 2400); };

  function refresh() {
    var news = load('news', []), evs = load('events', []), inbox = load('messages', []);
    // консоль
    $('[data-stat="news"]').textContent = D.news.length + news.length;
    $('[data-stat="events"]').textContent = D.events.length + evs.length;
    $('[data-stat="messages"]').textContent = inbox.length;
    $('[data-stat="unread"]').textContent = inbox.filter(function (m) { return !m.read; }).length;
    $('[data-stat="gallery"]').textContent = D.galleryCount || 0;
    var badge = $('[data-unread-badge]'), unread = inbox.filter(function (m) { return !m.read; }).length;
    badge.textContent = unread; badge.hidden = !unread;
    // таблиця новин
    var rows = news.map(function (n, k) { return '<tr><td>' + esc(n.title) + '</td><td>' + esc(newsCat(n.cat)) + '</td><td>' + human(n.date) + '</td><td><span class="pill pill--new">додано в панелі</span></td><td><button type="button" class="link-btn" data-del-news="' + k + '">Видалити</button></td></tr>'; })
      .concat(D.news.map(function (n) { return '<tr><td>' + esc(n.title) + '</td><td>' + esc(newsCat(n.cat)) + '</td><td>' + human(n.date) + '</td><td><span class="pill">опубліковано</span></td><td><a class="link-btn" href="news.html">Переглянути</a></td></tr>'; }));
    $('[data-news-table]').innerHTML = rows.join('');
    // таблиця подій
    var erows = allEvents().map(function (e) {
      var k = evs.indexOf(evs.filter(function (x) { return x.id === e.id; })[0]);
      return '<tr><td>' + human(e.date) + (e.time ? ', ' + esc(e.time) : '') + '</td><td>' + esc(e.title) + '</td><td>' + esc(typeName(e.type)) + '</td><td>' + (e.local ? '<button type="button" class="link-btn" data-del-event="' + k + '">Видалити</button>' : '<span class="pill">з теми</span>') + '</td></tr>';
    });
    $('[data-events-table]').innerHTML = erows.join('');
    // повідомлення
    var box = $('[data-inbox]');
    box.innerHTML = inbox.length ? inbox.slice().reverse().map(function (m) {
      return '<li class="msg' + (m.read ? '' : ' msg--unread') + '"><p class="msg__head"><b>' + esc(m.name) + '</b><span>' + esc(m.contact) + '</span><time datetime="' + m.date + '">' + human(m.date.slice(0, 10)) + '</time></p>' +
        (m.topic ? '<p class="msg__topic">' + esc(m.topic) + '</p>' : '') + '<p>' + esc(m.text).replace(/\n/g, '<br>') + '</p>' +
        '<p class="msg__actions">' + (m.read ? '' : '<button type="button" class="link-btn" data-read="' + m.id + '">Позначити прочитаним</button>') + '<button type="button" class="link-btn link-btn--bad" data-del-msg="' + m.id + '">Видалити</button></p></li>';
    }).join('') : '<li class="msg msg--empty">Повідомлень поки немає. Надішліть тестове через <a href="contacts.html">форму на сторінці контактів</a>.</li>';
    // останні дії
    var recent = news.slice(-2).map(function (n) { return 'Новина «' + esc(n.title) + '»'; }).concat(evs.slice(-2).map(function (e) { return 'Подія «' + esc(e.title) + '»'; }));
    $('[data-recent]').innerHTML = recent.length ? recent.map(function (r) { return '<li>' + r + '</li>'; }).join('') : '<li>Ви ще нічого не додавали. Спробуйте створити новину або подію.</li>';
  }

  // додавання новин
  $$('[data-add-news]').forEach(function (f) {
    var today = iso(new Date());
    if (f.elements.date) f.elements.date.value = today;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var title = f.elements.title.value.trim(), text = f.elements.text.value.trim();
      if (title.length < 4 || text.length < 10) { notify('Додайте заголовок і текст новини.'); return; }
      var news = load('news', []);
      news.push({ title: title, text: text, cat: f.elements.cat ? f.elements.cat.value : (D.newsCats[0] || [''])[0], date: f.elements.date ? f.elements.date.value || today : today });
      save('news', news); f.reset(); if (f.elements.date) f.elements.date.value = today;
      refresh(); notify('Новину опубліковано на сайті.');
    });
  });
  // додавання подій
  var ef = $('[data-add-event]');
  if (ef) {
    ef.elements.date.value = iso(new Date(Date.now() + 7 * 864e5));
    ef.addEventListener('submit', function (e) {
      e.preventDefault();
      if (ef.elements.title.value.trim().length < 4 || !ef.elements.date.value) { notify('Вкажіть назву та дату події.'); return; }
      var evs = load('events', []);
      evs.push({ id: 'l' + Date.now(), date: ef.elements.date.value, time: ef.elements.time.value, title: ef.elements.title.value.trim(), place: ef.elements.place.value.trim(), type: ef.elements.type.value, text: ef.elements.text.value.trim() });
      save('events', evs); ef.reset(); ef.elements.date.value = iso(new Date(Date.now() + 7 * 864e5));
      refresh(); notify('Подію додано в календар.');
    });
  }
  admin.addEventListener('click', function (e) {
    var t = e.target, k;
    if ((k = t.getAttribute('data-del-news')) !== null) { var n = load('news', []); n.splice(+k, 1); save('news', n); refresh(); notify('Новину видалено.'); }
    if ((k = t.getAttribute('data-del-event')) !== null) { var ev = load('events', []); ev.splice(+k, 1); save('events', ev); refresh(); notify('Подію видалено.'); }
    if ((k = t.getAttribute('data-read')) !== null) { var m = load('messages', []); m.forEach(function (x) { if (String(x.id) === k) x.read = true; }); save('messages', m); refresh(); }
    if ((k = t.getAttribute('data-del-msg')) !== null) { save('messages', load('messages', []).filter(function (x) { return String(x.id) !== k; })); refresh(); notify('Повідомлення видалено.'); }
  });

  // налаштування вигляду
  var sf = $('[data-settings]');
  if (sf) {
    var st = Object.assign({}, D.settings, load('settings', {}));
    var sw = $$('[name=accent]', sf);
    sw.forEach(function (r) { r.checked = r.value === (st.accent || D.settings.accent); });
    sf.elements.bannerOn.checked = !!st.bannerOn;
    sf.elements.bannerText.value = st.bannerText || '';
    sf.elements.autoplay.checked = st.autoplay !== false;
    sf.elements.interval.value = String(st.interval || 6000);
    sf.addEventListener('change', function (e) {
      if (e.target.name === 'accent') document.documentElement.style.setProperty('--accent', e.target.value);
    });
    sf.addEventListener('submit', function (e) {
      e.preventDefault();
      var acc = sw.filter(function (r) { return r.checked; })[0];
      save('settings', { accent: acc ? acc.value : '', bannerOn: sf.elements.bannerOn.checked, bannerText: sf.elements.bannerText.value.trim(), autoplay: sf.elements.autoplay.checked, interval: +sf.elements.interval.value });
      try { sessionStorage.removeItem(KEY + ':banner-closed'); } catch (err) { /* немає */ }
      notify('Налаштування збережено. Відкрийте сайт, щоб побачити зміни.');
    });
    $('[data-reset]').addEventListener('click', function () {
      if (!confirm('Видалити всі новини, події, повідомлення й налаштування, додані в панелі?')) return;
      ['news', 'events', 'messages', 'settings'].forEach(function (k) { try { localStorage.removeItem(KEY + ':' + k); } catch (err) { /* немає */ } });
      location.reload();
    });
  }
  openTab('dash');
  window.CMS = { load: load, save: save, reduce: reduce };
})();
