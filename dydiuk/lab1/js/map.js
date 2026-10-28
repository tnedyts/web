/* Стилізована мапа України з позначкою домівки (Рівне) */
(function () {
  'use strict';
  var box = document.getElementById('uaMap');
  if (!box || !window.UA_MAP) return;
  var P = window.UA_MAP.project;
  var NS = 'http://www.w3.org/2000/svg';
  var cities = [
    { n: 'Київ', lon: 30.52, lat: 50.45, d: 'Серія «Вікна о 2:14» і «Ребро» на Подолі.' },
    { n: 'Львів', lon: 24.03, lat: 49.84, d: 'Гвинтові сходи старих кам’яниць.' },
    { n: 'Луцьк', left: 1, lon: 25.33, lat: 50.75, d: 'Замок Любарта, портрет «Двері у світло».' },
    { n: 'Житомир', lon: 28.66, lat: 50.25, d: 'Зйомка весілля друзів, 2025.' },
    { n: 'Тернопіль', lon: 25.59, lat: 49.55, d: 'Нічна набережна Ставу.' },
    { n: 'Яремче', lon: 24.55, lat: 48.45, d: 'База для походів на Чорногору.' },
    { n: 'Шацьк', lon: 23.82, lat: 51.49, d: 'Озеро Світязь, кадр «Сам».' },
    { n: 'Одеса', lon: 30.72, lat: 46.48, d: '«Колонада о п’ятій».' },
    { n: 'Затока', lon: 30.47, lat: 46.07, d: '«Тридцять секунд моря».' }
  ];
  var home = { n: 'Рівне', lon: 26.2516, lat: 50.6199 };
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 1000 673');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Мапа України: домівка автора — Рівне');
  var s = '<g class="grid">';
  for (var lon = 23; lon <= 40; lon += 2) { var x = P(lon, 50)[0]; s += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="673"/>'; }
  for (var lat = 45; lat <= 52; lat += 1) { var y = P(30, lat)[1]; s += '<line x1="0" y1="' + y + '" x2="1000" y2="' + y + '"/><text x="6" y="' + (y - 4) + '">' + lat + '°</text>'; }
  s += '</g>';
  s += '<path class="ua draw" d="' + window.UA_MAP.path + '"/>';
  var h = P(home.lon, home.lat);
  // маршрути від дому
  cities.forEach(function (c) {
    var p = P(c.lon, c.lat);
    var mx = (h[0] + p[0]) / 2, my = (h[1] + p[1]) / 2 - 40;
    s += '<path class="route" d="M' + h[0] + ',' + h[1] + ' Q' + mx + ',' + my + ' ' + p[0] + ',' + p[1] + '"/>';
  });
  cities.forEach(function (c, i) {
    var p = P(c.lon, c.lat);
    s += '<g class="city" data-i="' + i + '" tabindex="0"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.5"/><text x="' + (c.left ? p[0] - 10 : p[0] + 10) + '" y="' + (p[1] + 6) + '"' + (c.left ? ' text-anchor="end"' : '') + '>' + c.n + '</text></g>';
  });
  s += '<g class="home"><circle class="pulse" cx="' + h[0] + '" cy="' + h[1] + '" r="12"/><circle class="pulse p2" cx="' + h[0] + '" cy="' + h[1] + '" r="12"/>' +
       '<circle cx="' + h[0] + '" cy="' + h[1] + '" r="8" fill="#0c0c0c"/><circle cx="' + h[0] + '" cy="' + h[1] + '" r="3" fill="#f2efe9"/>' +
       '<text x="' + (h[0] + 18) + '" y="' + (h[1] - 16) + '">Рівне — домівка</text></g>';
  svg.innerHTML = s;
  box.insertBefore(svg, box.firstChild);

  var tip = document.getElementById('mapTip');
  function showTip(el, title, text) {
    var br = box.getBoundingClientRect(), r = el.getBoundingClientRect();
    tip.innerHTML = '<b>' + title + '</b>' + text;
    tip.style.left = (r.left + r.width / 2 - br.left) + 'px';
    tip.style.top = (r.top - br.top) + 'px';
    tip.classList.add('on');
  }
  Array.prototype.forEach.call(svg.querySelectorAll('.city'), function (g) {
    var c = cities[+g.getAttribute('data-i')];
    var on = function () { showTip(g.querySelector('circle'), c.n, c.d); };
    g.addEventListener('mouseenter', on); g.addEventListener('focus', on);
    g.addEventListener('mouseleave', function () { tip.classList.remove('on'); });
    g.addEventListener('blur', function () { tip.classList.remove('on'); });
  });
  var hg = svg.querySelector('.home');
  hg.addEventListener('mouseenter', function () { showTip(hg.querySelector('circle:nth-of-type(3)'), 'Рівне', 'Домівка й студія «Світлопис». 50.62° пн. ш., 26.25° сх. д.'); });
  hg.addEventListener('mouseleave', function () { tip.classList.remove('on'); });
  hg.style.cursor = 'pointer';
})();
