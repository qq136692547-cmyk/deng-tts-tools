// ux.js — deng/fbatools shared UX
// Copy results + hero stats count-up + scroll reveal + FAQ accordion
(function () {
  'use strict';

  // ---- Copy all calc-result-rows ----
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  function doCopy(btn) {
    var results = btn.closest('.calc-results');
    if (!results) return;
    var rows = results.querySelectorAll('.calc-result-row');
    var lines = [];
    rows.forEach(function (r) {
      var l = r.querySelector('.lbl'), v = r.querySelector('.val');
      if (!l || !v) {
        var spans = r.querySelectorAll('span');
        if (spans.length >= 2) { l = spans[0]; v = spans[1]; }
      }
      var lt = l ? l.textContent.trim() : '', vt = v ? v.textContent.trim() : '';
      if (lt || vt) lines.push(lt + '\t' + vt);
    });
    var text = lines.join('\n');
    var done = function () {
      if (window.ttcalcTrackEvent) window.ttcalcTrackEvent('copy_results');
      var orig = btn.textContent;
      btn.textContent = '\u2713 Copied';
      btn.classList.add('copied');
      setTimeout(function () { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.copy-results-btn, [data-copy-results]');
    if (btn) { e.preventDefault(); doCopy(btn); }
  });

  // Deep-conversion interest in the rate changelog (our moat asset).
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href*="/rate-updates/"]') : null;
    if (link && window.ttcalcTrackEvent) window.ttcalcTrackEvent('rate_updates_click');
  });

  // C1: never show a silent $0.00 stack - warn when the sale price is empty or zero.
  function initSaleGuard() {
    var input = document.getElementById('salePrice') || document.getElementById('sale');
    var panel = document.querySelector('.calc-results');
    if (!input || !panel) return;
    var warn = document.createElement('p');
    warn.className = 'calc-warning';
    warn.textContent = 'Enter a sale price to see fees.';
    warn.style.display = 'none';
    var head = panel.querySelector('.calc-results-head');
    if (head && head.nextSibling) { panel.insertBefore(warn, head.nextSibling); }
    else { panel.insertBefore(warn, panel.firstChild); }
    function check() {
      var v = parseFloat(input.value);
      var empty = input.value.trim() === '' || isNaN(v) || v <= 0;
      warn.style.display = empty ? '' : 'none';
    }
    input.addEventListener('input', check);
    input.addEventListener('change', check);
    check();
    // workspace.js fills inputs from the URL after this point; re-check once.
    setTimeout(check, 350);
  }

  // ---- Hero stats count-up ----
  function animateCount(el, target, duration) {
    var start = 0;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(start + (target - start) * eased);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  function initCountUp() {
    var stats = document.querySelectorAll('.hero-stat .n[data-count]');
    if (!stats.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-count'), 10);
          if (!isNaN(target) && target > 0) {
            animateCount(el, target, 1200);
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    stats.forEach(function (s) { observer.observe(s); });
  }

  // ---- Scroll-triggered reveal ----
  function initScrollReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { observer.observe(el); });
  }

  // ---- FAQ accordion smooth height animation ----
  function initFaqAccordion() {
    var faqContainers = document.querySelectorAll('.faq, .faq-v3');
    faqContainers.forEach(function (faq) {
      var answers = faq.querySelectorAll('details > .answer, details > p');
      answers.forEach(function (answer) {
        if (answer.parentElement.querySelector('.faq-animate')) return;
        var wrapper = document.createElement('div');
        wrapper.className = 'faq-animate';
        answer.parentNode.insertBefore(wrapper, answer);
        wrapper.appendChild(answer);
      });
    });
  }

  // ---- Cross-site funnel ----
  // ---- Field names that mean the same thing on different tool pages ----
  // Shared with workspace.js so saved products expand the same way links do.
  // Allow-list only: anything not listed here is dropped, which keeps utm_*
  // (used by crossSource) and the product-photo API key out of the next URL.
  window.TTCALC_CARRY_GROUPS = [
    ['salePrice', 'sale'],
    ['creatorRate', 'creator'],
    ['cogs'], ['category'], ['fbtTier'], ['fbtUnits'],
    ['returnRate'], ['returnHandlingFee'], ['resellRate'],
    ['ship'], ['shipAmz'], ['shipTts'],
    ['ads'], ['adsAmz'], ['adsTts'],
    ['roas'], ['monthlyUnits'], ['inboundShip'], ['storageFee'],
    ['amzFulfillRate'], ['amzRefRate'], ['amzPlacement'], ['amzLowInv'], ['amzFuelPct']
  ];
  var CARRY_GROUPS = window.TTCALC_CARRY_GROUPS;

  function carrySearch() {
    var fromUrl = new URLSearchParams(location.search);
    var out = new URLSearchParams();
    CARRY_GROUPS.forEach(function (group) {
      var value = null;
      for (var i = 0; i < group.length; i++) {
        var el = document.getElementById(group[i]);
        if (el && el.value !== '') { value = el.value; break; }
        if (fromUrl.get(group[i]) !== null) { value = fromUrl.get(group[i]); break; }
      }
      if (value === null) return;
      group.forEach(function (name) { out.set(name, value); });
    });
    var qs = out.toString();
    return qs ? '?' + qs : '';
  }

  function syncNextstepLinks() {
    var nav = document.querySelector('.nextstep');
    if (!nav) return;
    var suffix = carrySearch();
    nav.querySelectorAll('a.nextstep-card[href]').forEach(function (a) {
      a.setAttribute('href', a.getAttribute('href').split('?')[0] + suffix);
    });
  }

  // Refresh on click so a link reflects the inputs as they are at that moment.
  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest
      ? event.target.closest('a.nextstep-card[href]') : null;
    if (link) syncNextstepLinks();
  }, true);

  function crossSource() {
    try {
      var params = new URLSearchParams(location.search);
      var source = (params.get('utm_source') || '').toLowerCase();
      var medium = (params.get('utm_medium') || '').toLowerCase();
      if (source === 'geoscore' && medium === 'site') return 'cross_site';
      if (source) return 'external';
      var ref = document.referrer;
      if (!ref) return 'direct';
      var host = new URL(ref).hostname.toLowerCase();
      if (/(^|\.)(google|bing|baidu|duckduckgo|yandex|ecosia|startpage|brave)\.[a-z.]+$/.test(host)) return 'search';
      return 'external';
    } catch (e) {
      return 'other';
    }
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[data-cross-site]');
    if (!link || typeof window.gtag !== 'function') return;
    window.gtag('event', 'cross_site_click', {
      target_site: link.getAttribute('data-cross-site'),
      source_type: crossSource()
    });
  });

  window.ttcalcTrackEvent = function (name, params) {
    if (typeof window.gtag !== 'function') return;
    var payload = Object.assign({ source_type: crossSource() }, params || {});
    window.gtag('event', name, payload);
  };

  var calculatorTimers = {};
  window.ttcalcTrackCalculator = function (calculatorName) {
    if (!calculatorName) return;
    if (calculatorTimers[calculatorName]) clearTimeout(calculatorTimers[calculatorName]);
    calculatorTimers[calculatorName] = setTimeout(function () {
      window.ttcalcTrackEvent('calculator_computed', { calculator_name: calculatorName });
      delete calculatorTimers[calculatorName];
    }, 900);
  };

  // ---- Init on DOMContentLoaded ----
  function init() {
    initCountUp();
    initScrollReveal();
    initFaqAccordion();
    initSaleGuard();
    // Next frame: workspace.js loads after ux.js and fills inputs from the
    // URL, so reading values synchronously here would capture the defaults.
    requestAnimationFrame(syncNextstepLinks);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
