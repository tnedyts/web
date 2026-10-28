/* «Смерекова Хата» — процедурні SVG-сцени Карпат та інтер’єрів */
(function () {
  var uid = 0;
  function R(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
  var PAL = {
    dawn: { sky: ['#f7c59f', '#e9a986', '#8fa9bd'], ridges: ['#8aa0b3', '#6b8798', '#47676f', '#2b4a45', '#163029'], sun: '#ffe2b8', sunY: 300 },
    night: { sky: ['#0a1328', '#16244a', '#2a3b66'], ridges: ['#2a3a62', '#1f2e50', '#17243f', '#101a30', '#0a1222'], moon: true, stars: true },
    winter: { sky: ['#b9d0e0', '#dde8ee', '#f4f1ea'], ridges: ['#c3d3de', '#a9bfcd', '#8aa3b3', '#e9eef1', '#f6f8f9'], snow: true, sun: '#fff7e6', sunY: 120 },
    fog: { sky: ['#c9d3cf', '#dfe4df', '#eef0ea'], ridges: ['#b7c4be', '#9aaea5', '#7a948a', '#55716a', '#2f4a43'], fog: true },
    summer: { sky: ['#8fc4df', '#bfe0ec', '#eef6ef'], ridges: ['#9db8c4', '#7aa497', '#5d8a6c', '#3f6f4c', '#24502f'], sun: '#fff6c8', sunY: 90 },
    fire: { sky: ['#110d1e', '#24183a', '#4a2a3e'], ridges: ['#3a2a48', '#2c2038', '#21182c', '#170f20', '#0e0914'], stars: true, fire: true },
    autumn: { sky: ['#f0c9a0', '#f4dcbc', '#f7ead6'], ridges: ['#c7a487', '#b77b52', '#9c5a35', '#6e3f22', '#2c3a2a'], sun: '#fff0d0', sunY: 160 },
    peak: { sky: ['#6aa9d6', '#a9d1ea', '#e7f2f6'], ridges: ['#7d97ac', '#5f7d8f', '#4d7262', '#2f5a45', '#1b3d2c'], peak: true, sun: '#ffffff', sunY: 70 }
  };
  function ridge(r, base, amp, w) {
    var p = 'M0 500 L0 ' + base, a1 = r() * 6, a2 = r() * 6, a3 = r() * 6, f1 = .004 + r() * .004, f2 = .011 + r() * .01, f3 = .03 + r() * .02;
    for (var x = 0; x <= 800; x += 8) {
      var y = base - amp * (Math.sin(x * f1 + a1) * .55 + Math.sin(x * f2 + a2) * .3 + Math.sin(x * f3 + a3) * .15 + .3) * (w || 1);
      p += ' L' + x + ' ' + y.toFixed(1);
    }
    return p + ' L800 500Z';
  }
  function spruce(x, y, h, c, snow) {
    var w = h * .42, s = '<g class="spruce">';
    s += '<rect x="' + (x - h * .03) + '" y="' + (y - h * .12) + '" width="' + h * .06 + '" height="' + h * .14 + '" fill="#2a1c12"/>';
    for (var i = 0; i < 4; i++) {
      var ty = y - h * .1 - i * h * .22, tw = w * (1 - i * .22);
      s += '<path d="M' + (x - tw) + ' ' + ty + ' L' + x + ' ' + (ty - h * .38) + ' L' + (x + tw) + ' ' + ty + 'Z" fill="' + c + '"/>';
      if (snow) s += '<path d="M' + (x - tw * .7) + ' ' + (ty - h * .1) + ' L' + x + ' ' + (ty - h * .38) + ' L' + (x + tw * .7) + ' ' + (ty - h * .1) + ' Q' + x + ' ' + (ty - h * .16) + ' ' + (x - tw * .7) + ' ' + (ty - h * .1) + 'Z" fill="#fff" opacity=".9"/>';
    }
    return s + '</g>';
  }
  function forest(r, y0, n, hmin, hmax, c, snow, x0, x1) {
    var s = '', arr = [];
    for (var i = 0; i < n; i++) arr.push([(x0 || 0) + r() * ((x1 || 800) - (x0 || 0)), y0 + r() * 30, hmin + r() * (hmax - hmin)]);
    arr.sort(function (a, b) { return a[1] - b[1]; }).forEach(function (t) { s += spruce(t[0], t[1], t[2], c, snow); });
    return s;
  }
  function chalet(x, y, sc, warm, snow) {
    var s = '<g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')">';
    s += '<rect x="-60" y="-50" width="120" height="50" fill="#6b4126"/>';
    for (var i = -46; i < 0; i += 8) s += '<path d="M-60 ' + i + ' h120" stroke="#4e2d18" stroke-width="2"/>';
    s += '<path d="M-78 -46 L0 -118 L78 -46Z" fill="#3a2416"/><path d="M-68 -50 L0 -110 L68 -50Z" fill="#7a4c2d"/>';
    if (snow) s += '<path d="M-82 -44 L0 -122 L82 -44 L72 -44 L0 -110 L-72 -44Z" fill="#fff"/>';
    s += '<rect x="-14" y="-92" width="28" height="30" fill="' + warm + '"/><path d="M0 -92 v30 M-14 -77 h28" stroke="#3a2416" stroke-width="2"/>';
    s += '<rect x="-48" y="-38" width="24" height="24" fill="' + warm + '"/><rect x="24" y="-38" width="24" height="24" fill="' + warm + '"/><rect x="-10" y="-34" width="20" height="34" fill="#3a2416"/>';
    s += '<rect x="-70" y="0" width="140" height="8" fill="#2a1c12"/><circle cx="0" cy="-60" r="70" fill="' + warm + '" opacity=".08"/>';
    return s + '</g>';
  }
  function chan(x, y, sc, steam) {
    var s = '<g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')"><ellipse cx="0" cy="12" rx="70" ry="14" fill="#000" opacity=".25"/>';
    s += '<path d="M-60 -20 Q-62 20 -40 30 H40 Q62 20 60 -20Z" fill="#b5652e"/><path d="M-60 -20 Q-62 20 -40 30 H40 Q62 20 60 -20Z" fill="url(#cu' + uid + ')"/>';
    s += '<ellipse cx="0" cy="-20" rx="60" ry="13" fill="#d8894a"/><ellipse cx="0" cy="-19" rx="54" ry="10" fill="#4e8a8a"/><ellipse cx="-12" cy="-21" rx="20" ry="4" fill="#9fd0c8" opacity=".6"/>';
    s += '<path d="M-26 30 l-6 14 h64 l-6 -14" fill="#2a1c12"/><path d="M-14 44 q 6 -18 14 -6 q 8 -16 14 6z" fill="#ff9a3c" class="flick"/>';
    if (steam) s += '<g class="steam3" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".55"><path d="M-24 -30 c -10 -16 10 -26 0 -44"/><path d="M8 -32 c -10 -16 10 -26 0 -48" style="animation-delay:-1s"/><path d="M34 -28 c -10 -14 10 -24 0 -40" style="animation-delay:-2s"/></g>';
    return s + '</g>';
  }
  function fire(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')"><circle r="90" fill="#ff8a3c" opacity=".12"/><circle r="50" fill="#ffb05c" opacity=".14"/><path d="M-40 10 L40 -6 M-40 -6 L40 10" stroke="#3a2416" stroke-width="10" stroke-linecap="round"/>' +
      '<path class="flick" d="M-24 0 C -30 -30 -6 -40 -4 -70 C 10 -46 30 -40 22 0Z" fill="#ff7a2c"/><path class="flick f2" d="M-12 0 C -16 -20 0 -28 2 -46 C 10 -30 20 -22 14 0Z" fill="#ffd36a"/></g>';
  }
  function people(x, y, c) {
    return '<g transform="translate(' + x + ' ' + y + ')" fill="' + c + '"><circle cx="0" cy="-34" r="7"/><path d="M-8 -26 h16 l4 26 h-24z"/><circle cx="24" cy="-30" r="6"/><path d="M17 -23 h14 l3 23 h-20z"/></g>';
  }

  window.sceneSVG = function (key, opt) {
    opt = opt || {}; uid++;
    if (INTERIOR[key]) return INTERIOR[key](uid);
    var P = PAL[key] || PAL.dawn, r = R(key.length * 9973 + key.charCodeAt(0) * 131 + (opt.seed || 0)), id = 'sc' + uid, s = '';
    s += '<svg class="scene" viewBox="0 0 800 500" preserveAspectRatio="xMid' + (key === 'fire' ? 'YMax' : 'YMid') + ' slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + (opt.label || 'Карпатський пейзаж') + '"><defs>';
    s += '<linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + P.sky[0] + '"/><stop offset=".55" stop-color="' + P.sky[1] + '"/><stop offset="1" stop-color="' + P.sky[2] + '"/></linearGradient>';
    s += '<linearGradient id="cu' + uid + '" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset=".4" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>';
    s += '<radialGradient id="' + id + 'g"><stop offset="0" stop-color="' + (P.sun || '#fff') + '" stop-opacity=".9"/><stop offset="1" stop-color="' + (P.sun || '#fff') + '" stop-opacity="0"/></radialGradient>';
    s += '<linearGradient id="' + id + 'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>';
    s += '<rect width="800" height="500" fill="url(#' + id + 's)"/>';
    if (P.stars) for (var i = 0; i < 90; i++) s += '<circle class="star" style="animation-delay:' + (r() * 4).toFixed(1) + 's" cx="' + (r() * 800).toFixed(0) + '" cy="' + (r() * 260).toFixed(0) + '" r="' + (r() * 1.4 + .3).toFixed(1) + '" fill="#fff" opacity="' + (.4 + r() * .6).toFixed(2) + '"/>';
    if (P.moon) s += '<circle cx="620" cy="90" r="60" fill="#f4ecd0" opacity=".12"/><circle cx="620" cy="90" r="28" fill="#f4ecd0"/><circle cx="610" cy="84" r="5" fill="#e0d5b4"/><circle cx="628" cy="98" r="4" fill="#e0d5b4"/>';
    if (P.sun) s += '<circle cx="560" cy="' + P.sunY + '" r="140" fill="url(#' + id + 'g)"/><circle cx="560" cy="' + P.sunY + '" r="30" fill="' + P.sun + '"/>';
    var bases = [250, 290, 330, 380, 430], amps = [120, 110, 90, 80, 60];
    if (P.peak) { s += '<path d="M180 500 L420 110 L470 160 L520 130 L760 500Z" fill="' + P.ridges[0] + '"/><path d="M420 110 L452 162 L438 156 L420 176 L404 150 L386 168Z" fill="#fff"/><path d="M520 130 L540 160 L524 158 L512 170 L500 150Z" fill="#fff"/><path d="M420 110 v-26 l22 8 -22 8" stroke="#2a3a4a" stroke-width="2" fill="#f5c542"/>'; bases = [320, 350, 390, 430, 460]; }
    for (var k = 0; k < 5; k++) {
      s += '<path d="' + ridge(r, bases[k], amps[k], k === 0 ? 1.2 : 1) + '" fill="' + P.ridges[k] + '"/>';
      if (P.snow && k < 2) s += '<path d="' + ridge(R(k + 7), bases[k] + 4, amps[k] * .5) + '" fill="#fff" opacity=".35"/>';
      if (P.fog && k < 4) s += '<rect class="fog-band" x="-200" y="' + (bases[k] - 30) + '" width="1200" height="70" fill="url(#' + id + 'f)" style="animation-delay:-' + k * 3 + 's"/>';
      if (k === 2) s += forest(r, bases[k] - 30, 26, 18, 32, P.ridges[3], P.snow);
      if (k === 3) s += forest(r, bases[k] - 26, 18, 34, 60, P.snow ? '#2f4a43' : P.ridges[4], P.snow);
    }
    var warm = key === 'night' || key === 'fire' ? '#ffcf73' : key === 'winter' ? '#ffd88a' : '#f7c97a';
    if (key === 'dawn' || key === 'winter' || key === 'night' || key === 'autumn') s += chalet(key === 'night' ? 250 : 520, 448, key === 'night' ? .9 : 1, warm, P.snow);
    if (key === 'night') s += chan(520, 452, 1, true);
    if (P.fire) { s += fire(400, 450) + people(300, 470, '#0e0914') + people(480, 472, '#0e0914'); }
    if (key === 'summer') { for (var sh = 0; sh < 7; sh++) { var sx = 120 + r() * 560, sy = 445 + r() * 30; s += '<g transform="translate(' + sx.toFixed(0) + ' ' + sy.toFixed(0) + ')"><ellipse rx="12" ry="8" fill="#f5f2ea"/><circle cx="11" cy="-3" r="4.5" fill="#3a2d26"/><path d="M-6 6 v6 M6 6 v6" stroke="#3a2d26" stroke-width="2"/></g>'; } s += '<path d="M600 470 L640 420 L680 470Z" fill="#5a3a22"/><rect x="616" y="448" width="46" height="24" fill="#7a4c2d"/>'; }
    s += forest(r, 470, 9, 70, 130, P.snow ? '#1f3a33' : P.ridges[4], P.snow, -40, 160) + forest(r, 470, 9, 70, 130, P.snow ? '#1f3a33' : P.ridges[4], P.snow, 660, 840);
    if (P.snow || key === 'winter') for (var f = 0; f < 60; f++) s += '<circle cx="' + (r() * 800).toFixed(0) + '" cy="' + (r() * 500).toFixed(0) + '" r="' + (r() * 2 + .6).toFixed(1) + '" fill="#fff" opacity=".85"/>';
    return s + '</svg>';
  };

  /* ---------- інтер’єри та сцени послуг ---------- */
  function room(u, o) {
    var id = 'rm' + u, s = '<svg class="scene" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + o.label + '"><defs>';
    s += '<linearGradient id="' + id + 'w" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="' + o.wall[0] + '"/><stop offset="1" stop-color="' + o.wall[1] + '"/></linearGradient>';
    s += '<linearGradient id="' + id + 'v" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="' + o.view[0] + '"/><stop offset="1" stop-color="' + o.view[1] + '"/></linearGradient>';
    s += '<radialGradient id="' + id + 'l" cx=".5" cy=".5"><stop offset="0" stop-color="#ffd48a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd48a" stop-opacity="0"/></radialGradient></defs>';
    s += '<rect width="800" height="500" fill="url(#' + id + 'w)"/>';
    for (var x = 0; x < 800; x += 38) s += '<path d="M' + x + ' 0 V380" stroke="#000" stroke-opacity=".12" stroke-width="2"/><path d="M' + (x + 19) + ' 0 V380" stroke="#fff" stroke-opacity=".04" stroke-width="14"/>';
    s += '<rect y="380" width="800" height="120" fill="' + o.floor + '"/>';
    for (var f = 0; f < 800; f += 90) s += '<path d="M' + f + ' 380 L' + (f - 60) + ' 500" stroke="#000" stroke-opacity=".12"/>';
    /* вікно */
    var wx = o.win[0], wy = o.win[1], ww = o.win[2], wh = o.win[3];
    s += '<rect x="' + (wx - 12) + '" y="' + (wy - 12) + '" width="' + (ww + 24) + '" height="' + (wh + 24) + '" fill="#3a2416"/><rect x="' + wx + '" y="' + wy + '" width="' + ww + '" height="' + wh + '" fill="url(#' + id + 'v)"/>';
    s += '<svg x="' + wx + '" y="' + wy + '" width="' + ww + '" height="' + wh + '" viewBox="0 0 400 250" preserveAspectRatio="xMidYMax slice">';
    s += '<path d="M0 250 L0 150 L60 90 L120 140 L200 60 L280 130 L340 100 L400 140 L400 250Z" fill="' + o.mount[0] + '"/><path d="M200 60 L222 90 L200 84 L184 96Z" fill="#fff" opacity=".85"/><path d="M0 250 L0 190 Q100 150 200 190 T400 180 L400 250Z" fill="' + o.mount[1] + '"/>';
    for (var t = 0; t < 12; t++) s += spruce(10 + t * 36, 250, 50 + (t * 37 % 30), o.mount[2]);
    if (o.night) s += '<circle cx="320" cy="50" r="14" fill="#f4ecd0"/>';
    s += '</svg><path d="M' + (wx + ww / 2) + ' ' + wy + ' v' + wh + ' M' + wx + ' ' + (wy + wh / 2) + ' h' + ww + '" stroke="#3a2416" stroke-width="8"/>';
    s += o.extra || '';
    s += '<ellipse cx="400" cy="460" rx="230" ry="26" fill="#000" opacity=".12"/>';
    return s + '</svg>';
  }
  function bed(x, y, w, blanket) {
    var s = '<g transform="translate(' + x + ' ' + y + ')"><rect x="-10" y="-120" width="' + (w + 20) + '" height="130" rx="8" fill="#5a3520"/><rect x="0" y="-40" width="' + w + '" height="60" rx="6" fill="#f3ead8"/>';
    s += '<rect x="20" y="-62" width="' + (w / 2 - 30) + '" height="34" rx="14" fill="#fffaf0"/><rect x="' + (w / 2 + 10) + '" y="-62" width="' + (w / 2 - 30) + '" height="34" rx="14" fill="#fffaf0"/>';
    s += '<rect x="-4" y="-18" width="' + (w + 8) + '" height="56" rx="6" fill="' + blanket + '"/>';
    for (var i = 0; i < 4; i++) s += '<rect x="-4" y="' + (-10 + i * 12) + '" width="' + (w + 8) + '" height="4" fill="#fff" opacity="' + (i % 2 ? .25 : .5) + '"/>';
    for (var j = 10; j < w; j += 22) s += '<path d="M' + j + ' 0 l6 6 -6 6 -6 -6z" fill="#f2c14e" opacity=".9"/>';
    return s + '<rect x="-10" y="36" width="' + (w + 20) + '" height="14" fill="#3a2416"/></g>';
  }
  function lamp(x, y) { return '<g transform="translate(' + x + ' ' + y + ')"><circle cy="-40" r="80" fill="url(#rm' + uid + 'l)"/><rect x="-24" y="0" width="48" height="50" fill="#5a3520"/><path d="M-3 0 V-30" stroke="#2a1c12" stroke-width="4"/><path d="M-20 -30 h40 l-8 -26 h-24z" fill="#f3d9a6"/></g>'; }
  var INTERIOR = {
    room1: function (u) { return room(u, { label: 'Номер «Ялиця»', wall: ['#c08a5a', '#9a6a40'], floor: '#6b4126', view: ['#cfe4ee', '#eef3ea'], mount: ['#7a9aa8', '#4f7a5a', '#2c4f3a'], win: [470, 90, 220, 190], extra: bed(130, 400, 280, '#b8322a') + lamp(480, 400) }); },
    room2: function (u) { return room(u, { label: 'Номер «Смерека»', wall: ['#d2a06c', '#a8774a'], floor: '#7a4c2d', view: ['#f6c59f', '#a9bccb'], mount: ['#6f8ea0', '#47676f', '#20403a'], win: [90, 70, 300, 250], extra: bed(440, 410, 280, '#2f5a4a') + '<g transform="translate(700 400)"><rect x="-30" y="-60" width="60" height="60" fill="#5a3520"/><rect x="-14" y="-90" width="28" height="30" rx="6" fill="#2a1c12"/></g>' }); },
    room3: function (u) { return room(u, { label: 'Сімейний номер «Ґражда»', wall: ['#b98455', '#8f6038'], floor: '#5f3a20', view: ['#bcd8e6', '#e8f1ea'], mount: ['#87a6b2', '#5d8a6c', '#2c4f3a'], win: [520, 80, 200, 180], extra: bed(70, 410, 250, '#d9822b') + '<g transform="translate(400 300)"><rect x="-10" y="-10" width="120" height="180" rx="10" fill="#3a2416"/><rect x="0" y="0" width="100" height="160" rx="8" fill="#2a1c12"/><circle cx="50" cy="110" r="34" fill="#ff8a3c" opacity=".4" class="flick"/><path d="M30 130 q 20 -60 40 0z" fill="#ffb347" class="flick"/><rect x="40" y="-120" width="20" height="110" fill="#5a3520"/></g><path d="M80 170 Q200 230 320 170" stroke="#e9d9b8" stroke-width="10" fill="none"/>' }); },
    room4: function (u) { return room(u, { label: 'Люкс «Говерла»', night: true, wall: ['#8a5a36', '#5e3a20'], floor: '#4a2c16', view: ['#16244a', '#3a4c7a'], mount: ['#2a3a62', '#17243f', '#0a1222'], win: [60, 50, 420, 300], extra: '<g transform="translate(620 380)"><rect x="-90" y="-200" width="180" height="200" fill="#6b5a4a"/><rect x="-60" y="-120" width="120" height="120" rx="60" fill="#1a120c"/><circle cx="0" cy="-40" r="90" fill="#ff8a3c" opacity=".18"/><path class="flick" d="M-30 -10 C -36 -50 -8 -60 -4 -96 C 12 -60 34 -50 26 -10Z" fill="#ff7a2c"/><path class="flick f2" d="M-14 -10 C -18 -34 0 -40 2 -60 C 12 -40 20 -30 14 -10Z" fill="#ffd36a"/><rect x="-110" y="-210" width="220" height="16" fill="#3a2416"/></g>' + '<g transform="translate(250 450)"><path d="M-120 -60 h240 q0 60 -60 60 h-120 q-60 0 -60 -60z" fill="#f4f1ea"/><path d="M-100 0 v20 M100 0 v20" stroke="#c9a46a" stroke-width="8"/><ellipse cx="0" cy="-60" rx="120" ry="10" fill="#cfe3e6"/></g>' }); },
    room5: function (u) {
      return window.sceneSVG('dawn', { label: 'Шале «Кедр»', seed: 5 }).replace('</svg>', chan(640, 470, .7, true) + '</svg>');
    },
    sauna: function (u) { return room(u, { label: 'Сауна', wall: ['#e0b27c', '#c08a5a'], floor: '#8a5a36', view: ['#d4e6ee', '#f0f4ef'], mount: ['#8fa9b6', '#5d8a6c', '#2c4f3a'], win: [430, 70, 300, 220], extra: '<rect x="40" y="300" width="360" height="30" fill="#b07a4a"/><rect x="40" y="380" width="420" height="30" fill="#b07a4a"/><g transform="translate(150 380)"><rect x="-40" y="-90" width="80" height="90" fill="#3a3a3a"/><g fill="#7a7a7a"><circle cx="-20" cy="-96" r="14"/><circle cx="6" cy="-100" r="16"/><circle cx="28" cy="-94" r="12"/></g><g class="steam3" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".5"><path d="M-10 -120 c -10 -20 10 -30 0 -54"/><path d="M20 -116 c -10 -20 10 -30 0 -54" style="animation-delay:-1.5s"/></g></g><g transform="translate(560 430)"><path d="M0 0 l-20 -60 h40z" fill="#5b7a3a"/><rect x="-4" y="-80" width="8" height="30" fill="#8a5a36"/></g>' }); },
    massage: function (u) {
      var s = '<svg class="scene" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Масаж"><defs><radialGradient id="ms' + u + '" cx=".5" cy=".4"><stop offset="0" stop-color="#f6ead6"/><stop offset="1" stop-color="#d7c2a2"/></radialGradient></defs><rect width="800" height="500" fill="url(#ms' + u + ')"/>';
      s += '<rect y="320" width="800" height="180" fill="#8a5a36"/><rect y="320" width="800" height="10" fill="#6b4126"/>';
      [[280, 300, 70, '#4a4a48'], [360, 290, 56, '#5e5d58'], [425, 296, 44, '#3e3d3a']].forEach(function (p) { s += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="' + p[2] + '" ry="' + p[2] * .42 + '" fill="' + p[3] + '"/><ellipse cx="' + (p[0] - 10) + '" cy="' + (p[1] - 8) + '" rx="' + p[2] * .5 + '" ry="' + p[2] * .12 + '" fill="#fff" opacity=".15"/>'; });
      s += '<g transform="translate(560 300)"><rect x="-26" y="-60" width="52" height="60" rx="6" fill="#f4ecd8"/><path d="M0 -60 v-10" stroke="#2a1c12" stroke-width="2"/><path class="flick" d="M0 -96 c 8 10 6 20 0 24 c -6 -4 -8 -14 0 -24z" fill="#ffb347"/><circle cy="-80" r="40" fill="#ffd48a" opacity=".25"/></g>';
      s += '<g transform="translate(160 310)"><rect x="-30" y="-50" width="60" height="50" rx="10" fill="#c9a46a"/><path d="M-20 -50 q 20 -60 40 0" fill="#7a9a5a"/><path d="M0 -50 l-10 -50 M0 -50 l14 -44 M0 -50 l0 -56" stroke="#5b7a3a" stroke-width="3"/><circle cx="-10" cy="-100" r="5" fill="#b07ac8"/><circle cx="14" cy="-94" r="5" fill="#b07ac8"/><circle cx="0" cy="-106" r="5" fill="#b07ac8"/></g>';
      for (var i = 0; i < 7; i++) s += '<path d="M' + (640 + i * 14) + ' 316 q 4 -40 30 -60" stroke="#5b7a3a" stroke-width="3" fill="none"/>';
      return s + '</svg>';
    },
    chan: function (u) { return window.sceneSVG('night', { label: 'Чан на дровах', seed: 3 }); },
    hoverla: function (u) { return window.sceneSVG('peak', { label: 'Говерла', seed: 2 }).replace('</svg>', people(320, 480, '#1b3d2c') + '</svg>'); },
    polonyna: function (u) { return window.sceneSVG('summer', { label: 'Полонина', seed: 4 }); },
    waterfall: function (u) {
      var s = window.sceneSVG('fog', { label: 'Водоспад', seed: 6 });
      var w = '<g><path d="M330 500 L350 280 L450 280 L470 500Z" fill="#cfe6ee" opacity=".9"/><g class="water" stroke="#fff" stroke-width="5" opacity=".8">';
      for (var i = 0; i < 9; i++) w += '<path d="M' + (356 + i * 11) + ' 280 V500" stroke-dasharray="30 18"/>';
      w += '</g><path d="M320 290 L350 270 h100 l30 20 Z" fill="#4a5a52"/><ellipse cx="400" cy="490" rx="110" ry="20" fill="#fff" opacity=".7"/></g>';
      return s.replace('</svg>', w + '</svg>');
    },
    jeep: function (u) {
      var s = window.sceneSVG('autumn', { label: 'Джип-тур', seed: 8 });
      var j = '<path d="M0 500 Q300 430 800 470 L800 500Z" fill="#6e5a46"/><g transform="translate(420 470)"><rect x="-70" y="-46" width="140" height="34" rx="6" fill="#2f5a45"/><path d="M-40 -46 l10 -26 h56 l14 26z" fill="#2f5a45"/><path d="M-30 -48 l7 -18 h22 v18z M6 -48 v-18 h18 l8 18z" fill="#bfe0ec"/><circle cx="-42" cy="-10" r="16" fill="#1a1a1a"/><circle cx="42" cy="-10" r="16" fill="#1a1a1a"/><circle cx="-42" cy="-10" r="6" fill="#777"/><circle cx="42" cy="-10" r="6" fill="#777"/><rect x="62" y="-40" width="10" height="8" fill="#ffd36a"/></g>';
      return s.replace('</svg>', j + '</svg>');
    },
    food: function (u) {
      var s = '<svg class="scene" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Страва ресторану"><rect width="800" height="500" fill="#5a3520"/>';
      for (var y = 0; y < 500; y += 60) s += '<rect y="' + y + '" width="800" height="58" fill="#6b4126"/><path d="M0 ' + (y + 30) + ' q 200 -8 400 0 t 400 0" stroke="#4e2d18" fill="none"/>';
      s += '<rect x="80" y="60" width="200" height="380" fill="#f3ead8" transform="rotate(-8 180 250)"/><g transform="rotate(-8 180 250)">'; for (var k = 0; k < 18; k++) s += '<path d="M' + (96 + (k % 9) * 20) + ' ' + (k < 9 ? 80 : 410) + ' l8 8 -8 8 -8 -8z" fill="#b8322a"/>'; s += '</g>';
      s += '<circle cx="450" cy="250" r="170" fill="#000" opacity=".25"/><circle cx="440" cy="240" r="170" fill="#e9e0cf"/><circle cx="440" cy="240" r="130" fill="#f6f0e4"/><circle cx="440" cy="240" r="110" fill="#f2c14e"/><circle cx="420" cy="220" r="70" fill="#f6d36e" opacity=".7"/>';
      for (var b = 0; b < 16; b++) { var a = b * 2.4, d = 20 + (b * 13 % 70); s += '<rect x="' + (440 + Math.cos(a) * d).toFixed(0) + '" y="' + (240 + Math.sin(a) * d).toFixed(0) + '" width="14" height="10" rx="3" fill="' + (b % 3 ? '#fffaf0' : '#a8642a') + '"/>'; }
      s += '<g transform="translate(680 330) rotate(30)"><rect x="-6" y="-120" width="12" height="160" rx="6" fill="#c9a46a"/><ellipse cy="-130" rx="22" ry="30" fill="#c9a46a"/></g>';
      s += '<g class="steam3" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".4"><path d="M410 120 c -12 -20 12 -30 0 -54"/><path d="M450 116 c -12 -20 12 -30 0 -60" style="animation-delay:-1s"/><path d="M490 124 c -12 -20 12 -30 0 -50" style="animation-delay:-2s"/></g>';
      return s + '</svg>';
    }
  };
})();
