/* =========================================================
   Блог «Мурчик і я»: кіт стежить очима за курсором,
   мурчить від погладжування, шпаргалка «мова хвоста».
   ========================================================= */
(function () {
  'use strict';
  var B = window.BLOG || { load: function (k, d) { return d; }, save: function () {}, reduce: false };

  /* ---------- зіниці стежать за курсором ---------- */
  var pupils = document.querySelectorAll('.pupil');
  if (pupils.length && !B.reduce) {
    var mx = -1, my = -1, queued = false;
    var look = function () {
      queued = false;
      pupils.forEach(function (p) {
        var r = p.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1;
        var k = Math.min(1, d / 300);
        p.setAttribute('cx', +p.getAttribute('data-cx') + dx / d * 7 * k);
        p.setAttribute('cy', +p.getAttribute('data-cy') + dy / d * 4 * k);
      });
    };
    document.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!queued) { queued = true; requestAnimationFrame(look); }
    });
  }

  /* ---------- погладити кота ---------- */
  var purr = document.querySelector('[data-purr]');
  var out = document.querySelector('[data-purr-count]'), word = document.querySelector('[data-purr-word]');
  // 1 раз, 2 рази, 5 разів, 21 раз…
  var plural = function (n) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? 'раз' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'рази' : 'разів'; };
  var show = function (n) { if (out) out.textContent = n; if (word) word.textContent = plural(n); };
  if (purr) {
    var n = B.load('purrs', 0), timer;
    show(n);
    var hearts = purr.querySelector('.hearts');
    purr.addEventListener('click', function (e) {
      n++; B.save('purrs', n);
      show(n);
      purr.classList.remove('is-purring'); void purr.offsetWidth; purr.classList.add('is-purring');
      clearTimeout(timer); timer = setTimeout(function () { purr.classList.remove('is-purring'); }, 1800);
      if (B.reduce || !hearts) return;
      for (var i = 0; i < 3; i++) {
        var h = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        var x = 290 + Math.random() * 100, y = 120 + Math.random() * 40;
        h.setAttribute('d', 'M' + x + ' ' + y + ' c-6 -10 -22 -6 -16 6 l16 14 l16 -14 c6 -12 -10 -16 -16 -6z');
        h.setAttribute('class', 'heart');
        h.style.animationDelay = i * 0.15 + 's';
        hearts.appendChild(h);
        setTimeout(function (el) { el.remove(); }, 2200, h);
      }
    });
  }

  /* ---------- мова хвоста ---------- */
  var box = document.querySelector('[data-tailbox]');
  if (box) {
    var path = box.querySelector('[data-tail-path]'), text = box.querySelector('[data-tail-out]');
    var TAILS = {
      up: ['M220 200 C255 195 262 160 262 120 C262 100 262 80 262 60', '<b>Хвіст трубою.</b> Кіт радий вас бачити: так вітаються й просять уваги. Часто кінчик хвоста ще й трохи тремтить.'],
      hook: ['M220 200 C255 195 262 160 262 110 C262 70 300 60 300 90', '<b>Знак питання.</b> Грайливий, дружній настрій: кіт зацікавлений і не проти погратися.'],
      puff: ['M220 200 C258 196 266 160 264 118 C262 96 262 80 262 64', '<b>Розпушений хвіст.</b> Страх або сильне збудження: кіт намагається здаватися більшим. Дайте йому заспокоїтися і не беріть на руки.'],
      lash: ['M220 200 C260 205 290 200 310 180 C325 165 330 150 335 140', '<b>Б’є з боку в бік.</b> Роздратування або напруження. Краще залишити кота в спокої, інакше можна отримати лапою.'],
      low: ['M220 215 C250 235 255 262 235 272 C215 280 190 280 170 278', '<b>Притиснутий хвіст.</b> Тривога, страх або погане самопочуття. Якщо кіт довго тримає хвіст так і ховається, покажіть його ветеринарові.']
    };
    var nums = function (d) { return d.match(/-?\d+(\.\d+)?/g).map(Number); };
    var current = nums(TAILS.up[0]), anim;
    var setD = function (a) { path.setAttribute('d', 'M' + a[0] + ' ' + a[1] + ' C' + a.slice(2, 8).join(' ') + ' C' + a.slice(8, 14).join(' ')); };
    box.querySelectorAll('[data-tail]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-tail'), target = nums(TAILS[key][0]), from = current.slice(), t0 = performance.now();
        box.querySelectorAll('[data-tail]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        text.innerHTML = TAILS[key][1];
        path.classList.toggle('is-puff', key === 'puff');
        path.classList.toggle('is-lash', key === 'lash' && !B.reduce);
        cancelAnimationFrame(anim);
        if (B.reduce) { current = target; setD(current); return; }
        (function step(t) {
          var k = Math.min(1, (t - t0) / 450), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          current = from.map(function (v, i) { return +(v + (target[i] - v) * e).toFixed(1); });
          setD(current);
          if (k < 1) anim = requestAnimationFrame(step);
        })(t0);
      });
    });
    setD(current);
  }
})();
