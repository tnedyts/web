/* =========================================================
   Велоблог «Дві педалі»: анімація велосипедиста на головній
   і лічильник пробігу сезону.
   ========================================================= */
(function () {
  'use strict';
  var reduce = window.BLOG ? window.BLOG.reduce : false;

  /* ---------- одометр: число «набігає» від 0 ---------- */
  var odo = document.querySelector('[data-odo]');
  if (odo) {
    var target = +odo.getAttribute('data-odo');
    if (reduce) odo.textContent = target;
    else {
      var t0 = null;
      var tick = function (t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / 2200), e = 1 - Math.pow(1 - k, 3);
        odo.textContent = Math.round(target * e);
        if (k < 1) requestAnimationFrame(tick);
      };
      setTimeout(function () { requestAnimationFrame(tick); }, 300);
    }
  }

  /* ---------- ноги велосипедиста крутять педалі ----------
     Стегно й гомілка — два відрізки (обернена кінематика):
     знаючи положення стегна і педалі, обчислюємо коліно. */
  var rider = document.querySelector('.rider');
  if (!rider) return;
  var legA = rider.querySelector('#legA'), legB = rider.querySelector('#legB');
  var crank = rider.querySelector('g[style*="transform-origin"]');
  if (crank) { crank.removeAttribute('class'); crank.removeAttribute('style'); }
  var HIP = [52, -86], BB = [72, 6], R = 22, L1 = 62, L2 = 58;

  function knee(foot) {
    var dx = foot[0] - HIP[0], dy = foot[1] - HIP[1], d = Math.min(Math.hypot(dx, dy), L1 + L2 - 0.01);
    var ux = dx / d, uy = dy / d, along = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - along * along));
    return [HIP[0] + ux * along + uy * h, HIP[1] + uy * along - ux * h];
  }
  function leg(path, a) {
    var foot = [BB[0] - R * Math.sin(a), BB[1] + R * Math.cos(a)], k = knee(foot);
    path.setAttribute('d', 'M' + HIP.join(' ') + ' L' + k[0].toFixed(1) + ' ' + k[1].toFixed(1) + ' L' + foot[0].toFixed(1) + ' ' + foot[1].toFixed(1));
  }
  function draw(a) {
    leg(legA, a); leg(legB, a + Math.PI);
    if (crank) crank.setAttribute('transform', 'rotate(' + (a * 180 / Math.PI).toFixed(1) + ' 72 6)');
  }
  draw(0.6);
  if (reduce) return;
  var visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(rider.ownerSVGElement);
  var start = performance.now();
  (function loop(t) {
    if (visible) draw((t - start) / 1000 * 4.2);
    requestAnimationFrame(loop);
  })(start);
})();
