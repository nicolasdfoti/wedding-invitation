import seed from '../data/gifts.seed.json';

// Cliente liviano para las funciones de Supabase (RPC vía REST). Usa las mismas
// variables de entorno que el RSVP, pero sin cargar @supabase/supabase-js.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isBackendConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

const TOKENS_KEY = 'giftlist:tokens';

// ─── Tokens de "deshacer" (sólo en este dispositivo) ──────────────────────
function readTokens() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TOKENS_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeTokens(tokens) {
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  } catch {
    // Modo privado o storage bloqueado: la reserva igual se guarda,
    // sólo que no se va a poder liberar desde acá.
  }
}

function newToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// ─── RPC ───────────────────────────────────────────────────────────────────
async function rpc(fn, args) {
  const headers = { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' };
  // Las anon keys "clásicas" son JWT y van también como Bearer; las nuevas
  // publishable keys (sb_publishable_…) van sólo en el header apikey.
  if (SUPABASE_KEY.startsWith('eyJ')) headers.Authorization = `Bearer ${SUPABASE_KEY}`;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const error = new Error(`Supabase ${fn} → HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

function normalize(gift) {
  return {
    ...gift,
    detalle: gift.detalle || '',
    link1: gift.link1 || '',
    link2: gift.link2 || '',
    imagen: gift.imagen || '',
    precio: gift.precio ?? null,
    reservado: Boolean(gift.reservado),
    mine: Boolean(gift.mine),
  };
}

const seedGifts = () => seed.filter((g) => g.activo).map(normalize);

// Devuelve { gifts, readOnly }. readOnly = sin backend: se muestra el seed local
// y las reservas se coordinan por WhatsApp.
export async function fetchGifts() {
  if (!isBackendConfigured) return { gifts: seedGifts(), readOnly: true };

  const tokens = readTokens();
  let rows;
  try {
    rows = await rpc('get_gifts', { p_tokens: Object.values(tokens) });
  } catch (error) {
    // 404 = las funciones todavía no existen en Supabase (falta correr supabase/gifts.sql).
    // Mejor mostrar la lista en modo solo lectura que un error.
    if (error.status === 404) {
      console.warn('Lista de regalos: falta ejecutar supabase/gifts.sql en Supabase. Mostrando la lista en modo solo lectura.');
      return { gifts: seedGifts(), readOnly: true };
    }
    throw error;
  }
  const gifts = rows.map(normalize);

  // Limpiamos tokens de reservas que ya no son nuestras (liberadas, borradas…).
  const mine = new Set(gifts.filter((g) => g.mine).map((g) => g.id));
  const pruned = Object.fromEntries(Object.entries(tokens).filter(([id]) => mine.has(id)));
  if (Object.keys(pruned).length !== Object.keys(tokens).length) writeTokens(pruned);

  return { gifts, readOnly: false };
}

// Devuelve { ok: true } o { ok: false, error: 'taken' | 'invalid_name' | … }.
export async function reserveGift({ itemId, nombre, mensaje, email, forma, entrega, link, opcion }) {
  const token = newToken();
  const result = await rpc('reserve_gift', {
    p_item_id: itemId,
    p_nombre: nombre,
    p_mensaje: mensaje || '',
    p_forma: forma,
    p_token: token,
    p_email: email || null,
    p_entrega: entrega || null,
    p_link: link || null,
    p_opcion: opcion || null,
  });
  if (result?.ok) writeTokens({ ...readTokens(), [itemId]: token });
  return result;
}

export async function releaseGift(itemId) {
  const tokens = readTokens();
  const token = tokens[itemId];
  if (!token) return { ok: false, error: 'not_yours' };
  const result = await rpc('release_gift', { p_item_id: itemId, p_token: token });
  if (result?.ok || result?.error === 'not_yours') {
    delete tokens[itemId];
    writeTokens(tokens);
  }
  return result;
}
