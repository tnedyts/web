/* «Вертикаль» — сховище CMS: дефолт із content.js + перекриття з localStorage */
(function () {
  'use strict';
  var KEY = 'vertykal_cms_v1', MSG = 'vertykal_msgs_v1', VIEWS = 'vertykal_views_v1', LOG = 'vertykal_log_v1';
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function read(k, def) {
    try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; }
  }
  function write(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; }
  }
  function merge(base, over) {
    if (!over || typeof over !== 'object' || Array.isArray(over)) return over === undefined ? base : over;
    var out = Array.isArray(base) ? [] : Object.assign({}, base);
    Object.keys(over).forEach(function (k) {
      var b = base ? base[k] : undefined, o = over[k];
      out[k] = (b && typeof b === 'object' && !Array.isArray(b) && o && typeof o === 'object' && !Array.isArray(o)) ? merge(b, o) : o;
    });
    return out;
  }
  var CMS = {
    get: function () {
      var def = clone(window.VERT_DEFAULT || {});
      var over = read(KEY, null);
      return over ? merge(def, over) : def;
    },
    save: function (data) {
      return write(KEY, data);
    },
    isCustom: function () { return !!read(KEY, null); },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} CMS.log('Контент скинуто до стандартного'); },
    messages: function () { return read(MSG, []); },
    addMessage: function (m) { var l = read(MSG, []); m.id = 'm' + Date.now(); m.date = new Date().toISOString(); m.read = false; l.unshift(m); write(MSG, l); },
    setMessages: function (l) { write(MSG, l); },
    trackView: function (page) {
      var v = read(VIEWS, {}); var d = new Date().toISOString().slice(0, 10);
      v[page] = (v[page] || 0) + 1; v._days = v._days || {}; v._days[d] = (v._days[d] || 0) + 1; write(VIEWS, v);
    },
    views: function () { return read(VIEWS, {}); },
    log: function (text) { var l = read(LOG, []); l.unshift({ t: new Date().toISOString(), text: text }); write(LOG, l.slice(0, 30)); },
    logs: function () { return read(LOG, []); },
    esc: function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); },
    months: ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'],
    monthsNom: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'],
    fmtDate: function (iso) { var p = String(iso).split('-'); if (p.length < 3) return iso; return (+p[2]) + ' ' + CMS.months[+p[1] - 1] + ' ' + p[0]; }
  };
  window.CMS = CMS;
})();
