// Two jobs, both of which have to happen on the server.
//
// 1. www.ttcalc.shop -> https://ttcalc.shop (301, preserves path + query)
//    The domain's DNS is hosted at the registrar (xincache.com), so ttcalc.shop
//    is not a Cloudflare zone and Redirect Rules cannot apply. Both hosts CNAME
//    into this Pages project, so this middleware is the only layer that sees the
//    original host. Apex requests pass through untouched.
//
// 2. Stamp the consent model onto <html data-consent-region="...">.
//    Why server-side: the region has to be derived from the request IP, and it
//    must be known before consent.js runs. Inferring it in the browser (timezone,
//    language) fails in the direction that carries legal risk — a European
//    visitor misread as American would get ad frames loaded without consent.
//
//    Region values:
//      "strict" — opt-in. No third-party request until the visitor accepts.
//      "row"    — told-first (opt-out). Ad frames load by default; rejecting
//                 removes them immediately. Analytics stays opt-in in both.
//
// Opt-out is a WHITELIST, deliberately. Leaving a country out costs a little ad
// revenue; wrongly including one costs a GDPR violation. So everything unlisted
// defaults to "strict": the whole EEA (27 + IS/LI/NO), the UK, Switzerland, and
// every case where the country cannot be determined at all.
// GB is absent on purpose — UK GDPR still requires opt-in.

const OPTOUT_COUNTRIES = new Set([
  // North America
  'US', 'CA', 'MX',
  // South America
  'BR',
  // Oceania
  'AU', 'NZ',
  // Southeast Asia
  'SG', 'MY', 'TH', 'VN', 'PH', 'ID',
  // East Asia
  'JP', 'KR', 'HK', 'TW',
]);

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === 'www.ttcalc.shop') {
    url.hostname = 'ttcalc.shop';
    return Response.redirect(url.href, 301);
  }

  const res = await context.next();

  // Only HTML is rewritten. CSS, JS, fonts, images, ads.txt and the ad frames
  // are returned the moment they arrive, so the middleware costs nothing there.
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return res;

  let country = '';
  try {
    country = (context.request.cf && context.request.cf.country) || '';
  } catch (e) {
    country = '';
  }
  const region = OPTOUT_COUNTRIES.has(country) ? 'row' : 'strict';

  // Diagnostic hatch: ?__consent_probe=1 echoes the detected country back to the
  // caller, so it can be confirmed that request.cf is really populated on this
  // project (ttcalc.shop is not a Cloudflare zone, so it is worth checking rather
  // than assuming). It tells the caller nothing they do not already send.
  const probe = url.searchParams.get('__consent_probe') === '1';

  return new HTMLRewriter()
    .on('html', {
      element(el) {
        el.setAttribute('data-consent-region', region);
        if (probe) el.setAttribute('data-cf-country', country || 'unknown');
      },
    })
    .transform(res);
}
