/* ==========================================================
   «Ліхтар» — генератор SVG-постерів фільмів.
   Постер будується з полів фільму (назва, рік, режисер, стиль, палітра),
   тож новий фільм, доданий в адмінці, одразу отримує власну афішу.
   © 2026 Максим Вознюк
   ========================================================== */
(function () {
  "use strict";
  var PAL = {
    wine: ["#2B0E14", "#7A1E2C", "#E9C46A", "#F6E7C8"],
    night: ["#0F1C2E", "#1F3B57", "#F2D8A7", "#F6E7C8"],
    sea: ["#14213D", "#2C4A6E", "#FFD27A", "#FFF3DC"],
    paper: ["#F2E3C6", "#E8CFA2", "#B3202E", "#2A1A12"],
    frost: ["#1B2A41", "#324A5F", "#CCD6E0", "#FFFFFF"],
    ember: ["#3A0A0A", "#8C1C13", "#F4A259", "#FFE8C2"],
    noir: ["#0B0B12", "#22223B", "#E63946", "#F1FAEE"],
    royal: ["#2D1E2F", "#5C3A4A", "#D4A84B", "#F5E6C8"],
    mint: ["#BFE3E0", "#8FCBC7", "#F25C54", "#20323A"],
    summer: ["#F6BD60", "#F28482", "#84A59D", "#2B2D42"],
    bass: ["#E9E2D0", "#DCD3BC", "#C1121F", "#111111"],
    gold: ["#1A1A1A", "#333333", "#D4A84B", "#F5E6C8"]
  };
  var PAL_NAMES = { wine: "Вино", night: "Нічна ріка", sea: "Море", paper: "Папір", frost: "Мороз", ember: "Жар", noir: "Нуар", royal: "Королівський", mint: "М'ята", summer: "Літо", bass: "Плакат 60-х", gold: "Золото" };
  var STYLES = { rails: "Колія", moon: "Місяць над рікою", beam: "Маяк", wheel: "Колесо", snow: "Сніг і клавіші", sun: "Сонце", city: "Нічне місто", castle: "Замок", planes: "Паперові літаки", stripes: "Смуги заходу", eye: "Око", reel: "Кіноплівка" };

  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100003; return h; }
  function rnd(seed) { var x = seed % 2147483647; if (x <= 0) x += 2147483646; return function () { x = x * 16807 % 2147483647; return (x - 1) / 2147483646; }; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function wrap(t, max) {
    var words = String(t).split(" "), lines = [], cur = "";
    words.forEach(function (w) { if ((cur + " " + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim(); });
    if (cur) lines.push(cur);
    return lines;
  }

  function motif(st, p, r, u) {
    var a = p[2], b = p[1], c = p[3], s = "", i, x, y;
    switch (st) {
      case "rails":
        s += '<circle cx="200" cy="250" r="70" fill="' + a + '"/>';
        s += '<rect y="250" width="400" height="350" fill="' + b + '"/>';
        s += '<path d="M190,250 L40,600 M210,250 L360,600" stroke="' + c + '" stroke-width="5"/>';
        for (i = 0; i < 12; i++) { var t = i / 12, yy = 250 + 350 * t * t, w = 20 + 300 * t * t; s += '<rect x="' + (200 - w / 2) + '" y="' + yy + '" width="' + w + '" height="' + (2 + 8 * t) + '" fill="' + c + '" opacity=".6"/>'; }
        s += '<rect x="186" y="232" width="28" height="18" fill="' + p[0] + '"/><circle cx="200" cy="240" r="4" fill="' + a + '"/>';
        break;
      case "moon":
        s += '<circle cx="270" cy="170" r="80" fill="' + a + '"/><circle cx="300" cy="150" r="70" fill="' + p[0] + '" opacity=".9"/>';
        for (i = 0; i < 9; i++) s += '<path d="M0,' + (300 + i * 30) + ' Q100,' + (285 + i * 30) + ' 200,' + (300 + i * 30) + ' T400,' + (300 + i * 30) + '" stroke="' + (i % 2 ? c : a) + '" stroke-width="3" fill="none" opacity="' + (0.9 - i * 0.08) + '"/>';
        s += '<path d="M60,330 l60,0 l-10,14 l-40,0Z M90,330 V300 l18,24" fill="' + c + '" stroke="' + c + '" stroke-width="2"/>';
        break;
      case "beam":
        s += '<path d="M260,190 L-40,90 L-40,330Z" fill="' + a + '" opacity=".55"/>';
        s += '<path d="M240,520 L256,220 L284,220 L300,520Z" fill="' + c + '"/><rect x="250" y="190" width="40" height="34" fill="' + a + '"/><path d="M244,190 L270,160 L296,190Z" fill="' + c + '"/>';
        for (i = 0; i < 4; i++) s += '<rect x="' + (246 + i * 1.5) + '" y="' + (280 + i * 60) + '" width="' + (48 - i * 3) + '" height="16" fill="' + b + '"/>';
        s += '<path d="M0,500 Q100,470 200,500 T400,490 V600 H0Z" fill="' + b + '"/>';
        for (i = 0; i < 40; i++) s += '<circle cx="' + (r() * 400) + '" cy="' + (r() * 160) + '" r="' + (r() * 1.6 + .4) + '" fill="' + c + '"/>';
        break;
      case "wheel":
        s += '<circle cx="200" cy="240" r="140" fill="none" stroke="' + a + '" stroke-width="16"/><circle cx="200" cy="240" r="120" fill="none" stroke="' + p[3] + '" stroke-width="3"/>';
        for (i = 0; i < 24; i++) { var an = i * Math.PI / 12; s += '<path d="M200,240 L' + (200 + 120 * Math.cos(an)) + ',' + (240 + 120 * Math.sin(an)) + '" stroke="' + p[3] + '" stroke-width="1.6" opacity=".7"/>'; }
        s += '<circle cx="200" cy="240" r="18" fill="' + a + '"/><circle cx="200" cy="240" r="7" fill="' + p[0] + '"/>';
        s += '<circle cx="80" cy="110" r="18" fill="' + a + '" opacity=".7"/><circle cx="330" cy="470" r="10" fill="' + a + '" opacity=".7"/>';
        break;
      case "snow":
        for (i = 0; i < 90; i++) s += '<circle cx="' + (r() * 400) + '" cy="' + (r() * 240) + '" r="' + (r() * 3 + .8) + '" fill="' + c + '" opacity="' + (.4 + r() * .6) + '"/>';
        s += '<rect y="250" width="400" height="150" fill="' + c + '"/>';
        for (i = 0; i < 10; i++) s += '<rect x="' + (i * 40) + '" y="250" width="38" height="150" fill="' + (i % 2 ? "#E8EDF2" : "#fff") + '"/>';
        for (i = 0; i < 10; i++) if ([2, 5, 9].indexOf(i) < 0) s += '<rect x="' + (i * 40 + 27) + '" y="250" width="24" height="90" fill="' + p[0] + '"/>';
        s += '<circle cx="300" cy="130" r="44" fill="' + a + '" opacity=".85"/>';
        break;
      case "sun":
        for (i = 6; i > 0; i--) s += '<circle cx="200" cy="230" r="' + (i * 34) + '" fill="' + (i % 2 ? a : b) + '" opacity="' + (0.25 + (6 - i) * 0.12) + '"/>';
        s += '<circle cx="200" cy="230" r="60" fill="' + c + '"/>';
        s += '<g transform="translate(250,400) rotate(-35)"><path d="M0,0 l-60,-12 l55,22 Z M0,0 l60,-12 l-55,22Z" fill="' + c + '"/><circle cx="0" cy="-14" r="8" fill="' + c + '"/><path d="M0,-6 L0,30" stroke="' + c + '" stroke-width="5"/></g>';
        for (i = 0; i < 12; i++) s += '<path d="M' + (230 + i * 4) + ',' + (440 + i * 12) + ' l' + (r() * 8 - 4) + ',8" stroke="' + a + '" stroke-width="2" opacity=".6"/>';
        break;
      case "city":
        x = 0;
        while (x < 400) { var bw = 40 + r() * 50, bh = 140 + r() * 230; s += '<rect x="' + x + '" y="' + (520 - bh) + '" width="' + bw + '" height="' + bh + '" fill="' + b + '"/>'; for (y = 540 - bh; y < 500; y += 22) for (var xx = x + 6; xx < x + bw - 10; xx += 14) if (r() > .6) s += '<rect x="' + xx + '" y="' + y + '" width="7" height="10" fill="' + (r() > .7 ? a : c) + '" opacity=".8"/>'; x += bw + 4; }
        for (i = 0; i < 60; i++) { x = r() * 400; y = r() * 600; s += '<path d="M' + x + ',' + y + ' l-6,22" stroke="' + c + '" stroke-width="1.2" opacity=".35"/>'; }
        s += '<rect y="520" width="400" height="80" fill="' + p[0] + '"/><rect x="120" y="480" width="160" height="44" rx="12" fill="' + a + '"/><rect x="150" y="466" width="100" height="20" rx="6" fill="' + a + '"/><circle cx="150" cy="526" r="13" fill="' + p[0] + '"/><circle cx="250" cy="526" r="13" fill="' + p[0] + '"/><path d="M120,505 L-60,560 L-60,470Z" fill="' + c + '" opacity=".12"/>';
        break;
      case "castle":
        s += '<circle cx="290" cy="140" r="46" fill="' + c + '" opacity=".9"/>';
        for (i = 0; i < 50; i++) s += '<circle cx="' + (r() * 400) + '" cy="' + (r() * 260) + '" r="' + (r() * 1.6 + .4) + '" fill="' + c + '" opacity=".8"/>';
        var cc = p[0];
        s += '<rect x="60" y="330" width="280" height="200" fill="' + cc + '"/>';
        [[40, 70, 230], [165, 70, 290], [300, 60, 210]].forEach(function (t) { s += '<rect x="' + t[0] + '" y="' + (530 - t[2]) + '" width="' + t[1] + '" height="' + t[2] + '" fill="' + cc + '"/>'; for (var k = 0; k < t[1]; k += 16) s += '<rect x="' + (t[0] + k) + '" y="' + (518 - t[2]) + '" width="10" height="14" fill="' + cc + '"/>'; s += '<rect x="' + (t[0] + t[1] / 2 - 5) + '" y="' + (560 - t[2]) + '" width="10" height="18" rx="5" fill="' + a + '"/>'; });
        s += '<path d="M180,530 V490 A20,20 0 0 1 220,490 V530Z" fill="' + a + '"/><path d="M0,530 H400 V600 H0Z" fill="' + b + '"/>';
        for (i = 0; i < 7; i++) s += '<circle cx="' + (40 + i * 55) + '" cy="560" r="16" fill="' + a + '" opacity=".35"/>';
        break;
      case "planes":
        for (i = 0; i < 6; i++) { x = 50 + r() * 300; y = 120 + i * 70; var sc = .6 + r() * .8; s += '<path d="M' + (x - 160) + ',' + (y + 60) + ' Q' + (x - 80) + ',' + (y + 90) + ' ' + x + ',' + y + '" stroke="' + p[3] + '" stroke-width="2" stroke-dasharray="6 8" fill="none" opacity=".5"/>'; s += '<g transform="translate(' + x + ',' + y + ') scale(' + sc + ') rotate(-20)"><path d="M0,0 L60,20 L0,30 L12,18Z" fill="' + (i % 2 ? a : "#fff") + '"/><path d="M0,30 L12,18 L18,38Z" fill="' + b + '"/></g>'; }
        s += '<circle cx="320" cy="90" r="40" fill="' + a + '" opacity=".6"/>';
        s += '<path d="M0,520 Q100,490 200,520 T400,510 V600 H0Z" fill="#fff" opacity=".6"/>';
        break;
      case "stripes":
        for (i = 0; i < 8; i++) s += '<rect y="' + (230 + i * 26) + '" width="400" height="' + (26 - i * 2) + '" fill="' + [p[1], a, p[3]][i % 3] + '" opacity=".85"/>';
        s += '<circle cx="200" cy="230" r="120" fill="#FFF3D6"/><rect y="300" width="400" height="300" fill="' + p[0] + '" opacity=".0"/>';
        for (i = 0; i < 6; i++) s += '<rect y="' + (234 + i * 22) + '" width="400" height="10" fill="' + p[1] + '"/>';
        s += '<path d="M0,360 Q200,330 400,360 V600 H0Z" fill="' + a + '"/><path d="M90,360 l20,-60 l20,60" stroke="' + p[3] + '" stroke-width="5" fill="none"/>';
        break;
      case "eye":
        s += '<path d="M40,300 Q200,120 360,300 Q200,480 40,300Z" fill="' + p[3] + '"/>';
        s += '<circle cx="200" cy="300" r="78" fill="' + a + '"/><circle cx="200" cy="300" r="34" fill="' + p[3] + '"/><circle cx="214" cy="286" r="10" fill="' + p[0] + '"/>';
        for (i = 0; i < 16; i++) { var aa = Math.PI + i * Math.PI / 15; s += '<path d="M' + (200 + 165 * Math.cos(aa)) + ',' + (300 + 120 * Math.sin(aa)) + ' l' + (24 * Math.cos(aa)) + ',' + (24 * Math.sin(aa)) + '" stroke="' + p[3] + '" stroke-width="7" stroke-linecap="round"/>'; }
        s += '<path d="M0,520 L400,470 L400,600 L0,600Z" fill="' + a + '"/>';
        break;
      default: // reel
        s += '<circle cx="200" cy="215" r="125" fill="none" stroke="' + a + '" stroke-width="10"/><circle cx="200" cy="215" r="22" fill="' + a + '"/>';
        for (i = 0; i < 6; i++) { var a2 = i * Math.PI / 3; s += '<circle cx="' + (200 + 70 * Math.cos(a2)) + '" cy="' + (215 + 70 * Math.sin(a2)) + '" r="32" fill="none" stroke="' + a + '" stroke-width="6"/>'; }
        s += '<rect y="370" width="400" height="74" fill="' + a + '"/>';
        for (i = 0; i < 14; i++) s += '<rect x="' + (6 + i * 29) + '" y="378" width="16" height="12" rx="2" fill="' + p[0] + '"/><rect x="' + (6 + i * 29) + '" y="424" width="16" height="12" rx="2" fill="' + p[0] + '"/>';
    }
    return s;
  }

  window.posterSVG = function (f, opts) {
    opts = opts || {};
    var p = PAL[f.palette] || PAL.wine, u = "p" + (f.id || "x") + (opts.uid || "");
    var r = rnd(hash(String(f.id) + f.title));
    var lines = wrap(f.title || "Без назви", 14).slice(0, 4);
    var fs = lines.length > 2 ? 34 : (lines.length === 2 ? 40 : 46);
    var light = ["paper", "mint", "summer", "bass"].indexOf(f.palette) > -1;
    var txt = light ? p[3] : p[3];
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" class="poster-svg" role="img" aria-label="Постер фільму «' + esc(f.title) + '»">';
    s += '<defs><linearGradient id="bg' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p[0] + '"/><stop offset="1" stop-color="' + p[1] + '"/></linearGradient>';
    s += '<filter id="gr' + u + '"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .18 0"/></filter></defs>';
    s += '<rect width="400" height="600" fill="url(#bg' + u + ')"/>';
    s += motif(f.style, p, r, u);
    // текстовий блок
    var ty = 600 - 40 - lines.length * (fs + 4) - 30;
    s += '<rect y="' + (ty - 46) + '" width="400" height="' + (600 - ty + 46) + '" fill="' + p[0] + '" opacity="' + (light ? .0 : .55) + '"/>';
    s += '<text x="24" y="40" font-family="Nunito, sans-serif" font-size="12" font-weight="700" letter-spacing="3" fill="' + txt + '" opacity=".8">АРТ-КІНОТЕАТР «ЛІХТАР»</text>';
    s += '<text x="376" y="40" text-anchor="end" font-family="Nunito, sans-serif" font-size="13" font-weight="700" fill="' + p[2] + '">' + esc(f.age || "") + '</text>';
    lines.forEach(function (l, i) { s += '<text x="24" y="' + (ty + i * (fs + 4)) + '" font-family="Prata, Georgia, serif" font-size="' + fs + '" fill="' + txt + '">' + esc(l) + '</text>'; });
    s += '<rect x="24" y="' + (ty + lines.length * (fs + 4) - fs + 14) + '" width="60" height="3" fill="' + p[2] + '"/>';
    s += '<text x="24" y="' + (ty + lines.length * (fs + 4) - fs + 40) + '" font-family="Nunito, sans-serif" font-size="13" font-weight="700" letter-spacing="1.5" fill="' + txt + '" opacity=".85">' + esc(String(f.director || "").toUpperCase()) + ' · ' + esc(f.year || "") + '</text>';
    s += '<rect width="400" height="600" filter="url(#gr' + u + ')"/>';
    s += '<rect x="10" y="10" width="380" height="580" fill="none" stroke="' + p[2] + '" stroke-width="1.5" opacity=".6"/>';
    s += "</svg>";
    return s;
  };
  window.POSTER_PALETTES = PAL_NAMES;
  window.POSTER_STYLES = STYLES;
  window.POSTER_COLORS = PAL;
})();
