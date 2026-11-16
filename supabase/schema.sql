-- Esquema de referencia de la tabla de confirmaciones (RSVP).
-- Debe coincidir con lo que inserta src/lib/supabase.js.
-- Ejecutar en Supabase → SQL Editor. Es idempotente.

create table if not exists public.rsvp (
  id                bigint generated always as identity primary key,
  created_at        timestamptz not null default now(),
  nombre            text        not null check (char_length(nombre) between 2 and 100),
  cantidad_personas integer     not null check (cantidad_personas between 1 and 20),
  asistencia        boolean     not null,
  restricciones     text        check (char_length(restricciones) <= 500),
  mensaje           text        check (char_length(mensaje) <= 500)
);

-- Seguridad: la anon key es pública (va en el JS del sitio), así que
-- la protección real es RLS. Los invitados SOLO pueden insertar;
-- nadie con la anon key puede leer, editar ni borrar confirmaciones.
alter table public.rsvp enable row level security;

drop policy if exists "Invitados pueden confirmar" on public.rsvp;
create policy "Invitados pueden confirmar"
  on public.rsvp
  for insert
  to anon
  with check (true);

-- Sin políticas de select/update/delete para anon => denegado por defecto.
revoke select, update, delete on public.rsvp from anon;
