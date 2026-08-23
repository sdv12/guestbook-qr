-- === Cambio de modelo: el organizador NO se loguea ===
-- Crear un evento no requiere cuenta. El dashboard se protege con un
-- token secreto por evento (como un link de Google Forms): quien tenga
-- el link con el token entra, nadie mas puede.
--
-- dashboard_token NUNCA debe poder leerse con un SELECT directo a la
-- tabla events. Se obtiene una unica vez (al crear el evento) y se
-- valida despues, ambos casos via funciones security definer.

alter table events add column dashboard_token text unique;

-- Las policies basadas en auth.users ya no aplican a este flujo
drop policy if exists "owner puede crear sus eventos" on events;
drop policy if exists "owner puede ver sus eventos" on events;
drop policy if exists "owner puede ver responses de sus eventos" on responses;

-- Bloqueamos el acceso directo a columnas sensibles: nadie puede pedir
-- dashboard_token (ni owner_id) via la API publica de la tabla, sin
-- importar lo que diga la policy de SELECT.
revoke select on events from anon, authenticated;
grant select (id, slug, name, created_at) on events to anon, authenticated;

-- Crear evento: genera el token adentro de la funcion y lo devuelve SOLO
-- en la respuesta de esta llamada (security definer bypasea el grant
-- de arriba, que sigue bloqueando lecturas posteriores de esa columna).
create or replace function create_event(p_slug text, p_name text)
returns table (id uuid, slug text, name text, dashboard_token text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text := replace(gen_random_uuid()::text, '-', '');
begin
  return query
  insert into events (slug, name, dashboard_token)
  values (p_slug, p_name, v_token)
  returning events.id, events.slug, events.name, events.dashboard_token, events.created_at;
end;
$$;

grant execute on function create_event(text, text) to anon, authenticated;

-- Dashboard: valida el token y devuelve los datos del evento si matchea
create or replace function verify_dashboard_token(p_event_id uuid, p_token text)
returns table (id uuid, name text, slug text)
language sql
security definer
set search_path = public
as $$
  select id, name, slug from events
  where id = p_event_id and dashboard_token = p_token;
$$;

grant execute on function verify_dashboard_token(uuid, text) to anon, authenticated;

-- Dashboard: devuelve las respuestas SOLO si el token matchea (si no
-- matchea, el join no encuentra filas y devuelve vacio, sin filtrar nada)
create or replace function get_event_responses(p_event_id uuid, p_token text)
returns setof responses
language sql
security definer
set search_path = public
as $$
  select r.* from responses r
  join events e on e.id = r.event_id
  where e.id = p_event_id and e.dashboard_token = p_token;
$$;

grant execute on function get_event_responses(uuid, text) to anon, authenticated;
