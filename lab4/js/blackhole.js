/* Горизонт подій — живий рендер чорної діри на WebGL.
   Кожен піксель випускає промінь, який згинається гравітацією (рівняння руху
   фотона в метриці Шварцшильда, одиниці R_s = 1). Промінь або падає під горизонт,
   або перетинає акреційний диск, або тікає до зоряного неба. */
(function () {
  'use strict';

  var canvas = document.getElementById('bh');
  if (!canvas) return;
  var gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
  if (!gl) { document.documentElement.classList.add('no-webgl'); return; }

  var vert = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

  var frag = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    'uniform vec2 uRes;',
    'uniform float uTime;',
    'uniform float uDisk;',
    'uniform vec2 uMouse;',
    'uniform float uZoom;',
    'uniform float uTilt;',
    'uniform vec2 uShift;',
    'uniform float uYaw;',
    'uniform float uFl;',
    'uniform float uLook;',
    '#define RIN 2.6',
    '#define ROUT 12.0',
    'float hash13(vec3 p){p=fract(p*.1031);p+=dot(p,p.zyx+31.32);return fract((p.x+p.y)*p.z);}',
    'float noise(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.-2.*f);',
    ' return mix(mix(mix(hash13(i),hash13(i+vec3(1,0,0)),f.x),mix(hash13(i+vec3(0,1,0)),hash13(i+vec3(1,1,0)),f.x),f.y),',
    '            mix(mix(hash13(i+vec3(0,0,1)),hash13(i+vec3(1,0,1)),f.x),mix(hash13(i+vec3(0,1,1)),hash13(i+vec3(1,1,1)),f.x),f.y),f.z);}',
    'float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return v;}',
    'vec3 sky(vec3 d){',
    ' vec3 col=vec3(0.);',
    ' for(int i=0;i<3;i++){',
    '  float fi=float(i);',
    '  vec3 p=d*(80.+130.*fi);',
    '  vec3 id=floor(p);vec3 f=fract(p)-.5;',
    '  float h=hash13(id+fi*17.31);',
    '  if(h>.965){',
    '   vec3 o=vec3(hash13(id+1.3),hash13(id+2.7),hash13(id+4.1))-.5;',
    '   float dd=length(f-o*.55);',
    '   float b=(h-.965)/.035;',
    '   float s=exp(-dd*dd*(120.+160.*fi))*b*b*(2.6-fi*.6);',
    '   col+=s*mix(vec3(1.,.78,.58),vec3(.66,.8,1.),hash13(id*3.1));',
    '  }',
    ' }',
    ' float band=exp(-pow(dot(d,normalize(vec3(.35,1.,.25))),2.)*7.);',
    ' float n=fbm(d*2.6+vec3(1.7,0.,4.2));',
    ' float n2=fbm(d*5.5-vec3(3.,1.,2.));',
    ' col+=band*(vec3(.24,.16,.46)*pow(n,3.)*1.3+vec3(.95,.55,.32)*pow(n2,5.)*1.6);',
    ' col+=vec3(.012,.01,.03)*n;',
    ' return col;',
    '}',
    'vec4 disk(vec3 p,vec3 rd){',
    ' float r=length(p.xz);',
    ' if(r<RIN||r>ROUT)return vec4(0.);',
    ' float om=1./pow(r,1.5);',
    ' float a=uDisk*om*1.6;',
    ' float c=cos(a),s=sin(a);',
    ' vec2 q=mat2(c,-s,s,c)*p.xz;',
    ' float n=fbm(vec3(q*1.15,r*.45));',
    ' float rings=.5+.5*sin(r*7.+n*7.);',
    ' float dens=n*.85+rings*.32;',
    ' float t=(r-RIN)/(ROUT-RIN);',
    ' float fade=smoothstep(0.,.06,t)*(1.-smoothstep(.45,1.,t));',
    ' float temp=pow(1.-t,1.7);',
    ' vec3 col=mix(vec3(.55,.12,.04),vec3(1.,.5,.16),smoothstep(0.,.55,temp));',
    ' col=mix(col,vec3(1.,.94,.84),smoothstep(.5,1.,temp));',
    ' vec3 v=normalize(vec3(-p.z,0.,p.x));',
    ' float beta=sqrt(.5/r)*.85;',
    ' float ct=dot(v,-normalize(rd));',
    ' float D=sqrt(1.-beta*beta)/(1.-beta*ct);',
    ' float boost=pow(D,3.);',
    ' col*=mix(vec3(1.,.7,.55),vec3(.85,.95,1.25),clamp(D-.6,0.,1.));',
    ' float I=fade*dens*(2.4*temp+.22)*boost;',
    ' float al=clamp(fade*(.25+dens*.85),0.,1.);',
    ' return vec4(col*I,al);',
    '}',
    'void main(){',
    ' vec2 uv=(gl_FragCoord.xy-.5*uRes)/min(uRes.y,uRes.x*1.15);',
    ' uv-=uShift;',
    ' float dist=uZoom;',
    ' float pitch=uTilt+uMouse.y*.07;',
    ' float yaw=uYaw+uTime*.01+uMouse.x*.18;',
    ' vec3 ro=vec3(dist*cos(pitch)*sin(yaw),dist*sin(pitch),-dist*cos(pitch)*cos(yaw));',
    ' vec3 ww=normalize(-ro);',
    ' vec3 uu=normalize(cross(ww,vec3(0.,1.,0.)));',
    ' vec3 vv=cross(uu,ww);',
    ' float cl=cos(uLook),sl=sin(uLook);vec3 w2=cl*ww+sl*uu;uu=cl*uu-sl*ww;ww=w2;',
    ' float roll=-.12+uMouse.x*.04;',
    ' vec2 ruv=vec2(cos(roll)*uv.x-sin(roll)*uv.y,sin(roll)*uv.x+cos(roll)*uv.y);',
    ' vec3 rd=normalize(ruv.x*uu+ruv.y*vv+uFl*ww);',
    ' vec3 pos=ro;vec3 vel=rd;',
    ' vec3 hv=cross(pos,vel);float h2=dot(hv,hv);',
    ' vec3 col=vec3(0.);float al=0.;bool fell=false;',
    ' for(int i=0;i<170;i++){',
    '  float r2=dot(pos,pos);',
    '  float r=sqrt(r2);',
    '  float dt=clamp(.075*r,.025,1.4);',
    '  vec3 acc=-1.5*h2*pos/(r2*r2*r);',
    '  vel+=acc*dt;',
    '  vec3 np=pos+vel*dt;',
    '  col+=(1.-al)*vec3(1.,.66,.36)*.035*dt*exp(-pow((r-1.5)*3.,2.));',
    '  if(pos.y*np.y<0.){',
    '   float t=pos.y/(pos.y-np.y);',
    '   vec4 d=disk(mix(pos,np,t),vel);',
    '   col+=(1.-al)*d.rgb;',
    '   al+=(1.-al)*d.a;',
    '  }',
    '  pos=np;',
    '  if(r2<1.){fell=true;break;}',
    '  if(r2>1600.)break;',
    '  if(al>.99)break;',
    ' }',
    ' if(!fell)col+=(1.-al)*sky(normalize(vel));',
    ' col=1.-exp(-col*1.55);',
    ' col=pow(col,vec3(.92,.95,1.));',
    ' vec2 q=gl_FragCoord.xy/uRes;',
    ' col*=.35+.65*pow(16.*q.x*q.y*(1.-q.x)*(1.-q.y),.18);',
    ' col+=(hash13(vec3(gl_FragCoord.xy,uTime))-.5)*.025;',
    ' gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  var vs = compile(gl.VERTEX_SHADER, vert);
  var fs = compile(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) { document.documentElement.classList.add('no-webgl'); return; }
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { document.documentElement.classList.add('no-webgl'); return; }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var U = {};
  ['uRes', 'uTime', 'uDisk', 'uMouse', 'uZoom', 'uTilt', 'uShift', 'uYaw', 'uFl', 'uLook'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var state = {
    scale: window.innerWidth < 700 ? 0.5 : 0.62,
    zoom: 60, tilt: 0.13, shiftX: 0, shiftY: 0.0, yaw: 0, fl: 1.7, look: 0,
    mouseX: 0, mouseY: 0, tx: 0, ty: 0,
    diskSpeed: reduce ? 0.15 : 1, diskTime: 0,
    visible: true, running: true
  };

  function resize() {
    var w = Math.max(1, Math.round(window.innerWidth * state.scale));
    var h = Math.max(1, Math.round(window.innerHeight * state.scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('pointermove', function (e) {
    state.tx = (e.clientX / window.innerWidth) * 2 - 1;
    state.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  document.addEventListener('visibilitychange', function () { state.visible = !document.hidden; });

  var last = performance.now();
  var ema = 16;
  var frames = 0;
  var start = last;
  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min(0.1, (now - last) / 1000);
    var ms = now - last;
    last = now;
    if (!state.visible || !state.running) return;

    state.mouseX += (state.tx - state.mouseX) * 0.04;
    state.mouseY += (state.ty - state.mouseY) * 0.04;
    state.diskTime += dt * state.diskSpeed;

    /* Адаптивна роздільна здатність: тримаємо ~50–60 кадрів/с */
    frames++;
    if (frames > 10) {
      ema = ema * 0.92 + ms * 0.08;
      if (frames % 30 === 0) {
        if (ema > 24 && state.scale > 0.3) { state.scale = Math.max(0.3, state.scale - 0.08); resize(); }
        else if (ema < 15 && state.scale < 0.9) { state.scale = Math.min(0.9, state.scale + 0.05); resize(); }
      }
    }

    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, (now - start) / 1000);
    gl.uniform1f(U.uDisk, state.diskTime);
    gl.uniform2f(U.uMouse, state.mouseX, -state.mouseY);
    gl.uniform1f(U.uZoom, state.zoom);
    gl.uniform1f(U.uTilt, state.tilt);
    gl.uniform2f(U.uShift, state.shiftX, state.shiftY);
    gl.uniform1f(U.uYaw, state.yaw);
    gl.uniform1f(U.uFl, state.fl);
    gl.uniform1f(U.uLook, state.look);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  requestAnimationFrame(frame);

  /* Невеликий API для main.js */
  window.BlackHole = {
    state: state,
    setRunning: function (v) { state.running = v; },
    toggleDisk: function () {
      state.diskSpeed = state.diskSpeed > 0.5 ? 0.0 : 1;
      return state.diskSpeed > 0;
    }
  };
  document.documentElement.classList.add('has-webgl');
})();
