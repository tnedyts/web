/* ==========================================================
   Кремнієвий пульс — логіка блогу
   Автор: Максим Вознюк, 2026
   ========================================================== */
(function () {
  "use strict";
  var root = document.documentElement;
  var SHOT = root.classList.contains("shot");
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var params = new URLSearchParams(location.search);

  /* ---------- Безпечне сховище ---------- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { toast("Не вдалося зберегти дані в браузері", "err"); return false; } }
  };

  /* ---------- Утиліти ---------- */
  var MONTHS_G = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
  var MONTHS_N = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
  function fmtDate(iso) { var d = new Date(iso + "T12:00:00"); return d.getDate() + " " + MONTHS_G[d.getMonth()] + " " + d.getFullYear(); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function words(html) { return html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length; }
  function readTime(p) { return Math.max(1, Math.ceil(words(p.body) / 130)); }
  function plural(n, a, b, c) { var m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c; }
  var ICO = {
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7-4.4-9-9.2C1.7 7.6 4 4.5 7.2 4.5c2 0 3.3 1.1 4.8 3 1.5-1.9 2.8-3 4.8-3 3.2 0 5.5 3.1 4.2 6.3C19 15.6 12 20 12 20z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };

  /* ---------- Тости ---------- */
  function toast(msg, type) {
    var wrap = $(".toasts");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toasts"; wrap.setAttribute("aria-live", "polite"); document.body.appendChild(wrap); }
    var t = document.createElement("div");
    t.className = "toast " + (type || "");
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(function () { t.classList.add("out"); setTimeout(function () { t.remove(); }, 400); }, 2800);
  }

  /* ---------- Дані ---------- */
  var SEED_COMMENTS = {
    "ai-agents": [{ name: "Ірина К.", text: "Дуже чітко пояснено різницю між ботом і агентом. Чекаю на огляд конкретних інструментів для студентів!", date: "2026-10-13" }, { name: "Тарас", text: "Пісочниця і підтвердження дій — це головне. Без цього я б не довіряв агенту навіть свою пошту.", date: "2026-10-14" }],
    "foldables-2026": [{ name: "Олег", text: "Маю складаний уже рік — складку справді майже не видно. Але чохол знайти складно.", date: "2026-09-29" }],
    "solid-state": [{ name: "Андрій М.", text: "Цікаво, як такі батареї поводитимуться взимку на -20. Можна окремий матеріал?", date: "2026-09-11" }],
    "quantum-basics": [{ name: "Софія", text: "Найкраще пояснення інтерференції, яке я читала. Дякую!", date: "2026-07-31" }, { name: "Дмитро", text: "Додайте, будь ласка, посилання на хмарні симулятори — хочу спробувати.", date: "2026-08-02" }],
    "drones-logistics": [{ name: "Василь, ДСНС", text: "Підтверджую: тепловізор на дроні економить години пошуку в Карпатах.", date: "2026-05-28" }],
    "2nm-chips": [{ name: "Марта", text: "Не знала, що EUV випаровує олово лазером. Звучить як фантастика!", date: "2026-04-16" }]
  };
  function userPosts() { return store.get("kp-user-posts", []); }
  function allPosts() {
    return userPosts().map(function (p) { p.user = true; return p; }).concat(window.POSTS || []).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  }
  function getPost(id) { return allPosts().filter(function (p) { return p.id === id; })[0]; }
  function liked(id) { return !!store.get("kp-likes", {})[id]; }
  function likeCount(p) { return (p.likes || 0) + (liked(p.id) ? 1 : 0); }
  function comments(id) { return (SEED_COMMENTS[id] || []).concat(store.get("kp-comments", {})[id] || []); }
  function cat(p) { return window.CATEGORIES[p.cat] || { name: p.cat, short: p.cat, color: "#22e5ff" }; }

  /* ---------- Картка запису ---------- */
  function highlight(text, q) {
    var t = esc(text);
    if (!q) return t;
    var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
    return t.replace(re, "<mark>$1</mark>");
  }
  function cardHTML(p, q) {
    var c = cat(p);
    return '<article class="card reveal" style="--c:' + c.color + '" data-id="' + p.id + '">' +
      '<div class="cover"><img src="' + esc(p.cover || "img/covers/generic.svg") + '" alt=""><span class="badge">' + esc(c.short) + '</span>' + (p.user ? '<span class="badge new">мій запис</span>' : '') + '</div>' +
      '<div class="body"><h3><a class="stretched" href="post.html?id=' + encodeURIComponent(p.id) + '">' + highlight(p.title, q) + '</a></h3>' +
      '<p>' + highlight(p.excerpt, q) + '</p>' +
      '<div class="meta"><span>' + ICO.cal + fmtDate(p.date) + '</span><span>' + ICO.clock + readTime(p) + ' хв</span><span>' + ICO.heart + likeCount(p) + '</span><span>' + ICO.chat + comments(p.id).length + '</span></div></div></article>';
  }

  /* ---------- Прелоадер ---------- */
  var boot = $(".boot");
  if (boot) setTimeout(function () { boot.classList.add("done"); }, SHOT ? 0 : 800);

  /* ---------- Переходи між сторінками ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a || SHOT || REDUCED || e.defaultPrevented) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || a.target === "_blank" || /^(mailto|tel|https?):/.test(href) || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(function () { location.href = href; }, 330);
  });
  window.addEventListener("pageshow", function () { document.body.classList.remove("leaving"); });

  /* ---------- Меню ---------- */
  var burger = $(".burger");
  if (burger) burger.addEventListener("click", function () {
    var o = document.body.classList.toggle("menu-open"); burger.setAttribute("aria-expanded", o);
  });

  /* ---------- Прогрес читання та кнопка «нагору» ---------- */
  var prog = $(".progress"), toTop = $(".to-top");
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    var target = $(".article");
    if (prog) {
      var p = 0;
      if (target) {
        var r = target.getBoundingClientRect();
        p = Math.min(1, Math.max(0, (innerHeight * .4 - r.top) / r.height));
      } else p = h > 0 ? scrollY / h : 0;
      prog.style.transform = "scaleX(" + p.toFixed(4) + ")";
    }
    if (toTop) toTop.classList.toggle("show", scrollY > 600);
  }
  addEventListener("scroll", onScroll, { passive: true });
  if (toTop) toTop.addEventListener("click", function () { scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- Reveal ---------- */
  var io = ("IntersectionObserver" in window && !SHOT) ? new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
  }, { threshold: .12 }) : null;
  function reveal(scope) {
    $$(".reveal:not(.in)", scope).forEach(function (el) { if (io) io.observe(el); else el.classList.add("in"); });
  }

  /* ---------- Лічильники ---------- */
  function counter(el) {
    var t = parseFloat(el.dataset.count);
    if (SHOT || REDUCED) { el.textContent = t.toLocaleString("uk-UA"); return; }
    var s = null;
    (function f(ts) { if (!s) s = ts; var k = Math.min((ts - s) / 1600, 1); el.textContent = Math.round(t * (1 - Math.pow(1 - k, 3))).toLocaleString("uk-UA"); if (k < 1) requestAnimationFrame(f); })(performance.now());
  }

  /* ==========================================================
     Canvas: нейромережа з частинок
     ========================================================== */
  var cv = $("#net");
  if (cv) {
    var ctx = cv.getContext("2d"), W, H, pts = [], mouse = { x: -999, y: -999 }, dpr = Math.min(devicePixelRatio || 1, 2);
    var cols = ["#22e5ff", "#ff3df2", "#b6ff3b", "#7c5cff"];
    function size() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(110, Math.round(W * H / 11000));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45, r: Math.random() * 1.8 + .8, c: cols[i % 4] });
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (!SHOT && !REDUCED) { p.x += p.vx; p.y += p.vy; }
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        var dxm = p.x - mouse.x, dym = p.y - mouse.y, dm = Math.sqrt(dxm * dxm + dym * dym);
        if (dm < 140) { p.x += dxm / dm * .8; p.y += dym / dm * .8; }
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 14000) {
            ctx.strokeStyle = "rgba(124,140,255," + (1 - d / 14000) * .35 + ")";
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        if (dm < 180) {
          ctx.strokeStyle = "rgba(34,229,255," + (1 - dm / 180) * .7 + ")";
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = p.c; ctx.shadowColor = p.c; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      }
      if (!SHOT && !REDUCED) requestAnimationFrame(frame);
    }
    cv.parentElement.addEventListener("mousemove", function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    cv.parentElement.addEventListener("mouseleave", function () { mouse.x = mouse.y = -999; });
    addEventListener("resize", function () { size(); if (SHOT || REDUCED) frame(); });
    size(); frame();
  }

  /* ---------- Ефект друку ---------- */
  var typed = $(".typed");
  if (typed) {
    var lines = ["fetch --новини ШІ, чипи, роботи…", "status: 10 записів онлайн", "ping пульс_технологій → 0.42 мс", "sudo читати --уважно"];
    if (SHOT || REDUCED) typed.textContent = lines[0];
    else {
      var li = 0, ci = 0, del = false;
      (function type() {
        var l = lines[li];
        typed.textContent = l.slice(0, ci);
        if (!del && ci < l.length) ci++;
        else if (!del) { del = true; setTimeout(type, 1500); return; }
        else if (ci > 0) ci--;
        else { del = false; li = (li + 1) % lines.length; }
        setTimeout(type, del ? 25 : 55);
      })();
    }
  }

  /* ==========================================================
     ГОЛОВНА: стрічка, фільтри, пошук
     ========================================================== */
  var feed = $("#feed");
  if (feed) {
    var posts = allPosts();
    var state = { cat: params.get("cat") || "all", tag: params.get("tag") || "", q: params.get("q") || "", sort: "new" };
    // герой-статистика
    var hs = $("#statPosts"); if (hs) hs.dataset.count = posts.length;
    var hm = $("#statMin"); if (hm) hm.dataset.count = posts.reduce(function (s, p) { return s + readTime(p); }, 0);
    var hl = $("#statLikes"); if (hl) hl.dataset.count = posts.reduce(function (s, p) { return s + likeCount(p); }, 0);
    $$("[data-count]").forEach(counter);

    // обраний запис
    var fp = posts.filter(function (p) { return p.featured; })[0] || posts[0];
    var fw = $("#featured");
    if (fw && fp) {
      var fc = cat(fp);
      fw.innerHTML = '<a class="featured reveal" href="post.html?id=' + fp.id + '" style="--c:' + fc.color + '"><div class="cover"><img src="' + fp.cover + '" alt=""><span class="badge" style="--c:' + fc.color + '">' + fc.short + '</span></div>' +
        '<div class="body"><span class="flag">★ ГОЛОВНЕ ЗА ТИЖДЕНЬ</span><h2>' + esc(fp.title) + '</h2><p style="color:var(--muted)">' + esc(fp.excerpt) + '</p>' +
        '<div class="meta"><span>' + ICO.cal + fmtDate(fp.date) + '</span><span>' + ICO.clock + readTime(fp) + ' хв читання</span><span>' + ICO.heart + likeCount(fp) + '</span></div>' +
        '<span class="btn" style="align-self:flex-start;margin-top:8px">Читати запис ' + ICO.arrow + '</span></div></a>';
    }

    // чіпи категорій
    var chipWrap = $("#catChips");
    var counts = {};
    posts.forEach(function (p) { counts[p.cat] = (counts[p.cat] || 0) + 1; });
    chipWrap.innerHTML = '<button class="chip" data-cat="all"><i></i>Усі <span class="mono">' + posts.length + '</span></button>' +
      Object.keys(CATEGORIES).map(function (k) {
        return '<button class="chip" data-cat="' + k + '" style="--c:' + CATEGORIES[k].color + '"><i></i>' + CATEGORIES[k].short + ' <span class="mono">' + (counts[k] || 0) + '</span></button>';
      }).join("");
    var search = $("#search"), sortSel = $("#sort"), af = $("#activeFilter"), empty = $("#empty"), found = $("#found");
    search.value = state.q;

    function render() {
      var q = state.q.trim().toLowerCase();
      var list = posts.filter(function (p) {
        if (state.cat !== "all" && p.cat !== state.cat) return false;
        if (state.tag && p.tags.indexOf(state.tag) < 0) return false;
        if (q) {
          var hay = (p.title + " " + p.excerpt + " " + p.tags.join(" ") + " " + p.body.replace(/<[^>]+>/g, " ")).toLowerCase();
          if (hay.indexOf(q) < 0) return false;
        }
        return true;
      });
      if (state.sort === "popular") list.sort(function (a, b) { return likeCount(b) - likeCount(a); });
      if (state.sort === "short") list.sort(function (a, b) { return readTime(a) - readTime(b); });
      if (state.sort === "comments") list.sort(function (a, b) { return comments(b.id).length - comments(a.id).length; });
      feed.innerHTML = list.map(function (p) { return cardHTML(p, state.q.trim()); }).join("");
      $$(".card", feed).forEach(function (c, i) { if (!SHOT) { c.classList.add("pop"); c.style.animationDelay = (i * .05) + "s"; } c.classList.add("in"); });
      empty.classList.toggle("show", list.length === 0);
      found.textContent = list.length + " " + plural(list.length, "запис", "записи", "записів");
      $$(".chip", chipWrap).forEach(function (c) { c.classList.toggle("active", c.dataset.cat === state.cat); });
      $$("#tagCloud .tag").forEach(function (t) { t.classList.toggle("active", t.dataset.tag === state.tag); });
      var parts = [];
      if (state.tag) parts.push('<button data-clear="tag">#' + esc(state.tag) + ' ×</button>');
      if (state.q) parts.push('<button data-clear="q">«' + esc(state.q) + '» ×</button>');
      af.innerHTML = parts.length ? "Фільтри: " + parts.join("") : "";
      af.classList.toggle("show", parts.length > 0);
      var u = new URL(location.href);
      ["cat", "tag", "q"].forEach(function (k) { var v = k === "cat" ? (state.cat === "all" ? "" : state.cat) : state[k]; if (v) u.searchParams.set(k, v); else u.searchParams.delete(k); });
      try { history.replaceState(null, "", u.pathname.split("/").pop() + u.search); } catch (e) { /* file:// */ }
    }
    chipWrap.addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (b) { state.cat = b.dataset.cat; render(); } });
    var deb;
    search.addEventListener("input", function () { clearTimeout(deb); deb = setTimeout(function () { state.q = search.value; render(); }, 160); });
    sortSel.addEventListener("change", function () { state.sort = sortSel.value; render(); });
    af.addEventListener("click", function (e) { var b = e.target.closest("[data-clear]"); if (!b) return; state[b.dataset.clear] = ""; if (b.dataset.clear === "q") search.value = ""; render(); });
    document.addEventListener("keydown", function (e) { if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") { e.preventDefault(); search.focus(); } });

    // популярне
    var popEl = $("#popular");
    popEl.innerHTML = posts.slice().sort(function (a, b) { return likeCount(b) - likeCount(a); }).slice(0, 5).map(function (p) {
      return '<li><div><a href="post.html?id=' + p.id + '">' + esc(p.title) + '</a><small>♥ ' + likeCount(p) + ' · ' + readTime(p) + ' хв</small></div></li>';
    }).join("");
    // теги
    var tagCount = {};
    posts.forEach(function (p) { p.tags.forEach(function (t) { tagCount[t] = (tagCount[t] || 0) + 1; }); });
    var tc = $("#tagCloud");
    tc.innerHTML = Object.keys(tagCount).sort().map(function (t) { return '<button class="tag" data-tag="' + esc(t) + '">#' + esc(t) + (tagCount[t] > 1 ? '<sup>' + tagCount[t] + '</sup>' : '') + '</button>'; }).join("");
    tc.addEventListener("click", function (e) { var b = e.target.closest(".tag"); if (!b) return; state.tag = state.tag === b.dataset.tag ? "" : b.dataset.tag; render(); $("#feedTop").scrollIntoView({ behavior: SHOT ? "auto" : "smooth" }); });
    render();
  }

  /* ==========================================================
     СТОРІНКА ЗАПИСУ
     ========================================================== */
  var postRoot = $("#post");
  if (postRoot) {
    var id = params.get("id") || (window.POSTS[0] && window.POSTS[0].id);
    var p = getPost(id) || (/^\d+$/.test(id) ? window.POSTS[+id - 1] : null);
    if (!p) {
      postRoot.innerHTML = '<section class="section"><div class="container" style="text-align:center"><p class="kicker">error 404</p><h1 style="font-size:48px">Запис не знайдено</h1><p style="color:var(--muted)">Можливо, його видалено або посилання некоректне.</p><a class="btn" href="index.html">До стрічки ' + ICO.arrow + '</a></div></section>';
    } else {
      var c = cat(p);
      document.title = p.title + " — Кремнієвий пульс";
      var list = allPosts(), idx = list.map(function (x) { return x.id; }).indexOf(p.id);
      var prev = list[idx + 1], next = list[idx - 1];
      var rel = list.filter(function (x) { return x.id !== p.id && x.cat === p.cat; }).concat(list.filter(function (x) { return x.id !== p.id && x.cat !== p.cat; })).slice(0, 3);
      postRoot.innerHTML =
        '<section class="post-hero"><div class="bgimg" style="background-image:url(\'' + esc(p.cover || "img/covers/generic.svg") + '\')"></div><div class="container">' +
        '<div class="crumbs"><a href="index.html">стрічка</a> / <a href="index.html?cat=' + p.cat + '" style="color:' + c.color + '">' + esc(c.name) + '</a></div>' +
        '<h1>' + esc(p.title) + '</h1>' +
        '<div class="meta" style="font-size:13px"><span>' + ICO.cal + fmtDate(p.date) + '</span><span>' + ICO.clock + readTime(p) + ' хв читання · ' + words(p.body) + ' слів</span><span>' + ICO.heart + '<b id="likeTop">' + likeCount(p) + '</b></span><span>' + ICO.chat + '<b id="comTop">' + comments(p.id).length + '</b></span><span>✎ Максим Вознюк</span></div></div></section>' +
        '<div class="container"><div class="post-layout" style="margin-top:40px">' +
        '<nav class="toc" aria-label="Зміст"><h4>Зміст</h4><ol id="toc"></ol></nav>' +
        '<div><figure class="post-cover reveal" style="margin:0 0 36px"><img src="' + esc(p.cover || "img/covers/generic.svg") + '" alt="Обкладинка: ' + esc(p.title) + '"></figure>' +
        '<article class="article" id="article">' + p.body + '</article>' +
        '<div class="post-tags" style="margin-top:30px">' + p.tags.map(function (t) { return '<a class="tag" href="index.html?tag=' + encodeURIComponent(t) + '">#' + esc(t) + '</a>'; }).join("") + '</div>' +
        '<div class="post-actions"><button class="like' + (liked(p.id) ? " on" : "") + '" id="likeBtn" aria-pressed="' + liked(p.id) + '">' + ICO.heart + '<span>Подобається</span><b id="likeNum">' + likeCount(p) + '</b></button>' +
        '<div class="share"><button class="icon-btn" id="copyLink" aria-label="Копіювати посилання"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg></button>' +
        '<a class="icon-btn" aria-label="Поділитися в Telegram" target="_blank" rel="noopener" href="https://t.me/share/url?url=' + encodeURIComponent(location.href) + '&text=' + encodeURIComponent(p.title) + '"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 4L2.5 11.2c-.9.4-.9 1.5 0 1.8l4.6 1.5 1.8 5.5c.2.7 1.1.9 1.6.4l2.6-2.4 4.7 3.5c.6.4 1.4.1 1.6-.6L22 5.2c.2-.9-.3-1.5-1-1.2zM9.5 14.2l-.4 3.7-1.3-4 9.4-6.3-7.7 6.6z"/></svg></a>' +
        (p.user ? '<button class="icon-btn" id="delPost" aria-label="Видалити запис" title="Видалити мій запис"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button>' : '') +
        '</div></div>' +
        '<div class="prevnext">' + (prev ? '<a href="post.html?id=' + prev.id + '"><small>← попередній</small><b>' + esc(prev.title) + '</b></a>' : '<span></span>') +
        (next ? '<a class="next" href="post.html?id=' + next.id + '"><small>наступний →</small><b>' + esc(next.title) + '</b></a>' : '<span></span>') + '</div>' +
        '<section class="comments" id="comments"><h3>Коментарі <span class="mono" id="comCount" style="color:var(--cyan)"></span></h3>' +
        '<form class="comment-form" id="comForm" novalidate><input class="input" name="name" placeholder="Ваше ім\'я" maxlength="40" aria-label="Ім\'я"><textarea class="input" name="text" placeholder="Що думаєте про цю технологію?" style="min-height:110px;font-family:var(--body)" maxlength="800" aria-label="Коментар"></textarea><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><span class="hint" id="comHint">Коментар збережеться у вашому браузері</span><button class="btn" type="submit">Надіслати ' + ICO.arrow + '</button></div></form>' +
        '<ul class="comment-list" id="comList"></ul></section></div>' +
        '<aside class="aside-right"><div class="stat-box">рубрика<b style="color:' + c.color + '">' + esc(c.short) + '</b></div><div class="stat-box">час читання<b>' + readTime(p) + ' хв</b></div><div class="stat-box">прочитано<b id="readPct">0%</b></div><a class="btn mag" href="new.html">Написати свій ' + ICO.arrow + '</a></aside>' +
        '</div>' +
        '<section class="section"><h2 class="sec-title">Читайте також</h2><div class="related">' + rel.map(function (x) { return cardHTML(x); }).join("") + '</div></section></div>';

      // зміст
      var toc = $("#toc"), hs2 = $$("#article h2");
      hs2.forEach(function (h, i) { h.id = "s" + (i + 1); toc.insertAdjacentHTML("beforeend", '<li><a href="#s' + (i + 1) + '">' + h.textContent + '</a></li>'); });
      var tocLinks = $$("#toc a"), readPct = $("#readPct");
      addEventListener("scroll", function () {
        var cur = 0;
        hs2.forEach(function (h, i) { if (h.getBoundingClientRect().top < 140) cur = i; });
        tocLinks.forEach(function (a, i) { a.classList.toggle("on", i === cur); });
        var art = $("#article").getBoundingClientRect();
        readPct.textContent = Math.round(Math.min(1, Math.max(0, (innerHeight * .4 - art.top) / art.height)) * 100) + "%";
      }, { passive: true });

      // лайк
      var likeBtn = $("#likeBtn");
      likeBtn.addEventListener("click", function () {
        var L = store.get("kp-likes", {});
        L[p.id] = !L[p.id];
        if (!L[p.id]) delete L[p.id];
        store.set("kp-likes", L);
        var on = liked(p.id);
        likeBtn.classList.toggle("on", on); likeBtn.setAttribute("aria-pressed", on);
        $("#likeNum").textContent = likeCount(p); $("#likeTop").textContent = likeCount(p);
        if (on && !REDUCED) {
          likeBtn.classList.remove("burst"); void likeBtn.offsetWidth; likeBtn.classList.add("burst");
          for (var i = 0; i < 12; i++) {
            var s = document.createElement("i"); s.className = "p";
            var a = i / 12 * Math.PI * 2;
            s.style.setProperty("--x", Math.cos(a) * 40 + "px"); s.style.setProperty("--y", Math.sin(a) * 40 + "px");
            s.style.background = ["#ff3df2", "#22e5ff", "#b6ff3b"][i % 3];
            likeBtn.appendChild(s); setTimeout(function (n) { n.remove(); }.bind(null, s), 700);
          }
          toast("Дякую за вподобання! ♥", "ok");
        }
      });
      $("#copyLink").addEventListener("click", function () {
        var done = function () { toast("Посилання скопійовано", "ok"); };
        if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, function () { toast("Не вдалося скопіювати", "err"); });
        else done();
      });
      var del = $("#delPost");
      if (del) del.addEventListener("click", function () {
        if (!confirm("Видалити цей запис?")) return;
        store.set("kp-user-posts", userPosts().filter(function (x) { return x.id !== p.id; }));
        location.href = "index.html";
      });

      // коментарі
      function renderComments() {
        var arr = comments(p.id), own = (store.get("kp-comments", {})[p.id] || []).length, seed = arr.length - own;
        $("#comCount").textContent = "[" + arr.length + "]";
        $("#comTop").textContent = arr.length;
        var grads = ["#22e5ff", "#ff3df2", "#b6ff3b", "#ffb03b", "#9d7bff"];
        $("#comList").innerHTML = arr.length ? arr.slice().reverse().map(function (cm, i) {
          var realIdx = arr.length - 1 - i, mine = realIdx >= seed;
          return '<li class="comment"><span class="ava" style="background:' + grads[cm.name.length % grads.length] + '">' + esc(cm.name.charAt(0).toUpperCase()) + '</span><div><b>' + esc(cm.name) + '</b><time>' + fmtDate(cm.date) + '</time>' +
            (mine ? '<button class="del" data-i="' + (realIdx - seed) + '">видалити</button>' : '') + '<p>' + esc(cm.text) + '</p></div></li>';
        }).join("") : '<li class="hint">Поки що коментарів немає — будьте першими!</li>';
      }
      renderComments();
      $("#comList").addEventListener("click", function (e) {
        var b = e.target.closest(".del"); if (!b) return;
        var C = store.get("kp-comments", {}); (C[p.id] || []).splice(+b.dataset.i, 1); store.set("kp-comments", C); renderComments(); toast("Коментар видалено");
      });
      $("#comForm").addEventListener("submit", function (e) {
        e.preventDefault();
        var f = e.target, n = f.name.value.trim(), t = f.text.value.trim(), ok = true;
        f.name.classList.toggle("bad", n.length < 2); f.text.classList.toggle("bad", t.length < 5);
        if (n.length < 2 || t.length < 5) { ok = false; $("#comHint").textContent = "Вкажіть ім'я (від 2 символів) і коментар (від 5 символів)"; $("#comHint").classList.add("err"); }
        if (!ok) return;
        var C = store.get("kp-comments", {});
        (C[p.id] = C[p.id] || []).push({ name: n, text: t, date: new Date().toISOString().slice(0, 10) });
        if (store.set("kp-comments", C)) { f.reset(); $("#comHint").textContent = "Коментар збережеться у вашому браузері"; $("#comHint").classList.remove("err"); renderComments(); toast("Коментар опубліковано", "ok"); }
      });
    }
  }

  /* ==========================================================
     АРХІВ
     ========================================================== */
  var arch = $("#archive");
  if (arch) {
    var ap = allPosts(), groups = {};
    ap.forEach(function (p) { var k = p.date.slice(0, 7); (groups[k] = groups[k] || []).push(p); });
    arch.innerHTML = Object.keys(groups).sort().reverse().map(function (k) {
      var y = k.slice(0, 4), m = +k.slice(5, 7) - 1, g = groups[k];
      return '<div class="month reveal"><h3>' + MONTHS_N[m] + ' ' + y + ' <span>// ' + g.length + ' ' + plural(g.length, "запис", "записи", "записів") + '</span></h3><ul class="tl">' +
        g.map(function (p) { var c = cat(p); return '<li style="--c:' + c.color + '"><a href="post.html?id=' + p.id + '"><time>' + fmtDate(p.date).replace(/ \d{4}$/, "") + '</time><b>' + esc(p.title) + '</b><span class="cat">' + c.short + '</span></a></li>'; }).join("") + '</ul></div>';
    }).join("");
    var cc = {}; ap.forEach(function (p) { cc[p.cat] = (cc[p.cat] || 0) + 1; });
    var mx = Math.max.apply(null, Object.keys(cc).map(function (k) { return cc[k]; }));
    $("#catBars").innerHTML = Object.keys(CATEGORIES).map(function (k) {
      return '<a class="bar-row" href="index.html?cat=' + k + '" style="--c:' + CATEGORIES[k].color + '"><div><b>' + CATEGORIES[k].name + '</b><span>' + (cc[k] || 0) + '</span></div><div class="bar"><i data-w="' + ((cc[k] || 0) / mx * 100) + '"></i></div></a>';
    }).join("");
    var bars = $$("#catBars .bar i");
    var showBars = function () { bars.forEach(function (b) { b.style.width = b.dataset.w + "%"; }); };
    if (SHOT || !io) showBars(); else setTimeout(showBars, 300);
    // теплова карта по місяцях року
    var heat = $("#heat"), hl2 = $("#heatLabels");
    var ms = []; for (var m = 0; m < 10; m++) ms.push(ap.filter(function (p) { return p.date.slice(0, 7) === "2026-" + String(m + 1).padStart(2, "0"); }).length);
    heat.innerHTML = ms.map(function (n, i) { return '<span class="l' + Math.min(n, 3) + '" title="' + MONTHS_N[i] + ': ' + n + '"></span>'; }).join("");
    hl2.innerHTML = MONTHS_N.slice(0, 10).map(function (m) { return "<span>" + m.slice(0, 3) + "</span>"; }).join("");
    var tg = {}; ap.forEach(function (p) { p.tags.forEach(function (t) { tg[t] = (tg[t] || 0) + 1; }); });
    $("#archTags").innerHTML = Object.keys(tg).sort(function (a, b) { return tg[b] - tg[a]; }).map(function (t) { return '<a class="tag" href="index.html?tag=' + encodeURIComponent(t) + '">#' + esc(t) + '<sup>' + tg[t] + '</sup></a>'; }).join("");
    $("#archTotal").textContent = ap.length;
    $("#archWords").textContent = ap.reduce(function (s, p) { return s + words(p.body); }, 0).toLocaleString("uk-UA");
  }

  /* ==========================================================
     РЕДАКТОР НОВОГО ЗАПИСУ
     ========================================================== */
  function md(src) {
    var out = [], list = null;
    esc(src).split(/\n/).forEach(function (line) {
      var l = line.trim();
      var inline = function (s) { return s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>"); };
      if (/^- /.test(l)) { if (!list) { list = []; } list.push("<li>" + inline(l.slice(2)) + "</li>"); return; }
      if (list) { out.push("<ul>" + list.join("") + "</ul>"); list = null; }
      if (!l) return;
      if (/^## /.test(l)) out.push("<h2>" + inline(l.slice(3)) + "</h2>");
      else if (/^&gt; /.test(l)) out.push("<blockquote>" + inline(l.slice(5)) + "</blockquote>");
      else out.push("<p>" + inline(l) + "</p>");
    });
    if (list) out.push("<ul>" + list.join("") + "</ul>");
    return out.join("\n");
  }
  var ed = $("#editor");
  if (ed) {
    var sel = ed.cat;
    sel.innerHTML = Object.keys(CATEGORIES).map(function (k) { return '<option value="' + k + '">' + CATEGORIES[k].name + '</option>'; }).join("");
    var covers = ["ai", "phones", "ev", "robots", "quantum", "xr", "drones", "chips", "npu", "generic"];
    $("#coverPick").innerHTML = covers.map(function (c, i) { return '<label><input type="radio" name="cover" value="img/covers/' + c + '.svg"' + (i === 9 ? " checked" : "") + '><img src="img/covers/' + c + '.svg" alt="Обкладинка ' + c + '"></label>'; }).join("");
    var draft = store.get("kp-draft", null);
    if (draft) { ["title", "excerpt", "tags", "body"].forEach(function (k) { if (draft[k]) ed[k].value = draft[k]; }); if (draft.cat) ed.cat.value = draft.cat; }
    function preview() {
      var fake = { id: "preview", cat: ed.cat.value, title: ed.title.value || "Заголовок вашого запису", excerpt: ed.excerpt.value || "Короткий опис з'явиться тут…", date: new Date().toISOString().slice(0, 10), tags: [], likes: 0, cover: (ed.querySelector("[name=cover]:checked") || {}).value, body: md(ed.body.value) || "<p>Почніть писати…</p>", user: true };
      $("#previewCard").innerHTML = cardHTML(fake);
      $(".card", $("#previewCard")).classList.add("in");
      $("#previewBody").innerHTML = fake.body;
      var w = words(fake.body);
      $("#wordInfo").textContent = w + " " + plural(w, "слово", "слова", "слів") + " · ~" + readTime(fake) + " хв читання";
      store.set("kp-draft", { title: ed.title.value, excerpt: ed.excerpt.value, tags: ed.tags.value, body: ed.body.value, cat: ed.cat.value });
    }
    ed.addEventListener("input", preview);
    ed.addEventListener("change", preview);
    preview();
    function renderMine() {
      var mine = userPosts();
      $("#myPosts").innerHTML = mine.length ? mine.map(function (p) { return '<li><a href="post.html?id=' + p.id + '">' + esc(p.title) + '</a><button data-id="' + p.id + '">видалити</button></li>'; }).join("") : '<li class="hint">Ви ще не створили жодного запису.</li>';
    }
    renderMine();
    $("#myPosts").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-id]"); if (!b) return;
      store.set("kp-user-posts", userPosts().filter(function (x) { return x.id !== b.dataset.id; })); renderMine(); toast("Запис видалено");
    });
    ed.addEventListener("submit", function (e) {
      e.preventDefault();
      var errs = [];
      ed.title.classList.toggle("bad", ed.title.value.trim().length < 8); if (ed.title.value.trim().length < 8) errs.push("заголовок (від 8 символів)");
      ed.excerpt.classList.toggle("bad", ed.excerpt.value.trim().length < 20); if (ed.excerpt.value.trim().length < 20) errs.push("опис (від 20 символів)");
      ed.body.classList.toggle("bad", words(md(ed.body.value)) < 30); if (words(md(ed.body.value)) < 30) errs.push("текст (від 30 слів)");
      if (errs.length) { toast("Заповніть: " + errs.join(", "), "err"); return; }
      var np = {
        id: "u" + Date.now().toString(36), cat: ed.cat.value, title: ed.title.value.trim(), excerpt: ed.excerpt.value.trim(),
        date: new Date().toISOString().slice(0, 10), tags: ed.tags.value.split(",").map(function (t) { return t.trim().replace(/^#/, ""); }).filter(Boolean).slice(0, 6),
        likes: 0, cover: ed.querySelector("[name=cover]:checked").value, body: md(ed.body.value)
      };
      if (!np.tags.length) np.tags = ["думки"];
      var arr = userPosts(); arr.unshift(np);
      if (store.set("kp-user-posts", arr)) {
        try { localStorage.removeItem("kp-draft"); } catch (er) { /* ignore */ }
        toast("Запис опубліковано!", "ok");
        setTimeout(function () { location.href = "post.html?id=" + np.id; }, 700);
      }
    });
    $("#clearDraft").addEventListener("click", function () { ed.reset(); preview(); toast("Чернетку очищено"); });
  }

  /* ---------- Підписка ---------- */
  $$("form.js-sub").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var inp = f.querySelector("input[type=email]"), v = inp.value.trim(), hint = f.querySelector(".hint");
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) {
        inp.classList.remove("bad"); void inp.offsetWidth; inp.classList.add("bad");
        if (hint) { hint.textContent = "Перевірте формат e-mail, наприклад name@gmail.com"; hint.classList.add("err"); }
        return;
      }
      var subs = store.get("kp-subs", []);
      if (subs.indexOf(v) > -1) { toast("Ви вже підписані"); return; }
      subs.push(v); store.set("kp-subs", subs);
      inp.classList.remove("bad");
      if (hint) { hint.textContent = "Без спаму. Один лист на тиждень."; hint.classList.remove("err"); }
      var dm = f.parentElement.querySelector(".done-msg"); if (dm) dm.classList.add("show");
      f.reset();
      toast("Підписку оформлено: " + v, "ok");
    });
  });

  /* ---------- Лічильники на інших сторінках ---------- */
  if (!feed) $$("[data-count]").forEach(counter);
  reveal();
  onScroll();
})();
