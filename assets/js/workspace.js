// ttcalc workspace: auto-save inputs, pinned product cards, shareable links
(function () {
  'use strict';
  var KEY = 'ttcalc.workspace.v1';
  var PAGE = location.pathname.replace(/^\/+|\/+$/g, '');
  var getEl = function (s) { return document.getElementById(s); };

  function fieldEls() {
    var out = [];
    var section = document.querySelector('.calc-inputs');
    if (!section) return out;
    section.querySelectorAll('input, select').forEach(function (el) {
      if (el.type === 'button' || el.type === 'submit' || el.type === 'hidden' || !el.id) return;
      out.push(el);
    });
    return out;
  }

  function collectState() {
    var s = {};
    fieldEls().forEach(function (el) { s[el.id] = el.value; });
    return s;
  }

  function applyState(s, dispatch) {
    // A product saved on another tool page uses that page's field names, so
    // expand each synonym group before filling inputs. Groups live in ux.js.
    var groups = window.TTCALC_CARRY_GROUPS || [];
    groups.forEach(function (group) {
      for (var i = 0; i < group.length; i++) {
        if (s[group[i]] === undefined) continue;
        for (var j = 0; j < group.length; j++) s[group[j]] = s[group[i]];
        break;
      }
    });
    fieldEls().forEach(function (el) {
      if (s[el.id] !== undefined && el.value !== String(s[el.id])) {
        el.value = String(s[el.id]);
        if (dispatch) el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }

  function loadStore() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      if (v && typeof v === 'object') return v;
    } catch (e) {}
    return { products: [] };
  }

  function saveStore(store) {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
  }

  function optText(id, val) {
    var sel = getEl(id);
    if (!sel || !val) return null;
    var o = sel.querySelector('option[value="' + val + '"]');
    return o ? o.textContent.trim() : null;
  }

  function defaultName(s) {
    var parts = [];
    var price = s.salePrice || s.sale;
    if (price) parts.push('$' + price);
    var tier = optText('fbtTier', s.fbtTier);
    if (tier) parts.push(tier);
    var units = optText('fbtUnits', s.fbtUnits);
    if (units && units.indexOf('1 unit') !== 0) parts.push(units);
    var cat = optText('category', s.category);
    if (cat && cat.indexOf('%') >= 0) parts.push(cat);
    if (!parts.length) parts.push('Saved calculation');
    return parts.join(' \u00b7 ');
  }

  function products() {
    var store = loadStore();
    if (!Array.isArray(store.products)) store.products = [];
    return store;
  }

  // Saved products are global: one product is visible on every tool page.
  // Older records predate productId, so fall back to id.
  function productId(p) { return p.productId || p.id; }

  function fromLabel(page) {
    var seg = String(page || '').split('/').pop().replace(/^tiktok-/, '');
    if (!seg) return '';
    return seg.replace(/[-_]/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function render() {
    var list = getEl('wsList');
    if (!list) return;
    var store = products();
    var mine = store.products.slice();
    if (!mine.length) {
      list.innerHTML = '<span class="ws-empty">Save current inputs to pin a product. Your inputs also auto-save on this device.</span>';
      return;
    }
    list.innerHTML = '';
    mine.forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ws-card';
      btn.setAttribute('data-id', productId(p));
      var from = p.page && p.page !== PAGE ? fromLabel(p.page) : '';
      btn.title = from
        ? 'From ' + from + ' \u00b7 only matching fields load here'
        : 'Load this product';
      var name = document.createElement('span');
      name.className = 'ws-name';
      name.textContent = p.name || defaultName(p.state);
      var del = document.createElement('span');
      del.className = 'ws-del';
      del.setAttribute('data-del', p.id);
      del.setAttribute('role', 'button');
      del.setAttribute('aria-label', 'Delete product');
      del.textContent = '\u00d7';
      btn.appendChild(name);
      btn.appendChild(del);
      list.appendChild(btn);
    });
  }

  function flash(btn, label) {
    if (!btn) return;
    var orig = btn.textContent;
    btn.textContent = label + ' \u2713';
    btn.classList.add('copied');
    setTimeout(function () { btn.textContent = orig; btn.classList.remove('copied'); }, 1800);
  }

  function saveCurrent() {
    var nameInput = getEl('wsName');
    var name = nameInput ? nameInput.value.trim() : '';
    var state = collectState();
    var store = products();
    var idx = -1;
    for (var i = 0; i < store.products.length; i++) {
      if (JSON.stringify(store.products[i].state) === JSON.stringify(state)) { idx = i; break; }
    }
    if (idx >= 0) {
      store.products[idx].savedAt = Date.now();
      if (name) store.products[idx].name = name;
    } else {
      var pid = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      store.products.unshift({
        id: pid,
        productId: pid,
        page: PAGE,
        name: name || defaultName(state),
        state: state,
        savedAt: Date.now()
      });
    }
    saveStore(store);
    store.last = store.last || {};
    store.last[PAGE] = state;
    render();

    flash(getEl('wsSave'), 'Saved');
  }

  function loadProduct(id) {
    var store = products();
    var p = null;
    store.products.forEach(function (x) { if (productId(x) === id) p = x; });
    if (!p) return;
    applyState(p.state, true);
    var nameInput = getEl('wsName');
    if (nameInput) nameInput.value = p.name || '';
  }

  function removeProduct(id) {
    var store = products();
    var next = [];
    store.products.forEach(function (x) { if (productId(x) !== id) next.push(x); });
    store.products = next;
    saveStore(store);
    render();
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  function copyLink(btn) {
    var p = new URLSearchParams();
    fieldEls().forEach(function (el) { p.set(el.id, el.value); });
    var url = location.origin + location.pathname + '?' + p.toString();
    var done = function () { flash(btn, 'Copied'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(function () { fallbackCopy(url); done(); });
    } else {
      fallbackCopy(url);
      done();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!getEl('wsList')) return; // not a tool page
    var hasParams = location.search.length > 1;
    if (hasParams) {
      var params = new URLSearchParams(location.search);
      var changed = false;
      fieldEls().forEach(function (el) {
        var v = params.get(el.id);
        if (v !== null && el.value !== v) { el.value = v; changed = true; }
      });
      if (changed) {
        fieldEls().forEach(function (el) { el.dispatchEvent(new Event('input', { bubbles: true })); });
      }
    } else {
      var store = products();
      var last = store.last && store.last[PAGE];
      if (last) applyState(last, true);
    }
    render();

    window.addEventListener('pagehide', function () {
      if (!hasParams) {
        var st2 = products();
        st2.last = st2.last || {};
        st2.last[PAGE] = collectState();
        saveStore(st2);
      }
    });

    var saveBtn = getEl('wsSave');
    if (saveBtn) saveBtn.addEventListener('click', saveCurrent);
    var linkBtn = getEl('wsLink');
    if (linkBtn) linkBtn.addEventListener('click', function () { copyLink(linkBtn); });

    document.addEventListener('click', function (e) {
      var target = e.target;
      var del = target.closest ? target.closest('[data-del]') : null;
      if (del) {
        e.stopPropagation();
        e.preventDefault();
        removeProduct(del.getAttribute('data-del'));
        return;
      }
      var card = target.closest ? target.closest('.ws-card') : null;
      if (card) loadProduct(card.getAttribute('data-id'));
    });

    if (!hasParams) {
      var inputsArea = document.querySelector('.calc-inputs');
      if (inputsArea) {
        var timer = null;
        inputsArea.addEventListener('input', function () {
          clearTimeout(timer);
          timer = setTimeout(function () {
            var st = products();
            st.last = st.last || {};
            st.last[PAGE] = collectState();
            saveStore(st);
          }, 400);
        });
      }
    }
  });
})();
