-- Lista de regalos (/regalos): ítems, reservas y avisos por mail.
-- Ejecutar en Supabase → SQL Editor. Es idempotente (se puede correr más de una vez).
--
-- Seguridad: la anon key es pública. Los invitados NO pueden leer ni escribir
-- las tablas directamente: sólo pueden llamar a las funciones de abajo, que
-- validan todo y nunca devuelven los nombres de quienes regalan.

-- ─── Ítems (fuente de verdad, se editan desde Table Editor) ────────────────
create table if not exists public.gift_items (
  id         text    primary key check (char_length(id) between 1 and 20),
  categoria  text    not null,
  item       text    not null,
  detalle    text,
  nivel      text    check (nivel in ('$', '$$', '$$$', 'libre')),
  precio     integer check (precio >= 0),          -- en pesos, sin decimales
  link1      text,
  link2      text,
  imagen     text,                                 -- URL de una imagen (opcional)
  orden      integer not null default 0,
  activo     boolean not null default true,        -- false = no se muestra
  reservable boolean not null default true         -- false = "Aporte libre"
);

-- ─── Reservas ──────────────────────────────────────────────────────────────
-- estado: 'activa' (reservado) o 'liberada' (lo deshizo quien reservó).
create table if not exists public.gift_reservations (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  item_id     text        not null references public.gift_items (id) on update cascade,
  nombre      text        not null check (char_length(nombre) between 2 and 100),
  mensaje     text        check (char_length(mensaje) <= 500),
  forma       text        not null check (forma in ('compra', 'transferencia')),
  token_hash  text        not null,
  estado      text        not null default 'activa' check (estado in ('activa', 'liberada')),
  released_at timestamptz
);

