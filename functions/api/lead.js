// Cloudflare Pages Function: /api/lead
// Captures seller lead emails, persists to LEADS_KV if bound, and returns 200 JSON
export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const email = (data.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'invalid email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const payload = {
      email,
      tool: data.tool || 'unknown',
      source: data.source || 'sheets_modal',
      ip: context.request.headers.get('cf-connecting-ip') || '',
      country: context.request.cf ? context.request.cf.country : '',
      createdAt: new Date().toISOString()
    };

    if (context.env && context.env.LEADS_KV) {
      const key = `lead:${Date.now()}:${encodeURIComponent(email)}`;
      await context.env.LEADS_KV.put(key, JSON.stringify(payload));
    }

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
      headers: { 'Content-Type': 'application/json' }
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
