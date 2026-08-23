-- Esquema base: eventos y respuestas del guestbook

create table events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  owner_id uuid references auth.users(id),
  created_at timestamptz default now()
);

create table responses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  guest_name text,                  -- null = anonimo, lo decide el invitado
  rating smallint check (rating between 1 and 5),
  feedback text,                    -- privado, solo lo ve el organizador
  birthday_message text,            -- pensado para mostrarle al festejado
  photo_url text,
  created_at timestamptz default now()
);

-- Bucket de Storage para las fotos subidas por los invitados
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- === RLS: adelanto minimo para probar el punto 1 (crear evento + QR) ===
-- El set completo (lectura publica de events por slug, insert publico en
-- responses, lectura de responses solo por el owner, policies del bucket)
-- se agrega en el punto 3.

alter table events enable row level security;

create policy "owner puede crear sus eventos"
  on events for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "owner puede ver sus eventos"
  on events for select
  to authenticated
  using (owner_id = auth.uid());
