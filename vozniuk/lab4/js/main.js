/* =========================================================
   «Крила» — сценарії
   1. Креслення Flyer «малюється», літачок летить маршрутом
   2. Номер аркуша, поява блоків, лічильники
   3. Симулятор підйомної сили
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Креслення і літачок ---------- */
  // для анімації «малювання» кожна лінія отримує умовну довжину 1
  document.querySelectorAll('.flyer .draw > *').forEach(function (el) { el.setAttribute('pathLength', '1'); });

  var hero = document.querySelector('.hero');
  var jet = document.querySelector('.jet');
  function setRoute() {
    var w = hero.clientWidth, h = hero.clientHeight;
    function X(v) { return Math.round(v / 1200 * w); }
    function Y(v) { return Math.round(v / 600 * h); }
    var d = 'M' + X(-60) + ' ' + Y(520) + ' C ' + X(200) + ' ' + Y(420) + ', ' + X(380) + ' ' + Y(560) + ', ' + X(600) + ' ' + Y(380) +
      ' S ' + X(1000) + ' ' + Y(120) + ', ' + X(1260) + ' ' + Y(160);
    jet.style.offsetPath = 'path("' + d + '")';
  }
  setRoute();
  window.addEventListener('resize', setRoute);

  // пробіл — «бочка»
  window.addEventListener('keydown', function (e) {
    if (e.code !== 'Space' || /INPUT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)) return;
    if (window.scrollY > window.innerHeight * 0.5) return;
    e.preventDefault();
    jet.classList.remove('roll');
    void jet.offsetWidth;
    jet.classList.add('roll');
  });

  /* ---------- 2. Аркуші та поява ---------- */
  var sheetOut = document.getElementById('sheet');
  var sheets = document.querySelectorAll('[data-sheet]');
  window.addEventListener('scroll', function () {
    var cur = 1;
    sheets.forEach(function (s) { if (s.getBoundingClientRect().top < innerHeight * 0.5) cur = s.getAttribute('data-sheet'); });
    sheetOut.textContent = cur;
  }, { passive: true });

  // рядки журналу польотів з'являються по черзі
  var pre = document.querySelector('.log pre');
  pre.innerHTML = pre.innerHTML.split('\n').filter(function (l) { return l.trim(); }).map(function (l, i) {
    return '<span class="row" style="transition-delay:' + (i * 0.15) + 's">' + l + '</span>';
  }).join('');

  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-to')), dec = String(to).indexOf('.') > -1 ? 1 : 0, t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1500, 1), v = to * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toFixed(dec).replace('.', ',');
      if (p < 1) requestAnimationFrame(frame);
    }
    if (reduce) el.textContent = String(to).replace('.', ','); else requestAnimationFrame(frame);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      e.target.querySelectorAll('[data-to]').forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 0.08 + 's';
    io.observe(el);
  });

  /* ---------- 3. Симулятор ---------- */
  var RHO = 1.225, S = 16.2, M = 1000, W = M * 9.81;
  var vIn = document.getElementById('vIn'), aIn = document.getElementById('aIn');
  var vOut = document.getElementById('vOut'), aOut = document.getElementById('aOut');
  var plane = document.getElementById('simPlane');
  var view = document.querySelector('.sim__view');
  var barLift = document.getElementById('barLift');
  var barW = document.querySelector('.bar--weight');
  var status = document.getElementById('simStatus');
  var nums = document.getElementById('simNums');

  function cl(alpha) {
    // спрощена модель: лінійне зростання до 15°, після — зрив потоку
    return alpha <= 15 ? 0.25 + 0.09 * alpha : 0.65;
  }
  function update() {
    var kmh = +vIn.value, alpha = +aIn.value, v = kmh / 3.6;
    var L = cl(alpha) * RHO * v * v / 2 * S;
    vOut.textContent = kmh;
    aOut.textContent = alpha;
    var ratio = L / W, max = 2.2;
    barLift.style.height = Math.min(ratio / max, 1) * 100 + '%';
    barW.style.height = (1 / max) * 100 + '%';
    view.style.setProperty('--spd', (kmh / 60).toFixed(2));
    var stall = alpha > 15 && kmh > 40;
    plane.classList.toggle('is-stall', stall);
    plane.style.setProperty('--a', alpha);
    var h = 0;
    if (stall) {
      status.textContent = 'Звалювання! Потік зірвався з крила';
      status.className = 'sim__status bad';
    } else if (ratio >= 1) {
      h = Math.min(130, (ratio - 1) * 160 + 30);
      status.textContent = 'Зліт! Підйомна сила більша за вагу';
      status.className = 'sim__status ok';
    } else {
      status.textContent = kmh === 0 ? 'Літак стоїть' : 'Розбіг: підйомної сили ще замало';
      status.className = 'sim__status';
    }
    plane.style.setProperty('--h', h.toFixed(0));
    nums.textContent = 'L = ' + (L / 1000).toFixed(1).replace('.', ',') + ' кН, W = ' + (W / 1000).toFixed(1).replace('.', ',') + ' кН, C_L = ' + cl(alpha).toFixed(2).replace('.', ',');
  }
  vIn.addEventListener('input', update);
  aIn.addEventListener('input', update);
  update();
})();
