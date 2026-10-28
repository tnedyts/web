(function(){var lb=document.querySelector('.lb'),img=lb.querySelector('img'),n=1,N=CAPS.length;
function pad(x){return (x<10?'0':'')+x}
function show(k){n=(k+N-1)%N+1;img.style.opacity=0;var s='images/photo-'+pad(n)+'.jpg';var pre=new Image();pre.onload=function(){img.src=s;img.alt=CAPS[n-1];img.style.opacity=1};pre.src=s;
 lb.querySelector('.lbn').textContent=pad(n)+' / '+N;lb.querySelector('.lbc').textContent=CAPS[n-1];lb.querySelector('.full').href='view.html?n='+n}
function open(k){show(k);lb.classList.add('open')}function close(){lb.classList.remove('open')}
document.querySelectorAll('a.th').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();open(+a.getAttribute('data-n'))})});
lb.querySelector('.prev').onclick=function(){show(n-1)};lb.querySelector('.next').onclick=function(){show(n+1)};lb.querySelector('.close').onclick=close;
lb.addEventListener('click',function(e){if(e.target===lb)close()});
document.addEventListener('keydown',function(e){if(!lb.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(n-1);if(e.key==='ArrowRight')show(n+1)});
var m=location.search.match(/[?&]lb=(\d+)/);if(m)open(+m[1]);})();