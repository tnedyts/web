/* =========================================================
   «Python з нуля» — сценарії
   1. Термінал, що сам «друкує» команди
   2. Поява блоків, лічильники, підсвічування меню
   3. Ялинка з циклу for, вікторина, копіювання коду
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // проста підсвітка синтаксису Python для одного рядка
  function highlight(line) {
    var re = /("[^"]*"|'[^']*')|(\b\d+(?:\.\d+)?\b)|\b(for|in|import|def|return|if|else|print|range|sum|len)\b/g;
    var out = '', last = 0, m;
    while ((m = re.exec(line))) {
      out += esc(line.slice(last, m.index));
      var cls = m[1] ? 's' : m[2] ? 'n' : /print|range|sum|len/.test(m[3]) ? 'f' : 'k';
      out += '<span class="' + cls + '">' + esc(m[0]) + '</span>';
      last = re.lastIndex;
    }
    return out + esc(line.slice(last));
  }

  /* ---------- 1. Термінал ---------- */
  var SESSION = [
    ['in', 'name = "Олександр"'],
    ['in', 'print(f"Привіт, {name}!")'],
    ['out', 'Привіт, Олександр!'],
    ['in', 'sum(range(1, 101))'],
    ['out', '5050'],
    ['in', '[x ** 2 for x in range(6)]'],
    ['out', '[0, 1, 4, 9, 16, 25]'],
    ['in', '"Python".upper()'],
    ['out', "'PYTHON'"],
    ['in', '2 ** 100'],
    ['out', '1267650600228229401496703205376']
  ];
  var typer = document.getElementById('typer');
  var PROMPT = '<span class="prompt">&gt;&gt;&gt; </span>';

  function renderStatic() {
    typer.innerHTML = SESSION.map(function (l) {
      return l[0] === 'in' ? PROMPT + highlight(l[1]) : '<samp>' + esc(l[1]) + '</samp>';
    }).join('\n');
  }

  function runSession() {
    var done = '', i = 0;
    function nextLine() {
      if (i >= SESSION.length) {
        typer.innerHTML = done + PROMPT + '<span class="cur"></span>';
        setTimeout(function () { done = ''; i = 0; nextLine(); }, 5000);
        return;
      }
      var l = SESSION[i++];
      if (l[0] === 'out') {
        setTimeout(function () {
          done += '<samp>' + esc(l[1]) + '</samp>\n';
          typer.innerHTML = done + '<span class="cur"></span>';
          setTimeout(nextLine, 650);
        }, 280);
        return;
      }
      var k = 0;
      (function type() {
        typer.innerHTML = done + PROMPT + esc(l[1].slice(0, k)) + '<span class="cur"></span>';
        if (k < l[1].length) { k++; setTimeout(type, 45 + Math.random() * 60); }
        else {
          done += PROMPT + highlight(l[1]) + '\n';
          setTimeout(nextLine, 350);
        }
      })();
    }
    nextLine();
  }
  if (reduce) renderStatic(); else runSession();

  /* ---------- 2. Поява, лічильники, меню ---------- */
  function countUp(el) {
    var target = +el.getAttribute('data-count'), start = target - 60, t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1200, 1);
      el.textContent = Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      var c = e.target.querySelector('[data-count]');
      if (c && !reduce) countUp(c);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el, i) {
    el.style.transitionDelay = (i % 3) * 0.08 + 's';
    io.observe(el);
  });

  var links = Array.prototype.slice.call(document.querySelectorAll('.bar__nav a'));
  window.addEventListener('scroll', function () {
    var cur = null;
    links.forEach(function (a) {
      if (document.querySelector(a.getAttribute('href')).getBoundingClientRect().top < innerHeight * .4) cur = a;
    });
    links.forEach(function (a) { a.classList.toggle('is-active', a === cur); });
  }, { passive: true });

  // світло, що повільно йде за курсором
  var glow = document.querySelector('.glow');
  if (!reduce) {
    window.addEventListener('mousemove', function (e) {
      glow.style.setProperty('--x', e.clientX + 'px');
      glow.style.setProperty('--y', e.clientY + 'px');
    });
  }

  /* ---------- 3. Ялинка ---------- */
  var range = document.getElementById('nRange');
  var nOut = document.getElementById('nOut');
  var nCode = document.getElementById('nCode');
  var chCode = document.getElementById('chCode');
  var tree = document.getElementById('tree');
  var ch = '*';
  function drawTree() {
    var n = +range.value, lines = [];
    for (var i = 0; i < n; i++) lines.push(' '.repeat(n - i - 1) + ch.repeat(2 * i + 1));
    nOut.textContent = nCode.textContent = n;
    chCode.textContent = '"' + ch + '"';
    tree.textContent = '';
    if (reduce) { tree.textContent = lines.join('\n'); return; }
    // рядки з'являються по черзі, ніби програма виконується
    lines.forEach(function (l, i) {
      setTimeout(function () { if (+range.value === n) tree.textContent += (i ? '\n' : '') + l; }, i * 60);
    });
  }
  range.addEventListener('input', drawTree);
  document.querySelectorAll('.chip').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.chip').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      ch = b.getAttribute('data-ch');
      drawTree();
    });
  });
  drawTree();

  /* ---------- вікторина ---------- */
  var opened = 0, score = document.getElementById('score');
  document.querySelectorAll('.q').forEach(function (q) {
    q.addEventListener('click', function () {
      if (!q.dataset.seen) { q.dataset.seen = '1'; opened++; score.textContent = opened; }
      q.classList.toggle('is-open');
    });
  });

  /* ---------- копіювання коду ---------- */
  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var code = btn.closest('figure').querySelector('pre code').textContent;
      var ok = function () {
        btn.textContent = 'Скопійовано!';
        btn.classList.add('is-done');
        setTimeout(function () { btn.textContent = 'Копіювати'; btn.classList.remove('is-done'); }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(code).then(ok, ok);
      else {
        var ta = document.createElement('textarea');
        ta.value = code; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) { /* без копіювання */ }
        ta.remove(); ok();
      }
    });
  });
})();
