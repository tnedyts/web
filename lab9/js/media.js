/* НІЧНА ХВИЛЯ — медіа: касетна дека з візуалізатором та інформери */
(function () {
  'use strict';

  var audio = document.getElementById('track');
  var deck = document.querySelector('.deck');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Дека ---------- */
  if (deck && audio) {
    var keys = {
      play: deck.querySelector('[data-k="play"]'),
      pause: deck.querySelector('[data-k="pause"]'),
      stop: deck.querySelector('[data-k="stop"]'),
      rew: deck.querySelector('[data-k="rew"]'),
      ff: deck.querySelector('[data-k="ff"]')
    };
    var cnt = deck.querySelector('#tapeCounter');
    function sync() {
      var on = !audio.paused;
      deck.classList.toggle('is-playing', on);
      keys.play.setAttribute('aria-pressed', on ? 'true' : 'false');
      keys.pause.setAttribute('aria-pressed', !on && audio.currentTime > 0 ? 'true' : 'false');
    }
    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);
    audio.addEventListener('timeupdate', function () {
      var s = Math.floor(audio.currentTime);
      cnt.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    });
    keys.play.addEventListener('click', function () { audio.play(); });
    keys.pause.addEventListener('click', function () { audio.pause(); });
    keys.stop.addEventListener('click', function () { audio.pause(); audio.currentTime = 0; sync(); });
    keys.rew.addEventListener('click', function () { audio.currentTime = Math.max(0, audio.currentTime - 10); });
    keys.ff.addEventListener('click', function () { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10); });
    sync();

    /* Візуалізатор: справжній спектр через Web Audio, якщо браузер дозволяє,
       інакше — «синтетичний» спектр у ритм треку (100 уд./хв) */
    var vu = deck.querySelector('.vu');
    var vx = vu.getContext('2d');
    var analyser = null;
    var data = null;
    var ctxA = null;
    function initAnalyser() {
      if (analyser || !window.AudioContext) return;
      try {
        ctxA = new AudioContext();
        var src = ctxA.createMediaElementSource(audio);
        analyser = ctxA.createAnalyser();
        analyser.fftSize = 128;
        src.connect(analyser);
        analyser.connect(ctxA.destination);
        data = new Uint8Array(analyser.frequencyBinCount);
      } catch (e) { analyser = null; }
    }
    if (location.protocol !== 'file:') audio.addEventListener('play', function () { initAnalyser(); if (ctxA && ctxA.state === 'suspended') ctxA.resume(); });
    function size() { vu.width = vu.offsetWidth * 2; vu.height = vu.offsetHeight * 2; }
    size();
    window.addEventListener('resize', size);
    var bars = 32;
    var peaks = new Array(bars).fill(0);
    (function draw(now) {
      requestAnimationFrame(draw);
      var w = vu.width;
      var h = vu.height;
      vx.fillStyle = 'rgba(4,0,10,.55)';
      vx.fillRect(0, 0, w, h);
      var vals = [];
      var real = false;
      if (analyser && !audio.paused) {
        analyser.getByteFrequencyData(data);
        var sum = 0;
        for (var k = 0; k < bars; k++) { vals[k] = data[k + 1] / 255; sum += data[k + 1]; }
        real = sum > 0;
      }
      if (!real) {
        var lv = window.__level || 0;
        var t = now / 1000;
        for (k = 0; k < bars; k++) {
          var base = audio.paused ? 0.02 : 0.25 + 0.35 * Math.sin(t * 2.1 + k * 0.5) * Math.sin(t * 0.7 + k * 0.13);
          var kick = k < 6 ? lv * (1 - k / 7) : lv * 0.25;
          vals[k] = Math.max(0, Math.min(1, base * (1 - k / bars * 0.6) + kick + (audio.paused ? 0 : Math.random() * 0.06)));
        }
      }
      var bw = w / bars;
      for (k = 0; k < bars; k++) {
        var v = vals[k];
        peaks[k] = Math.max(peaks[k] - 0.01, v);
        var segs = Math.round(v * 14);
        for (var s = 0; s < segs; s++) {
          var y = h - (s + 1) * (h / 15);
          vx.fillStyle = s > 11 ? '#ff2fb3' : s > 8 ? '#ffd23f' : '#31f3ff';
          vx.fillRect(k * bw + 2, y + 2, bw - 4, h / 15 - 4);
        }
        vx.fillStyle = '#fff';
        vx.fillRect(k * bw + 2, h - peaks[k] * 14 * (h / 15) - 4, bw - 4, 3);
      }
    })(0);
  }

  /* ---------- Інформер погоди (Open-Meteo, без ключа) ---------- */
  var wEl = document.getElementById('weather');
  if (wEl) {
    var CODES = { 0: 'ясно', 1: 'переважно ясно', 2: 'мінлива хмарність', 3: 'хмарно', 45: 'туман', 48: 'туман', 51: 'мряка', 53: 'мряка', 55: 'мряка', 61: 'дощ', 63: 'дощ', 65: 'злива', 71: 'сніг', 73: 'сніг', 75: 'снігопад', 80: 'короткочасний дощ', 81: 'злива', 82: 'сильна злива', 95: 'гроза', 96: 'гроза з градом', 99: 'гроза з градом' };
    fetch('https://api.open-meteo.com/v1/forecast?latitude=50.38&longitude=30.48&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=Europe%2FKyiv')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var c = d.current;
        wEl.innerHTML = '<p class="val">' + Math.round(c.temperature_2m) + '°C</p>' +
          '<p class="row"><span>Небо</span><b>' + (CODES[c.weather_code] || '—') + '</b></p>' +
          '<p class="row"><span>Вітер</span><b>' + Math.round(c.wind_speed_10m) + ' км/год</b></p>' +
          '<p class="row"><span>Вологість</span><b>' + c.relative_humidity_2m + '%</b></p>';
      })
      .catch(function () { wEl.innerHTML = '<p class="row"><span>Немає зв\'язку з сервером погоди</span></p>'; });
  }

  /* ---------- Інформер курсу валют (API НБУ) ---------- */
  var fxEl = document.getElementById('fx');
  if (fxEl) {
    fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json')
      .then(function (r) { return r.json(); })
      .then(function (list) {
        var want = ['USD', 'EUR', 'PLN'];
        var rows = list.filter(function (x) { return want.indexOf(x.cc) >= 0; })
          .sort(function (a, b) { return want.indexOf(a.cc) - want.indexOf(b.cc); })
          .map(function (x) { return '<p class="row"><span>' + x.cc + '</span><b>' + x.rate.toFixed(2).replace('.', ',') + ' грн</b></p>'; });
        fxEl.innerHTML = rows.join('') + '<small>Офіційний курс НБУ на ' + (list[0] ? list[0].exchangedate : '') + '</small>';
      })
      .catch(function () { fxEl.innerHTML = '<p class="row"><span>Курс недоступний</span></p><small><a href="https://bank.gov.ua/ua/markets/exchangerates" target="_blank" rel="noopener">Курси на сайті НБУ</a></small>'; });
  }
  void reduce;
})();
