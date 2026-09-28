/* TTCalc cookie consent
   ---------------------------------------------------------------------------
   Gates every non-essential third party behind an explicit opt-in. We run two:
     1. Adsterra ad frames  (iframe[data-ads-src])
     2. Google Analytics 4  (window.__ttcalcGA)
   Neither one is fetched until the visitor picks "Accept all". Choosing
   "Reject non-essential" costs them nothing: the calculators, the blog and the
   layout are all served from our own origin.

   Consequences of the gate, by design:
     - A rejected visitor sees no ad space at all rather than a blank 728x90
       box (.adsterra-slot ships hidden and only becomes visible once its
       frame gets a src).
     - With JavaScript disabled no consent can be recorded and no ad or
       analytics request is ever made.

   Load order matters: this file must run BEFORE i18n.js. The banner is
   injected by script, and i18n.js only captures [data-i18n] elements that
   already exist when it boots on DOMContentLoaded — so injecting first is what
   lets the Chinese dictionary reach the banner text.
   ------------------------------------------------------------------------- */
(function () {
  'use strict';

  var KEY = 'ttcalc_consent_v1';
  var state = null;
  var bar = null;

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }

  function persist(rec) {
    try { localStorage.setItem(KEY, JSON.stringify(rec)); } catch (e) {}
  }

  function loadAds() {
    var frames = document.querySelectorAll('iframe[data-ads-src]');
    for (var i = 0; i < frames.length; i++) {
      var src = frames[i].getAttribute('data-ads-src');
      if (src && !frames[i].getAttribute('src')) frames[i].setAttribute('src', src);
    }
    var slots = document.querySelectorAll('.adsterra-slot');
    for (var j = 0; j < slots.length; j++) slots[j].classList.add('adsterra-slot--live');
  }

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
    if (rec.ads) loadAds();
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
    el.innerHTML =
      '<div class="consent-inner">' +
        '<p class="consent-text">' +
          '<span data-i18n="consent.text">We use cookies from Adsterra for advertising and from Google for anonymous analytics. Nothing outside ttcalc.shop loads until you choose. The calculators work either way.</span> ' +
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
    var rec = { ads: accept, analytics: accept, ts: Date.now(), v: 1 };
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
    if (state && typeof state.ads === 'boolean') apply(state);
    else show();
  }

  window.ttcalcConsent = {
    get: function () { return state; },
    open: function () { show(); },
    clear: function () { try { localStorage.removeItem(KEY); } catch (e) {} state = null; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
