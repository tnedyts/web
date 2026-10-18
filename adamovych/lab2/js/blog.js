/* =========================================================
   Рушій блогу: стрічка з пошуком і рубриками, вподобайки,
   коментарі, редактор нових записів, нічна тема.
   Записи, коментарі та вподобайки зберігаються в браузері
   (localStorage), тому сайт працює без сервера.
   ========================================================= */
(function () {
  'use strict';

  var KEY = document.documentElement.getAttribute('data-blog') || 'blog';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function load(name, def) {
    try { var v = JSON.parse(localStorage.getItem(KEY + ':' + name)); return v === null ? def : v; } catch (e) { return def; }
  }
  function save(name, val) {
    try { localStorage.setItem(KEY + ':' + name, JSON.stringify(val)); } catch (e) { /* без збереження */ }
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var MONTHS = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
  function fmtDate(iso) { var d = new Date(iso); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }

  // проста розмітка для записів з редактора: ## заголовок, - пункт списку, **жирний**
  function markup(text) {
    var blocks = String(text).replace(/\r/g, '').split(/\n{2,}/), html = '';
    blocks.forEach(function (b) {
      b = b.trim();
      if (!b) return;
      var inline = function (s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>'); };
      if (/^## /.test(b)) html += '<h2>' + inline(b.slice(3)) + '</h2>';
      else if (/^- /m.test(b) && b.split('\n').every(function (l) { return /^- /.test(l); })) html += '<ul>' + b.split('\n').map(function (l) { return '<li>' + inline(l.slice(2)) + '</li>'; }).join('') + '</ul>';
      else html += '<p>' + inline(b).replace(/\n/g, '<br>') + '</p>';
    });
    return html;
  }

  /* ---------- нічна тема ---------- */
  var themeBtn = document.querySelector('[data-theme-toggle]');
  function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); if (themeBtn) themeBtn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false'); }
  applyTheme(load('theme', 'light'));
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(t); save('theme', t);
  });

  /* ---------- вподобайки ---------- */
  var likes = load('likes', {});
  function likeCount(slug, base) { return (+base || 0) + (likes[slug] ? 1 : 0); }
  document.querySelectorAll('[data-likes]').forEach(function (el) {
    el.textContent = likeCount(el.getAttribute('data-likes'), el.getAttribute('data-base'));
  });
  document.querySelectorAll('[data-like-btn]').forEach(function (btn) {
    var slug = btn.getAttribute('data-like-btn'), base = btn.getAttribute('data-base'), out = btn.querySelector('b');
    var sync = function () { btn.classList.toggle('is-liked', !!likes[slug]); btn.setAttribute('aria-pressed', likes[slug] ? 'true' : 'false'); out.textContent = likeCount(slug, base); };
    sync();
    btn.addEventListener('click', function () {
      likes[slug] = !likes[slug]; save('likes', likes); sync();
      if (likes[slug] && !reduce) { btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); }
    });
  });

  /* ---------- коментарі ---------- */
  var cbox = document.querySelector('[data-comments]');
  if (cbox) {
    var slug = cbox.getAttribute('data-comments');
    var list = cbox.querySelector('.comments__list'), form = cbox.querySelector('form'), counter = document.querySelectorAll('[data-comment-count]');
    var stored = load('comments', {}), mine = stored[slug] || [];
    var initial = Array.prototype.slice.call(list.children).length;
    var render = function () {
      list.querySelectorAll('.comment--mine').forEach(function (n) { n.remove(); });
      mine.forEach(function (c, i) {
        var li = document.createElement('li');
        li.className = 'comment comment--mine';
        li.innerHTML = '<p class="comment__head"><span class="comment__ava">' + esc(c.name.charAt(0).toUpperCase()) + '</span><b>' + esc(c.name) + '</b><time datetime="' + c.date + '">' + fmtDate(c.date) + '</time>' +
          '<button type="button" class="comment__del" data-del="' + i + '" aria-label="Видалити коментар">&times;</button></p><p>' + esc(c.text).replace(/\n/g, '<br>') + '</p>';
        list.appendChild(li);
      });
      counter.forEach(function (el) { el.textContent = initial + mine.length; });
    };
    render();
    list.addEventListener('click', function (e) {
      var d = e.target.closest('[data-del]');
      if (!d) return;
      mine.splice(+d.getAttribute('data-del'), 1); stored[slug] = mine; save('comments', stored); render();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim(), text = form.elements.text.value.trim(), msg = form.querySelector('.form__msg');
      if (name.length < 2 || text.length < 3) { msg.textContent = 'Вкажіть ім’я і напишіть коментар.'; msg.className = 'form__msg is-bad'; return; }
      mine.push({ name: name, text: text, date: new Date().toISOString() });
      stored[slug] = mine; save('comments', stored); render();
      form.elements.text.value = '';
      msg.textContent = 'Дякуємо! Коментар опубліковано.'; msg.className = 'form__msg is-ok';
      var last = list.lastElementChild; if (last && !reduce) last.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 400 });
    });
  }

  /* ---------- записи, створені в редакторі ---------- */
  var localPosts = load('posts', []);
  var CATS = {};
  document.querySelectorAll('[data-cat-name]').forEach(function (el) { CATS[el.getAttribute('data-cat-name')] = el.textContent.trim(); });

  var feed = document.querySelector('[data-feed]');
  if (feed) {
    // власні записи — на початок стрічки
    localPosts.slice().reverse().forEach(function (p) {
      var a = document.createElement('article');
      a.className = 'card card--local reveal is-visible';
      a.setAttribute('data-cat', p.cat);
      a.setAttribute('data-text', (p.title + ' ' + p.text).toLowerCase());
      a.innerHTML = '<a class="card__cover cover cover--' + esc(p.cover) + '" href="post.html?id=' + p.id + '" tabindex="-1" aria-hidden="true"><span class="cover__badge">Новий запис</span></a>' +
        '<div class="card__body"><p class="card__meta"><span class="chip-cat">' + esc(CATS[p.cat] || p.cat) + '</span><time datetime="' + p.date + '">' + fmtDate(p.date) + '</time></p>' +
        '<h2 class="card__title"><a href="post.html?id=' + p.id + '">' + esc(p.title) + '</a></h2><p class="card__text">' + esc(p.text.replace(/[#*-]/g, '').slice(0, 140)) + '…</p></div>';
      feed.insertBefore(a, feed.firstChild);
    });
    var cards = feed.querySelectorAll('.card');
    var q = document.querySelector('[data-search]'), empty = document.querySelector('[data-empty]'), count = document.querySelector('[data-count]');
    var cat = 'all';
    var filter = function () {
      var s = q ? q.value.trim().toLowerCase() : '', n = 0;
      cards.forEach(function (c) {
        var ok = (cat === 'all' || c.getAttribute('data-cat') === cat) && (!s || c.getAttribute('data-text').indexOf(s) > -1);
        c.hidden = !ok; if (ok) n++;
      });
      if (empty) empty.hidden = n > 0;
      if (count) count.textContent = n;
    };
    document.querySelectorAll('[data-filter]').forEach(function (b) {
      b.addEventListener('click', function () {
        cat = b.getAttribute('data-filter');
        document.querySelectorAll('[data-filter]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        filter();
      });
    });
    if (q) q.addEventListener('input', filter);
    // перехід за посиланням із рубрикою: index.html#cat-routes
    var m = location.hash.match(/^#cat-(.+)$/);
    if (m) { var btn = document.querySelector('[data-filter="' + m[1] + '"]'); if (btn) btn.click(); }
    filter();
  }

  /* ---------- редактор ---------- */
  var wform = document.querySelector('[data-write]');
  if (wform) {
    var prev = document.querySelector('[data-preview]'), prevTitle = document.querySelector('[data-preview-title]'), prevCover = document.querySelector('[data-preview-cover]');
    var draft = load('draft', null);
    if (draft) { wform.elements.title.value = draft.title || ''; wform.elements.text.value = draft.text || ''; if (draft.cat) wform.elements.cat.value = draft.cat; if (draft.cover) wform.elements.cover.value = draft.cover; }
    var upd = function () {
      prevTitle.textContent = wform.elements.title.value || 'Назва запису';
      prev.innerHTML = markup(wform.elements.text.value) || '<p class="muted">Тут з’явиться текст запису.</p>';
      prevCover.className = 'post__cover cover cover--' + wform.elements.cover.value;
      document.querySelector('[data-chars]').textContent = wform.elements.text.value.length;
      save('draft', { title: wform.elements.title.value, text: wform.elements.text.value, cat: wform.elements.cat.value, cover: wform.elements.cover.value });
    };
    wform.addEventListener('input', upd);
    wform.addEventListener('change', upd);
    upd();
    document.querySelectorAll('[data-insert]').forEach(function (b) {
      b.addEventListener('click', function () {
        var ta = wform.elements.text, ins = b.getAttribute('data-insert').replace(/\\n/g, '\n');
        var s = ta.selectionStart, e = ta.selectionEnd;
        ta.value = ta.value.slice(0, s) + ins + ta.value.slice(e);
        ta.focus(); ta.selectionStart = ta.selectionEnd = s + ins.length; upd();
      });
    });
    wform.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = wform.querySelector('.form__msg');
      var title = wform.elements.title.value.trim(), text = wform.elements.text.value.trim();
      if (title.length < 4 || text.length < 20) { msg.textContent = 'Додайте назву (від 4 символів) і текст (від 20 символів).'; msg.className = 'form__msg is-bad'; return; }
      var p = { id: 'p' + Date.now().toString(36), title: title, text: text, cat: wform.elements.cat.value, cover: wform.elements.cover.value, date: new Date().toISOString() };
      localPosts.push(p); save('posts', localPosts); save('draft', null);
      location.href = 'post.html?id=' + p.id;
    });
  }

  /* ---------- сторінка запису з редактора ---------- */
  var lp = document.querySelector('[data-local-post]');
  if (lp) {
    var id = new URLSearchParams(location.search).get('id');
    var post = localPosts.filter(function (p) { return p.id === id; })[0];
    if (!post) {
      lp.innerHTML = '<h1>Запис не знайдено</h1><p>Можливо, його видалено або він був створений в іншому браузері. <a href="index.html">Повернутися до стрічки</a>.</p>';
    } else {
      document.title = post.title + ' — ' + document.title;
      lp.querySelector('[data-lp-title]').textContent = post.title;
      lp.querySelector('[data-lp-cat]').textContent = CATS[post.cat] || post.cat;
      lp.querySelector('[data-lp-date]').textContent = fmtDate(post.date);
      lp.querySelector('[data-lp-cover]').className = 'post__cover cover cover--' + post.cover;
      lp.querySelector('[data-lp-body]').innerHTML = markup(post.text);
      lp.querySelector('[data-lp-del]').addEventListener('click', function () {
        if (!confirm('Видалити цей запис?')) return;
        localPosts = localPosts.filter(function (p) { return p.id !== id; }); save('posts', localPosts); location.href = 'index.html';
      });
    }
  }

  /* ---------- чек-листи в записах ---------- */
  document.querySelectorAll('[data-checklist]').forEach(function (ul) {
    var key = 'check-' + ul.getAttribute('data-checklist'), state = load(key, {});
    var boxes = ul.querySelectorAll('input[type=checkbox]'), out = document.querySelector('[data-check-progress="' + ul.getAttribute('data-checklist') + '"]');
    var sync = function () {
      var n = 0; boxes.forEach(function (b) { if (b.checked) n++; });
      if (out) out.style.setProperty('--p', (n / boxes.length * 100).toFixed(0) + '%'), out.setAttribute('data-label', n + ' з ' + boxes.length);
    };
    boxes.forEach(function (b, i) {
      b.checked = !!state[i];
      b.addEventListener('change', function () { state[i] = b.checked; save(key, state); sync(); });
    });
    sync();
  });

  /* ---------- копіювання посилання ---------- */
  document.querySelectorAll('[data-share]').forEach(function (b) {
    b.addEventListener('click', function () {
      var done = function () { b.classList.add('is-done'); b.querySelector('span').textContent = 'Посилання скопійовано'; setTimeout(function () { b.classList.remove('is-done'); b.querySelector('span').textContent = 'Поділитися'; }, 1800); };
      if (navigator.share) { navigator.share({ title: document.title, url: location.href }).catch(function () {}); return; }
      var fail = function () { b.querySelector('span').textContent = 'Скопіюйте адресу з рядка браузера'; };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(location.href).then(done, fail); else fail();
    });
  });

  /* ---------- індикатор прочитання ---------- */
  var bar = document.querySelector('.read-bar span');
  var article = document.querySelector('.post__body');
  if (bar && article) {
    var onScroll = function () {
      var r = article.getBoundingClientRect(), total = r.height - innerHeight * 0.6;
      bar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, -r.top / Math.max(total, 1))) + ')';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- поява блоків ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 0.08 + 's'; io.observe(el); });

  window.BLOG = { load: load, save: save, reduce: reduce };
})();