-- Mail opcional del invitado (para el mail de agradecimiento). Nunca se expone en la web.
alter table public.gift_reservations add column if not exists email text
  check (email is null or (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'));

-- Si lo compra: dónde ('link1'/'link2' = uno de los links de la lista, 'propia' = en otro lado),
-- cómo lo hace llegar ('llevo' = a la boda, 'envio' = coordinan la dirección) y, si lo compra
-- en otro lado, el link de dónde (opcional).
alter table public.gift_reservations add column if not exists opcion text
  check (opcion is null or opcion in ('link1', 'link2', 'propia'));
alter table public.gift_reservations add column if not exists entrega text
  check (entrega is null or entrega in ('llevo', 'envio'));
alter table public.gift_reservations add column if not exists link_compra text
  check (link_compra is null or (char_length(link_compra) <= 500 and link_compra ~* '^https?://'));

-- Concurrencia: como máximo UNA reserva activa por ítem. Si dos personas
-- reservan a la vez, la base rechaza la segunda.
create unique index if not exists gift_reservations_una_activa
  on public.gift_reservations (item_id) where estado = 'activa';

-- ─── Log de mails (lo escribe la Edge Function notify-gift) ───────────────
create table if not exists public.gift_email_log (
  id             bigint generated always as identity primary key,
  created_at     timestamptz not null default now(),
  reservation_id bigint,
  evento         text not null,
  ok             boolean not null,
  error          text
);

-- ─── Permisos: nada directo para anon/authenticated ───────────────────────
alter table public.gift_items        enable row level security;
alter table public.gift_reservations enable row level security;
alter table public.gift_email_log    enable row level security;
revoke all on public.gift_items, public.gift_reservations, public.gift_email_log from anon, authenticated;

-- Vista para que ustedes vean las reservas con el nombre del ítem (Table Editor).
create or replace view public.regalos_reservas with (security_invoker = true) as
  select r.created_at, r.item_id, i.item, i.categoria, r.nombre, r.mensaje, r.forma, r.estado, r.released_at, r.email,
         r.entrega, r.link_compra, r.opcion
  from public.gift_reservations r
  join public.gift_items i on i.id = r.item_id
  order by r.created_at desc;
revoke all on public.regalos_reservas from anon, authenticated;

-- ─── Helpers ───────────────────────────────────────────────────────────────
create or replace function public._gift_token_hash(p_token text)
returns text language sql immutable set search_path = public as $fn$
  select encode(sha256(convert_to(p_token, 'UTF8')), 'hex');
$fn$;
revoke all on function public._gift_token_hash(text) from public, anon, authenticated;

-- Limpia texto libre: saca caracteres de control (deja saltos de línea si
-- p_multiline) y espacios sobrantes.
create or replace function public._gift_clean(p_text text, p_multiline boolean)
returns text language sql immutable set search_path = public as $fn$
  select nullif(btrim(
    case when p_multiline
      then regexp_replace(coalesce(p_text, ''), '[\x01-\x09\x0b-\x1f\x7f]', '', 'g')
      else regexp_replace(regexp_replace(coalesce(p_text, ''), '[[:cntrl:]]', ' ', 'g'), '\s+', ' ', 'g')
    end), '');
$fn$;
revoke all on function public._gift_clean(text, boolean) from public, anon, authenticated;

-- ─── API pública (lo único que puede llamar la web) ───────────────────────

-- Lista de ítems activos + si están reservados. "mine" = reservado con alguno
-- de los tokens de este dispositivo. Nunca devuelve nombres ni mensajes.
create or replace function public.get_gifts(p_tokens text[] default '{}')
returns table (
  id text, categoria text, item text, detalle text, nivel text, precio integer,
  link1 text, link2 text, imagen text, orden integer, reservable boolean,
  reservado boolean, mine boolean
)
language sql stable security definer set search_path = public as $fn$
  with hashes as (
    select public._gift_token_hash(t) as h
    from unnest(coalesce(p_tokens, '{}'::text[])) with ordinality as u(t, n)
    where n <= 50 and t is not null and char_length(t) between 20 and 200
  )
  select i.id, i.categoria, i.item, i.detalle, i.nivel, i.precio,
         i.link1, i.link2, i.imagen, i.orden, i.reservable,
         (r.id is not null) as reservado,
         coalesce(r.token_hash in (select h from hashes), false) as mine
  from public.gift_items i
  left join public.gift_reservations r on r.item_id = i.id and r.estado = 'activa'
  where i.activo
  order by i.orden, i.id;
$fn$;

-- Versiones anteriores (sin mail / sin entrega ni link): se borran para que no queden
-- dos funciones con el mismo nombre.
drop function if exists public.reserve_gift(text, text, text, text, text);
drop function if exists public.reserve_gift(text, text, text, text, text, text);
drop function if exists public.reserve_gift(text, text, text, text, text, text, text, text);

create or replace function public.reserve_gift(
  p_item_id text, p_nombre text, p_mensaje text, p_forma text, p_token text, p_email text default null,
  p_entrega text default null, p_link text default null, p_opcion text default null
)
returns jsonb language plpgsql volatile security definer set search_path = public as $fn$
declare
  v_nombre  text := public._gift_clean(p_nombre, false);
  v_mensaje text := public._gift_clean(p_mensaje, true);
  v_email   text := lower(public._gift_clean(p_email, false));
  v_entrega text := public._gift_clean(p_entrega, false);
  v_link    text := public._gift_clean(p_link, false);
  v_opcion  text := public._gift_clean(p_opcion, false);
  v_item    public.gift_items%rowtype;
begin
  if v_nombre is null or char_length(v_nombre) < 2 or char_length(v_nombre) > 100 then
    return jsonb_build_object('ok', false, 'error', 'invalid_name');
  end if;
  if v_mensaje is not null and char_length(v_mensaje) > 500 then
    return jsonb_build_object('ok', false, 'error', 'invalid_message');
  end if;
  if v_email is not null and (char_length(v_email) > 254 or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') then
    return jsonb_build_object('ok', false, 'error', 'invalid_email');
  end if;
  if coalesce(p_forma, '') not in ('compra', 'transferencia') then
    return jsonb_build_object('ok', false, 'error', 'invalid_forma');
  end if;
  if p_token is null or char_length(p_token) not between 20 and 200 then
    return jsonb_build_object('ok', false, 'error', 'invalid_token');
  end if;
  -- Entrega y link sólo tienen sentido si lo compra (no al transferir).
  if p_forma = 'transferencia' then
    v_entrega := null;
    v_link := null;
    v_opcion := null;
  elsif coalesce(v_entrega, '') not in ('llevo', 'envio') then
    return jsonb_build_object('ok', false, 'error', 'invalid_entrega');
  elsif v_opcion is not null and v_opcion not in ('link1', 'link2', 'propia') then
    return jsonb_build_object('ok', false, 'error', 'invalid_opcion');
  end if;
  -- El link propio sólo se guarda si lo compra en otro lado.
  if v_opcion in ('link1', 'link2') then
    v_link := null;
  end if;
  if v_link is not null and (char_length(v_link) > 500 or v_link !~* '^https?://\S+\.\S+$') then
    return jsonb_build_object('ok', false, 'error', 'invalid_link');
  end if;

  select * into v_item from public.gift_items where gift_items.id = p_item_id and activo;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  if not v_item.reservable then
    return jsonb_build_object('ok', false, 'error', 'not_reservable');
  end if;

  begin
    insert into public.gift_reservations (item_id, nombre, mensaje, forma, token_hash, email, entrega, link_compra, opcion)
    values (v_item.id, v_nombre, v_mensaje, p_forma, public._gift_token_hash(p_token), v_email, v_entrega, v_link, v_opcion);
  exception when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'taken');
  end;

  return jsonb_build_object('ok', true);
end;
$fn$;

create or replace function public.release_gift(p_item_id text, p_token text)
returns jsonb language plpgsql volatile security definer set search_path = public as $fn$
begin
  if p_token is null or char_length(p_token) not between 20 and 200 then
    return jsonb_build_object('ok', false, 'error', 'invalid_token');
  end if;

  update public.gift_reservations
     set estado = 'liberada', released_at = now()
   where item_id = p_item_id
     and estado = 'activa'
     and token_hash = public._gift_token_hash(p_token);

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_yours');
  end if;
  return jsonb_build_object('ok', true);
end;
$fn$;

revoke all on function public.get_gifts(text[])                          from public;
revoke all on function public.reserve_gift(text, text, text, text, text, text, text, text, text) from public;
revoke all on function public.release_gift(text, text)                   from public;
grant execute on function public.get_gifts(text[])                          to anon, authenticated;
grant execute on function public.reserve_gift(text, text, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.release_gift(text, text)                   to anon, authenticated;

-- ─── Seed (contenido del Excel). No pisa lo que ya editaron. ──────────────
insert into public.gift_items (id, categoria, item, detalle, nivel, orden, reservable) values
  ('R-001', 'Cocina', 'Microondas', '20-25 L', '$$', 10, true),
  ('R-002', 'Cocina', 'Pava eléctrica', 'Ideal para mate', '$', 20, true),
  ('R-003', 'Cocina', 'Tostadora', null, '$', 30, true),
  ('R-004', 'Cocina', 'Batidora', 'Con accesorios', '$', 40, true),
  ('R-005', 'Cocina', 'Set de ollas y sartenes', 'Antiadherente', '$$', 50, true),
  ('R-006', 'Cocina', 'Fuente para horno + asadera', null, '$', 60, true),
  ('R-007', 'Cocina', 'Juego de vajilla', 'Platos playos, hondos y de postre', '$$', 70, true),
  ('R-008', 'Cocina', 'Juego de cubiertos 24 piezas', 'Acero', '$$', 80, true),
  ('R-009', 'Cocina', 'Set de vasos', null, '$', 90, true),
  ('R-010', 'Cocina', 'Set de cuchillos', 'Puede incluir cuchillo de chef', '$$', 100, true),
  ('R-011', 'Cocina', 'Ensaladera + fuentes para servir', null, '$', 110, true),
  ('R-012', 'Cocina', 'Mantel + servilletas', null, '$', 120, true),
  ('R-013', 'Cocina', 'Tablas para picar', null, '$', 130, true),
  ('R-014', 'Cocina', 'Set de tuppers', 'Chicos, medianos y grandes', '$', 140, true),
  ('R-015', 'Cocina', 'Escurridor de platos', null, '$', 150, true),
  ('R-016', 'Cocina', 'Tacho de basura', null, '$', 160, true),
  ('R-017', 'Dormitorio', 'Acolchado 2 plazas', null, '$$', 170, true),
  ('R-018', 'Dormitorio', 'Juego de sábanas 2 plazas', null, '$', 180, true),
  ('R-019', 'Dormitorio', 'Juego de sábanas 2 plazas (2º juego)', null, '$', 190, true),
  ('R-020', 'Dormitorio', 'Cómoda y cajonera', null, '$$', 200, true),
  ('R-021', 'Dormitorio', 'Mesas de luz (par)', null, '$$', 210, true),
  ('R-022', 'Dormitorio', 'Veladores (par)', null, '$', 220, true),
  ('R-023', 'Dormitorio', 'Frazadas', null, '$', 230, true),
  ('R-024', 'Baño', 'Set de toallas y toallones', '2 toallas + 2 toallones', '$', 240, true),
  ('R-025', 'Baño', 'Set de toallas y toallones (2º juego)', '2 toallas + 2 toallones', '$', 250, true),
  ('R-026', 'Baño', 'Canasto de ropa', null, '$', 260, true),
  ('R-027', 'Living', 'Smart TV', null, '$$$', 270, true),
  ('R-028', 'Living', 'Mesada de comedor', null, '$$$', 280, true),
  ('R-029', 'Living', 'Sillas de comedor (x4)', null, '$$$', 290, true),
  ('R-030', 'Living', 'Estantería / biblioteca', null, '$$', 300, true),
  ('R-031', 'Hogar', 'Aspiradora', null, '$$', 310, true),
  ('R-032', 'Hogar', 'Plancha a vapor', null, '$', 320, true),
  ('R-033', 'Hogar', 'Tabla de planchar', null, '$', 330, true),
  ('R-034', 'Hogar', 'Ventilador de pie', null, '$', 340, true),
  ('R-035', 'Hogar', 'Tender y broches', null, '$', 350, true),
  ('R-036', 'Hogar', 'Sofá 3 cuerpos', null, '$$$', 360, true),
  ('R-037', 'Herramientas', 'Escoba, escobillón, pala, balde y trapeador', null, '$', 370, true),
  ('R-038', 'Herramientas', 'Caja de herramientas completa', null, '$', 380, true),
  ('R-039', 'Aporte libre', 'Aporte libre / Luna de miel', 'Transferencia', 'libre', 390, false)
on conflict (id) do nothing;
