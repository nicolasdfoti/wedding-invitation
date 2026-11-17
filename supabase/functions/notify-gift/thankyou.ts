// Mail de agradecimiento para quien reserva un regalo (si dejó su mail).
// Diseño para clientes de mail: tablas, estilos inline y sin imágenes externas.
import couple from '../_shared/couple.json' with { type: 'json' };
import { buyLinks } from '../_shared/stores.js';

export type GiftInfo = {
  item: string;
  categoria: string;
  detalle?: string | null;
  precio?: number | null;
  link1?: string | null;
  link2?: string | null;
};

export type Guest = {
  nombre: string;
  forma: 'compra' | 'transferencia';
};

type Account = { bank: string; alias?: string; cbu?: string; cvu?: string };
type Contact = { name: string; phone: string; display: string };

const C = {
  bg: '#FAF9F6',
  card: '#FFFFFF',
  line: '#EFEAE2',
  text: '#374151',
  soft: '#6B7280',
  accent: '#FA9C5F',
  gold: '#FFDE77',
  well: '#FBF7F1',
};
const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const SANS = "Montserrat, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'SFMono-Regular', Menlo, Consolas, monospace";

const ars = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function firstName(nombre: string): string {
  return nombre.trim().split(/\s+/)[0] || nombre.trim();
}

const waLink = (phone: string, text: string) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

function accountRows(account: Account): [string, string][] {
  const rows: [string, string][] = [];
  if (account.alias) rows.push(['Alias', account.alias]);
  if (account.cbu) rows.push(['CBU', account.cbu]);
  if (account.cvu) rows.push(['CVU', account.cvu]);
  return rows;
}

