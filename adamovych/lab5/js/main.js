/* =========================================================
   Піцерія «Скибка» — сценарії
   1. Малювання піц у SVG (8 шматочків, що розсуваються)
   2. Кошик (зберігається в браузері), меню, розмір піци
   3. Доставка і форма замовлення
   4. Відгуки, лічильники, графік роботи, поява блоків
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function r1(n) { return Math.round(n * 10) / 10; }

  /* ---------- 1. Піца ---------- */
  var TOPPINGS = {
    margherita: function (R) {
      var s = '';
      for (var i = 0; i < 9; i++) { var p = spot(R, 62); s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r1(9 + R() * 5) + '" fill="#fffaf0" opacity=".95"/>'; }
      for (var j = 0; j < 7; j++) { var q = spot(R, 60); s += '<ellipse cx="' + q[0] + '" cy="' + q[1] + '" rx="9" ry="4.5" fill="#2f8f3a" transform="rotate(' + Math.round(R() * 180) + ' ' + q[0] + ' ' + q[1] + ')"/>'; }
      return s;
    },
    pepperoni: function (R) {
      var s = '';
      for (var i = 0; i < 13; i++) {
        var p = spot(R, 62), r = r1(10 + R() * 3);
        s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '" fill="#b5281c"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r1(r - 3) + '" fill="#cf3b2a"/>' +
          '<circle cx="' + r1(p[0] - 3) + '" cy="' + r1(p[1] - 2) + '" r="1.4" fill="#8e1d14"/><circle cx="' + r1(p[0] + 3) + '" cy="' + r1(p[1] + 3) + '" r="1.2" fill="#8e1d14"/>';
      }
      return s;
    },
    cheese: function (R) {
      var s = '', cols = ['#fff3c4', '#ffe08a', '#f7f1e3', '#e9e2c8'];
      for (var i = 0; i < 16; i++) { var p = spot(R, 64); s += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="' + r1(8 + R() * 6) + '" ry="' + r1(6 + R() * 5) + '" fill="' + cols[i % 4] + '"/>'; }
      for (var j = 0; j < 6; j++) { var q = spot(R, 55); s += '<path d="M' + q[0] + ' ' + q[1] + 'q4 3 9 1" stroke="#6c8fb5" stroke-width="1.6" fill="none"/>'; }
      return s;
    },
    hawaii: function (R) {
      var s = '';
      for (var i = 0; i < 10; i++) { var p = spot(R, 60); s += '<rect x="' + r1(p[0] - 6) + '" y="' + r1(p[1] - 6) + '" width="12" height="12" rx="2" fill="#f0a3a0" transform="rotate(' + Math.round(R() * 90) + ' ' + p[0] + ' ' + p[1] + ')"/>'; }
      for (var j = 0; j < 9; j++) { var q = spot(R, 60); s += '<path d="M' + q[0] + ' ' + q[1] + 'l10 -4l-2 10z" fill="#ffd34d" stroke="#e8b52a" stroke-width="1"/>'; }
      return s;
    },
    skybka: function (R) {
      var s = '';
      for (var i = 0; i < 8; i++) { var p = spot(R, 58); s += '<path d="M' + r1(p[0] - 10) + ' ' + p[1] + 'q5 -5 10 0t10 0" stroke="#d9736a" stroke-width="6" fill="none" stroke-linecap="round" transform="rotate(' + Math.round(R() * 180) + ' ' + p[0] + ' ' + p[1] + ')"/>'; }
      for (var j = 0; j < 8; j++) { var q = spot(R, 60); s += '<path d="M' + r1(q[0] - 7) + ' ' + q[1] + 'a7 6 0 0 1 14 0z" fill="#e8d3b0"/><rect x="' + r1(q[0] - 2) + '" y="' + q[1] + '" width="4" height="6" fill="#d8bf98"/>'; }
      for (var k = 0; k < 6; k++) { var o = spot(R, 60); s += '<circle cx="' + o[0] + '" cy="' + o[1] + '" r="7" fill="none" stroke="#9c4f8f" stroke-width="2"/>'; }
      return s;
    },
    karpatska: function (R) {
      var s = '';
      for (var i = 0; i < 11; i++) { var p = spot(R, 62); s += '<rect x="' + r1(p[0] - 5) + '" y="' + r1(p[1] - 5) + '" width="10" height="10" rx="2" fill="#fbfbf4" stroke="#e6e2d0"/>'; }
      for (var j = 0; j < 8; j++) { var q = spot(R, 60); s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="8" fill="#8a2f24"/><circle cx="' + q[0] + '" cy="' + q[1] + '" r="5" fill="#a63c2e"/>'; }
      for (var k = 0; k < 6; k++) { var m = spot(R, 60); s += '<path d="M' + r1(m[0] - 7) + ' ' + m[1] + 'a7 6 0 0 1 14 0z" fill="#e8d3b0"/>'; }
      return s;
    },
    veggie: function (R) {
      var s = '';
      for (var i = 0; i < 7; i++) { var p = spot(R, 60); s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="10" fill="#e5483a"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="6" fill="#f0786a"/>'; }
      for (var j = 0; j < 7; j++) { var q = spot(R, 60); s += '<path d="M' + q[0] + ' ' + q[1] + 'a9 9 0 0 1 16 4" stroke="' + (j % 2 ? '#3fa34d' : '#f2b100') + '" stroke-width="4" fill="none" stroke-linecap="round"/>'; }
      for (var k = 0; k < 8; k++) { var o = spot(R, 62); s += '<circle cx="' + o[0] + '" cy="' + o[1] + '" r="4.5" fill="none" stroke="#222" stroke-width="3"/>'; }
      for (var c = 0; c < 14; c++) { var z = spot(R, 64); s += '<circle cx="' + z[0] + '" cy="' + z[1] + '" r="2.6" fill="#ffd23f"/>'; }
      return s;
    },
    bbq: function (R) {
      var s = '';
      for (var i = 0; i < 10; i++) { var p = spot(R, 60); s += '<rect x="' + r1(p[0] - 7) + '" y="' + r1(p[1] - 5) + '" width="14" height="10" rx="4" fill="#d9a066" transform="rotate(' + Math.round(R() * 90) + ' ' + p[0] + ' ' + p[1] + ')"/>'; }
      for (var k = 0; k < 5; k++) { var o = spot(R, 60); s += '<circle cx="' + o[0] + '" cy="' + o[1] + '" r="7" fill="none" stroke="#9c4f8f" stroke-width="2"/>'; }
      s += '<path d="M40 70 Q70 60 90 80 T140 80 M50 120 Q80 105 110 125 T160 118" stroke="#5a2a14" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".85"/>';
      return s;
    }
  };
  function spot(R, max) { // випадкова точка всередині кола
    var a = R() * Math.PI * 2, d = Math.sqrt(R()) * max;
    return [r1(100 + Math.cos(a) * d), r1(100 + Math.sin(a) * d)];
  }
  var uid = 0;
  function drawPizza(svg) {
    var kind = svg.getAttribute('data-kind') || 'margherita';
    var R = rng(+svg.getAttribute('data-seed') || 1);
    var id = 'pz' + (++uid);
    var cheese = '';
    for (var i = 0; i < 14; i++) { var p = spot(R, 58); cheese += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r1(10 + R() * 12) + '" fill="#ffd98a" opacity=".55"/>'; }
    var whole = '<circle cx="100" cy="100" r="96" fill="url(#' + id + 'c)"/>' +
      '<circle cx="100" cy="100" r="80" fill="' + (kind === 'cheese' || kind === 'skybka' ? '#f5deaa' : kind === 'bbq' ? '#a8552c' : '#d9472b') + '"/>' +
      cheese + (TOPPINGS[kind] || TOPPINGS.margherita)(R);
    var defs = '<defs><radialGradient id="' + id + 'c"><stop offset=".78" stop-color="#f2c06b"/><stop offset=".92" stop-color="#d8913a"/><stop offset="1" stop-color="#b8722a"/></radialGradient>' +
      '<g id="' + id + '">' + whole + '</g>';
    var slices = '';
    for (var k = 0; k < 8; k++) {
      var a0 = k * Math.PI / 4, a1 = (k + 1) * Math.PI / 4, am = (a0 + a1) / 2;
      defs += '<clipPath id="' + id + 's' + k + '"><path d="M100 100L' + r1(100 + Math.cos(a0) * 110) + ' ' + r1(100 + Math.sin(a0) * 110) + 'L' + r1(100 + Math.cos(am) * 150) + ' ' + r1(100 + Math.sin(am) * 150) + 'L' + r1(100 + Math.cos(a1) * 110) + ' ' + r1(100 + Math.sin(a1) * 110) + 'Z"/></clipPath>';
      slices += '<g class="slice" style="--dx:' + r1(Math.cos(am) * 9) + 'px;--dy:' + r1(Math.sin(am) * 9) + 'px"><use href="#' + id + '" clip-path="url(#' + id + 's' + k + ')"/></g>';
    }
    defs += '</defs>';
    // тонкі лінії розрізу
    var cuts = '<g stroke="rgba(120,60,20,.35)" stroke-width="1.2">';
    for (var c = 0; c < 4; c++) {
      var a = c * Math.PI / 4;
      cuts += '<line x1="' + r1(100 + Math.cos(a) * 96) + '" y1="' + r1(100 + Math.sin(a) * 96) + '" x2="' + r1(100 - Math.cos(a) * 96) + '" y2="' + r1(100 - Math.sin(a) * 96) + '"/>';
    }
    cuts += '</g>';
    svg.innerHTML = defs + '<g>' + slices + '</g>' + cuts;
  }
  document.querySelectorAll('svg.pizza').forEach(drawPizza);

  /* ---------- 2. Кошик ---------- */
  var KEY = 'skybka-cart';
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { cart = []; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* без збереження */ } }
  function total() { return cart.reduce(function (s, it) { return s + it.price * it.qty; }, 0); }
  function money(n) { return n.toLocaleString('uk-UA') + ' грн'; }

  function renderCart() {
    var count = cart.reduce(function (s, it) { return s + it.qty; }, 0);
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = count; });
    document.querySelectorAll('[data-cart-sum]').forEach(function (el) { el.textContent = money(total()); });
    document.querySelectorAll('[data-cart-rows]').forEach(function (tb) {
      if (!cart.length) { tb.innerHTML = '<tr><td class="cart__empty" colspan="3">Кошик поки порожній</td></tr>'; return; }
      tb.innerHTML = cart.map(function (it, i) {
        return '<tr><td>' + it.name + ' <small>&times;' + it.qty + '</small></td><td align="right">' + money(it.price * it.qty) +
          '</td><td align="right" width="24"><button class="cart__x" type="button" data-remove="' + i + '" aria-label="Прибрати">&times;</button></td></tr>';
      }).join('');
    });
    updateDelivery();
  }
  document.addEventListener('click', function (e) {
    var rm = e.target.closest('[data-remove]');
    if (rm) { cart.splice(+rm.getAttribute('data-remove'), 1); save(); renderCart(); }
    if (e.target.closest('[data-cart-clear]')) { cart = []; save(); renderCart(); }
    if (e.target.closest('[data-top]')) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }
  });

  var size = '30';
  function addToCart(btn) {
    var name = btn.getAttribute('data-name'), price;
    var cell = btn.closest('tr') && btn.closest('tr').querySelector('.menu__price');
    if (cell) {
      price = +cell.getAttribute('data-p' + size);
      if (cell.getAttribute('data-p30') !== cell.getAttribute('data-p40')) name += ' (' + size + ' см)';
    } else {
      price = +btn.getAttribute('data-price');
      name += ' (30 см)';
    }
    var found = cart.filter(function (it) { return it.name === name; })[0];
    if (found) found.qty++; else cart.push({ name: name, price: price, qty: 1 });
    save();
    renderCart();
    flyToCart(btn);
  }
  document.querySelectorAll('.add').forEach(function (b) { b.addEventListener('click', function () { addToCart(b); }); });

  var cartBtn = document.querySelector('.cart-btn');
  function flyToCart(from) {
    cartBtn.classList.remove('bump'); void cartBtn.offsetWidth; cartBtn.classList.add('bump');
    if (reduce) return;
    var a = from.getBoundingClientRect(), b = cartBtn.getBoundingClientRect();
    var fly = document.createElementNS(NS, 'svg');
    fly.setAttribute('viewBox', '0 0 200 200');
    fly.setAttribute('class', 'pizza flyer');
    fly.setAttribute('data-kind', 'pepperoni');
    fly.setAttribute('data-seed', '3');
    document.body.appendChild(fly);
    drawPizza(fly);
    fly.animate([
      { transform: 'translate(' + (a.left + a.width / 2 - 25) + 'px,' + (a.top + a.height / 2 - 25) + 'px) scale(.6) rotate(0)', opacity: 1 },
      { transform: 'translate(' + ((a.left + b.left) / 2) + 'px,' + (Math.min(a.top, b.top) - 120) + 'px) scale(1) rotate(180deg)', opacity: 1, offset: .5 },
      { transform: 'translate(' + (b.left + b.width / 2 - 25) + 'px,' + (b.top + b.height / 2 - 25) + 'px) scale(.3) rotate(360deg)', opacity: .2 }
    ], { duration: 800, easing: 'cubic-bezier(.5,0,.5,1)' }).onfinish = function () { fly.remove(); };
  }

  // фільтр меню
  document.querySelectorAll('[data-filter]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      document.querySelectorAll('[data-filter]').forEach(function (c) { c.classList.toggle('is-on', c === chip); });
      document.querySelectorAll('.menu tbody[data-cat]').forEach(function (tb) {
        tb.classList.toggle('is-hidden', f !== 'all' && tb.getAttribute('data-cat') !== f);
      });
    });
  });
  // розмір піци
  document.querySelectorAll('[data-size]').forEach(function (b) {
    b.addEventListener('click', function () {
      size = b.getAttribute('data-size');
      document.querySelectorAll('[data-size]').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      document.querySelectorAll('.menu__price').forEach(function (cell) {
        var span = cell.querySelector('span');
        cell.classList.remove('flip'); void cell.offsetWidth; cell.classList.add('flip');
        setTimeout(function () { span.textContent = cell.getAttribute('data-p' + size); }, 200);
      });
    });
  });

  /* ---------- 3. Доставка ---------- */
  var zoneSel = document.getElementById('oZone');
  function deliveryCost(sum, zone) {
    if (zone === 'pickup') return -Math.round(sum * 0.1);
    if (zone === '2') return sum >= 700 ? 0 : 60;
    return sum >= 400 ? 0 : 40;
  }
  function updateDelivery() {
    if (!zoneSel) return;
    var sum = total(), zone = zoneSel.value;
    var d = sum ? deliveryCost(sum, zone) : 0;
    document.getElementById('sumDelivery').textContent = zone === 'pickup' ? 'самовивіз ' + money(d) : d === 0 && sum ? 'безкоштовно' : money(d);
    document.getElementById('sumTotal').textContent = money(sum + d);
    document.querySelectorAll('.zones tr[data-zone]').forEach(function (tr) { tr.classList.toggle('is-picked', tr.getAttribute('data-zone') === zone); });
  }
  if (zoneSel) {
    zoneSel.addEventListener('change', updateDelivery);
    document.querySelectorAll('.zones tr[data-zone]').forEach(function (tr) {
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', function () { zoneSel.value = tr.getAttribute('data-zone'); updateDelivery(); });
    });
    document.getElementById('orderForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('oName'), addr = document.getElementById('oAddr');
      var msg = document.getElementById('orderMsg');
      [name, addr].forEach(function (i) { i.classList.remove('is-error'); });
      msg.classList.add('is-bad');
      if (!cart.length) { msg.textContent = 'Спершу додайте страви в кошик.'; return; }
      if (!name.value.trim()) { name.classList.add('is-error'); msg.textContent = 'Вкажіть ім’я.'; return; }
      if (zoneSel.value !== 'pickup' && !addr.value.trim()) { addr.classList.add('is-error'); msg.textContent = 'Вкажіть адресу доставки.'; return; }
      msg.classList.remove('is-bad');
      msg.textContent = 'Дякуємо, ' + name.value.trim() + '! Замовлення прийнято (навчальний режим).';
      cart = []; save(); renderCart();
    });
  }
  renderCart();

  /* ---------- 4. Відгуки, лічильники, графік ---------- */
  var reviews = document.querySelector('[data-reviews]');
  if (reviews) {
    var items = reviews.querySelectorAll('.review'), cur = 0, timer;
    var show = function (n) {
      items[cur].classList.remove('is-active');
      cur = (n + items.length) % items.length;
      items[cur].classList.add('is-active');
    };
    var auto = function () { clearInterval(timer); if (!reduce) timer = setInterval(function () { show(cur + 1); }, 6000); };
    reviews.querySelector('[data-prev]').addEventListener('click', function () { show(cur - 1); auto(); });
    reviews.querySelector('[data-next]').addEventListener('click', function () { show(cur + 1); auto(); });
    auto();
  }

  // підсвічуємо сьогоднішній день у графіку
  var day = (new Date().getDay() + 6) % 7; // 0 — понеділок
  document.querySelectorAll('.hours').forEach(function (t) {
    var rows = t.querySelectorAll('tr');
    if (rows[day]) rows[day].classList.add('is-today');
  });

  // відлік до кінця «піци дня» — опівночі
  var cds = document.querySelectorAll('[data-countdown]');
  function tick() {
    var now = new Date(), end = new Date(now); end.setHours(24, 0, 0, 0);
    var s = Math.floor((end - now) / 1000);
    var t = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(function (n) { return String(n).padStart(2, '0'); }).join(':');
    cds.forEach(function (el) { el.textContent = t; el.setAttribute('datetime', 'PT' + s + 'S'); });
  }
  if (cds.length) { tick(); setInterval(tick, 1000); }

  function countUp(el) {
    var to = +el.getAttribute('data-to'), t0 = null;
    if (reduce) { el.textContent = to; return; }
    requestAnimationFrame(function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1300, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    });
  }
  document.querySelectorAll('[data-to]').forEach(countUp);

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el, i) {
    el.style.transitionDelay = (i % 3) * 0.08 + 's';
    io.observe(el);
  });
})();
