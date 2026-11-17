import {
  buildEmail,
  classify,
  escapeHtml,
  formatDateAR,
  handle,
  mailProvider,
  parseRecipients,
  type Mail,
  type Reservation,
} from './lib.ts';
import { buildThankYouEmail, firstName } from './thankyou.ts';

function assertEquals(actual: unknown, expected: unknown, msg = '') {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg}\n  esperado: ${e}\n  obtenido: ${a}`);
}
function assert(cond: unknown, msg = 'assertion failed') {
  if (!cond) throw new Error(msg);
}

const base: Reservation = {
  id: 7,
  created_at: '2026-11-16T23:30:00+00:00',
  item_id: 'R-001',
  nombre: 'Juan Pérez',
  mensaje: '¡Felicidades! <3',
  forma: 'compra',
  estado: 'activa',
  released_at: null,
};
const payload = (type: string, record: Partial<Reservation> | null, old: Partial<Reservation> | null = null) => ({
  type,
  table: 'gift_reservations',
  schema: 'public',
  record: record && { ...base, ...record },
  old_record: old && { ...base, ...old },
});

Deno.test('classify', () => {
  assertEquals(classify(payload('INSERT', {}) as never), 'reserva');
  assertEquals(classify(payload('UPDATE', { estado: 'liberada' }, { estado: 'activa' }) as never), 'liberada');
  assertEquals(classify(payload('UPDATE', { estado: 'activa' }, { estado: 'activa' }) as never), null);
  assertEquals(classify(payload('DELETE', null, {}) as never), null);
  assertEquals(classify({ ...payload('INSERT', {}), table: 'rsvp' } as never), null);
});

Deno.test('escapeHtml', () => {
  assertEquals(escapeHtml(`<script>"x" & 'y'</script>`), '&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;');
});

Deno.test('formatDateAR usa la hora de Argentina (UTC-3)', () => {
  const out = formatDateAR('2026-11-16T23:30:00Z');
  assert(out.includes('20:30'), out);
  assert(out.includes('16'), out);
});

Deno.test('parseRecipients', () => {
  assertEquals(parseRecipients(' a@b.com, ,sofy@x.com.ar,nope '), ['a@b.com', 'sofy@x.com.ar']);
  assertEquals(parseRecipients(undefined), []);
});

Deno.test('buildEmail: reserva', () => {
  const email = buildEmail('reserva', base, { item: 'Microondas', categoria: 'Cocina' });
  assertEquals(email.subject, '🎁 Nuevo regalo reservado: Microondas — de Juan Pérez');
  assert(email.text.includes('Forma: Lo compro'));
  assert(email.text.includes('Categoría: Cocina'));
  assert(email.text.includes('20:30'), email.text);
  assert(email.html.includes('¡Felicidades! &lt;3'));
  assert(!email.html.includes('<3'));
});

Deno.test('buildEmail: liberada y transferencia', () => {
  const r = { ...base, forma: 'transferencia' as const, estado: 'liberada' as const, released_at: '2026-11-17T12:00:00Z', mensaje: null };
  const email = buildEmail('liberada', r, { item: 'Microondas', categoria: 'Cocina' });
  assertEquals(email.subject, '↩️ Reserva liberada: Microondas — de Juan Pérez');
  assert(email.text.includes('Forma: Transfiero el valor'));
  assert(email.text.includes('(sin mensaje)'));
  assert(email.text.includes('09:00'), email.text);
});

type Call = { url: string; init?: RequestInit };
const ITEM = {
  item: 'Microondas',
  categoria: 'Cocina',
  detalle: '20-25 L',
  precio: 189999,
  link1: 'https://www.mercadolibre.com.ar/microondas/p/MLA1',
  link2: 'https://www.fravega.com/p/microondas-2',
};
function makeDeps(resendOk: boolean, env: Record<string, string> = {}, smtp: { fail?: boolean } = {}) {
  const calls: Call[] = [];
  const smtpCalls: Mail[] = [];
  const allEnv: Record<string, string> = {
    WEBHOOK_SECRET: 's3cret',
    RESEND_API_KEY: 're_test',
    NOTIFY_EMAIL: 'nico@example.com',
    SUPABASE_URL: 'https://proj.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'eyJservice',
    ...env,
  };
  const fakeFetch = (async (url: string, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    if (String(url).includes('/gift_items')) return new Response(JSON.stringify([ITEM]));
    if (String(url).includes('resend.com')) return new Response(resendOk ? '{"id":"1"}' : '{"message":"boom"}', { status: resendOk ? 200 : 500 });
    return new Response('', { status: 201 });
  }) as typeof fetch;
  const smtpSend = async (mail: Mail) => {
    smtpCalls.push(mail);
    if (smtp.fail) throw new Error('Invalid login: 535 Username and Password not accepted');
  };
  return { calls, smtpCalls, deps: { env: (k: string) => allEnv[k], fetch: fakeFetch, smtpSend } };
}
const req = (body: unknown, secret = 's3cret') =>
  new Request('http://localhost/notify-gift', {
    method: 'POST',
    headers: { 'x-webhook-secret': secret, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

Deno.test('handle: 401 con secreto incorrecto', async () => {
  const { deps, calls } = makeDeps(true);
  const res = await handle(req(payload('INSERT', {}), 'mal'), deps);
  assertEquals(res.status, 401);
  assertEquals(calls.length, 0);
});

Deno.test('handle: manda el mail y lo registra', async () => {
  const { deps, calls } = makeDeps(true);
  const res = await handle(req(payload('INSERT', {})), deps);
  assertEquals(res.status, 200);
  const resend = calls.find((c) => c.url.includes('resend.com'))!;
  const body = JSON.parse(String(resend.init!.body));
  assertEquals(body.to, ['nico@example.com']);
  assertEquals(body.from, 'Lista de Regalos <onboarding@resend.dev>');
  assertEquals(body.subject, '🎁 Nuevo regalo reservado: Microondas — de Juan Pérez');
  const log = calls.find((c) => c.url.endsWith('/gift_email_log'))!;
  assertEquals(JSON.parse(String(log.init!.body)).ok, true);
});

Deno.test('handle: si Resend falla responde 200 y registra el error', async () => {
  const { deps, calls } = makeDeps(false);
  const res = await handle(req(payload('UPDATE', { estado: 'liberada', released_at: '2026-11-17T12:00:00Z' }, { estado: 'activa' })), deps);
  assertEquals(res.status, 200);
  assertEquals((await res.json()).ok, false);
  const log = JSON.parse(String(calls.find((c) => c.url.endsWith('/gift_email_log'))!.init!.body));
  assertEquals(log.ok, false);
  assertEquals(log.evento, 'liberada');
  assert(log.error.includes('Resend HTTP 500'), log.error);
});

Deno.test('handle: ignora eventos que no corresponden', async () => {
  const { deps, calls } = makeDeps(true);
  const res = await handle(req(payload('UPDATE', { estado: 'activa' }, { estado: 'activa' })), deps);
  assertEquals((await res.json()).skipped, true);
  assertEquals(calls.length, 0);
});

Deno.test('handle: varios destinatarios (para sumar a Sofy)', async () => {
  const { deps, calls } = makeDeps(true, { NOTIFY_EMAIL: 'nico@example.com,sofy@example.com' });
  await handle(req(payload('INSERT', { forma: 'transferencia' })), deps);
  const body = JSON.parse(String(calls.find((c) => c.url.includes('resend.com'))!.init!.body));
  assertEquals(body.to, ['nico@example.com', 'sofy@example.com']);
  assert(body.text.includes('Forma: Transfiero el valor'));
});

// ─── Gmail + agradecimiento ────────────────────────────────────────────────
const GMAIL = { GMAIL_USER: 'sofyynico@gmail.com', GMAIL_APP_PASSWORD: 'abcd efgh ijkl mnop' };
const logs = (calls: Call[]) =>
  calls.filter((c) => c.url.endsWith('/gift_email_log')).map((c) => JSON.parse(String(c.init!.body)));

Deno.test('mailProvider: Gmail tiene prioridad sobre Resend', () => {
  const env = (o: Record<string, string>) => (k: string) => o[k];
  assertEquals(mailProvider(env({ ...GMAIL, RESEND_API_KEY: 're_x' })), 'gmail');
  assertEquals(mailProvider(env({ RESEND_API_KEY: 're_x' })), 'resend');
  assertEquals(mailProvider(env({ GMAIL_USER: 'a@b.com' })), null);
});

Deno.test('firstName', () => {
  assertEquals(firstName('  Juan   Pérez '), 'Juan');
});

Deno.test('buildThankYouEmail: compra con links de tiendas', () => {
  const email = buildThankYouEmail({ nombre: 'Juan <b>Pérez</b>', forma: 'compra' }, ITEM);
  assertEquals(email.subject, '💛 ¡Gracias por tu regalo, Juan!');
  assert(email.html.includes('Ver en Mercado Libre'), 'falta Mercado Libre');
  assert(email.html.includes('Ver en Frávega'), 'falta Frávega');
  assert(email.html.includes('https://www.mercadolibre.com.ar/microondas/p/MLA1'));
  assert(!email.html.includes('<b>'), 'no escapó el nombre');
  assert(!email.html.includes('0170039840000034645646'), 'no debería mostrar cuentas en compra');
  assert(email.text.includes('Ver en Frávega: https://www.fravega.com/p/microondas-2'), email.text);
  assert(email.html.includes('Sofy &amp; Nico'));
  assert(email.html.includes('nos vamos a acordar de vos'), 'falta el mensaje de cierre');
  assert(email.text.includes('nos vamos a acordar de vos'), 'falta el cierre en texto plano');
});

Deno.test('buildThankYouEmail: transferencia muestra monto y cuentas', () => {
  const email = buildThankYouEmail({ nombre: 'Ana', forma: 'transferencia' }, ITEM);
  assert(email.html.includes('0170039840000034645646'), 'falta CBU');
  assert(email.html.includes('0000003100035561508263'), 'falta CVU');
  assert(email.html.includes('Titular: Nicolás Foti'));
  assert(/189\.999/.test(email.html), 'falta el precio');
  assert(!email.html.includes('Ver en Mercado Libre'));
  assert(email.text.includes('Alias: nicolasfoti'), email.text);
});

Deno.test('buildThankYouEmail: sin links ni precio', () => {
  const email = buildThankYouEmail({ nombre: 'Ana', forma: 'compra' }, { item: 'Tostadora', categoria: 'Cocina' });
  assert(email.html.includes('donde te quede más cómodo'));
  assert(!email.html.includes('referencia'));
});

Deno.test('handle (Gmail): aviso + agradecimiento al reservar con mail', async () => {
  const { deps, calls, smtpCalls } = makeDeps(true, GMAIL);
  const res = await handle(req(payload('INSERT', { email: 'juan@example.com' })), deps);
  const body = await res.json();
  assertEquals([res.status, body.ok, body.aviso, body.gracias], [200, true, true, true]);
  assertEquals(smtpCalls.length, 2);
  const [aviso, gracias] = smtpCalls;
  assertEquals(aviso.to, ['nico@example.com']);
  assertEquals(aviso.from, '"Lista de regalos" <sofyynico@gmail.com>');
  assertEquals(aviso.replyTo, 'juan@example.com');
  assert(aviso.text.includes('Mail: juan@example.com'));
  assertEquals(gracias.to, ['juan@example.com']);
  assertEquals(gracias.from, '"Sofy & Nico" <sofyynico@gmail.com>');
  assertEquals(gracias.replyTo, 'nico@example.com');
  assertEquals(gracias.subject, '💛 ¡Gracias por tu regalo, Juan!');
  assertEquals(logs(calls).map((l) => [l.evento, l.ok]), [['reserva', true], ['gracias', true]]);
  assert(!calls.some((c) => c.url.includes('resend.com')), 'no debería usar Resend');
});

Deno.test('handle (Gmail): sin mail no manda agradecimiento', async () => {
  const { deps, smtpCalls } = makeDeps(true, GMAIL);
  const body = await (await handle(req(payload('INSERT', { email: null })), deps)).json();
  assertEquals(body.gracias, 'skipped');
  assertEquals(smtpCalls.length, 1);
});

Deno.test('handle (Gmail): al liberar no le escribe al invitado', async () => {
  const { deps, smtpCalls } = makeDeps(true, GMAIL);
  await handle(
    req(payload('UPDATE', { estado: 'liberada', email: 'juan@example.com', released_at: '2026-11-17T12:00:00Z' }, { estado: 'activa' })),
    deps,
  );
  assertEquals(smtpCalls.map((m) => m.to), [['nico@example.com']]);
});

Deno.test('handle (Gmail): si SMTP falla responde 200 y registra ambos errores', async () => {
  const { deps, calls } = makeDeps(true, GMAIL, { fail: true });
  const res = await handle(req(payload('INSERT', { email: 'juan@example.com' })), deps);
  assertEquals(res.status, 200);
  assertEquals((await res.json()).ok, false);
  const l = logs(calls);
  assertEquals(l.map((x) => [x.evento, x.ok]), [['reserva', false], ['gracias', false]]);
  assert(l[0].error.includes('535'), l[0].error);
});

Deno.test('handle (Resend de prueba): agradecimiento se registra como no enviado', async () => {
  const { deps, calls } = makeDeps(true);
  const body = await (await handle(req(payload('INSERT', { email: 'juan@example.com' })), deps)).json();
  assertEquals([body.aviso, body.gracias], [true, false]);
  const sent = calls.filter((c) => c.url.includes('resend.com'));
  assertEquals(sent.length, 1);
  const g = logs(calls).find((x) => x.evento === 'gracias');
  assert(g.error.includes('configurá Gmail'), g.error);
});

Deno.test('handle: 401 explica el motivo en los logs', async () => {
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (...args: unknown[]) => warnings.push(args.join(' '));
  try {
    await handle(req(payload('INSERT', {}), 'xacagddczlgbpxtjjmtg'), makeDeps(true).deps);
    await handle(
      new Request('http://localhost/', { method: 'POST', body: '{}' }),
      makeDeps(true).deps,
    );
    await handle(req(payload('INSERT', {})), makeDeps(true, { WEBHOOK_SECRET: '' }).deps);
  } finally {
    console.warn = original;
  }
  assert(warnings[0].includes('no coincide') && warnings[0].includes('20'), warnings[0]);
  assert(!warnings[0].includes('xacagddczlgbpxtjjmtg'), 'no debe loguear el valor');
  assert(warnings[1].includes('no manda el header'), warnings[1]);
  assert(warnings[2].includes('falta el secret WEBHOOK_SECRET'), warnings[2]);
});

Deno.test('handle: el secreto tolera espacios alrededor', async () => {
  const { deps } = makeDeps(true);
  const res = await handle(req(payload('INSERT', {}), '  s3cret '), deps);
  assertEquals(res.status, 200);
});
