-- Catalogue par clinique : services, formations, produits (avec prix + promo).
-- Remplace à terme le tableau locations.services. Une seule table, filtrée par `kind`.
create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  kind text not null default 'service',      -- service | formation | produit
  name text not null,
  description text,
  price text,                                -- texte libre (ex: "120 $", "À partir de 79 $")
  promotion text,                            -- spécial / promo en cours, sinon null
  duration text,                             -- ex: "60 min"
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists catalog_items_clinic_idx on public.catalog_items (clinic_id, kind, sort_order);

-- L'accès se fait via service role (server actions / API admin), comme le reste
-- de l'app. RLS activé sans policy publique = aucun accès direct côté client.
alter table public.catalog_items enable row level security;

-- La clinique offre-t-elle des formations ? (coché par l'admin → affiche la
-- section Formations dans le profil de la cliente).
alter table public.clinics
  add column if not exists offers_trainings boolean not null default false;
