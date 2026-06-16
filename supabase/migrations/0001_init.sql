-- StyleSnap AI initial schema: generations table + private storage buckets.

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  style_id text not null,
  original_image_url text,
  generated_image_url text,
  created_at timestamptz not null default now()
);

-- RLS on: no client access. Only the service role (Edge Function) reads/writes.
alter table public.generations enable row level security;
-- (No policies => anon/authenticated have no access; service role bypasses RLS.)

-- Private storage buckets.
insert into storage.buckets (id, name, public)
values ('selfies', 'selfies', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('generated', 'generated', false)
on conflict (id) do nothing;

-- No storage RLS policies => only the service role can read/write objects.
-- Clients receive short-lived signed URLs minted by the Edge Function.
