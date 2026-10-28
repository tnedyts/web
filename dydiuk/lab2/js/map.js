/* Мапа: домівка автора (Рівне) і точки спостережень */
(function () {
  'use strict';
  var box = document.getElementById('uaMap');
  if (!box || !window.UA_MAP) return;
  var P = window.UA_MAP.project;
  var spots = [
    { n: 'Шацьк', lon: 23.85, lat: 51.50, d: 'Шацькі озера: темне небо класу 3 за Бортлем, Персеїди-2025.' },
    { n: 'Клесів', lon: 26.93, lat: 51.33, d: 'Поліські ліси — тут я вперше побачив пилові прожилки Чумацького Шляху.' },
    { n: 'Луцьк', lon: 25.33, lat: 50.75, d: 'Спільна ніч спостережень з місцевим астроклубом.', left: 1 },
    { n: 'Шпиці', lon: 24.53, lat: 48.03, d: 'Карпати, Чорногора: мрія — спостереження біля обсерваторії «Білий слон».' },
    { n: 'Київ', lon: 30.52, lat: 50.45, d: 'Лекторій планетарію і перегляд запуску місії на великому екрані.' },
    { n: 'Кам’янець-Подільський', lon: 26.58, lat: 48.68, d: 'Метеорний потік Гемініди над фортецею, 2024.' }
  ];
  var home = { lon: 26.2516, lat: 50.6199 };
  var h = P(home.lon, home.lat);
  var s = '';
  for (var i = 0; i < 60; i++) s += '<circle class="mstar" cx="' + (Math.random() * 1000).toFixed(0) + '" cy="' + (Math.random() * 673).toFixed(0) + '" r="' + (Math.random() * 1.4 + .3).toFixed(1) + '" style="animation-delay:' + (Math.random() * 3).toFixed(1) + 's"/>';
  s += '<path class="ua" d="' + window.UA_MAP.path + '"/>';
  spots.forEach(function (c) {
    var p = P(c.lon, c.lat);
    s += '<path d="M' + h[0] + ',' + h[1] + ' Q' + ((h[0] + p[0]) / 2) + ',' + ((h[1] + p[1]) / 2 - 50) + ' ' + p[0] + ',' + p[1] + '" fill="none" stroke="#8b7dff" stroke-width="1.4" stroke-dasharray="4 6" opacity=".6"/>';
  });
  spots.forEach(function (c, i) {
    var p = P(c.lon, c.lat);
    s += '<g class="spot" data-i="' + i + '" tabindex="0"><circle class="dot" cx="' + p[0] + '" cy="' + p[1] + '" r="6"/><text x="' + (c.left ? p[0] - 12 : p[0] + 12) + '" y="' + (p[1] + 6) + '"' + (c.left ? ' text-anchor="end"' : '') + '>' + c.n + '</text></g>';
  });
  s += '<g class="home"><circle class="pulse" cx="' + h[0] + '" cy="' + h[1] + '" r="12"/><circle class="pulse p2" cx="' + h[0] + '" cy="' + h[1] + '" r="12"/><circle cx="' + h[0] + '" cy="' + h[1] + '" r="9" fill="#ffc861"/><text x="' + (h[0] + 16) + '" y="' + (h[1] + 30) + '">Рівне · дім</text></g>';
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 1000 673');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Мапа України: домівка автора — Рівне, і точки спостережень');
  svg.innerHTML = s;
  box.insertBefore(svg, box.firstChild);
  var tip = document.getElementById('mapTip');
  var show = function (el, t, d) {
    var br = box.getBoundingClientRect(), r = el.getBoundingClientRect();
    tip.innerHTML = '<b>' + t + '</b>' + d;
    tip.style.left = (r.left + r.width / 2 - br.left) + 'px'; tip.style.top = (r.top - br.top) + 'px';
    tip.classList.add('on');
  };
  var hide = function () { tip.classList.remove('on'); };
  Array.prototype.forEach.call(svg.querySelectorAll('.spot'), function (g) {
    var c = spots[+g.getAttribute('data-i')];
    var on = function () { show(g.querySelector('circle'), c.n, c.d); };
    g.addEventListener('mouseenter', on); g.addEventListener('focus', on);
    g.addEventListener('mouseleave', hide); g.addEventListener('blur', hide);
  });
  var hg = svg.querySelector('.home');
  hg.style.cursor = 'pointer';
  hg.addEventListener('mouseenter', function () { show(hg.querySelector('circle:nth-of-type(3)'), 'Рівне — домівка', 'Звідси я веду щоденник. Балкон на 7-му поверсі, небо класу 7 за Бортлем.'); });
  hg.addEventListener('mouseleave', hide);
})();
