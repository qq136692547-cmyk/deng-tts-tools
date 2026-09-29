// www.ttcalc.shop -> https://ttcalc.shop (301, preserves path + query)
//
// Why here: the domain's DNS is hosted at the registrar (xincache.com), so
// ttcalc.shop is not a Cloudflare zone and Redirect Rules cannot apply.
// Both hosts CNAME into this Pages project, so this middleware is the only
// layer that sees the original host. Apex requests pass through untouched.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === 'www.ttcalc.shop') {
    url.hostname = 'ttcalc.shop';
    return Response.redirect(url.href, 301);
  }
  return context.next();
}
