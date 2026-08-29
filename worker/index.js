const ALLOWED_ORIGINS = new Set([
  'https://ttcalc.shop',
  'https://www.ttcalc.shop'
]);
const ALLOWED_SIZES = new Set([
  '1664x2496', '2496x1664', '1760x2368', '2368x1760',
  '1824x2272', '2272x1824', '2048x2048', '2752x1536',
  '1536x2752', '3072x1376', '1344x3136', '2560x720',
  '3072x864'
]);
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const rateLimits = new Map();

function corsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };

  if (ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

function jsonResponse(origin, body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimits.get(ip);

  if (!entry || entry.resetAt <= now) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    if (!ALLOWED_ORIGINS.has(origin)) {
      return jsonResponse(origin, { error: 'Origin not allowed.' }, 403);
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== 'POST' || url.pathname !== '/generate') {
      return jsonResponse(origin, { error: 'Not found.' }, 404);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (isRateLimited(ip)) {
      return jsonResponse(
        origin,
        { error: 'Free quota reached for this hour. Please try again later.' },
        429
      );
    }

    let input;
    try {
      input = await request.json();
    } catch (error) {
      return jsonResponse(origin, { error: 'Invalid JSON body.' }, 400);
    }

    const prompt = typeof input.prompt === 'string' ? input.prompt.trim() : '';
    const size = input.size;
    const seed = Number.isInteger(input.seed) ? input.seed : undefined;

    if (!prompt || prompt.length > 1000) {
      return jsonResponse(origin, { error: 'Prompt must be 1-1000 characters.' }, 400);
    }
    if (!ALLOWED_SIZES.has(size)) {
      return jsonResponse(origin, { error: 'Unsupported image size.' }, 400);
    }
    if (!env.SN_API_KEY) {
      return jsonResponse(origin, { error: 'Image service is not configured.' }, 500);
    }

    const payload = {
      model: 'sensenova-u1-fast',
      prompt,
      size,
      response_format: 'url',
      watermark: false,
      output_format: 'png'
    };
    if (seed !== undefined) payload.seed = seed;

    const endpoint = (env.SN_IMAGE_GEN_BASE_URL || 'https://token.sensenova.cn/v1') +
      '/images/generations';
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.SN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const result = await upstream.json().catch(() => null);

    if (!upstream.ok || !result) {
      const detail = result && result.error && (result.error.message || result.error.code);
      return jsonResponse(
        origin,
        { error: detail || ('Image service returned HTTP ' + upstream.status + '.') },
        upstream.status === 401 || upstream.status === 403 ? 502 : upstream.status
      );
    }

    const imageUrl = result.data && result.data[0] && result.data[0].url;
    if (!imageUrl) {
      return jsonResponse(origin, { error: 'The model returned no image URL.' }, 502);
    }

    return jsonResponse(origin, { url: imageUrl });
  }
};
