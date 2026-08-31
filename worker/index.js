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
const RATE_LIMIT = 5;
const USER_RATE_LIMIT = 20;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const SESSION_TTL_SECONDS = 7 * 86400;
const rateLimits = new Map();
const MAX_EDIT_BYTES = 6 * 1024 * 1024;

function utcDateString(date) {
  return date.toISOString().slice(0, 10);
}

function secondsUntilUtcTomorrow() {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  ));
  return Math.max(60, Math.floor((tomorrow - now) / 1000));
}

// Route-level guardrails stay fail-closed; only explicit truthy strings disable the proxy.
async function assertPhotoGuardrails(origin, env) {
  const disabled = String(env.PHOTO_PROXY_DISABLED || '').trim().toLowerCase();
  if (disabled === '1' || disabled === 'true' || disabled === 'yes') {
    return jsonResponse(origin, { error: 'Photo generation is temporarily disabled.' }, 503);
  }
  if (!env.PHOTO_QUOTA) {
    return jsonResponse(origin, { error: 'Photo quota storage is unavailable.' }, 503);
  }

  return null;
}

// KV is a soft global cap: concurrent requests may slightly exceed it (accepted in G-06).
async function reservePhotoGlobalQuota(origin, env) {
  const key = 'daily:' + utcDateString(new Date());
  let count;
  try {
    const raw = await env.PHOTO_QUOTA.get(key);
    count = raw == null ? 0 : Number(raw);
    if (!Number.isFinite(count) || count < 0) count = 0;
    const configured = Number(env.PHOTO_GLOBAL_DAILY_LIMIT);
    const limit = Number.isFinite(configured) && configured > 0 ? configured : 50;
    if (count >= limit) {
      return jsonResponse(origin, { error: 'The site-wide daily photo quota has been reached.' }, 429);
    }
    await env.PHOTO_QUOTA.put(key, String(count + 1), { expirationTtl: secondsUntilUtcTomorrow() });
    return null;
  } catch {
    return jsonResponse(origin, { error: 'Photo quota storage is temporarily unavailable.' }, 503);
  }
}

function corsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

function isRateLimited(key, limit) {
  const now = Date.now();
  const entry = rateLimits.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}

function getSenseNovaApiKeys(env) {
  const values = [env.SN_API_KEY_1, env.SN_API_KEY_2, env.SN_API_KEY_3, env.SN_API_KEY];
  const keys = values.map(function (value) { return String(value || '').trim(); }).filter(Boolean);
  return [...new Set(keys)];
}

function pickSenseNovaKeyIndex(keys) {
  if (keys.length <= 1) return 0;
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  return random[0] % keys.length;
}

async function requestSenseNovaImage(origin, env, payload) {
  const keys = getSenseNovaApiKeys(env);
  if (!keys.length) {
    return jsonResponse(origin, { error: 'Image service is not configured.' }, 500);
  }

  // Worker isolates do not share module state, so use random rotation instead of a shared cursor.
  const startIndex = pickSenseNovaKeyIndex(keys);
  let upstream = null;
  let result = null;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const apiKey = keys[(startIndex + attempt) % keys.length];
    const endpoint = (env.SN_IMAGE_GEN_BASE_URL || 'https://token.sensenova.cn/v1') + '/images/generations';
    upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }).catch(function () { return null; });
    result = upstream ? await upstream.json().catch(function () { return null; }) : null;

    if (upstream && upstream.ok && result) {
      const imageUrl = result.data && result.data[0] && result.data[0].url;
      if (imageUrl) return jsonResponse(origin, { url: imageUrl });
      return jsonResponse(origin, { error: 'The model returned no image URL.' }, 502);
    }

    const retryable = !upstream || [401, 403, 408, 429, 500, 502, 503, 504].includes(upstream.status);
    if (!retryable || attempt === keys.length - 1) break;
  }

  const detail = result && result.error && (result.error.message || result.error.code);
  const status = upstream ? (upstream.status === 401 || upstream.status === 403 ? 502 : upstream.status) : 502;
  return jsonResponse(origin, { error: detail || ('Image service returned HTTP ' + status + '.') }, status);
}

/* ---- session tokens (HS256, mirrors geoscore-payments) ---- */

