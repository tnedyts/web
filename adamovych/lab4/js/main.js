/* =========================================================
   «Гра королів» — сценарії сторінки
   1. Прогрес читання, шапка, активний пункт меню
   2. Поява блоків під час прокручування
   3. Дошка, що розігрує Оперну партію
   4. Задача про зерна
   5. Обхід дошки конем (правило Варнсдорфа)
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Прогрес, шапка, меню ---------- */
  var bar = document.querySelector('.progress span');
  var top = document.querySelector('.top');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.top__nav a'));
  var lastY = window.scrollY;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    top.classList.toggle('is-hidden', y > lastY && y > 300);
    lastY = y;

    var current = null;
    navLinks.forEach(function (a) {
      var sec = document.querySelector(a.getAttribute('href'));
      if (sec && sec.getBoundingClientRect().top < window.innerHeight * 0.4) current = a;
    });
    navLinks.forEach(function (a) { a.classList.toggle('is-active', a === current); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 2. Поява блоків ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el, i) {
    el.style.transitionDelay = (i % 3) * 0.08 + 's';
    io.observe(el);
  });

  /* ---------- 3. Оперна партія ---------- */
  var GLYPH = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
  var START = [
    'rnbqkbnr',
    'pppppppp',
    '........',
    '........',
    '........',
    '........',
    'PPPPPPPP',
    'RNBQKBNR'
  ];
  // [хід у нотації, звідки, куди, коментар]; рокіровка має додатковий хід тури
  var GAME = [
    ['1. e4', 'e2', 'e4', 'Морфі починає з королівського пішака.'],
    ['1… e5', 'e7', 'e5', 'Чорні відповідають симетрично.'],
    ['2. Nf3', 'g1', 'f3', 'Кінь атакує пішака e5.'],
    ['2… d6', 'd7', 'd6', 'Захист Філідора — міцний, але пасивний.'],
    ['3. d4', 'd2', 'd4', 'Білі одразу захоплюють центр.'],
    ['3… Bg4', 'c8', 'g4', 'Слон зв’язує коня. Пізніше його доведеться віддати.'],
    ['4. dxe5', 'd4', 'e5', 'Розмін у центрі.'],
    ['4… Bxf3', 'g4', 'f3', 'Чорні віддають слона за коня.'],
    ['5. Qxf3', 'd1', 'f3', 'Ферзь виходить у гру з темпом.'],
    ['5… dxe5', 'd6', 'e5', 'Матеріал рівний.'],
    ['6. Bc4', 'f1', 'c4', 'Загроза мату на f7!'],
    ['6… Nf6', 'g8', 'f6', 'Кінь закриває ферзя.'],
    ['7. Qb3', 'f3', 'b3', 'Подвійний удар: по f7 і по b7.'],
    ['7… Qe7', 'd8', 'e7', 'Чорні захищають f7.'],
    ['8. Nc3', 'b1', 'c3', 'Морфі не бере пішака, а розвиває фігури.'],
    ['8… c6', 'c7', 'c6', 'Чорні ще не вивели жодної фігури ферзевого флангу.'],
    ['9. Bg5', 'c1', 'g5', 'Зв’язка: кінь f6 не може піти.'],
    ['9… b5', 'b7', 'b5', 'Спроба прогнати слона c4.'],
    ['10. Nxb5', 'c3', 'b5', 'Жертва коня заради відкритих ліній!'],
    ['10… cxb5', 'c6', 'b5', 'Чорні приймають жертву.'],
    ['11. Bxb5+', 'c4', 'b5', 'Шах. Слон дивиться на короля.'],
    ['11… Nbd7', 'b8', 'd7', 'Кінь закривається від шаху.'],
    ['12. O-O-O', 'e1', 'c1', 'Довга рокіровка: тура одразу стає на лінію «d».', ['a1', 'd1']],
    ['12… Rd8', 'a8', 'd8', 'Чорні захищають коня d7.'],
    ['13. Rxd7', 'd1', 'd7', 'Ще одна жертва — тура за коня.'],
    ['13… Rxd7', 'd8', 'd7', 'Чорні знову беруть.'],
    ['14. Rd1', 'h1', 'd1', 'Друга тура тисне на зв’язаного коня.'],
    ['14… Qe6', 'e7', 'e6', 'Ферзь пропонує розмін.'],
    ['15. Bxd7+', 'b5', 'd7', 'Слон забирає туру з шахом.'],
    ['15… Nxd7', 'f6', 'd7', 'Кінь бере слона, але відкриває лінію «b»…'],
    ['16. Qb8+!', 'b3', 'b8', 'Безсмертна жертва ферзя!'],
    ['16… Nxb8', 'd7', 'b8', 'Кінь змушений узяти ферзя.'],
    ['17. Rd8#', 'd1', 'd8', 'Мат! Тура при підтримці слона g5. Білі перемогли — 1–0.']
  ];

  var boardEl = document.getElementById('board');
  var moveNo = document.getElementById('moveNo');
  var moveSan = document.getElementById('moveSan');
  var moveNote = document.getElementById('moveNote');
  var pieces = {};
  var hlFrom, hlTo, ply = 0, timer = null;

  function xy(sq) { return [sq.charCodeAt(0) - 97, 8 - parseInt(sq[1], 10)]; }
  function place(el, sq) {
    var p = xy(sq);
    el.style.transform = 'translate(' + p[0] * 100 + '%,' + p[1] * 100 + '%)';
  }

  function setup() {
    boardEl.innerHTML = '';
    pieces = {};
    hlFrom = document.createElement('div');
    hlTo = document.createElement('div');
    hlFrom.className = 'hl';
    hlTo.className = 'hl hl--to';
    hlFrom.style.opacity = hlTo.style.opacity = 0;
    boardEl.appendChild(hlFrom);
    boardEl.appendChild(hlTo);
    START.forEach(function (row, y) {
      row.split('').forEach(function (ch, x) {
        if (ch === '.') return;
        var white = ch === ch.toUpperCase();
        var el = document.createElement('span');
        el.className = 'pc ' + (white ? 'pc--w' : 'pc--b');
        el.textContent = GLYPH[ch.toLowerCase()] + '︎';
        var sq = String.fromCharCode(97 + x) + (8 - y);
        place(el, sq);
        boardEl.appendChild(el);
        pieces[sq] = el;
      });
    });
    ply = 0;
    moveNo.textContent = '';
    moveSan.textContent = 'Початкова позиція';
    moveNote.textContent = 'Білі: Пол Морфі. Чорні: герцог Брауншвейзький і граф Ізуар.';
  }

  function movePiece(from, to) {
    var el = pieces[from];
    if (!el) return;
    var victim = pieces[to];
    if (victim) {
      victim.classList.add('is-taken');
      setTimeout(function () { victim.remove(); }, 500);
    }
    el.classList.add('is-moving');
    place(el, to);
    setTimeout(function () { el.classList.remove('is-moving'); }, 750);
    delete pieces[from];
    pieces[to] = el;
  }

  function step() {
    if (ply >= GAME.length) {
      timer = setTimeout(function () { setup(); timer = setTimeout(step, 1400); }, 5000);
      return;
    }
    var m = GAME[ply];
    movePiece(m[1], m[2]);
    if (m[4]) movePiece(m[4][0], m[4][1]);
    place(hlFrom, m[1]);
    place(hlTo, m[2]);
    hlFrom.style.opacity = hlTo.style.opacity = 1;
    var parts = m[0].split(' ');
    moveNo.textContent = parts[0];
    moveSan.textContent = parts[1];
    moveNote.textContent = m[3];
    if (ply === GAME.length - 1) {
      var k = document.createElement('div');
      k.className = 'hl hl--mate';
      place(k, 'e8');
      boardEl.insertBefore(k, boardEl.firstChild);
    }
    ply++;
    timer = setTimeout(step, ply === GAME.length ? 600 : 1500);
  }

  function restart() {
    clearTimeout(timer);
    setup();
    timer = setTimeout(step, 900);
  }
  document.getElementById('replay').addEventListener('click', restart);

  if (reduceMotion) {
    // без анімації — одразу фінальна позиція
    setup();
    GAME.forEach(function (m) { movePiece(m[1], m[2]); if (m[4]) movePiece(m[4][0], m[4][1]); });
    moveNo.textContent = '17.';
    moveSan.textContent = 'Rd8#';
    moveNote.textContent = GAME[GAME.length - 1][3];
  } else {
    restart();
  }

  // легкий нахил дошки за курсором
  var wrap = document.querySelector('.board-wrap');
  var hero = document.querySelector('.hero');
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5;
      var dy = (e.clientY - r.top) / r.height - 0.5;
      wrap.style.setProperty('--ry', (-10 + dx * 14).toFixed(2) + 'deg');
      wrap.style.setProperty('--rx', (8 - dy * 12).toFixed(2) + 'deg');
    });
    hero.addEventListener('mouseleave', function () {
      wrap.style.removeProperty('--ry');
      wrap.style.removeProperty('--rx');
    });
  }

  /* ---------- 4. Задача про зерна ---------- */
  var grainBoard = document.getElementById('grainBoard');
  var grainOut = document.getElementById('grains');
  var cells = [];
  for (var i = 0; i < 64; i++) {
    var c = document.createElement('i');
    var row = Math.floor(i / 8), col = i % 8;
    c.style.setProperty('--sq', (row + col) % 2 ? 'var(--dark-sq)' : 'var(--light-sq)');
    grainBoard.appendChild(c);
    cells.push(c);
  }
  // клітинки нумеруємо від a1 змійкою, як у легенді
  var order = [];
  for (var r = 7; r >= 0; r--) {
    for (var k = 0; k < 8; k++) {
      var colIdx = (7 - r) % 2 === 0 ? k : 7 - k;
      order.push(r * 8 + colIdx);
    }
  }
  function fmt(big) { return big.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  var grainsDone = false;
  function runGrains() {
    if (grainsDone) return;
    grainsDone = true;
    var n = 0;
    (function tick() {
      n++;
      var total = (BigInt(1) << BigInt(n)) - BigInt(1);
      grainOut.textContent = fmt(total);
      cells[order[n - 1]].style.setProperty('--g', (0.25 + 0.75 * n / 64).toFixed(2));
      if (n < 64) setTimeout(tick, reduceMotion ? 0 : 55);
    })();
  }
  new IntersectionObserver(function (e, obs) {
    if (e[0].isIntersecting) { runGrains(); obs.disconnect(); }
  }, { threshold: 0.4 }).observe(grainBoard);

  /* ---------- 5. Обхід конем ---------- */
  var canvas = document.getElementById('tour');
  var ctx = canvas.getContext('2d');
  var stepOut = document.getElementById('tourStep');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var SIZE = 560;
  canvas.width = SIZE * dpr;
  canvas.height = SIZE * dpr;
  ctx.scale(dpr, dpr);
  var CELL = SIZE / 8;
  var JUMPS = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];

  function onBoard(x, y) { return x >= 0 && x < 8 && y >= 0 && y < 8; }
  function degree(x, y, seen) {
    var d = 0;
    JUMPS.forEach(function (j) { if (onBoard(x + j[0], y + j[1]) && !seen[(y + j[1]) * 8 + x + j[0]]) d++; });
    return d;
  }
  function findTour(sx, sy) {
    for (var attempt = 0; attempt < 50; attempt++) {
      var seen = {}, path = [[sx, sy]], x = sx, y = sy;
      seen[sy * 8 + sx] = true;
      while (path.length < 64) {
        var best = null, bestD = 9;
        var opts = JUMPS.slice().sort(function () { return Math.random() - 0.5; });
        opts.forEach(function (j) {
          var nx = x + j[0], ny = y + j[1];
          if (!onBoard(nx, ny) || seen[ny * 8 + nx]) return;
          var d = degree(nx, ny, seen);
          if (d < bestD) { bestD = d; best = [nx, ny]; }
        });
        if (!best) break;
        x = best[0]; y = best[1];
        seen[y * 8 + x] = true;
        path.push(best);
      }
      if (path.length === 64) return path;
    }
    return null;
  }

  var tour = [], shown = 0, tourTimer = null, tourVisible = false;
  function center(p) { return [p[0] * CELL + CELL / 2, p[1] * CELL + CELL / 2]; }

  function drawTour() {
    ctx.clearRect(0, 0, SIZE, SIZE);
    for (var y = 0; y < 8; y++) {
      for (var x = 0; x < 8; x++) {
        ctx.fillStyle = (x + y) % 2 ? '#8a6646' : '#ecdcc0';
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }
    // відвідані клітинки
    for (var i = 0; i < shown; i++) {
      var p = tour[i];
      ctx.fillStyle = 'rgba(20, 17, 15,' + (0.18 + 0.5 * i / 64) + ')';
      ctx.fillRect(p[0] * CELL, p[1] * CELL, CELL, CELL);
    }
    // лінія маршруту
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (var s = 1; s < shown; s++) {
      var a = center(tour[s - 1]), b = center(tour[s]);
      ctx.strokeStyle = 'hsl(' + (38 + s * 0.4) + ', 70%, ' + (52 + s * 0.25) + '%)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
    // номери ходів
    ctx.font = '600 13px "Inter Variable", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var n = 0; n < shown - 1; n++) {
      var c = center(tour[n]);
      ctx.fillStyle = 'rgba(255, 246, 228, .9)';
      ctx.fillText(String(n + 1), c[0], c[1] + CELL * 0.3);
    }
    if (shown > 0) {
      var k = center(tour[shown - 1]);
      ctx.beginPath();
      ctx.arc(k[0], k[1], CELL * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(212, 174, 102, .9)';
      ctx.fill();
      ctx.fillStyle = '#1c1410';
      ctx.font = Math.round(CELL * 0.55) + 'px "Chess Glyphs", "Segoe UI Symbol", sans-serif';
      ctx.fillText('♞︎', k[0], k[1] + 2);
    }
    stepOut.textContent = String(Math.max(shown, 1));
  }

  function startTour(x, y) {
    clearTimeout(tourTimer);
    tour = findTour(x, y) || [[x, y]];
    shown = 1;
    drawTour();
    if (reduceMotion) { shown = tour.length; drawTour(); return; }
    tourTimer = setTimeout(tourTick, 400);
  }
  function tourTick() {
    if (!tourVisible) { tourTimer = setTimeout(tourTick, 400); return; }
    if (shown < tour.length) {
      shown++;
      drawTour();
      tourTimer = setTimeout(tourTick, 170);
    } else {
      tourTimer = setTimeout(function () {
        startTour(Math.floor(Math.random() * 8), Math.floor(Math.random() * 8));
      }, 2600);
    }
  }
  canvas.addEventListener('click', function (e) {
    var r = canvas.getBoundingClientRect();
    var x = Math.floor((e.clientX - r.left) / r.width * 8);
    var y = Math.floor((e.clientY - r.top) / r.height * 8);
    startTour(Math.min(7, Math.max(0, x)), Math.min(7, Math.max(0, y)));
  });
  new IntersectionObserver(function (e) { tourVisible = e[0].isIntersecting; }, { threshold: 0.2 }).observe(canvas);

  function initTour() { startTour(0, 7); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(initTour); else initTour();
})();
