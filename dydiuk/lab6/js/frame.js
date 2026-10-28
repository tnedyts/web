
(function(){
var SHOT=document.documentElement.classList.contains('shot');
var kind=document.body.className.split(' ')[0];
function send(name,msg){try{var w=window.parent.frames[name];if(w&&w!==window)w.postMessage(msg,'*')}catch(e){}}
if(kind==='page'){
  var els=document.querySelectorAll('.reveal');
  if(SHOT||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')})}
  else{var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.12});els.forEach(function(e){io.observe(e)})}
  // counters
  document.querySelectorAll('[data-count]').forEach(function(b){
    var raw=b.getAttribute('data-count'),m=raw.match(/^([^0-9]*)([0-9][0-9 ]*)(.*)$/);if(!m||SHOT)return;
    var target=parseInt(m[2].replace(/ /g,''),10);if(!(target>0))return;var t0=null;
    function step(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/1400),v=Math.round(target*(1-Math.pow(1-k,3)));
      b.textContent=m[1]+(target>=10000?v.toLocaleString('uk-UA'):v)+m[3];if(k<1)requestAnimationFrame(step);else b.textContent=raw}
    requestAnimationFrame(step)});
  var toc=[].map.call(document.querySelectorAll('h2[id]'),function(h){return {id:h.id,t:h.textContent}});
  var words=(document.querySelector('main').textContent.match(/\S+/g)||[]).length;
  var msg={type:'page',id:document.body.getAttribute('data-page'),title:document.querySelector('h1').textContent,toc:toc,words:words};
  function bc(){['menu','topics','info','logo'].forEach(function(n){send(n,msg)})}
  bc();setTimeout(bc,400);setTimeout(bc,1500);
  window.addEventListener('message',function(e){if(e.data&&e.data.type==='ask')bc()});
}else{
  send('content',{type:'ask'});
  window.addEventListener('message',function(e){var d=e.data;if(!d||d.type!=='page')return;
    if(kind==='menu'){document.querySelectorAll('.m a').forEach(function(a){a.classList.toggle('on',a.getAttribute('data-id')===d.id)})}
    if(kind==='topics'){var t=document.querySelector('.ptitle');t.textContent=d.title;var ul=document.querySelector('.toc');ul.innerHTML='';
      d.toc.forEach(function(x,i){var li=document.createElement('li');li.style.setProperty('--i',i);var a=document.createElement('a');a.href=d.id+'.html#'+x.id;a.target='content';a.textContent=x.t;li.appendChild(a);ul.appendChild(li)})}
    if(kind==='info'){var m=document.querySelector('.meta');if(m)m.innerHTML='Сторінка: <b>'+d.title+'</b><br>Обсяг: <b>'+d.words+'</b> слів<br>Читання: <b>≈'+Math.max(1,Math.round(d.words/180))+' хв</b>'}
  });
  if(kind==='menu'){document.querySelectorAll('.m a').forEach(function(a){a.addEventListener('click',function(){document.querySelectorAll('.m a').forEach(function(b){b.classList.remove('on')});a.classList.add('on')})})}
  if(kind==='info'){var facts=[].slice.call(document.querySelectorAll('.facts li')).map(function(l){return l.textContent});var box=document.querySelector('.fact'),dots=document.querySelector('.dots'),k=0;
    facts.forEach(function(){dots.appendChild(document.createElement('i'))});
    function show(i){box.textContent=facts[i];[].forEach.call(dots.children,function(d,j){d.classList.toggle('on',j===i)})}
    show(0);if(!SHOT)setInterval(function(){box.classList.add('fade');setTimeout(function(){k=(k+1)%facts.length;show(k);box.classList.remove('fade')},500)},6000);
    var c=document.querySelector('.clock');function tick(){var d=new Date();c.textContent=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
    if(c){if(SHOT)c.textContent='12:00';else{tick();setInterval(tick,10000)}}}
}
})();
