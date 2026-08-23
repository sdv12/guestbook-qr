-- === RLS: punto 3, ultima pieza que faltaba ===
-- El organizador (owner_id del evento) puede leer las responses de sus
-- propios eventos para verlas en el dashboard. Nadie mas puede hacer
-- SELECT sobre responses (el guest solo puede insertar, ver 0002).

create policy "owner puede ver responses de sus eventos"
  on responses for select
  to authenticated
  using (
    exists (
      select 1 from events
      where events.id = responses.event_id
        and events.owner_id = auth.uid()
    )
  );
