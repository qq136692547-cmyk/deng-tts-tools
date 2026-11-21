// Cloudflare Pages Function: /api/lead
// Captures seller lead emails, persists to LEADS_KV, and returns 200 JSON
const ALLOWED_ORIGINS = new Set([
  'https://ttcalc.shop',
  'https://www.ttcalc.shop',
  'https://ttcalc.pages.dev',
]);
const PREVIEW_ORIGIN_RE = /^https:\/\/[a-z0-9-]+\.ttcalc\.pages\.dev$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_BODY_BYTES = 2048;

function isAllowedOrigin(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.has(origin) || PREVIEW_ORIGIN_RE.test(origin);
}

function buildHeaders(origin) {
  const headers = {
    'Content-Type': 'application/json',
    'Vary': 'Origin'
  };
  if (origin && isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin');
  if (origin && !isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: 'origin not allowed' }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'Vary': 'Origin'
      }
    });
  }

  const headers = buildHeaders(origin);

  try {
    const contentLength = Number(context.request.headers.get('content-length') || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return new Response(JSON.stringify({ error: 'payload too large' }), {
        status: 413,
        headers
      });
    }

    const rawBody = await context.request.text();
    if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
      return new Response(JSON.stringify({ error: 'payload too large' }), {
        status: 413,
        headers
      });
    }

    let data;
    try {
      data = JSON.parse(rawBody || '{}');
    } catch {
      return new Response(JSON.stringify({ error: 'invalid json' }), {
        status: 400,
        headers
      });
    }

    const email = (typeof data.email === 'string' ? data.email : '').trim().toLowerCase();
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return new Response(JSON.stringify({ error: 'invalid email' }), {
        status: 400,
        headers
      });
    }

    if (!context.env || !context.env.LEADS_KV) {
      console.error('[CRITICAL] LEADS_KV binding is missing in Pages environment');
      return new Response(JSON.stringify({ error: 'storage unavailable' }), {
        status: 500,
        headers
      });
    }

    const payload = {
      email,
      tool: typeof data.tool === 'string' ? data.tool.slice(0, 200) : 'unknown',
      source: typeof data.source === 'string' ? data.source.slice(0, 64) : 'sheets_modal',
      ip: context.request.headers.get('cf-connecting-ip') || '',
      country: context.request.cf ? context.request.cf.country : '',
      city: context.request.cf ? context.request.cf.city : '',
      userAgent: context.request.headers.get('user-agent') || '',
      referer: context.request.headers.get('referer') || '',
      createdAt: new Date().toISOString()
    };

    const key = `lead:${Date.now()}:${encodeURIComponent(email)}`;
    await context.env.LEADS_KV.put(key, JSON.stringify(payload));

    return new Response(JSON.stringify({ success: true, message: 'lead saved' }), {
      status: 200,
      headers
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers
    });
  }
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('Origin');
  if (origin && !isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: 'origin not allowed' }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'Vary': 'Origin'
      }
    });
  }
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
  if (origin && isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return new Response(null, { status: 204, headers });
}
