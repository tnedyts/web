/* НЕСКІНЧЕННІСТЬ — WebGL: нескінченне занурення в множину Мандельброта
   і живий дослідник множин Жюліа */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function program(gl, fsrc) {
    var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(o)); return null; } return o; }
    var v = sh(gl.VERTEX_SHADER, vs);
    var f = sh(gl.FRAGMENT_SHADER, fsrc);
    if (!v || !f) return null;
    var pr = gl.createProgram();
    gl.attachShader(pr, v);
    gl.attachShader(pr, f);
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    var b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var l = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(l);
    gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
    return pr;
  }

  var PAL = [
    'vec3 pal(float t){return .5+.5*cos(6.28318*(vec3(1.,1.,1.)*t+vec3(0.,.1,.2)+uShift));}'
  ].join('\n');

  /* ---------- Занурення ---------- */
  var zc = document.getElementById('zoom');
  var hud = { z: document.getElementById('hudZoom'), c: document.getElementById('hudC') };
  if (zc) {
    var gl = zc.getContext('webgl', { antialias: false, preserveDrawingBuffer: false });
    var fs = [
      'precision highp float;',
      'uniform vec2 uRes;uniform vec2 uCenter;uniform float uWidth;uniform float uMax;uniform vec3 uShift;',
      PAL,
      'void main(){',
      ' vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.x;',
      ' vec2 c=uCenter+uv*uWidth;',
      ' vec2 z=vec2(0.);float n=0.;float trap=1e9;',
      ' for(int i=0;i<1200;i++){',
      '  if(float(i)>=uMax)break;',
      '  z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;',
      '  trap=min(trap,abs(z.x*z.y));',
      '  if(dot(z,z)>256.)break;',
      '  n+=1.;',
      ' }',
      ' vec3 col=vec3(0.);',
      ' if(n<uMax){',
      '  float sn=n-log2(log2(dot(z,z)))+4.;',
      '  float t=sqrt(sn)*.18;',
      '  col=pal(t);',
      '  col*=.55+.45*cos(sn*.35);',
      '  col+=vec3(.9,.95,1.)*.35*exp(-trap*40.);',
      ' }',
      ' gl_FragColor=vec4(pow(col,vec3(.9)),1.);',
      '}'
    ].join('\n');
    var pr = gl ? program(gl, fs) : null;
    if (pr) {
      var U = {};
      ['uRes', 'uCenter', 'uWidth', 'uMax', 'uShift'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
      var scale = window.innerWidth < 700 ? 0.5 : 0.6;
      var resize = function () {
        zc.width = Math.round(zc.offsetWidth * scale);
        zc.height = Math.round(zc.offsetHeight * scale);
        gl.viewport(0, 0, zc.width, zc.height);
      };
      window.addEventListener('resize', resize);
      resize();
      var CX = -0.743643887;
      var CY = 0.131825904;
      var W0 = Math.log(3.6);
      var W1 = Math.log(0.00035);
      var T = 70;
      var visible = true;
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(zc);
      var start = performance.now();
      var last = start;
      var ema = 16;
      var cnt = 0;
      (function frame(now) {
        requestAnimationFrame(frame);
        if (!visible || document.hidden) { last = now; return; }
        var ms = now - last;
        last = now;
        cnt++;
        if (cnt > 20) {
          ema = ema * 0.9 + ms * 0.1;
          if (cnt % 40 === 0) {
            if (ema > 26 && scale > 0.3) { scale -= 0.06; resize(); }
            else if (ema < 14 && scale < 0.85) { scale += 0.04; resize(); }
          }
        }
        var t = reduce ? 6 : (now - start) / 1000;
        var k = (1 - Math.cos(Math.PI * 2 * t / T)) / 2;
        var w = Math.exp(W0 + (W1 - W0) * k);
        var mx = Math.min(1200, 120 + Math.log(3.6 / w) * 70);
        /* центр плавно зміщується від огляду до точки занурення */
        var blend = Math.min(1, k * 4);
        var cx = -0.6 + (CX + 0.6) * blend;
        var cy = 0 + CY * blend;
        gl.uniform2f(U.uRes, zc.width, zc.height);
        gl.uniform2f(U.uCenter, cx, cy);
        gl.uniform1f(U.uWidth, w);
        gl.uniform1f(U.uMax, mx);
        gl.uniform3f(U.uShift, t * 0.02, t * 0.02, t * 0.02);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (hud.z && cnt % 6 === 0) {
          hud.z.innerHTML = '×' + (3.6 / w).toExponential(1).replace('.', ',').replace('e+', '·10<sup>') + '</sup>';
          hud.c.textContent = 'c = ' + cx.toFixed(6).replace('.', ',') + (cy < 0 ? ' − ' : ' + ') + Math.abs(cy).toFixed(6).replace('.', ',') + 'i';
        }
      })(start);
    } else {
      zc.style.background = 'url(images/full/02-seahorse-valley.jpg) center/cover';
    }
  }

  /* ---------- Дослідник Жюліа ---------- */
  var jc = document.getElementById('julia');
  var map = document.getElementById('map');
  if (jc && map) {
    var jg = jc.getContext('webgl', { antialias: false });
    var jfs = [
      'precision highp float;',
      'uniform vec2 uRes;uniform vec2 uC;uniform vec3 uShift;',
      PAL,
      'void main(){',
      ' vec2 z=(gl_FragCoord.xy-.5*uRes)/uRes.y*2.6;',
      ' float n=0.;float trap=1e9;',
      ' for(int i=0;i<300;i++){',
      '  z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+uC;',
      '  trap=min(trap,length(z-uC));',
      '  if(dot(z,z)>256.)break;',
      '  n+=1.;',
      ' }',
      ' vec3 col;',
      ' if(n>=299.){col=vec3(.02,.01,.04)+vec3(.4,.6,1.)*.25*exp(-trap*3.);}',
      ' else{float sn=n-log2(log2(dot(z,z)))+4.;col=pal(sqrt(sn)*.22+.4);col*=1.-exp(-sn*.08);}',
      ' gl_FragColor=vec4(col,1.);',
      '}'
    ].join('\n');
    var jp = jg ? program(jg, jfs) : null;
    var JU = {};
    if (jp) ['uRes', 'uC', 'uShift'].forEach(function (n) { JU[n] = jg.getUniformLocation(jp, n); });
    function jres() {
      jc.width = Math.round(jc.offsetWidth * Math.min(1.5, window.devicePixelRatio || 1) * 0.8);
      jc.height = Math.round(jc.offsetHeight * Math.min(1.5, window.devicePixelRatio || 1) * 0.8);
      if (jg) jg.viewport(0, 0, jc.width, jc.height);
    }
    jres();
    window.addEventListener('resize', jres);

    /* Мапа — множина Мандельброта на canvas 2D */
    var mx2 = map.getContext('2d');
    var MAP = { x0: -2.2, x1: 0.8, y0: -1.15, y1: 1.15 };
    function drawMap() {
      var w = map.width = map.offsetWidth;
      var h = map.height = map.offsetHeight;
      var img = mx2.createImageData(w, h);
      for (var py = 0; py < h; py++) {
        for (var px = 0; px < w; px++) {
          var cr = MAP.x0 + (MAP.x1 - MAP.x0) * px / w;
          var ci = MAP.y1 - (MAP.y1 - MAP.y0) * py / h;
          var zr = 0;
          var zi = 0;
          var n = 0;
          while (n < 80 && zr * zr + zi * zi < 4) { var t = zr * zr - zi * zi + cr; zi = 2 * zr * zi + ci; zr = t; n++; }
          var o = (py * w + px) * 4;
          if (n === 80) { img.data[o] = 12; img.data[o + 1] = 8; img.data[o + 2] = 24; }
          else { var v = Math.sqrt(n / 80); img.data[o] = 40 + 200 * v; img.data[o + 1] = 30 + 120 * v * v; img.data[o + 2] = 90 + 160 * v; }
          img.data[o + 3] = 255;
        }
      }
      mx2.putImageData(img, 0, 0);
    }
    drawMap();
    window.addEventListener('resize', drawMap);
    var dot = document.querySelector('.explorer__dot');
    var cOut = document.getElementById('cOut');
    var cState = document.getElementById('cState');
    var C = { x: -0.8, y: 0.156 };
    var manual = 0;
    function inSet(cr, ci) {
      var zr = 0;
      var zi = 0;
      for (var n = 0; n < 200; n++) { var t = zr * zr - zi * zi + cr; zi = 2 * zr * zi + ci; zr = t; if (zr * zr + zi * zi > 4) return false; }
      return true;
    }
    function setFromEvent(e) {
      var r = map.getBoundingClientRect();
      var px = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      var py = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
      C.x = MAP.x0 + (MAP.x1 - MAP.x0) * px;
      C.y = MAP.y1 - (MAP.y1 - MAP.y0) * py;
      manual = performance.now();
    }
    map.addEventListener('pointermove', setFromEvent);
    map.addEventListener('pointerdown', function (e) { map.setPointerCapture(e.pointerId); setFromEvent(e); });
    var jvis = true;
    new IntersectionObserver(function (e) { jvis = e[0].isIntersecting; }).observe(jc);
    var j0 = performance.now();
    (function jf(now) {
      requestAnimationFrame(jf);
      if (!jvis || document.hidden) return;
      var t = (now - j0) / 1000;
      if (now - manual > 2500 && !reduce) {
        /* без миші c повільно обходить межу головної кардіоїди */
        var a = t * 0.18;
        C.x += (0.7885 * Math.cos(a) - C.x) * 0.05;
        C.y += (0.7885 * Math.sin(a) - C.y) * 0.05;
      }
      if (jp) {
        jg.uniform2f(JU.uRes, jc.width, jc.height);
        jg.uniform2f(JU.uC, C.x, C.y);
        jg.uniform3f(JU.uShift, t * 0.01, t * 0.01, t * 0.01);
        jg.drawArrays(jg.TRIANGLES, 0, 3);
      }
      dot.style.left = ((C.x - MAP.x0) / (MAP.x1 - MAP.x0) * 100) + '%';
      dot.style.top = ((MAP.y1 - C.y) / (MAP.y1 - MAP.y0) * 100) + '%';
      cOut.textContent = 'c = ' + C.x.toFixed(3).replace('.', ',') + (C.y < 0 ? ' − ' : ' + ') + Math.abs(C.y).toFixed(3).replace('.', ',') + 'i';
      cState.textContent = inSet(C.x, C.y) ? 'точка в множині Мандельброта — множина Жюліа зв\'язна' : 'точка поза множиною — множина Жюліа розсипається на «пил»';
    })(j0);
  }

})();
