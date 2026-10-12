/* НЕСКІНЧЕННІСТЬ — спільний скрипт: прокручування, навігація, переходи, появи */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var nav = document.querySelector('.nav');

  /* Мобільне меню */
  var burger = document.querySelector('.nav__burger');
  if (burger) burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* Підсвічування під курсором */
  var spot = document.querySelector('.spot');
  if (spot && !reduce) {
    var sx = 0;
    var sy = 0;
    var tx = 0;
    var ty = 0;
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      sx += (tx - sx) * 0.12;
      sy += (ty - sy) * 0.12;
      spot.style.transform = 'translate(' + sx + 'px,' + sy + 'px)';
      requestAnimationFrame(loop);
    })();
  }

  /* Перехід «райдужна діафрагма» між сторінками */
  var iris = document.querySelector('.iris');
  if (iris) {
    if (document.documentElement.classList.contains('iris-in')) {
      try { sessionStorage.removeItem('iris'); } catch (err) { /* ignore */ }
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          iris.style.transition = 'clip-path .9s cubic-bezier(.7,0,.2,1)';
          document.documentElement.classList.remove('iris-in');
        });
      });
    }
    document.querySelectorAll('a[href$=".html"]').forEach(function (a) {
      if (a.target === '_blank') return;
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || reduce) return;
        e.preventDefault();
        var x = (e.clientX || window.innerWidth / 2) + 'px';
        var y = (e.clientY || window.innerHeight / 2) + 'px';
        iris.style.transition = 'none';
        iris.style.setProperty('--x', x);
        iris.style.setProperty('--y', y);
        iris.classList.remove('is-cover');
        void iris.offsetWidth;
        iris.style.transition = 'clip-path .75s cubic-bezier(.7,0,.2,1)';
        iris.classList.add('is-cover');
        try { sessionStorage.setItem('iris', x + ',' + y); } catch (err) { /* приватний режим */ }
        setTimeout(function () { window.location.href = a.getAttribute('href'); }, 720);
      });
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) iris.classList.remove('is-cover'); });
  }

  if (!hasGsap) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });

  /* Плавне прокручування */
  if (!reduce && typeof window.Lenis !== 'undefined') {
    var lenis = new Lenis({ lerp: 0.09 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  ScrollTrigger.create({ start: 60, onUpdate: function (s) { nav.classList.toggle('is-solid', s.scroll() > 60); } });

  if (reduce) return;

  /* Слова заголовків-тверджень проявляються під час прокручування */
  function words(el) {
    var html = el.innerHTML;
    el.innerHTML = html.split(/(<[^>]+>|\s+)/).map(function (w) {
      if (!w || /^\s+$/.test(w) || /^</.test(w)) return w;
      return '<span class="w">' + w + '</span>';
    }).join('');
    return el.querySelectorAll('.w');
  }
  document.querySelectorAll('.statement').forEach(function (el) {
    gsap.fromTo(words(el), { opacity: 0.1 }, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 40%', scrub: true }
    });
  });
  document.querySelectorAll('.page-head h1').forEach(function (h) {
    var t = h.textContent;
    h.setAttribute('aria-label', t);
    h.innerHTML = t.split('').map(function (c) { return '<span class="ch" aria-hidden="true" style="display:inline-block">' + (c === ' ' ? '&nbsp;' : c) + '</span>'; }).join('');
    gsap.from(h.querySelectorAll('.ch'), {
      opacity: 0, scale: 3, filter: 'blur(20px)', rotate: function () { return gsap.utils.random(-50, 50); },
      duration: 1.4, ease: 'expo.out', stagger: { each: 0.04, from: 'random' }, delay: 0.25
    });
  });
  gsap.from('.page-head p, .filters', { opacity: 0, y: 30, duration: 1.2, ease: 'power3.out', delay: 0.6, stagger: 0.1 });

  gsap.utils.toArray('.kicker, .h2, .cols > *, .card, .panel, .koch > *, table.dim tr, .timeline li, table.info tr, .formula, .explorer > *').forEach(function (el) {
    gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
  gsap.utils.toArray('table.dim .bar').forEach(function (b) {
    gsap.from(b, { scaleX: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: b, start: 'top 95%' } });
  });
  gsap.utils.toArray('hr.iri-line').forEach(function (hr) {
    gsap.from(hr, { scaleX: 0, transformOrigin: 'left', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: hr, start: 'top 95%' } });
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
