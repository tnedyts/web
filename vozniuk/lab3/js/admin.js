/* ==========================================================
   Арт-кінотеатр «Ліхтар» — адмін-панель міні-CMS
   Вхід: admin / admin123. Усі зміни зберігаються в localStorage
   і одразу з'являються на сайті.   © 2026 Максим Вознюк
   ========================================================== */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var params = new URLSearchParams(location.search);
  var SHOT = document.documentElement.classList.contains("shot");
  var AUTH = "lx_admin_auth";
  var root = $("#root");
  var C = CMS.load();

  var P = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  var I = {
    dash: '<svg viewBox="0 0 24 24" ' + P + '><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>',
    gear: '<svg viewBox="0 0 24 24" ' + P + '><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    home: '<svg viewBox="0 0 24 24" ' + P + '><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
    info: '<svg viewBox="0 0 24 24" ' + P + '><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
    menu: '<svg viewBox="0 0 24 24" ' + P + '><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
    slides: '<svg viewBox="0 0 24 24" ' + P + '><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M10 9l4 2-4 2z"/></svg>',
    news: '<svg viewBox="0 0 24 24" ' + P + '><path d="M4 5h13v14a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2z"/><path d="M17 9h3v10a2 2 0 0 1-4 0M8 9h5M8 13h5M8 17h3"/></svg>',
    cal: '<svg viewBox="0 0 24 24" ' + P + '><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    cup: '<svg viewBox="0 0 24 24" ' + P + '><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 2.5c-.8 1 .8 2 0 3.2M12 2.5c-.8 1 .8 2 0 3.2"/></svg>',
    school: '<svg viewBox="0 0 24 24" ' + P + '><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/></svg>',
    image: '<svg viewBox="0 0 24 24" ' + P + '><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/></svg>',
    team: '<svg viewBox="0 0 24 24" ' + P + '><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.6c2.6.1 4.6 1.7 5.4 4.4"/></svg>',
    mail: '<svg viewBox="0 0 24 24" ' + P + '><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    ticket: '<svg viewBox="0 0 24 24" ' + P + '><path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z"/><path d="M13 6v12" stroke-dasharray="2 2"/></svg>',
    db: '<svg viewBox="0 0 24 24" ' + P + '><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>',
    out: '<svg viewBox="0 0 24 24" ' + P + '><path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11"/></svg>',
    plus: '<svg viewBox="0 0 24 24" ' + P + '><path d="M12 5v14M5 12h14"/></svg>',
    edit: '<svg viewBox="0 0 24 24" ' + P + '><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
    del: '<svg viewBox="0 0 24 24" ' + P + '><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    up: '<svg viewBox="0 0 24 24" ' + P + '><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24" ' + P + '><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
    eye: '<svg viewBox="0 0 24 24" ' + P + '><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    ext: '<svg viewBox="0 0 24 24" ' + P + '><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    search: '<svg viewBox="0 0 24 24" ' + P + '><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    save: '<svg viewBox="0 0 24 24" ' + P + '><path d="M5 3h11l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M7 3v6h9M7 21v-7h10v7"/></svg>',
    reply: '<svg viewBox="0 0 24 24" ' + P + '><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v4"/></svg>',
    bars: '<svg viewBox="0 0 24 24" ' + P + '><path d="M4 6h16M4 12h16M4 18h16"/></svg>'
  };
  var MARK = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#2C0B14" stroke="#D4A84B" stroke-width="1.5"/><path d="M24 14h16l-2 6H26z" fill="#D4A84B"/><rect x="23" y="20" width="18" height="24" rx="6" fill="#FFE3A6"/><path d="M23 28h18M23 36h18M32 20v24" stroke="#D4A84B" stroke-width="1.6"/><rect x="27" y="44" width="10" height="5" rx="1" fill="#D4A84B"/></svg>';

  var MONTHS_G = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
  var MONTHS = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];
  var MONTHS_F = ["січень", "лютий", "березень", "квітень", "травень", "червень", "липень", "серпень", "вересень", "жовтень", "листопад", "грудень"];
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parse(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmt(s) { if (!s) return "—"; var d = parse(s); return d.getDate() + " " + MONTHS_G[d.getMonth()] + " " + d.getFullYear(); }
  function fmtTime(t) { var d = new Date(t); return d.getDate() + " " + MONTHS_G[d.getMonth()] + ", " + pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function ago(t) {
    var s = (Date.now() - new Date(t).getTime()) / 1000;
    if (s < 60) return "щойно"; if (s < 3600) return Math.floor(s / 60) + " хв тому"; if (s < 86400) return Math.floor(s / 3600) + " год тому";
    return fmtTime(t);
  }
  var TODAY = iso(new Date());
  function get(o, p) { return p.split(".").reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function set(o, p, v) { var ks = p.split("."), last = ks.pop(); ks.reduce(function (a, k) { return a[k] = a[k] || {}; }, o)[last] = v; }
  function plainFromHtml(h) { return String(h || "").replace(/<\/p>\s*<p>/g, "\n\n").replace(/<br\s*\/?>/g, "\n").replace(/<\/?p>/g, "").replace(/&nbsp;/g, " ").trim(); }
  function htmlFromPlain(t) {
    return String(t || "").split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean)
      .map(function (p) { return "<p>" + esc(p).replace(/\n/g, "<br>").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>") + "</p>"; }).join("");
  }

  var IMAGES = ["img/hall.svg", "img/projector.svg", "img/courtyard.svg", "img/castle-night.svg", "img/foyer.svg", "img/festival.svg", "img/reels.svg", "img/club.svg"];

  /* ---------- Сховище ---------- */
  function commit(msg, quiet) {
    var ok = CMS.save(C);
    if (ok) { CMS.log(msg); if (!quiet) toast(msg); }
    else toast("Не вдалося зберегти: сховище браузера недоступне", "err");
    updateSaveState(); updateCounts();
  }

  /* ---------- Тости ---------- */
  function toast(text, type) {
    var t = document.createElement("div");
    t.className = "toast " + (type || "");
    t.innerHTML = '<span class="ti">' + (type === "err" ? I.x : (type === "info" ? I.info.replace('stroke="currentColor"', 'stroke="#fff"') : I.check)) + "</span><span>" + esc(text) + "</span>";
    $("#toasts").appendChild(t);
    setTimeout(function () { t.classList.add("out"); setTimeout(function () { t.remove(); }, 400); }, 3200);
  }

  /* ---------- Модальні вікна ---------- */
  var modal = document.createElement("div");
  modal.className = "modal"; modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true");
  document.body.appendChild(modal);
  function openModal(title, body, foot, small) {
    modal.className = "modal" + (small ? " small" : "");
    modal.innerHTML = '<div class="box"><div class="m-head"><h3>' + esc(title) + '</h3><button class="ib" data-close aria-label="Закрити">' + I.x + '</button></div><div class="m-body">' + body + '</div><div class="m-foot">' + foot + "</div></div>";
    requestAnimationFrame(function () { modal.classList.add("open"); });
    $$("[data-close]", modal).forEach(function (b) { b.addEventListener("click", closeModal); });
    var f = $("input,textarea,select", modal); if (f) setTimeout(function () { f.focus(); }, 250);
  }
  function closeModal() { modal.classList.remove("open"); }
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modal.classList.contains("open")) closeModal(); });
  function confirmBox(text, yes, label) {
    openModal("Підтвердження", "<p>" + esc(text) + "</p>", '<button class="btn ghost" data-close>Скасувати</button><button class="btn" id="cfYes">' + (label || "Видалити") + "</button>", true);
    $("#cfYes").addEventListener("click", function () { closeModal(); yes(); });
  }

  /* ---------- Генератор полів форм ---------- */
  function fieldHTML(f, val) {
    if (f.row) return '<div class="grid' + f.row.length + '">' + f.row.map(function (x) { return fieldHTML(x, val && val[x.k] !== undefined ? val : val); }).join("") + "</div>";
    var v = val ? (f.k.indexOf(".") > -1 ? get(val, f.k) : val[f.k]) : "";
    if (v == null) v = "";
    var id = "f_" + f.k.replace(/\./g, "_"), inp;
    if (f.t === "ta" || f.t === "html") {
      inp = '<textarea id="' + id + '" name="' + f.k + '" rows="' + (f.rows || (f.t === "html" ? 8 : 3)) + '">' + esc(f.t === "html" ? plainFromHtml(v) : v) + "</textarea>";
    } else if (f.t === "select") {
      var opts = typeof f.opts === "function" ? f.opts() : f.opts;
      inp = '<select id="' + id + '" name="' + f.k + '">' + Object.keys(opts).map(function (k) { return '<option value="' + esc(k) + '"' + (String(v) === k ? " selected" : "") + ">" + esc(opts[k]) + "</option>"; }).join("") + "</select>";
    } else if (f.t === "img") {
      var list = f.list || IMAGES;
      inp = '<div class="img-pick" role="radiogroup" aria-label="' + esc(f.l) + '">' + list.map(function (src) { return '<label title="' + esc(src) + '"><input type="radio" name="' + f.k + '" value="' + esc(src) + '"' + (v === src ? " checked" : "") + '><img src="' + esc(src) + '" alt=""></label>'; }).join("") + "</div>";
    } else {
      inp = '<input id="' + id + '" name="' + f.k + '" type="' + (f.t || "text") + '" value="' + esc(v) + '"' + (f.t === "number" ? ' step="any"' : "") + (f.ph ? ' placeholder="' + esc(f.ph) + '"' : "") + ">";
    }
    return '<div class="fld" data-k="' + f.k + '"><label for="' + id + '">' + esc(f.l) + (f.req ? ' <span style="color:var(--terra)">*</span>' : "") + "</label>" + inp + (f.note ? '<span class="note">' + esc(f.note) + "</span>" : "") + "</div>";
  }
  function flat(fields) { var out = []; fields.forEach(function (f) { if (f.row) out = out.concat(f.row); else out.push(f); }); return out; }
  function readFields(scope, fields, target, usePath) {
    var ok = true;
    flat(fields).forEach(function (f) {
      var el, v;
      if (f.t === "img") { el = $('input[name="' + f.k + '"]:checked', scope); v = el ? el.value : ""; }
      else { el = $('[name="' + f.k + '"]', scope); v = el ? el.value : ""; }
      if (f.t === "number") v = v === "" ? 0 : +v;
      if (f.t === "html") v = htmlFromPlain(v);
      var box = $('.fld[data-k="' + f.k + '"]', scope);
      var bad = f.req && (v === "" || v == null || (typeof v === "string" && !v.trim()));
      if (box) { box.classList.remove("bad"); if (bad) { void box.offsetWidth; box.classList.add("bad"); } }
      if (bad) ok = false;
      if (usePath) set(target, f.k, typeof v === "string" ? v.trim() : v); else target[f.k] = typeof v === "string" ? v.trim() : v;
    });
    if (!ok) toast("Заповніть обов'язкові поля", "err");
    return ok;
  }
  /* ---------- Конфігурації колекцій ---------- */
  function typeOpts() { return C.eventTypes; }
  function filmOpts() { var o = {}; C.films.forEach(function (f) { o[f.id] = f.title; }); return o; }
  function hallOpts() { var o = {}; C.halls.forEach(function (h) { o[h.name] = h.name; }); return o; }
  function filmTitle(id) { var f = C.films.filter(function (x) { return x.id === id; })[0]; return f ? f.title : "— фільм видалено —"; }
  function thumb(f) { return '<span class="poster-thumb">' + (window.posterSVG ? posterSVG(f, { uid: "t" + Math.random().toString(36).slice(2, 7) }) : "") + "</span>"; }
  var in14 = iso(new Date(Date.now() + 14 * 864e5));
  var COLL = {
    films: {
      title: "Фільми", one: "фільм", key: "films", idp: "f", preview: true,
      filter: { k: "genre", opts: function () { var o = {}; C.films.forEach(function (f) { o[f.genre] = f.genre; }); return o; } },
      cols: [
        { l: "", r: thumb },
        { l: "Фільм", r: function (x) { return '<div class="t-title">' + esc(x.title) + '</div><div class="t-sub">' + esc(x.tagline) + "</div>"; } },
        { l: "Жанр", r: function (x) { return '<span class="badge">' + esc(x.genre) + "</span>" + (x.featured ? ' <span class="badge terra">у слайдері</span>' : ""); } },
        { l: "Рік · хв", r: function (x) { return esc(x.year) + " · " + esc(x.duration) + " хв"; } },
        { l: "Рейтинг", r: function (x) { return "<b>★ " + esc(x.rating) + "</b>"; } },
        { l: "Сеансів", r: function (x) { return C.sessions.filter(function (s) { return s.filmId === x.id && s.date >= TODAY; }).length; } }
      ],
      fields: [{ k: "title", l: "Назва фільму", req: 1 }, { k: "tagline", l: "Слоган", req: 1 },
        { row: [{ k: "genre", l: "Жанр", req: 1 }, { k: "director", l: "Режисер", req: 1 }] },
        { row: [{ k: "year", l: "Рік", t: "number" }, { k: "duration", l: "Тривалість, хв", t: "number" }, { k: "rating", l: "Рейтинг", t: "number" }] },
        { row: [{ k: "country", l: "Країна" }, { k: "age", l: "Вік", t: "select", opts: { "0+": "0+", "6+": "6+", "12+": "12+", "16+": "16+", "18+": "18+" } }, { k: "featured", l: "У слайдері", t: "select", opts: { "": "ні", "так": "так" } }] },
        { row: [{ k: "style", l: "Мотив постера", t: "select", opts: function () { return window.POSTER_STYLES; } }, { k: "palette", l: "Палітра постера", t: "select", opts: function () { return window.POSTER_PALETTES; } }] },
        { k: "desc", l: "Опис", t: "ta", rows: 5, req: 1 }],
      blank: function () { return { genre: "Драма", year: 2026, duration: 100, rating: 8, country: "Україна", age: "12+", featured: "", style: "reel", palette: "wine" }; },
      view: function (x) { return "films.html" + (x && x.id ? "?film=" + x.id : ""); }
    },
    sessions: {
      title: "Сеанси", one: "сеанс", key: "sessions", idp: "s",
      pre: function (s) { return s.date >= TODAY && s.date <= in14; },
      note: "показано найближчі 14 днів",
      sort: function (a, b) { return (a.date + a.time + a.hall).localeCompare(b.date + b.time + b.hall); },
      filter: { k: "hall", opts: hallOpts },
      cols: [
        { l: "Дата", r: function (x) { return "<b>" + fmt(x.date) + '</b><div class="t-sub">' + esc(x.time) + "</div>"; } },
        { l: "Фільм", r: function (x) { return '<div class="t-title">' + esc(filmTitle(x.filmId)) + "</div>"; } },
        { l: "Зала", r: function (x) { return '<span class="badge ' + (x.hall === "Великий зал" ? "terra" : "sage") + '">' + esc(x.hall) + "</span>"; } },
        { l: "Формат", r: function (x) { return esc(x.format); } },
        { l: "Ціна", r: function (x) { return "<b>" + esc(x.price) + " ₴</b>"; } }
      ],
      fields: [{ k: "filmId", l: "Фільм", t: "select", opts: filmOpts }, { row: [{ k: "date", l: "Дата", t: "date", req: 1 }, { k: "time", l: "Час", t: "time", req: 1 }] },
        { row: [{ k: "hall", l: "Зала", t: "select", opts: hallOpts }, { k: "format", l: "Формат" }, { k: "price", l: "Ціна, ₴", t: "number", req: 1 }] }],
      blank: function () { return { filmId: C.films[0] && C.films[0].id, date: TODAY, time: "19:30", hall: "Великий зал", format: "2D", price: 190 }; },
      view: function (x) { return "schedule.html" + (x && x.date ? "?date=" + x.date : ""); }
    },
    events: {
      title: "Події календаря", one: "подію", key: "events", idp: "e",
      sort: function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); },
      filter: { k: "type", opts: typeOpts },
      cols: [
        { l: "Дата", r: function (x) { return "<b>" + fmt(x.date) + '</b><div class="t-sub">' + esc(x.time) + (x.date < TODAY ? " · минула" : "") + "</div>"; } },
        { l: "Подія", r: function (x) { return '<div class="t-title">' + esc(x.title) + '</div><div class="t-sub">' + esc(x.desc) + "</div>"; } },
        { l: "Тип", r: function (x) { return '<span class="badge ' + ({ club: "sage", fest: "terra", retro: "", special: "gray" }[x.type] || "") + '">' + esc(C.eventTypes[x.type] || x.type) + "</span>"; } },
        { l: "Місце", r: function (x) { return esc(x.place); } }
      ],
      fields: [{ k: "title", l: "Назва події", req: 1 }, { row: [{ k: "date", l: "Дата", t: "date", req: 1 }, { k: "time", l: "Час", t: "time", req: 1 }] }, { row: [{ k: "type", l: "Тип", t: "select", opts: typeOpts }, { k: "place", l: "Місце" }] }, { k: "desc", l: "Опис", t: "ta", req: 1 }],
      blank: function () { return { date: TODAY, time: "19:00", type: "club", place: "Камерна зала" }; },
      view: function (x) { return "schedule.html" + (x && x.date ? "?date=" + x.date : ""); }
    },
    news: {
      title: "Новини", one: "новину", key: "news", idp: "n",
      sort: function (a, b) { return b.date.localeCompare(a.date); },
      cols: [
        { l: "", r: function (x) { return '<img class="thumb" src="' + esc(x.img) + '" alt="">'; } },
        { l: "Заголовок", r: function (x) { return '<div class="t-title">' + esc(x.title) + '</div><div class="t-sub">' + esc(x.excerpt) + "</div>"; } },
        { l: "Рубрика", r: function (x) { return '<span class="badge">' + esc(x.cat) + "</span>"; } },
        { l: "Дата", r: function (x) { return fmt(x.date); } }
      ],
      fields: [{ k: "title", l: "Заголовок", req: 1 }, { row: [{ k: "date", l: "Дата публікації", t: "date", req: 1 }, { k: "cat", l: "Рубрика", ph: "Фестиваль, Кіноклуб…" }] }, { k: "img", l: "Ілюстрація", t: "img" }, { k: "excerpt", l: "Анонс (для картки)", t: "ta", req: 1 }, { k: "body", l: "Текст новини", t: "html", note: "Абзаци розділяйте порожнім рядком. **жирний** — виділення.", req: 1 }],
      blank: function () { return { date: TODAY, cat: "Кінотеатр", img: "img/hall.svg" }; },
      view: function (x) { return "news.html" + (x && x.id ? "?id=" + encodeURIComponent(x.id) : ""); }
    },
    gallery: {
      title: "Галерея", one: "фото", key: "gallery", ordered: true, grid: true,
      fields: [{ row: [{ k: "title", l: "Підпис", req: 1 }, { k: "cat", l: "Категорія", ph: "Зали, Події…" }] }, { k: "img", l: "Зображення", t: "img", req: 1 }],
      blank: function () { return { cat: "Зали", img: "img/hall.svg" }; },
      view: function () { return "about.html"; }
    },
    halls: {
      title: "Зали", one: "залу", key: "halls", ordered: true,
      cols: [{ l: "Зала", r: function (x) { return '<div class="t-title">' + esc(x.name) + '</div><div class="t-sub">' + esc(x.text) + "</div>"; } }, { l: "Місць", r: function (x) { return "<b>" + esc(x.seats) + "</b>"; } }],
      fields: [{ row: [{ k: "name", l: "Назва", req: 1 }, { k: "seats", l: "Місць", t: "number" }, { k: "icon", l: "Іконка", t: "select", opts: { screen: "Екран", sofa: "Диван", star: "Зірка" } }] }, { k: "text", l: "Опис", t: "ta" }],
      blank: function () { return { seats: 40, icon: "screen" }; },
      view: function () { return "about.html"; }
    }
  };
  function editItem(cfg, item, onDone) {
    var isNew = !item, data = item ? JSON.parse(JSON.stringify(item)) : cfg.blank();
    var form = '<form id="itemForm" novalidate>' + cfg.fields.map(function (f) { return fieldHTML(f, data); }).join("") + "</form>";
    if (cfg.preview) form = '<div class="film-edit"><div>' + form + '</div><div><div class="pv-poster" id="pvPoster"></div><p class="note" style="text-align:center;font-size:12px;color:var(--muted);margin-top:10px">Постер генерується автоматично з назви, мотиву й палітри</p></div></div>';
    openModal((isNew ? "Додати " : "Редагувати ") + cfg.one, form,
      '<button class="btn ghost" data-close>Скасувати</button><button class="btn" id="itemSave">' + I.save + (isNew ? "Додати" : "Зберегти зміни") + "</button>");
    if (cfg.preview) {
      var pv = function () { var tmp = JSON.parse(JSON.stringify(data)); readFieldsQuiet($("#itemForm"), cfg.fields, tmp); tmp.id = data.id || "new"; $("#pvPoster").innerHTML = posterSVG(tmp, { uid: "pv" }); };
      $("#itemForm").addEventListener("input", pv); $("#itemForm").addEventListener("change", pv); pv();
    }
    function save() {
      if (!readFields($("#itemForm"), cfg.fields, data)) return;
      var list = C[cfg.key];
      if (isNew) { if (cfg.idp) data.id = CMS.uid(cfg.idp); list.push(data); }
      else { var idx = list.indexOf(item); list[idx] = data; }
      closeModal();
      commit((isNew ? "Додано " : "Оновлено ") + cfg.one + ": «" + (data.title || data.name || filmTitle(data.filmId) + ", " + data.date + " " + data.time) + "»");
      if (onDone) onDone(data);
    }
    $("#itemSave").addEventListener("click", save);
    $("#itemForm").addEventListener("submit", function (e) { e.preventDefault(); save(); });
  }
  function collectionView(name) {
    var cfg = COLL[name], filterVal = "all";
    return function (el) {
      function draw(flashItem) {
        var list = C[cfg.key].filter(cfg.pre || function () { return true; });
        if (cfg.sort) list.sort(cfg.sort);
        var shown = list.filter(function (x) { return !cfg.filter || filterVal === "all" || x[cfg.filter.k] === filterVal; });
        var tb = '<div class="toolbar"><button class="btn" id="addBtn">' + I.plus + "Додати " + cfg.one + "</button>";
        if (cfg.filter) { var o = cfg.filter.opts(); tb += '<div class="chips"><button class="chip' + (filterVal === "all" ? " on" : "") + '" data-f="all">Усі</button>' + Object.keys(o).map(function (k) { return '<button class="chip' + (filterVal === k ? " on" : "") + '" data-f="' + k + '">' + esc(o[k]) + "</button>"; }).join("") + "</div>"; }
        tb += '<span class="sp"></span><span class="info">Записів: ' + shown.length + (cfg.ordered ? " · порядок як на сайті" : "") + (cfg.note ? " · " + cfg.note : "") + '</span><a class="btn ghost sm" href="' + cfg.view({ id: "" }) + '" target="_blank" rel="noopener">' + I.ext + "На сайті</a></div>";
        var body;
        if (cfg.grid) {
          body = '<div class="g-admin">' + shown.map(function (x, i) {
            return '<div class="g-card" data-i="' + C[cfg.key].indexOf(x) + '"><img src="' + esc(x.img) + '" alt=""><div class="b"><div><b>' + esc(x.title) + "</b><small>" + esc(x.cat || "") + '</small></div><button class="ib" data-act="up" aria-label="Вище"' + (i === 0 ? " disabled" : "") + ">" + I.up + '</button><button class="ib" data-act="edit" aria-label="Редагувати">' + I.edit + '</button><button class="ib del" data-act="del" aria-label="Видалити">' + I.del + "</button></div></div>";
          }).join("") + "</div>";
        } else {
          body = '<div class="tbl-wrap"><table><thead><tr>' + cfg.cols.map(function (c) { return "<th>" + c.l + "</th>"; }).join("") + "<th></th></tr></thead><tbody>" +
            shown.map(function (x, i) {
              var real = C[cfg.key].indexOf(x);
              return '<tr data-i="' + real + '"' + (x === flashItem ? ' class="flash"' : "") + ">" + cfg.cols.map(function (c) { return "<td>" + c.r(x) + "</td>"; }).join("") + '<td class="acts">' +
                (cfg.ordered ? '<button class="ib" data-act="up" aria-label="Вище"' + (i === 0 ? " disabled" : "") + ">" + I.up + '</button><button class="ib" data-act="down" aria-label="Нижче"' + (i === shown.length - 1 ? " disabled" : "") + ">" + I.down + "</button>" : "") +
                '<a class="ib" href="' + esc(cfg.view(x)) + '" target="_blank" rel="noopener" aria-label="Переглянути">' + I.eye + '</a><button class="ib" data-act="edit" aria-label="Редагувати">' + I.edit + '</button><button class="ib del" data-act="del" aria-label="Видалити">' + I.del + "</button></td></tr>";
            }).join("") + "</tbody></table>" + (shown.length ? "" : '<div class="empty">Тут поки порожньо. Натисніть «Додати».</div>') + "</div>";
        }
        el.innerHTML = tb + body;
        $("#addBtn", el).addEventListener("click", function () { editItem(cfg, null, function (d) { draw(d); }); });
        $$(".chip", el).forEach(function (b) { b.addEventListener("click", function () { filterVal = b.dataset.f; draw(); }); });
        $$("[data-act]", el).forEach(function (b) {
          b.addEventListener("click", function () {
            var i = +b.closest("[data-i]").dataset.i, arr = C[cfg.key], item = arr[i];
            if (b.dataset.act === "edit") editItem(cfg, item, function (d) { draw(d); });
            if (b.dataset.act === "del") confirmBox("Видалити " + cfg.one + " «" + (item.title || item.name) + "»? Дію не можна скасувати.", function () { arr.splice(i, 1); commit("Видалено " + cfg.one + ": «" + (item.title || item.name) + "»"); draw(); });
            if (b.dataset.act === "up" || b.dataset.act === "down") {
              var j = i + (b.dataset.act === "up" ? -1 : 1); if (j < 0 || j >= arr.length) return;
              arr[i] = arr[j]; arr[j] = item; commit("Змінено порядок: " + cfg.title.toLowerCase(), true); draw(item);
            }
          });
        });
        applySearch();
      }
      draw();
    };
  }

  /* ---------- Редактор рядків (масиви простих об'єктів) ---------- */
  function rowsEditor(el, arr, keys, cls, blank, addLabel) {
    function draw() {
      el.innerHTML = '<div class="rows">' + arr.map(function (r, i) {
        return '<div class="row-ed ' + (cls || "") + '" data-i="' + i + '"><span class="n">' + (i + 1) + "</span>" +
          keys.map(function (k) { return '<input data-k="' + k.k + '" value="' + esc(r[k.k]) + '" placeholder="' + esc(k.ph) + '" aria-label="' + esc(k.ph) + '"' + (k.num ? ' type="number"' : "") + ">"; }).join("") +
          '<span style="white-space:nowrap"><button type="button" class="ib" data-a="up" aria-label="Вище"' + (i ? "" : " disabled") + ">" + I.up + '</button> <button type="button" class="ib del" data-a="del" aria-label="Видалити">' + I.del + "</button></span></div>";
      }).join("") + '</div><button type="button" class="btn ghost sm" style="margin-top:12px" data-a="add">' + I.plus + (addLabel || "Додати рядок") + "</button>";
      $$("input", el).forEach(function (inp) { inp.addEventListener("input", function () { var i = +inp.closest(".row-ed").dataset.i; arr[i][inp.dataset.k] = inp.type === "number" ? +inp.value : inp.value; }); });
      $$("[data-a]", el).forEach(function (b) {
        b.addEventListener("click", function () {
          var row = b.closest(".row-ed"), i = row ? +row.dataset.i : -1;
          if (b.dataset.a === "add") arr.push(blank());
          if (b.dataset.a === "del") arr.splice(i, 1);
          if (b.dataset.a === "up" && i > 0) { var t = arr[i]; arr[i] = arr[i - 1]; arr[i - 1] = t; }
          draw();
        });
      });
    }
    draw();
  }

  /* ---------- Форми налаштувань (об'єкти) ---------- */
  function objectView(fields, extras, msg, previewFn) {
    return function (el) {
      var work = JSON.parse(JSON.stringify(C));
      el.innerHTML = '<form id="objForm" novalidate><div class="form-cols"><div class="card">' + fields.map(function (f) { return fieldHTML(f, work); }).join("") + "</div><div>" +
        (previewFn ? '<div class="card" style="margin-bottom:22px"><div class="card-h"><div><h3>Попередній перегляд</h3><p>Так блок виглядатиме на сайті</p></div></div><div id="pv"></div></div>' : "") +
        (extras || []).map(function (x, i) { return '<div class="card" style="margin-bottom:22px"><div class="card-h"><div><h3>' + esc(x.title) + "</h3><p>" + esc(x.note || "") + '</p></div></div><div id="ex' + i + '"></div></div>'; }).join("") +
        '</div></div><div class="sticky-save"><button type="button" class="btn ghost" id="objReset">Скасувати зміни</button><button class="btn" type="submit">' + I.save + "Зберегти</button></div></form>";
      (extras || []).forEach(function (x, i) { var arr = get(work, x.path); rowsEditor($("#ex" + i, el), arr, x.keys, x.cls, x.blank, x.add); });
      function pv() { if (!previewFn) return; var tmp = {}; readFieldsQuiet(el, fields, tmp); $("#pv", el).innerHTML = previewFn(tmp); }
      if (previewFn) { el.addEventListener("input", pv); pv(); }
      $("#objReset", el).addEventListener("click", function () { render(); toast("Зміни скасовано", "info"); });
      $("#objForm", el).addEventListener("submit", function (e) {
        e.preventDefault();
        if (!readFields(el, fields, work, true)) return;
        (extras || []).forEach(function (x) { set(C, x.path, get(work, x.path)); });
        flat(fields).forEach(function (f) { set(C, f.k, get(work, f.k)); });
        commit(msg);
      });
    };
  }
  function readFieldsQuiet(scope, fields, target) {
    flat(fields).forEach(function (f) { var el = $('[name="' + f.k + '"]', scope); set(target, f.k, el ? el.value : ""); });
  }

  /* ==========================================================
     ПЕРЕГЛЯДИ
     ========================================================== */
  var VIEWS = {
    dashboard: { g: "Огляд", t: "Дашборд", i: "dash", sub: "Статистика продажів, сеанси й активність" },
    settings: { g: "Контент", t: "Налаштування сайту", i: "gear", sub: "Назва, контакти, оголошення" },
    home: { g: "Контент", t: "Головна сторінка", i: "home", sub: "Тексти першого екрана та лічильники" },
    about: { g: "Контент", t: "Про кінотеатр", i: "info", sub: "Історія та ціни на квитки" },
    nav: { g: "Контент", t: "Пункти меню", i: "bars", sub: "Навігація в шапці та футері" },
    films: { g: "Кіно", t: "Фільми", i: "slides", sub: "Афіша, постери та слайдер" },
    sessions: { g: "Кіно", t: "Сеанси", i: "cal", sub: "Розклад показів за залами" },
    events: { g: "Кіно", t: "Події", i: "school", sub: "Кіноклуб, фестиваль, спецпокази" },
    halls: { g: "Кіно", t: "Зали", i: "team", sub: "Зали кінотеатру" },
    news: { g: "Записи", t: "Новини", i: "news", sub: "Публікації розділу «Новини»" },
    gallery: { g: "Записи", t: "Галерея", i: "image", sub: "Фото для галереї з лайтбоксом" },
    messages: { g: "Звернення", t: "Повідомлення", i: "mail", sub: "Листи з форми зворотного зв'язку" },
    regs: { g: "Звернення", t: "Бронювання", i: "ticket", sub: "Заброньовані квитки" },
    backup: { g: "Система", t: "Резервна копія", i: "db", sub: "Експорт, імпорт і скидання контенту" }
  };
  ["films", "sessions", "events", "news", "gallery", "halls"].forEach(function (k) { VIEWS[k].r = collectionView(k); });

  VIEWS.settings.r = objectView([
    { row: [{ k: "site.name", l: "Назва сайту", req: 1 }, { k: "site.sub", l: "Підзаголовок логотипа" }] },
    { k: "site.tagline", l: "Слоган (у футері)", t: "ta", rows: 2 },
    { k: "site.announcement", l: "Оголошення у верхній смузі", t: "ta", rows: 2, note: "Залиште порожнім, щоб приховати смугу." },
    { row: [{ k: "site.phone", l: "Телефон каси", req: 1 }, { k: "site.email", l: "E-mail", t: "email", req: 1 }] },
    { row: [{ k: "site.address", l: "Адреса", req: 1 }, { k: "site.instagram", l: "Instagram" }] },
    { k: "site.district", l: "Як знайти" },
    { row: [{ k: "site.lat", l: "Широта (карта)", t: "number" }, { k: "site.lon", l: "Довгота (карта)", t: "number" }] }
  ], [], "Налаштування сайту збережено");

  VIEWS.home.r = objectView([
    { k: "home.kicker", l: "Надзаголовок" },
    { k: "home.title", l: "Заголовок першого екрана", t: "ta", rows: 2, req: 1, note: "Слово в тегах <em>…</em> буде виділене золотим курсивом." },
    { k: "home.text", l: "Текст під заголовком", t: "ta", rows: 4 },
    { row: [{ k: "home.ctaPrimary", l: "Основна кнопка" }, { k: "home.ctaSecondary", l: "Друга кнопка" }] },
    { row: [{ k: "home.quote", l: "Цитата" }, { k: "home.quoteAuthor", l: "Автор цитати" }] }
  ], [{ title: "Лічильники", note: "Число, суфікс і підпис", path: "home.stats", cls: "r3", keys: [{ k: "n", ph: "Число", num: 1 }, { k: "suf", ph: "Суфікс" }, { k: "label", ph: "Підпис" }], blank: function () { return { n: 0, suf: "", label: "" }; }, add: "Додати лічильник" }],
    "Головну сторінку оновлено", function (t) {
      var h = t.home || {};
      return '<div class="preview-box" style="background:#1E070D;color:#F5E6C8"><div class="pv-k" style="color:#D4A84B">' + esc(h.kicker) + '</div><div class="pv-t" style="color:#F5E6C8">' + esc(h.title).replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/g, '<em style="color:#F1D88E;font-family:Cormorant Garamond,serif;font-style:italic">$1</em>') + '</div><p style="color:#BFA88A">' + esc(h.text) + "</p></div>";
    });

  VIEWS.about.r = objectView([
    { k: "about.lead", l: "Вступ", t: "ta", rows: 3 },
    { k: "about.story", l: "Історія", t: "html", rows: 12, note: "Абзаци розділяйте порожнім рядком." }
  ], [{ title: "Ціни на квитки", note: "Назва і ціна", path: "prices", cls: "", keys: [{ k: "name", ph: "Назва" }, { k: "price", ph: "Ціна" }], blank: function () { return { name: "", price: "" }; }, add: "Додати рядок" }], "Сторінку «Про кінотеатр» оновлено");
  VIEWS.nav.r = function (el) {
    var work = JSON.parse(JSON.stringify(C.nav));
    el.innerHTML = '<div class="form-cols"><div class="card"><div class="card-h"><div><h3>Пункти головного меню</h3><p>Порядок збігається з порядком у шапці сайту</p></div></div><div id="navRows"></div>' +
      '<div class="sticky-save"><button class="btn ghost" id="navUndo">Скасувати</button><button class="btn" id="navSave">' + I.save + 'Зберегти меню</button></div></div>' +
      '<div class="card"><h3 style="margin-bottom:10px">Підказка</h3><p style="color:var(--muted);margin:0 0 10px">Посилання вказуйте відносно сайту: <code>menu.html</code>, <code>events.html</code>, <code>about.html#komanda</code>. Можна додати й зовнішнє посилання.</p><p style="color:var(--muted);margin:0">Доступні сторінки: index, about, menu, events, news, contacts.</p></div></div>';
    rowsEditor($("#navRows"), work, [{ k: "label", ph: "Назва пункту" }, { k: "href", ph: "сторінка.html" }], "", function () { return { label: "Новий пункт", href: "index.html" }; }, "Додати пункт меню");
    $("#navUndo").addEventListener("click", function () { render(); });
    $("#navSave").addEventListener("click", function () {
      var clean = work.filter(function (n) { return String(n.label).trim() && String(n.href).trim(); });
      if (!clean.length) { toast("Меню не може бути порожнім", "err"); return; }
      C.nav = clean; commit("Меню навігації збережено (" + clean.length + " пунктів)");
    });
  };

  /* ---------- Повідомлення ---------- */
  VIEWS.messages.r = function (el) {
    var msgs = CMS.getMessages();
    el.innerHTML = '<div class="toolbar"><button class="btn ghost" id="readAll">' + I.check.replace('stroke-width="3"', 'stroke-width="2"') + "Позначити все прочитаним</button><span class=\"sp\"></span><span class=\"info\">Усього: " + msgs.length + " · нових: " + msgs.filter(function (m) { return !m.read; }).length + "</span></div>" +
      '<div class="tbl-wrap"><table><thead><tr><th>Відправник</th><th>Тема</th><th>Повідомлення</th><th>Отримано</th><th></th></tr></thead><tbody>' +
      msgs.map(function (m, i) {
        return '<tr data-i="' + i + '"' + (m.read ? "" : ' class="unread"') + '><td><div class="t-title">' + esc(m.name) + '</div><div class="t-sub">' + esc(m.email) + '</div></td><td><span class="badge">' + esc(m.topic) + '</span></td><td><div class="t-sub" style="max-width:360px">' + esc(m.text) + "</div></td><td>" + ago(m.t) + '</td><td class="acts"><button class="ib" data-a="open" aria-label="Відкрити">' + I.eye + '</button><button class="ib del" data-a="del" aria-label="Видалити">' + I.del + "</button></td></tr>";
      }).join("") + "</tbody></table>" + (msgs.length ? "" : '<div class="empty">Повідомлень поки немає. Вони з\'являться тут, щойно хтось заповнить форму на сторінці «Контакти».</div>') + "</div>";
    $("#readAll").addEventListener("click", function () { msgs.forEach(function (m) { m.read = true; }); CMS.setMessages(msgs); toast("Усі повідомлення прочитано"); render(); });
    $$("[data-a]", el).forEach(function (b) {
      b.addEventListener("click", function () {
        var i = +b.closest("tr").dataset.i, m = msgs[i];
        if (b.dataset.a === "del") return confirmBox("Видалити повідомлення від " + m.name + "?", function () { msgs.splice(i, 1); CMS.setMessages(msgs); CMS.log("Видалено повідомлення від " + m.name); toast("Повідомлення видалено"); render(); });
        m.read = true; CMS.setMessages(msgs); updateCounts();
        openModal(m.topic, '<p style="color:var(--muted);margin-top:0">' + esc(m.name) + " · " + esc(m.email) + " · " + fmtTime(m.t) + '</p><p style="white-space:pre-line;font-size:16px">' + esc(m.text) + "</p>",
          '<button class="btn ghost" data-close>Закрити</button><a class="btn" href="mailto:' + esc(m.email) + "?subject=" + encodeURIComponent("Re: " + m.topic) + '">' + I.reply + "Відповісти</a>");
        b.closest("tr").classList.remove("unread");
      });
    });
    applySearch();
  };

  VIEWS.regs.r = function (el) {
    var regs = CMS.getRegs();
    var sum = regs.reduce(function (s, r) { return s + (+r.sum || 0); }, 0);
    el.innerHTML = '<div class="toolbar"><span class="info">Бронювань: ' + regs.length + " · квитків: " + regs.reduce(function (s, r) { return s + (r.seats ? r.seats.length : 0); }, 0) + " · на суму " + sum.toLocaleString("uk-UA") + ' ₴</span><span class="sp"></span><a class="btn ghost sm" href="schedule.html" target="_blank" rel="noopener">' + I.ext + "Розклад на сайті</a></div>" +
      '<div class="tbl-wrap"><table><thead><tr><th>Глядач</th><th>Фільм і сеанс</th><th>Місця</th><th>Сума</th><th>Створено</th><th></th></tr></thead><tbody>' +
      regs.map(function (r, i) {
        return '<tr data-i="' + i + '"><td><div class="t-title">' + esc(r.name) + '</div><div class="t-sub">' + esc(r.phone) + '</div></td><td><div class="t-title">' + esc(r.film) + '</div><div class="t-sub">' + fmt(r.date) + ", " + esc(r.time) + " · " + esc(r.hall) + '</div></td><td><span class="badge sage">' + esc((r.seats || []).map(function (x) { return x.replace("-", "/"); }).join(", ")) + "</span></td><td><b>" + esc(r.sum) + " ₴</b></td><td>" + ago(r.t) + '</td><td class="acts"><a class="ib" href="tel:' + esc(String(r.phone).replace(/\s/g, "")) + '" aria-label="Зателефонувати">' + I.reply + '</a><button class="ib del" data-a="del" aria-label="Скасувати">' + I.del + "</button></td></tr>";
      }).join("") + "</tbody></table>" + (regs.length ? "" : '<div class="empty">Бронювань ще немає.</div>') + "</div>";
    $$("[data-a=del]", el).forEach(function (b) { b.addEventListener("click", function () { var i = +b.closest("tr").dataset.i; confirmBox("Скасувати бронювання " + regs[i].name + "?", function () { regs.splice(i, 1); CMS.setRegs(regs); toast("Бронювання скасовано"); render(); }, "Скасувати бронювання"); }); });
    applySearch();
  };
  VIEWS.backup.r = function (el) {
    var size = 0; try { size = (localStorage.getItem(CMS.KEY) || "").length; } catch (e) {}
    el.innerHTML = '<div class="dash3">' +
      '<div class="card"><h3>Експорт</h3><p style="color:var(--muted)">Завантажте весь контент сайту одним JSON-файлом — це ваша резервна копія.</p><button class="btn" id="exp">' + I.down + "Завантажити JSON</button></div>" +
      '<div class="card"><h3>Імпорт</h3><p style="color:var(--muted)">Відновіть контент із раніше збереженого файлу. Поточні зміни буде замінено.</p><label class="btn ghost" style="cursor:pointer">' + I.up + 'Обрати файл<input type="file" id="imp" accept="application/json,.json" class="sr"></label></div>' +
      '<div class="card"><h3>Скидання</h3><p style="color:var(--muted)">Повернути контент до стандартного з <code>js/content.js</code>. Зараз змінено: <b>' + (CMS.isModified() ? "так, " + (size / 1024).toFixed(1) + " КБ" : "ні") + '</b>.</p><button class="btn danger" id="rst">' + I.del + "Скинути до стандартного</button></div></div>" +
      '<div class="card" style="margin-top:22px"><div class="card-h"><div><h3>Журнал дій</h3><p>Останні 40 змін</p></div><button class="btn ghost sm" id="clrLog">Очистити журнал</button></div><ul class="feed" id="fullLog"></ul></div>';
    $("#fullLog").innerHTML = feedHTML(CMS.getLog());
    $("#exp").addEventListener("click", function () {
      var blob = new Blob([JSON.stringify(C, null, 2)], { type: "application/json" }), a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "zerno-i-para-content-" + TODAY + ".json"; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      CMS.log("Експортовано резервну копію", "db"); toast("Резервну копію завантажено");
    });
    $("#imp").addEventListener("change", function (e) {
      var f = e.target.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        try { var data = JSON.parse(rd.result); if (!data.site || !data.nav) throw new Error("bad"); C = CMS.load(); Object.keys(data).forEach(function (k) { C[k] = data[k]; }); commit("Контент імпортовано з файлу"); render(); }
        catch (err) { toast("Файл не схожий на резервну копію сайту", "err"); }
      };
      rd.readAsText(f);
    });
    $("#rst").addEventListener("click", function () { confirmBox("Скинути весь контент до стандартного? Ваші зміни буде втрачено.", function () { CMS.reset(); C = CMS.load(); CMS.log("Контент скинуто до стандартного", "db"); toast("Контент скинуто"); render(); updateSaveState(); updateCounts(); }, "Скинути"); });
    $("#clrLog").addEventListener("click", function () { CMS.clearLog(); render(); });
  };

  /* ---------- Дашборд ---------- */
  function feedHTML(log) {
    if (!log.length) return '<li><span class="dot">' + I.check + "</span><div>Змін ще не було. Відредагуйте будь-який розділ — і запис з'явиться тут.</div></li>";
    return log.slice(0, 40).map(function (l) { return '<li><span class="dot">' + (I[l.icon] || I.edit) + "</span><div>" + esc(l.text) + "<time>" + ago(l.t) + "</time></div></li>"; }).join("");
  }
  VIEWS.dashboard.r = function (el) {
    var h = new Date().getHours(), greet = h < 12 ? "Доброго ранку" : (h < 18 ? "Добрий день" : "Добрий вечір");
    var d = new Date();
    var todayS = C.sessions.filter(function (s) { return s.date === TODAY; });
    var weekEnd = iso(new Date(Date.now() + 7 * 864e5));
    var weekS = C.sessions.filter(function (s) { return s.date >= TODAY && s.date < weekEnd; });
    var upE = C.events.filter(function (e) { return e.date >= TODAY; }).sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
    var msgs = CMS.getMessages(), unread = msgs.filter(function (m) { return !m.read; }).length, regs = CMS.getRegs();
    var tickets = regs.reduce(function (s, r) { return s + (r.seats ? r.seats.length : 0); }, 0), revenue = regs.reduce(function (s, r) { return s + (+r.sum || 0); }, 0);
    var kp = [
      ["films", "slides", C.films.length, "фільми в афіші", C.films.filter(function (f) { return f.featured; }).length + " у слайдері"],
      ["sessions", "cal", todayS.length, "сеанси сьогодні", weekS.length + " за тиждень"],
      ["events", "school", upE.length, "майбутні події", ""],
      ["regs", "ticket", tickets, "заброньовані квитки", revenue ? revenue.toLocaleString("uk-UA") + " ₴" : ""],
      ["messages", "mail", msgs.length, "вхідні повідомлення", unread ? "нових: " + unread : "", unread],
      ["news", "news", C.news.length, "новини на сайті", ""]
    ];
    el.innerHTML =
      '<div class="welcome"><div><span class="hand">' + greet + ", Максиме!</span><h2>Що сьогодні в «" + esc(C.site.name) + "»?</h2><p>" + d.getDate() + " " + MONTHS_G[d.getMonth()] + ": " + todayS.length + " " + (todayS.length === 1 ? "сеанс" : "сеансів") + " у розкладі" + (upE[0] ? ". Найближча подія — «" + esc(upE[0].title) + "», " + fmt(upE[0].date) + "." : ".") + "</p></div>" +
      '<div class="acts"><button class="btn" data-go="films" data-add="1">' + I.plus + 'Фільм</button><button class="btn dark" data-go="sessions" data-add="1">' + I.plus + 'Сеанс</button><button class="btn dark" data-go="news" data-add="1">' + I.plus + 'Новина</button><a class="btn ghost" href="index.html" target="_blank" rel="noopener">' + I.ext + "Сайт</a></div></div>" +
      '<div class="kpis">' + kp.map(function (k) { return '<div class="kpi" data-go="' + k[0] + '" tabindex="0" role="button"><div class="ic">' + I[k[1]] + "</div><b>" + k[2] + "</b><span>" + k[3] + "</span>" + (k[4] ? '<small class="' + (k[5] ? "warn" : "") + '">' + k[4] + "</small>" : "") + "</div>"; }).join("") + "</div>" +
      '<div class="dash"><div class="card"><div class="card-h"><div><h3>Сеанси на 7 днів</h3><p>Кількість показів у розкладі за днями</p></div><button class="btn ghost sm" data-go="sessions">Розклад</button></div><div class="chart" id="sChart"></div></div>' +
      '<div class="card"><div class="card-h"><div><h3>Сеанси за фільмами</h3><p>Найближчі 14 днів, топ-6</p></div><button class="btn ghost sm" data-go="films">Фільми</button></div><div class="hbars" id="fBars"></div></div></div>' +
      '<div class="dash3"><div class="card"><div class="card-h"><h3>Сьогодні в залах</h3></div><div id="miniS"></div></div>' +
      '<div class="card"><div class="card-h"><h3>Нові повідомлення</h3><button class="btn ghost sm" data-go="messages">Усі</button></div><ul class="feed" id="miniMsg"></ul></div>' +
      '<div class="card"><div class="card-h"><h3>Остання активність</h3><button class="btn ghost sm" data-go="backup">Журнал</button></div><ul class="feed" id="miniLog"></ul></div></div>';
    // стовпчикова діаграма — сеанси за днями
    var days = [];
    for (var i = 0; i < 7; i++) { var dd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i), k = iso(dd); days.push({ k: k, d: dd, list: C.sessions.filter(function (s) { return s.date === k; }) }); }
    var max = Math.max(4, Math.max.apply(null, days.map(function (x) { return x.list.length; }))), W = 600, H = 230, pl = 30, pb = 30, pt = 20, bw = 44, step = (W - pl) / 7;
    var WDs = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Кількість сеансів за днями">';
    var gstep = Math.ceil(max / 4);
    for (var g = 0; g <= max; g += gstep) { var gy = H - pb - (H - pb - pt) * g / max; svg += '<line class="gl" x1="' + pl + '" x2="' + W + '" y1="' + gy + '" y2="' + gy + '"/><text class="ax" x="' + (pl - 8) + '" y="' + (gy + 4) + '" text-anchor="end">' + g + "</text>"; }
    days.forEach(function (m, k) {
      var x = pl + step * k + (step - bw) / 2, hh = (H - pb - pt) * m.list.length / max, y = H - pb - hh;
      svg += '<g class="b" tabindex="0" data-k="' + k + '"><rect class="bar-hit" x="' + (pl + step * k) + '" y="' + pt + '" width="' + step + '" height="' + (H - pb - pt) + '"/>' +
        (hh ? '<path class="bar" d="M' + x + "," + (H - pb) + " V" + (y + 4) + " q0,-4 4,-4 h" + (bw - 8) + " q4,0 4,4 V" + (H - pb) + 'Z"/>' : "") +
        (m.list.length ? '<text class="val" x="' + (x + bw / 2) + '" y="' + (y - 7) + '" text-anchor="middle">' + m.list.length + "</text>" : "") +
        '<text class="ax" x="' + (x + bw / 2) + '" y="' + (H - 9) + '" text-anchor="middle">' + WDs[m.d.getDay()] + " " + m.d.getDate() + "</text></g>";
    });
    svg += '<line x1="' + pl + '" x2="' + W + '" y1="' + (H - pb) + '" y2="' + (H - pb) + '" stroke="#D9CBB8"/></svg><div class="tip" id="sTip"></div>';
    var ch = $("#sChart"); ch.innerHTML = svg;
    $$("g.b", ch).forEach(function (gEl) {
      function show() {
        var m = days[+gEl.dataset.k], tip = $("#sTip"), r = gEl.querySelector(".bar-hit").getBoundingClientRect(), cr = ch.getBoundingClientRect(), bar = gEl.querySelector(".bar"), br = bar ? bar.getBoundingClientRect() : r;
        var big = m.list.filter(function (s) { return s.hall === "Великий зал"; }).length;
        tip.innerHTML = "<b>" + m.d.getDate() + " " + MONTHS_G[m.d.getMonth()] + "</b> · сеансів: " + m.list.length + "<br>Великий зал: " + big + " · Камерна зала: " + (m.list.length - big);
        tip.style.left = (r.left + r.width / 2 - cr.left) + "px"; tip.style.top = (br.top - cr.top + (bar ? 0 : r.height)) + "px"; tip.classList.add("show");
      }
      gEl.addEventListener("mouseenter", show); gEl.addEventListener("focus", show);
      gEl.addEventListener("mouseleave", function () { $("#sTip").classList.remove("show"); }); gEl.addEventListener("blur", function () { $("#sTip").classList.remove("show"); });
    });
    var cnt = C.films.map(function (f) { return [f.title, C.sessions.filter(function (s) { return s.filmId === f.id && s.date >= TODAY && s.date <= in14; }).length]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 6);
    var cmax = Math.max.apply(null, cnt.map(function (c) { return c[1]; }).concat([1]));
    $("#fBars").innerHTML = cnt.map(function (c, i) { return '<div class="hbar"><span title="' + esc(c[0]) + '" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(c[0]) + '</span><div class="tr"><i style="width:' + (c[1] / cmax * 100) + "%;animation-delay:" + i * .08 + 's"></i></div><b>' + c[1] + "</b></div>"; }).join("");
    $("#miniS").innerHTML = todayS.sort(function (a, b) { return a.time.localeCompare(b.time); }).slice(0, 5).map(function (s) { return '<div class="mini-ev"><div class="d"><b>' + s.time.split(":")[0] + "</b>:" + s.time.split(":")[1] + "</div><div><p>" + esc(filmTitle(s.filmId)) + "</p><small>" + esc(s.hall) + " · " + esc(s.format) + " · " + s.price + " ₴</small></div></div>"; }).join("") || '<div class="empty">Сьогодні сеансів немає</div>';
    $("#miniMsg").innerHTML = msgs.slice(0, 4).map(function (m) { return '<li><span class="dot" style="' + (m.read ? "" : "background:var(--terra-bg);color:var(--terra-d)") + '">' + I.mail + "</span><div><b>" + esc(m.name) + "</b> · " + esc(m.topic) + '<div class="t-sub">' + esc(m.text) + "</div><time>" + ago(m.t) + "</time></div></li>"; }).join("") || '<li class="empty">Повідомлень немає</li>';
    $("#miniLog").innerHTML = feedHTML(CMS.getLog().slice(0, 5));
  };
  function avg(a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : 0; }

  /* ==========================================================
     КАРКАС, НАВІГАЦІЯ, ВХІД
     ========================================================== */
  var current = "dashboard";
  function authed() { try { return sessionStorage.getItem(AUTH) === "1"; } catch (e) { return false; } }
  if (SHOT && params.get("auth") === "1") { try { sessionStorage.setItem(AUTH, "1"); } catch (e) {} }

  function loginScreen() {
    root.innerHTML = '<div class="login"><div class="login-art"><img class="bg" src="img/projector.svg" alt=""><div class="l-brand">' + MARK + "<span>" + esc(C.site.name) + '</span></div><div><h1>Панель керування сайтом</h1><p>Редагуйте новини, меню, події та тексти сторінок — зміни одразу з\'являться на сайті кінотеатру.</p></div><small>© 2026 Максим Вознюк · міні-CMS «Ліхтар»</small></div>' +
      '<div class="login-form"><form class="l-card" id="lf" novalidate><h2>Вхід</h2><p>Увійдіть, щоб керувати контентом.</p>' +
      '<div class="hint">' + I.info + '<span>Демо-доступ: логін <b>admin</b>, пароль <b>admin123</b></span><button type="button" class="btn ghost sm" id="fill">Заповнити</button></div>' +
      '<div class="fld"><label for="lu">Логін</label><input id="lu" autocomplete="username" placeholder="admin"></div><div class="fld"><label for="lp">Пароль</label><input id="lp" type="password" autocomplete="current-password" placeholder="••••••••"></div>' +
      '<div class="l-err" id="lerr" role="alert"></div><button class="btn" style="width:100%;justify-content:center;padding:13px" type="submit">Увійти ' + I.out.replace("M15 4h4", "M15 4h4") + '</button><p style="margin-top:22px;text-align:center"><a href="index.html" style="color:var(--terra);font-weight:700">← Повернутися на сайт</a></p></form></div></div>';
    $("#fill").addEventListener("click", function () { $("#lu").value = "admin"; $("#lp").value = "admin123"; $("#lp").focus(); });
    $("#lf").addEventListener("submit", function (e) {
      e.preventDefault();
      if ($("#lu").value.trim() === "admin" && $("#lp").value === "admin123") {
        try { sessionStorage.setItem(AUTH, "1"); } catch (err) {}
        CMS.log("Вхід в адмін-панель", "out");
        boot(); toast("Вітаємо, Максиме! Ви увійшли в панель керування");
      } else {
        var c = $("#lf"); c.classList.remove("err"); void c.offsetWidth; c.classList.add("err");
        $("#lerr").textContent = "Невірний логін або пароль. Підказка — над формою.";
      }
    });
  }

  function seedDemo() {
    var flag = "lx_cms_seeded_v1";
    try { if (localStorage.getItem(flag)) return; localStorage.setItem(flag, "1"); } catch (e) { return; }
    var now = Date.now();
    if (!CMS.getMessages().length) {
      CMS.setMessages([
        { id: "d1", t: new Date(now - 3 * 3600e3).toISOString(), read: false, name: "Ольга Мельничук", email: "olha.melnychuk@gmail.com", topic: "Оренда зали", text: "Добрий день! Хочемо орендувати Камерну залу на 30 людей для корпоративного перегляду документального фільму 20 листопада. Чи можливо і скільки це коштуватиме?" },
        { id: "d2", t: new Date(now - 28 * 3600e3).toISOString(), read: false, name: "Назар Ткачук", email: "nazar.tkachuk@gmail.com", topic: "Заявка на фестиваль", text: "Я студент КНУКіМ, зняв 12-хвилинну короткометражку про Луцьк. Чи можна ще подати її на «Світлячок»?" },
        { id: "d3", t: new Date(now - 4 * 86400e3).toISOString(), read: true, name: "Ірина", email: "iryna.lutsk@gmail.com", topic: "Відгук або пропозиція", text: "Дякую за ретроспективу Вереса! Показ з плівки — це магія. Чекаємо ще!" }
      ]);
    }
    if (!CMS.getRegs().length) {
      CMS.setRegs([
        { id: "r1", t: new Date(now - 5 * 3600e3).toISOString(), session: "s1", film: "Сади Любарта", date: "2026-10-24", time: "19:30", hall: "Великий зал", seats: ["5-7", "5-8"], sum: 380, name: "Андрій Ковальчук", phone: "+380 67 555 12 34" },
        { id: "r2", t: new Date(now - 30 * 3600e3).toISOString(), session: "s2", film: "Паперові літаки", date: "2026-10-25", time: "12:00", hall: "Великий зал", seats: ["3-4", "3-5", "3-6"], sum: 360, name: "Марія Савчук", phone: "+380 93 101 20 30" }
      ]);
    }
  }

  function updateSaveState() { var s = $("#saveState"); if (!s) return; var m = CMS.isModified(); s.classList.toggle("mod", m); s.innerHTML = "<i></i>" + (m ? "Контент змінено · збережено локально" : "Стандартний контент"); }
  function updateCounts() {
    var cnt = { news: C.news.length, events: C.events.filter(function (e) { return e.date >= TODAY; }).length, films: C.films.length, sessions: C.sessions.filter(function (s) { return s.date === TODAY; }).length, gallery: C.gallery.length, messages: CMS.getMessages().filter(function (m) { return !m.read; }).length, regs: CMS.getRegs().length };
    Object.keys(cnt).forEach(function (k) { var e = $('.s-link[data-v="' + k + '"] .cnt'); if (e) { e.textContent = cnt[k]; e.style.display = cnt[k] || k !== "messages" ? "" : "none"; e.classList.toggle("hot", k === "messages" && cnt[k] > 0); } });
  }
  function applySearch() {
    var q = ($("#q") && $("#q").value || "").trim().toLowerCase();
    $$(".content tbody tr, .content .g-card").forEach(function (r) { r.style.display = !q || r.textContent.toLowerCase().indexOf(q) > -1 ? "" : "none"; });
  }

  function boot() {
    if (!authed()) return loginScreen();
    seedDemo();
    var groups = {};
    Object.keys(VIEWS).forEach(function (k) { (groups[VIEWS[k].g] = groups[VIEWS[k].g] || []).push(k); });
    root.innerHTML = '<div class="app"><aside class="side" aria-label="Розділи адмін-панелі"><div class="l-brand">' + MARK + "<span>" + esc(C.site.name) + "<small>панель керування</small></span></div>" +
      Object.keys(groups).map(function (g) { return '<div class="s-group">' + g + "</div>" + groups[g].map(function (k) { return '<button class="s-link" data-v="' + k + '">' + I[VIEWS[k].i] + "<span>" + VIEWS[k].t + "</span>" + (["news", "events", "films", "sessions", "gallery", "messages", "regs"].indexOf(k) > -1 ? '<span class="cnt"></span>' : "") + "</button>"; }).join(""); }).join("") +
      '<div class="me"><span class="av">МВ</span><div><b>Максим Вознюк</b><small>адміністратор</small></div><button id="logout" aria-label="Вийти" title="Вийти">' + I.out + "</button></div></aside>" +
      '<div class="main"><header class="top"><button class="burger-a" id="sideBtn" aria-label="Меню">' + I.bars + '</button><div><div class="crumb" id="crumb"></div><h1 id="vTitle"></h1></div><span class="sp"></span><span class="save-state" id="saveState"></span>' +
      '<div class="search">' + I.search + '<input id="q" type="search" placeholder="Пошук у таблиці…" aria-label="Пошук"></div><a class="btn dark" href="index.html" target="_blank" rel="noopener">' + I.ext + 'Переглянути сайт</a></header><div class="content" id="view"></div></div></div>';
    $$(".s-link").forEach(function (b) { b.addEventListener("click", function () { go(b.dataset.v); document.body.classList.remove("nav-open"); }); });
    $("#logout").addEventListener("click", function () { try { sessionStorage.removeItem(AUTH); } catch (e) {} CMS.log("Вихід з адмін-панелі", "out"); loginScreen(); });
    $("#sideBtn").addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
    $("#q").addEventListener("input", applySearch);
    var h = location.hash.slice(1) || params.get("view");
    go(VIEWS[h] ? h : "dashboard");
    updateSaveState(); updateCounts();
  }
  function go(v) {
    current = v;
    if (location.hash.slice(1) !== v) history.replaceState(null, "", "#" + v);
    render();
  }
  function render() {
    C = CMS.load();
    var v = VIEWS[current];
    $$(".s-link").forEach(function (b) { b.classList.toggle("on", b.dataset.v === current); });
    $("#vTitle").textContent = v.t; $("#crumb").textContent = "Панель · " + v.g + " · " + v.sub;
    document.title = v.t + " — адмін-панель " + C.site.name;
    var el = $("#view"); el.style.animation = "none"; void el.offsetWidth; el.style.animation = "";
    if ($("#q")) $("#q").value = "";
    v.r(el);
    $$("[data-go]", el).forEach(function (b) {
      function act() { go(b.dataset.go); if (b.dataset.add && COLL[b.dataset.go]) editItem(COLL[b.dataset.go], null, function () { render(); }); }
      b.addEventListener("click", act);
      b.addEventListener("keydown", function (e) { if (e.key === "Enter") act(); });
    });
    updateCounts();
  }
  window.addEventListener("hashchange", function () { var h = location.hash.slice(1); if (VIEWS[h] && h !== current && authed()) go(h); });
  boot();
})();

