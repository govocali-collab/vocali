create table if not exists scraper_sessions (
  id            uuid        default gen_random_uuid() primary key,
  created_at    timestamptz default timezone('utc'::text, now()) not null,
  business_type text,
  city          text,
  province      text,
  max_results   int,
  language      text,
  result_count  int         default 0,
  status        text        not null default 'pending'
);
grant all privileges on table scraper_sessions to service_role;
grant all privileges on table scraper_sessions to postgres;

create table if not exists scraper_leads (
  id                    uuid    default gen_random_uuid() primary key,
  created_at            timestamptz default timezone('utc'::text, now()) not null,
  session_id            uuid    references scraper_sessions(id) on delete cascade,
  place_id              text    not null,
  business_name         text    not null,
  address               text,
  city                  text,
  province              text,
  phone                 text,
  website               text,
  google_cid            text,
  rating                numeric(3,1),
  review_count          int,
  last_review_date      timestamptz,
  business_status       text,
  email                 text,
  instagram             text,
  booking_platform      text,
  enrichment_status     text    not null default 'scraped',
  lead_score            int,
  score_tag             text,
  imported              boolean not null default false,
  imported_at           timestamptz,
  imported_prospect_id  uuid
);
grant all privileges on table scraper_leads to service_role;
grant all privileges on table scraper_leads to postgres;
create index if not exists scraper_leads_session_id_idx on scraper_leads(session_id);
create index if not exists scraper_leads_place_id_idx on scraper_leads(place_id);
notify pgrst, 'reload schema';
