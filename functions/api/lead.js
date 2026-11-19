// Cloudflare Pages Function: /api/lead
// Captures seller lead emails, persists to LEADS_KV, and returns 200 JSON
export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const email = (data.email || '').trim().toLowerCase();
    if (!email || !email.includes('@') || email.length > 254) {
      return new Response(JSON.stringify({ error: 'invalid email' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (!context.env || !context.env.LEADS_KV) {
      console.error('[CRITICAL] LEADS_KV binding is missing in Pages environment');
      return new Response(JSON.stringify({ error: 'storage unavailable' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const payload = {
      email,
      tool: data.tool || 'unknown',
      source: data.source || 'sheets_modal',
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