function base64Url(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value) {
  let base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

async function hmacSha256(message, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function signSession(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + SESSION_TTL_SECONDS };

  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = await hmacSha256(data, secret);
  return `${data}.${signature}`;
}

async function verifySession(token, secret) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expectedSignature = await hmacSha256(header + '.' + payload, secret);
  if (!constantTimeEqual(signature, expectedSignature)) return null;
  try {
    const decoded = JSON.parse(base64UrlDecode(payload));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch {
    return null;
  }
}

/* ---- Google sign-in ---- */

async function handleGoogleAuth(request, env, origin) {
  if (!env.GOOGLE_CLIENT_ID || !env.JWT_SECRET) {
    return jsonResponse(origin, { error: 'Sign-in is not configured.' }, 500);
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return jsonResponse(origin, { error: 'Invalid JSON body.' }, 400);
  }

  const idToken = typeof input.idToken === 'string' ? input.idToken : '';
  if (!idToken) {
    return jsonResponse(origin, { error: 'Missing idToken.' }, 400);
  }

  const googleResp = await fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken)
  ).catch(() => null);

  if (!googleResp || !googleResp.ok) {
    return jsonResponse(origin, { error: 'Invalid Google token.' }, 401);
  }

  const payload = await googleResp.json().catch(() => null);
  if (!payload || payload.aud !== env.GOOGLE_CLIENT_ID) {
    return jsonResponse(origin, { error: 'Token audience mismatch.' }, 401);
  }
  if (!payload.email || payload.email_verified === 'false' || payload.email_verified === false) {
    return jsonResponse(origin, { error: 'Google account email is not verified.' }, 401);
  }

  const token = await signSession(
    { uid: payload.sub, email: payload.email, name: payload.name || '' },
    env.JWT_SECRET
  );

  return jsonResponse(origin, {
    token,
    user: { email: payload.email, name: payload.name || '' }
  }, 200);
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

    if (request.method === 'POST' && url.pathname === '/auth/google') {
      return handleGoogleAuth(request, env, origin);
    }

    if (request.method === 'POST' && url.pathname === '/edit') {
      const guard = await assertPhotoGuardrails(origin, env);
      if (guard) return guard;
      return handleEdit(request, env, origin);
    }

    if (request.method !== 'POST' || url.pathname !== '/generate') {
      return jsonResponse(origin, { error: 'Not found.' }, 404);
    }

    const guard = await assertPhotoGuardrails(origin, env);
    if (guard) return guard;

    let session = null;
    const authHeader = request.headers.get('Authorization') || '';
    if (authHeader.startsWith('Bearer ') && env.JWT_SECRET) {
      session = await verifySession(authHeader.slice(7), env.JWT_SECRET);
    }

    let quotaKey;
    let quotaLimit;
    if (session && session.uid) {
      quotaKey = 'user:' + session.uid;
      quotaLimit = USER_RATE_LIMIT;
    } else {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      quotaKey = 'ip:' + ip;
      quotaLimit = RATE_LIMIT;
    }

    if (isRateLimited(quotaKey, quotaLimit)) {
      return jsonResponse(
        origin,
        { error: 'Daily free quota reached. Please try again later.' },
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

    const quota = await reservePhotoGlobalQuota(origin, env);
    if (quota) return quota;

    const payload = {
      model: 'sensenova-u1-fast',
      prompt,
      size,
      response_format: 'url',
      watermark: false,
      output_format: 'png'
    };
    if (seed !== undefined) payload.seed = seed;

    return requestSenseNovaImage(origin, env, payload);
  }
};
/* ---- Image editing (img2img via SenseNova U1.5 Lite) ---- */

async function handleEdit(request, env, origin) {
  const contentLength = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_EDIT_BYTES) {
    return jsonResponse(origin, { error: 'Image payload is too large.' }, 413);
  }

  let session = null;
  const authHeader = request.headers.get('Authorization') || '';
  if (authHeader.startsWith('Bearer ') && env.JWT_SECRET) {
    session = await verifySession(authHeader.slice(7), env.JWT_SECRET);
  }

  let quotaKey;
  let quotaLimit;
  if (session && session.uid) {
    quotaKey = 'user:' + session.uid;
    quotaLimit = USER_RATE_LIMIT;
  } else {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    quotaKey = 'ip:' + ip;
    quotaLimit = RATE_LIMIT;
  }

  if (isRateLimited(quotaKey, quotaLimit)) {
    return jsonResponse(origin, { error: 'Daily free quota reached. Please try again later.' }, 429);
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return jsonResponse(origin, { error: 'Invalid JSON body.' }, 400);
  }

  const image = typeof input.image === 'string' ? input.image : '';
  if (!(image.startsWith('data:image/') || image.startsWith('https://'))) {
    return jsonResponse(origin, { error: 'Provide a data URL or https image.' }, 400);
  }
  const prompt = typeof input.prompt === 'string' ? input.prompt.trim() : '';
  if (!prompt || prompt.length > 1000) {
    return jsonResponse(origin, { error: 'Prompt must be 1-1000 characters.' }, 400);
  }
  const size = input.size;
  if (size !== undefined && !ALLOWED_SIZES.has(size)) {
    return jsonResponse(origin, { error: 'Unsupported image size.' }, 400);
  }

  const quota = await reservePhotoGlobalQuota(origin, env);
  if (quota) return quota;

  const payload = {
    model: env.SN_EDIT_MODEL || 'sensenova-u1.5-lite',
    prompt: prompt,
    image: [image],
    response_format: 'url',
    watermark: false,
    output_format: 'png'
  };
  if (size !== undefined) payload.size = size;
  if (Number.isInteger(input.seed)) payload.seed = input.seed;

  return requestSenseNovaImage(origin, env, payload);
}

/* ---- Google sign-in ---- */
