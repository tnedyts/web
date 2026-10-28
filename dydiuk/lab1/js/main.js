/* Світлопис — головний скрипт · © 2026 Олександр Дидюк */
(function () {
  'use strict';
  var html = document.documentElement;
  var SHOT = html.classList.contains('shot');
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Шапка: тінь, приховування при скролі ---------- */
  var header = $('.header');
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY || 0;
    if (header) {
      header.classList.toggle('scrolled', y > 30);
      header.classList.toggle('hide', y > 400 && y > lastY && !html.classList.contains('menu-open'));
    }
    lastY = y;
    parallax();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Мобільне меню ---------- */
  var burger = $('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = html.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  /* ---------- Перехід між сторінками (затвор) ---------- */
  $$('a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || a.target === '_blank' || /^(mailto|tel|https?):/.test(href)) return;
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || SHOT || REDUCED) return;
      var url = new URL(href, location.href);
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      html.classList.add('leaving');
      setTimeout(function () { location.href = href; }, 430);
    });
  });
  window.addEventListener('pageshow', function () { html.classList.remove('leaving'); });

  /* ---------- Нагору ---------- */
  $$('[data-top]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); });
  });

  /* ---------- Reveal + проявлення + лічильники ---------- */
  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-count')) || 0;
    var suf = el.getAttribute('data-suffix') || '';
    var fmt = function (v) { return Math.round(v).toLocaleString('uk-UA').replace(/,/g, ' ') + suf; };
    if (SHOT || REDUCED) { el.textContent = fmt(end); return; }
    var t0 = null, dur = 1800;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      el.textContent = fmt(end * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var revealEls = $$('.reveal, .split, .develop, .step, [data-count], .map');
  if (SHOT || REDUCED || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); if (el.hasAttribute('data-count')) countUp(el); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('in');
        if (el.hasAttribute('data-count')) countUp(el);
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Паралакс ---------- */
  var parEls = $$('[data-parallax]');
  function parallax() {
    if (SHOT || REDUCED || !parEls.length) return;
    var vh = window.innerHeight;
    parEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var k = parseFloat(el.getAttribute('data-parallax')) || 0;
      var off = (r.top + r.height / 2 - vh / 2) * k;
      el.style.translate = '0 ' + off.toFixed(1) + 'px';
    });
  }

  /* ---------- Курсор-лінза ---------- */
  var cur = $('.cursor'), lens = $('.cursor-lens');
  if (cur && lens && window.matchMedia('(pointer:fine)').matches && !SHOT) {
    var mx = -100, my = -100, lx = -100, ly = -100;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      document.body.classList.add('has-cursor');
      cur.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    });
    document.addEventListener('mouseleave', function () { document.body.classList.remove('has-cursor'); });
    (function loop() {
      lx += (mx - lx) * 0.18; ly += (my - ly) * 0.18;
      lens.style.transform = 'translate(' + lx.toFixed(1) + 'px,' + ly.toFixed(1) + 'px)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      var ph = t.closest && t.closest('[data-cursor="photo"]');
      var ln = t.closest && t.closest('a, button, input, textarea, select, label');
      lens.classList.toggle('is-photo', !!ph && !html.classList.contains('lb-open'));
      lens.classList.toggle('is-link', !ph && !!ln);
    });
  }

  /* ---------- Hero: слайди + зерно ---------- */
  var slides = $$('.hero-frame .slide');
  if (slides.length) {
    var si = 0, cap = $('.frame-cap'), cnt = $('.frame-info .count'), exif = $('.frame-info .exif');
    var show = function (n) {
      slides[si].classList.remove('on');
      si = (n + slides.length) % slides.length;
      slides[si].classList.add('on');
      if (cap) cap.textContent = slides[si].getAttribute('data-cap');
      if (cnt) cnt.textContent = 'Кадр 0' + (si + 1) + ' / 0' + slides.length;
      if (exif) exif.textContent = slides[si].getAttribute('data-exif');
    };
    if (!SHOT && !REDUCED) setInterval(function () { show(si + 1); }, 4800);
  }
  var gc = $('#grain');
  if (gc && gc.getContext && !SHOT && !REDUCED) {
    var gx = gc.getContext('2d');
    gc.width = 240; gc.height = 320;
    var img = gx.createImageData(240, 320), fr = 0;
    (function noise() {
      if (fr++ % 3 === 0) {
        var d = img.data;
        for (var i = 0; i < d.length; i += 4) {
          var v = Math.random() * 255;
          d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = Math.random() < 0.5 ? 40 : 0;
        }
        gx.putImageData(img, 0, 0);
        // подряпини плівки
        if (Math.random() < 0.25) {
          gx.fillStyle = 'rgba(255,255,255,.5)';
          gx.fillRect(Math.random() * 240, 0, 1, 320);
        }
      }
      requestAnimationFrame(noise);
    })();
  }

  /* ---------- Проектор (canvas-ролик) ---------- */
  var pc = $('#projector');
  if (pc && window.REEL) {
    var px = pc.getContext('2d');
    var W = pc.width, H = pc.height;
    var imgs = window.REEL.map(function (src) { var im = new Image(); im.src = src; return im; });
    var PER = 6000, TOTAL = PER * imgs.length;
    var t = 0, playing = !SHOT && !REDUCED, last = 0;
    var btn = $('#playBtn'), prog = $('#reelProgress i'), tc = $('#reelTc'), list = $$('#reelList li');
    var ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>';
    var ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
    var dust = [];
    for (var k = 0; k < 40; k++) dust.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2 + .4 });
    function fmt(ms) { var s = Math.floor(ms / 1000); return '00:' + (s < 10 ? '0' : '') + s; }
    function drawCover(im, scale, ox, oy, alpha) {
      if (!im.complete || !im.naturalWidth) return;
      var iw = im.naturalWidth || W, ih = im.naturalHeight || H;
      var s = Math.max(W / iw, H / ih) * scale;
      var dw = iw * s, dh = ih * s;
      px.globalAlpha = alpha;
      px.drawImage(im, (W - dw) / 2 + ox, (H - dh) / 2 + oy, dw, dh);
      px.globalAlpha = 1;
    }
    function render() {
      var idx = Math.floor(t / PER) % imgs.length;
      var local = (t % PER) / PER;
      px.fillStyle = '#000'; px.fillRect(0, 0, W, H);
      var scale = 1.05 + local * 0.12;
      drawCover(imgs[idx], scale, -local * 40, -local * 20, 1);
      if (local > 0.85) { // перехід — наступний кадр
        var nx = imgs[(idx + 1) % imgs.length];
        drawCover(nx, 1.05, 0, 0, (local - 0.85) / 0.15);
      }
      // мерехтіння лампи
      var fl = playing ? (Math.random() * 0.08) : 0.02;
      px.fillStyle = 'rgba(0,0,0,' + fl + ')'; px.fillRect(0, 0, W, H);
      // віньєтка
      var g = px.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, W * 0.7);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.65)');
      px.fillStyle = g; px.fillRect(0, 0, W, H);
      // пил і подряпини
      px.fillStyle = 'rgba(255,255,255,.55)';
      dust.forEach(function (d) {
        if (playing && Math.random() < 0.3) { d.x = Math.random() * W; d.y = Math.random() * H; }
        px.beginPath(); px.arc(d.x, d.y, d.r, 0, 6.283); px.fill();
      });
      if (playing && Math.random() < 0.3) { px.fillStyle = 'rgba(255,255,255,.25)'; px.fillRect(Math.random() * W, 0, 1.2, H); }
      // таймкод на кадрі
      px.font = '22px Prata, serif'; px.fillStyle = 'rgba(255,255,255,.7)';
      px.fillText('0' + (idx + 1) + ' / 0' + imgs.length, 36, H - 40);
      if (prog) prog.style.width = (t / TOTAL * 100).toFixed(2) + '%';
      if (tc) tc.textContent = fmt(t) + ' / ' + fmt(TOTAL);
      list.forEach(function (li, i) { li.classList.toggle('on', i === idx); });
    }
    function loop(ts) {
      if (!last) last = ts;
      var dt = ts - last; last = ts;
      if (playing) t = (t + dt) % TOTAL;
      render();
      requestAnimationFrame(loop);
    }
    function setBtn() { if (btn) btn.innerHTML = playing ? ICON_PAUSE : ICON_PLAY; }
    if (btn) btn.addEventListener('click', function () { playing = !playing; setBtn(); });
    list.forEach(function (li, i) { li.addEventListener('click', function () { t = i * PER + 1; render(); }); });
    var bar = $('#reelProgress');
    if (bar) bar.addEventListener('click', function (e) { var r = bar.getBoundingClientRect(); t = (e.clientX - r.left) / r.width * TOTAL; });
    setBtn();
    if (SHOT || REDUCED) {
      t = 800; var once = function () { render(); };
      imgs[0].onload = once; setTimeout(once, 300);
    } else {
      // запуск тільки коли видно
      if ('IntersectionObserver' in window) {
        var started = false;
        new IntersectionObserver(function (en) { if (en[0].isIntersecting && !started) { started = true; requestAnimationFrame(loop); } }).observe(pc);
      } else requestAnimationFrame(loop);
    }
  }

  /* ---------- Портфоліо: фільтри ---------- */
  var mas = $('#masonry');
  if (mas) {
    var fbtns = $$('.filters button');
    var items = $$('.m-item', mas);
    var vc = $('#viewCount');
    var apply = function (f, instant) {
      fbtns.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-f') === f); });
      var n = 0;
      items.forEach(function (it) {
        var ok = f === 'all' || it.getAttribute('data-series') === f;
        if (ok) n++;
        if (instant) { it.classList.toggle('hidden', !ok); return; }
        it.classList.add('fading');
        setTimeout(function () {
          it.classList.toggle('hidden', !ok);
          requestAnimationFrame(function () { requestAnimationFrame(function () { it.classList.remove('fading'); it.classList.add('in'); }); });
        }, 320);
      });
      if (vc) vc.textContent = 'Показано ' + n + ' ' + (n === 1 ? 'кадр' : n < 5 ? 'кадри' : 'кадрів');
    };
    fbtns.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        apply(f);
        try { history.replaceState(null, '', f === 'all' ? location.pathname : '#' + f); } catch (e) {}
      });
    });
    var h = (location.hash || '').slice(1);
    if (['night', 'portrait', 'arch', 'nature'].indexOf(h) > -1) apply(h, true);
  }

  /* ---------- Лайтбокс з лупою ---------- */
  var lb = $('.lightbox');
  var gallery = $$('.m-item');
  if (lb && gallery.length) {
    var lbImg = $('.lb-img img', lb), lbWrap = $('.lb-img', lb), zoom = $('.lb-zoom', lb);
    var lbT = $('.lb-title', lb), lbE = $('.lb-exif', lb), lbC = $('.count', lb);
    var cur_i = 0, visible = [];
    var openLb = function (it) {
      visible = gallery.filter(function (g) { return !g.classList.contains('hidden'); });
      cur_i = visible.indexOf(it);
      setLb(false);
      lb.classList.add('open'); html.classList.add('lb-open');
      document.body.style.overflow = 'hidden';
      $('.lb-close', lb).focus();
    };
    var setLb = function (anim) {
      var it = visible[cur_i];
      var go = function () {
        lbImg.src = it.getAttribute('data-src');
        lbImg.alt = it.getAttribute('data-title');
        lbT.textContent = '«' + it.getAttribute('data-title') + '»';
        var ex = it.getAttribute('data-exif').split(' · ');
        lbE.innerHTML = '<span>' + it.getAttribute('data-place') + '</span>' + ex.map(function (x) { return '<b>' + x + '</b>'; }).join('');
        lbC.textContent = ('0' + (cur_i + 1)).slice(-2) + ' / ' + ('0' + visible.length).slice(-2);
        zoom.style.backgroundImage = 'url("' + it.getAttribute('data-src') + '")';
        lbWrap.classList.remove('swap');
      };
      if (anim && !REDUCED) { lbWrap.classList.add('swap'); setTimeout(go, 280); } else go();
    };
    var closeLb = function () { lb.classList.remove('open'); html.classList.remove('lb-open'); document.body.style.overflow = ''; };
    var step = function (d) { cur_i = (cur_i + d + visible.length) % visible.length; setLb(true); };
    gallery.forEach(function (it) { it.addEventListener('click', function () { openLb(it); }); });
    $('.lb-close', lb).addEventListener('click', closeLb);
    $('.lb-prev', lb).addEventListener('click', function () { step(-1); });
    $('.lb-next', lb).addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-stage')) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });
    // свайп
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); sx = null; });
    // лупа
    lbImg.addEventListener('mousemove', function (e) {
      var r = lbImg.getBoundingClientRect(), wr = lbWrap.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top, Z = 2.6;
      zoom.classList.add('on');
      zoom.style.left = (e.clientX - wr.left - 95) + 'px';
      zoom.style.top = (e.clientY - wr.top - 95) + 'px';
      zoom.style.backgroundSize = (r.width * Z) + 'px ' + (r.height * Z) + 'px';
      zoom.style.backgroundPosition = (-x * Z + 95) + 'px ' + (-y * Z + 95) + 'px';
    });
    lbImg.addEventListener('mouseleave', function () { zoom.classList.remove('on'); });
  }

  /* ---------- FAQ ---------- */
  $$('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.parentNode, open = !item.classList.contains('open');
      $$('.faq-item.open').forEach(function (o) { if (o !== item) { o.classList.remove('open'); $('.faq-q', o).setAttribute('aria-expanded', 'false'); } });
      item.classList.toggle('open', open);
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- Журнал: розгортання + активний пункт змісту ---------- */
  $$('.article .toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var a = b.closest('.article'), open = a.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      $('span', b).textContent = open ? 'Згорнути' : 'Читати повністю';
      if (!open) a.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
    });
  });
  var tocLinks = $$('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var tio = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) tocLinks.forEach(function (l) { l.classList.toggle('on', l.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('.article').forEach(function (a) { tio.observe(a); });
    if (location.hash) { var target = document.getElementById(location.hash.slice(1)); if (target && target.classList.contains('article')) target.classList.add('open'); }
  }

  /* ---------- Пакет → форма ---------- */
  $$('[data-pack]').forEach(function (a) {
    a.addEventListener('click', function () {
      var sel = $('#f-pack'); if (sel) sel.value = a.getAttribute('data-pack');
    });
  });

  /* ---------- Форми з валідацією ---------- */
  $$('form.form').forEach(function (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()); },
      phone: function (v) { return !v.trim() || /^\+?3?8?0\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/.test(v.replace(/[()]/g, '').trim()); },
      pack: function (v) { return !!v; },
      message: function (v) { return v.trim().length >= 15; }
    };
    var check = function (el) {
      var fn = rules[el.name]; if (!fn) return true;
      var ok = fn(el.value);
      var f = el.closest('.field');
      if (f) { f.classList.remove('invalid'); if (!ok) { void f.offsetWidth; f.classList.add('invalid'); } }
      return ok;
    };
    $$('input, textarea, select', form).forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { var f = el.closest('.field'); if (f && f.classList.contains('invalid') && rules[el.name] && rules[el.name](el.value)) f.classList.remove('invalid'); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $$('input[name], textarea[name], select[name]', form).forEach(function (el) { if (el.type !== 'checkbox' && !check(el)) ok = false; });
      var agree = $('input[name=agree]', form);
      if (agree) { var lab = agree.closest('.check'); lab.classList.toggle('invalid', !agree.checked); if (!agree.checked) ok = false; }
      if (!ok) { var first = $('.invalid input, .invalid textarea, .invalid select', form); if (first) first.focus(); return; }
      var btn = $('button[type=submit]', form);
      btn.disabled = true; btn.firstChild.textContent = 'Надсилаю… ';
      setTimeout(function () {
        $('.success', form).classList.add('show');
        btn.disabled = false; btn.firstChild.textContent = form.id === 'bookForm' ? 'Надіслати запит ' : 'Надіслати ';
        try { var log = JSON.parse(localStorage.getItem('svitlopys-msgs') || '[]'); log.push({ at: Date.now(), form: form.id }); localStorage.setItem('svitlopys-msgs', JSON.stringify(log)); } catch (err) {}
      }, 900);
    });
    var rs = $('[data-reset]', form);
    if (rs) rs.addEventListener('click', function () { form.reset(); $('.success', form).classList.remove('show'); });
  });

  onScroll();
})();
