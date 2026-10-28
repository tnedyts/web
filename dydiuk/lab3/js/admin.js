/* =========================================================
   «Вертикаль» CMS — адмін-панель
   Вхід: admin / admin123. Дані: js/content.js + localStorage.
   © 2026 Олександр Дидюк
   ========================================================= */
(function () {
  'use strict';
  var CMS = window.CMS, esc = CMS.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SESSION = 'vertykal_admin_session';
  var data = CMS.get();
  var TODAY = new Date(2026, 9, 21);
  (function () { var n = new Date(); if (n > TODAY) TODAY = new Date(n.getFullYear(), n.getMonth(), n.getDate()); })();
  var TODAY_ISO = TODAY.getFullYear() + '-' + String(TODAY.getMonth() + 1).padStart(2, '0') + '-' + String(TODAY.getDate()).padStart(2, '0');
  var TYPES = ['Змагання', 'Тренування', 'Лекція', 'Діти', 'Кіно'];
  var TYPE_C = { 'Змагання': '#ff6b1a', 'Тренування': '#86b800', 'Лекція': '#1fb7dc', 'Діти': '#f5c400', 'Кіно': '#8b5cf6' };
  var IMAGES = ['img/slide-1.svg', 'img/slide-2.svg', 'img/slide-3.svg'].concat([1, 2, 3, 4, 5, 6, 7, 8].map(function (i) { return 'img/gallery/g' + i + '.svg'; })).concat([1, 2, 3, 4, 5, 6].map(function (i) { return 'img/gallery/n' + i + '.svg'; }));

  var I = {
    dash: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    site: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    slides: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M10 17v4M14 17v4"/>',
    news: '<path d="M4 5h13v14H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v9a2 2 0 0 1-2 2"/><path d="M7 9h7M7 13h7M7 16h4"/>',
    events: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><circle cx="12" cy="15" r="1.5"/>',
    price: '<path d="M20 12 12 20l-8-8V4h8z"/><circle cx="8" cy="8" r="1.5"/>',
    gallery: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    backup: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v3h16v-3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    up: '<path d="m6 15 6-6 6 6"/>', down: '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="M5 12l5 5 9-10"/>', eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    views: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>', bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>', warn: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>'
  };
  function ic(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (I[n] || '') + '</svg>'; }

  var VIEWS = [
    { grp: 'Огляд' },
    { id: 'dashboard', title: 'Дашборд', icon: 'dash' },
    { grp: 'Контент' },
    { id: 'site', title: 'Сайт і тексти', icon: 'site' },
    { id: 'menu', title: 'Меню', icon: 'menu' },
    { id: 'slides', title: 'Слайдер', icon: 'slides' },
    { id: 'news', title: 'Новини', icon: 'news' },
    { id: 'events', title: 'Події', icon: 'events' },
    { id: 'services', title: 'Послуги й ціни', icon: 'price' },
    { id: 'gallery', title: 'Галерея', icon: 'gallery' },
    { grp: 'Взаємодія' },
    { id: 'messages', title: 'Заявки', icon: 'mail' },
    { grp: 'Система' },
    { id: 'backup', title: 'Резервна копія', icon: 'backup' }
  ];

  /* ---------- утиліти ---------- */
  function toast(msg, err) {
    var t = document.createElement('div'); t.className = 'toast' + (err ? ' err' : '');
    t.innerHTML = ic(err ? 'warn' : 'check') + '<span>' + esc(msg) + '</span>';
    $('#toasts').appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 400); }, 2800);
  }
  function commit(msg) {
    if (!CMS.save(data)) { toast('Не вдалося зберегти: сховище недоступне', true); return; }
    CMS.log(msg); toast(msg); updateSide();
  }
  function setPath(obj, path, val) { var p = path.split('.'), o = obj; for (var i = 0; i < p.length - 1; i++) { o = o[p[i]] = o[p[i]] || {}; } o[p[p.length - 1]] = val; }
  function getPath(obj, path) { return path.split('.').reduce(function (o, k) { return o ? o[k] : undefined; }, obj); }
  function fmt(iso) { return CMS.fmtDate(iso); }
  function slug(s) {
    var map = { а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ь: '', ю: 'iu', я: 'ia' };
    return (String(s).toLowerCase().split('').map(function (c) { return map[c] !== undefined ? map[c] : c; }).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'zapys') + '-' + Date.now().toString(36).slice(-4);
  }
  function fld(label, name, val, opt) {
    opt = opt || {};
    var inp;
    if (opt.type === 'textarea') inp = '<textarea name="' + name + '" rows="' + (opt.rows || 4) + '"' + (opt.req ? ' required' : '') + '>' + esc(val) + '</textarea>';
    else if (opt.type === 'select') inp = '<select name="' + name + '">' + opt.options.map(function (o) { return '<option' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>';
    else inp = '<input name="' + name + '" type="' + (opt.type || 'text') + '" value="' + esc(val) + '"' + (opt.req ? ' required' : '') + (opt.list ? ' list="' + opt.list + '"' : '') + (opt.ph ? ' placeholder="' + esc(opt.ph) + '"' : '') + '>';
    return '<label class="fld' + (opt.full ? ' full' : '') + '"><span>' + esc(label) + (opt.req ? ' *' : '') + '</span>' + inp + (opt.help ? '<small>' + esc(opt.help) + '</small>' : '') + '</label>';
  }
  function imgPick(name, cur) {
    return '<div class="fld full"><span>Зображення</span><div class="img-pick">' + IMAGES.map(function (src) {
      return '<label><input type="radio" name="' + name + '" value="' + src + '"' + (src === cur ? ' checked' : '') + '><img src="' + src + '" alt=""></label>';
    }).join('') + '</div></div>';
  }

  /* ---------- модальне вікно ---------- */
  var modal = $('#modal'), mform = $('#modalForm'), onSubmit = null;
  function openModal(title, body, submitLabel, cb) {
    $('#modalTitle').textContent = title;
    mform.innerHTML = body + '<div class="save-bar"><button type="button" class="abtn abtn-ghost" data-close>Скасувати</button><button type="submit" class="abtn abtn-lime">' + esc(submitLabel || 'Зберегти') + '</button></div>';
    onSubmit = cb; modal.hidden = false; document.body.style.overflow = 'hidden';
    var f = $('input,textarea,select', mform); if (f) setTimeout(function () { f.focus(); }, 50);
  }
  function closeModal() { modal.hidden = true; document.body.style.overflow = ''; onSubmit = null; }
  modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
  mform.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    $$('[required]', mform).forEach(function (el) { var bad = !el.value.trim(); el.closest('.fld').classList.toggle('bad', bad); if (bad) ok = false; });
    if (!ok) { toast('Заповніть обов’язкові поля', true); return; }
    var fd = {}; $$('input,select,textarea', mform).forEach(function (el) { if (el.type === 'radio') { if (el.checked) fd[el.name] = el.value; } else if (el.type === 'checkbox') fd[el.name] = el.checked; else fd[el.name] = el.value.trim(); });
    if (onSubmit) onSubmit(fd); closeModal();
  });
  function confirmBox(text, cb) {
    openModal('Підтвердження', '<p style="margin:0;font-size:15px">' + esc(text) + '</p>', 'Так, видалити', cb);
    var b = $('.save-bar .abtn-lime', mform); b.className = 'abtn abtn-danger';
  }

  /* ---------- вхід ---------- */
  function loggedIn() { try { return sessionStorage.getItem(SESSION) === '1'; } catch (e) { return false; } }
  function setLogged(v) { try { if (v) sessionStorage.setItem(SESSION, '1'); else sessionStorage.removeItem(SESSION); } catch (e) {} }
  function loginArt() {
    var box = $('#laHolds'), W = 800, H = 900, s = '', seed = 11;
    var r = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var cols = ['#c6ff3d', '#ff6b1a', '#3dd9ff', '#ff3d7f', '#ffd43d', '#a46bff'];
    for (var i = 0; i < 34; i++) {
      var cx = r() * W, cy = r() * H, z = 12 + r() * 34, n = 6, d = '', pts = [];
      for (var k = 0; k < n; k++) { var a = k / n * 6.283 + (r() - .5) * .5, rr = z * (.65 + r() * .45); pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
      for (k = 0; k < n; k++) { var p0 = pts[k], p1 = pts[(k + 1) % n]; if (!k) d += 'M' + ((pts[n - 1][0] + p0[0]) / 2) + ',' + ((pts[n - 1][1] + p0[1]) / 2); d += 'Q' + p0[0] + ',' + p0[1] + ' ' + (p0[0] + p1[0]) / 2 + ',' + (p0[1] + p1[1]) / 2; }
      var c = cols[i % 6];
      s += '<g class="hold' + (i % 3 ? '' : ' f') + '" style="--d:' + (i * .04).toFixed(2) + 's"><path d="' + d + 'Z" fill="#000" opacity=".4" transform="translate(5,7)"/><path d="' + d + 'Z" fill="' + c + '"/><circle cx="' + cx + '" cy="' + cy + '" r="3" fill="#000" opacity=".5"/></g>';
    }
    box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice">' + s + '</svg>';
  }
  $('.pw-eye').addEventListener('click', function () { var i = $('#loginForm input[name=pass]'); i.type = i.type === 'password' ? 'text' : 'password'; });
  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var u = this.elements.user.value.trim(), p = this.elements.pass.value;
    if (u === 'admin' && p === 'admin123') { setLogged(true); CMS.log('Вхід адміністратора'); showApp(); toast('Вітаємо, адміністраторе!'); }
    else {
      $('#loginErr').textContent = !u || !p ? 'Введіть логін і пароль' : 'Невірний логін або пароль';
      var c = $('#loginForm'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
    }
  });
  $('#logout').addEventListener('click', function () { setLogged(false); location.hash = ''; location.reload(); });

  /* ---------- каркас ---------- */
  function showApp() {
    $('#login').hidden = true; $('#app').hidden = false;
    buildSide(); route();
  }
  function newMsgs() { return CMS.messages().filter(function (m) { return !m.read; }).length; }
  function buildSide() {
    $('#sideNav').innerHTML = VIEWS.map(function (v) {
      if (v.grp) return '<div class="grp">' + v.grp + '</div>';
      return '<button type="button" data-view="' + v.id + '">' + ic(v.icon) + '<span>' + v.title + '</span>' + (v.id === 'messages' ? '<span class="badge" id="msgBadge"></span>' : '') + '</button>';
    }).join('');
    $$('#sideNav button').forEach(function (b) { b.addEventListener('click', function () { location.hash = '#/' + b.getAttribute('data-view'); $('#side').classList.remove('open'); }); });
    updateSide();
  }
  function updateSide() {
    $('#sideName').textContent = data.site.name;
    var n = newMsgs(), b = $('#msgBadge'); if (b) { b.textContent = n; b.hidden = !n; }
    var bytes = 0; try { for (var k in localStorage) if (Object.prototype.hasOwnProperty.call(localStorage, k) && k.indexOf('vertykal') === 0) bytes += (localStorage.getItem(k) || '').length * 2; } catch (e) {}
    $('#stBar').style.width = Math.max(2, Math.min(100, bytes / 5242880 * 100)) + '%';
    $('#stTxt').textContent = (bytes / 1024).toFixed(1) + ' КБ з 5 МБ · ' + (CMS.isCustom() ? 'є зміни' : 'стандартний контент');
  }
  $('#sideToggle').addEventListener('click', function () { $('#side').classList.toggle('open'); });

  function route() {
    var id = (location.hash.match(/#\/(\w+)/) || [])[1] || 'dashboard';
    var v = VIEWS.filter(function (x) { return x.id === id; })[0] || VIEWS[1];
    $$('#sideNav button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-view') === v.id); });
    $('#viewTitle').textContent = v.title; $('#crumb').textContent = 'Вертикаль CMS / ' + v.title;
    document.title = v.title + ' — ' + data.site.name + ' CMS';
    var view = $('#view'); view.classList.add('swap'); void view.offsetWidth; view.classList.remove('swap');
    (R[v.id] || R.dashboard)(view);
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', function () { if (loggedIn()) route(); });

  /* ---------- розділи ---------- */
  var R = {};

  R.dashboard = function (v) {
    var up = data.events.filter(function (e) { return e.date >= TODAY_ISO; }).sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
    var msgs = CMS.messages(), views = CMS.views();
    var pages = [['home', 'Головна'], ['about', 'Про нас'], ['services', 'Тренування'], ['events', 'Розклад'], ['news', 'Новини'], ['contacts', 'Контакти']];
    var totalViews = pages.reduce(function (s, p) { return s + (views[p[0]] || 0); }, 0);
    // графік переглядів
    var max = Math.max.apply(null, pages.map(function (p) { return views[p[0]] || 0; }).concat([1]));
    var W = 600, H = 230, bw = 56, gap = (W - 40 - bw * pages.length) / (pages.length - 1);
    var bars = '';
    for (var y = 0; y <= 4; y++) { var yy = 20 + (H - 60) * y / 4; bars += '<line x1="30" x2="' + W + '" y1="' + yy + '" y2="' + yy + '" stroke="#e8ebe5"/>'; }
    pages.forEach(function (p, i) {
      var val = views[p[0]] || 0, h = (H - 60) * val / max, x = 40 + i * (bw + gap), yb = H - 40;
      bars += '<rect class="bar" x="' + x + '" y="' + (yb - h) + '" width="' + bw + '" height="' + Math.max(h, 2) + '" rx="6" fill="' + (i % 2 ? '#16181c' : '#c6ff3d') + '" style="animation-delay:' + (i * .07) + 's"/>' +
        '<text class="val" x="' + (x + bw / 2) + '" y="' + (yb - h - 8) + '" text-anchor="middle">' + val + '</text><text x="' + (x + bw / 2) + '" y="' + (H - 16) + '" text-anchor="middle">' + p[1] + '</text>';
    });
    // донат подій за типами
    var cnt = {}; data.events.forEach(function (e) { cnt[e.type] = (cnt[e.type] || 0) + 1; });
    var tot = data.events.length || 1, off = 0, C = 2 * Math.PI * 52, segs = '';
    Object.keys(cnt).forEach(function (t) { var len = C * cnt[t] / tot; segs += '<circle class="seg" cx="75" cy="75" r="52" stroke="' + (TYPE_C[t] || '#ff3d7f') + '" stroke-dasharray="' + len.toFixed(1) + ' ' + (C - len).toFixed(1) + '" stroke-dashoffset="' + (-off).toFixed(1) + '" transform="rotate(-90 75 75)"/>'; off += len; });
    var logs = CMS.logs().slice(0, 6);
    v.innerHTML =
      '<div class="grid g4">' +
      kpi('news', '#c6ff3d', data.news.length, 'Новин опубліковано', 'всього') +
      kpi('events', '#ffd9c2', up.length, 'Подій попереду', up[0] ? 'найближча ' + fmt(up[0].date).replace(/ \d{4}$/, '') : '—', 'o') +
      kpi('mail', '#c9f1fb', msgs.length, 'Заявок із сайту', newMsgs() + ' нових') +
      kpi('views', '#ffd3e1', totalViews, 'Переглядів сторінок', 'у цьому браузері', 'o') + '</div>' +
      '<div class="grid g2" style="margin-top:20px">' +
      '<section class="card chart"><div class="card-head"><div><h2>Відвідуваність сторінок</h2><p>Лічильник переглядів (localStorage цього браузера)</p></div><div class="legend"><span><i style="--c:#c6ff3d"></i>Перегляди</span></div></div>' +
      (totalViews ? '<svg viewBox="0 0 ' + W + ' ' + H + '">' + bars + '</svg>' : '<div class="empty-state">' + ic('views') + '<p>Ще немає переглядів. Відкрийте кілька сторінок сайту — і статистика з’явиться тут.</p></div>') + '</section>' +
      '<section class="card"><div class="card-head"><div><h2>Події за типами</h2><p>Усього в календарі: ' + data.events.length + '</p></div></div><div class="donut-wrap"><svg class="donut" viewBox="0 0 150 150"><circle cx="75" cy="75" r="52" stroke="#f0f2ee"/>' + segs + '<text x="75" y="80" text-anchor="middle">' + data.events.length + '</text><text class="sub" x="75" y="98" text-anchor="middle">ПОДІЙ</text></svg><ul class="dl">' +
      Object.keys(cnt).map(function (t) { return '<li style="--c:' + (TYPE_C[t] || '#ff3d7f') + '"><i></i>' + esc(t) + '<b>' + cnt[t] + '</b></li>'; }).join('') + '</ul></div></section></div>' +
      '<div class="grid g2" style="margin-top:20px">' +
      '<section class="card"><div class="card-head"><div><h2>Найближчі події</h2><p>Відображаються в календарі на сайті</p></div><button class="abtn sm" data-go="events">' + ic('events') + 'Усі події</button></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Дата</th><th>Подія</th><th>Тип</th></tr></thead><tbody>' +
      (up.slice(0, 5).map(function (e) { return '<tr><td><b>' + fmt(e.date).replace(/ \d{4}$/, '') + '</b><span class="t-sub">' + esc(e.time) + '</span></td><td class="t-title">' + esc(e.title) + '<span class="t-sub">' + esc(e.place) + '</span></td><td><span class="pill" style="--c:' + (TYPE_C[e.type] || '#ff3d7f') + '">' + esc(e.type) + '</span></td></tr>'; }).join('') || '<tr><td colspan="3" class="empty-state">Немає майбутніх подій</td></tr>') +
      '</tbody></table></div></section>' +
      '<section class="card"><div class="card-head"><h2>Швидкі дії</h2></div><div class="quick">' +
      '<button type="button" data-q="news">' + ic('plus') + 'Додати новину</button><button type="button" data-q="event">' + ic('events') + 'Додати подію</button><button type="button" data-q="announce">' + ic('bolt') + 'Змінити анонс</button><button type="button" data-go="messages">' + ic('mail') + 'Переглянути заявки</button></div>' +
      '<div class="card-head" style="margin:24px 0 12px"><h2>Журнал дій</h2></div><ul class="feed">' +
      (logs.length ? logs.map(function (l) { var d = new Date(l.t); return '<li><span>' + esc(l.text) + '</span><small>' + d.toLocaleDateString('uk-UA') + ' ' + d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) + '</small></li>'; }).join('') : '<li><span>Поки що жодних дій</span><small>—</small></li>') + '</ul></section></div>';
    $$('[data-go]', v).forEach(function (b) { b.addEventListener('click', function () { location.hash = '#/' + b.getAttribute('data-go'); }); });
    $$('[data-q]', v).forEach(function (b) {
      b.addEventListener('click', function () {
        var q = b.getAttribute('data-q');
        if (q === 'news') newsModal(); if (q === 'event') eventModal();
        if (q === 'announce') openModal('Анонс на сайті', fld('Текст анонсу (порожньо — приховати смугу)', 'announce', data.site.announce, { type: 'textarea', rows: 3 }), 'Зберегти', function (fd) { data.site.announce = fd.announce; commit('Оновлено анонс'); route(); });
      });
    });
  };
  function kpi(icon, c, val, label, trend, tcls) {
    return '<div class="card kpi" style="--c:' + c + '"><div class="k-ico">' + ic(icon) + '</div><span class="trend' + (tcls ? ' ' + tcls : '') + '">' + esc(trend) + '</span><b data-n="' + val + '">' + val + '</b><span>' + esc(label) + '</span></div>';
  }

  R.site = function (v) {
    var s = data.site, a = data.about;
    v.innerHTML = '<form class="card" id="siteForm"><div class="card-head"><div><h2>Загальні налаштування</h2><p>Назва, контакти і тексти головного екрана</p></div></div><div class="form-grid">' +
      fld('Назва сайту', 'site.name', s.name, { req: true }) + fld('Слоган', 'site.tagline', s.tagline) +
      fld('Заголовок героя', 'site.heroTitle', s.heroTitle, { help: 'Три слова виглядають найкраще: друге — контурне, останнє — лаймове' }) + fld('Анонс у верхній смузі', 'site.announce', s.announce, { help: 'Порожнє поле приховує смугу' }) +
      fld('Текст героя', 'site.heroText', s.heroText, { type: 'textarea', rows: 3, full: true }) +
      fld('Телефон', 'site.phone', s.phone) + fld('E-mail', 'site.email', s.email, { type: 'email' }) +
      fld('Адреса', 'site.address', s.address) + fld('Години роботи', 'site.hours', s.hours) +
      fld('Широта (для карти)', 'site.lat', s.lat, { type: 'number' }) + fld('Довгота (для карти)', 'site.lon', s.lon, { type: 'number' }) +
      '</div><div class="card-head" style="margin:28px 0 16px"><div><h2>Сторінка «Про нас»</h2><p>Абзаци розділяйте порожнім рядком</p></div></div><div class="form-grid">' +
      fld('Заголовок', 'about.title', a.title, { full: true }) + fld('Лід-абзац', 'about.lead', a.lead, { type: 'textarea', rows: 3, full: true }) + fld('Основний текст', 'about.text', a.text, { type: 'textarea', rows: 8, full: true }) +
      '</div><div class="save-bar"><a class="abtn abtn-ghost" href="index.html" target="_blank" rel="noopener">' + ic('eye') + 'Переглянути</a><button class="abtn abtn-lime" type="submit">' + ic('check') + 'Зберегти зміни</button></div></form>';
    $('#siteForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var nm = this.elements['site.name']; if (!nm.value.trim()) { nm.closest('.fld').classList.add('bad'); toast('Назва сайту не може бути порожньою', true); return; }
      $$('[name]', this).forEach(function (el) { setPath(data, el.name, el.type === 'number' ? parseFloat(el.value) || 0 : el.value.trim()); });
      commit('Збережено налаштування сайту');
    });
  };

  R.menu = function (v) {
    function draw() {
      v.innerHTML = '<section class="card"><div class="card-head"><div><h2>Пункти меню</h2><p>Порядок, назви і посилання головного меню та футера</p></div><button class="abtn sm" id="addMenu" type="button">' + ic('plus') + 'Додати пункт</button></div><div class="menu-rows">' +
        data.menu.map(function (m, i) {
          return '<div class="menu-row" data-i="' + i + '"><span class="num">' + (i + 1) + '</span><input value="' + esc(m.label) + '" data-k="label" aria-label="Назва пункту"><input value="' + esc(m.href) + '" data-k="href" aria-label="Посилання"><div class="acts"><button class="icon-btn" type="button" data-a="up" aria-label="Вище"' + (i ? '' : ' disabled') + '>' + ic('up') + '</button><button class="icon-btn" type="button" data-a="down" aria-label="Нижче">' + ic('down') + '</button><button class="icon-btn del" type="button" data-a="del" aria-label="Видалити">' + ic('trash') + '</button></div></div>';
        }).join('') + '</div><div class="save-bar"><button class="abtn abtn-lime" type="button" id="saveMenu">' + ic('check') + 'Зберегти меню</button></div></section>';
      $$('.menu-row input', v).forEach(function (inp) { inp.addEventListener('input', function () { data.menu[+inp.closest('.menu-row').getAttribute('data-i')][inp.getAttribute('data-k')] = inp.value; }); });
      $$('.menu-row [data-a]', v).forEach(function (b) {
        b.addEventListener('click', function () {
          var i = +b.closest('.menu-row').getAttribute('data-i'), a = b.getAttribute('data-a'), m = data.menu;
          if (a === 'up' && i > 0) { m.splice(i - 1, 0, m.splice(i, 1)[0]); }
          if (a === 'down' && i < m.length - 1) { m.splice(i + 1, 0, m.splice(i, 1)[0]); }
          if (a === 'del') { m.splice(i, 1); }
          draw();
        });
      });
      $('#addMenu').addEventListener('click', function () { data.menu.push({ label: 'Новий пункт', href: 'index.html' }); draw(); $$('.menu-row input', v).slice(-2)[0].select(); });
      $('#saveMenu').addEventListener('click', function () {
        if (data.menu.some(function (m) { return !m.label.trim() || !m.href.trim(); })) { toast('Кожен пункт має мати назву і посилання', true); return; }
        commit('Збережено меню (' + data.menu.length + ' пунктів)');
      });
    }
    draw();
  };

  R.slides = function (v) {
    function draw() {
      v.innerHTML = '<section class="card"><div class="card-head"><div><h2>Слайди головної сторінки</h2><p>Автоматична карусель зі стрілками й крапками</p></div><button class="abtn sm" id="addSlide" type="button">' + ic('plus') + 'Додати слайд</button></div>' +
        data.slides.map(function (s, i) {
          return '<div class="slide-ed" data-i="' + i + '"><div><img src="' + esc(s.img) + '" alt=""><select data-k="img" style="margin-top:8px;width:100%;padding:8px;border-radius:8px;border:1.5px solid var(--line)" aria-label="Зображення">' + IMAGES.map(function (im) { return '<option' + (im === s.img ? ' selected' : '') + '>' + im + '</option>'; }).join('') + '</select></div><div class="form-grid">' +
            fld('Надзаголовок', 'kicker', s.kicker) + fld('Заголовок', 'title', s.title) + fld('Текст', 'text', s.text, { type: 'textarea', rows: 2, full: true }) + fld('Кнопка', 'cta', s.cta) + fld('Посилання кнопки', 'href', s.href) +
            '<div class="full" style="display:flex;justify-content:flex-end"><button class="abtn abtn-danger sm" type="button" data-del>' + ic('trash') + 'Видалити слайд</button></div></div></div>';
        }).join('') + '<div class="save-bar"><button class="abtn abtn-lime" type="button" id="saveSlides">' + ic('check') + 'Зберегти слайдер</button></div></section>';
      $$('.slide-ed', v).forEach(function (ed) {
        var i = +ed.getAttribute('data-i');
        $$('input,textarea', ed).forEach(function (el) { el.addEventListener('input', function () { data.slides[i][el.name] = el.value; }); });
        $('select', ed).addEventListener('change', function () { data.slides[i].img = this.value; $('img', ed).src = this.value; });
        $('[data-del]', ed).addEventListener('click', function () { data.slides.splice(i, 1); draw(); });
      });
      $('#addSlide').addEventListener('click', function () { data.slides.push({ img: 'img/slide-1.svg', kicker: 'Новинка', title: 'Новий слайд', text: 'Короткий опис слайда.', cta: 'Детальніше', href: 'index.html' }); draw(); });
      $('#saveSlides').addEventListener('click', function () { commit('Збережено слайдер (' + data.slides.length + ' слайди)'); });
    }
    draw();
  };

  function newsModal(n) {
    var isNew = !n; n = n || { date: TODAY_ISO, cat: 'Клуб', img: 'img/gallery/n1.svg', title: '', excerpt: '', body: '' };
    var cats = []; data.news.forEach(function (x) { if (cats.indexOf(x.cat) < 0) cats.push(x.cat); });
    openModal(isNew ? 'Нова новина' : 'Редагування новини', '<div class="form-grid">' +
      fld('Заголовок', 'title', n.title, { req: true, full: true }) + fld('Дата', 'date', n.date, { type: 'date', req: true }) + fld('Рубрика', 'cat', n.cat, { list: 'catList', req: true }) +
      '<datalist id="catList">' + cats.map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist>' +
      imgPick('img', n.img) + fld('Короткий опис', 'excerpt', n.excerpt, { type: 'textarea', rows: 2, full: true, req: true }) + fld('Текст новини', 'body', n.body, { type: 'textarea', rows: 8, full: true, req: true, help: 'Абзаци розділяйте порожнім рядком' }) + '</div>',
      isNew ? 'Опублікувати' : 'Зберегти', function (fd) {
        if (isNew) { fd.id = slug(fd.title); data.news.unshift(fd); commit('Додано новину «' + fd.title + '»'); }
        else { Object.assign(n, fd); commit('Оновлено новину «' + fd.title + '»'); }
        if (/news/.test(location.hash)) R.news($('#view'), isNew ? fd.id : null); else route();
      });
  }
  R.news = function (v, hl) {
    var q = '';
    function draw() {
      var list = data.news.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).filter(function (n) { return !q || (n.title + n.cat).toLowerCase().indexOf(q) >= 0; });
      $('#newsBody').innerHTML = list.map(function (n) {
        return '<tr data-id="' + esc(n.id) + '"' + (n.id === hl ? ' class="new-row"' : '') + '><td><img class="thumb" src="' + esc(n.img) + '" alt=""></td><td class="t-title">' + esc(n.title) + '<span class="t-sub">' + esc(n.excerpt) + '</span></td><td><span class="pill" style="--c:#86b800">' + esc(n.cat) + '</span></td><td style="white-space:nowrap">' + fmt(n.date) + '</td><td><div class="acts"><a class="icon-btn" href="news.html?id=' + encodeURIComponent(n.id) + '" target="_blank" rel="noopener" aria-label="Переглянути">' + ic('eye') + '</a><button class="icon-btn" type="button" data-a="edit" aria-label="Редагувати">' + ic('edit') + '</button><button class="icon-btn del" type="button" data-a="del" aria-label="Видалити">' + ic('trash') + '</button></div></td></tr>';
      }).join('') || '<tr><td colspan="5" class="empty-state">Нічого не знайдено</td></tr>';
      $$('#newsBody [data-a]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.closest('tr').getAttribute('data-id'), n = data.news.filter(function (x) { return x.id === id; })[0];
          if (b.getAttribute('data-a') === 'edit') newsModal(n);
          else confirmBox('Видалити новину «' + n.title + '»? Цю дію не можна скасувати.', function () { data.news = data.news.filter(function (x) { return x.id !== id; }); commit('Видалено новину'); draw(); });
        });
      });
    }
    v.innerHTML = '<section class="card"><div class="card-head"><div><h2>Новини</h2><p>' + data.news.length + ' записів · показуються на головній і на сторінці «Новини»</p></div><div class="toolbar"><label class="search">' + ic('search') + '<input type="search" id="nq" placeholder="Пошук…" aria-label="Пошук новин"></label><button class="abtn abtn-lime sm" type="button" id="addNews">' + ic('plus') + 'Додати новину</button></div></div>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Заголовок</th><th>Рубрика</th><th>Дата</th><th style="text-align:right">Дії</th></tr></thead><tbody id="newsBody"></tbody></table></div></section>';
    $('#nq').addEventListener('input', function () { q = this.value.trim().toLowerCase(); draw(); });
    $('#addNews').addEventListener('click', function () { newsModal(); });
    draw();
  };

  function eventModal(e) {
    var isNew = !e; e = e || { date: TODAY_ISO, time: '19:00', type: 'Тренування', title: '', place: '', text: '' };
    openModal(isNew ? 'Нова подія' : 'Редагування події', '<div class="form-grid">' +
      fld('Назва події', 'title', e.title, { req: true, full: true }) + fld('Дата', 'date', e.date, { type: 'date', req: true }) + fld('Час', 'time', e.time, { type: 'time', req: true }) +
      fld('Тип', 'type', e.type, { type: 'select', options: TYPES }) + fld('Місце', 'place', e.place, { req: true, ph: 'Наприклад: Боулдерна зона' }) + fld('Опис', 'text', e.text, { type: 'textarea', rows: 3, full: true }) + '</div>',
      isNew ? 'Додати в календар' : 'Зберегти', function (fd) {
        if (isNew) { fd.id = 'e' + Date.now().toString(36); data.events.push(fd); commit('Додано подію «' + fd.title + '»'); }
        else { Object.assign(e, fd); commit('Оновлено подію «' + fd.title + '»'); }
        if (/events/.test(location.hash)) R.events($('#view')); else route();
      });
  }
  R.events = function (v) {
    var past = false;
    function draw() {
      var list = data.events.slice().sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); }).filter(function (e) { return past || e.date >= TODAY_ISO; });
      $('#evBody').innerHTML = list.map(function (e) {
        return '<tr data-id="' + esc(e.id) + '"><td style="white-space:nowrap"><b>' + fmt(e.date) + '</b><span class="t-sub">' + esc(e.time) + '</span></td><td class="t-title">' + esc(e.title) + '<span class="t-sub">' + esc(e.text) + '</span></td><td><span class="pill" style="--c:' + (TYPE_C[e.type] || '#ff3d7f') + '">' + esc(e.type) + '</span></td><td>' + esc(e.place) + '</td><td><div class="acts"><button class="icon-btn" type="button" data-a="edit" aria-label="Редагувати">' + ic('edit') + '</button><button class="icon-btn del" type="button" data-a="del" aria-label="Видалити">' + ic('trash') + '</button></div></td></tr>';
      }).join('') || '<tr><td colspan="5" class="empty-state">Подій немає</td></tr>';
      $$('#evBody [data-a]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.closest('tr').getAttribute('data-id'), e = data.events.filter(function (x) { return x.id === id; })[0];
          if (b.getAttribute('data-a') === 'edit') eventModal(e);
          else confirmBox('Видалити подію «' + e.title + '» з календаря?', function () { data.events = data.events.filter(function (x) { return x.id !== id; }); commit('Видалено подію'); draw(); });
        });
      });
    }
    v.innerHTML = '<section class="card"><div class="card-head"><div><h2>Календар подій</h2><p>Події відображаються в інтерактивному календарі на сторінці «Розклад і змагання»</p></div><div class="toolbar"><label class="fld" style="display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:700"><input type="checkbox" id="past" style="width:auto"> Показати минулі</label><button class="abtn abtn-lime sm" type="button" id="addEv">' + ic('plus') + 'Додати подію</button></div></div>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Дата</th><th>Подія</th><th>Тип</th><th>Місце</th><th style="text-align:right">Дії</th></tr></thead><tbody id="evBody"></tbody></table></div></section>';
    $('#past').addEventListener('change', function () { past = this.checked; draw(); });
    $('#addEv').addEventListener('click', function () { eventModal(); });
    draw();
  };

  R.services = function (v) {
    v.innerHTML = '<form id="svcForm"><section class="card"><div class="card-head"><div><h2>Послуги</h2><p>Картки на головній і на сторінці «Тренування»</p></div></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Назва</th><th>Ціна</th><th>Одиниця</th><th>Опис</th></tr></thead><tbody>' +
      data.services.map(function (s, i) {
        return '<tr><td><input class="cell" data-p="services.' + i + '.title" value="' + esc(s.title) + '" aria-label="Назва"></td><td><input class="cell" data-p="services.' + i + '.price" value="' + esc(s.price) + '" style="width:110px" aria-label="Ціна"></td><td><input class="cell" data-p="services.' + i + '.unit" value="' + esc(s.unit) + '" style="width:150px" aria-label="Одиниця"></td><td><input class="cell" data-p="services.' + i + '.text" value="' + esc(s.text) + '" style="min-width:320px" aria-label="Опис"></td></tr>';
      }).join('') + '</tbody></table></div></section>' +
      '<section class="card" style="margin-top:20px"><div class="card-head"><div><h2>Абонементи</h2><p>Кожна перевага — з нового рядка</p></div></div><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">' +
      data.passes.map(function (p, i) {
        return '<div class="card" style="background:#fafbf9;display:grid;gap:12px">' + fld('Назва', 'passes.' + i + '.name', p.name) + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' + fld('Ціна, ₴', 'passes.' + i + '.price', p.price, { type: 'number' }) + fld('Період', 'passes.' + i + '.period', p.period) + '</div>' +
          fld('Переваги', 'passes.' + i + '.features', (p.features || []).join('\n'), { type: 'textarea', rows: 4 }) + '<label style="display:flex;gap:8px;align-items:center;font-weight:700;font-size:13.5px"><input type="checkbox" name="passes.' + i + '.hot"' + (p.hot ? ' checked' : '') + '> Позначка «Найпопулярніший»</label></div>';
      }).join('') + '</div><div class="save-bar"><button class="abtn abtn-lime" type="submit">' + ic('check') + 'Зберегти ціни</button></div></section></form>';
    $$('.cell', v).forEach(function (c) { c.style.cssText += ';border:1.5px solid var(--line);border-radius:7px;padding:7px 9px;width:' + (c.style.width || '100%'); });
    $('#svcForm').addEventListener('submit', function (e) {
      e.preventDefault();
      $$('.cell', this).forEach(function (c) { setPath(data, c.getAttribute('data-p'), c.value.trim()); });
      $$('[name]', this).forEach(function (el) {
        var val = el.type === 'checkbox' ? el.checked : el.type === 'number' ? (parseFloat(el.value) || 0) : el.value;
        if (/features$/.test(el.name)) val = el.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
        setPath(data, el.name, val);
      });
      commit('Збережено послуги й абонементи');
    });
  };

  R.gallery = function (v) {
    function draw() {
      v.innerHTML = '<section class="card"><div class="card-head"><div><h2>Галерея</h2><p>' + data.gallery.length + ' фото · галерея з лайтбоксом на головній і «Про нас»</p></div><button class="abtn abtn-lime sm" type="button" id="addImg">' + ic('plus') + 'Додати фото</button></div><div class="gal-grid">' +
        data.gallery.map(function (g, i) { return '<div class="gal-it" data-i="' + i + '"><img src="' + esc(g.img) + '" alt=""><div class="gi-b"><input value="' + esc(g.title) + '" aria-label="Підпис"><button class="icon-btn del" type="button" aria-label="Видалити">' + ic('trash') + '</button></div></div>'; }).join('') +
        '</div><div class="save-bar"><button class="abtn abtn-lime" type="button" id="saveGal">' + ic('check') + 'Зберегти підписи</button></div></section>';
      $$('.gal-it', v).forEach(function (it) {
        var i = +it.getAttribute('data-i');
        $('input', it).addEventListener('input', function () { data.gallery[i].title = this.value; });
        $('.del', it).addEventListener('click', function () { confirmBox('Прибрати фото «' + data.gallery[i].title + '» з галереї?', function () { data.gallery.splice(i, 1); commit('Видалено фото з галереї'); draw(); }); });
      });
      $('#saveGal').addEventListener('click', function () { commit('Збережено підписи галереї'); });
      $('#addImg').addEventListener('click', function () {
        openModal('Нове фото', '<div class="form-grid">' + imgPick('img', IMAGES[3]) + fld('Підпис', 'title', '', { req: true, full: true }) + '</div>', 'Додати', function (fd) { data.gallery.push({ img: fd.img, title: fd.title }); commit('Додано фото до галереї'); draw(); });
      });
    }
    draw();
  };

  R.messages = function (v) {
    function draw() {
      var list = CMS.messages();
      v.innerHTML = '<section class="card"><div class="card-head"><div><h2>Заявки з форми зворотного зв’язку</h2><p>Надходять зі сторінки «Контакти» · ' + list.length + ' всього, ' + newMsgs() + ' нових</p></div>' + (list.length ? '<button class="abtn abtn-ghost sm" type="button" id="readAll">' + ic('check') + 'Позначити всі прочитаними</button>' : '') + '</div>' +
        (list.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Дата</th><th>Від кого</th><th>Тема і повідомлення</th><th style="text-align:right">Дії</th></tr></thead><tbody>' +
          list.map(function (m) {
            var d = new Date(m.date);
            return '<tr data-id="' + m.id + '"><td style="white-space:nowrap">' + (m.read ? '' : '<span class="dot-new" title="Нова"></span>') + d.toLocaleDateString('uk-UA') + '<span class="t-sub">' + d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) + '</span></td><td class="t-title">' + esc(m.name) + '<span class="t-sub">' + esc(m.phone) + (m.email ? ' · ' + esc(m.email) : '') + '</span></td><td><span class="pill" style="--c:#ff6b1a">' + esc(m.topic) + '</span><div class="msg-body">' + esc(m.message) + '</div></td><td><div class="acts">' + (m.read ? '' : '<button class="icon-btn" type="button" data-a="read" aria-label="Прочитано">' + ic('check') + '</button>') + '<button class="icon-btn del" type="button" data-a="del" aria-label="Видалити">' + ic('trash') + '</button></div></td></tr>';
          }).join('') + '</tbody></table></div>'
          : '<div class="empty-state">' + ic('mail') + '<p>Заявок поки немає. Надішліть тестову заявку з форми на сторінці <a href="contacts.html#form" target="_blank" rel="noopener" style="color:var(--orange);font-weight:700">«Контакти»</a>.</p></div>') + '</section>';
      $$('[data-a]', v).forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.closest('tr').getAttribute('data-id'), l = CMS.messages();
          if (b.getAttribute('data-a') === 'read') { l.forEach(function (m) { if (m.id === id) m.read = true; }); CMS.setMessages(l); toast('Заявку позначено прочитаною'); updateSide(); draw(); }
          else confirmBox('Видалити цю заявку?', function () { CMS.setMessages(l.filter(function (m) { return m.id !== id; })); CMS.log('Видалено заявку'); toast('Заявку видалено'); updateSide(); draw(); });
        });
      });
      var ra = $('#readAll'); if (ra) ra.addEventListener('click', function () { var l = CMS.messages(); l.forEach(function (m) { m.read = true; }); CMS.setMessages(l); toast('Усі заявки прочитано'); updateSide(); draw(); });
    }
    draw();
  };

  R.backup = function (v) {
    v.innerHTML = '<div class="grid g2e"><section class="card"><div class="card-head"><div><h2>Експорт</h2><p>Збережіть увесь контент сайту у файл JSON</p></div></div><button class="abtn abtn-lime" type="button" id="exp">' + ic('backup') + 'Завантажити content.json</button>' +
      '<div class="card-head" style="margin:26px 0 12px"><div><h2>Імпорт</h2><p>Вставте JSON, експортований раніше</p></div></div><textarea class="code" id="impTxt" placeholder="{ &quot;site&quot;: { … } }"></textarea><div class="save-bar"><button class="abtn" type="button" id="imp">Імпортувати</button></div></section>' +
      '<section class="card danger-zone"><div class="card-head"><div><h2>Скидання</h2><p>Повернути стандартний контент із js/content.js. Усі зміни, внесені в панелі, буде втрачено.</p></div></div><p style="margin:0 0 18px;color:var(--ink2)">Поточний стан: <b>' + (CMS.isCustom() ? 'контент змінено в адмінці' : 'стандартний контент') + '</b></p><button class="abtn abtn-danger" type="button" id="rst">' + ic('trash') + 'Скинути до стандартного</button></section></div>';
    $('#exp').addEventListener('click', function () {
      try {
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'vertykal-content.json'; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000); toast('Файл експорту створено');
      } catch (e) { toast('Експорт не вдався', true); }
    });
    $('#imp').addEventListener('click', function () {
      try { var o = JSON.parse($('#impTxt').value); if (!o || !o.site || !o.menu) throw 0; data = CMS.get(); Object.keys(o).forEach(function (k) { data[k] = o[k]; }); commit('Імпортовано контент'); }
      catch (e) { toast('Некоректний JSON — перевірте вміст', true); }
    });
    $('#rst').addEventListener('click', function () { confirmBox('Скинути весь контент до стандартного? Зміни буде втрачено.', function () { CMS.reset(); data = CMS.get(); toast('Контент скинуто до стандартного'); updateSide(); route(); }); });
  };

  /* ---------- старт ---------- */
  if (loggedIn()) showApp(); else loginArt();
})();
