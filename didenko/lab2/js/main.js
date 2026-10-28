/* «Смак Полісся» — логіка блогу */
(function () {
  var html = document.documentElement, SHOT = html.classList.contains('shot');
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var MONTHS = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
  var MONTHS_N = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];

  /* ---------- сховище ---------- */
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  var BASE_LIKES = { babka: 48, deruny: 63, yushka: 37, syrnyky: 71, uzvar: 29, chornytsia: 54, kapusta: 22, zelenyi: 31, varenyky: 66, mlyntsi: 40 };
  var SEED_COMMENTS = {
    babka: [{ n: 'Оксана з Малина', t: 'Моя бабця теж казала, що в бабці мають бути «зуби»! Спекла за вашим рецептом — чоловік попросив добавки двічі.', d: '2026-10-13' }, { n: 'Тарас', t: 'А можна без сала, на олії? Хочу пісний варіант на піст.', d: '2026-10-14' }],
    deruny: [{ n: 'Ірина', t: 'Порада з цибулевим соком — геніальна, картопля справді не темніє.', d: '2026-09-29' }],
    syrnyky: [{ n: 'Марта', t: 'Нарешті сирники не розпливаються! Манка — це секрет.', d: '2026-08-17' }, { n: 'Дмитро', t: 'Додав трохи цедри лимона — дуже раджу.', d: '2026-08-20' }],
    chornytsia: [{ n: 'Лєна з Олевська', t: 'Наші ягоди найсмачніші, підтверджую 😊 Пиріг вийшов як із кав’ярні.', d: '2026-07-06' }],
    varenyky: [{ n: 'Наталя', t: 'Ліпили всією родиною в неділю, дякую за натхнення!', d: '2026-04-06' }]
  };

  function allPosts() {
    var user = LS.get('smak_user_posts', []);
    return user.concat(window.POSTS).sort(function (a, b) { return b.date.localeCompare(a.date); });
  }
  function find(id) { return allPosts().filter(function (p) { return p.id === id; })[0]; }
  function words(p) { return (p.story.join(' ') + ' ' + p.steps.join(' ') + ' ' + (p.tip || '')).split(/\s+/).length; }
  function readMin(p) { return Math.max(1, Math.round(words(p) / 140)); }
  function fmt(d) { var x = d.split('-'); return +x[2] + ' ' + MONTHS[+x[1] - 1] + ' ' + x[0]; }
  function likes(id) { var L = LS.get('smak_likes', {}); return (BASE_LIKES[id] || 0) + (L[id] ? 1 : 0); }
  function comments(id) { return (SEED_COMMENTS[id] || []).concat(LS.get('smak_comments', {})[id] || []); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function catName(c) { return (CATS[c] || { name: 'Інше' }).name; }

  function toast(msg) {
    var t = $('.toast'); t.innerHTML = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* ---------- прелоадер, меню, переходи ---------- */
  function hidePre() { var p = $('#preloader'); if (p) { p.classList.add('done'); setTimeout(function () { p.remove(); }, 600); } }
  if (SHOT) hidePre(); else { window.addEventListener('load', function () { setTimeout(hidePre, 300); }); setTimeout(hidePre, 1000); }
  var burger = $('.burger'), nav = $('.nav');
  burger && burger.addEventListener('click', function () { var o = nav.classList.toggle('open'); burger.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); });
  var page = document.body.getAttribute('data-page');
  $$('.nav a').forEach(function (a) { if (a.getAttribute('data-p') === page) a.classList.add('active'); });
  window.addEventListener('scroll', function () { $('.header').classList.toggle('scrolled', scrollY > 20); }, { passive: true });
  document.body.classList.add('ready');
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a || SHOT || REDUCED || e.ctrlKey || e.metaKey || a.target === '_blank') return;
    var h = a.getAttribute('href'); if (!h || h.charAt(0) === '#' || /^(https?:|mailto:)/.test(h)) return;
    e.preventDefault(); document.body.classList.add('leaving'); setTimeout(function () { location.href = h; }, 350);
  });
  window.addEventListener('pageshow', function () { document.body.classList.remove('leaving'); });

  /* ---------- reveal / лічильники ---------- */
  function countUp(el) {
    var end = +el.getAttribute('data-count');
    if (SHOT || REDUCED) { el.textContent = end; return; }
    var t0 = performance.now(); (function f(t) { var k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  function reveal(root) {
    var els = $$('.reveal:not(.in), [data-count]:not(.counted)', root || document);
    if (SHOT || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); if (e.hasAttribute('data-count')) { e.classList.add('counted'); countUp(e); } }); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); if (x.target.hasAttribute('data-count') && !x.target.classList.contains('counted')) { x.target.classList.add('counted'); countUp(x.target); } io.unobserve(x.target); } }); }, { threshold: .12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- паралакс ---------- */
  var par = $$('[data-par]');
  if (par.length && !SHOT && !REDUCED) window.addEventListener('scroll', function () { par.forEach(function (el) { el.style.transform = 'translateY(' + (scrollY * +el.getAttribute('data-par')).toFixed(1) + 'px)'; }); }, { passive: true });

  /* ---------- підписка ---------- */
  $$('.subscribe').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var inp = $('input', f), v = inp.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) { f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake', 'bad'); $('.sub-msg', f.parentNode).textContent = 'Перевірте адресу — схоже, в ній помилка.'; return; }
      var subs = LS.get('smak_subs', []); if (subs.indexOf(v) < 0) subs.push(v); LS.set('smak_subs', subs);
      f.classList.remove('bad'); f.parentNode.classList.add('subbed'); $('.sub-msg', f.parentNode).textContent = 'Готово! Щонеділі — новий рецепт у вашій скриньці.';
      toast('💌 Ви підписалися на «Смак Полісся»');
    });
  });

  /* ---------- картка запису ---------- */
  function card(p, i, big) {
    return '<article class="card reveal' + (big ? ' card-big' : '') + '" style="--i:' + (i % 3) + '"><a href="post.html?id=' + encodeURIComponent(p.id) + '" class="card-link" aria-label="' + esc(p.title) + '"></a>' +
      '<div class="card-img">' + dishSVG(p.dish, { label: p.title }) + '<span class="cat-tag" style="--c:' + (CATS[p.cat] || {}).color + '">' + catName(p.cat) + '</span></div>' +
      '<div class="card-body"><div class="meta"><span>' + fmt(p.date) + '</span><span>·</span><span>' + readMin(p) + ' хв читання</span></div><h3>' + esc(p.title) + '</h3><p>' + esc(p.excerpt) + '</p>' +
      '<div class="card-foot"><span class="tags">' + p.tags.map(function (t) { return '#' + esc(t); }).join(' ') + '</span><span class="stats"><span>♥ ' + likes(p.id) + '</span><span>💬 ' + comments(p.id).length + '</span></span></div></div></article>';
  }

  var pages = {
    home: function () {
      var P = allPosts(), st = { cat: 'all', tag: '', q: '', shown: 6 };
      var prm = new URLSearchParams(location.search); if (prm.get('cat')) st.cat = prm.get('cat'); if (prm.get('tag')) st.tag = prm.get('tag');
      $('#heroDish').innerHTML = dishSVG('deruny', { label: 'Деруни зі сметаною' });
      $('#heroDish2').innerHTML = dishSVG('uzvar', { label: 'Узвар' });
      var f = P[0]; $('#featured').innerHTML = card(f, 0, true);
      $('#cats').innerHTML = '<button class="pill" data-cat="all">Усі рецепти</button>' + Object.keys(CATS).map(function (k) { return '<button class="pill" data-cat="' + k + '" style="--c:' + CATS[k].color + '">' + CATS[k].name + ' <small>' + P.filter(function (p) { return p.cat === k; }).length + '</small></button>'; }).join('');
      var tags = {}; P.forEach(function (p) { p.tags.forEach(function (t) { tags[t] = (tags[t] || 0) + 1; }); });
      $('#tagcloud').innerHTML = Object.keys(tags).sort().map(function (t) { return '<button class="tag" data-tag="' + esc(t) + '" style="font-size:' + (.85 + tags[t] * .07) + 'rem">#' + esc(t) + '</button>'; }).join('');
      $('#popular').innerHTML = P.slice().sort(function (a, b) { return likes(b.id) - likes(a.id); }).slice(0, 4).map(function (p, i) { return '<li><a href="post.html?id=' + p.id + '"><span class="pn">0' + (i + 1) + '</span><span><b>' + esc(p.title) + '</b><i>♥ ' + likes(p.id) + '</i></span></a></li>'; }).join('');
      function render() {
        var q = st.q.toLowerCase();
        var list = P.filter(function (p) { return (st.cat === 'all' || p.cat === st.cat) && (!st.tag || p.tags.indexOf(st.tag) > -1) && (!q || (p.title + ' ' + p.excerpt + ' ' + p.story.join(' ') + ' ' + p.ingredients.map(function (x) { return x[0]; }).join(' ')).toLowerCase().indexOf(q) > -1); });
        $$('[data-cat]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-cat') === st.cat); });
        $$('[data-tag]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-tag') === st.tag); });
        var info = []; if (st.cat !== 'all') info.push('рубрика «' + catName(st.cat) + '»'); if (st.tag) info.push('тег #' + st.tag); if (st.q) info.push('запит «' + esc(st.q) + '»');
        $('#feedInfo').innerHTML = (info.length ? 'Фільтр: ' + info.join(', ') + ' — ' : '') + '<b>' + list.length + '</b> ' + (list.length === 1 ? 'рецепт' : list.length > 1 && list.length < 5 ? 'рецепти' : 'рецептів') + (info.length ? ' <button class="link" id="clearF">скинути</button>' : '');
        var feed = $('#feed');
        feed.innerHTML = list.length ? list.slice(0, st.shown).map(function (p, i) { return card(p, i); }).join('') : '<div class="nothing"><span>🥄</span><h3>Такого рецепта поки немає</h3><p>Спробуйте інше слово — наприклад, «гриби» чи «чорниця».</p></div>';
        $('#more').hidden = list.length <= st.shown;
        reveal(feed);
        var c = $('#clearF'); c && c.addEventListener('click', function () { st = { cat: 'all', tag: '', q: '', shown: 6 }; $('#search').value = ''; render(); });
      }
      document.addEventListener('click', function (e) {
        var b = e.target.closest('[data-cat],[data-tag]'); if (!b) return;
        if (b.hasAttribute('data-cat')) st.cat = b.getAttribute('data-cat'); else st.tag = st.tag === b.getAttribute('data-tag') ? '' : b.getAttribute('data-tag');
        st.shown = 6; render(); if (b.closest('.side')) $('#feedTop').scrollIntoView({ behavior: 'smooth' });
      });
      var tm; $('#search').addEventListener('input', function () { clearTimeout(tm); var v = this.value; tm = setTimeout(function () { st.q = v.trim(); st.shown = 6; render(); }, 180); });
      $('#more').addEventListener('click', function () { st.shown += 6; render(); });
      $('#postCount').setAttribute('data-count', P.length);
      render();
    },

    post: function () {
      var id = new URLSearchParams(location.search).get('id'), P = allPosts(), p = find(id) || P[0];
      document.title = p.title + ' — Смак Полісся';
      var idx = P.indexOf(p), prev = P[idx + 1], next = P[idx - 1];
      $('#pCat').textContent = catName(p.cat); $('#pCat').style.setProperty('--c', (CATS[p.cat] || {}).color);
      $('#pCat').href = 'index.html?cat=' + p.cat;
      $('#pTitle').textContent = p.title;
      $('#pMeta').innerHTML = '<span>📅 ' + fmt(p.date) + '</span><span>⏱ ' + readMin(p) + ' хв читання</span><span>🍲 ' + p.time + '</span><span>👩‍🍳 ' + p.level + '</span>';
      $('#pImg').innerHTML = dishSVG(p.dish, { label: p.title });
      $('#pStory').innerHTML = p.story.map(function (t, i) { return '<p' + (i === 0 ? ' class="lead"' : '') + '>' + esc(t) + '</p>'; }).join('');
      $('#pTags').innerHTML = p.tags.map(function (t) { return '<a href="index.html?tag=' + encodeURIComponent(t) + '">#' + esc(t) + '</a>'; }).join('');
      /* інгредієнти + калькулятор порцій */
      var base = p.servings, cur = base;
      function nice(v) { if (v >= 10) return Math.round(v); var r = Math.round(v * 4) / 4; var w = Math.floor(r), fr = r - w, map = { .25: '¼', .5: '½', .75: '¾' }; return fr ? (w ? w : '') + map[fr] : String(w); }
      function plural(n) { return n % 10 === 1 && n % 100 !== 11 ? 'порція' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'порції' : 'порцій'; }
      function renderIng() {
        $('#srv').textContent = cur; $('#srvW').textContent = plural(cur);
        $('#ing').innerHTML = p.ingredients.map(function (x, i) {
          var q = typeof x[1] === 'number' ? nice(x[1] * cur / base) : x[1];
          return '<li><label><input type="checkbox"><span class="box"></span><span class="iname">' + esc(x[0]) + '</span><span class="dots"></span><b class="qty">' + q + ' ' + esc(x[2] || '') + '</b></label></li>';
        }).join('');
        $$('#ing .qty').forEach(function (q) { q.classList.remove('bump'); void q.offsetWidth; q.classList.add('bump'); });
      }
      $('#srvMinus').addEventListener('click', function () { if (cur > 1) { cur--; renderIng(); } });
      $('#srvPlus').addEventListener('click', function () { if (cur < 40) { cur++; renderIng(); } });
      $$('.srv-quick button').forEach(function (b) { b.addEventListener('click', function () { cur = b.getAttribute('data-k') === 'base' ? base : Math.max(1, Math.round(base * +b.getAttribute('data-k'))); renderIng(); }); });
      renderIng();
      $('#steps').innerHTML = p.steps.map(function (s, i) { return '<li class="reveal" style="--i:' + (i % 3) + '"><button class="step-n" aria-label="Позначити крок ' + (i + 1) + '">' + (i + 1) + '</button><p>' + esc(s) + '</p></li>'; }).join('');
      $('#steps').addEventListener('click', function (e) { var b = e.target.closest('.step-n'); if (b) b.parentNode.classList.toggle('done'); });
      $('#tip').innerHTML = p.tip ? '<b>Порада від Ярослава</b><p>' + esc(p.tip) + '</p>' : ''; if (!p.tip) $('#tip').hidden = true;
      /* лайки */
      var L = LS.get('smak_likes', {}), lb = $('#like');
      function updLike() { lb.classList.toggle('on', !!L[p.id]); $('#likeN').textContent = likes(p.id); }
      lb.addEventListener('click', function () {
        L[p.id] = !L[p.id]; if (!L[p.id]) delete L[p.id]; LS.set('smak_likes', L); updLike();
        if (L[p.id]) { lb.classList.remove('burst'); void lb.offsetWidth; lb.classList.add('burst'); toast('♥ Дякую! Рецепт збережено у вподобаних'); }
      });
      updLike();
      $('#share').addEventListener('click', function () { var u = location.href.replace(/[?&]shot=1/, ''); try { navigator.clipboard.writeText(u).then(function () { toast('🔗 Посилання скопійовано'); }, function () { toast('Скопіюйте адресу з рядка браузера'); }); } catch (e) { toast('Скопіюйте адресу з рядка браузера'); } });
      $('#print').addEventListener('click', function () { window.print(); });
      /* коментарі */
      function renderC() {
        var C = comments(p.id); $('#cN').textContent = C.length;
        $('#clist').innerHTML = C.length ? C.map(function (c) { var ini = c.n.trim().charAt(0).toUpperCase(); return '<li class="reveal in"><span class="ava" style="--h:' + ((ini.charCodeAt(0) * 37) % 360) + '">' + esc(ini) + '</span><div><b>' + esc(c.n) + '</b><time>' + fmt(c.d) + '</time><p>' + esc(c.t) + '</p></div></li>'; }).join('') : '<li class="noc">Коментарів ще немає — будьте першим!</li>';
      }
      renderC();
      $('#cform').addEventListener('submit', function (e) {
        e.preventDefault(); var n = this.cname.value.trim(), t = this.ctext.value.trim();
        if (n.length < 2 || t.length < 3) { this.classList.remove('shake'); void this.offsetWidth; this.classList.add('shake'); toast('Вкажіть ім’я та текст коментаря'); return; }
        var all = LS.get('smak_comments', {}); (all[p.id] = all[p.id] || []).push({ n: n, t: t, d: new Date().toISOString().slice(0, 10) });
        if (!LS.set('smak_comments', all)) toast('Не вдалося зберегти (localStorage недоступний)');
        this.ctext.value = ''; renderC(); toast('💬 Коментар додано'); var last = $('#clist li:last-child'); last && last.classList.add('new');
      });
      /* навігація та схожі */
      $('#pnav').innerHTML = (prev ? '<a class="pn-prev" href="post.html?id=' + prev.id + '"><small>← Попередній</small><b>' + esc(prev.title) + '</b></a>' : '<span></span>') + (next ? '<a class="pn-next" href="post.html?id=' + next.id + '"><small>Наступний →</small><b>' + esc(next.title) + '</b></a>' : '<span></span>');
      var rel = P.filter(function (x) { return x !== p && (x.cat === p.cat || x.tags.some(function (t) { return p.tags.indexOf(t) > -1; })); }).slice(0, 3);
      $('#related').innerHTML = rel.map(function (p, i) { return card(p, i); }).join('');
      /* прогрес читання */
      var bar = $('#progress');
      function prog() { var a = $('.article'), r = a.getBoundingClientRect(), tot = a.offsetHeight - innerHeight; bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, -r.top / Math.max(1, tot))) + ')'; }
      window.addEventListener('scroll', prog, { passive: true }); prog();
    },

    archive: function () {
      var P = allPosts(), groups = {};
      P.forEach(function (p) { var k = p.date.slice(0, 7); (groups[k] = groups[k] || []).push(p); });
      $('#arch').innerHTML = Object.keys(groups).sort().reverse().map(function (k, gi) {
        var m = +k.slice(5, 7);
        return '<section class="month reveal" style="--i:' + (gi % 3) + '"><h2><span>' + MONTHS_N[m - 1] + '</span> ' + k.slice(0, 4) + '<small>' + groups[k].length + '</small></h2><ul>' + groups[k].map(function (p) {
          return '<li><a href="post.html?id=' + p.id + '"><span class="ad">' + p.date.slice(8) + '</span><span class="ai">' + dishSVG(p.dish) + '</span><span class="at"><b>' + esc(p.title) + '</b><i>' + catName(p.cat) + ' · ' + readMin(p) + ' хв · ♥ ' + likes(p.id) + '</i></span></a></li>';
        }).join('') + '</ul></section>';
      }).join('');
      var counts = Object.keys(CATS).map(function (k) { return [k, P.filter(function (p) { return p.cat === k; }).length]; }), mx = Math.max.apply(null, counts.map(function (c) { return c[1]; }));
      $('#catBars').innerHTML = counts.map(function (c) { return '<a href="index.html?cat=' + c[0] + '" class="cbar"><span>' + CATS[c[0]].name + '</span><i style="--w:' + (c[1] / mx) + ';--c:' + CATS[c[0]].color + '"></i><b>' + c[1] + '</b></a>'; }).join('');
      var tw = P.reduce(function (s, p) { return s + words(p); }, 0);
      $('#aStats').innerHTML = '<div><b data-count="' + P.length + '">0</b><span>записів</span></div><div><b data-count="' + tw + '">0</b><span>слів</span></div><div><b data-count="' + P.reduce(function (s, p) { return s + p.ingredients.length; }, 0) + '">0</b><span>інгредієнтів</span></div>';
    },

    about: function () {
      $('#aboutDish').innerHTML = dishSVG('pie', { label: 'Пиріг з чорницею' });
      renderUAMap($('#map'), { home: { name: 'Житомир', lon: 28.66, lat: 50.25, label: 'Житомир', tip: 'Житомир — тут народжуються рецепти' }, cities: ['Київ', 'Вінниця', 'Чернігів', 'Львів', 'Одеса', 'Харків', 'Рівне', 'Дніпро'], labelBelow: true });
      /* позначки поліських місць */
      var svg = $('#map svg'), pr = window.uaProject;
      [['Коростень', 28.64, 50.95, 12, 8, 'start'], ['Олевськ', 27.65, 51.21, -12, 6, 'end'], ['Овруч', 28.81, 51.32, 12, 2, 'start']].forEach(function (c) {
        var p = pr(c[1], c[2]), g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'uamap-city polissia'); g.setAttribute('transform', 'translate(' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ')');
        g.innerHTML = '<circle r="6"/><text x="' + c[3] + '" y="' + c[4] + '" text-anchor="' + c[5] + '">' + c[0] + '</text>'; svg.appendChild(g);
      });
    },

    new: function () {
      var f = $('#editor'), mine = function () { return LS.get('smak_user_posts', []); };
      $('#ecat').innerHTML = Object.keys(CATS).map(function (k) { return '<option value="' + k + '">' + CATS[k].name + '</option>'; }).join('');
      var dishes = { deruny: 'Деруни', babka: 'Бабка', yushka: 'Суп / юшка', borshch: 'Зелений борщ', syrnyky: 'Сирники', pancakes: 'Млинці', varenyky: 'Вареники', pie: 'Пиріг', uzvar: 'Напій', kapusta: 'Заготовка в банці' };
      $('#edish').innerHTML = Object.keys(dishes).map(function (k) { return '<option value="' + k + '">' + dishes[k] + '</option>'; }).join('');
      function collect() {
        var ing = f.eing.value.split('\n').map(function (l) { var x = l.split('|').map(function (s) { return s.trim(); }); if (!x[0]) return null; var q = parseFloat((x[1] || '').replace(',', '.')); return [x[0], isNaN(q) ? (x[1] || '') : q, x[2] || '']; }).filter(Boolean);
        return {
          id: 'u' + Date.now().toString(36), title: f.etitle.value.trim(), cat: f.ecat.value, dish: f.edish.value, date: new Date().toISOString().slice(0, 10),
          tags: f.etags.value.split(',').map(function (t) { return t.trim().replace(/^#/, ''); }).filter(Boolean), servings: Math.max(1, +f.eserv.value || 4), time: f.etime.value.trim() || '—', level: 'Легко',
          excerpt: f.eexc.value.trim(), story: f.estory.value.split(/\n\s*\n|\n/).map(function (s) { return s.trim(); }).filter(Boolean),
          ingredients: ing, steps: f.esteps.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean), tip: f.etip.value.trim(), user: true
        };
      }
      function preview() {
        var p = collect();
        $('#prev').innerHTML = '<div class="card-img">' + dishSVG(p.dish) + '<span class="cat-tag" style="--c:' + CATS[p.cat].color + '">' + CATS[p.cat].name + '</span></div><div class="card-body"><div class="meta"><span>сьогодні</span><span>·</span><span>' + (p.story.length ? readMin(p) : 1) + ' хв читання</span></div><h3>' + esc(p.title || 'Назва вашого рецепта') + '</h3><p>' + esc(p.excerpt || 'Короткий анонс з’явиться тут.') + '</p><div class="card-foot"><span class="tags">' + p.tags.map(function (t) { return '#' + esc(t); }).join(' ') + '</span></div></div>';
        $('#wc').textContent = (f.estory.value.trim() ? f.estory.value.trim().split(/\s+/).length : 0);
      }
      f.addEventListener('input', preview); preview();
      function listMine() {
        var M = mine();
        $('#mine').innerHTML = M.length ? M.map(function (p) { return '<li><a href="post.html?id=' + p.id + '">' + esc(p.title) + '</a><span>' + fmt(p.date) + '</span><button data-del="' + p.id + '" aria-label="Видалити">✕</button></li>'; }).join('') : '<li class="noc">Ви ще не додали жодного рецепта.</li>';
      }
      $('#mine').addEventListener('click', function (e) { var b = e.target.closest('[data-del]'); if (!b) return; LS.set('smak_user_posts', mine().filter(function (p) { return p.id !== b.getAttribute('data-del'); })); listMine(); toast('Запис видалено'); });
      listMine();
      $('#fillDemo').addEventListener('click', function () {
        f.etitle.value = 'Печена гарбузова каша з пшоном'; f.ecat.value = 'morning'; f.edish.value = 'yushka'; f.etags.value = 'бабусине, піст'; f.eserv.value = 4; f.etime.value = '1 год';
        f.eexc.value = 'Осіння каша з печі: солодкий гарбуз, пшоно й трохи меду. Готується майже сама.';
        f.estory.value = 'Гарбузова каша — це осінь у горщику. У селі її томили в печі, а я печу в духовці в керамічних горщиках.\n\nСекрет — промити пшоно гарячою водою, щоб воно не гірчило, і не шкодувати масла.';
        f.eing.value = 'Гарбуз | 500 | г\nПшоно | 150 | г\nМолоко | 600 | мл\nМед | 2 | ст. л.\nВершкове масло | 40 | г';
        f.esteps.value = 'Наріжте гарбуз кубиками.\nПромийте пшоно гарячою водою.\nВикладіть усе в горщики, залийте молоком.\nТоміть 50 хвилин при 170 °C, додайте мед і масло.';
        f.etip.value = 'Додайте жменю родзинок за 10 хвилин до готовності.'; preview();
      });
      f.addEventListener('submit', function (e) {
        e.preventDefault(); var p = collect(), err = [];
        if (p.title.length < 5) err.push('назва (від 5 символів)'); if (p.excerpt.length < 10) err.push('анонс'); if (!p.story.length) err.push('історія'); if (!p.ingredients.length) err.push('інгредієнти'); if (!p.steps.length) err.push('кроки');
        if (err.length) { $('#eerr').textContent = 'Заповніть: ' + err.join(', ') + '.'; f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); return; }
        $('#eerr').textContent = '';
        var M = mine(); M.unshift(p); if (!LS.set('smak_user_posts', M)) { toast('Не вдалося зберегти: localStorage недоступний'); return; }
        f.reset(); preview(); listMine(); $('.published').classList.add('show'); $('#goNew').href = 'post.html?id=' + p.id;
        toast('🎉 Рецепт опубліковано у стрічці');
      });
      $('#closePub').addEventListener('click', function () { $('.published').classList.remove('show'); });
    }
  };
  if (pages[page]) pages[page]();
  reveal();
})();
