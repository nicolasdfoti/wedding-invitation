// Lógica de notify-gift, separada de Deno.serve para poder testearla.
import { buildThankYouEmail, escapeHtml, type GiftInfo } from './thankyou.ts';

export { escapeHtml };

export type Reservation = {
  id: number;
  created_at: string;
  item_id: string;
  nombre: string;
  mensaje: string | null;
  forma: 'compra' | 'transferencia';
  estado: 'activa' | 'liberada';
  released_at: string | null;
  email?: string | null;
};

export type WebhookPayload = {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: Reservation | null;
  old_record: Reservation | null;
};

export type Evento = 'reserva' | 'liberada';

export type Mail = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type Deps = {
  env: (key: string) => string | undefined;
  fetch: typeof fetch;
  // Envío por SMTP (Gmail). Lo arma index.ts con nodemailer; en los tests es un mock.
  smtpSend?: (mail: Mail) => Promise<void>;
};

const TIME_ZONE = 'America/Argentina/Buenos_Aires';
const DEFAULT_FROM = 'Lista de Regalos <onboarding@resend.dev>';

const FORMAS: Record<string, string> = {
  compra: 'Lo compro',
  transferencia: 'Transfiero el valor',
};

export function classify(payload: WebhookPayload): Evento | null {
  const { type, table, record, old_record } = payload ?? {};
  if (table !== 'gift_reservations' || !record) return null;
  if (type === 'INSERT' && record.estado === 'activa') return 'reserva';
  if (type === 'UPDATE' && old_record?.estado === 'activa' && record.estado === 'liberada') return 'liberada';
  return null;
}

