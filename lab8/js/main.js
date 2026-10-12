/* ЗЕРНО — анімації журналу: друк ризографа, кава заливає екран, калькулятор */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';

  /* ---------- Курсор-зернятко ---------- */
  var bean = document.querySelector('.bean-cursor');
  if (bean && fine && !reduce) {
    document.body.classList.add('has-bean');
    var bx = 0;
    var by = 0;
    var tx = 0;
    var ty = 0;
    var ang = 0;
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      var dx = tx - bx;
      var dy = ty - by;
      bx += dx * 0.25;
      by += dy * 0.25;
      if (Math.abs(dx) + Math.abs(dy) > 2) ang += ((Math.atan2(dy, dx) * 180 / Math.PI + 90) - ang) * 0.15;
      bean.style.transform = 'translate(' + bx + 'px,' + by + 'px) rotate(' + ang + 'deg)';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, .knob, input').forEach(function (el) {
      el.addEventListener('pointerenter', function () { bean.classList.add('is-big'); });
      el.addEventListener('pointerleave', function () { bean.classList.remove('is-big'); });
    });
  } else if (bean) bean.style.display = 'none';

  /* ---------- Мобільне меню ---------- */
  var mt = document.querySelector('.menu-toggle');
  if (mt) {
    var list = document.querySelector('#nav ul');
    if (window.matchMedia('(max-width: 980px)').matches) list.hidden = true;
    mt.addEventListener('click', function () {
      list.hidden = !list.hidden;
      mt.setAttribute('aria-expanded', list.hidden ? 'false' : 'true');
    });
  }

  /* ---------- Калькулятор заварювання ---------- */
  var METHODS = {
    espresso: { name: 'Еспресо', dose: 18, ratio: 2, temp: '93 °C', time: '25–30 с', grind: 'дуже дрібний', unit: 'мл напою' },
    v60: { name: 'Пуровер V60', dose: 15, ratio: 16, temp: '94 °C', time: '2,5–3 хв', grind: 'середній', unit: 'мл води' },
    french: { name: 'Френч-прес', dose: 17, ratio: 15, temp: '95 °C', time: '4 хв', grind: 'грубий', unit: 'мл води' },
    aeropress: { name: 'Аеропрес', dose: 15, ratio: 14, temp: '85–90 °C', time: '2 хв', grind: 'середньо-дрібний', unit: 'мл води' },
    cezve: { name: 'Джезва', dose: 7, ratio: 10, temp: 'до піни', time: '2–3 хв', grind: 'як пудра', unit: 'мл води' },
    cold: { name: 'Колд-брю', dose: 30, ratio: 8, temp: 'холодна', time: '12–24 год', grind: 'дуже грубий', unit: 'мл води' }
  };
  var knob = document.querySelector('.knob');
  if (knob) {
    var dial = knob.querySelector('.knob__dial');
    var cupsOut = document.getElementById('cups');
    var state = { method: 'v60', cups: 2 };
    var out = {
      dose: document.getElementById('oDose'), water: document.getElementById('oWater'), unit: document.getElementById('oUnit'),
      temp: document.getElementById('oTemp'), time: document.getElementById('oTime'), grind: document.getElementById('oGrind')
    };
    function render() {
      var m = METHODS[state.method];
      var dose = m.dose * state.cups;
      var water = dose * m.ratio;
      cupsOut.textContent = state.cups;
      knob.setAttribute('aria-valuenow', state.cups);
      knob.setAttribute('aria-valuetext', state.cups + ' порц.');
      dial.style.transform = 'rotate(' + ((state.cups - 1) / 7 * 270 - 135) + 'deg)';
      var set = function (el, v) {
        if (hasGsap && !reduce && el.textContent !== v) {
          gsap.fromTo(el, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'back.out(2)' });
        }
        el.textContent = v;
      };
      set(out.dose, dose + ' г');
      set(out.water, Math.round(water) + '');
      out.unit.textContent = m.unit;
      set(out.temp, m.temp);
      set(out.time, m.time);
      set(out.grind, m.grind);
    }
    document.querySelectorAll('.methods button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.method = b.getAttribute('data-m');
        document.querySelectorAll('.methods button').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        render();
      });
    });
    var dragging = false;
    function fromPointer(e) {
      var r = knob.getBoundingClientRect();
      var a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI + 90;
      if (a > 180) a -= 360;
      a = Math.max(-135, Math.min(135, a));
      var c = Math.round((a + 135) / 270 * 7) + 1;
      if (c !== state.cups) { state.cups = c; render(); }
    }
    knob.addEventListener('pointerdown', function (e) { dragging = true; knob.setPointerCapture(e.pointerId); fromPointer(e); });
    knob.addEventListener('pointermove', function (e) { if (dragging) fromPointer(e); });
    knob.addEventListener('pointerup', function () { dragging = false; });
    knob.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { state.cups = Math.min(8, state.cups + 1); render(); e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { state.cups = Math.max(1, state.cups - 1); render(); e.preventDefault(); }
    });
    knob.addEventListener('wheel', function (e) {
      e.preventDefault();
      state.cups = Math.max(1, Math.min(8, state.cups + (e.deltaY < 0 ? 1 : -1)));
      render();
    }, { passive: false });
    render();
  }

  /* ---------- Шкала обсмаження ---------- */
  var roast = document.getElementById('roastRange');
  if (roast) {
    var beanFill = document.getElementById('beanFill');
    var beanOrange = document.getElementById('beanOrange');
    var rOut = document.getElementById('roastOut');
    var levels = [
      [0, 'Зелене зерно — ще не обсмажене, пахне травою'],
      [25, 'Світле обсмаження — кислинка, квіти, ягоди'],
      [50, 'Середнє — карамель, горіхи, баланс'],
      [75, 'Темне — гірка шоколадна нота, олія на поверхні'],
      [100, 'Дуже темне — дим і гіркота, смак походження зникає']
    ];
    function upd() {
      var v = parseInt(roast.value, 10);
      beanFill.style.opacity = (v / 100).toFixed(2);
      beanOrange.style.opacity = (1 - Math.abs(v - 45) / 55).toFixed(2);
      var best = levels[0];
      levels.forEach(function (l) { if (v >= l[0] - 12) best = l; });
      rOut.textContent = best[1];
    }
    roast.addEventListener('input', upd);
    upd();
  }

  /* ---------- Чашка-індикатор ---------- */
  var cupFill = document.getElementById('cupFill');
  var cupSteam = document.querySelector('.cup .steam');
  function cupUpd() {
    if (!cupFill) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? window.scrollY / max : 1;
    cupFill.setAttribute('y', (40 - 26 * p).toFixed(2));
    cupFill.setAttribute('height', (26 * p).toFixed(2));
    if (cupSteam) cupSteam.style.opacity = p > 0.97 ? 1 : 0;
  }
  window.addEventListener('scroll', cupUpd, { passive: true });
  cupUpd();

  /* ---------- Перехід: кава заливає екран ---------- */
  var pour = document.querySelector('.pour');
  var pourSvg = pour ? pour.querySelector('svg') : null;
  var waves = pour ? pour.querySelectorAll('path') : [];
  function wave(t, amp, ph, base) {
    var d = 'M0 ' + (base + Math.sin(t + ph) * amp).toFixed(2);
    for (var x = 0; x <= 100; x += 4) d += ' L' + x + ' ' + (base + Math.sin(t + ph + x * 0.12) * amp + Math.sin(t * 1.7 + x * 0.21) * amp * 0.4).toFixed(2);
    return d + ' L100 1000 L0 1000 Z';
  }
  var pourAnim = null;
  function animateWaves() {
    var t0 = performance.now();
    (function f(now) {
      var t = (now - t0) / 1000 * 4;
      if (waves[0]) waves[0].setAttribute('d', wave(t, 10, 1.6, 30));
      if (waves[1]) waves[1].setAttribute('d', wave(t, 12, 0, 70));
      pourAnim = requestAnimationFrame(f);
    })(t0);
  }
  if (pour && hasGsap) {
    animateWaves();
    var html = document.documentElement;
    if (html.classList.contains('pour-in')) {
      try { sessionStorage.removeItem('pour'); } catch (e) { /* ignore */ }
      gsap.fromTo(pourSvg, { top: '-20%' }, {
        top: '100%', duration: reduce ? 0.01 : 1.2, ease: 'power3.inOut', delay: 0.15,
        onComplete: function () { html.classList.remove('pour-in'); gsap.set(pourSvg, { clearProps: 'top' }); cancelAnimationFrame(pourAnim); }
      });
    } else cancelAnimationFrame(pourAnim);
    document.querySelectorAll('a[href$=".html"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || reduce) return;
        e.preventDefault();
        var href = a.getAttribute('href');
        animateWaves();
        try { sessionStorage.setItem('pour', '1'); } catch (err) { /* ignore */ }
        gsap.fromTo(pourSvg, { top: '100%' }, { top: '-20%', duration: 0.9, ease: 'power3.in', onComplete: function () { window.location.href = href; } });
      });
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) { gsap.set(pourSvg, { top: '100%' }); html.classList.remove('pour-in'); } });
  }

  if (!hasGsap) return;
  gsap.registerPlugin(ScrollTrigger);

  if (!reduce && typeof window.Lenis !== 'undefined') {
    var lenis = new Lenis({ lerp: 0.1 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  if (reduce) return;

  /* ---------- Шапка: літери «друкуються» ---------- */
  var mh = document.querySelector('.masthead h1');
  if (mh) {
    var txt = mh.textContent;
    mh.innerHTML = txt.split('').map(function (c) { return '<span class="l">' + c + '</span>'; }).join('');
    gsap.from(mh.querySelectorAll('.l'), { yPercent: -120, rotate: function () { return gsap.utils.random(-25, 25); }, opacity: 0, duration: 1.1, ease: 'bounce.out', stagger: 0.08, delay: 0.5 });
    gsap.fromTo(mh, { '--dx': '34px', '--dy': '-22px' }, { '--dx': '7px', '--dy': '5px', duration: 1.6, ease: 'expo.out', delay: 1.1 });
  }
  gsap.from('#nav li', { x: 60, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07, delay: 0.7 });
  gsap.from('.note', { scale: 0, rotate: -40, duration: 1, ease: 'back.out(2)', delay: 1.6 });

  /* ---------- Друк із зсувом: синій шар «доїжджає» до помаранчевого ---------- */
  gsap.utils.toArray('.title.riso, .pull.riso, h3.riso').forEach(function (el) {
    var small = !el.classList.contains('title');
    gsap.fromTo(el, { '--dx': '-22px', '--dy': '14px' }, { '--dx': small ? '2px' : '4px', '--dy': small ? '2px' : '3px', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
    gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
  gsap.utils.toArray('.deck, .body > p, .facts li, .toc li, .spec tr, .steps div, .big-num div, .brew, .roast, .btn').forEach(function (el) {
    gsap.from(el, { y: 36, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
  });

  /* ---------- Постери: «приклеюються» до стіни ---------- */
  gsap.utils.toArray('.poster, .coupon, .badge').forEach(function (p, i) {
    var r = (i % 2 ? 1 : -1) * gsap.utils.random(3, 8);
    gsap.fromTo(p, { rotate: r, y: 120, opacity: 0, scale: 0.9 }, {
      rotate: (i % 3 - 1) * 0.8, y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: p, start: 'top 95%' }
    });
  });
  /* легкий паралакс стіни постерів */
  gsap.utils.toArray('.poster svg.art').forEach(function (a) {
    gsap.fromTo(a, { yPercent: -4, scale: 1.08 }, { yPercent: 4, scale: 1.08, ease: 'none', scrollTrigger: { trigger: a, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  document.querySelectorAll('.count').forEach(function (el) {
    var to = parseFloat(el.getAttribute('data-to'));
    var o = { v: 0 };
    gsap.to(o, {
      v: to, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' },
      onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString('uk-UA'); }
    });
  });

  /* ---------- Чек вилазить із касового апарата ---------- */
  var rc = document.querySelector('.receipt');
  if (rc) gsap.from(rc, { yPercent: -60, clipPath: 'inset(0 0 100% 0)', duration: 1.6, ease: 'steps(14)', scrollTrigger: { trigger: '.receipt-wrap', start: 'top 80%' } });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
