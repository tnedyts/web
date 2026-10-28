/* «Смерекова Хата» — адмін-панель CMS */
(function () {
  var html = document.documentElement, SHOT = html.classList.contains('shot');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var E = CMS.esc, C = CMS.load();
  var TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  var MON = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];
  var STATUSES = ['Нове', 'Підтверджено', 'Заселено', 'Скасовано'];
  var SESSION = 'smerekova_admin_session';

  /* ---------- тости ---------- */
  function toast(msg, type) {
    var t = document.createElement('div'); t.className = 'toast ' + (type || 'ok');
    t.innerHTML = '<i>' + (type === 'err' ? '!' : type === 'info' ? 'i' : '✓') + '</i><span>' + E(msg) + '</span>';
    $('#toasts').appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 400); }, 3200);
  }
  function save(msg) {
    if (CMS.save(C)) toast(msg || 'Збережено — зміни вже на сайті');
    else toast('Не вдалося зберегти: localStorage недоступний', 'err');
    paintBrand(); badges();
  }

  /* ---------- вхід ---------- */
  function getSess() { try { return sessionStorage.getItem(SESSION) === '1'; } catch (e) { return false; } }
  function setSess(v) { try { if (v) sessionStorage.setItem(SESSION, '1'); else sessionStorage.removeItem(SESSION); } catch (e) { } }
  var q = new URLSearchParams(location.search);
  function enter() { $('#login').hidden = true; $('#app').hidden = false; route(); }
  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, u = f.user.value.trim(), p = f.pass.value;
    if (u === 'admin' && p === 'admin123') { setSess(true); $('#login').classList.add('out'); setTimeout(enter, SHOT ? 0 : 450); toast('Вітаємо в панелі керування!'); }
    else { $('#loginErr').textContent = 'Невірний логін або пароль. Підказка нижче 👇'; f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); }
  });
  $('#logout').addEventListener('click', function () { setSess(false); location.hash = ''; location.reload(); });

  /* ---------- навігація ---------- */
  var ICO = {
    dash: '<path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-4H4zM14 4v4h6V4z"/>',
    book: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8 14h3"/>',
    room: '<path d="M3 20V9l9-6 9 6v11z"/><path d="M9 20v-6h6v6"/>',
    news: '<path d="M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2"/><path d="M8 9h5M8 13h5"/>',
    event: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
    text: '<path d="M4 6h16M4 12h10M4 18h14"/>',
    slide: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M10 9l4 2-4 2z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    mail: '<path d="M3 6h18v12H3z"/><path d="M3 6l9 7 9-7"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>'
  };
  function ico(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICO[k] + '</svg>'; }
  var VIEWS = [
    ['dashboard', 'Дашборд', 'dash', 'Огляд'],
    ['bookings', 'Бронювання', 'book', 'Готель'],
    ['rooms', 'Номери і ціни', 'room', 'Готель'],
    ['news', 'Новини', 'news', 'Контент'],
    ['events', 'Події календаря', 'event', 'Контент'],
    ['texts', 'Тексти сторінок', 'text', 'Контент'],
    ['slides', 'Слайдер', 'slide', 'Контент'],
    ['menu', 'Меню сайту', 'menu', 'Контент'],
    ['messages', 'Повідомлення', 'mail', 'Звернення'],
    ['settings', 'Налаштування', 'gear', 'Система']
  ];
  var grp = '';
  $('#sNav').innerHTML = VIEWS.map(function (v) {
    var h = v[3] !== grp ? '<span class="s-grp">' + v[3] + '</span>' : ''; grp = v[3];
    return h + '<a href="#' + v[0] + '" data-v="' + v[0] + '">' + ico(v[2]) + '<span>' + v[1] + '</span><em class="bdg" data-b="' + v[0] + '"></em></a>';
  }).join('');
  function badges() {
    var nb = C.bookings.filter(function (b) { return b.status === 'Нове'; }).length;
    $$('.bdg').forEach(function (b) { var k = b.getAttribute('data-b'), n = k === 'bookings' ? nb : k === 'messages' ? C.messages.length : 0; b.textContent = n || ''; b.classList.toggle('on', !!n); });
  }
  function paintBrand() { $('#sName').textContent = C.site.name; $('#fName').textContent = C.site.name; document.title = 'Панель керування — ' + C.site.name; }
  var side = $('#side');
  $('#tBurger').addEventListener('click', function () { side.classList.toggle('open'); });
  window.addEventListener('hashchange', route);
  var current = null;
  function route() {
    var v = (location.hash || '#dashboard').slice(1); if (!R[v]) v = 'dashboard';
    current = v; var meta = VIEWS.filter(function (x) { return x[0] === v; })[0];
    $$('#sNav a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-v') === v); });
    $('#tTitle').textContent = meta[1]; $('#tCrumb').textContent = 'Панель / ' + meta[3];
    $('#tSearch').value = ''; side.classList.remove('open');
    var box = $('#views'); box.classList.remove('enter'); void box.offsetWidth; box.classList.add('enter');
    box.innerHTML = ''; var view = document.createElement('div'); view.className = 'view v-' + v; box.appendChild(view); R[v](view); badges(); paintBrand();
  }
  $('#tSearch').addEventListener('input', function () {
    var t = this.value.trim().toLowerCase();
    $$('#views [data-row]').forEach(function (r) { r.style.display = !t || r.textContent.toLowerCase().indexOf(t) > -1 ? '' : 'none'; });
  });

  /* ---------- модальне вікно ---------- */
  var modal = $('#modal'), mForm = $('#mForm'), mSubmit = null;
  function field(f) {
    var v = f.value == null ? '' : f.value, id = 'm-' + f.name;
    var inp = f.type === 'textarea' ? '<textarea id="' + id + '" name="' + f.name + '" rows="' + (f.rows || 4) + '">' + E(v) + '</textarea>'
      : f.type === 'select' ? '<select id="' + id + '" name="' + f.name + '">' + f.options.map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + E(o) + '</option>'; }).join('') + '</select>'
        : '<input id="' + id + '" name="' + f.name + '" type="' + (f.type || 'text') + '" value="' + E(v) + '"' + (f.min != null ? ' min="' + f.min + '"' : '') + '>';
    return '<label class="fld' + (f.half ? ' half' : '') + '" for="' + id + '"><span>' + f.label + (f.req ? ' *' : '') + '</span>' + inp + '<em class="ferr"></em></label>';
  }
  function openModal(title, fields, onSubmit) {
    $('#mTitle').textContent = title;
    mForm.innerHTML = '<div class="fgrid">' + fields.map(field).join('') + '</div><div class="m-actions"><button type="button" class="abtn abtn-ghost m-cancel">Скасувати</button><button class="abtn abtn-gold" type="submit">Зберегти</button></div>';
    mForm._fields = fields; mSubmit = onSubmit; modal.classList.add('open');
    setTimeout(function () { var i = mForm.querySelector('input,textarea'); if (i && !SHOT) i.focus(); }, 100);
  }
  function closeModal() { modal.classList.remove('open'); }
  modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('.m-x') || e.target.closest('.m-cancel')) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  mForm.addEventListener('submit', function (e) {
    e.preventDefault(); var ok = true, data = {};
    mForm._fields.forEach(function (f) {
      var el = mForm.elements[f.name], v = el.value.trim(), err = f.req && !v ? 'Обов’язкове поле' : f.type === 'number' && v !== '' && (isNaN(+v) || +v < (f.min || 0)) ? 'Некоректне число' : '';
      el.closest('.fld').classList.toggle('bad', !!err); el.closest('.fld').querySelector('.ferr').textContent = err; if (err) ok = false;
      data[f.name] = f.type === 'number' ? +v : v;
    });
    if (!ok) { mForm.classList.remove('shake'); void mForm.offsetWidth; mForm.classList.add('shake'); return; }
    mSubmit(data); closeModal();
  });
  function confirmBox(text, onYes) {
    $('#mTitle').textContent = 'Підтвердження';
    mForm.innerHTML = '<p class="m-text">' + E(text) + '</p><div class="m-actions"><button type="button" class="abtn abtn-ghost m-cancel">Ні, залишити</button><button class="abtn abtn-red" type="submit">Так, видалити</button></div>';
    mForm._fields = []; mSubmit = onYes; modal.classList.add('open');
  }

  /* ---------- допоміжні ---------- */
  function roomName(id) { var r = C.rooms.filter(function (x) { return x.id === id; })[0]; return r ? r.name : id; }
  function stCls(s) { return { 'Нове': 'new', 'Підтверджено': 'ok', 'Заселено': 'in', 'Скасовано': 'no' }[s] || 'new'; }
  function card(title, body, extra) { return '<section class="card' + (extra ? ' ' + extra : '') + '">' + (title ? '<header class="c-h"><h3>' + title + '</h3></header>' : '') + body + '</section>'; }
  function empty(t) { return '<div class="empty">' + ico('text') + '<p>' + t + '</p></div>'; }
  function countUp(root) {
    $$('[data-count]', root).forEach(function (el) {
      var end = +el.getAttribute('data-count'), suf = el.getAttribute('data-suf') || '', fmt = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + suf; };
      if (SHOT) { el.textContent = fmt(end); return; }
      var t0 = performance.now(); (function f(t) { var k = Math.min(1, (t - t0) / 1200); el.textContent = fmt(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
    });
  }

  /* ================= ПРЕДСТАВЛЕННЯ ================= */
  var R = {};

  R.dashboard = function (box) {
    var B = C.bookings, active = B.filter(function (b) { return b.status !== 'Скасовано'; });
    var revenue = active.reduce(function (s, b) { return s + b.total; }, 0);
    var nNew = B.filter(function (b) { return b.status === 'Нове'; }).length;
    /* завантаженість на найближчі 30 днів */
    var rooms = C.rooms.filter(function (r) { return r.active; }), busy = 0, end = new Date(TODAY.getTime() + 30 * 864e5);
    active.forEach(function (b) { for (var d = new Date(b.from); d < new Date(b.to); d.setDate(d.getDate() + 1)) if (d >= TODAY && d < end) busy++; });
    var occ = rooms.length ? Math.min(100, Math.round(busy / (rooms.length * 30) * 100)) : 0;
    var kpi = [
      ['book', 'Бронювань', B.length, '', nNew + ' нових', 'g'],
      ['dash', 'Дохід (без скасованих)', revenue, ' грн', 'середній чек ' + CMS.money(active.length ? revenue / active.length : 0), 'gold'],
      ['room', 'Завантаженість, 30 днів', occ, '%', rooms.length + ' активних номерів', 'wood'],
      ['mail', 'Повідомлення', C.messages.length, '', C.news.length + ' новин · ' + C.events.length + ' подій', 'berry']
    ];
    var h = '<div class="kpis">' + kpi.map(function (k, i) { return '<div class="kpi k-' + k[5] + '" style="--i:' + i + '"><span class="k-ico">' + ico(k[0]) + '</span><small>' + k[1] + '</small><b data-count="' + k[2] + '" data-suf="' + k[3] + '">0</b><em>' + k[4] + '</em></div>'; }).join('') + '</div>';
    /* дохід за місяцями заїзду: останні 6 місяців + 3 майбутні */
    var months = []; for (var i = -5; i <= 3; i++) { var d = new Date(TODAY.getFullYear(), TODAY.getMonth() + i, 1); months.push({ k: iso(d).slice(0, 7), l: MON[d.getMonth()], v: 0, f: i > 0 }); }
    active.forEach(function (b) { months.forEach(function (m) { if (b.from.slice(0, 7) === m.k) m.v += b.total; }); });
    var max = Math.max.apply(null, months.map(function (m) { return m.v; }).concat([10000])), W = 640, H = 240, bw = W / months.length;
    var svg = '<svg class="chart" viewBox="0 0 ' + W + ' ' + (H + 40) + '" role="img" aria-label="Дохід за місяцями">';
    for (var g = 0; g <= 4; g++) { var y = 10 + (H - 10) * g / 4; svg += '<line x1="0" x2="' + W + '" y1="' + y + '" y2="' + y + '" class="gl"/><text x="0" y="' + (y - 4) + '" class="gt">' + Math.round(max * (1 - g / 4) / 1000) + 'k</text>'; }
    months.forEach(function (m, i) {
      var bh = Math.max(3, (H - 10) * m.v / max), x = i * bw + bw * .25;
      svg += '<g class="bar' + (m.f ? ' fut' : '') + '" style="--i:' + i + '"><rect x="' + x.toFixed(1) + '" y="' + (H - bh).toFixed(1) + '" width="' + (bw * .5).toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="6"><title>' + m.l + ': ' + CMS.money(m.v) + '</title></rect>' + (m.v ? '<text x="' + (x + bw * .25).toFixed(1) + '" y="' + (H - bh - 8).toFixed(1) + '" class="bv">' + Math.round(m.v / 1000) + 'k</text>' : '') + '<text x="' + (x + bw * .25).toFixed(1) + '" y="' + (H + 26) + '" class="bl">' + m.l + '</text></g>';
    });
    svg += '</svg>';
    /* статуси — кільце */
    var st = STATUSES.map(function (s) { return [s, B.filter(function (b) { return b.status === s; }).length]; }), tot = B.length || 1, acc = 0, CIRC = 2 * Math.PI * 70;
    var colors = { 'Нове': '#c9a46a', 'Підтверджено': '#1d5a45', 'Заселено': '#5b8fb0', 'Скасовано': '#b8322a' };
    var donut = '<svg class="donut" viewBox="0 0 200 200" role="img" aria-label="Статуси бронювань"><circle cx="100" cy="100" r="70" class="d-bg"/>';
    st.forEach(function (s) { if (!s[1]) return; var len = CIRC * s[1] / tot; donut += '<circle cx="100" cy="100" r="70" class="d-seg" stroke="' + colors[s[0]] + '" stroke-dasharray="' + len.toFixed(1) + ' ' + (CIRC - len).toFixed(1) + '" stroke-dashoffset="' + (-acc).toFixed(1) + '"/>'; acc += len; });
    donut += '<text x="100" y="98" class="d-n">' + B.length + '</text><text x="100" y="122" class="d-l">бронювань</text></svg>';
    var legend = '<ul class="legend">' + st.map(function (s) { return '<li><i style="background:' + colors[s[0]] + '"></i>' + s[0] + '<b>' + s[1] + '</b></li>'; }).join('') + '</ul>';
    h += '<div class="g2">' + card('Дохід за місяцем заїзду', '<div class="c-b">' + svg + '<p class="note"><i class="sw"></i> отримано <i class="sw fut"></i> майбутні заїзди</p></div>', 'span2') + card('Статуси', '<div class="c-b donut-wrap">' + donut + legend + '</div>') + '</div>';
    /* останні бронювання + події */
    var recent = B.slice().sort(function (a, b) { return b.created.localeCompare(a.created); }).slice(0, 5);
    var tbl = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Гість</th><th>Номер</th><th>Дати</th><th>Сума</th><th>Статус</th></tr></thead><tbody>' + recent.map(function (b) {
      return '<tr data-row><td><b>' + E(b.name) + '</b><small>' + E(b.phone) + '</small></td><td>' + E(roomName(b.room)) + '</td><td>' + CMS.fmtDate(b.from, true) + ' — ' + CMS.fmtDate(b.to, true) + '</td><td class="num">' + CMS.money(b.total) + '</td><td><span class="pill ' + stCls(b.status) + '">' + E(b.status) + '</span></td></tr>';
    }).join('') + '</tbody></table></div>';
    var up = C.events.filter(function (e) { return e.date >= iso(TODAY); }).sort(function (a, b) { return a.date.localeCompare(b.date); }).slice(0, 4);
    var evl = '<ul class="mini-ev">' + up.map(function (e) { return '<li><span><b>' + +e.date.slice(8) + '</b>' + MON[+e.date.slice(5, 7) - 1] + '</span><div><b>' + E(e.title) + '</b><small>' + E(e.time) + '</small></div></li>'; }).join('') + '</ul>' + (up.length ? '' : empty('Майбутніх подій немає'));
    h += '<div class="g2">' + card('Останні бронювання <a href="#bookings" class="c-link">Усі →</a>', tbl, 'span2') + card('Найближчі події <a href="#events" class="c-link">Усі →</a>', '<div class="c-b">' + evl + '</div>') + '</div>';
    h += '<div class="quick-acts"><a href="#news" data-act="news">' + ico('news') + 'Додати новину</a><a href="#events" data-act="event">' + ico('event') + 'Нова подія</a><a href="#texts">' + ico('text') + 'Редагувати тексти</a><a href="index.html" target="_blank" rel="noopener">' + ico('room') + 'Переглянути сайт</a></div>';
    box.innerHTML = h; countUp(box);
    $$('.quick-acts [data-act]', box).forEach(function (a) { a.addEventListener('click', function () { var k = a.getAttribute('data-act'); setTimeout(function () { (k === 'news' ? editNews : editEvent)(null); }, 60); }); });
  };

  R.bookings = function (box) {
    var filter = 'Усі';
    function draw() {
      var list = C.bookings.slice().sort(function (a, b) { return b.created.localeCompare(a.created); }).filter(function (b) { return filter === 'Усі' || b.status === filter; });
      box.innerHTML = '<div class="toolbar"><div class="chips">' + ['Усі'].concat(STATUSES).map(function (s) { var n = s === 'Усі' ? C.bookings.length : C.bookings.filter(function (b) { return b.status === s; }).length; return '<button class="chip' + (s === filter ? ' on' : '') + '" data-f="' + s + '">' + s + ' <i>' + n + '</i></button>'; }).join('') + '</div><button class="abtn abtn-gold" id="addB">+ Бронювання</button></div>' +
        card('', '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Створено</th><th>Гість</th><th>Номер</th><th>Заїзд — виїзд</th><th>Ночей</th><th>Гостей</th><th>Сума</th><th>Статус</th><th></th></tr></thead><tbody>' + (list.map(function (b) {
          return '<tr data-row data-id="' + b.id + '"><td class="muted">' + CMS.fmtDate(b.created, true) + '</td><td><b>' + E(b.name) + '</b><small>' + E(b.phone) + (b.note ? ' · ' + E(b.note) : '') + '</small></td><td>' + E(roomName(b.room)) + '</td><td>' + CMS.fmtDate(b.from, true) + ' — ' + CMS.fmtDate(b.to) + '</td><td class="num">' + CMS.nights(b.from, b.to) + '</td><td class="num">' + b.guests + '</td><td class="num"><b>' + CMS.money(b.total) + '</b></td><td><select class="st-sel ' + stCls(b.status) + '" aria-label="Статус">' + STATUSES.map(function (s) { return '<option' + (s === b.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></td><td class="acts"><button class="ib del" title="Видалити" aria-label="Видалити">✕</button></td></tr>';
        }).join('') || '<tr><td colspan="9">' + empty('Бронювань із таким статусом немає') + '</td></tr>') + '</tbody></table></div>');
    }
    box.addEventListener('click', function (e) {
      var c = e.target.closest('[data-f]'); if (c) { filter = c.getAttribute('data-f'); draw(); return; }
      if (e.target.closest('#addB')) { addBooking(); return; }
      var d = e.target.closest('.del'); if (d) { var id = d.closest('tr').getAttribute('data-id'), b = C.bookings.filter(function (x) { return x.id === id; })[0]; confirmBox('Видалити бронювання гостя «' + b.name + '»?', function () { C.bookings = C.bookings.filter(function (x) { return x.id !== id; }); save('Бронювання видалено'); draw(); }); }
    });
    box.addEventListener('change', function (e) {
      var s = e.target.closest('.st-sel'); if (!s) return; var id = s.closest('tr').getAttribute('data-id');
      C.bookings.forEach(function (b) { if (b.id === id) b.status = s.value; }); s.className = 'st-sel ' + stCls(s.value); save('Статус змінено на «' + s.value + '»');
    });
    function addBooking() {
      var d1 = iso(new Date(TODAY.getTime() + 7 * 864e5)), d2 = iso(new Date(TODAY.getTime() + 9 * 864e5));
      openModal('Нове бронювання', [
        { name: 'name', label: 'Гість', req: true }, { name: 'phone', label: 'Телефон', req: true, half: true }, { name: 'room', label: 'Номер', type: 'select', options: C.rooms.map(function (r) { return r.name; }), half: true },
        { name: 'from', label: 'Заїзд', type: 'date', value: d1, req: true, half: true }, { name: 'to', label: 'Виїзд', type: 'date', value: d2, req: true, half: true },
        { name: 'guests', label: 'Гостей', type: 'number', value: 2, min: 1, half: true }, { name: 'status', label: 'Статус', type: 'select', options: STATUSES, value: 'Підтверджено', half: true }
      ], function (v) {
        var r = C.rooms.filter(function (x) { return x.name === v.room; })[0], n = Math.max(1, CMS.nights(v.from, v.to));
        C.bookings.unshift({ id: CMS.uid('b'), created: iso(TODAY), name: v.name, phone: v.phone, room: r.id, from: v.from, to: v.to, guests: v.guests || 1, total: n * r.price, status: v.status });
        save('Бронювання додано'); draw();
      });
    }
    draw();
  };

  R.rooms = function (box) {
    function draw() {
      box.innerHTML = '<div class="toolbar"><p class="muted">Ціни та видимість номерів одразу оновлюються на сторінці «Номери» та у формі бронювання.</p><button class="abtn abtn-gold" id="addR">+ Номер</button></div><div class="room-cards">' + C.rooms.map(function (r) {
        return '<article class="rc' + (r.active ? '' : ' off') + '" data-row data-id="' + E(r.id) + '"><header><h4>' + E(r.name) + '</h4><label class="sw-t" title="Показувати на сайті"><input type="checkbox" class="act"' + (r.active ? ' checked' : '') + '><i></i></label></header><p>' + E(r.desc) + '</p><div class="rc-meta"><span>' + r.area + ' м²</span><span>до ' + r.guests + ' гостей</span><span>' + r.features.length + ' зручностей</span></div><footer><label class="price-in"><input type="number" class="pr" min="0" step="100" value="' + r.price + '" aria-label="Ціна за ніч"><span>грн / ніч</span></label><button class="ib edit" title="Редагувати">✎</button><button class="ib del" title="Видалити">✕</button></footer></article>';
      }).join('') + '</div>';
    }
    function find(el) { var id = el.closest('.rc').getAttribute('data-id'); return C.rooms.filter(function (r) { return r.id === id; })[0]; }
    function form(r) {
      openModal(r ? 'Редагувати номер' : 'Новий номер', [
        { name: 'name', label: 'Назва', value: r && r.name, req: true }, { name: 'price', label: 'Ціна за ніч, грн', type: 'number', value: r ? r.price : 3000, min: 0, half: true }, { name: 'area', label: 'Площа, м²', type: 'number', value: r ? r.area : 25, min: 1, half: true },
        { name: 'guests', label: 'Місткість', type: 'number', value: r ? r.guests : 2, min: 1, half: true }, { name: 'scene', label: 'Ілюстрація', type: 'select', options: ['room1', 'room2', 'room3', 'room4', 'room5'], value: r ? r.scene : 'room1', half: true },
        { name: 'desc', label: 'Опис', type: 'textarea', value: r && r.desc, req: true }, { name: 'features', label: 'Зручності (через кому)', value: r ? r.features.join(', ') : 'Сніданок, Вид на ліс' }
      ], function (v) {
        var o = r || { id: CMS.uid('r'), active: true }; o.name = v.name; o.price = v.price; o.area = v.area; o.guests = v.guests; o.scene = v.scene; o.desc = v.desc; o.features = v.features.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        if (!r) C.rooms.push(o); save(r ? 'Номер оновлено' : 'Номер додано'); draw();
      });
    }
    box.addEventListener('change', function (e) {
      if (e.target.classList.contains('act')) { var r = find(e.target); r.active = e.target.checked; e.target.closest('.rc').classList.toggle('off', !r.active); save(r.active ? 'Номер показано на сайті' : 'Номер приховано з сайту'); }
      if (e.target.classList.contains('pr')) { var r2 = find(e.target), v = +e.target.value; if (isNaN(v) || v < 0) { toast('Некоректна ціна', 'err'); e.target.value = r2.price; return; } r2.price = v; save('Ціну «' + r2.name + '» змінено: ' + CMS.money(v)); }
    });
    box.addEventListener('click', function (e) {
      if (e.target.closest('#addR')) return form(null);
      if (e.target.closest('.edit')) return form(find(e.target));
      if (e.target.closest('.del')) { var r = find(e.target); confirmBox('Видалити номер «' + r.name + '»? Наявні бронювання залишаться в журналі.', function () { C.rooms = C.rooms.filter(function (x) { return x !== r; }); save('Номер видалено'); draw(); }); }
    });
    draw();
  };

  function editNews(n) {
    openModal(n ? 'Редагувати новину' : 'Нова новина', [
      { name: 'title', label: 'Заголовок', value: n && n.title, req: true }, { name: 'date', label: 'Дата', type: 'date', value: n ? n.date : iso(TODAY), req: true, half: true },
      { name: 'tag', label: 'Рубрика', value: n ? n.tag : 'Події', req: true, half: true }, { name: 'text', label: 'Текст', type: 'textarea', rows: 6, value: n && n.text, req: true }
    ], function (v) {
      if (n) { n.title = v.title; n.date = v.date; n.tag = v.tag; n.text = v.text; } else C.news.unshift({ id: CMS.uid('n'), date: v.date, tag: v.tag, title: v.title, text: v.text });
      save(n ? 'Новину оновлено' : 'Новину опубліковано на сайті'); if (current === 'news') route();
    });
  }
  function editEvent(ev) {
    openModal(ev ? 'Редагувати подію' : 'Нова подія', [
      { name: 'title', label: 'Назва події', value: ev && ev.title, req: true }, { name: 'date', label: 'Дата', type: 'date', value: ev ? ev.date : iso(new Date(TODAY.getTime() + 3 * 864e5)), req: true, half: true },
      { name: 'time', label: 'Час', type: 'time', value: ev ? ev.time : '18:00', half: true }, { name: 'text', label: 'Опис', type: 'textarea', value: ev && ev.text, req: true }
    ], function (v) {
      if (ev) { ev.title = v.title; ev.date = v.date; ev.time = v.time; ev.text = v.text; } else C.events.push({ id: CMS.uid('e'), date: v.date, time: v.time, title: v.title, text: v.text });
      save(ev ? 'Подію оновлено' : 'Подію додано в календар'); if (current === 'events') route();
    });
  }

  R.news = function (box) {
    var list = C.news.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    box.innerHTML = '<div class="toolbar"><p class="muted">Новини виводяться на головній (3 останні) та на сторінці «Новини» з фільтром за рубриками.</p><button class="abtn abtn-gold" id="addN">+ Новина</button></div>' +
      card('', '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Дата</th><th>Заголовок</th><th>Рубрика</th><th>Символів</th><th></th></tr></thead><tbody>' + (list.map(function (n) {
        return '<tr data-row data-id="' + n.id + '"><td class="muted nowrap">' + CMS.fmtDate(n.date) + '</td><td><b>' + E(n.title) + '</b><small class="clip">' + E(n.text) + '</small></td><td><span class="pill tag">' + E(n.tag) + '</span></td><td class="num">' + n.text.length + '</td><td class="acts"><button class="ib edit" title="Редагувати">✎</button><button class="ib del" title="Видалити">✕</button></td></tr>';
      }).join('') || '<tr><td colspan="5">' + empty('Новин поки немає') + '</td></tr>') + '</tbody></table></div>');
    box.addEventListener('click', function (e) {
      if (e.target.closest('#addN')) return editNews(null);
      var tr = e.target.closest('tr[data-id]'); if (!tr) return; var n = C.news.filter(function (x) { return x.id === tr.getAttribute('data-id'); })[0];
      if (e.target.closest('.edit')) editNews(n);
      if (e.target.closest('.del')) confirmBox('Видалити новину «' + n.title + '»?', function () { C.news = C.news.filter(function (x) { return x !== n; }); save('Новину видалено'); route(); });
    });
  };

  R.events = function (box) {
    var list = C.events.slice().sort(function (a, b) { return a.date.localeCompare(b.date); }), t = iso(TODAY);
    box.innerHTML = '<div class="toolbar"><p class="muted">Події з’являються в інтерактивному календарі на головній та на сторінці «Новини».</p><button class="abtn abtn-gold" id="addE">+ Подія</button></div>' +
      card('', '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Дата</th><th>Час</th><th>Подія</th><th>Стан</th><th></th></tr></thead><tbody>' + (list.map(function (ev) {
        return '<tr data-row data-id="' + ev.id + '"' + (ev.date < t ? ' class="past"' : '') + '><td class="nowrap"><b>' + CMS.fmtDate(ev.date) + '</b></td><td class="num">' + E(ev.time) + '</td><td><b>' + E(ev.title) + '</b><small class="clip">' + E(ev.text) + '</small></td><td>' + (ev.date < t ? '<span class="pill no">минула</span>' : ev.date === t ? '<span class="pill new">сьогодні</span>' : '<span class="pill ok">заплановано</span>') + '</td><td class="acts"><button class="ib edit" title="Редагувати">✎</button><button class="ib del" title="Видалити">✕</button></td></tr>';
      }).join('') || '<tr><td colspan="5">' + empty('Подій поки немає') + '</td></tr>') + '</tbody></table></div>');
    box.addEventListener('click', function (e) {
      if (e.target.closest('#addE')) return editEvent(null);
      var tr = e.target.closest('tr[data-id]'); if (!tr) return; var ev = C.events.filter(function (x) { return x.id === tr.getAttribute('data-id'); })[0];
      if (e.target.closest('.edit')) editEvent(ev);
      if (e.target.closest('.del')) confirmBox('Видалити подію «' + ev.title + '»?', function () { C.events = C.events.filter(function (x) { return x !== ev; }); save('Подію видалено'); route(); });
    });
  };

  R.texts = function (box) {
    var groups = [
      ['Загальні', [['site.name', 'Назва сайту'], ['site.tagline', 'Слоган'], ['site.phone', 'Телефон'], ['site.email', 'E-mail'], ['site.address', 'Адреса', 'wide'], ['site.checkin', 'Час заїзду'], ['site.checkout', 'Час виїзду']]],
      ['Головна сторінка', [['home.introTitle', 'Заголовок вступу', 'wide'], ['home.introText', 'Текст вступу', 'area']]],
      ['Сторінка «Про нас»', [['about.title', 'Заголовок', 'wide'], ['about.lead', 'Лід-абзац', 'wide'], ['about.text', 'Основний текст (абзаци через порожній рядок)', 'area big']]]
    ];
    box.innerHTML = '<form id="txtForm" class="txt-form">' + groups.map(function (g) {
      return card(g[0], '<div class="c-b fgrid">' + g[1].map(function (f) {
        var v = CMS.get(C, f[0]) || '', id = 't-' + f[0].replace('.', '-'), area = (f[2] || '').indexOf('area') > -1;
        return '<label class="fld' + (f[2] ? ' ' + f[2].replace('area', '').trim() || '' : ' half') + (area ? ' wide' : '') + '" for="' + id + '"><span>' + f[1] + '</span>' + (area ? '<textarea id="' + id + '" name="' + f[0] + '" rows="' + ((f[2] || '').indexOf('big') > -1 ? 9 : 4) + '">' + E(v) + '</textarea>' : '<input id="' + id + '" name="' + f[0] + '" value="' + E(v) + '">') + '</label>';
      }).join('') + '</div>');
    }).join('') + '<div class="sticky-save"><span class="muted" id="dirty">Змін немає</span><button class="abtn abtn-gold" type="submit">Зберегти тексти</button></div></form>';
    var f = $('#txtForm');
    f.addEventListener('input', function () { $('#dirty').textContent = 'Є незбережені зміни'; $('#dirty').classList.add('warn'); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.elements['site.name'].value.trim()) { toast('Назва сайту не може бути порожньою', 'err'); return; }
      $$('input,textarea', f).forEach(function (el) { var p = el.name.split('.'); C[p[0]][p[1]] = el.value.trim(); });
      save('Тексти збережено — оновіть сайт, щоб побачити'); $('#dirty').textContent = 'Усе збережено'; $('#dirty').classList.remove('warn');
    });
  };

  R.slides = function (box) {
    function draw() {
      box.innerHTML = '<div class="toolbar"><p class="muted">Слайди головної сторінки: автоматична зміна кожні 6,5 с, стрілки та точки.</p><button class="abtn abtn-gold" id="addS">+ Слайд</button></div><div class="slides-ed">' + C.slides.map(function (s, i) {
        return '<article class="se" data-row data-i="' + i + '"><div class="se-n">' + String(i + 1).padStart(2, '0') + '</div><div class="fgrid"><label class="fld wide"><span>Заголовок</span><input name="title" value="' + E(s.title) + '"></label><label class="fld wide"><span>Текст</span><textarea name="text" rows="2">' + E(s.text) + '</textarea></label><label class="fld half"><span>Кнопка</span><input name="cta" value="' + E(s.cta) + '"></label><label class="fld half"><span>Посилання</span><input name="href" value="' + E(s.href) + '"></label><label class="fld half"><span>Сцена</span><select name="scene">' + [['dawn', 'Світанок'], ['night', 'Нічне небо'], ['winter', 'Зима'], ['fog', 'Туман'], ['summer', 'Літо'], ['autumn', 'Осінь'], ['peak', 'Говерла'], ['fire', 'Ватра']].map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === s.scene ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label></div><div class="se-acts"><button class="ib up" title="Вище">↑</button><button class="ib down" title="Нижче">↓</button><button class="ib del" title="Видалити">✕</button></div></article>';
      }).join('') + '</div><div class="sticky-save"><span class="muted">Порядок і тексти зберігаються разом</span><button class="abtn abtn-gold" id="saveS">Зберегти слайди</button></div>';
    }
    function collect() { $$('.se', box).forEach(function (a) { var s = C.slides[+a.getAttribute('data-i')]; ['title', 'text', 'cta', 'href', 'scene'].forEach(function (k) { s[k] = a.querySelector('[name=' + k + ']').value.trim(); }); }); }
    box.addEventListener('click', function (e) {
      var a = e.target.closest('.se'), i = a ? +a.getAttribute('data-i') : -1;
      if (e.target.closest('#addS')) { collect(); C.slides.push({ title: 'Новий слайд', text: 'Короткий опис пропозиції.', scene: 'summer', cta: 'Детальніше', href: 'about.html' }); draw(); toast('Слайд додано — не забудьте зберегти', 'info'); }
      if (e.target.closest('#saveS')) { collect(); save('Слайдер оновлено'); }
      if (e.target.closest('.up') && i > 0) { collect(); C.slides.splice(i - 1, 0, C.slides.splice(i, 1)[0]); draw(); }
      if (e.target.closest('.down') && i < C.slides.length - 1) { collect(); C.slides.splice(i + 1, 0, C.slides.splice(i, 1)[0]); draw(); }
      if (e.target.closest('.del')) { if (C.slides.length < 2) { toast('Має залишитися хоча б один слайд', 'err'); return; } collect(); C.slides.splice(i, 1); draw(); toast('Слайд прибрано — збережіть зміни', 'info'); }
    });
    draw();
  };

  R.menu = function (box) {
    function draw() {
      box.innerHTML = '<div class="g2">' + card('Пункти меню', '<div class="c-b"><ul class="menu-ed">' + C.menu.map(function (m, i) {
        return '<li data-row data-i="' + i + '"><span class="drag">⋮⋮</span><input name="label" value="' + E(m.label) + '" aria-label="Назва"><input name="href" value="' + E(m.href) + '" aria-label="Посилання"><button class="ib up" title="Вище">↑</button><button class="ib down" title="Нижче">↓</button><button class="ib del" title="Видалити">✕</button></li>';
      }).join('') + '</ul><div class="row-btns"><button class="abtn abtn-ghost" id="addM">+ Пункт меню</button><button class="abtn abtn-gold" id="saveM">Зберегти меню</button></div></div>', 'span2') +
        card('Попередній перегляд', '<div class="c-b"><div class="menu-prev">' + C.menu.map(function (m) { return '<span>' + E(m.label) + '</span>'; }).join('') + '<span class="mp-b">Забронювати</span></div><p class="muted small">Меню однакове на всіх сторінках сайту і у футері. Відносні посилання: <code>about.html</code>, <code>rooms.html#booking</code>.</p></div>') + '</div>';
    }
    function collect() { $$('.menu-ed li', box).forEach(function (li) { var m = C.menu[+li.getAttribute('data-i')]; m.label = li.querySelector('[name=label]').value.trim(); m.href = li.querySelector('[name=href]').value.trim(); }); }
    box.addEventListener('click', function (e) {
      var li = e.target.closest('li[data-i]'), i = li ? +li.getAttribute('data-i') : -1;
      if (e.target.closest('#addM')) { collect(); C.menu.push({ label: 'Новий пункт', href: 'index.html' }); draw(); }
      if (e.target.closest('#saveM')) { collect(); if (C.menu.some(function (m) { return !m.label || !m.href; })) { toast('Заповніть назву і посилання для кожного пункту', 'err'); return; } save('Меню збережено'); draw(); }
      if (e.target.closest('.up') && i > 0) { collect(); C.menu.splice(i - 1, 0, C.menu.splice(i, 1)[0]); draw(); }
      if (e.target.closest('.down') && i > -1 && i < C.menu.length - 1) { collect(); C.menu.splice(i + 1, 0, C.menu.splice(i, 1)[0]); draw(); }
      if (e.target.closest('.del')) { collect(); C.menu.splice(i, 1); draw(); toast('Пункт прибрано — збережіть меню', 'info'); }
    });
    draw();
  };

  R.messages = function (box) {
    function draw() {
      box.innerHTML = C.messages.length ? '<div class="msgs">' + C.messages.map(function (m) {
        return '<article class="msg" data-row data-id="' + m.id + '"><span class="m-ava">' + E(m.name.charAt(0)) + '</span><div><header><b>' + E(m.name) + '</b><a href="mailto:' + E(m.email) + '">' + E(m.email) + '</a><time>' + CMS.fmtDate(m.date) + '</time></header><p>' + E(m.text) + '</p><div class="row-btns"><a class="abtn abtn-ghost abtn-sm" href="mailto:' + E(m.email) + '?subject=' + encodeURIComponent(C.site.name) + '">Відповісти</a><button class="abtn abtn-ghost abtn-sm del">Видалити</button></div></div></article>';
      }).join('') + '</div>' : card('', empty('Нових повідомлень немає. Вони з’являться тут після відправлення форми на сторінці «Контакти».'));
    }
    box.addEventListener('click', function (e) { var d = e.target.closest('.del'); if (!d) return; var id = d.closest('.msg').getAttribute('data-id'); C.messages = C.messages.filter(function (m) { return m.id !== id; }); save('Повідомлення видалено'); draw(); });
    draw();
  };

  R.settings = function (box) {
    var size = 0; try { size = (localStorage.getItem(CMS.key) || '').length; } catch (e) { }
    box.innerHTML = '<div class="g2">' + card('Резервна копія', '<div class="c-b"><p>Завантажте весь контент сайту у файл JSON або відновіть його з копії.</p><div class="row-btns"><button class="abtn abtn-gold" id="exp">Експортувати JSON</button></div><label class="fld wide"><span>Імпорт (вставте JSON)</span><textarea id="impTxt" rows="5" placeholder="{ &quot;site&quot;: { … } }"></textarea></label><button class="abtn abtn-ghost" id="imp">Імпортувати</button></div>', 'span2') +
      card('Сховище', '<div class="c-b"><div class="store"><b>' + (size / 1024).toFixed(1) + ' КБ</b><span>у localStorage браузера</span></div><p class="muted small">Дефолтний контент лежить у <code>js/content.js</code>, а зміни з панелі зберігаються поверх нього.</p><button class="abtn abtn-red" id="reset">Скинути до початкового</button></div>') + '</div>';
    $('#exp', box).addEventListener('click', function () {
      try { var blob = new Blob([JSON.stringify(C, null, 2)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'smerekova-content.json'; document.body.appendChild(a); a.click(); a.remove(); toast('Файл smerekova-content.json завантажено'); } catch (e) { toast('Експорт недоступний у цьому браузері', 'err'); }
    });
    $('#imp', box).addEventListener('click', function () {
      try { var o = JSON.parse($('#impTxt', box).value); if (!o || !o.site || !o.rooms) throw 0; C = CMS.load(); Object.keys(o).forEach(function (k) { C[k] = o[k]; }); save('Контент імпортовано'); route(); } catch (e) { toast('Некоректний JSON — перевірте вміст', 'err'); }
    });
    $('#reset', box).addEventListener('click', function () { confirmBox('Скинути всі зміни і повернути контент за замовчуванням? Це не можна скасувати.', function () { CMS.reset(); C = CMS.load(); toast('Контент повернуто до початкового'); route(); }); });
  };

  /* ---------- старт ---------- */
  paintBrand(); badges();
  if (getSess() || (SHOT && q.get('login') !== '1')) { $('#login').hidden = true; $('#app').hidden = false; route(); }
})();
