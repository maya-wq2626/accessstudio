-- AccessStudio schema. Paste this into the Supabase SQL editor
-- (Dashboard → SQL Editor → New query) and run it once.
--
-- The app only talks to Supabase through the service role key on the
-- server, so Row Level Security is on and no public policies are created.
-- Students never touch the database directly.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  first_name text,
  kind text,
  subject text,
  look text,
  prompt text,
  html text not null,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- No policies: only the server (service role key) can read and write.
-- Anyone who needs access should go through the app's own routes.
