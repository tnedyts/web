/* =========================================================
   «Країна вранішнього сонця» — сценарії
   1. Пори року: кольори сайту і те, що падає з неба
   2. Паралакс пейзажу з Фудзі
   3. Розмовник із синтезом мовлення, годинник Токіо
   4. Поїзд Сінкансен, журавлик-оріґамі, етикет, поява блоків
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ---------- 1. Пори року ---------- */
  function currentSeason() {
    var m = new Date().getMonth();
    return m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter';
  }
  function setSeason(s, save) {
    root.setAttribute('data-season', s);
    document.querySelectorAll('.seasons button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-season') === s ? 'true' : 'false'); });
    document.querySelectorAll('.seasons-table tbody tr').forEach(function (tr) { tr.classList.toggle('is-on', tr.getAttribute('data-season') === s); });
    if (save) { try { localStorage.setItem('nihon-season', s); } catch (e) { /* без збереження */ } }
  }
  setSeason(root.getAttribute('data-season') || currentSeason(), false);
  document.querySelectorAll('[data-season]').forEach(function (el) {
    if (el === root) return;
    el.addEventListener('click', function () { setSeason(el.getAttribute('data-season'), true); });
  });

  // пелюстки / краплі / листя / сніг
  var petals = document.querySelector('.petals');
  if (!reduce && petals) {
    for (var i = 0; i < 18; i++) {
      var p = document.createElement('i');
      p.className = 'petal';
      p.style.left = (Math.random() * 100).toFixed(1) + '%';
      p.style.animationDuration = (10 + Math.random() * 12).toFixed(1) + 's';
      p.style.animationDelay = '-' + (Math.random() * 20).toFixed(1) + 's';
      p.style.transform = 'scale(' + (0.6 + Math.random() * 0.7).toFixed(2) + ')';
      petals.appendChild(p);
    }
  }

  /* ---------- 2. Паралакс ---------- */
  var layers = document.querySelectorAll('.scene .layer');
  if (!reduce && layers.length) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 700);
        layers.forEach(function (l) { l.style.transform = 'translateY(' + (y * +l.getAttribute('data-depth') * 0.5).toFixed(1) + 'px)'; });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- 3. Розмовник ---------- */
  var canSpeak = 'speechSynthesis' in window;
  document.querySelectorAll('.say').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.say').forEach(function (x) { x.classList.remove('is-speaking'); });
      b.classList.add('is-speaking');
      setTimeout(function () { b.classList.remove('is-speaking'); }, 1500);
      if (!canSpeak) return;
      var u = new SpeechSynthesisUtterance(b.getAttribute('data-say'));
      u.lang = 'ja-JP';
      u.rate = 0.85;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    });
  });

  // годинник Токіо і різниця з Києвом
  function offsetHours(tz) {
    var d = new Date();
    var parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(d);
    var o = {};
    parts.forEach(function (x) { o[x.type] = x.value; });
    var asUTC = Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour % 24, +o.minute);
    return Math.round((asUTC - d.getTime()) / 3600000);
  }
  function tick() {
    var t = new Intl.DateTimeFormat('uk-UA', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit' }).format(new Date());
    document.querySelectorAll('[data-tokyo]').forEach(function (el) { el.textContent = t; });
  }
  if (document.querySelector('[data-tokyo]')) {
    try {
      tick();
      setInterval(tick, 10000);
      var diff = offsetHours('Asia/Tokyo') - offsetHours('Europe/Kyiv');
      document.querySelectorAll('[data-diff]').forEach(function (el) { el.textContent = diff; });
    } catch (e) { /* старий браузер без часових поясів */ }
  }

  /* ---------- 4. Сінкансен ---------- */
  var line = document.getElementById('routeLine');
  if (line) {
    var train = document.getElementById('train'), info = document.getElementById('routeInfo');
    var len = line.getTotalLength();
    var place = function (f) {
      var pt = line.getPointAtLength(f * len), pt2 = line.getPointAtLength(Math.min(len, f * len + 1));
      var a = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI;
      train.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ') rotate(' + a.toFixed(1) + ')');
    };
    place(0);
    var running = false;
    document.getElementById('go').addEventListener('click', function () {
      if (running) return;
      running = true;
      var t0 = null, dur = reduce ? 1 : 5200;
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        place(e);
        info.textContent = e < .3 ? 'Виїжджаємо з Токіо…' : e < .5 ? 'Праворуч — гора Фудзі!' : e < .85 ? 'Кіото: тисячолітня столиця' : 'Осака! Близько 2,5 години в дорозі';
        if (p < 1) requestAnimationFrame(step);
        else { running = false; setTimeout(function () { place(0); info.textContent = 'Токіо → Осака: близько 500 км'; }, 2500); }
      });
    });
  }

  /* ---------- журавлик-оріґамі ---------- */
  var crane = document.getElementById('crane');
  if (crane) {
    // чотири кроки; у кожному — ті самі чотири чотирикутники
    var STEPS = [
      ['M40 40 L160 40 L160 160 L40 160 Z', 'M100 100 L100 100 L100 100 L100 100 Z', 'M100 100 L100 100 L100 100 L100 100 Z', 'M100 100 L100 100 L100 100 L100 100 Z'],
      ['M40 150 L100 60 L160 150 L100 150 Z', 'M100 60 L100 150 L100 150 L100 60 Z', 'M100 100 L100 100 L100 100 L100 100 Z', 'M100 100 L100 100 L100 100 L100 100 Z'],
      ['M100 36 L142 110 L100 172 L58 110 Z', 'M100 36 L100 172 L100 172 L100 36 Z', 'M100 110 L100 110 L100 110 L100 110 Z', 'M100 110 L100 110 L100 110 L100 110 Z'],
      ['M70 122 L100 102 L132 122 L100 134 Z', 'M100 106 L58 44 L82 114 L100 114 Z', 'M100 106 L148 50 L122 114 L100 114 Z', 'M74 122 L38 84 L30 90 L72 128 Z']
    ];
    var NAMES = ['Крок 1 з 4: квадратний аркуш паперу', 'Крок 2 з 4: складаємо навскіс', 'Крок 3 з 4: базова форма «птах»', 'Крок 4 з 4: журавлик готовий!'];
    var fills = ['var(--accent)', 'rgba(255,255,255,.35)', 'var(--accent)', 'var(--red)'];
    crane.innerHTML = STEPS[0].map(function (d, k) { return '<path style="d:path(\'' + d + '\');fill:' + fills[k] + ';stroke:rgba(0,0,0,.2);stroke-width:1;transition:d .8s cubic-bezier(.5,0,.3,1)"/>'; }).join('');
    var paths = crane.querySelectorAll('path'), stepN = 0;
    var count = 0;
    try { count = +localStorage.getItem('nihon-cranes') || 0; } catch (e) { count = 0; }
    var countEl = document.getElementById('craneCount'), stepEl = document.getElementById('craneStep');
    countEl.textContent = count;
    var show = function () {
      paths.forEach(function (p, k) { p.style.d = "path('" + STEPS[stepN][k] + "')"; });
      stepEl.textContent = NAMES[stepN];
    };
    document.getElementById('foldBtn').addEventListener('click', function () {
      if (stepN >= 3) { stepN = 0; show(); return; }
      stepN++;
      show();
      if (stepN === 3) {
        count = Math.min(1000, count + 1);
        countEl.textContent = count;
        try { localStorage.setItem('nihon-cranes', count); } catch (e) { /* без збереження */ }
      }
    });
    document.getElementById('unfoldBtn').addEventListener('click', function () { stepN = 0; show(); });
  }

  /* ---------- етикет ---------- */
  document.querySelectorAll('.tf').forEach(function (b) {
    b.addEventListener('click', function () { b.classList.toggle('is-open'); });
  });

  /* ---------- лічильники і поява ---------- */
  function countUp(el) {
    var target = +el.getAttribute('data-to'), from = target > 1000 ? target - 200 : 0, t0 = null;
    if (reduce) return;
    requestAnimationFrame(function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1300, 1);
      el.textContent = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3)));
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

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-top]')) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }
  });
})();
