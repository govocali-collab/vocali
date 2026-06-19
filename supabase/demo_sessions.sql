-- Suivi d'utilisation de la démo vocale (provenance, durée, conversion).
-- À exécuter dans Supabase → SQL Editor.
create table if not exists public.demo_sessions (
  id uuid primary key default gen_random_uuid(),
  conversation_id text unique not null,
  created_at timestamptz not null default now(),
  src text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  duration_sec integer,
  is_prospect boolean not null default false,
  transcript jsonb
);

grant all on public.demo_sessions to service_role;
