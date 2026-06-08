create table if not exists social_posts (
  id          uuid        default gen_random_uuid() primary key,
  created_at  timestamptz default timezone('utc'::text, now()) not null,
  topic       text        not null,
  post_type   text        not null, -- 'single' | 'carousel3' | 'carousel6' | 'story'
  style       text        not null default 'light', -- 'light' | 'dark'
  slides      jsonb       not null, -- [{headline, body}]
  caption     text        not null,
  hashtags    text[]      not null
);

grant all privileges on table social_posts to service_role;
grant all privileges on table social_posts to postgres;

notify pgrst, 'reload schema';
