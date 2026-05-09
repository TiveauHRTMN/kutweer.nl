-- Run this in Supabase SQL editor
create table if not exists piet_daily_briefing (
  date        text primary key,          -- YYYY-MM-DD
  generated_at timestamptz default now(),
  commentary  text not null,
  slots       jsonb not null,            -- [{name, temp, rain, emoji}, ...]
  region_data jsonb                      -- [{name, city, temp}, ...]
);

alter table piet_daily_briefing enable row level security;

create policy "authenticated read"
  on piet_daily_briefing for select
  to authenticated using (true);

create policy "service role write"
  on piet_daily_briefing for all
  to service_role using (true);
