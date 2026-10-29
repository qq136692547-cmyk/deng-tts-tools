/* TTCalc Cookie Consent & Analytics Opt-In
   ---------------------------------------------------------------------------
   TTCalc is 100% ad-free. Financial calculations run strictly in your local
   browser. This script manages anonymous Google Analytics 4 (GA4) consent
   strictly under an opt-in model.
   ------------------------------------------------------------------------- */
(function () {
  'use strict';

  var KEY = 'ttcalc_consent_v1';
  var state = null;
  var bar = null;

  // 'row' only when the server explicitly said so. Anything else — including a
  // missing attribute, which would mean the middleware did not run — is treated
  // as 'strict', so a failure here can only lose revenue, never consent.
  function region() {
    var el = document.documentElement;
    return (el && el.getAttribute('data-consent-region') === 'row') ? 'row' : 'strict';
  }

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }

  function persist(rec) {
    try { localStorage.setItem(KEY, JSON.stringify(rec)); } catch (e) {}
  }

  function loadAds() {}

  function unloadAds() {}

  function loadAnalytics() {
    var id = window.__ttcalcGA;
    if (!id || window.__ttcalcGAReady) return;
    window.__ttcalcGAReady = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true });
  }

  function apply(rec) {
    if (!rec) return;
    // 100% ad-free - no ad network frames to load
    // loadAnalytics() reads __ttcalcGA inside, so calling it unconditionally
    // would fire GA on every page even with no id — the guard below is the point.
    if (rec.analytics) loadAnalytics();
  }

  function show() {
    if (!bar) return;
    bar.classList.add('is-open');
    document.documentElement.classList.add('consent-open');
  }

  function hide() {
    if (!bar) return;
    bar.classList.remove('is-open');
    document.documentElement.classList.remove('consent-open');
  }

  function build() {
    var el = document.createElement('div');
    el.className = 'consent-bar';
    el.id = 'consent-bar';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Cookie consent');
    // Wording has to match what actually happened. In opt-out regions the ads
    // are already on the page by the time this is read, so reusing the opt-in
    // sentence there would put a false statement in a consent notice.
    var row = region() === 'row';
    var textKey = row ? 'consent.textRow' : 'consent.text';
    var text = 'We use cookies strictly for anonymous traffic analytics to improve calculator reliability. 100% ad-free, 100% in-browser calculation — your product pricing & margins never leave your device.';
    el.innerHTML =
      '<div class="consent-inner">' +
        '<p class="consent-text">' +
          '<span data-i18n="' + textKey + '">' + text + '</span> ' +
          '<a href="/privacy/" data-i18n="consent.privacy">Privacy Policy</a>' +
        '</p>' +
        '<div class="consent-actions">' +
          '<button type="button" class="consent-btn consent-btn--ghost" data-consent="reject" data-i18n="consent.reject">Reject non-essential</button>' +
          '<button type="button" class="consent-btn consent-btn--solid" data-consent="accept" data-i18n="consent.accept">Accept all</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    return el;
  }

  function choose(value) {
    var accept = value === 'accept';
    var hadAnalytics = !!(state && state.analytics === true);
    var rec = { ads: false, analytics: accept, ts: Date.now(), v: 2 };
    persist(rec);
    apply(rec);
    state = rec;
    hide();
    // GA4 cannot be un-loaded once its script has run, so switching from accept
    // to reject needs a reload to actually stop collection.
    if (!accept && hadAnalytics) window.location.reload();
  }

  function init() {
    bar = build();
    bar.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-consent]');
      if (btn) choose(btn.getAttribute('data-consent'));
    });

    // Footer "Cookie settings" reopens the banner with the current choice intact.
    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-consent-open]');
      if (!trigger) return;
      event.preventDefault();
      show();
    });

    state = read();
    if (state && typeof state.ads === 'boolean') { apply(state); return; }
    // No stored choice yet. In opt-out regions the ads start now and the banner
    // serves as the notice, with reject able to take them back down. Everywhere
    // else the banner is the gate it has always been.
    // Zero ads: no frames to load
    show();
  }

  window.ttcalcConsent = {
    get: function () { return state; },
    open: function () { show(); },
    clear: function () { try { localStorage.removeItem(KEY); } catch (e) {} state = null; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
