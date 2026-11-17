// Vercel Cron (ver vercel.json → "crons"): una consulta diaria a Supabase para que
// el proyecto gratis no se pause por inactividad antes de la boda.
// Usa las mismas variables que la página (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
export default async function handler(req, res) {
  // Si definen CRON_SECRET en Vercel, Vercel lo manda solo como "Bearer …" y
  // nadie más puede disparar esta URL.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return res.status(500).json({ ok: false, error: 'Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY' });
  }

  const headers = { apikey: key, 'Content-Type': 'application/json' };
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;

  try {
    const response = await fetch(`${url}/rest/v1/rpc/get_gifts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ p_tokens: [] }),
    });
    if (!response.ok) throw new Error(`Supabase HTTP ${response.status}`);
    const gifts = await response.json();
    return res.status(200).json({ ok: true, items: gifts.length, at: new Date().toISOString() });
  } catch (error) {
    console.error('keepalive:', error);
    return res.status(502).json({ ok: false, error: String(error.message ?? error) });
  }
}
