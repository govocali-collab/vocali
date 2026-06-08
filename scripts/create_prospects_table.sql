-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard → your project → SQL Editor

-- 1. Create the table
create table if not exists prospects (
  id               uuid        default gen_random_uuid() primary key,
  created_at       timestamptz default timezone('utc'::text, now()) not null,
  updated_at       timestamptz default timezone('utc'::text, now()) not null,
  clinic_name      text        not null,
  owner_name       text,
  phone            text,
  email            text,
  city             text,
  status           text        not null default 'nouveau',
  source           text,
  notes            text,
  last_contact_at  timestamptz
);

-- 2. Explicit grants so the service role can read/write
grant all privileges on table prospects to service_role;
grant all privileges on table prospects to postgres;

-- 3. Auto-update updated_at on every row change
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists prospects_updated_at on prospects;

create trigger prospects_updated_at
  before update on prospects
  for each row execute function update_updated_at_column();

-- 4. Force PostgREST to reload its schema cache
notify pgrst, 'reload schema';
