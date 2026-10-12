/* НІЧНА ХВИЛЯ — синтвейв-траса на WebGL: неонове сонце, гори, сітка, що мчить назустріч.
   Реагує на ритм треку (window.__level) і на рух миші. */
(function () {
  'use strict';

  var cv = document.getElementById('synth');
  if (!cv) return;
  var gl = cv.getContext('webgl', { antialias: false });
  if (!gl) { cv.style.background = 'linear-gradient(#12002b, #ff2fb3 55%, #12002b 56%)'; return; }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var fs = [
    'precision highp float;',
    'uniform vec2 uRes;uniform float uTime;uniform float uLevel;uniform vec2 uMouse;',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5453);}',
    'float noise(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(hash(vec2(i,1.)),hash(vec2(i+1.,1.)),f);}',
    'float ridge(float x){return .06*noise(x*3.)+.035*noise(x*7.+3.)+.015*noise(x*17.);}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;',
    ' float hz=.36+uMouse.y*.02;',
    ' vec3 col;',
    ' float x=(uv.x-.5)*asp+uMouse.x*.06;',
    ' if(uv.y>hz){',
    '  float t=(uv.y-hz)/(1.-hz);',
    '  col=mix(vec3(.55,.06,.45),vec3(.05,.0,.12),pow(t,.55));',
    '  col+=vec3(1.,.25,.6)*exp(-t*9.)*(.55+uLevel*.4);',
    '  vec2 g=floor(uv*uRes/2.);float s=hash(g);',
    '  if(s>.996)col+=vec3(.8,.9,1.)*(s-.996)*250.*smoothstep(.2,.8,t)*(.6+.4*sin(uTime*3.+s*90.));',
    '  vec2 sc=vec2(uMouse.x*.04,hz+.2);',
    '  float r=.2+uLevel*.012;',
    '  float d=length(vec2(x-sc.x,uv.y-sc.y));',
    '  if(d<r){',
    '   float k=(uv.y-(sc.y-r))/(2.*r);',
    '   vec3 sun=mix(vec3(1.,.15,.55),vec3(1.,.86,.25),k);',
    '   float band=1.;',
    '   if(uv.y<sc.y+.02){float yy=(sc.y+.02-uv.y)/r;float f=fract(yy*7.-uTime*.35);band=step(yy*.42,f);}',
    '   col=mix(col,sun,band);',
    '  }',
    '  col+=vec3(1.,.3,.7)*.35*exp(-max(d-r,0.)*14.)*(.6+uLevel);',
    '  float m=hz+ridge(x*1.2+7.)+.02;',
    '  float m2=hz+ridge(x*2.1+1.)*.7;',
    '  if(uv.y<m){col=mix(vec3(.09,.0,.18),vec3(.02,.0,.05),(m-uv.y)/(m-hz+.001));col+=vec3(.0,.9,1.)*smoothstep(.004,0.,abs(uv.y-m))*.9;}',
    '  if(uv.y<m2){col=vec3(.03,.0,.08);col+=vec3(1.,.2,.7)*smoothstep(.004,0.,abs(uv.y-m2))*.8;}',
    ' }else{',
    '  float dy=hz-uv.y;',
    '  float z=.18/dy;',
    '  float wx=x*z*1.6;',
    '  float wz=z+uTime*(1.6+uLevel*.8);',
    '  float lw=.03*z+.012;',
    '  float gx=abs(fract(wx)-.5);float gz=abs(fract(wz)-.5);',
    '  float line=max(smoothstep(.5-lw,.5,gx*1.),smoothstep(.5-lw*1.4,.5,gz));',
    '  float fade=exp(-z*.18);',
    '  col=mix(vec3(.04,.0,.1),vec3(.12,.0,.22),fade);',
    '  vec3 lc=mix(vec3(1.,.18,.7),vec3(.2,.95,1.),smoothstep(.0,.25,dy));',
    '  col+=lc*line*fade*(1.1+uLevel*.9);',
    '  col+=vec3(1.,.3,.7)*exp(-dy*22.)*(.7+uLevel*.5);',
    '  float sr=exp(-abs(x-uMouse.x*.04)*6.)*exp(-dy*5.)*.25;col+=vec3(1.,.5,.3)*sr;',
    ' }',
    ' vec2 q=uv-.5;col*=1.-dot(q,q)*.8;',
    ' col+=(hash(gl_FragCoord.xy+uTime)-.5)*.04;',
    ' gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');
  function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(o)); return null; } return o; }
  var v = sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
  var f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return;
  var pr = gl.createProgram();
  gl.attachShader(pr, v);
  gl.attachShader(pr, f);
  gl.linkProgram(pr);
  gl.useProgram(pr);
  var b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var l = gl.getAttribLocation(pr, 'p');
  gl.enableVertexAttribArray(l);
  gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
  var U = {};
  ['uRes', 'uTime', 'uLevel', 'uMouse'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });

  var scale = 0.5;
  function resize() {
    cv.width = Math.round(cv.offsetWidth * scale);
    cv.height = Math.round(cv.offsetHeight * scale);
    gl.viewport(0, 0, cv.width, cv.height);
  }
  window.addEventListener('resize', resize);
  resize();
  var m = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', function (e) { m.tx = e.clientX / window.innerWidth - 0.5; m.ty = e.clientY / window.innerHeight - 0.5; }, { passive: true });
  var vis = true;
  new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(cv);
  var start = performance.now();
  (function frame(now) {
    requestAnimationFrame(frame);
    if (!vis || document.hidden) return;
    m.x += (m.tx - m.x) * 0.05;
    m.y += (m.ty - m.y) * 0.05;
    gl.uniform2f(U.uRes, cv.width, cv.height);
    gl.uniform1f(U.uTime, reduce ? 0 : (now - start) / 1000);
    gl.uniform1f(U.uLevel, window.__level || 0);
    gl.uniform2f(U.uMouse, m.x, m.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  })(start);
})();
