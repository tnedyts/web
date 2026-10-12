/* НІЧНА ХВИЛЯ — «телевізор»: увімкнення, перемикання каналів, OSD,
   касета, що грає між сторінками, і анімації вмісту */
(function () {
  'use strict';

  var html = document.documentElement;
  html.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var BEAT = 0.6;
  var FIRST_BEAT = 4.8;
  var LAST_BEAT = 57.6;

  /* ---------- Трек, що грає між сторінками ---------- */
  var audio = document.getElementById('track');
  var tapeBtn = document.querySelector('.tape-btn');
  window.__level = 0;
  function saveTape() {
    if (!audio) return;
    try { sessionStorage.setItem('tape', JSON.stringify({ t: audio.currentTime, on: !audio.paused })); } catch (e) { /* ignore */ }
  }
  function syncTapeBtn() {
    if (!tapeBtn || !audio) return;
    tapeBtn.setAttribute('aria-pressed', audio.paused ? 'false' : 'true');
    tapeBtn.querySelector('span').textContent = audio.paused ? '▶ ТРЕК' : '❚❚ ТРЕК';
    document.dispatchEvent(new CustomEvent('tape', { detail: { on: !audio.paused } }));
  }
  if (audio) {
    var st = null;
    try { st = JSON.parse(sessionStorage.getItem('tape') || 'null'); } catch (e) { st = null; }
    if (st) {
      var resume = function () {
        try { audio.currentTime = st.t || 0; } catch (e) { /* ignore */ }
        if (st.on) audio.play().catch(function () { syncTapeBtn(); });
      };
      if (audio.readyState >= 1) resume(); else audio.addEventListener('loadedmetadata', resume, { once: true });
    }
    audio.addEventListener('play', syncTapeBtn);
    audio.addEventListener('pause', syncTapeBtn);
    window.addEventListener('pagehide', saveTape);
    if (tapeBtn) tapeBtn.addEventListener('click', function () { if (audio.paused) audio.play(); else audio.pause(); });
    /* рівень «удару» — трек має рівно 100 уд./хв, тож пульс рахуємо з часу відтворення */
    (function pulse() {
      requestAnimationFrame(pulse);
      var lv = 0;
      if (!audio.paused && audio.currentTime > FIRST_BEAT && audio.currentTime < LAST_BEAT) {
        var ph = ((audio.currentTime - FIRST_BEAT) % BEAT) / BEAT;
        lv = Math.exp(-ph * 6);
      }
      window.__level += (lv - window.__level) * 0.35;
    })();
    syncTapeBtn();
  }

  /* ---------- OSD: час запису та дата ---------- */
  var tEl = document.getElementById('osdTime');
  var dEl = document.getElementById('osdDate');
  var t0 = Date.now() - (parseInt(sessionStorage.getItem('osd0') || '0', 10) || 0);
  function pad(n) { return String(n).padStart(2, '0'); }
  var MON = ['СІЧ', 'ЛЮТ', 'БЕР', 'КВІ', 'ТРА', 'ЧЕР', 'ЛИП', 'СЕР', 'ВЕР', 'ЖОВ', 'ЛИС', 'ГРУ'];
  setInterval(function () {
    var s = Math.floor((Date.now() - t0) / 1000);
    try { sessionStorage.setItem('osd0', String(Date.now() - t0)); } catch (e) { /* ignore */ }
    if (tEl) tEl.textContent = 'SP ' + pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60);
    var d = new Date();
    if (dEl) dEl.textContent = MON[d.getMonth()] + ' ' + pad(d.getDate()) + ' ' + d.getFullYear() + '  ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }, 1000);

  /* ---------- «Сніг» при перемиканні каналів ---------- */
  var stat = document.querySelector('.static');
  var sc = stat ? stat.querySelector('canvas') : null;
  var sx = sc ? sc.getContext('2d') : null;
  var snowing = false;
  function snow() {
    if (!sx) return;
    var w = sc.width = 320;
    var h = sc.height = 180;
    var img = sx.createImageData(w, h);
    (function f() {
      if (!snowing) return;
      for (var i = 0; i < img.data.length; i += 4) {
        var v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      sx.putImageData(img, 0, 0);
      sx.fillStyle = 'rgba(0,0,0,.35)';
      sx.fillRect(0, (performance.now() / 4) % h, w, 18);
      requestAnimationFrame(f);
    })();
  }
  function goChannel(href, ch) {
    saveTape();
    if (!stat || reduce) { window.location.href = href; return; }
    stat.querySelector('b').textContent = 'CH ' + ch;
    snowing = true;
    stat.classList.add('is-on');
    snow();
    try { sessionStorage.setItem('ch', ch); } catch (e) { /* ignore */ }
    setTimeout(function () { window.location.href = href; }, 420);
  }
  var links = Array.prototype.slice.call(document.querySelectorAll('.guide a'));
  document.querySelectorAll('a[href$=".html"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
      e.preventDefault();
      var g = links.filter(function (l) { return l.getAttribute('href') === a.getAttribute('href'); })[0];
      goChannel(a.getAttribute('href'), g ? g.getAttribute('data-ch') : '--');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (/input|textarea/i.test((e.target || {}).tagName || '')) return;
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= links.length) goChannel(links[n - 1].getAttribute('href'), links[n - 1].getAttribute('data-ch'));
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted && stat) { snowing = false; stat.classList.remove('is-on'); } });

  /* ---------- Увімкнення телевізора ---------- */
  var power = document.querySelector('.power');
  var fromChannel = null;
  try { fromChannel = sessionStorage.getItem('ch'); sessionStorage.removeItem('ch'); } catch (e) { /* ignore */ }
  if (power && hasGsap && !reduce) {
    if (fromChannel) {
      /* прийшли з іншого каналу — короткий «сніг» */
      power.style.display = 'none';
      if (stat) {
        stat.querySelector('b').textContent = 'CH ' + fromChannel;
        snowing = true;
        stat.classList.add('is-on');
        snow();
        setTimeout(function () { snowing = false; gsap.to(stat, { opacity: 0, duration: 0.25, onComplete: function () { stat.classList.remove('is-on'); stat.style.opacity = ''; } }); intro(); }, 280);
      } else intro();
    } else {
      var line = power.querySelector('i');
      gsap.timeline()
        .to(line, { scaleX: 1, duration: 0.35, ease: 'power3.out' })
        .to(line, { scaleY: 400, opacity: 0, duration: 0.45, ease: 'power2.in' })
        .to(power, { backgroundColor: 'rgba(255,255,255,.7)', duration: 0.06 }, '-=0.12')
        .to(power, { opacity: 0, duration: 0.5, ease: 'power2.out' })
        .set(power, { display: 'none' })
        .call(intro, null, '-=0.45');
    }
  } else {
    if (power) power.style.display = 'none';
    intro();
  }

  /* ---------- Зворотний відлік ---------- */
  var cd = document.querySelector('.countdown');
  if (cd) {
    var target = new Date('2027-08-15T18:00:00+03:00').getTime();
    var parts = cd.querySelectorAll('b');
    var tick = function () {
      var s = Math.max(0, Math.floor((target - Date.now()) / 1000));
      var v = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
      parts.forEach(function (p, i) { p.textContent = i === 0 ? String(v[0]) : pad(v[i]); });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Касети VHS у лайнапі ---------- */
  document.querySelectorAll('.vhs').forEach(function (v) {
    var tg = function () { v.classList.toggle('is-open'); v.setAttribute('aria-expanded', v.classList.contains('is-open') ? 'true' : 'false'); };
    v.addEventListener('click', tg);
    v.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tg(); } });
  });

  /* ---------- Голографічні квитки ---------- */
  document.querySelectorAll('.ticket').forEach(function (t) {
    t.addEventListener('pointermove', function (e) {
      var r = t.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      t.style.setProperty('--mx', (px * 100) + '%');
      t.style.setProperty('--my', (py * 100) + '%');
      t.style.setProperty('--r', (px * 180 + 45) + 'deg');
      if (hasGsap && !reduce) gsap.to(t, { rotateY: (px - 0.5) * 24, rotateX: (0.5 - py) * 18, duration: 0.5, ease: 'power3.out' });
    });
    t.addEventListener('pointerleave', function () { if (hasGsap) gsap.to(t, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1, .5)' }); });
    var b = t.querySelector('button');
    if (b) b.addEventListener('click', function (e) {
      e.stopPropagation();
      var stub = document.querySelector('.stub');
      stub.querySelector('#stubTier').textContent = t.getAttribute('data-tier');
      stub.querySelector('#stubPrice').textContent = t.getAttribute('data-price');
      stub.querySelector('#stubNo').textContent = 'NW-' + Math.floor(100000 + Math.random() * 899999);
      stub.classList.add('is-on');
      if (hasGsap && !reduce) gsap.fromTo(stub, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'steps(12)' });
      stub.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    });
  });

  /* ---------- Фінальні титри ---------- */
  var roll = document.querySelector('.credits__roll');
  var rollTl = null;
  if (roll && hasGsap) {
    rollTl = gsap.to(roll, { y: function () { return -(roll.offsetHeight + window.innerHeight); }, duration: reduce ? 0.01 : 38, ease: 'none', repeat: -1, delay: 0.8 });
    var rb = document.querySelector('.credits__ctrl button');
    if (rb) rb.addEventListener('click', function () {
      if (rollTl.paused()) { rollTl.play(); rb.textContent = '❚❚ ПАУЗА'; } else { rollTl.pause(); rb.textContent = '▶ ДАЛІ'; }
    });
  }

  if (!hasGsap) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
  if (!reduce && typeof window.Lenis !== 'undefined') {
    var lenis = new Lenis({ lerp: 0.1 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function intro() {
    if (reduce) return;
    var chrome = document.querySelector('.chrome');
    if (chrome && !chrome.querySelector('.ch')) {
      var t = chrome.textContent;
      chrome.setAttribute('aria-label', t);
      chrome.innerHTML = t.split('').map(function (c) { return '<span class="ch" aria-hidden="true">' + (c === ' ' ? '&nbsp;' : c) + '</span>'; }).join('');
      gsap.from(chrome.querySelectorAll('.ch'), { yPercent: 120, scaleY: 2.2, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.05 });
    }
    gsap.from('.hero__kicker, .script, .hero__meta, .countdown, .cta', { opacity: 0, y: 30, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.3 });
  }

  if (reduce) return;
  gsap.utils.toArray('.label, .h2, .lead, .night, .feat, .vhs, .monitor, .deck, .inf, .soc, .ticket, table.tt tr').forEach(function (el, i) {
    gsap.from(el, {
      opacity: 0, y: 40, skewX: -6, duration: 0.9, ease: 'power3.out', delay: (i % 4) * 0.05,
      scrollTrigger: { trigger: el, start: 'top 92%' }
    });
  });
  /* VHS-глітч на заголовках при наведенні */
  document.querySelectorAll('.h2').forEach(function (h) {
    h.addEventListener('pointerenter', function () {
      gsap.timeline()
        .to(h, { x: -6, skewX: 12, duration: 0.05 })
        .to(h, { x: 8, skewX: -8, duration: 0.05 })
        .to(h, { x: 0, skewX: 0, duration: 0.1 });
    });
  });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
