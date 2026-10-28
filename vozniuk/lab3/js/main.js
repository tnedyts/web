/* ==========================================================
   Арт-кінотеатр «Ліхтар» — логіка публічного сайту
   Рендер контенту з CMS, слайдер афіш, афіша, розклад-календар,
   бронювання місць, галерея, карта, форми.  © 2026 Максим Вознюк
   ========================================================== */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var params = new URLSearchParams(location.search);
  var SHOT = document.documentElement.classList.contains("shot");
  var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var C = window.CMS ? CMS.load() : window.DEFAULT_CONTENT;

  var P = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  var ICO = {
    arrow: '<svg viewBox="0 0 24 24" ' + P + '><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" ' + P + '><path d="M15 6l-6 6 6 6"/></svg>',
    right: '<svg viewBox="0 0 24 24" ' + P + '><path d="M9 6l6 6-6 6"/></svg>',
    up: '<svg viewBox="0 0 24 24" ' + P + '><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" ' + P + '><path d="M6 6l12 12M18 6L6 18"/></svg>',
    pin: '<svg viewBox="0 0 24 24" ' + P + '><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    phone: '<svg viewBox="0 0 24 24" ' + P + '><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" ' + P + '><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" ' + P + '><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    search: '<svg viewBox="0 0 24 24" ' + P + '><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    screen: '<svg viewBox="0 0 24 24" ' + P + '><rect x="2" y="4" width="20" height="12" rx="1"/><path d="M6 20h12M9 16l-1 4M15 16l1 4"/></svg>',
    sofa: '<svg viewBox="0 0 24 24" ' + P + '><path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3"/><path d="M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2z"/><path d="M5 18v2M19 18v2"/></svg>',
    star: '<svg viewBox="0 0 24 24" ' + P + '><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>'
  };
  var MARK = '<svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#2C0B14" stroke="#D4A84B" stroke-width="1.5"/><circle class="glow" cx="32" cy="33" r="16" fill="#FFE3A6" opacity=".25"/><path d="M24 14h16l-2 6H26z" fill="#D4A84B"/><rect x="23" y="20" width="18" height="24" rx="6" fill="#FFE3A6"/><path d="M23 28h18M23 36h18M32 20v24" stroke="#D4A84B" stroke-width="1.6"/><rect x="27" y="44" width="10" height="5" rx="1" fill="#D4A84B"/></svg>';

  var MG = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
  var MN = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
  var MS = ["січ", "лют", "бер", "кві", "тра", "чер", "лип", "сер", "вер", "жов", "лис", "гру"];
  var WD = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
  var WF = ["неділя", "понеділок", "вівторок", "середа", "четвер", "п'ятниця", "субота"];
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parse(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmt(s) { var d = parse(s); return d.getDate() + " " + MG[d.getMonth()] + " " + d.getFullYear(); }
  function get(o, p) { return p.split(".").reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  var TODAY = iso(new Date());
  var NOWT = pad(new Date().getHours()) + ":" + pad(new Date().getMinutes());
  function filmById(id) { return C.films.filter(function (f) { return f.id === id; })[0]; }
  function poster(f, uid) { return window.posterSVG ? posterSVG(f, { uid: uid }) : ""; }
  function plural(n, a, b, c) { var m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : (m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c); }

  /* ---------- Reveal ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
  }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }) : null;
  function observe(root) { $$(".reveal,.reveal-l,.reveal-r,.reveal-s", root).forEach(function (n) { if (SHOT || !io) n.classList.add("in"); else io.observe(n); }); }

  /* ---------- Прив'язки CMS ---------- */
  $$("[data-cms]").forEach(function (el) { var v = get(C, el.dataset.cms); if (v != null) el.textContent = v; });
  $$("[data-cms-html]").forEach(function (el) { var v = get(C, el.dataset.cmsHtml); if (v != null) el.innerHTML = v; });
  $$("[data-brand]").forEach(function (el) { el.insertAdjacentHTML("afterbegin", MARK); });
  document.title = document.title.replace("Ліхтар", C.site.name);

  /* ---------- Навігація ---------- */
  var file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  var nav = $("#nav");
  if (nav) nav.innerHTML = C.nav.map(function (n) { var f = String(n.href).split(/[#?]/)[0].toLowerCase(); return '<a href="' + esc(n.href) + '"' + (f === file ? ' class="active" aria-current="page"' : "") + ">" + esc(n.label) + "</a>"; }).join("");
  var burger = $("#burger");
  if (burger) burger.addEventListener("click", function () { var o = document.body.classList.toggle("menu-open"); burger.setAttribute("aria-expanded", o); });
  if (nav) nav.addEventListener("click", function (e) { if (e.target.tagName === "A") document.body.classList.remove("menu-open"); });

  var ann = $("#announce");
  if (ann) {
    var closed = false; try { closed = sessionStorage.getItem("lx_ann") === C.site.announcement; } catch (e) {}
    if (!C.site.announcement || closed) ann.classList.add("hide");
    else {
      ann.innerHTML = "<span>" + esc(C.site.announcement) + '</span><button class="x" aria-label="Закрити оголошення">×</button>';
      $(".x", ann).addEventListener("click", function () { ann.classList.add("hide"); try { sessionStorage.setItem("lx_ann", C.site.announcement); } catch (e) {} });
    }
  }

  /* ---------- Футер ---------- */
  var footer = $("#footer");
  if (footer) footer.innerHTML = '<div class="container"><div class="credits reveal"><small>кінець фільму · дякуємо за перегляд</small><b>' + esc(C.site.name) + '</b><small>' + esc(C.site.sub) + "</small></div>" +
    '<div class="f-grid"><div><a class="brand" href="index.html">' + MARK + "<span><b>" + esc(C.site.name) + "</b><small>" + esc(C.site.sub) + '</small></span></a><p style="margin-top:18px;max-width:330px">' + esc(C.site.tagline) + ".</p></div>" +
    "<div><h4>Сторінки</h4><ul>" + C.nav.map(function (n) { return '<li><a href="' + esc(n.href) + '">' + esc(n.label) + "</a></li>"; }).join("") + "</ul></div>" +
    "<div><h4>Каса</h4><ul><li>Щодня 11:00 – 23:00</li><li>Онлайн-бронювання 24/7</li><li>Квитки: від 120 ₴</li><li>Студентам −30 %</li></ul></div>" +
    "<div><h4>Контакти</h4><ul><li>" + esc(C.site.address) + '</li><li><a href="tel:' + esc(C.site.phone.replace(/\s/g, "")) + '">' + esc(C.site.phone) + '</a></li><li><a href="mailto:' + esc(C.site.email) + '">' + esc(C.site.email) + "</a></li><li>" + esc(C.site.instagram) + "</li></ul></div></div>" +
    '<div class="f-bottom"><span>© 2026 Максим Вознюк · ' + esc(C.site.name) + '</span><span>Сайт працює на власній міні-CMS · <a href="admin.html">Вхід для адміністратора</a></span></div></div>';

  var toTop = document.createElement("button"); toTop.className = "to-top"; toTop.setAttribute("aria-label", "Нагору"); toTop.innerHTML = ICO.up; document.body.appendChild(toTop);
  toTop.addEventListener("click", function () { scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" }); });
  var header = $("#header");
  function onScroll() { if (header) header.classList.toggle("scrolled", scrollY > 30); toTop.classList.toggle("show", scrollY > 700); }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- Прелоадер-відлік ---------- */
  var pre = $("#preloader");
  if (pre) {
    if (SHOT) pre.classList.add("done");
    else {
      var cd = $("b", pre), k = 3;
      var ti = setInterval(function () { k--; if (k > 0) cd.textContent = k; else { clearInterval(ti); pre.classList.add("done"); } }, 280);
      setTimeout(function () { pre.classList.add("done"); }, 1000);
    }
  }
  /* ---------- Перехід «діафрагма» ---------- */
  var iris = document.createElement("div"); iris.className = "iris"; document.body.appendChild(iris);
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank" || REDUCED || SHOT) return;
    var href = a.getAttribute("href");
    if (!/\.html/.test(href) || /^https?:/.test(href) || (href.split(/[#?]/)[0].toLowerCase() === file && href.indexOf("#") > -1)) return;
    e.preventDefault(); iris.classList.add("in"); setTimeout(function () { location.href = href; }, 420);
  });
  addEventListener("pageshow", function () { iris.classList.remove("in"); });
  document.addEventListener("pointerdown", function (e) {
    var b = e.target.closest && e.target.closest(".btn"); if (!b || REDUCED) return;
    var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), sp = document.createElement("span");
    sp.className = "ripple"; sp.style.width = sp.style.height = s + "px"; sp.style.left = e.clientX - r.left - s / 2 + "px"; sp.style.top = e.clientY - r.top - s / 2 + "px";
    b.appendChild(sp); setTimeout(function () { sp.remove(); }, 650);
  });

  /* ---------- Пил у промені проектора ---------- */
  var dust = $("#dust");
  if (dust && dust.getContext && !REDUCED) {
    var dc = dust.getContext("2d"), parts = [], DW, DH;
    function size() { DW = dust.width = dust.offsetWidth; DH = dust.height = dust.offsetHeight; }
    size(); addEventListener("resize", size);
    for (var i = 0; i < 90; i++) parts.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.8 + .3, v: Math.random() * .0006 + .0002, p: Math.random() * 6 });
    (function loop(t) {
      dc.clearRect(0, 0, DW, DH);
      parts.forEach(function (q) {
        q.y -= q.v; q.x += Math.sin(t / 2000 + q.p) * .0004; if (q.y < 0) q.y = 1;
        // всередині конуса променя (від правого нижнього кута)
        var dx = DW - q.x * DW, dy = DH - q.y * DH, ang = Math.atan2(dy, dx) * 180 / Math.PI;
        var inBeam = ang > 12 && ang < 34, a = inBeam ? .75 : .12;
        dc.fillStyle = "rgba(255,227,166," + (a * (.5 + .5 * Math.sin(t / 500 + q.p))) + ")";
        dc.beginPath(); dc.arc(q.x * DW, q.y * DH, q.r, 0, 7); dc.fill();
      });
      if (!SHOT) requestAnimationFrame(loop);
    })(0);
  }

  /* ---------- Сеанси ---------- */
  function sessionsOf(date) { return C.sessions.filter(function (s) { return s.date === date; }).sort(function (a, b) { return a.time.localeCompare(b.time); }); }
  function upcomingSessions(fid) { return C.sessions.filter(function (s) { return s.filmId === fid && (s.date > TODAY || (s.date === TODAY && s.time >= NOWT)); }).sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); }); }
  var nowEl = $("#nowShowing");
  if (nowEl) {
    var nxt = C.sessions.filter(function (s) { return s.date > TODAY || (s.date === TODAY && s.time >= NOWT); }).sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); })[0];
    var nf = nxt && filmById(nxt.filmId);
    if (nf) nowEl.innerHTML = '<i></i><span>Найближчий сеанс: <b>' + esc(nf.title) + "</b> · " + (nxt.date === TODAY ? "сьогодні" : fmt(nxt.date)) + " о " + esc(nxt.time) + '</span><button class="btn sm" data-book="' + nxt.id + '">Квиток</button>';
    else nowEl.remove();
  }

  /* ---------- Слайдер афіш ---------- */
  var slider = $("#slider");
  if (slider) {
    var feat = C.films.filter(function (f) { return f.featured; });
    if (!feat.length) feat = C.films.slice(0, 4);
    slider.innerHTML = '<div class="slides">' + feat.map(function (f, i) {
      var nx = upcomingSessions(f.id)[0];
      return '<div class="slide' + (i ? "" : " active") + '" role="group" aria-roledescription="слайд" aria-label="' + (i + 1) + " з " + feat.length + '"><div class="bgblur" aria-hidden="true">' + poster(f, "b" + i) + '</div><div class="s-poster">' + poster(f, "s" + i) + "</div>" +
        '<div class="s-txt"><div class="meta-row"><span class="chip-s f">' + esc(f.genre) + '</span><span class="chip-s">' + esc(f.year) + '</span><span class="chip-s">' + esc(f.duration) + ' хв</span><span class="chip-s">' + esc(f.age) + '</span><span class="chip-s">★ ' + esc(f.rating) + "</span></div>" +
        "<h3>" + esc(f.title) + '</h3><p class="tagline">' + esc(f.tagline) + "</p>" +
        '<p class="next-s">' + (nx ? "Найближчий сеанс: <b>" + fmt(nx.date) + ", " + nx.time + "</b> · " + esc(nx.hall) : "Сеанси незабаром") + '</p><div style="display:flex;gap:12px;flex-wrap:wrap">' + (nx ? '<button class="btn" data-book="' + nx.id + '">Купити квиток ' + ICO.arrow + "</button>" : "") + '<button class="btn ghost" data-film="' + f.id + '">Про фільм</button></div></div></div>';
    }).join("") + '</div><span class="slide-num" id="slideNum"></span><div class="slider-ctrl"><div class="dots">' + feat.map(function (f, i) { return '<button aria-label="Слайд ' + (i + 1) + '"><i></i></button>'; }).join("") + '</div><button class="arrow" data-dir="-1" aria-label="Попередній">' + ICO.left + '</button><button class="arrow" data-dir="1" aria-label="Наступний">' + ICO.right + "</button></div>";
    var sl = $$(".slide", slider), dots = $$(".dots button", slider), cur = 0, tm = null, DUR = 6000;
    slider.style.setProperty("--dur", DUR / 1000 + "s");
    function go(n) {
      sl[cur].classList.remove("active"); cur = (n + sl.length) % sl.length; sl[cur].classList.add("active");
      dots.forEach(function (d, i) { d.classList.remove("on"); d.classList.toggle("seen", i < cur); void d.offsetWidth; if (i === cur) d.classList.add("on"); });
      $("#slideNum").textContent = pad(cur + 1) + " / " + pad(sl.length); restart();
    }
    function restart() { clearTimeout(tm); if (!SHOT && !REDUCED) tm = setTimeout(function () { go(cur + 1); }, DUR); }
    $$(".arrow", slider).forEach(function (b) { b.addEventListener("click", function () { go(cur + +b.dataset.dir); }); });
    dots.forEach(function (d, i) { d.addEventListener("click", function () { go(i); }); });
    slider.addEventListener("mouseenter", function () { clearTimeout(tm); slider.classList.add("paused"); });
    slider.addEventListener("mouseleave", function () { slider.classList.remove("paused"); restart(); });
    var sx = null;
    slider.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener("touchend", function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 45) go(cur + (dx < 0 ? 1 : -1)); sx = null; });
    slider.tabIndex = 0; slider.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") go(cur - 1); if (e.key === "ArrowRight") go(cur + 1); });
    go(0);
  }

  /* ---------- Лічильники ---------- */
  var stats = $("#stats");
  if (stats) stats.innerHTML = C.home.stats.map(function (s, i) { return '<div class="stat reveal" style="--d:' + i * .1 + 's"><b><span data-count="' + (+s.n || 0) + '">0</span>' + esc(s.suf) + "</b><span>" + esc(s.label) + "</span></div>"; }).join("");

  /* ---------- Картки фільмів ---------- */
  function filmCard(f, i) {
    var up = upcomingSessions(f.id).slice(0, 3);
    return '<button class="film reveal" style="--d:' + (i % 4) * .08 + 's" data-film="' + f.id + '" data-genre="' + esc(f.genre) + '" aria-label="' + esc(f.title) + '"><div class="ph">' + poster(f, "c" + i) + '<span class="rate">★ ' + esc(f.rating) + "</span></div><h3>" + esc(f.title) + '</h3><span class="fm">' + esc(f.genre) + " · " + esc(f.duration) + " хв · " + esc(f.age) + '</span><div class="times">' + up.map(function (s) { return '<span class="time">' + (s.date === TODAY ? "" : parse(s.date).getDate() + " " + MS[parse(s.date).getMonth()] + " · ") + s.time + "</span>"; }).join("") + "</div></button>";
  }
  var fg = $("#filmGrid");
  if (fg) {
    var lim = +fg.dataset.limit || 0, list = C.films.slice();
    if (lim) list = list.filter(function (f) { return upcomingSessions(f.id).length; }).slice(0, lim);
    fg.innerHTML = list.map(filmCard).join("");
    var gfil = $("#genreFilter"), fq = $("#filmSearch"), curG = "all", q = "";
    function applyF() {
      var n = 0;
      $$(".film", fg).forEach(function (el) {
        var f = filmById(el.dataset.film), ok = (curG === "all" || f.genre === curG) && (!q || (f.title + f.director + f.genre).toLowerCase().indexOf(q) > -1);
        el.classList.toggle("hide", !ok); if (ok) n++;
      });
      var em = $("#filmEmpty"); if (em) em.style.display = n ? "none" : "block";
    }
    if (gfil) {
      var genres = C.films.map(function (f) { return f.genre; }).filter(function (g, i, a) { return a.indexOf(g) === i; });
      gfil.innerHTML = '<span>Жанр</span><button class="chip on" data-g="all">Усі</button>' + genres.map(function (g) { return '<button class="chip" data-g="' + esc(g) + '">' + esc(g) + "</button>"; }).join("");
      $$(".chip", gfil).forEach(function (b) { b.addEventListener("click", function () { $$(".chip", gfil).forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); curG = b.dataset.g; applyF(); }); });
    }
    if (fq) fq.addEventListener("input", function () { q = fq.value.trim().toLowerCase(); applyF(); });
  }

  /* ---------- Модалка фільму ---------- */
  var modal = document.createElement("div"); modal.className = "modal"; modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true"); document.body.appendChild(modal);
  function openModal(html, small) {
    modal.className = "modal" + (small ? " small" : "");
    modal.innerHTML = '<div class="box"><button class="m-x" aria-label="Закрити">×</button>' + html + "</div>";
    requestAnimationFrame(function () { modal.classList.add("open"); });
    document.body.style.overflow = "hidden";
    $(".m-x", modal).addEventListener("click", closeModal);
    setTimeout(function () { var x = $(".m-x", modal); if (x) x.focus(); }, 80);
  }
  function closeModal() { modal.classList.remove("open"); document.body.style.overflow = ""; }
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modal.classList.contains("open")) closeModal(); });

  function openFilm(id) {
    var f = filmById(id); if (!f) return;
    var up = upcomingSessions(f.id), byDay = {};
    up.forEach(function (s) { (byDay[s.date] = byDay[s.date] || []).push(s); });
    var days = Object.keys(byDay).slice(0, 5);
    openModal('<div class="m-film"><div>' + poster(f, "m") + '</div><div><span class="kicker">' + esc(f.genre) + "</span><h3>" + esc(f.title) + '</h3><p class="tagline">' + esc(f.tagline) + "</p><p>" + esc(f.desc) + "</p>" +
      '<div class="specs"><div><span>Режисер</span><b>' + esc(f.director) + '</b></div><div><span>Країна</span><b>' + esc(f.country) + '</b></div><div><span>Рік</span><b>' + esc(f.year) + '</b></div><div><span>Тривалість</span><b>' + esc(f.duration) + ' хв</b></div><div><span>Вік</span><b>' + esc(f.age) + '</b></div><div><span>Рейтинг</span><b>★ ' + esc(f.rating) + "</b></div></div>" +
      '<h4 style="font-size:20px;margin:6px 0 10px">Найближчі сеанси</h4><div class="m-times">' + (days.length ? days.map(function (d) { var dd = parse(d); return '<div class="m-day"><span>' + dd.getDate() + " " + MG[dd.getMonth()] + ", " + WD[(dd.getDay() + 6) % 7] + "</span>" + byDay[d].map(function (s) { return '<button class="time time-btn" data-book="' + s.id + '" title="' + esc(s.hall) + " · " + s.price + ' ₴">' + s.time + "</button>"; }).join("") + "</div>"; }).join("") : '<p style="color:var(--muted)">Сеанси з\'являться найближчим часом.</p>') + "</div></div></div>");
  }

  /* ---------- Бронювання з вибором місць ---------- */
  function seededTaken(id) { var h = 0; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 9973; return function (r, c) { return ((h + r * 17 + c * 31 + r * c) % 7) === 0; }; }
  function openBooking(sid) {
    var s = C.sessions.filter(function (x) { return x.id === sid; })[0]; if (!s) return;
    var f = filmById(s.filmId), d = parse(s.date), taken = seededTaken(sid), rows = s.hall === "Великий зал" ? 8 : 6, cols = s.hall === "Великий зал" ? 14 : 10;
    var sel = [];
    var seats = '<div class="seatmap"><div class="screenline">ЕКРАН</div><div class="seat-rows">';
    for (var r = 1; r <= rows; r++) {
      seats += '<div class="seat-row"><i>' + r + "</i>";
      for (var c = 1; c <= cols; c++) { var t = taken(r, c); seats += '<button class="seat' + (t ? " taken" : "") + '" data-s="' + r + "-" + c + '"' + (t ? " disabled" : "") + ' aria-label="Ряд ' + r + ", місце " + c + (t ? ", зайняте" : "") + '"></button>'; if (c === Math.floor(cols / 2)) seats += '<span style="width:10px"></span>'; }
      seats += "</div>";
    }
    seats += '</div><div class="seat-legend"><span><i style="background:#8E1B32"></i>вільне</span><span><i style="background:#D4A84B"></i>обране</span><span><i style="background:#3A2A2E"></i>зайняте</span></div></div>';
    openModal('<div style="padding:30px"><span class="kicker">Бронювання</span><h3 style="font-size:30px;padding-right:40px">' + esc(f.title) + '</h3><p style="color:var(--muted);margin:0">' + d.getDate() + " " + MG[d.getMonth()] + ", " + WF[d.getDay()] + " · " + esc(s.time) + " · " + esc(s.hall) + " · " + esc(s.format) + '</p><div id="bkStep">' + seats +
      '<div class="total"><span id="bkSel" style="color:var(--muted)">Оберіть місця на схемі</span><b id="bkSum">0 ₴</b></div>' +
      '<form class="form" id="bkForm" novalidate style="margin-top:16px"><div class="row2"><div class="field"><input id="bName" placeholder=" " autocomplete="name"><label for="bName">Ваше ім\'я</label><span class="err">Вкажіть ім\'я</span></div><div class="field"><input id="bPhone" placeholder=" " inputmode="tel" autocomplete="tel"><label for="bPhone">Телефон</label><span class="err">Формат: +380XXXXXXXXX</span></div></div><button class="btn" type="submit">Забронювати ' + ICO.arrow + '</button></form></div>' +
      '<div class="success" id="bkOk"><svg viewBox="0 0 120 120"><circle class="circ" cx="60" cy="60" r="46" fill="none" stroke="#D4A84B" stroke-width="4"/><path class="tick" d="M40 61l14 14 27-30" fill="none" stroke="#F1D88E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg><h3>Квитки заброньовано!</h3><p id="bkOkText"></p></div></div>', true);
    $$(".seat:not(.taken)", modal).forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.dataset.s, i = sel.indexOf(k);
        if (i > -1) sel.splice(i, 1); else if (sel.length < 6) sel.push(k);
        b.classList.toggle("sel", sel.indexOf(k) > -1);
        $("#bkSel").textContent = sel.length ? "Місця: " + sel.map(function (x) { var p = x.split("-"); return "ряд " + p[0] + "/" + p[1]; }).join(", ") : "Оберіть місця на схемі";
        $("#bkSum").textContent = (sel.length * s.price).toLocaleString("uk-UA") + " ₴";
      });
    });
    $("#bkForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = validate([[$("#bName"), function (v) { return v.trim().length >= 2; }], [$("#bPhone"), function (v) { return /^\+?3?8?0\d{9}$/.test(v.replace(/[\s()-]/g, "")); }]]);
      if (!sel.length) { $("#bkSel").textContent = "Спершу оберіть хоча б одне місце"; $("#bkSel").style.color = "#FF8A8D"; ok = false; }
      if (!ok) return;
      if (window.CMS) CMS.addReg({ session: s.id, film: f.title, date: s.date, time: s.time, hall: s.hall, seats: sel.slice(), sum: sel.length * s.price, name: $("#bName").value.trim(), phone: $("#bPhone").value.trim() });
      $("#bkForm").style.display = "none"; $(".seatmap", modal).style.display = "none"; $(".total", modal).style.display = "none";
      $("#bkOkText").textContent = sel.length + " " + plural(sel.length, "квиток", "квитки", "квитків") + " на суму " + (sel.length * s.price) + " ₴. Викупіть їх на касі за 30 хвилин до початку сеансу.";
      $("#bkOk").classList.add("show");
    });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-book]");
    if (b) { e.preventDefault(); openBooking(b.dataset.book); return; }
    var fb = e.target.closest && e.target.closest("[data-film]");
    if (fb) { e.preventDefault(); openFilm(fb.dataset.film); }
  });
  if (params.get("film")) setTimeout(function () { openFilm(params.get("film")); }, SHOT ? 0 : 600);

  function validate(rules) {
    var ok = true, first = null;
    rules.forEach(function (r) {
      var el = r[0], f = el.closest(".field") || el.closest(".check"), good = r[1](el.type === "checkbox" ? el.checked : el.value);
      if (f) { f.classList.remove("invalid"); if (!good) { void f.offsetWidth; f.classList.add("invalid"); } }
      if (!good) { ok = false; first = first || el; }
    });
    if (first) first.focus();
    return ok;
  }

  /* ---------- Події на головній ---------- */
  function upEvents() { return C.events.filter(function (e) { return e.date >= TODAY; }).sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); }); }
  var evEl = $("#events");
  if (evEl) {
    var ue = upEvents().slice(0, +evEl.dataset.limit || 3);
    evEl.innerHTML = ue.map(function (e, i) { var d = parse(e.date); return '<a class="event reveal" style="--d:' + i * .1 + 's" href="schedule.html?date=' + e.date + '"><span class="badge">' + esc(C.eventTypes[e.type] || e.type) + '</span><div class="d">' + d.getDate() + "<small>" + MS[d.getMonth()] + "</small></div><h3>" + esc(e.title) + "</h3><p>" + esc(e.desc) + '</p><span class="pl">' + WF[d.getDay()] + ", " + esc(e.time) + " · " + esc(e.place) + "</span></a>"; }).join("") || '<p class="empty">Події незабаром.</p>';
  }

  /* ---------- Розклад: календар ---------- */
  var cal = $("#calendar");
  if (cal) {
    var sesDays = {}, evDays = {};
    C.sessions.forEach(function (s) { sesDays[s.date] = 1; });
    C.events.forEach(function (e) { (evDays[e.date] = evDays[e.date] || []).push(e); });
    var selD = params.get("date") || (sesDays[TODAY] ? TODAY : Object.keys(sesDays).sort().filter(function (d) { return d >= TODAY; })[0] || TODAY);
    var vd = parse(selD), vy = vd.getFullYear(), vm = vd.getMonth();
    function drawCal() {
      var first = new Date(vy, vm, 1), st = (first.getDay() + 6) % 7, days = new Date(vy, vm + 1, 0).getDate(), total = Math.ceil((st + days) / 7) * 7;
      var h = '<div class="cal-head"><button class="arrow" data-m="-1" aria-label="Попередній місяць">' + ICO.left + "</button><h3>" + MN[vm] + " " + vy + '</h3><button class="arrow" data-m="1" aria-label="Наступний місяць">' + ICO.right + '</button></div><div class="cal-grid">' + WD.map(function (w) { return '<div class="wd">' + w + "</div>"; }).join("");
      for (var i = 0; i < total; i++) {
        var d = new Date(vy, vm, i - st + 1), k = iso(d), out = d.getMonth() !== vm, has = (sesDays[k] || evDays[k]) && !out;
        h += '<button class="day' + (out ? " out" : "") + (has ? " has" : "") + (k === TODAY ? " today" : "") + (k === selD && !out ? " sel" : "") + '" data-d="' + k + '"' + (has ? "" : ' tabindex="-1"') + ' aria-label="' + d.getDate() + " " + MG[d.getMonth()] + '">' + d.getDate() + '<span class="ds">' + (has && sesDays[k] ? "<i></i>" : "") + (has && evDays[k] ? '<i class="ev"></i>' : "") + "</span></button>";
      }
      h += '</div><div class="cal-legend"><span><i></i>сеанси</span><span><i class="ev"></i>події, кіноклуб, фестиваль</span></div>';
      cal.innerHTML = h;
      $$(".cal-head .arrow", cal).forEach(function (b) { b.addEventListener("click", function () { vm += +b.dataset.m; if (vm < 0) { vm = 11; vy--; } if (vm > 11) { vm = 0; vy++; } drawCal(); }); });
      $$(".day.has", cal).forEach(function (b) { b.addEventListener("click", function () { selD = b.dataset.d; drawCal(); drawDay(); if (innerWidth < 900) $("#dayView").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" }); }); });
    }
    function drawDay() {
      var dv = $("#dayView"), d = parse(selD), ss = sessionsOf(selD), ev = evDays[selD] || [];
      var h = '<div class="day-head"><h2>' + d.getDate() + " " + MG[d.getMonth()] + " <em>" + WF[d.getDay()] + '</em></h2><span style="color:var(--muted)">' + ss.length + " " + plural(ss.length, "сеанс", "сеанси", "сеансів") + (ev.length ? " · " + ev.length + " " + plural(ev.length, "подія", "події", "подій") : "") + '</span></div><div class="sess-list">';
      h += ev.map(function (e, i) { return '<div class="ev-card" style="animation-delay:' + i * .05 + 's"><div class="t">' + esc(e.time) + "<small>" + esc(e.place) + '</small></div><div><span class="badge">' + esc(C.eventTypes[e.type] || e.type) + "</span><h4>" + esc(e.title) + "</h4><p>" + esc(e.desc) + '</p></div><a class="btn ghost sm" href="contacts.html?topic=event#form">Записатися</a></div>'; }).join("");
      h += ss.map(function (s, i) {
        var f = filmById(s.filmId); if (!f) return "";
        var past = s.date < TODAY || (s.date === TODAY && s.time < NOWT);
        return '<div class="sess' + (past ? " past" : "") + '" style="animation-delay:' + (i + ev.length) * .04 + 's"><div class="t">' + s.time + "<small>" + esc(s.hall) + '</small></div><div class="mini">' + poster(f, "d" + i) + '</div><div><h4><a href="#" data-film="' + f.id + '">' + esc(f.title) + "</a></h4><p>" + esc(f.genre) + " · " + f.duration + " хв · " + esc(f.age) + " · " + esc(s.format) + " · <b style=\"color:var(--gold-l)\">" + s.price + " ₴</b></p></div>" + (past ? '<span style="color:var(--muted);font-size:14px">сеанс минув</span>' : '<button class="btn sm" data-book="' + s.id + '">Квиток</button>') + "</div>";
      }).join("");
      if (!ss.length && !ev.length) h += '<p class="empty">У цей день сеансів немає.</p>';
      dv.innerHTML = h + "</div>";
    }
    drawCal(); drawDay();
  }

  /* ---------- Галерея ---------- */
  var lb, lbL = [], lbI = 0;
  function lbShow(i) {
    lbI = (i + lbL.length) % lbL.length; var it = lbL[lbI], img = $("img", lb); img.classList.remove("ready");
    setTimeout(function () { img.src = it.img; img.alt = it.title; $("figcaption", lb).innerHTML = "<small>" + esc(it.cat) + " · " + (lbI + 1) + " / " + lbL.length + "</small>" + esc(it.title); if (img.complete) img.classList.add("ready"); else img.onload = function () { img.classList.add("ready"); }; }, 150);
  }
  function lbOpen(list, i) {
    if (!lb) {
      lb = document.createElement("div"); lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Перегляд фото");
      lb.innerHTML = '<button class="arrow prev" aria-label="Попереднє">' + ICO.left + '</button><figure><img alt=""><figcaption></figcaption></figure><button class="arrow next" aria-label="Наступне">' + ICO.right + '</button><button class="arrow lb-close" aria-label="Закрити">' + ICO.close + "</button>";
      document.body.appendChild(lb);
      $(".prev", lb).addEventListener("click", function () { lbShow(lbI - 1); });
      $(".next", lb).addEventListener("click", function () { lbShow(lbI + 1); });
      $(".lb-close", lb).addEventListener("click", lbClose);
      lb.addEventListener("click", function (e) { if (e.target === lb || e.target.tagName === "FIGURE") lbClose(); });
      document.addEventListener("keydown", function (e) { if (!lb.classList.contains("open")) return; if (e.key === "Escape") lbClose(); if (e.key === "ArrowLeft") lbShow(lbI - 1); if (e.key === "ArrowRight") lbShow(lbI + 1); });
    }
    lbL = list; lb.classList.add("open"); document.body.style.overflow = "hidden"; lbShow(i); $(".lb-close", lb).focus();
  }
  function lbClose() { lb.classList.remove("open"); document.body.style.overflow = ""; }
  var gal = $("#gallery");
  if (gal) {
    var gcur = "Усі", glim = +gal.dataset.limit || 0;
    function drawG() {
      var list = C.gallery.filter(function (g) { return gcur === "Усі" || g.cat === gcur; }); if (glim) list = list.slice(0, glim);
      gal.innerHTML = list.map(function (g, i) { return '<button class="g-item reveal-s" style="--d:' + (i % 4) * .06 + 's" data-i="' + i + '" aria-label="Відкрити: ' + esc(g.title) + '"><img src="' + esc(g.img) + '" alt="' + esc(g.title) + '"><figcaption><small>' + esc(g.cat) + "</small><b>" + esc(g.title) + "</b></figcaption></button>"; }).join("");
      $$(".g-item", gal).forEach(function (b) { b.addEventListener("click", function () { lbOpen(list, +b.dataset.i); }); });
      observe(gal);
    }
    var gf = $("#gFilter");
    if (gf) {
      var cats = ["Усі"].concat(C.gallery.map(function (g) { return g.cat; }).filter(function (c, i, a) { return c && a.indexOf(c) === i; }));
      gf.innerHTML = cats.map(function (c, i) { return '<button class="chip' + (i ? "" : " on") + '">' + esc(c) + "</button>"; }).join("");
      $$(".chip", gf).forEach(function (b) { b.addEventListener("click", function () { $$(".chip", gf).forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); gcur = b.textContent; drawG(); }); });
    }
    drawG();
  }

  /* ---------- Зали, ціни, відгуки ---------- */
  var halls = $("#halls");
  if (halls) halls.innerHTML = C.halls.map(function (h, i) { return '<div class="hallc reveal" style="--d:' + i * .1 + 's"><div class="ic">' + (ICO[h.icon] || ICO.screen) + "</div><h3>" + esc(h.name) + '</h3><span class="seats">' + esc(h.seats) + " місць</span><p>" + esc(h.text) + "</p></div>"; }).join("");
  var pr = $("#prices");
  if (pr) pr.innerHTML = C.prices.map(function (p) { return "<div><span>" + esc(p.name) + "</span><b>" + esc(p.price) + "</b></div>"; }).join("");
  var testi = $("#testi");
  if (testi) testi.innerHTML = C.testimonials.map(function (t, i) { return '<figure class="t-card reveal" style="--d:' + i * .1 + 's"><p>' + esc(t.text) + "</p><cite>" + esc(t.name) + "</cite></figure>"; }).join("");

  /* ---------- Новини ---------- */
  function newsSorted() { return C.news.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }); }
  function newsCard(n, i) { return '<a class="n-card reveal" style="--d:' + (i % 3) * .1 + 's" href="news.html?id=' + encodeURIComponent(n.id) + '"><div class="img"><img src="' + esc(n.img || "img/hall.svg") + '" alt=""><span class="pill">' + esc(n.cat || "Новини") + '</span></div><div class="body"><time>' + fmt(n.date) + "</time><h3>" + esc(n.title) + "</h3><p>" + esc(n.excerpt) + '</p><span class="link">Читати ' + ICO.arrow + "</span></div></a>"; }
  var ng = $("#newsGrid");
  if (ng) { var nl = newsSorted(); if (+ng.dataset.limit) nl = nl.slice(0, +ng.dataset.limit); ng.innerHTML = nl.map(newsCard).join("") || '<p class="empty">Новин поки немає.</p>'; }
  var art = $("#newsArticle");
  if (art) {
    var nid = params.get("id"), it = nid && C.news.filter(function (n) { return n.id === nid; })[0];
    if (it) {
      $("#newsListWrap").style.display = "none";
      $("#phTitle").innerHTML = '<span class="titles"><span>' + esc(it.title) + "</span></span>"; $("#phLead").textContent = it.excerpt;
      $("#phCrumb").innerHTML = '<a href="index.html">Головна</a> / <a href="news.html">Новини</a> / ' + esc(it.cat || "");
      document.title = it.title + " — " + C.site.name;
      var all = newsSorted(), k2 = all.map(function (x) { return x.id; }).indexOf(it.id), nx2 = all[k2 + 1] || all[0];
      art.innerHTML = '<div class="article"><div class="frame reveal" style="margin-bottom:36px"><img src="' + esc(it.img || "img/hall.svg") + '" alt=""></div><div class="meta reveal"><span class="pill">' + esc(it.cat || "Новини") + "</span><time>" + fmt(it.date) + '</time></div><div class="body reveal">' + it.body + '</div><div class="share reveal"><a class="btn ghost sm" href="news.html">' + ICO.left + ' Усі новини</a><span style="flex:1"></span>' + (nx2 && nx2.id !== it.id ? '<a class="link" href="news.html?id=' + encodeURIComponent(nx2.id) + '">Далі: ' + esc(nx2.title) + " " + ICO.arrow + "</a>" : "") + "</div></div>";
    } else if (nid) art.innerHTML = '<div class="empty">Новину не знайдено — можливо, її видалили в адмін-панелі.<br><br><a class="btn" href="news.html">До всіх новин</a></div>';
  }

  /* ---------- Контакти ---------- */
  var cc = $("#contactCards");
  if (cc) {
    var s = C.site;
    cc.innerHTML = '<div class="c-card reveal"><div class="ic">' + ICO.pin + "</div><h3>Адреса</h3><p>" + esc(s.address) + "</p><p>" + esc(s.district) + "</p></div>" +
      '<div class="c-card reveal" style="--d:.1s"><div class="ic">' + ICO.phone + '</div><h3>Каса</h3><a href="tel:' + esc(s.phone.replace(/\s/g, "")) + '">' + esc(s.phone) + "</a><p>щодня з 11:00 до 23:00</p></div>" +
      '<div class="c-card reveal" style="--d:.2s"><div class="ic">' + ICO.mail + '</div><h3>Пошта</h3><a href="mailto:' + esc(s.email) + '">' + esc(s.email) + "</a><p>Instagram: " + esc(s.instagram) + "</p></div>" +
      '<div class="c-card reveal" style="--d:.3s"><div class="ic">' + ICO.clock + "</div><h3>Сеанси</h3><p>Перший — о 12:00</p><p>Останній — о 21:45</p></div>";
  }
  var gm = $("#gmapsLink"); if (gm) gm.href = "https://www.google.com/maps?q=" + C.site.lat + "," + C.site.lon;
  var coords = $("#coords"); if (coords) coords.textContent = (+C.site.lat).toFixed(4) + "° пн. ш., " + (+C.site.lon).toFixed(4) + "° сх. д.";
  var mapSvg = $("#cityMap");
  if (mapSvg && window.UA_MAP) {
    var NS = "http://www.w3.org/2000/svg";
    var el = function (t, at, p) { var n = document.createElementNS(NS, t); for (var k in at) n.setAttribute(k, at[k]); if (p) p.appendChild(n); return n; };
    var defs = el("defs", {}, mapSvg), lg = el("linearGradient", { id: "mapBeam", x1: "0", y1: "0", x2: "1", y2: "0" }, defs);
    el("stop", { offset: "0", "stop-color": "#FFE3A6", "stop-opacity": ".7" }, lg); el("stop", { offset: "1", "stop-color": "#FFE3A6", "stop-opacity": "0" }, lg);
    var grid = el("g", { class: "map-grid" }, mapSvg);
    for (var gx = 0; gx <= 1000; gx += 50) el("line", { x1: gx, y1: 0, x2: gx, y2: 673 }, grid);
    for (var gy = 0; gy <= 673; gy += 50) el("line", { x1: 0, y1: gy, x2: 1000, y2: gy }, grid);
    el("path", { d: UA_MAP.d, class: "ua-shape" }, mapSvg);
    var tip = $(".map-tip", mapSvg.parentElement);
    function mk(c, cls, sub) {
      var xy = UA_MAP.project(c[1], c[2]);
      var g = el("g", { class: "mk " + cls, transform: "translate(" + xy[0].toFixed(1) + "," + xy[1].toFixed(1) + ")", tabindex: "0", role: "button", "aria-label": c[0] }, mapSvg);
      if (cls === "home") { el("path", { class: "ray", d: "M0,0 L240,-60 L240,60Z" }, g); el("circle", { class: "pulse", r: 9 }, g); el("circle", { class: "pulse p2", r: 9 }, g); }
      el("circle", { class: "dotc", r: cls === "home" ? 9 : 4 }, g);
      var t = el("text", { x: c[3] != null ? c[3] : 9, y: c[4] != null ? c[4] : 5, "text-anchor": c[5] || "start" }, g); t.textContent = c[0];
      function show() { var wr = mapSvg.parentElement.getBoundingClientRect(), br = g.querySelector(".dotc").getBoundingClientRect(); tip.innerHTML = sub; tip.style.left = br.left + br.width / 2 - wr.left + "px"; tip.style.top = br.top - wr.top + "px"; tip.classList.add("show"); }
      g.addEventListener("mouseenter", show); g.addEventListener("focus", show);
      g.addEventListener("mouseleave", function () { tip.classList.remove("show"); }); g.addEventListener("blur", function () { tip.classList.remove("show"); });
      return g;
    }
    [["Київ", 30.52, 50.45], ["Львів", 24.03, 49.84], ["Рівне", 26.25, 50.62], ["Тернопіль", 25.59, 49.55], ["Ковель", 24.71, 51.21], ["Житомир", 28.66, 50.25], ["Одеса", 30.72, 46.48], ["Харків", 36.23, 49.99], ["Дніпро", 35.04, 48.46]].forEach(function (c) { mk(c, "city", "<b>" + c[0] + "</b><br>гості фестивалю «Світлячок»"); });
    var hm = mk(["Луцьк", 25.33, 50.75, -14, 30, "end"], "home", "<b>" + esc(C.site.name) + "</b><br>" + esc(C.site.address) + "<br>" + esc(C.site.district));
    hm.addEventListener("click", function () { open("https://www.google.com/maps?q=" + C.site.lat + "," + C.site.lon, "_blank", "noopener"); });
  }

  var cf = $("#contactForm");
  if (cf) {
    var succ = $("#formOk");
    cf.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = validate([[$("#fName"), function (v) { return v.trim().length >= 2; }], [$("#fEmail"), function (v) { return /^[^\s@]+@[^\s@]+\.[a-zа-яієї]{2,}$/i.test(v.trim()); }], [$("#fMsg"), function (v) { return v.trim().length >= 10; }], [$("#fAgree"), function (v) { return v === true; }]]);
      if (!ok) return;
      var btn = $("button[type=submit]", cf); btn.disabled = true;
      setTimeout(function () {
        if (window.CMS) CMS.addMessage({ name: $("#fName").value.trim(), email: $("#fEmail").value.trim(), topic: $("#fTopic").value, text: $("#fMsg").value.trim() });
        cf.reset(); cf.style.display = "none"; succ.classList.add("show"); btn.disabled = false;
      }, 600);
    });
    $("#againBtn").addEventListener("click", function () { succ.classList.remove("show"); cf.style.display = ""; });
    if (params.get("topic") === "event") $("#fTopic").value = "Запис на подію або кіноклуб";
  }

  /* ---------- Лічильники ---------- */
  function countUp(n) {
    var t = +n.dataset.count, t0 = null;
    if (SHOT || REDUCED) { n.textContent = t.toLocaleString("uk-UA"); return; }
    (function st(ts) { if (!t0) t0 = ts; var k = Math.min((ts - t0) / 1800, 1); n.textContent = Math.round(t * (1 - Math.pow(1 - k, 4))).toLocaleString("uk-UA"); if (k < 1) requestAnimationFrame(st); })(performance.now());
  }
  var cio = "IntersectionObserver" in window ? new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { countUp(x.target); cio.unobserve(x.target); } }); }, { threshold: .6 }) : null;
  $$("[data-count]").forEach(function (n) { if (cio && !SHOT) cio.observe(n); else countUp(n); });

  /* ---------- Паралакс ---------- */
  var depth = $$("[data-depth]");
  if (depth.length && !SHOT && !REDUCED) {
    var tk = false, mx = 0, my = 0;
    function ap() { depth.forEach(function (n) { var d = +n.dataset.depth; n.style.transform = "translate3d(" + (mx * d * 30).toFixed(1) + "px," + (my * d * 30 + scrollY * d * .3).toFixed(1) + "px,0)"; }); tk = false; }
    addEventListener("mousemove", function (e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; if (!tk) { tk = true; requestAnimationFrame(ap); } });
    addEventListener("scroll", function () { if (!tk) { tk = true; requestAnimationFrame(ap); } }, { passive: true });
  }

  observe(document);
  addEventListener("storage", function (e) { if (window.CMS && e.key === CMS.KEY) location.reload(); });
})();
