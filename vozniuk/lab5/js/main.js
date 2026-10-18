/* =========================================================
   «Читальня» — сценарії
   1. Обкладинки книжок і «книга дня»
   2. Модальне вікно, що розгортає книжку
   3. Каталог: пошук, фільтр, сортування, позначки «прочитано»
   4. Стрічка життів письменників, гортання цитат, поява блоків
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BOOKS = window.BOOKS || [];
  var COLORS = ['#7a2e2e', '#2f4f6b', '#3f5e3a', '#7a5a22', '#4b3a5e', '#2e5e5e', '#6b3a2e', '#33415e'];

  function plain(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent; }

  /* ---------- 1. Обкладинки ---------- */
  function fillCover(el, i) {
    var b = BOOKS[i];
    el.style.setProperty('--c', COLORS[i % COLORS.length]);
    if (!el.classList.contains('cover--mini')) {
      el.innerHTML = '<span class="cover__t">' + b.t + '</span><span class="cover__a">' + b.a + '</span>';
    }
    el.setAttribute('data-book', i);
  }
  document.querySelectorAll('.cover[data-book]').forEach(function (el) { fillCover(el, +el.getAttribute('data-book')); });

  var start = new Date(new Date().getFullYear(), 0, 0);
  var dayOfYear = Math.floor((new Date() - start) / 86400000);
  var bod = dayOfYear % BOOKS.length;
  document.querySelectorAll('#bookOfDay').forEach(function (el) {
    fillCover(el, bod);
    document.getElementById('bodTitle').innerHTML = BOOKS[bod].t;
    document.getElementById('bodAuthor').innerHTML = BOOKS[bod].a + ', ' + BOOKS[bod].y;
  });

  /* ---------- 2. Модальне вікно ---------- */
  var modal = document.getElementById('bookModal');
  var lastFocus = null;
  function openBook(i) {
    var b = BOOKS[i];
    lastFocus = document.activeElement;
    document.getElementById('mCover').style.setProperty('--c', COLORS[i % COLORS.length]);
    document.getElementById('mCoverTitle').innerHTML = b.t;
    document.getElementById('mAuthor').innerHTML = b.a;
    document.getElementById('mTitle').innerHTML = b.t;
    document.getElementById('mMeta').innerHTML = b.g.charAt(0).toUpperCase() + b.g.slice(1) + ', ' + b.y + ' рік';
    document.getElementById('mText').innerHTML = b.d;
    // перезапуск анімації відкривання обкладинки
    var cover = document.getElementById('mCover');
    cover.style.animation = 'none'; void cover.offsetWidth; cover.style.animation = '';
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('[data-close]').focus();
  }
  function closeBook() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener('click', function (e) {
    var c = e.target.closest('.cover[data-book]');
    if (c) { openBook(+c.getAttribute('data-book')); return; }
    if (e.target === modal || e.target.closest('[data-close]')) closeBook();
    if (e.target.closest('[data-top]')) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeBook(); });

  /* ---------- 3. Каталог ---------- */
  var KEY = 'chytalnia-read';
  var read = {};
  try { read = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { read = {}; }
  function saveRead() { try { localStorage.setItem(KEY, JSON.stringify(read)); } catch (e) { /* без збереження */ } }
  function updateProgress() {
    var n = Object.keys(read).filter(function (k) { return read[k]; }).length;
    document.querySelectorAll('#readCount').forEach(function (el) { el.textContent = n; });
    document.querySelectorAll('#readBar').forEach(function (el) { el.style.width = (n / BOOKS.length * 100) + '%'; });
  }
  updateProgress();

  var catalog = document.getElementById('catalog');
  if (catalog) {
    var tbody = catalog.querySelector('tbody');
    var rows = Array.prototype.slice.call(tbody.rows);
    var q = document.getElementById('q'), genre = document.getElementById('genre'), info = document.getElementById('catInfo');

    rows.forEach(function (tr) {
      var i = tr.getAttribute('data-i'), box = tr.querySelector('[data-read]');
      box.checked = !!read[i];
      tr.classList.toggle('is-read', box.checked);
      box.addEventListener('change', function () {
        read[i] = box.checked;
        tr.classList.toggle('is-read', box.checked);
        saveRead();
        updateProgress();
      });
    });

    var filter = function () {
      var s = q.value.trim().toLowerCase(), g = genre.value, shown = 0;
      rows.forEach(function (tr) {
        var b = BOOKS[tr.getAttribute('data-i')];
        var ok = (!s || plain(b.t + ' ' + b.a).toLowerCase().indexOf(s) > -1) && (!g || plain(b.g) === plain(g));
        tr.classList.toggle('is-hidden', !ok);
        if (ok) shown++;
      });
      info.textContent = shown ? 'Показано ' + shown + ' з ' + BOOKS.length + ' творів' : 'Нічого не знайдено. Спробуйте інший запит.';
    };
    q.addEventListener('input', filter);
    genre.addEventListener('change', filter);

    var sortKey = 'year', dir = 1;
    var sortRows = function () {
      var key = { title: 't', author: 'a', year: 'y', genre: 'g' }[sortKey];
      rows.sort(function (x, y) {
        var a = BOOKS[x.getAttribute('data-i')][key], b = BOOKS[y.getAttribute('data-i')][key];
        if (typeof a === 'number') return (a - b) * dir;
        return plain(a).replace(/[«»]/g, '').localeCompare(plain(b).replace(/[«»]/g, ''), 'uk') * dir;
      });
      // FLIP-анімація: рядки плавно переїжджають на нові місця
      var before = {};
      rows.forEach(function (tr) { before[tr.getAttribute('data-i')] = tr.getBoundingClientRect().top; });
      rows.forEach(function (tr) { tbody.appendChild(tr); });
      if (!reduce) {
        rows.forEach(function (tr) {
          var d = before[tr.getAttribute('data-i')] - tr.getBoundingClientRect().top;
          if (d) tr.animate([{ transform: 'translateY(' + d + 'px)' }, { transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.3,1,.4,1)' });
        });
      }
    };
    catalog.querySelectorAll('.sort').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var k = btn.getAttribute('data-sort');
        dir = k === sortKey ? -dir : 1;
        sortKey = k;
        catalog.querySelectorAll('.sort').forEach(function (b) { b.classList.remove('is-asc', 'is-desc'); b.closest('th').removeAttribute('aria-sort'); });
        btn.classList.add(dir > 0 ? 'is-asc' : 'is-desc');
        btn.closest('th').setAttribute('aria-sort', dir > 0 ? 'ascending' : 'descending');
        sortRows();
      });
    });
  }

  /* ---------- 4. Стрічка життів ---------- */
  var lifelines = document.getElementById('lifelines');
  if (lifelines) {
    var from = 1760, to = 1950;
    var pct = function (y) { return ((y - from) / (to - from) * 100).toFixed(2) + '%'; };
    var html = '';
    document.querySelectorAll('.writer').forEach(function (w, i) {
      var name = w.querySelector('h3').textContent;
      var yrs = w.querySelector('.writer__years').textContent.match(/(\d{4})\D+(\d{4})/);
      var c = w.querySelector('.portrait').style.getPropertyValue('--c');
      var a = +yrs[1], b = +yrs[2];
      html += '<div class="life"><span class="life__bar" style="left:' + pct(a) + ';width:calc(' + pct(b) + ' - ' + pct(a) + ');--c:' + c + ';transition-delay:' + (i * .1) + 's" title="' + name + ': ' + a + '–' + b + '">' + name.split(' ').pop() + ' ' + a + '–' + b + '</span></div>';
    });
    html += '<div class="axis">';
    for (var y = 1780; y <= 1940; y += 20) html += '<span style="left:' + pct(y) + '">' + y + '</span>';
    lifelines.innerHTML = html + '</div>';
    new IntersectionObserver(function (e, o) {
      if (e[0].isIntersecting) { lifelines.classList.add('is-on'); o.disconnect(); }
    }, { threshold: 0.3 }).observe(lifelines);
  }

  /* ---------- гортання цитат ---------- */
  var reader = document.getElementById('reader');
  if (reader) {
    var leaves = reader.querySelectorAll('.leaf'), cur = 0, num = document.getElementById('qNum');
    var go = function (n) {
      cur = Math.max(0, Math.min(leaves.length - 1, n));
      leaves.forEach(function (l, i) {
        l.classList.toggle('is-past', i < cur);
        l.classList.toggle('is-future', i > cur);
        l.style.zIndex = leaves.length - Math.abs(i - cur);
      });
      num.textContent = (cur + 1) + ' / ' + leaves.length;
      document.getElementById('prevQ').disabled = cur === 0;
      document.getElementById('nextQ').textContent = cur === leaves.length - 1 ? 'Спочатку ↺' : 'Далі →';
    };
    document.getElementById('prevQ').addEventListener('click', function () { go(cur - 1); });
    document.getElementById('nextQ').addEventListener('click', function () { go(cur === leaves.length - 1 ? 0 : cur + 1); });
    document.addEventListener('keydown', function (e) {
      if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
      if (e.key === 'ArrowRight') go(cur + 1);
      if (e.key === 'ArrowLeft') go(cur - 1);
    });
    go(0);
  }

  /* ---------- лічильники і поява ---------- */
  function countUp(el) {
    var target = +el.getAttribute('data-to'), t0 = null;
    if (reduce) { el.textContent = target; return; }
    requestAnimationFrame(function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1300, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    });
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      e.target.querySelectorAll('[data-to]').forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 0.07 + 's'; io.observe(el); });
})();
