/* «Кидай кубик» — генератори SVG: обкладинки ігор, ізометричні кубики, мипли */
(function () {
  var Y = '#ffc93c', CO = '#ff6b5b', W = '#fffaf0', IN = '#1b1740';
  var uid = 0;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* мипл — класична фігурка */
  function meeple(x, y, s, c, rot) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (rot || 0) + ') scale(' + s + ')"><path d="M0 -26 a9 9 0 1 1 0.1 0 Z M-9 -20 C-16 -18 -24 -14 -26 -8 C-27 -3 -22 -1 -16 -2 L-12 -3 L-18 22 L-6 22 L0 10 L6 22 L18 22 L12 -3 L16 -2 C22 -1 27 -3 26 -8 C24 -14 16 -18 9 -20 Z" fill="' + c + '"/></g>';
  }
  window.meepleSVG = meeple;

  /* ізометричний кубик: face — кількість очок на верхній грані */
  function isoDie(x, y, s, top, left, right, pip, faces) {
    faces = faces || [5, 3, 1];
    var h = s * .5, g = '<g transform="translate(' + x + ' ' + y + ')">';
    g += '<path d="M0 ' + (-h) + ' L' + s * .866 + ' 0 L0 ' + h + ' L' + (-s * .866) + ' 0Z" fill="' + top + '"/>';
    g += '<path d="M' + (-s * .866) + ' 0 L0 ' + h + ' L0 ' + (h + s) + ' L' + (-s * .866) + ' ' + s + 'Z" fill="' + left + '"/>';
    g += '<path d="M' + s * .866 + ' 0 L0 ' + h + ' L0 ' + (h + s) + ' L' + s * .866 + ' ' + s + 'Z" fill="' + right + '"/>';
    /* очки: точки в локальних координатах грані (u,v від -1 до 1) */
    var P = { 1: [[0, 0]], 2: [[-.5, -.5], [.5, .5]], 3: [[-.5, -.5], [0, 0], [.5, .5]], 4: [[-.5, -.5], [.5, -.5], [-.5, .5], [.5, .5]], 5: [[-.5, -.5], [.5, -.5], [0, 0], [-.5, .5], [.5, .5]], 6: [[-.5, -.55], [.5, -.55], [-.5, 0], [.5, 0], [-.5, .55], [.5, .55]] };
    var r = s * .085;
    P[faces[0]].forEach(function (p) { var px = (p[0] - p[1]) * s * .433, py = (p[0] + p[1]) * s * .25; g += '<ellipse cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" rx="' + (r * 1.2).toFixed(1) + '" ry="' + (r * .7).toFixed(1) + '" fill="' + pip + '"/>'; });
    P[faces[1]].forEach(function (p) { var px = -s * .433 + p[0] * s * .38, py = h * .5 + s * .5 + p[1] * s * .38 + p[0] * s * .22; g += '<ellipse cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" rx="' + (r * .75).toFixed(1) + '" ry="' + r.toFixed(1) + '" fill="' + pip + '" transform="rotate(-30 ' + px.toFixed(1) + ' ' + py.toFixed(1) + ')" opacity=".9"/>'; });
    P[faces[2]].forEach(function (p) { var px = s * .433 + p[0] * s * .38, py = h * .5 + s * .5 + p[1] * s * .38 - p[0] * s * .22; g += '<ellipse cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" rx="' + (r * .75).toFixed(1) + '" ry="' + r.toFixed(1) + '" fill="' + pip + '" transform="rotate(30 ' + px.toFixed(1) + ' ' + py.toFixed(1) + ')" opacity=".9"/>'; });
    return g + '</g>';
  }
  window.isoDie = isoDie;

  /* картка гральна */
  function card(x, y, w, h, rot, fill, inner) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')"><rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="' + w * .1 + '" fill="' + fill + '" stroke="' + W + '" stroke-width="3"/>' + (inner || '') + '</g>';
  }

  /* ---------- мотиви обкладинок (центр ~150,120) ---------- */
  var M = {
    tiles: function (g) {
      var s = '';
      for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) s += '<rect x="' + (78 + i * 48) + '" y="' + (48 + j * 48) + '" width="46" height="46" rx="4" fill="#7fb35a" stroke="' + g.c2 + '" stroke-width="2"/>';
      s += '<path d="M78 120 H222 M150 48 V96" stroke="#f2e2b8" stroke-width="10"/><path d="M174 48 h48 v48 Q190 90 174 48Z" fill="#c9875a"/><path d="M182 54 l6 -10 6 10 6 -10 6 10" stroke="#8a4b2a" stroke-width="3" fill="none"/>';
      return s + meeple(120, 128, .7, Y) + meeple(196, 82, .55, CO);
    },
    hex: function (g) {
      var cols = ['#f2c14e', '#6aa84f', '#c0703b', '#9fb7c9', '#b8d77a', '#7f8c8d', '#f2c14e'], pos = [[150, 112], [150, 66], [190, 89], [190, 135], [150, 158], [110, 135], [110, 89]], s = '';
      pos.forEach(function (p, i) { var pts = []; for (var k = 0; k < 6; k++) { var a = Math.PI / 3 * k + Math.PI / 6; pts.push((p[0] + 26 * Math.cos(a)).toFixed(1) + ',' + (p[1] + 26 * Math.sin(a)).toFixed(1)); } s += '<polygon points="' + pts.join(' ') + '" fill="' + cols[i] + '" stroke="' + g.c2 + '" stroke-width="3"/>'; });
      return s + '<circle cx="150" cy="112" r="11" fill="' + W + '"/><text x="150" y="117" font-family="Rubik" font-weight="700" font-size="13" text-anchor="middle" fill="' + g.c2 + '">8</text>';
    },
    moon: function (g) {
      return '<circle cx="150" cy="105" r="52" fill="' + Y + '"/><circle cx="172" cy="92" r="46" fill="' + g.c1 + '"/><path d="M96 170 Q150 120 204 170" fill="none" stroke="' + W + '" stroke-width="3" stroke-dasharray="4 7"/><rect x="132" y="128" width="22" height="40" rx="11" fill="' + CO + '"/><circle cx="150" cy="150" r="2.5" fill="' + W + '"/>' + [[90, 60], [214, 140], [200, 50], [104, 130], [226, 84]].map(function (p) { return '<path d="M' + p[0] + ' ' + (p[1] - 7) + ' L' + (p[0] + 2) + ' ' + (p[1] - 2) + ' L' + (p[0] + 7) + ' ' + p[1] + ' L' + (p[0] + 2) + ' ' + (p[1] + 2) + ' L' + p[0] + ' ' + (p[1] + 7) + ' L' + (p[0] - 2) + ' ' + (p[1] + 2) + ' L' + (p[0] - 7) + ' ' + p[1] + ' L' + (p[0] - 2) + ' ' + (p[1] - 2) + 'Z" fill="' + W + '"/>'; }).join('');
    },
    grid: function (g) {
      var s = '', cl = ['#d64545', '#2f5fb3', '#f2e7cf', '#d64545', '#2f5fb3', '#f2e7cf', '#2f5fb3', '#1b1740', '#d64545', '#f2e7cf', '#2f5fb3', '#d64545', '#f2e7cf', '#d64545', '#2f5fb3', '#f2e7cf'];
      for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) s += '<rect x="' + (86 + i * 33) + '" y="' + (50 + j * 33) + '" width="29" height="29" rx="4" fill="' + cl[i * 4 + j] + '" stroke="' + W + '" stroke-width="1.5"/>';
      return s + '<g transform="translate(150 112)"><circle r="26" fill="' + IN + '" stroke="' + Y + '" stroke-width="3"/><path d="M-14 -2 h28 M-10 -6 h20 l-3 -10 h-14z" fill="' + IN + '" stroke="' + Y + '" stroke-width="2.5"/><circle cx="-7" cy="7" r="5" fill="none" stroke="' + Y + '" stroke-width="2.5"/><circle cx="7" cy="7" r="5" fill="none" stroke="' + Y + '" stroke-width="2.5"/></g>';
    },
    virus: function (g) {
      var s = '<ellipse cx="150" cy="112" rx="90" ry="58" fill="none" stroke="' + W + '" stroke-opacity=".25" stroke-width="2"/><path d="M80 90 L130 70 L180 98 L222 80 M130 70 L150 140 L200 150 M100 140 L150 140" stroke="' + W + '" stroke-width="2" fill="none" stroke-dasharray="5 4"/>';
      [[80, 90, CO], [130, 70, Y], [180, 98, '#5fd3a5'], [222, 80, CO], [150, 140, '#ffffff'], [200, 150, Y], [100, 140, '#5fd3a5']].forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="' + p[2] + '" stroke="' + g.c2 + '" stroke-width="2"/>'; });
      var v = '<g transform="translate(150 106)"><circle r="20" fill="' + CO + '"/>'; for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4; v += '<line x1="' + (Math.cos(a) * 20).toFixed(1) + '" y1="' + (Math.sin(a) * 20).toFixed(1) + '" x2="' + (Math.cos(a) * 29).toFixed(1) + '" y2="' + (Math.sin(a) * 29).toFixed(1) + '" stroke="' + CO + '" stroke-width="4"/><circle cx="' + (Math.cos(a) * 31).toFixed(1) + '" cy="' + (Math.sin(a) * 31).toFixed(1) + '" r="4" fill="' + CO + '"/>'; }
      return s + v + '<circle cx="-6" cy="-5" r="5" fill="' + g.c2 + '" opacity=".4"/></g>';
    },
    rail: function (g) {
      var s = '<path d="M60 170 C110 150 110 80 160 80 S230 60 246 40" fill="none" stroke="' + W + '" stroke-width="16" stroke-linecap="round" opacity=".25"/>';
      s += '<path d="M60 170 C110 150 110 80 160 80 S230 60 246 40" fill="none" stroke="' + Y + '" stroke-width="10" stroke-dasharray="16 6"/>';
      s += '<g transform="translate(150 132)"><rect x="-40" y="-26" width="58" height="34" rx="6" fill="' + IN + '"/><rect x="14" y="-40" width="26" height="48" rx="5" fill="' + IN + '"/><rect x="18" y="-34" width="18" height="14" rx="3" fill="' + Y + '"/><rect x="-34" y="-50" width="12" height="26" fill="' + IN + '"/><circle cx="-26" cy="12" r="9" fill="' + CO + '"/><circle cx="0" cy="12" r="9" fill="' + CO + '"/><circle cx="28" cy="12" r="9" fill="' + CO + '"/><circle cx="-28" cy="-62" r="8" fill="' + W + '" opacity=".7"/><circle cx="-18" cy="-76" r="11" fill="' + W + '" opacity=".5"/></g>';
      return s + '<circle cx="60" cy="170" r="8" fill="' + W + '"/><circle cx="246" cy="40" r="8" fill="' + W + '"/>';
    },
    mosaic: function (g) {
      var s = '', cl = ['#4fb0e8', Y, CO, '#1b1740', W];
      for (var i = 0; i < 5; i++) for (var j = 0; j < 5; j++) s += '<rect x="' + (84 + i * 27) + '" y="' + (46 + j * 27) + '" width="24" height="24" rx="4" fill="' + cl[(i + j * 3) % 5] + '" opacity="' + ((i + j) % 3 === 0 ? 1 : .88) + '"/>';
      return s + '<rect x="84" y="46" width="132" height="132" rx="6" fill="none" stroke="' + W + '" stroke-width="3"/>';
    },
    gem: function (g) {
      function gm(x, y, s, c) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-24 -10 L-12 -24 H12 L24 -10 L0 24Z" fill="' + c + '"/><path d="M-24 -10 H24 M-12 -24 L-6 -10 L0 24 L6 -10 L12 -24" stroke="#fff" stroke-opacity=".55" stroke-width="2" fill="none"/></g>'; }
      return gm(150, 100, 1.9, '#5fd3c3') + gm(96, 140, 1, CO) + gm(204, 140, 1, Y) + gm(110, 60, .7, '#ffffff') + gm(196, 58, .8, '#7b5cd6');
    },
    temple: function (g) {
      var s = '<path d="M80 80 L150 40 L220 80Z" fill="' + W + '"/><rect x="80" y="82" width="140" height="10" fill="' + W + '"/>';
      for (var i = 0; i < 5; i++) s += '<rect x="' + (88 + i * 28) + '" y="96" width="14" height="62" fill="' + W + '" opacity=".92"/>';
      return s + '<rect x="72" y="160" width="156" height="12" fill="' + W + '"/><rect x="62" y="174" width="176" height="8" fill="' + Y + '"/><circle cx="150" cy="66" r="7" fill="' + Y + '"/>';
    },
    planet: function (g) {
      return '<circle cx="150" cy="112" r="62" fill="#e07a4b"/><path d="M110 70 Q140 90 120 120 T150 170" stroke="#b5502b" stroke-width="9" fill="none" opacity=".7"/><circle cx="178" cy="92" r="12" fill="#b5502b" opacity=".6"/><circle cx="168" cy="140" r="16" fill="#4fb0e8"/><path d="M156 140 q12 -10 24 0" stroke="#fff" stroke-width="2" fill="none"/><ellipse cx="150" cy="112" rx="96" ry="18" fill="none" stroke="' + Y + '" stroke-width="3" transform="rotate(-18 150 112)"/><circle cx="230" cy="60" r="6" fill="' + W + '"/>';
    },
    sword: function (g) {
      return '<g transform="rotate(35 150 110)"><rect x="143" y="30" width="14" height="110" fill="#e5e7ef"/><path d="M143 30 L150 16 L157 30Z" fill="#e5e7ef"/><rect x="118" y="138" width="64" height="12" rx="6" fill="' + CO + '"/><rect x="144" y="150" width="12" height="30" fill="#7a3b1a"/><circle cx="150" cy="186" r="9" fill="' + Y + '"/></g><path d="M96 92 q54 -50 108 0 v12 h-108z" fill="' + IN + '"/><path d="M104 92 l-12 -26 22 12 M196 92 l12 -26 -22 12" fill="' + W + '"/><circle cx="150" cy="70" r="7" fill="' + CO + '"/>';
    },
    crown: function (g) {
      return '<rect x="74" y="120" width="152" height="54" rx="6" fill="#6aa84f" stroke="' + W + '" stroke-width="3"/><rect x="150" y="120" width="76" height="54" fill="#4fb0e8" stroke="' + W + '" stroke-width="3"/><path d="M106 104 L94 56 L122 78 L150 44 L178 78 L206 56 L194 104Z" fill="' + Y + '" stroke="' + g.c2 + '" stroke-width="3"/><circle cx="150" cy="44" r="6" fill="' + CO + '"/><circle cx="94" cy="56" r="5" fill="' + CO + '"/><circle cx="206" cy="56" r="5" fill="' + CO + '"/><path d="M98 160 l10 -18 10 18z M118 160 l8 -14 8 14z" fill="#2e6b2a"/><path d="M164 150 q12 -8 24 0 t24 0" stroke="#fff" stroke-width="3" fill="none"/>';
    },
    quilt: function (g) {
      var s = '', cl = [CO, Y, '#5fd3c3', W, '#7b5cd6', g.c1];
      [[84, 48, 66, 40], [150, 48, 66, 66], [84, 88, 40, 90], [124, 88, 26, 50], [150, 114, 66, 30], [124, 138, 92, 40]].forEach(function (r, i) { s += '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" fill="' + cl[i] + '" stroke="' + g.c2 + '" stroke-width="2" stroke-dasharray="4 3"/>'; });
      return s + '<g transform="translate(220 160)"><circle r="16" fill="' + Y + '" stroke="' + g.c2 + '" stroke-width="2"/><circle cx="-5" cy="-5" r="2.5" fill="' + g.c2 + '"/><circle cx="5" cy="-5" r="2.5" fill="' + g.c2 + '"/><circle cx="-5" cy="5" r="2.5" fill="' + g.c2 + '"/><circle cx="5" cy="5" r="2.5" fill="' + g.c2 + '"/></g>';
    },
    camel: function (g) {
      return '<circle cx="190" cy="66" r="24" fill="' + Y + '"/><path d="M50 172 Q150 150 250 172 V190 H50Z" fill="#f0b46a" opacity=".6"/><path d="M84 150 v24 M98 150 v24 M150 150 v24 M164 150 v24" stroke="' + IN + '" stroke-width="7" stroke-linecap="round"/><path d="M78 154 C70 120 96 96 112 120 C124 92 150 96 160 124 C168 108 184 96 196 104 L206 92 L214 100 L200 128 L170 140 L168 156 L78 156Z" fill="' + IN + '"/><circle cx="206" cy="98" r="2" fill="' + Y + '"/><path d="M110 112 h40 l-6 10 h-28z" fill="' + CO + '"/>';
    },
    bird: function (g) {
      return '<path d="M70 150 Q150 120 230 150" stroke="#6b4a2a" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M200 140 q10 -20 26 -14" stroke="#6aa84f" stroke-width="5" fill="none"/><g transform="translate(150 106)"><ellipse rx="40" ry="30" fill="#4fb0e8"/><circle cx="30" cy="-24" r="20" fill="#4fb0e8"/><path d="M48 -26 l18 6 -18 6z" fill="' + Y + '"/><circle cx="36" cy="-28" r="4" fill="' + IN + '"/><path d="M-10 -8 q-30 -40 -60 -10 q30 0 40 30z" fill="#2f78c4"/><ellipse cx="6" cy="10" rx="22" ry="14" fill="' + CO + '"/><path d="M-36 6 l-30 14 34 -2z" fill="#2f78c4"/><path d="M0 28 v14 M14 28 v14" stroke="' + Y + '" stroke-width="3"/></g><ellipse cx="96" cy="170" rx="9" ry="12" fill="' + W + '"/><ellipse cx="114" cy="172" rx="8" ry="11" fill="#bfe3f0"/>';
    },
    tree: function (g) {
      return '<path d="M138 182 C140 150 132 128 120 110 L134 112 C142 126 148 136 150 146 C152 132 158 120 168 110 L180 112 C168 128 162 150 164 182Z" fill="#7a4a24"/><circle cx="150" cy="80" r="46" fill="#7fb35a"/><circle cx="110" cy="98" r="30" fill="#6aa84f"/><circle cx="192" cy="98" r="30" fill="#6aa84f"/><circle cx="150" cy="56" r="26" fill="#9fcb6b"/><rect x="140" y="150" width="20" height="24" rx="10" fill="' + Y + '"/><circle cx="124" cy="82" r="5" fill="' + CO + '"/><circle cx="178" cy="70" r="5" fill="' + CO + '"/><circle cx="160" cy="104" r="5" fill="' + CO + '"/>';
    },
    forest: function (g) {
      var s = '<circle cx="200" cy="62" r="18" fill="' + Y + '"/><path d="M50 180 L110 90 L160 150 L200 110 L250 180Z" fill="#9fb7c9" opacity=".6"/>';
      [[90, 180, 60], [120, 180, 80], [215, 180, 70], [240, 180, 50]].forEach(function (t) { s += '<path d="M' + t[0] + ' ' + (t[1] - t[2]) + ' L' + (t[0] + t[2] * .28) + ' ' + t[1] + ' H' + (t[0] - t[2] * .28) + 'Z" fill="#1d5a45"/>'; });
      return s + '<g transform="translate(166 160)"><ellipse rx="22" ry="14" fill="#6b4226"/><circle cx="18" cy="-10" r="10" fill="#6b4226"/><circle cx="14" cy="-18" r="4" fill="#6b4226"/><circle cx="22" cy="-11" r="1.8" fill="' + W + '"/></g><path d="M70 150 q14 -10 26 0 q-12 10 -26 0z" fill="' + CO + '"/>';
    },
    heart: function (g) {
      return card(124, 112, 70, 100, -12, W, '<path d="M0 22 C-26 4 -22 -18 -8 -18 C-2 -18 0 -12 0 -10 C0 -12 2 -18 8 -18 C22 -18 26 4 0 22Z" fill="' + CO + '"/>') + card(176, 108, 70, 100, 10, Y, '<rect x="-20" y="-14" width="40" height="28" rx="3" fill="' + W + '"/><path d="M-20 -14 L0 2 L20 -14" stroke="' + g.c1 + '" stroke-width="3" fill="none"/><circle cy="2" r="6" fill="' + g.c1 + '"/>');
    },
    monster: function (g) {
      return '<path d="M60 182 V150 h18 v-30 h16 v62 M206 182 V128 h22 v54" fill="' + W + '" opacity=".3"/><g transform="translate(150 118)"><path d="M-44 60 C-50 0 -40 -48 0 -50 C40 -48 50 0 44 60Z" fill="#6aa84f"/><path d="M-30 -42 l-10 -22 18 12 M30 -42 l10 -22 -18 12" fill="' + Y + '"/><circle cx="-14" cy="-20" r="11" fill="' + W + '"/><circle cx="14" cy="-20" r="11" fill="' + W + '"/><circle cx="-12" cy="-18" r="5" fill="' + IN + '"/><circle cx="16" cy="-18" r="5" fill="' + IN + '"/><path d="M-20 6 Q0 22 20 6 Z" fill="' + IN + '"/><path d="M-14 8 l4 6 4 -5 4 5 4 -6" fill="' + W + '"/><path d="M-44 20 l-24 -14 M44 20 l24 -16" stroke="#6aa84f" stroke-width="12" stroke-linecap="round"/></g>' + isoDie(230, 150, 16, W, '#ddd', '#bbb', IN, [6, 2, 4]);
    },
    firework: function (g) {
      var s = '';
      [[110, 80, CO, 34], [190, 70, Y, 40], [150, 130, '#5fd3c3', 30]].forEach(function (f) { for (var k = 0; k < 12; k++) { var a = k * Math.PI / 6; s += '<line x1="' + (f[0] + Math.cos(a) * 8).toFixed(1) + '" y1="' + (f[1] + Math.sin(a) * 8).toFixed(1) + '" x2="' + (f[0] + Math.cos(a) * f[3]).toFixed(1) + '" y2="' + (f[1] + Math.sin(a) * f[3]).toFixed(1) + '" stroke="' + f[2] + '" stroke-width="3" stroke-linecap="round"/><circle cx="' + (f[0] + Math.cos(a) * (f[3] + 6)).toFixed(1) + '" cy="' + (f[1] + Math.sin(a) * (f[3] + 6)).toFixed(1) + '" r="2.4" fill="' + f[2] + '"/>'; } });
      return s + '<path d="M150 182 Q146 160 150 136" stroke="' + W + '" stroke-width="2" stroke-dasharray="3 4" fill="none"/>';
    },
    fox: function (g) {
      return '<g transform="translate(150 110)"><path d="M-50 -40 L-20 -10 L20 -10 L50 -40 L46 10 L0 50 L-46 10Z" fill="#e8742a"/><path d="M-36 4 L0 50 L36 4 L0 22Z" fill="' + W + '"/><path d="M-50 -40 L-30 -20 L-40 -6Z M50 -40 L30 -20 L40 -6Z" fill="' + IN + '"/><circle cx="-18" cy="0" r="5" fill="' + IN + '"/><circle cx="18" cy="0" r="5" fill="' + IN + '"/><circle cy="44" r="6" fill="' + IN + '"/></g><path d="M70 182 L90 140 L110 182Z M196 182 L216 136 L236 182Z" fill="#1d5a45"/>';
    },
    bulb: function (g) {
      var s = '<g transform="translate(150 100)"><circle r="58" fill="' + Y + '" opacity=".25"/><path d="M-30 -6 C-30 -40 30 -40 30 -6 C30 12 16 18 14 36 H-14 C-16 18 -30 12 -30 -6Z" fill="' + Y + '"/><rect x="-14" y="38" width="28" height="8" rx="3" fill="' + W + '"/><rect x="-11" y="48" width="22" height="7" rx="3" fill="' + W + '"/><path d="M-8 30 L-4 0 L4 8 L8 30" stroke="' + g.c2 + '" stroke-width="2.5" fill="none"/></g>';
      [[96, 160, 'кіт'], [204, 160, 'ліс'], [86, 60, 'ніч'], [214, 60, 'чай']].forEach(function (c, i) { s += card(c[0], c[1], 54, 30, i % 2 ? 6 : -6, W, '<text y="5" text-anchor="middle" font-family="Montserrat" font-weight="700" font-size="13" fill="' + g.c2 + '">' + c[2] + '</text>'); });
      return s;
    },
    ghost: function (g) {
      return '<circle cx="210" cy="56" r="16" fill="' + W + '" opacity=".85"/><g transform="translate(140 110)"><path d="M-36 50 V-6 C-36 -50 36 -50 36 -6 V50 L24 40 L12 50 L0 40 L-12 50 L-24 40Z" fill="' + W + '" opacity=".92"/><ellipse cx="-12" cy="-6" rx="6" ry="9" fill="' + IN + '"/><ellipse cx="12" cy="-6" rx="6" ry="9" fill="' + IN + '"/><ellipse cy="18" rx="7" ry="9" fill="' + IN + '"/></g>' + card(214, 140, 44, 60, 12, '#7b5cd6', '<circle r="10" fill="' + Y + '"/>') + '<path d="M70 180 h50 M180 180 h50" stroke="' + W + '" stroke-opacity=".3" stroke-width="3"/>';
    },
    dome: function (g) {
      return '<rect x="70" y="150" width="160" height="30" rx="4" fill="' + W + '"/><rect x="92" y="114" width="116" height="36" rx="4" fill="' + W + '" opacity=".95"/><rect x="112" y="84" width="76" height="30" rx="4" fill="' + W + '" opacity=".9"/><path d="M118 84 A32 32 0 0 1 182 84Z" fill="#2f78c4" stroke="' + W + '" stroke-width="3"/><rect x="104" y="124" width="12" height="16" rx="6" fill="#2f78c4"/><rect x="184" y="124" width="12" height="16" rx="6" fill="#2f78c4"/>' + meeple(90, 136, .5, Y) + meeple(216, 132, .5, CO);
    }
  };

  /* ---------- обкладинка гри ---------- */
  window.coverSVG = function (g, big) {
    uid++; var id = 'cv' + uid, name = g.name, fs = name.length > 16 ? 19 : name.length > 11 ? 23 : 28;
    var s = '<svg class="cover" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Обкладинка гри «' + esc(name) + '»">';
    s += '<defs><linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + g.c1 + '"/><stop offset="1" stop-color="' + g.c2 + '"/></linearGradient>';
    s += '<pattern id="' + id + 'p" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="1.4" fill="#fff" opacity=".14"/></pattern></defs>';
    s += '<rect width="300" height="300" fill="url(#' + id + 'g)"/><rect width="300" height="300" fill="url(#' + id + 'p)"/>';
    s += '<circle cx="150" cy="112" r="96" fill="#fff" opacity=".06"/>';
    s += (M[g.motif] || M.tiles)(g);
    s += '<path d="M0 214 H300 V300 H0Z" fill="' + IN + '" opacity=".9"/><path d="M0 214 H300" stroke="' + Y + '" stroke-width="4"/>';
    s += '<text x="150" y="' + (252 + (fs < 23 ? 0 : 2)) + '" text-anchor="middle" font-family="Rubik, sans-serif" font-weight="700" font-size="' + fs + '" fill="#fff">' + esc(name) + '</text>';
    s += '<text x="150" y="280" text-anchor="middle" font-family="Montserrat, sans-serif" font-weight="700" font-size="11" letter-spacing="2" fill="' + Y + '">' + g.min + (g.max > g.min ? '–' + g.max : '') + ' ГРАВЦІ · ' + g.time + ' ХВ</text>';
    return s + '</svg>';
  };

  /* ---------- ілюстрації для галереї клубу ---------- */
  window.sceneSVG = function (k) {
    uid++; var id = 'sc' + uid;
    var bg = { table: ['#2a2466', '#151133'], party: ['#ff6b5b', '#a8322a'], tourney: ['#1f6fb2', '#0d2f5a'], cozy: ['#3d2a5c', '#1b1236'], kids: ['#ffc93c', '#e08a12'], night: ['#0f2a3d', '#071521'], win: ['#7b5cd6', '#2e1f73'], snacks: ['#2f7d4f', '#123b24'] }[k] || ['#2a2466', '#151133'];
    var s = '<svg class="scene" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ігровий вечір"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + bg[0] + '"/><stop offset="1" stop-color="' + bg[1] + '"/></linearGradient></defs><rect width="400" height="300" fill="url(#' + id + ')"/>';
    /* стіл */
    s += '<path d="M20 300 L70 150 H330 L380 300Z" fill="#6b4226"/><path d="M40 300 L82 165 H318 L360 300Z" fill="#2f7d4f"/>';
    if (k === 'table' || k === 'cozy') {
      s += '<rect x="150" y="190" width="100" height="70" rx="4" fill="#f2e7cf" transform="skewX(-8)"/>';
      for (var i = 0; i < 6; i++) s += '<rect x="' + (120 + i * 26) + '" y="' + (205 + (i % 2) * 18) + '" width="20" height="20" fill="' + ['#7fb35a', '#c9875a', '#4fb0e8'][i % 3] + '"/>';
      s += meeple(120, 260, .7, Y) + meeple(280, 255, .7, CO) + meeple(200, 186, .55, '#5fd3c3');
    }
    if (k === 'party' || k === 'night') {
      for (var c = 0; c < 6; c++) s += card(110 + c * 36, 215 + (c % 2) * 10, 40, 56, -15 + c * 6, c % 2 ? W : Y, '<circle r="8" fill="' + (c % 2 ? CO : IN) + '"/>');
    }
    if (k === 'tourney' || k === 'win') {
      s += '<g transform="translate(200 200)"><path d="M-30 -60 h60 v20 c0 30 -20 44 -30 44 c-10 0 -30 -14 -30 -44z" fill="' + Y + '"/><path d="M-30 -50 c-24 0 -24 30 0 30 M30 -50 c24 0 24 30 0 30" stroke="' + Y + '" stroke-width="6" fill="none"/><rect x="-8" y="4" width="16" height="22" fill="' + Y + '"/><rect x="-26" y="26" width="52" height="12" rx="3" fill="' + W + '"/><text y="-30" text-anchor="middle" font-family="Rubik" font-weight="700" font-size="20" fill="' + bg[1] + '">1</text></g>';
      for (var cf = 0; cf < 22; cf++) s += '<rect x="' + (30 + (cf * 53) % 340) + '" y="' + (20 + (cf * 37) % 120) + '" width="6" height="10" fill="' + [Y, CO, W, '#5fd3c3'][cf % 4] + '" transform="rotate(' + (cf * 31 % 90) + ' ' + (30 + (cf * 53) % 340) + ' ' + (20 + (cf * 37) % 120) + ')"/>';
    }
    if (k === 'kids' || k === 'snacks') {
      s += isoDie(150, 200, 26, W, '#e6e1f5', '#c9c2e8', IN, [6, 3, 2]) + isoDie(240, 214, 22, CO, '#d9503f', '#b33c2e', W, [4, 1, 5]);
      s += '<ellipse cx="300" cy="250" rx="34" ry="12" fill="' + W + '"/><g fill="' + Y + '"><circle cx="290" cy="244" r="6"/><circle cx="304" cy="242" r="6"/><circle cx="314" cy="248" r="6"/><circle cx="296" cy="252" r="5"/></g>';
      s += '<rect x="80" y="214" width="22" height="34" rx="4" fill="' + CO + '"/><rect x="80" y="214" width="22" height="8" fill="' + W + '" opacity=".6"/>';
    }
    /* лампа і силуети гравців */
    s += '<path d="M200 0 V40" stroke="#000" stroke-opacity=".4" stroke-width="2"/><path d="M176 40 h48 l-8 -14 h-32z" fill="' + Y + '"/><path d="M176 40 L110 170 H290 L224 40Z" fill="' + Y + '" opacity=".1"/>';
    s += '<g fill="#000" opacity=".35"><circle cx="40" cy="160" r="20"/><path d="M10 230 c0 -40 60 -40 60 0z"/><circle cx="360" cy="156" r="20"/><path d="M330 226 c0 -40 60 -40 60 0z"/></g>';
    return s + '</svg>';
  };
})();
