/* ttcalc.shop service worker - minimal and content-first.
 *
 * Strategies:
 *   - navigations (HTML) and site JS: network-first, cache only as the
 *     offline fallback. Rates and page content must be current; the cache
 *     exists so a dead connection still renders something usable.
 *   - other same-origin static assets (css/images/fonts/manifest):
 *     stale-while-revalidate - serve instantly, refresh in the background.
 *   - never touched: cross-origin requests (Adsterra frames, analytics),
 *     /ads/ sandbox frames, non-GET, embed views.
 */

var VERSION = 'v2026-10-08';
var RUNTIME = 'ttcalc-rt-' + VERSION;

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(RUNTIME).then(function (cache) {
    // Tolerant precache: one missing asset must not fail the install.
    // translations.js is intentionally absent (195 KB, network-first anyway).
    return Promise.allSettled([
      '/assets/css/site.css',
      '/assets/js/rates.js',
      '/assets/js/fbt-rates.js'
    ].map(function (u) { return cache.add(u); }));
  }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys
        .filter(function (k) { return k.indexOf('ttcalc-') === 0 && k !== RUNTIME; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  if (url.origin !== location.origin) return;        // Adsterra / GA: untouched
  if (url.pathname.indexOf('/ads/') === 0) return;   // ad frames: never cached
  if (url.search.indexOf('embed=1') !== -1) return;  // widget views: untouched

  var isNav = req.mode === 'navigate';
  var isSiteJs = url.pathname.indexOf('/assets/js/') === 0;

  if (isNav || isSiteJs) {
    e.respondWith(
      fetch(req).then(function (resp) {
        if (resp && resp.ok) {
          var copy = resp.clone();
          caches.open(RUNTIME).then(function (c) { c.put(req, copy); });
        }
        return resp;
      }).catch(function () {
        return caches.match(req).then(function (hit) { return hit || Response.error(); });
      })
    );
    return;
  }

  var isStatic = url.pathname.indexOf('/assets/') === 0 ||
                 url.pathname === '/manifest.webmanifest';
  if (isStatic) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        var refresh = fetch(req).then(function (resp) {
          if (resp && resp.ok) {
            var copy = resp.clone();
            caches.open(RUNTIME).then(function (c) { c.put(req, copy); });
          }
          return resp;
        }).catch(function () { return hit; });
        return hit || refresh;
      })
    );
  }
});
