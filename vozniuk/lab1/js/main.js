/* ==========================================================
   «Ретро Гараж» — інтерактив сайту
   © 2026 Максим Вознюк
   ========================================================== */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var SHOT = document.documentElement.classList.contains("shot");
  var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var params = new URLSearchParams(location.search);
  var P = 'fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
  var ICO = {
    arrow: '<svg viewBox="0 0 24 24" ' + P + '><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" ' + P + '><path d="M15 6l-6 6 6 6"/></svg>',
    right: '<svg viewBox="0 0 24 24" ' + P + '><path d="M9 6l6 6-6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" ' + P + '><path d="M6 6l12 12M18 6L6 18"/></svg>',
    up: '<svg viewBox="0 0 24 24" ' + P + '><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>'
  };

  /* ---------- Навігація ---------- */
  var file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  $$(".nav a").forEach(function (a) { if (a.getAttribute("href").toLowerCase() === file) { a.classList.add("active"); a.setAttribute("aria-current", "page"); } });
  var burger = $("#burger");
  if (burger) burger.addEventListener("click", function () { var o = document.body.classList.toggle("menu-open"); burger.setAttribute("aria-expanded", o); });
  $$(".nav a").forEach(function (a) { a.addEventListener("click", function () { document.body.classList.remove("menu-open"); }); });

  /* ---------- Прелоадер, шапка, «нагору» ---------- */
  var pre = $("#preloader");
  function hidePre() { if (pre) pre.classList.add("done"); }
  if (pre) { if (SHOT) hidePre(); else { window.addEventListener("load", function () { setTimeout(hidePre, 350); }); setTimeout(hidePre, 950); } }
  var header = $(".header");
  var toTop = document.createElement("button");
  toTop.className = "to-top"; toTop.setAttribute("aria-label", "Нагору"); toTop.innerHTML = ICO.up;
  document.body.appendChild(toTop);
  toTop.addEventListener("click", function () { scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" }); });
  function onScroll() { var y = scrollY; if (header) header.classList.toggle("scrolled", y > 20); toTop.classList.toggle("show", y > 700); }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- Перехід між сторінками ---------- */
  var wipe = document.createElement("div"); wipe.className = "wipe"; wipe.innerHTML = "<i></i><i></i><i></i>"; document.body.appendChild(wipe);
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank" || REDUCED || SHOT) return;
    var href = a.getAttribute("href");
    if (!/\.html(\?|#|$)/.test(href) || /^https?:/.test(href) || href.split(/[?#]/)[0] === file && href.indexOf("#") > -1) return;
    e.preventDefault(); wipe.classList.add("in");
    setTimeout(function () { location.href = href; }, 420);
  });
  addEventListener("pageshow", function () { wipe.classList.remove("in"); });

  document.addEventListener("pointerdown", function (e) {
    var b = e.target.closest && e.target.closest(".btn");
    if (!b || REDUCED) return;
    var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), sp = document.createElement("span");
    sp.className = "ripple"; sp.style.width = sp.style.height = s + "px";
    sp.style.left = e.clientX - r.left - s / 2 + "px"; sp.style.top = e.clientY - r.top - s / 2 + "px";
    b.appendChild(sp); setTimeout(function () { sp.remove(); }, 650);
  });

  /* ---------- Reveal і лічильники ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }) : null;
  function observe(root) { $$(".reveal,.reveal-l,.reveal-r,.reveal-s,.bar-row", root).forEach(function (n) { if (SHOT || !io) n.classList.add("in"); else io.observe(n); }); }
  function countUp(el) {
    var t = +el.dataset.count, t0 = null;
    if (SHOT || REDUCED) { el.textContent = t.toLocaleString("uk-UA"); return; }
    (function step(ts) { if (!t0) t0 = ts; var k = Math.min((ts - t0) / 1800, 1); el.textContent = Math.round(t * (1 - Math.pow(1 - k, 4))).toLocaleString("uk-UA"); if (k < 1) requestAnimationFrame(step); })(performance.now());
  }
  var cio = "IntersectionObserver" in window ? new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { countUp(x.target); cio.unobserve(x.target); } }); }, { threshold: 0.6 }) : null;

  /* ---------- Паралакс ---------- */
  var depth = $$("[data-depth]");
  if (depth.length && !SHOT && !REDUCED) {
    var mx = 0, my = 0, tick = false;
    function ap() { depth.forEach(function (n) { var d = +n.dataset.depth; n.style.transform = "translate3d(" + (mx * d * 30).toFixed(1) + "px," + (my * d * 30 + scrollY * d * 0.25).toFixed(1) + "px,0)"; }); tick = false; }
    addEventListener("mousemove", function (e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; if (!tick) { tick = true; requestAnimationFrame(ap); } });
    addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(ap); } }, { passive: true });
  }

  /* ==========================================================
     КОЛЕКЦІЯ
     ========================================================== */
  var CARS = window.CARS || [];
  function card(c, i) {
    return '<button class="car-card d' + c.decade + ' reveal" style="--d:' + (i % 3) * 0.08 + 's" data-id="' + c.id + '" aria-label="Детальніше: ' + esc(c.name) + '">' +
      '<div class="pic"><span class="st">' + esc(c.status) + '</span><span class="yr">' + esc(DECADES[c.decade]) + '</span><img src="' + c.img + '" alt="' + esc(c.name) + ' у профіль"></div>' +
      '<div class="body"><h3>' + esc(c.name) + '</h3><div class="meta">' + esc(c.country) + " · " + esc(c.years) + "</div><p>" + esc(c.lead) + '</p>' +
      '<div class="specs-mini"><div><b>' + esc(c.power) + '</b><span>потужність</span></div><div><b>' + esc(c.speed.replace("≈ ", "")) + '</b><span>макс.</span></div><div><b>' + esc(c.mass) + "</b><span>маса</span></div></div></div></button>";
  }
  var grid = $("#carGrid");
  if (grid) {
    var ids = grid.dataset.ids ? grid.dataset.ids.split(",") : null;
    var list = ids ? ids.map(function (id) { return CARS.filter(function (c) { return c.id === id; })[0]; }).filter(Boolean) : CARS;
    grid.innerHTML = list.map(card).join("");
    var fDec = "all", fCountry = "all", q = "";
    function applyFilter() {
      var n = 0;
      $$(".car-card", grid).forEach(function (el) {
        var c = CARS.filter(function (x) { return x.id === el.dataset.id; })[0];
        var ok = (fDec === "all" || c.decade === fDec) && (fCountry === "all" || c.country === fCountry) && (!q || (c.name + c.nick + c.country + c.years).toLowerCase().indexOf(q) > -1);
        el.classList.toggle("hide", !ok); if (ok) { n++; if (!REDUCED && !SHOT) el.animate([{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "none" }], { duration: 400, easing: "ease-out" }); }
      });
      var cnt = $("#carCount"); if (cnt) cnt.textContent = "Показано автомобілів: " + n + " з " + CARS.length;
      var em = $("#carEmpty"); if (em) em.style.display = n ? "none" : "block";
    }
    var fd = $("#fDecade"), fc = $("#fCountry"), fq = $("#fq");
    if (fd) {
      fd.innerHTML = '<span>Десятиліття</span><button class="chip on" data-v="all">Усі</button>' + Object.keys(DECADES).map(function (d) { return '<button class="chip" data-v="' + d + '">' + DECADES[d] + "</button>"; }).join("");
      var countries = CARS.map(function (c) { return c.country; }).filter(function (c, i, a) { return a.indexOf(c) === i; });
      fc.innerHTML = '<span>Країна</span><button class="chip on" data-v="all">Усі</button>' + countries.map(function (c) { return '<button class="chip" data-v="' + esc(c) + '">' + esc(c) + "</button>"; }).join("");
      [[fd, function (v) { fDec = v; }], [fc, function (v) { fCountry = v; }]].forEach(function (pair) {
        $$(".chip", pair[0]).forEach(function (b) { b.addEventListener("click", function () { $$(".chip", pair[0]).forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); pair[1](b.dataset.v); applyFilter(); }); });
      });
      fq.addEventListener("input", function () { q = fq.value.trim().toLowerCase(); applyFilter(); });
      applyFilter();
    }
    grid.addEventListener("click", function (e) { var b = e.target.closest(".car-card"); if (b) openCar(b.dataset.id); });
  }

  var modal;
  function openCar(id) {
    var idx = CARS.map(function (c) { return c.id; }).indexOf(id), c = CARS[idx];
    if (!c) return;
    if (!modal) {
      modal = document.createElement("div"); modal.className = "modal"; modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true");
      document.body.appendChild(modal);
      modal.addEventListener("click", function (e) { if (e.target === modal) closeCar(); });
      document.addEventListener("keydown", function (e) {
        if (!modal.classList.contains("open")) return;
        if (e.key === "Escape") closeCar();
        if (e.key === "ArrowRight") openCar(CARS[(CARS.map(function (x) { return x.id; }).indexOf(modal.dataset.id) + 1) % CARS.length].id);
        if (e.key === "ArrowLeft") openCar(CARS[(CARS.map(function (x) { return x.id; }).indexOf(modal.dataset.id) - 1 + CARS.length) % CARS.length].id);
      });
    }
    var prev = CARS[(idx - 1 + CARS.length) % CARS.length], next = CARS[(idx + 1) % CARS.length];
    modal.dataset.id = id;
    modal.innerHTML = '<div class="box d' + c.decade + '"><div class="m-top"><button class="m-x" aria-label="Закрити">×</button><img src="' + c.img + '" alt="' + esc(c.name) + '"></div>' +
      '<div class="m-body"><div><span class="label">' + esc(c.nick) + '</span><h3>' + esc(c.name) + '</h3><div class="meta">' + esc(c.country) + " · " + esc(c.years) + " · " + esc(c.status) + "</div>" +
      c.story.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + '<ul class="facts">' + c.facts.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul></div>" +
      '<div><table class="spec-table"><caption class="sr">Технічні характеристики</caption><tbody>' +
      [["Роки випуску", c.years], ["Двигун", c.engine], ["Потужність", c.power], ["Макс. швидкість", c.speed], ["Маса", c.mass], ["Випущено", c.made], ["Колір у колекції", c.color], ["Статус", c.status]]
        .map(function (r) { return "<tr><th>" + r[0] + "</th><td>" + esc(r[1]) + "</td></tr>"; }).join("") + "</tbody></table></div></div>" +
      '<div class="m-nav"><button class="btn light sm" data-go="' + prev.id + '">' + ICO.left + esc(prev.name) + '</button><button class="btn sm" data-go="' + next.id + '">' + esc(next.name) + ICO.right + "</button></div></div>";
    $(".m-x", modal).addEventListener("click", closeCar);
    $$("[data-go]", modal).forEach(function (b) { b.addEventListener("click", function () { openCar(b.dataset.go); }); });
    modal.classList.add("open"); document.body.style.overflow = "hidden";
    setTimeout(function () { var x = $(".m-x", modal); if (x) x.focus(); }, 60);
    if (history.replaceState && file === "collection.html") history.replaceState(null, "", "?car=" + id);
  }
  function closeCar() { modal.classList.remove("open"); document.body.style.overflow = ""; if (file === "collection.html") history.replaceState(null, "", "collection.html"); }
  if (params.get("car")) setTimeout(function () { openCar(params.get("car")); }, SHOT ? 0 : 500);
  $$("[data-car]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); openCar(b.dataset.car); }); });

  /* ==========================================================
     ДО / ПІСЛЯ
     ========================================================== */
  var ba = $("#ba");
  if (ba) {
    var pos = 50, dragging = false, touched = false;
    function setPos(p) { pos = Math.max(0, Math.min(100, p)); ba.style.setProperty("--pos", pos + "%"); $(".handle button", ba).setAttribute("aria-valuenow", Math.round(pos)); }
    function fromEvent(e) { var r = ba.getBoundingClientRect(); setPos((e.clientX - r.left) / r.width * 100); }
    ba.addEventListener("pointerdown", function (e) { dragging = true; touched = true; ba.setPointerCapture(e.pointerId); fromEvent(e); });
    ba.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
    ba.addEventListener("pointerup", function () { dragging = false; });
    $(".handle button", ba).addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { setPos(pos - 5); e.preventDefault(); }
      if (e.key === "ArrowRight") { setPos(pos + 5); e.preventDefault(); }
    });
    setPos(50);
    if (!SHOT && !REDUCED && io) {
      var hint = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return; hint.disconnect();
        var t0 = null;
        (function sweep(ts) { if (!t0) t0 = ts; var k = (ts - t0) / 1600; if (touched) return; if (k >= 1) return setPos(50); setPos(50 + Math.sin(k * Math.PI * 2) * 22); requestAnimationFrame(sweep); })(performance.now());
      }, { threshold: .5 });
      hint.observe(ba);
    }
  }

  /* ==========================================================
     ГАЛЕРЕЯ + ЛАЙТБОКС
     ========================================================== */
  var GALLERY = [
    { img: "img/gallery/poster-mustang.svg", title: "«Дикий кінь» на тлі сонця", cat: "Постери", cls: "wide" },
    { img: "img/gallery/garage.svg", title: "Мій гараж у Вінниці", cat: "Сцени", cls: "" },
    { img: "img/gallery/poster-volga.svg", title: "«Волга» у святковій рамці", cat: "Постери", cls: "" },
    { img: "img/gallery/road.svg", title: "Захід сонця на трасі", cat: "Сцени", cls: "" },
    { img: "img/gallery/poster-beetle.svg", title: "«Жук» біля моря", cat: "Постери", cls: "" },
    { img: "img/gallery/gas-station.svg", title: "Нічна заправка", cat: "Сцени", cls: "wide" },
    { img: "img/gallery/car-show.svg", title: "Bel Air на автошоу", cat: "Постери", cls: "" },
    { img: "img/gallery/ds-city.svg", title: "«Богиня» у вечірньому місті", cat: "Сцени", cls: "wide" },
    { img: "img/gallery/poster-mini.svg", title: "Mini на гірчичному тлі", cat: "Постери", cls: "" }
  ];
  var lb, lbList = [], lbI = 0, lbTimer = null;
  function lbShow(i) {
    lbI = (i + lbList.length) % lbList.length;
    var it = lbList[lbI], img = $("img", lb);
    img.classList.remove("ready");
    setTimeout(function () {
      img.src = it.img; img.alt = it.title;
      $("figcaption", lb).innerHTML = "<small>" + esc(it.cat) + " · " + (lbI + 1) + " / " + lbList.length + "</small>" + esc(it.title);
      if (img.complete) img.classList.add("ready"); else img.onload = function () { img.classList.add("ready"); };
    }, 150);
  }
  function lbStop() { clearInterval(lbTimer); lbTimer = null; var p = $(".lb-play", lb); if (p) p.innerHTML = ICO.play + "Слайд-шоу"; }
  function lbOpen(list, i) {
    if (!lb) {
      lb = document.createElement("div"); lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Перегляд зображення");
      lb.innerHTML = '<button class="lb-btn lb-play">' + ICO.play + 'Слайд-шоу</button><button class="lb-btn prev" aria-label="Попереднє">' + ICO.left + '</button><figure><img alt=""><figcaption></figcaption></figure><button class="lb-btn next" aria-label="Наступне">' + ICO.right + '</button><button class="lb-btn lb-close" aria-label="Закрити">' + ICO.close + "</button>";
      document.body.appendChild(lb);
      $(".prev", lb).addEventListener("click", function () { lbStop(); lbShow(lbI - 1); });
      $(".next", lb).addEventListener("click", function () { lbStop(); lbShow(lbI + 1); });
      $(".lb-close", lb).addEventListener("click", lbClose);
      $(".lb-play", lb).addEventListener("click", function () {
        if (lbTimer) return lbStop();
        this.innerHTML = ICO.pause + "Пауза"; lbTimer = setInterval(function () { lbShow(lbI + 1); }, 2600);
      });
      lb.addEventListener("click", function (e) { if (e.target === lb || e.target.tagName === "FIGURE") lbClose(); });
      document.addEventListener("keydown", function (e) {
        if (!lb.classList.contains("open")) return;
        if (e.key === "Escape") lbClose(); if (e.key === "ArrowLeft") lbShow(lbI - 1); if (e.key === "ArrowRight") lbShow(lbI + 1);
      });
    }
    lbList = list; lb.classList.add("open"); document.body.style.overflow = "hidden"; lbShow(i); $(".lb-close", lb).focus();
  }
  function lbClose() { lbStop(); lb.classList.remove("open"); document.body.style.overflow = ""; }
  var gal = $("#gallery");
  if (gal) {
    var lim = +gal.dataset.limit || 0, items = lim ? GALLERY.slice(0, lim) : GALLERY, cur = "Усі";
    gal.innerHTML = items.map(function (g, i) { return '<button class="g-item reveal-s ' + (lim ? "" : g.cls) + '" style="--d:' + (i % 3) * .07 + 's" data-i="' + i + '" aria-label="Відкрити: ' + esc(g.title) + '"><img src="' + g.img + '" alt="' + esc(g.title) + '"><figcaption>' + esc(g.title) + "</figcaption></button>"; }).join("");
    function visible() { return items.filter(function (g) { return cur === "Усі" || g.cat === cur; }); }
    $$(".g-item", gal).forEach(function (b) { b.addEventListener("click", function () { var v = visible(); lbOpen(v, v.indexOf(items[+b.dataset.i])); }); });
    var gf = $("#gFilter");
    if (gf) {
      gf.innerHTML = ["Усі", "Постери", "Сцени"].map(function (c, i) { return '<button class="chip' + (i ? "" : " on") + '">' + c + "</button>"; }).join("");
      $$(".chip", gf).forEach(function (b) {
        b.addEventListener("click", function () {
          $$(".chip", gf).forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); cur = b.textContent;
          $$(".g-item", gal).forEach(function (el) { var ok = cur === "Усі" || items[+el.dataset.i].cat === cur; el.classList.toggle("hide", !ok); el.classList.toggle("wide", ok && cur === "Усі" && items[+el.dataset.i].cls === "wide"); el.classList.toggle("tall", ok && cur === "Усі" && items[+el.dataset.i].cls === "tall"); });
        });
      });
    }
  }

  /* ==========================================================
     CANVAS: «Нічна траса» зі спідометром
     ========================================================== */
  var cv = $("#roadCanvas");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d"), W = 960, H = 600, speed = 60, target = 60, gas = false, playing = !SHOT && !REDUCED, off = 0, last = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);
    var stars = []; for (var s = 0; s < 90; s++) stars.push([Math.random() * W, Math.random() * H * .42, Math.random() * 1.6 + .3]);
    var poles = []; for (var k = 0; k < 8; k++) poles.push(k / 8);
    function draw(t) {
      var dt = last ? Math.min((t - last) / 1000, .05) : .016; last = t;
      target = gas ? 160 : 60; speed += (target - speed) * dt * (gas ? .8 : .5);
      if (playing) off = (off + speed * dt * .012) % 1;
      // небо
      var g = ctx.createLinearGradient(0, 0, 0, H * .55);
      g.addColorStop(0, "#14242B"); g.addColorStop(.7, "#2A4A52"); g.addColorStop(1, "#E3A72F");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      stars.forEach(function (st) { ctx.fillStyle = "rgba(243,233,210," + (.4 + .4 * Math.sin(t / 600 + st[0])) + ")"; ctx.fillRect(st[0], st[1], st[2], st[2]); });
      // місяць і пагорби
      ctx.fillStyle = "#F3E9D2"; ctx.beginPath(); ctx.arc(760, 110, 36, 0, 7); ctx.fill();
      ctx.fillStyle = "#14242B"; ctx.beginPath(); ctx.arc(776, 100, 32, 0, 7); ctx.fill();
      var hz = H * .55;
      ctx.fillStyle = "#7E1520"; ctx.beginPath(); ctx.moveTo(0, hz);
      for (var x = 0; x <= W; x += 40) ctx.lineTo(x, hz - 30 - 22 * Math.sin(x / 90) - 14 * Math.sin(x / 37));
      ctx.lineTo(W, hz); ctx.fill();
      // земля і дорога
      ctx.fillStyle = "#2A2522"; ctx.fillRect(0, hz, W, H - hz);
      ctx.fillStyle = "#3A322C"; ctx.beginPath(); ctx.moveTo(W / 2 - 8, hz); ctx.lineTo(W / 2 + 8, hz); ctx.lineTo(W * .95, H); ctx.lineTo(W * .05, H); ctx.fill();
      ctx.strokeStyle = "#E3A72F"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(W / 2 - 8, hz); ctx.lineTo(W * .05, H); ctx.moveTo(W / 2 + 8, hz); ctx.lineTo(W * .95, H); ctx.stroke();
      for (var i = 0; i < 12; i++) {
        var z = ((i + off * 1) / 12), z2 = z + .035;
        var y1 = hz + (H - hz) * z * z, y2 = hz + (H - hz) * z2 * z2, w1 = 2 + 16 * z, w2 = 2 + 16 * z2;
        ctx.fillStyle = "#F3E9D2"; ctx.beginPath(); ctx.moveTo(W / 2 - w1 / 2, y1); ctx.lineTo(W / 2 + w1 / 2, y1); ctx.lineTo(W / 2 + w2 / 2, y2); ctx.lineTo(W / 2 - w2 / 2, y2); ctx.fill();
      }
      // тополі
      poles.forEach(function (p) {
        var z = (p + off) % 1, y = hz + (H - hz) * z * z, h = 20 + 260 * z * z, dx = 30 + W * .55 * z * z;
        [-1, 1].forEach(function (sd) {
          var px = W / 2 + sd * dx;
          ctx.fillStyle = "#1A1210"; ctx.beginPath(); ctx.ellipse(px, y - h / 2, 4 + 18 * z, h / 2, 0, 0, 7); ctx.fill();
        });
      });
      // приладова панель
      ctx.fillStyle = "#1F1A17"; ctx.fillRect(0, H - 120, W, 120);
      ctx.fillStyle = "#B3202E"; ctx.fillRect(0, H - 124, W, 6);
      var cx = W / 2, cy = H - 18, R = 150;
      ctx.fillStyle = "#F3E9D2"; ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = "#1F1A17"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, 0); ctx.stroke();
      ctx.font = "700 15px Oswald, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#1F1A17";
      for (var v = 0; v <= 180; v += 20) {
        var a = Math.PI + Math.PI * v / 180, r1 = R - 12, r2 = R - (v % 40 ? 22 : 30);
        ctx.lineWidth = v % 40 ? 2 : 4; ctx.strokeStyle = v >= 140 ? "#B3202E" : "#1F1A17";
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); ctx.stroke();
        if (v % 40 === 0) ctx.fillText(v, cx + Math.cos(a) * (R - 48), cy + Math.sin(a) * (R - 48) + 5);
      }
      var shown = playing ? speed : (SHOT ? 95 : 0), na = Math.PI + Math.PI * Math.min(shown, 180) / 180;
      ctx.strokeStyle = "#B3202E"; ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(na) * (R - 30), cy + Math.sin(na) * (R - 30)); ctx.stroke();
      ctx.fillStyle = "#1F1A17"; ctx.beginPath(); ctx.arc(cx, cy, 12, 0, 7); ctx.fill();
      ctx.fillStyle = "#E3A72F"; ctx.font = "700 13px Oswald, sans-serif"; ctx.fillText("КМ/ГОД", cx, cy - 40);
      var rd = $("#speedRead"); if (rd) rd.textContent = Math.round(shown) + " км/год";
      if (playing) requestAnimationFrame(draw); else running = false;
    }
    var running = false;
    function start() { if (!running) { running = true; last = 0; requestAnimationFrame(draw); } }
    start();
    var pb = $("#playBtn"), gb = $("#gasBtn");
    function setPlay(p) { playing = p; pb.innerHTML = (p ? ICO.pause + "Пауза" : ICO.play + "Поїхали"); if (p) start(); }
    if (pb) { setPlay(playing); pb.addEventListener("click", function () { setPlay(!playing); }); }
    if (gb) {
      ["pointerdown", "keydown"].forEach(function (ev) { gb.addEventListener(ev, function (e) { if (ev === "keydown" && e.key !== " " && e.key !== "Enter") return; gas = true; if (!playing) setPlay(true); }); });
      ["pointerup", "pointerleave", "keyup", "blur"].forEach(function (ev) { gb.addEventListener(ev, function () { gas = false; }); });
    }
  }

  /* ==========================================================
     КАРТА
     ========================================================== */
  var map = $("#homeMap");
  if (map && window.UA_MAP) {
    var NS = "http://www.w3.org/2000/svg";
    var el = function (t, at, p) { var n = document.createElementNS(NS, t); for (var k in at) n.setAttribute(k, at[k]); if (p) p.appendChild(n); return n; };
    el("path", { d: UA_MAP.d, class: "ua-shape" }, map);
    var tip = $(".map-tip", map.parentElement);
    var cities = [["Київ", 30.52, 50.45], ["Львів", 24.03, 49.84], ["Одеса", 30.72, 46.48], ["Харків", 36.23, 49.99], ["Дніпро", 35.04, 48.46], ["Житомир", 28.66, 50.25, 9, -6], ["Хмельницький", 26.99, 49.42, -9, -8, "end"], ["Умань", 30.22, 48.75], ["Луцьк", 25.33, 50.75], ["Чернівці", 25.94, 48.29]];
    function mk(c, cls, sub) {
      var xy = UA_MAP.project(c[1], c[2]);
      var g = el("g", { class: "mk " + cls, transform: "translate(" + xy[0].toFixed(1) + "," + xy[1].toFixed(1) + ")", tabindex: "0", role: "button", "aria-label": c[0] }, map);
      if (cls === "home") { el("circle", { class: "pulse", r: 9 }, g); el("circle", { class: "pulse p2", r: 9 }, g); }
      el("circle", { class: "dotc", r: cls === "home" ? 9 : 4 }, g);
      var t = el("text", { x: c[3] != null ? c[3] : 9, y: c[4] != null ? c[4] : 5, "text-anchor": c[5] || "start" }, g); t.textContent = c[0];
      function show() { var wr = map.parentElement.getBoundingClientRect(), br = g.querySelector(".dotc").getBoundingClientRect(); tip.innerHTML = "<b>" + c[0] + "</b><br>" + sub; tip.style.left = br.left + br.width / 2 - wr.left + "px"; tip.style.top = br.top - wr.top + "px"; tip.classList.add("show"); }
      g.addEventListener("mouseenter", show); g.addEventListener("focus", show);
      g.addEventListener("mouseleave", function () { tip.classList.remove("show"); }); g.addEventListener("blur", function () { tip.classList.remove("show"); });
      return g;
    }
    cities.forEach(function (c) { mk(c, "city", "тут проходять ретро-фестивалі"); });
    var home = mk(["Вінниця", 28.47, 49.23, 14, 30], "home", "домівка «Ретро Гаража»<br>49.23° пн. ш., 28.47° сх. д.");
    home.addEventListener("click", function () { open("https://www.google.com/maps?q=49.23,28.47", "_blank", "noopener"); });
  }

  /* ==========================================================
     ФОРМА
     ========================================================== */
  var form = $("#contactForm");
  if (form) {
    var succ = $("#formSuccess");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var rules = [["#fName", function (v) { return v.trim().length >= 2; }], ["#fEmail", function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()); }], ["#fMsg", function (v) { return v.trim().length >= 10; }]];
      var ok = true, first = null;
      rules.forEach(function (r) {
        var inp = $(r[0]), f = inp.closest(".field"), good = r[1](inp.value);
        f.classList.remove("bad"); if (!good) { void f.offsetWidth; f.classList.add("bad"); ok = false; first = first || inp; }
      });
      var ag = $("#fAgree"), ch = ag.closest(".check"); ch.classList.remove("bad");
      if (!ag.checked) { void ch.offsetWidth; ch.classList.add("bad"); ok = false; first = first || ag; }
      if (!ok) { first.focus(); return; }
      var btn = $("button[type=submit]", form); btn.disabled = true; btn.style.opacity = ".7";
      setTimeout(function () {
        try { var arr = JSON.parse(localStorage.getItem("rg_messages") || "[]"); arr.push({ name: $("#fName").value, email: $("#fEmail").value, topic: $("#fTopic").value, text: $("#fMsg").value, t: Date.now() }); localStorage.setItem("rg_messages", JSON.stringify(arr)); } catch (err) {}
        form.reset(); form.style.display = "none"; succ.classList.add("show"); btn.disabled = false; btn.style.opacity = "";
      }, 600);
    });
    $("#againBtn").addEventListener("click", function () { succ.classList.remove("show"); form.style.display = ""; });
  }

  observe(document);
  $$("[data-count]").forEach(function (n) { if (cio && !SHOT) cio.observe(n); else countUp(n); });
})();
