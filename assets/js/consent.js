/* TTCalc cookie consent
   ---------------------------------------------------------------------------
   Two third parties are gated, under two different models depending on region.
   The region arrives as <html data-consent-region>, stamped by
   functions/_middleware.js from the request IP — see that file for why the
   decision cannot be made in the browser.

     1. Adsterra ad frames  (iframe[data-ads-src])
     2. Google Analytics 4  (window.__ttcalcGA)

   region="strict"  EEA, UK, CH, and anything undetermined
     Opt-in. Neither one is requested until the visitor picks "Accept all".
   region="row"  US, CA, MX, BR, AU, NZ, and much of Asia (whitelist in the
     middleware)
     Told-first for ads: frames load by default, and "Reject non-essential"
     removes them again. Analytics stays opt-in here — it earns nothing and is
     the more sensitive of the two, so there is no reason to widen it.

   Why the split: ad revenue only exists if an ad is actually shown, and in
   opt-out regions the law asks for notice plus an easy refusal rather than
   prior consent. In opt-in regions it asks for prior consent, so those
   visitors keep the strict path.

   Consequences by design:
     - A visitor who rejects — or, in strict regions, has not chosen yet — sees
       no ad space at all rather than a blank 728x90 box (.adsterra-slot ships
       hidden and only becomes visible once its frame gets a src).
     - With JavaScript disabled no choice can be recorded. In strict regions
       that also means no ad or analytics request is ever made.

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

  function loadAds() {
    // Embed mode (?embed=1) hides the ad slots and the banner through CSS
    // (.embed-mode), so loading frames there would fire ad requests that can
    // never be seen: no impression for the advertiser, no revenue for us.
    if (document.documentElement.classList.contains('embed-mode')) return;
    var frames = document.querySelectorAll('iframe[data-ads-src]');
    for (var i = 0; i < frames.length; i++) {
      var src = frames[i].getAttribute('data-ads-src');
      if (src && !frames[i].getAttribute('src')) frames[i].setAttribute('src', src);
    }
    var slots = document.querySelectorAll('.adsterra-slot');
    for (var j = 0; j < slots.length; j++) slots[j].classList.add('adsterra-slot--live');
  }

  // Dropping the src tears a frame down, which stops whatever the ad script
  // inside it was doing. This is what makes "reject" a real refusal rather than
  // a promise about the future: in opt-out regions the frames are already live
  // before the visitor has chosen anything.
  function unloadAds() {
    var frames = document.querySelectorAll('iframe[data-ads-src]');
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].getAttribute('src')) frames[i].removeAttribute('src');
    }
    var slots = document.querySelectorAll('.adsterra-slot');
    for (var j = 0; j < slots.length; j++) slots[j].classList.remove('adsterra-slot--live');
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
    if (rec.ads) loadAds(); else unloadAds();
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
    var text = row
      ? 'Adsterra ads are on by default here to keep these calculators free. Google Analytics stays off unless you accept. You can turn the ads off at any time.'
      : 'We use cookies from Adsterra for advertising and from Google for anonymous analytics. Nothing outside ttcalc.shop loads until you choose. The calculators work either way.';
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
    if (state && typeof state.ads === 'boolean') { apply(state); return; }
    // No stored choice yet. In opt-out regions the ads start now and the banner
    // serves as the notice, with reject able to take them back down. Everywhere
    // else the banner is the gate it has always been.
    if (region() === 'row') loadAds();
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
