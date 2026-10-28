/* «Смерекова Хата» — ядро CMS: контент за замовчуванням + перекриття з localStorage */
(function () {
  var KEY = 'smerekova_cms_v1';
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function merge(def, saved) {
    var out = clone(def);
    if (!saved || typeof saved !== 'object') return out;
    Object.keys(saved).forEach(function (k) {
      var v = saved[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && out[k] && typeof out[k] === 'object' && !Array.isArray(out[k])) out[k] = Object.assign(out[k], v);
      else out[k] = v;
    });
    return out;
  }
  window.CMS = {
    key: KEY,
    load: function () {
      var saved = null;
      try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { saved = null; }
      return merge(window.DEFAULT_CONTENT, saved);
    },
    save: function (c) {
      try { localStorage.setItem(KEY, JSON.stringify(c)); return true; } catch (e) { return false; }
    },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) { } },
    get: function (c, path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, c); },
    uid: function (p) { return (p || 'x') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); },
    fmtDate: function (d, short) {
      var M = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
      var x = d.split('-'); return +x[2] + ' ' + M[+x[1] - 1] + (short ? '' : ' ' + x[0]);
    },
    money: function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' грн'; },
    esc: function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); },
    nights: function (a, b) { return Math.round((new Date(b) - new Date(a)) / 864e5); }
  };
})();
