// ux.js — deng/fbatools shared UX
// Copy results + subscribe mock + hero stats count-up + scroll reveal + FAQ accordion
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

  // ---- Subscribe form mock ----
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('.subscribe-form');
    if (!form) return;
    e.preventDefault();
    var email = form.querySelector('input[type=email]');
    if (!email || !email.value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
      if (email) { email.focus(); email.style.borderColor = '#F87171'; }
      return;
    }
    var wrap = form.closest('.subscribe-wrap');
    if (wrap) wrap.classList.add('done');
  });

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

  // ---- Init on DOMContentLoaded ----
  function init() {
    initCountUp();
    initScrollReveal();
    initFaqAccordion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
