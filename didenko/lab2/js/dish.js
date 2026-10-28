/* «Смак Полісся» — акварельні SVG-ілюстрації страв */
(function () {
  var n = 0;
  function rnd(seed) { var s = seed; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  var BLOB = { babka: '#f3c98b', deruny: '#f5d08a', yushka: '#cfe0b4', syrnyky: '#c9c3ea', uzvar: '#f0c3a0', pie: '#c8bfe6', kapusta: '#d6e8b8', borshch: '#cfe6b0', varenyky: '#f6d7a8', pancakes: '#f3cf96' };

  function blob(id, c, seed) {
    return '<filter id="' + id + 'w" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="' + seed + '"/><feDisplacementMap in="SourceGraphic" scale="46"/><feGaussianBlur stdDeviation="1.2"/></filter>' +
      '<filter id="' + id + 'p"><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="2" seed="' + seed + '"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .5 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>' +
      '<radialGradient id="' + id + 'pl" cx=".45" cy=".4"><stop offset="0" stop-color="#ffffff"/><stop offset=".75" stop-color="#f7f2ea"/><stop offset="1" stop-color="#e6ddd0"/></radialGradient>' +
      '<radialGradient id="' + id + 'gold" cx=".4" cy=".35"><stop offset="0" stop-color="#f7cf7a"/><stop offset=".6" stop-color="#e09a3e"/><stop offset="1" stop-color="#a95f22"/></radialGradient>';
  }
  function plate(id, cx, cy, r) {
    return '<ellipse cx="' + (cx + 8) + '" cy="' + (cy + 12) + '" rx="' + r + '" ry="' + r * .92 + '" fill="#6b4b3a" opacity=".16"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#' + id + 'pl)"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * .74) + '" fill="none" stroke="#e3d8c6" stroke-width="2"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r - 6) + '" fill="none" stroke="#b8322a" stroke-width="1.5" stroke-dasharray="3 5" opacity=".7"/>';
  }
  function napkin(x, y, w, h, rot) {
    var s = '<g transform="rotate(' + rot + ' ' + (x + w / 2) + ' ' + (y + h / 2) + ')"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#fbf7ef" stroke="#eadfcd"/>';
    for (var i = x + 8; i < x + w - 8; i += 12) {
      s += '<path d="M' + i + ' ' + (y + 10) + ' l6 6 -6 6 -6 -6z" fill="#b8322a"/><path d="M' + i + ' ' + (y + h - 22) + ' l6 6 -6 6 -6 -6z" fill="#b8322a"/>';
    }
    return s + '<path d="M' + x + ' ' + (y + 30) + ' h' + w + ' M' + x + ' ' + (y + h - 30) + ' h' + w + '" stroke="#2b2523" stroke-width="1.5" stroke-dasharray="2 3"/></g>';
  }
  function dill(x, y, rot, sc) {
    var s = '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + (sc || 1) + ')" stroke="#5b8a3a" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M0 0 C 4 -14 2 -28 6 -40"/>';
    for (var i = 0; i < 6; i++) { var yy = -6 - i * 6; s += '<path d="M' + (1 + i * .6) + ' ' + yy + ' l-9 -6 M' + (1 + i * .6) + ' ' + yy + ' l9 -7"/>'; }
    return s + '</g>';
  }
  function berries(r, cx, cy, spread, count, color) {
    var s = '';
    for (var i = 0; i < count; i++) {
      var a = r() * 6.28, d = r() * spread, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .8, rr = 5 + r() * 2.5;
      s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + rr.toFixed(1) + '" fill="' + (color || '#3b3a6e') + '"/><circle cx="' + (x - 1.6).toFixed(1) + '" cy="' + (y - 1.8).toFixed(1) + '" r="1.4" fill="#fff" opacity=".55"/>';
    }
    return s;
  }
  function steam(x, y) {
    var s = '<g class="steam" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85">';
    [-22, 0, 22].forEach(function (dx, i) { s += '<path style="--d:' + i * .6 + 's" d="M' + (x + dx) + ' ' + y + ' c -10 -14 10 -24 0 -40 c -8 -12 8 -22 0 -34"/>'; });
    return s + '</g>';
  }

  var draw = {
    babka: function (id, r) {
      var s = napkin(40, 190, 120, 90, -12) + plate(id, 220, 150, 110);
      [[160, 100, -8], [232, 92, 6], [196, 168, 3]].forEach(function (p) {
        s += '<g transform="rotate(' + p[2] + ' ' + (p[0] + 36) + ' ' + (p[1] + 30) + ')"><rect x="' + p[0] + '" y="' + p[1] + '" width="72" height="62" rx="10" fill="#a95f22"/><rect x="' + (p[0] + 5) + '" y="' + (p[1] + 5) + '" width="62" height="52" rx="8" fill="url(#' + id + 'gold)"/>';
        for (var k = 0; k < 7; k++) s += '<circle cx="' + (p[0] + 12 + r() * 48).toFixed(1) + '" cy="' + (p[1] + 12 + r() * 38).toFixed(1) + '" r="' + (1.5 + r() * 2.5).toFixed(1) + '" fill="#8c4a1a" opacity=".55"/>';
        s += '</g>';
      });
      s += '<path d="M270 186 c 18 -10 34 2 30 16 c 10 10 -6 26 -20 18 c -14 10 -30 -4 -22 -16 c -10 -8 0 -22 12 -18z" fill="#fffaf0" stroke="#efe6d5"/>';
      return s + dill(300, 220, 30) + dill(130, 80, -50, .8);
    },
    deruny: function (id, r) {
      var s = napkin(250, 30, 120, 90, 10) + plate(id, 190, 160, 112);
      [[150, 130], [215, 115], [240, 175], [175, 195], [195, 155]].forEach(function (p, i) {
        s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="46" fill="#a95f22"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="44" fill="url(#' + id + 'gold)" stroke="#c07a2c" stroke-width="5" stroke-dasharray="2 4 7 3"/>';
        for (var k = 0; k < 10; k++) { var a = r() * 6.28, d = r() * 34; s += '<path d="M' + (p[0] + Math.cos(a) * d).toFixed(1) + ' ' + (p[1] + Math.sin(a) * d).toFixed(1) + ' q 6 -3 10 2" stroke="#9a5418" stroke-width="2" fill="none" opacity=".6"/>'; }
      });
      s += '<circle cx="70" cy="215" r="44" fill="#6b4b3a" opacity=".14"/><circle cx="64" cy="208" r="42" fill="#fff" stroke="#e3d8c6" stroke-width="3"/><circle cx="64" cy="208" r="32" fill="#fffaf2"/><path d="M50 204 q 14 -12 28 0" stroke="#efe4d0" stroke-width="3" fill="none"/>';
      return s + dill(210, 160, 20, .9) + dill(100, 120, -30, .8);
    },
    yushka: function (id, r) {
      var s = napkin(30, 40, 110, 80, -14) + plate(id, 210, 160, 116);
      s += '<circle cx="210" cy="160" r="86" fill="#e9d6b2"/><circle cx="210" cy="160" r="78" fill="#d9a347"/><circle cx="200" cy="150" r="60" fill="#e8b85e" opacity=".7"/>';
      for (var k = 0; k < 9; k++) {
        var a = r() * 6.28, d = 20 + r() * 44, x = 210 + Math.cos(a) * d, y = 160 + Math.sin(a) * d, rot = r() * 360;
        s += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot.toFixed(0) + ')"><path d="M-12 0 a12 9 0 0 1 24 0z" fill="#7a4a26"/><rect x="-4" y="-1" width="8" height="12" rx="3" fill="#f3e3c6"/></g>';
      }
      for (var j = 0; j < 6; j++) s += '<path d="M' + (170 + r() * 70).toFixed(0) + ' ' + (120 + r() * 80).toFixed(0) + ' q 12 -8 24 0 t 24 0" stroke="#f5e7b5" stroke-width="3" fill="none" stroke-linecap="round"/>';
      s += berries(r, 210, 160, 60, 5, '#e47a2e');
      for (var g = 0; g < 18; g++) s += '<circle cx="' + (160 + r() * 100).toFixed(1) + '" cy="' + (115 + r() * 90).toFixed(1) + '" r="1.8" fill="#4f8a32"/>';
      return s + steam(210, 70);
    },
    syrnyky: function (id, r) {
      var s = napkin(260, 170, 120, 90, 8) + plate(id, 200, 150, 112);
      [[160, 120], [230, 110], [250, 175], [180, 190]].forEach(function (p) {
        s += '<ellipse cx="' + p[0] + '" cy="' + (p[1] + 4) + '" rx="40" ry="38" fill="#b46b2a"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="37" fill="url(#' + id + 'gold)"/><circle cx="' + (p[0] - 6) + '" cy="' + (p[1] - 6) + '" r="18" fill="#f8dfa4" opacity=".55"/>';
      });
      s += '<path d="M140 100 C 180 130 200 90 240 130 S 270 170 230 200" stroke="#f0b437" stroke-width="7" fill="none" stroke-linecap="round" opacity=".85"/>';
      s += berries(r, 205, 150, 26, 8) + berries(r, 90, 70, 26, 10);
      return s + '<g transform="translate(70 230) rotate(-30)"><path d="M0 0 q 14 -22 28 0 q -14 22 -28 0z" fill="#6aa046"/><path d="M0 0 h28" stroke="#4f7a3a"/></g>';
    },
    uzvar: function (id, r) {
      var s = '<ellipse cx="200" cy="262" rx="150" ry="18" fill="#6b4b3a" opacity=".14"/>';
      s += '<g><path d="M110 70 q -4 -18 18 -22 h44 q 22 4 18 22 q 34 30 30 90 q -4 78 -70 96 q -66 -18 -70 -96 q -4 -60 30 -90z" fill="#b45a2d"/><path d="M118 110 q 32 14 64 0" stroke="#f4d1a4" stroke-width="4" fill="none"/><path d="M114 130 h72" stroke="#2b2523" stroke-width="3" stroke-dasharray="6 4"/><path d="M190 74 q 40 6 34 50 q -4 22 -22 30" stroke="#a24f26" stroke-width="10" fill="none" stroke-linecap="round"/>';
      s += '<path d="M116 150 q 34 -10 68 0" stroke="#e8b06a" stroke-width="3" fill="none"/></g>';
      s += '<g transform="translate(250 120)"><path d="M0 0 h70 l-8 128 h-54z" fill="#fff" fill-opacity=".45" stroke="#e8d6c0" stroke-width="2"/><path d="M4 30 h62 l-6 96 h-50z" fill="#9b4a24" opacity=".85"/><circle cx="24" cy="80" r="9" fill="#6e2d18"/><circle cx="44" cy="100" r="7" fill="#c47a3a"/><path d="M14 40 h40" stroke="#fff" stroke-width="3" opacity=".5"/></g>';
      [[70, 230], [330, 268], [96, 262]].forEach(function (p, i) { s += '<g transform="translate(' + p[0] + ' ' + p[1] + ') rotate(' + (i * 40 - 20) + ')"><path d="M0 -14 c 12 0 14 14 10 22 c -4 8 -16 8 -20 0 c -4 -8 -2 -22 10 -22z" fill="#8a4b24"/><path d="M0 -14 l2 -8" stroke="#4a2a14" stroke-width="2"/></g>'; });
      return s + steam(150, 40);
    },
    pie: function (id, r) {
      var s = napkin(30, 180, 110, 90, -8) + plate(id, 210, 150, 116);
      s += '<circle cx="210" cy="150" r="90" fill="#d79a52"/><circle cx="210" cy="150" r="78" fill="#4a3170"/><circle cx="210" cy="150" r="70" fill="#5f3f8c" opacity=".6"/>';
      s += berries(r, 210, 150, 64, 34, '#2b2350');
      s += '<path d="M210 150 L300 150 A90 90 0 0 0 274 87z" fill="#f7f2ea"/><path d="M210 150 L288 112" stroke="#d79a52" stroke-width="3"/>';
      s += '<g transform="translate(300 60) rotate(18)"><path d="M0 0 L70 -8 A70 70 0 0 1 64 26z" fill="#d79a52"/><path d="M6 2 L64 -4 A62 62 0 0 1 58 20z" fill="#5f3f8c"/></g>';
      return s + berries(r, 80, 70, 24, 9) + '<g transform="translate(110 40) rotate(-20)"><path d="M0 0 q 14 -22 28 0 q -14 22 -28 0z" fill="#6aa046"/></g>';
    },
    kapusta: function (id, r) {
      var s = '<ellipse cx="200" cy="268" rx="140" ry="16" fill="#6b4b3a" opacity=".14"/>';
      s += '<g transform="translate(130 40)"><rect x="18" y="0" width="104" height="22" rx="6" fill="#c9a24a"/><path d="M8 30 q 0 -10 14 -10 h96 q 14 0 14 10 v170 q 0 26 -24 26 h-76 q -24 0 -24 -26z" fill="#fff" fill-opacity=".55" stroke="#dfe7d3" stroke-width="3"/>';
      s += '<path d="M14 60 h112 v136 q 0 22 -20 22 h-72 q -20 0 -20 -22z" fill="#e8efc6"/>';
      for (var k = 0; k < 40; k++) { var x = 20 + r() * 96, y = 66 + r() * 140; s += '<path d="M' + x.toFixed(0) + ' ' + y.toFixed(0) + ' q 8 -4 16 1" stroke="' + (r() > .7 ? '#f0a35a' : '#c9d79a') + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>'; }
      for (var c = 0; c < 12; c++) s += '<circle cx="' + (24 + r() * 92).toFixed(0) + '" cy="' + (70 + r() * 136).toFixed(0) + '" r="4.5" fill="#c0272d"/>';
      s += '<path d="M24 40 v150" stroke="#fff" stroke-width="6" opacity=".6" stroke-linecap="round"/><rect x="38" y="100" width="64" height="40" rx="4" fill="#fbf7ef" stroke="#b8322a"/><path d="M46 112 h48 M46 122 h36" stroke="#b8322a" stroke-width="2"/></g>';
      s += berries(r, 70, 240, 22, 10, '#c0272d') + '<g transform="translate(330 220)"><path d="M-30 0 q 30 -50 60 0 q -30 30 -60 0z" fill="#b9d58a"/><path d="M-26 0 h52 M0 -24 v40" stroke="#8fb05e" stroke-width="2"/></g>';
      return s;
    },
    borshch: function (id, r) {
      var s = napkin(270, 40, 110, 90, 12) + plate(id, 190, 160, 116);
      s += '<circle cx="190" cy="160" r="86" fill="#e5dcc4"/><circle cx="190" cy="160" r="78" fill="#a7b54a"/><circle cx="180" cy="150" r="56" fill="#c3c95f" opacity=".6"/>';
      for (var k = 0; k < 14; k++) s += '<path d="M' + (140 + r() * 100).toFixed(0) + ' ' + (110 + r() * 100).toFixed(0) + ' q 10 -6 20 0" stroke="#4f7a2a" stroke-width="4" fill="none" stroke-linecap="round"/>';
      [[165, 140], [215, 175]].forEach(function (p) { s += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="22" ry="17" fill="#fff"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="#f2b630"/>'; });
      s += '<path d="M220 120 c 14 -8 28 2 24 14 c 8 8 -4 20 -16 14 c -12 6 -22 -4 -16 -14 c -6 -6 2 -16 8 -14z" fill="#fffaf0"/>';
      return s + steam(190, 70) + dill(60, 240, -20, 1.1);
    },
    varenyky: function (id, r) {
      var s = napkin(20, 30, 110, 86, -10) + plate(id, 210, 160, 114);
      [[160, 120, -20], [220, 105, 15], [255, 160, 70], [200, 165, 0], [160, 190, -40], [230, 210, 30]].forEach(function (p) {
        s += '<g transform="translate(' + p[0] + ' ' + p[1] + ') rotate(' + p[2] + ')"><path d="M-34 6 A34 30 0 0 1 34 6 Z" fill="#f6ead2" stroke="#e6d3ae" stroke-width="2"/><path d="M-32 6 h64" stroke="#e2cfa6" stroke-width="5" stroke-dasharray="4 3"/><path d="M-18 -8 q 18 -10 36 0" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/></g>';
      });
      for (var k = 0; k < 26; k++) s += '<rect x="' + (150 + r() * 120).toFixed(0) + '" y="' + (100 + r() * 120).toFixed(0) + '" width="7" height="5" rx="2" fill="' + (r() > .5 ? '#b8692a' : '#e8a94a') + '" transform="rotate(' + (r() * 90).toFixed(0) + ')" transform-origin="center"/>';
      return s + dill(320, 230, 40) + '<circle cx="70" cy="230" r="34" fill="#fff" stroke="#e3d8c6" stroke-width="3"/><circle cx="70" cy="230" r="25" fill="#fffaf2"/>';
    },
    pancakes: function (id, r) {
      var s = napkin(260, 180, 120, 86, 6) + plate(id, 200, 150, 114);
      [[150, 140, 0], [200, 110, 50], [230, 170, 120], [170, 190, 200]].forEach(function (p) {
        s += '<g transform="translate(' + p[0] + ' ' + p[1] + ') rotate(' + p[2] + ')"><path d="M-44 30 L0 -40 L44 30 Q0 44 -44 30Z" fill="#b97a3c"/><path d="M-38 26 L0 -32 L38 26 Q0 38 -38 26Z" fill="#d9a35c"/>';
        for (var k = 0; k < 8; k++) s += '<circle cx="' + (-20 + r() * 40).toFixed(0) + '" cy="' + (-10 + r() * 30).toFixed(0) + '" r="' + (1.5 + r() * 2).toFixed(1) + '" fill="#9a6230" opacity=".6"/>';
        s += '</g>';
      });
      s += '<path d="M150 120 C 190 140 220 100 250 150 S 210 210 170 200" stroke="#f0b437" stroke-width="8" fill="none" stroke-linecap="round" opacity=".9"/><rect x="186" y="136" width="28" height="18" rx="4" fill="#fff3c4"/>';
      return s + '<g transform="translate(70 70)"><circle r="34" fill="#c98a1e"/><circle r="26" fill="#f0b437"/><path d="M-6 -40 v40" stroke="#8a5a2a" stroke-width="5" stroke-linecap="round"/></g>';
    }
  };

  window.dishSVG = function (type, opts) {
    opts = opts || {};
    var id = 'd' + (n++), seed = 0;
    for (var i = 0; i < type.length; i++) seed += type.charCodeAt(i) * (i + 1);
    var r = rnd(seed), fn = draw[type] || draw.deruny, c = BLOB[type] || '#f3d6a8';
    var s = '<svg class="dish-svg" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + (opts.label || 'Ілюстрація страви') + '"><defs>' + blob(id, c, seed % 97) + '</defs>';
    s += '<g filter="url(#' + id + 'w)"><ellipse cx="205" cy="152" rx="176" ry="128" fill="' + c + '" opacity=".75"/><ellipse cx="120" cy="90" rx="90" ry="60" fill="' + c + '" opacity=".6"/><ellipse cx="300" cy="220" rx="80" ry="50" fill="' + c + '" opacity=".5"/></g>';
    s += '<g filter="url(#' + id + 'w)" opacity=".35"><circle cx="40" cy="40" r="18" fill="' + c + '"/><circle cx="370" cy="60" r="12" fill="' + c + '"/><circle cx="360" cy="270" r="16" fill="' + c + '"/></g>';
    s += fn(id, r) + '</svg>';
    return s;
  };
})();