export function formatDateAR(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function parseRecipients(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
}

const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

export function buildEmail(
  evento: Evento,
  r: Reservation,
  item: { item: string; categoria: string },
): { subject: string; html: string; text: string } {
  const titles: Record<Evento, string> = {
    reserva: `🎁 Nuevo regalo reservado: ${item.item} — de ${r.nombre}`,
    liberada: `↩️ Reserva liberada: ${item.item} — de ${r.nombre}`,
  };
  const intros: Record<Evento, string> = {
    reserva: 'Alguien reservó un regalo de la lista.',
    liberada: 'Alguien liberó una reserva: el regalo vuelve a estar disponible.',
  };
  const when = formatDateAR(evento === 'liberada' ? r.released_at ?? new Date().toISOString() : r.created_at);

  const rows: [string, string][] = [
    ['Ítem', item.item],
    ['Categoría', item.categoria],
    ['De', r.nombre],
    ['Forma', FORMAS[r.forma] ?? r.forma],
    ['Mensaje', r.mensaje?.trim() || '(sin mensaje)'],
    ...(r.email ? ([['Mail', r.email]] as [string, string][]) : []),
    [evento === 'liberada' ? 'Liberada el' : 'Fecha', `${when} (hora de Argentina)`],
  ];

  const subject = oneLine(titles[evento]);
  const text = [intros[evento], '', ...rows.map(([k, v]) => `${k}: ${v}`)].join('\n');
  const html = `<!doctype html>
<html lang="es"><body style="margin:0;padding:24px;background:#FAF9F6;font-family:Arial,Helvetica,sans-serif;color:#374151">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:24px;padding:28px;border:1px solid #f3f4f6">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#FA9C5F;font-weight:bold">Lista de regalos</p>
    <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:normal;font-size:24px;color:#374151">${escapeHtml(subject)}</h1>
    <p style="margin:0 0 20px;font-size:14px">${escapeHtml(intros[evento])}</p>
    <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:8px 12px 8px 0;color:#6b7280;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:8px 0;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
        )
        .join('\n      ')}
    </table>
  </div>
</body></html>`;

  return { subject, html, text };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function serviceHeaders(key: string): Record<string, string> {
  const headers: Record<string, string> = { apikey: key, 'Content-Type': 'application/json' };
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
  return headers;
}

async function getItem(deps: Deps, itemId: string): Promise<GiftInfo> {
  const fallback: GiftInfo = { item: itemId, categoria: '—' };
  const url = deps.env('SUPABASE_URL');
  const key = deps.env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return fallback;
  try {
    const res = await deps.fetch(
      `${url}/rest/v1/gift_items?id=eq.${encodeURIComponent(itemId)}&select=item,categoria,detalle,precio,link1,link2`,
      { headers: serviceHeaders(key) },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const [row] = await res.json();
    return row ?? fallback;
  } catch (error) {
    console.error('notify-gift: no se pudo leer el ítem', itemId, error);
    return fallback;
  }
}

async function logResult(deps: Deps, reservationId: number, evento: string, ok: boolean, error?: string) {
  const url = deps.env('SUPABASE_URL');
  const key = deps.env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return;
  try {
    await deps.fetch(`${url}/rest/v1/gift_email_log`, {
      method: 'POST',
      headers: { ...serviceHeaders(key), Prefer: 'return=minimal' },
      body: JSON.stringify({ reservation_id: reservationId, evento, ok, error: error?.slice(0, 1000) ?? null }),
    });
  } catch (e) {
    console.error('notify-gift: no se pudo escribir gift_email_log', e);
  }
}

// ─── Envío: Gmail (SMTP) si está configurado; si no, Resend ────────────────
export type Provider = 'gmail' | 'resend';

export function mailProvider(env: Deps['env']): Provider | null {
  if (env('GMAIL_USER') && env('GMAIL_APP_PASSWORD')) return 'gmail';
  if (env('RESEND_API_KEY')) return 'resend';
  return null;
}

export function senderFor(env: Deps['env'], provider: Provider, displayName: string): string {
  if (provider === 'gmail') return `"${displayName}" <${env('GMAIL_USER')!.trim()}>`;
  return env('FROM_EMAIL') || DEFAULT_FROM;
}

async function sendMail(deps: Deps, provider: Provider, mail: Mail): Promise<void> {
  if (provider === 'gmail') {
    if (!deps.smtpSend) throw new Error('SMTP no disponible');
    await deps.smtpSend(mail);
    return;
  }
  const res = await deps.fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${deps.env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: mail.from,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Resend HTTP ${res.status}: ${(await res.text()).slice(0, 500)}`);
}

// Manda un mail y lo registra en gift_email_log. Nunca tira: devuelve si salió.
async function deliver(
  deps: Deps,
  reservationId: number,
  evento: string,
  build: () => Mail,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const provider = mailProvider(deps.env);
    if (!provider) throw new Error('Faltan los secrets: GMAIL_USER + GMAIL_APP_PASSWORD (o RESEND_API_KEY)');
    const mail = build();
    await sendMail(deps, provider, mail);
    await logResult(deps, reservationId, evento, true);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`notify-gift: falló el mail (${evento}, reserva ${reservationId}):`, message);
    await logResult(deps, reservationId, evento, false, message);
    return { ok: false, error: message };
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Explica en los Logs de la función por qué rechazamos el webhook (sin mostrar secretos).
function unauthorizedReason(secret: string, provided: string): string {
  if (!secret) return 'falta el secret WEBHOOK_SECRET en Supabase (npx supabase secrets set WEBHOOK_SECRET=...)';
  if (!provided) return 'el webhook no manda el header x-webhook-secret (Database → Webhooks → HTTP Headers)';
  return `el header x-webhook-secret no coincide con WEBHOOK_SECRET (largo recibido ${provided.length}, esperado ${secret.length}). Revisá espacios o comillas de más.`;
}

// Siempre responde 200 salvo auth/método: si un mail falla, se registra y listo
// (la reserva ya está guardada y no queremos reintentos que manden mails repetidos).
export async function handle(req: Request, deps: Deps): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const secret = (deps.env('WEBHOOK_SECRET') ?? '').trim();
  const provided = (req.headers.get('x-webhook-secret') ?? '').trim();
  if (!secret || !timingSafeEqual(provided, secret)) {
    console.warn(`notify-gift: webhook rechazado (401): ${unauthorizedReason(secret, provided)}`);
    return json({ error: 'unauthorized' }, 401);
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const evento = classify(payload);
  if (!evento) return json({ ok: true, skipped: true });
  const record = payload.record as Reservation;
  const provider = mailProvider(deps.env);
  const item = await getItem(deps, record.item_id);

  // 1) Aviso para ustedes.
  const aviso = await deliver(deps, record.id, evento, () => {
    const to = parseRecipients(deps.env('NOTIFY_EMAIL'));
    if (to.length === 0) throw new Error('Falta el secret NOTIFY_EMAIL');
    return {
      from: senderFor(deps.env, provider!, 'Lista de regalos'),
      to,
      replyTo: record.email ?? undefined,
      ...buildEmail(evento, record, item),
    };
  });

  // 2) Agradecimiento para quien reservó (sólo al reservar y si dejó su mail).
  let gracias: { ok: boolean; error?: string } | null = null;
  const guestEmail = record.email ? parseRecipients(record.email) : [];
  if (evento === 'reserva' && guestEmail.length > 0) {
    gracias = await deliver(deps, record.id, 'gracias', () => {
      if (provider === 'resend' && !deps.env('FROM_EMAIL')) {
        throw new Error(
          'El remitente de prueba de Resend sólo manda a tu propio mail: configurá Gmail (GMAIL_USER + GMAIL_APP_PASSWORD) para el agradecimiento',
        );
      }
      const replyTo = parseRecipients(deps.env('NOTIFY_EMAIL'))[0];
      return {
        from: senderFor(deps.env, provider!, 'Sofy & Nico'),
        to: guestEmail,
        replyTo,
        ...buildThankYouEmail({ nombre: record.nombre, forma: record.forma }, item),
      };
    });
  }

  const ok = aviso.ok && (gracias?.ok ?? true);
  return json({
    ok,
    evento,
    aviso: aviso.ok,
    gracias: gracias ? gracias.ok : 'skipped',
    ...(ok ? {} : { error: 'email_failed' }),
  });
}
