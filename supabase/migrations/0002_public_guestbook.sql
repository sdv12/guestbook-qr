-- === RLS: adelanto necesario para el guestbook publico (app/e/[slug]) ===
-- Falta todavia (se agrega en el punto 3): que SOLO el owner pueda leer
-- las responses de su evento (para el dashboard). Sin esa policy, por ahora
-- nadie puede hacer SELECT de responses salvo vía service role.

-- Cualquiera puede leer eventos (la landing filtra por slug en la query)
create policy "cualquiera puede leer eventos"
  on events for select
  to anon, authenticated
  using (true);

-- Cualquiera puede dejar una respuesta en el guestbook
alter table responses enable row level security;

create policy "cualquiera puede insertar respuestas"
  on responses for insert
  to anon, authenticated
  with check (true);

-- Bucket "photos": insert publico (el bucket ya es publico para lectura,
-- eso se resuelve via URL publica y no requiere policy de select)
create policy "cualquiera puede subir fotos"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'photos');
