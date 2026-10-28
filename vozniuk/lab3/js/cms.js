/* ==========================================================
   Міні-CMS «Ліхтар»: сховище контенту
   DEFAULT_CONTENT (js/content.js) + перекриття з localStorage
   ========================================================== */
(function () {
  "use strict";
  var KEY = "lx_cms_content_v1";
  var MSG = "lx_cms_messages_v1";
  var LOG = "lx_cms_log_v1";
  var REG = "lx_cms_bookings_v1";

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function read(key, def) {
    try { var s = localStorage.getItem(key); return s ? JSON.parse(s) : def; } catch (e) { return def; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
  }

  function load() {
    var c = clone(window.DEFAULT_CONTENT || {});
    var saved = read(KEY, null);
    if (saved && typeof saved === "object") {
      Object.keys(saved).forEach(function (k) {
        if (saved[k] && typeof saved[k] === "object" && !Array.isArray(saved[k]) && c[k] && !Array.isArray(c[k])) {
          // об'єкти зливаємо поле за полем — нові дефолтні поля не губляться
          Object.keys(saved[k]).forEach(function (kk) { c[k][kk] = saved[k][kk]; });
        } else {
          c[k] = saved[k];
        }
      });
    }
    return c;
  }

  function save(content) { return write(KEY, content); }
  function isModified() { return read(KEY, null) !== null; }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} }

  function uid(prefix) { return (prefix || "id") + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }

  function log(text, icon) {
    var l = read(LOG, []);
    l.unshift({ t: new Date().toISOString(), text: text, icon: icon || "edit" });
    write(LOG, l.slice(0, 40));
  }

  window.CMS = {
    load: load,
    save: save,
    reset: reset,
    isModified: isModified,
    uid: uid,
    log: log,
    getLog: function () { return read(LOG, []); },
    clearLog: function () { write(LOG, []); },
    getMessages: function () { return read(MSG, []); },
    setMessages: function (m) { return write(MSG, m); },
    addMessage: function (m) {
      var list = read(MSG, []);
      m.id = uid("msg"); m.t = new Date().toISOString(); m.read = false;
      list.unshift(m);
      write(MSG, list);
      return m;
    },
    getRegs: function () { return read(REG, []); },
    setRegs: function (r) { return write(REG, r); },
    addReg: function (r) {
      var list = read(REG, []);
      r.id = uid("reg"); r.t = new Date().toISOString();
      list.unshift(r);
      write(REG, list);
      return r;
    },
    KEY: KEY
  };
})();