function buttonHtml(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px"><tr>
    <td style="border-radius:999px;background:${C.accent}">
      <a href="${escapeHtml(href)}" target="_blank" rel="noopener" style="display:inline-block;padding:12px 26px;font-family:${SANS};font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:999px">${escapeHtml(label)}</a>
    </td></tr></table>`;
}

export function buildThankYouEmail(
  guest: Guest,
  gift: GiftInfo,
): { subject: string; html: string; text: string } {
  const name = firstName(guest.nombre);
  const accounts = couple.accounts as Account[];
  const contacts = couple.contacts as Contact[];
  const isTransfer = guest.forma === 'transferencia';
  const links = isTransfer ? [] : (buyLinks(gift) as { url: string; label: string }[]);
  const price = typeof gift.precio === 'number' && gift.precio > 0 ? ars.format(gift.precio) : null;
  const waText = `Hola! Soy ${guest.nombre}, reservé "${gift.item}" de la lista de regalos 🎁`;

  const subject = `💛 ¡Gracias por tu regalo, ${name}!`.replace(/[\r\n]+/g, ' ');

  const intro = isTransfer
    ? `Nos emociona muchísimo que quieras acompañarnos en este comienzo. Reservamos <strong>${escapeHtml(gift.item)}</strong> a tu nombre, y te dejamos acá los datos para transferir cuando quieras.`
    : `Nos emociona muchísimo que quieras acompañarnos en este comienzo. Reservamos <strong>${escapeHtml(gift.item)}</strong> a tu nombre: ya nadie más lo puede elegir.`;

  // ── Bloque del regalo ────────────────────────────────────────────────
  let giftDetails = '';
  if (isTransfer) {
    giftDetails = `
      ${price ? `<p style="margin:0 0 16px;font-family:${SANS};font-size:14px;color:${C.soft}">Valor de referencia: <span style="color:${C.text};font-weight:600">${escapeHtml(price)}</span></p>` : ''}
      ${accounts
        .map(
          (a) => `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px;background:${C.card};border:1px solid ${C.line};border-radius:14px">
        <tr><td style="padding:16px 18px">
          <p style="margin:0;font-family:${SERIF};font-size:21px;color:${C.text}">${escapeHtml(a.bank)}</p>
          <p style="margin:2px 0 10px;font-family:${SANS};font-size:12px;color:${C.soft}">Titular: ${escapeHtml(couple.holder)}</p>
          ${accountRows(a)
            .map(
              ([k, v]) =>
                `<p style="margin:0 0 4px;font-family:${SANS};font-size:13px;color:${C.soft}">${k}: <span style="font-family:${MONO};font-size:14px;color:${C.text};letter-spacing:0.3px">${escapeHtml(v)}</span></p>`,
            )
            .join('')}
        </td></tr>
      </table>`,
        )
        .join('')}`;
  } else if (links.length > 0) {
    giftDetails = `
      <p style="margin:0 0 14px;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.soft}">Si todavía no lo compraste, estos son los links que elegimos. Son orientativos: podés comprarlo donde te quede más cómodo.</p>
      ${links.map((l) => buttonHtml(l.url, l.label)).join('')}
      ${price ? `<p style="margin:6px 0 0;font-family:${SANS};font-size:12px;color:${C.soft}">Precio de referencia: ${escapeHtml(price)}</p>` : ''}`;
  } else {
    giftDetails = `
      <p style="margin:0;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.soft}">Podés comprarlo donde te quede más cómodo${price ? ` (precio de referencia: ${escapeHtml(price)})` : ''}.</p>`;
  }

  const delivery = isTransfer
    ? 'Si tenés cualquier duda, escribinos:'
    : 'Podés traerlo el día de la fiesta o escribirnos para coordinar la entrega:';

  // Mensaje de cierre: se edita en supabase/functions/_shared/couple.json → "thankYouNote".
  // Un salto de línea (\n) en el texto arma un párrafo nuevo.
  const note = String(couple.thankYouNote ?? '').trim();
  const noteHtml = note
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 10px;font-family:${SERIF};font-style:italic;font-size:21px;line-height:1.45;color:${C.text}">${escapeHtml(p)}</p>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${C.bg};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">Reservamos ${escapeHtml(gift.item)} a tu nombre. ¡Gracias por ser parte!</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg}">
  <tr><td align="center" style="padding:32px 14px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${C.card};border:1px solid ${C.line};border-radius:28px">
      <tr><td style="padding:40px 32px 12px" align="center">
        <p style="margin:0;font-family:${SERIF};font-style:italic;font-size:18px;color:${C.soft}">${escapeHtml(couple.names)}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:14px auto 0"><tr><td style="width:56px;height:2px;background:${C.gold};font-size:0;line-height:0">&nbsp;</td></tr></table>
        <h1 style="margin:22px 0 0;font-family:${SERIF};font-weight:500;font-size:42px;line-height:1.1;color:${C.text}">¡Gracias, ${escapeHtml(name)}!</h1>
      </td></tr>

      <tr><td style="padding:12px 32px 8px">
        <p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.7;color:${C.text}">${intro}</p>
      </td></tr>

      <tr><td style="padding:20px 32px 8px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.well};border-radius:20px">
          <tr><td style="padding:22px 22px 18px">
            <p style="margin:0;font-family:${SANS};font-size:12px;color:${C.soft}">${escapeHtml(gift.categoria)}</p>
            <p style="margin:2px 0 ${gift.detalle ? '2px' : '16px'};font-family:${SERIF};font-size:28px;line-height:1.2;color:${C.text}">${escapeHtml(gift.item)}</p>
            ${gift.detalle ? `<p style="margin:0 0 16px;font-family:${SANS};font-size:13px;color:${C.soft}">${escapeHtml(gift.detalle)}</p>` : ''}
            ${giftDetails}
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:20px 32px 4px">
        <p style="margin:0 0 8px;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.text}">${delivery}</p>
        <p style="margin:0;font-family:${SANS};font-size:14px;line-height:2">
          ${contacts
            .map(
              (c) =>
                `<a href="${escapeHtml(waLink(c.phone, waText))}" target="_blank" rel="noopener" style="color:${C.text};text-decoration:underline;text-decoration-color:${C.accent};text-underline-offset:4px">WhatsApp de ${escapeHtml(c.name)}</a> <span style="color:${C.soft}">(${escapeHtml(c.display)})</span>`,
            )
            .join('<br>')}
        </p>
      </td></tr>

      ${
        noteHtml
          ? `<tr><td style="padding:28px 32px 0" align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 22px"><tr><td style="width:56px;height:2px;background:${C.gold};font-size:0;line-height:0">&nbsp;</td></tr></table>
        ${noteHtml}
      </td></tr>`
          : ''
      }

      <tr><td style="padding:${noteHtml ? '12px' : '28px'} 32px 40px" align="center">
        <p style="margin:0;font-family:${SERIF};font-style:italic;font-size:20px;color:${C.soft}">Con amor,</p>
        <p style="margin:2px 0 0;font-family:${SERIF};font-size:34px;color:${C.text}">${escapeHtml(couple.names)}</p>
        <p style="margin:6px 0 0;font-family:${SANS};font-size:12px;color:${C.soft}">${escapeHtml(couple.weddingDateLabel)}</p>
      </td></tr>
    </table>

    <p style="max-width:520px;margin:20px auto 0;font-family:${SANS};font-size:11px;line-height:1.6;color:${C.soft};text-align:center">
      Te llegó este mail porque reservaste un regalo en la <a href="${escapeHtml(couple.giftsUrl)}" style="color:${C.soft}">lista de ${escapeHtml(couple.names)}</a>.
      Si fue un error, respondé este mail y lo liberamos.
    </p>
  </td></tr>
</table>
</body>
</html>`;

  const textLines = [
    `¡Gracias, ${name}!`,
    '',
    isTransfer
      ? `Reservamos "${gift.item}" a tu nombre. Estos son los datos para transferir cuando quieras:`
      : `Reservamos "${gift.item}" a tu nombre: ya nadie más lo puede elegir.`,
    '',
  ];
  if (isTransfer) {
    if (price) textLines.push(`Valor de referencia: ${price}`, '');
    for (const a of accounts) {
      textLines.push(`${a.bank} (titular: ${couple.holder})`, ...accountRows(a).map(([k, v]) => `  ${k}: ${v}`), '');
    }
  } else if (links.length > 0) {
    textLines.push('Links orientativos (podés comprarlo donde quieras):', ...links.map((l) => `  ${l.label}: ${l.url}`), '');
  }
  textLines.push(delivery, ...contacts.map((c) => `  ${c.name}: ${c.display} · ${waLink(c.phone, waText)}`), '');
  if (note) textLines.push(note, '');
  textLines.push('Con amor,', couple.names, couple.weddingDateLabel, '', `Lista de regalos: ${couple.giftsUrl}`);

  return { subject, html, text: textLines.join('\n') };
}
