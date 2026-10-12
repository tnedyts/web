/* НЕСКІНЧЕННІСТЬ — каталог: фільтри, лупа над мініатюрами, лайтбокс */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var shots = Array.prototype.slice.call(document.querySelectorAll('.shot'));
  if (!shots.length) return;

  /* ---------- Фільтри ---------- */
  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      document.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('is-on', c === chip); c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
      document.querySelectorAll('table.gal td').forEach(function (td) {
        var cat = td.getAttribute('data-cat');
        td.classList.toggle('is-dim', f !== 'all' && cat !== f);
      });
    });
  });

  /* ---------- Відблиск і лупа ---------- */
  var lens = document.querySelector('.lens');
  var lensLabel = lens ? lens.querySelector('span') : null;
  var Z = 3.2;
  shots.forEach(function (a) {
    var img = a.querySelector('img');
    var full = a.getAttribute('href');
    var pre = null;
    a.addEventListener('pointerenter', function () {
      if (!pre) { pre = new Image(); pre.src = full; }
      if (lens && fine) {
        lens.style.backgroundImage = 'url("' + full + '"), url("' + img.getAttribute('src') + '")';
        lens.classList.add('is-on');
      }
    });
    a.addEventListener('pointermove', function (e) {
      var r = a.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      a.style.setProperty('--mx', (px * 100) + '%');
      a.style.setProperty('--my', (py * 100) + '%');
      if (lens && fine) {
        var bw = r.width * Z;
        var bh = r.height * Z;
        lens.style.left = e.clientX + 'px';
        lens.style.top = e.clientY + 'px';
        lens.style.backgroundSize = bw + 'px ' + bh + 'px';
        lens.style.backgroundPosition = (100 - px * bw) + 'px ' + (100 - py * bh) + 'px';
        if (lensLabel) lensLabel.textContent = '×' + Z.toFixed(1).replace('.', ',') + ' · ' + Math.round(px * 1920) + ', ' + Math.round(py * 1080);
      }
    });
    a.addEventListener('pointerleave', function () { if (lens) lens.classList.remove('is-on'); });
  });
  window.addEventListener('wheel', function (e) {
    if (!lens || !lens.classList.contains('is-on') || !e.altKey) return;
    e.preventDefault();
    Z = Math.max(1.5, Math.min(6, Z - e.deltaY * 0.004));
  }, { passive: false });

  /* ---------- Лайтбокс ---------- */
  var lb = document.querySelector('.lb');
  var lbImg = lb.querySelector('.lb__img');
  var lbTitle = lb.querySelector('.lb__cap h3');
  var lbText = lb.querySelector('.lb__cap p');
  var lbMeta = lb.querySelector('.lb__meta');
  var lbCount = lb.querySelector('.lb__count');
  var current = 0;
  var lastFocus = null;

  function info(i) {
    var a = shots[i];
    return {
      full: a.getAttribute('href'),
      thumb: a.querySelector('img').getAttribute('src'),
      title: a.getAttribute('data-title'),
      text: a.getAttribute('data-text'),
      meta: a.getAttribute('data-meta')
    };
  }
  function fill(i) {
    var d = info(i);
    lbImg.src = d.thumb;
    var big = new Image();
    big.onload = function () { if (current === i) lbImg.src = d.full; };
    big.src = d.full;
    lbImg.alt = d.title;
    lbTitle.textContent = d.title;
    lbText.textContent = d.text;
    lbMeta.innerHTML = d.meta + '<br>1920 × 1080 · <a href="' + d.full + '" download>завантажити</a>';
    lbCount.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(shots.length).padStart(2, '0');
  }
  function open(i) {
    current = i;
    lastFocus = document.activeElement;
    fill(i);
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    if (window.__lenis) window.__lenis.stop();
    if (lens) lens.classList.remove('is-on');
    var from = shots[i].querySelector('img').getBoundingClientRect();
    if (window.gsap && !reduce) {
      gsap.fromTo(lb.querySelector('.lb__bg'), { opacity: 0 }, { opacity: 1, duration: 0.5 });
      requestAnimationFrame(function () {
        var to = lbImg.getBoundingClientRect();
        var sx = from.width / (to.width || 1);
        var sy = from.height / (to.height || 1);
        gsap.fromTo(lbImg, {
          x: from.left + from.width / 2 - (to.left + to.width / 2),
          y: from.top + from.height / 2 - (to.top + to.height / 2),
          scaleX: sx, scaleY: sy, xPercent: -50, yPercent: -50, left: '50%', top: '46%'
        }, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.9, ease: 'expo.out' });
        gsap.fromTo('.lb__cap > *, .lb__btn, .lb__count', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.05, delay: 0.25 });
      });
    }
    lb.querySelector('.lb__close').focus();
  }
  function close() {
    var done = function () {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      if (window.__lenis) window.__lenis.start();
      if (lastFocus) lastFocus.focus();
    };
    if (window.gsap && !reduce) {
      var to = shots[current].querySelector('img').getBoundingClientRect();
      var fr = lbImg.getBoundingClientRect();
      gsap.to(lb.querySelector('.lb__bg'), { opacity: 0, duration: 0.45 });
      gsap.to('.lb__cap > *, .lb__btn, .lb__count', { opacity: 0, duration: 0.2 });
      gsap.to(lbImg, {
        x: to.left + to.width / 2 - (fr.left + fr.width / 2),
        y: to.top + to.height / 2 - (fr.top + fr.height / 2),
        scaleX: to.width / fr.width, scaleY: to.height / fr.height,
        duration: 0.6, ease: 'expo.inOut', onComplete: function () { gsap.set(lbImg, { clearProps: 'x,y,scaleX,scaleY' }); done(); }
      });
    } else done();
  }
  function step(d) {
    current = (current + d + shots.length) % shots.length;
    if (window.gsap && !reduce) {
      gsap.timeline()
        .to(lbImg, { opacity: 0, x: -d * 80, rotate: -d * 2, duration: 0.22, ease: 'power2.in' })
        .call(function () { fill(current); })
        .fromTo(lbImg, { opacity: 0, x: d * 80, rotate: d * 2 }, { opacity: 1, x: 0, rotate: 0, duration: 0.6, ease: 'expo.out' });
    } else fill(current);
  }
  shots.forEach(function (a, i) {
    a.addEventListener('click', function (e) { e.preventDefault(); open(i); });
  });
  lb.querySelector('.lb__close').addEventListener('click', close);
  lb.querySelector('.lb__bg').addEventListener('click', close);
  lb.querySelector('.lb__prev').addEventListener('click', function () { step(-1); });
  lb.querySelector('.lb__next').addEventListener('click', function () { step(1); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  var sx0 = null;
  lb.addEventListener('touchstart', function (e) { sx0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (sx0 === null) return;
    var dx = e.changedTouches[0].clientX - sx0;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    sx0 = null;
  });

  /* ---------- Поява карток ---------- */
  if (window.gsap && !reduce) {
    gsap.from('table.gal td', {
      opacity: 0, y: 80, rotateX: -30, transformOrigin: '50% 0', duration: 1.2, ease: 'expo.out',
      stagger: { each: 0.06, grid: 'auto', from: 'start' }, delay: 0.5
    });
  }
})();
