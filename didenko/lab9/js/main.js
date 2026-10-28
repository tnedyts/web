
(function(){var SHOT=document.documentElement.classList.contains('shot');
var b=document.querySelector('.burger'),n=document.querySelector('.top nav');if(b)b.onclick=function(){n.classList.toggle('open')};
var els=document.querySelectorAll('.reveal');
if(SHOT||!('IntersectionObserver' in window))els.forEach(function(e){e.classList.add('in')});
else{var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.1});els.forEach(function(e){io.observe(e)})}
// ---------- weather (Open-Meteo)
var W={0:'ясно',1:'переважно ясно',2:'мінлива хмарність',3:'хмарно',45:'туман',48:'паморозь',51:'мряка',53:'мряка',55:'густа мряка',61:'невеликий дощ',63:'дощ',65:'сильний дощ',71:'невеликий сніг',73:'сніг',75:'сильний сніг',80:'зливи',81:'зливи',82:'сильні зливи',95:'гроза',96:'гроза з градом',99:'гроза з градом'};
var w=document.getElementById('weather');
if(w){var u='https://api.open-meteo.com/v1/forecast?latitude='+w.dataset.lat+'&longitude='+w.dataset.lng+'&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto';
 fetch(u).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){var c=d.current;
  w.querySelector('.big').textContent=Math.round(c.temperature_2m)+'°C';w.querySelector('.desc').textContent=(W[c.weather_code]||'—')+', вітер '+Math.round(c.wind_speed_10m)+' км/год'})
 .catch(function(){w.querySelector('.big').textContent='—';w.querySelector('.desc').textContent='Дані погоди тимчасово недоступні'})}
// ---------- NBU rates
var cu=document.getElementById('rates');
if(cu){fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){var want=['USD','EUR','PLN'],h='';
  want.forEach(function(k){var x=d.filter(function(i){return i.cc===k})[0];if(x)h+='<b>'+k+'</b><span>'+x.rate.toFixed(2)+' грн</span>'});
  cu.querySelector('.rates').innerHTML=h||'<span>Дані недоступні</span>';var dt=d[0]&&d[0].exchangedate;if(dt)cu.querySelector('small').textContent='Офіційний курс НБУ на '+dt})
 .catch(function(){cu.querySelector('.rates').innerHTML='<span>Курс тимчасово недоступний</span>'})}
// ---------- audio visualizer
var pl=document.querySelector('.player');
if(pl){var a=pl.querySelector('audio'),cv=pl.querySelector('canvas'),g=cv.getContext('2d'),an=null,data=null,raf;
 function size(){cv.width=cv.clientWidth*2;cv.height=cv.clientHeight*2}size();addEventListener('resize',size);
 function draw(){var W=cv.width,H=cv.height,N=48;g.clearRect(0,0,W,H);var t=a.currentTime;
  var live=false;if(an){an.getByteFrequencyData(data);for(var j=0;j<data.length;j++)if(data[j]>0){live=true;break}}
  for(var i=0;i<N;i++){var v=live?data[Math.floor(i*data.length/N/1.6)]/255:(a.paused?.12+.3*Math.abs(Math.sin(i*.55))*Math.abs(Math.cos(i*.21)):.25+.25*Math.abs(Math.sin(t*3+i*.5))*Math.abs(Math.cos(t*1.3+i*.2)));
   var h=Math.max(4,v*H),x=i*W/N;g.fillStyle=getComputedStyle(pl).getPropertyValue('--bar')||'#fff';g.globalAlpha=.35+v*.65;g.fillRect(x+2,H-h,W/N-4,h)}
  g.globalAlpha=1;raf=requestAnimationFrame(draw)}
 a.addEventListener('play',function(){pl.classList.add('playing');
  if(!an&&location.protocol.indexOf('http')===0){try{var C=new (window.AudioContext||window.webkitAudioContext)(),s=C.createMediaElementSource(a);an=C.createAnalyser();an.fftSize=256;data=new Uint8Array(an.frequencyBinCount);s.connect(an);an.connect(C.destination);C.resume()}catch(e){an=null}}
  cancelAnimationFrame(raf);draw()});
 a.addEventListener('pause',function(){pl.classList.remove('playing')});
 draw();if(SHOT){cancelAnimationFrame(raf)}}
})();
