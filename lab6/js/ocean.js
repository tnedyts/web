/* БЕЗОДНЯ — живий океан за фреймами.
   WebGL малює воду (промені світла, каустики, глибину), canvas — життя:
   морський сніг, бульбашки, медуз, кита і біолюмінесценцію під курсором.
   Фрейми повідомляють про глибину через postMessage, і океан темнішає. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var state = { depth: 0, target: 0, key: 'home', zone: 'Поверхня' };
  var MAXD = 11000;
  function norm(d) { return Math.log(1 + d / 40) / Math.log(1 + MAXD / 40); }

  /* ---------- WebGL ---------- */
  var cv = document.getElementById('ocean');
  var gl = cv.getContext('webgl', { antialias: false, alpha: false });
  var U = {};
  var glOk = false;
  if (gl) {
    var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var fs = [
      'precision highp float;',
      'uniform vec2 uRes;uniform float uTime;uniform float uDepth;uniform vec2 uMouse;',
      'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
      'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
      ' return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}',
      'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}',
      'float caustic(vec2 uv,float t){',
      ' vec2 p=mod(uv*6.28318,6.28318)-250.;vec2 i=p;float c=1.;float k=.005;',
      ' for(int n=0;n<5;n++){float tt=t*(1.-(3.5/float(n+1)));',
      '  i=p+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x));',
      '  c+=1./length(vec2(p.x/(sin(i.x+tt)/k),p.y/(cos(i.y+tt)/k)));}',
      ' c/=5.;c=1.17-pow(c,1.4);return clamp(pow(abs(c),8.),0.,1.);}',
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;float d=uDepth;',
      ' vec3 sT=vec3(.09,.52,.66),sB=vec3(.01,.17,.31);',
      ' vec3 mT=vec3(.02,.15,.29),mB=vec3(0.,.04,.10);',
      ' vec3 dT=vec3(0.,.03,.07),dB=vec3(0.,.003,.012);',
      ' vec3 top=mix(mix(sT,mT,smoothstep(0.,.42,d)),dT,smoothstep(.42,.82,d));',
      ' vec3 bot=mix(mix(sB,mB,smoothstep(0.,.42,d)),dB,smoothstep(.42,.82,d));',
      ' vec3 col=mix(bot,top,pow(uv.y,1.25));',
      ' float light=1.-smoothstep(.05,.55,d);',
      ' vec2 src=vec2(.5+.18*sin(uTime*.04)+uMouse.x*.05,1.3);',
      ' vec2 dv=vec2((uv.x-src.x)*asp,uv.y-src.y);',
      ' float ang=atan(dv.x,-dv.y);',
      ' float rays=fbm(vec2(ang*6.,uTime*.1));rays=pow(rays,2.6)*1.9;',
      ' rays*=smoothstep(-.3,1.,uv.y)*(.6+.4*fbm(vec2(ang*2.,uTime*.05+3.)));',
      ' col+=vec3(.55,.92,1.)*rays*.42*light;',
      ' float c=caustic(vec2(uv.x*asp,uv.y)*.8+vec2(uTime*.004,0.),uTime*.32);',
      ' col+=vec3(.6,.96,1.)*c*.26*light*smoothstep(.45,1.,uv.y);',
      ' float fog=fbm(vec2(uv.x*asp*1.6,uv.y*2.)+vec2(uTime*.018,-uTime*.008));',
      ' col+=vec3(0.,.16,.22)*(fog-.45)*.3*(1.-d*.75);',
      ' col+=vec3(.0,.35,.45)*pow(fbm(vec2(uv.x*asp*3.,uv.y*3.)-uTime*.03),4.)*.25*(1.-light)*(1.-d*.6);',
      ' vec2 q=uv-.5;col*=1.-dot(q,q)*.85;',
      ' col+=(hash(gl_FragCoord.xy+uTime)-.5)/128.;',
      ' gl_FragColor=vec4(col,1.);',
      '}'
    ].join('\n');
    var sh = function (t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
    var v = sh(gl.VERTEX_SHADER, vs);
    var f = sh(gl.FRAGMENT_SHADER, fs);
    if (v && f) {
      var pr = gl.createProgram();
      gl.attachShader(pr, v);
      gl.attachShader(pr, f);
      gl.linkProgram(pr);
      if (gl.getProgramParameter(pr, gl.LINK_STATUS)) {
        gl.useProgram(pr);
        var b = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        var l = gl.getAttribLocation(pr, 'p');
        gl.enableVertexAttribArray(l);
        gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
        ['uRes', 'uTime', 'uDepth', 'uMouse'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
        glOk = true;
      }
    }
  }
  if (!glOk) document.documentElement.classList.add('no-webgl');

  var scale = 0.6;
  function resizeGL() {
    if (!glOk) return;
    cv.width = Math.round(window.innerWidth * scale);
    cv.height = Math.round(window.innerHeight * scale);
    gl.viewport(0, 0, cv.width, cv.height);
  }

  /* ---------- Життя на canvas ---------- */
  var life = document.getElementById('life');
  var ctx = life.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0;
  var H = 0;
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    life.width = W * dpr;
    life.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    resizeGL();
  }
  window.addEventListener('resize', resize);
  resize();

  /* Спрайт світіння для біолюмінесценції */
  function sprite(rgb) {
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var g = c.getContext('2d');
    var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.18, 'rgba(' + rgb + ',.95)');
    gr.addColorStop(0.5, 'rgba(' + rgb + ',.25)');
    gr.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    return c;
  }
  var glows = [sprite('94,242,255'), sprite('80,160,255'), sprite('150,120,255'), sprite('60,255,200')];

  var snow = [];
  for (var i = 0; i < 140; i++) snow.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + 0.3, vy: 0.00006 + Math.random() * 0.00014, ph: Math.random() * 6.28 });
  var bubbles = [];
  for (i = 0; i < 26; i++) bubbles.push({ x: Math.random(), y: Math.random(), r: 2 + Math.random() * 7, vy: 0.0006 + Math.random() * 0.0012, ph: Math.random() * 6.28 });
  var sparks = [];
  var jellies = [];
  for (i = 0; i < 5; i++) jellies.push({ x: 0.1 + Math.random() * 0.8, y: Math.random(), s: 26 + Math.random() * 34, ph: Math.random() * 6.28, hue: i % 3, vy: 0.00008 + Math.random() * 0.0001 });
  var whale = { x: -0.4, y: 0.24 };
  var lure = { x: 0.7, y: 0.6, tx: 0.7, ty: 0.6 };

  function drawJelly(j, t, a) {
    var x = j.x * W;
    var y = j.y * H;
    var s = j.s;
    var pulse = 1 + Math.sin(t * 1.6 + j.ph) * 0.12;
    var col = ['94,242,255', '170,140,255', '255,120,200'][j.hue];
    ctx.save();
    ctx.globalAlpha = a;
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(glows[j.hue === 0 ? 0 : 2], x - s * 1.6, y - s * 1.4, s * 3.2, s * 3.2);
    ctx.strokeStyle = 'rgba(' + col + ',.85)';
    ctx.fillStyle = 'rgba(' + col + ',.12)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x - s * pulse, y);
    ctx.bezierCurveTo(x - s * pulse, y - s * 1.3, x + s * pulse, y - s * 1.3, x + s * pulse, y);
    for (var k = 0; k <= 6; k++) {
      var xx = x + s * pulse - (k / 6) * 2 * s * pulse;
      ctx.lineTo(xx, y + (k % 2 ? 4 : -1));
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    for (k = 0; k < 6; k++) {
      var tx = x - s * 0.75 + k * s * 0.3;
      ctx.beginPath();
      ctx.moveTo(tx, y + 2);
      for (var q = 1; q <= 10; q++) {
        ctx.lineTo(tx + Math.sin(t * 2 + q * 0.6 + k + j.ph) * (3 + q * 0.8), y + q * s * 0.22);
      }
      ctx.strokeStyle = 'rgba(' + col + ',' + (0.55 - k * 0.04) + ')';
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawWhale(t, a) {
    var x = whale.x * W;
    var y = whale.y * H + Math.sin(t * 0.3) * 10;
    var s = Math.min(W, 1400) / 3.2;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(x, y);
    ctx.scale(s / 400, s / 400);
    ctx.fillStyle = 'rgba(0, 18, 32, .55)';
    ctx.beginPath();
    ctx.moveTo(-200, 0);
    ctx.bezierCurveTo(-190, -42, -110, -58, -20, -52);
    ctx.bezierCurveTo(70, -46, 150, -30, 200, -8);
    var tail = Math.sin(t * 1.2) * 14;
    ctx.lineTo(240, -6 + tail * 0.3);
    ctx.bezierCurveTo(262, -40 + tail, 290, -44 + tail, 300, -40 + tail);
    ctx.bezierCurveTo(280, -14 + tail, 270, 0, 262, 6);
    ctx.bezierCurveTo(272, 14, 290, 40 + tail, 298, 46 + tail);
    ctx.bezierCurveTo(280, 46 + tail, 256, 30 + tail, 238, 12);
    ctx.bezierCurveTo(170, 30, 60, 44, -40, 40);
    ctx.bezierCurveTo(-120, 38, -190, 28, -200, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-60, 30);
    ctx.bezierCurveTo(-40, 70 + tail * 0.4, 0, 96, 20, 104);
    ctx.bezierCurveTo(10, 80, 0, 50, -20, 34);
    ctx.fill();
    ctx.restore();
  }

  /* ---------- Повідомлення від фреймів ---------- */
  var frames = Array.prototype.slice.call(document.querySelectorAll('iframe'));
  function frameOf(src) {
    for (var k = 0; k < frames.length; k++) if (frames[k].contentWindow === src) return frames[k];
    return null;
  }
  window.addEventListener('message', function (e) {
    var m = e.data;
    if (!m || !m.ocean) return;
    if (m.ocean === 'ready' && e.source) {
      e.source.postMessage({ ocean: 'hello', depth: state.target, zone: state.zone, key: state.key }, '*');
    } else if (m.ocean === 'depth') {
      state.target = Math.max(0, Math.min(MAXD, m.depth));
      if (m.zone) state.zone = m.zone;
      if (m.key) state.key = m.key;
    } else if (m.ocean === 'pointer') {
      var fr = frameOf(e.source);
      if (!fr) return;
      var r = fr.getBoundingClientRect();
      spawn(r.left + m.x, r.top + m.y, m.burst ? 26 : 2);
    }
  });
  window.addEventListener('pointermove', function (e) { spawn(e.clientX, e.clientY, 2); mouse.tx = e.clientX / W - 0.5; });
  var mouse = { x: 0, tx: 0 };

  function spawn(x, y, n) {
    if (reduce) return;
    for (var k = 0; k < n; k++) {
      var a = Math.random() * 6.28;
      var sp = Math.random() * (n > 5 ? 2.2 : 0.6);
      sparks.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.2, life: 1, decay: 0.006 + Math.random() * 0.012, s: 6 + Math.random() * 14, g: glows[(Math.random() * glows.length) | 0] });
    }
    if (sparks.length > 600) sparks.splice(0, sparks.length - 600);
  }

  /* ---------- Цикл ---------- */
  var t0 = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    var t = (now - t0) / 1000;
    state.depth += (state.target - state.depth) * 0.035;
    var d = norm(state.depth);
    mouse.x += (mouse.tx - mouse.x) * 0.05;

    if (glOk) {
      gl.uniform2f(U.uRes, cv.width, cv.height);
      gl.uniform1f(U.uTime, reduce ? 0 : t);
      gl.uniform1f(U.uDepth, d);
      gl.uniform2f(U.uMouse, mouse.x, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    ctx.clearRect(0, 0, W, H);
    /* кит біля поверхні */
    var wa = 1 - Math.min(1, d / 0.22);
    if (wa > 0.01) {
      whale.x += 0.00022;
      if (whale.x > 1.5) whale.x = -0.5;
      drawWhale(t, wa);
    }
    /* морський сніг */
    ctx.fillStyle = '#d8f6ff';
    for (var k = 0; k < snow.length; k++) {
      var p = snow[k];
      if (!reduce) { p.y += p.vy * 16; if (p.y > 1.02) { p.y = -0.02; p.x = Math.random(); } }
      ctx.globalAlpha = 0.18 + 0.4 * d * (p.r / 2);
      ctx.beginPath();
      ctx.arc(p.x * W + Math.sin(t * 0.4 + p.ph) * 8, p.y * H, p.r, 0, 6.283);
      ctx.fill();
    }
    /* бульбашки на мілині */
    var ba = 1 - Math.min(1, d / 0.3);
    if (ba > 0.01) {
      ctx.strokeStyle = '#bff6ff';
      ctx.lineWidth = 1;
      for (k = 0; k < bubbles.length; k++) {
        var bb = bubbles[k];
        if (!reduce) { bb.y -= bb.vy * 4; if (bb.y < -0.05) { bb.y = 1.05; bb.x = Math.random(); } }
        var bx = bb.x * W + Math.sin(t * 1.5 + bb.ph) * 6;
        var by = bb.y * H;
        ctx.globalAlpha = ba * 0.55;
        ctx.beginPath();
        ctx.arc(bx, by, bb.r, 0, 6.283);
        ctx.stroke();
        ctx.globalAlpha = ba * 0.7;
        ctx.beginPath();
        ctx.arc(bx - bb.r * 0.35, by - bb.r * 0.35, bb.r * 0.25, 0, 6.283);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
    }
    /* медузи глибше */
    var ja = Math.max(0, Math.min(1, (d - 0.22) / 0.25));
    if (ja > 0.01) {
      for (k = 0; k < jellies.length; k++) {
        var j = jellies[k];
        if (!reduce) { j.y -= j.vy * 16 * (1 + Math.sin(t * 1.6 + j.ph) * 0.8); if (j.y < -0.15) { j.y = 1.15; j.x = 0.1 + Math.random() * 0.8; } }
        drawJelly(j, t, ja * 0.85);
      }
    }
    /* приманка вудильника у безодні */
    var la = Math.max(0, Math.min(1, (d - 0.62) / 0.15));
    if (la > 0.01) {
      if (Math.random() < 0.004) { lure.tx = 0.15 + Math.random() * 0.7; lure.ty = 0.3 + Math.random() * 0.5; }
      lure.x += (lure.tx - lure.x) * 0.004;
      lure.y += (lure.ty - lure.y) * 0.004;
      var lx = lure.x * W;
      var ly = lure.y * H + Math.sin(t * 2) * 6;
      var flick = 0.75 + Math.sin(t * 9) * 0.08 + Math.sin(t * 3.1) * 0.1;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = la * flick;
      ctx.drawImage(glows[3], lx - 60, ly - 60, 120, 120);
      ctx.drawImage(glows[0], lx - 16, ly - 16, 32, 32);
      ctx.strokeStyle = 'rgba(94,242,255,.25)';
      ctx.beginPath();
      ctx.moveTo(lx, ly + 6);
      ctx.quadraticCurveTo(lx + 40, ly + 10, lx + 60, ly + 60);
      ctx.stroke();
      ctx.restore();
    }
    /* біолюмінесценція під курсором */
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var boost = 0.35 + d * 0.65;
    for (k = sparks.length - 1; k >= 0; k--) {
      var s = sparks[k];
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.97;
      s.vy = s.vy * 0.97 - 0.004;
      s.life -= s.decay;
      if (s.life <= 0) { sparks.splice(k, 1); continue; }
      ctx.globalAlpha = s.life * boost;
      var sz = s.s * (0.4 + s.life * 0.6);
      ctx.drawImage(s.g, s.x - sz / 2, s.y - sz / 2, sz, sz);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  requestAnimationFrame(frame);

  /* Поява панелей */
  window.addEventListener('load', function () { document.documentElement.classList.add('is-ready'); });
  setTimeout(function () { document.documentElement.classList.add('is-ready'); }, 1500);
})();
