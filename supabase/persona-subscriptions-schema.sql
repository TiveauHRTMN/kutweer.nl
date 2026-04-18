-- WEERZONE Persona Subscriptions Schema (Piet · Reed · Steve)
-- Run in Supabase SQL editor. Idempotent — uses IF NOT EXISTS where possible.

-- ---------- user_profile ----------
-- Eén rij per auth.users.id. Houdt core info, persona-agnostisch.
create table if not exists public.user_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  postcode text,
  primary_lat numeric(9,5),
  primary_lon numeric(9,5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_profile_email on public.user_profile(email);

-- ---------- user_locations ----------
-- Meerdere locaties per user (thuis, zaak, vakantiehuis, meerdere filialen voor Steve).
create table if not exists public.user_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,                 -- "Thuis", "Strandtent Zandvoort", "Filiaal Breda"
  lat numeric(9,5) not null,
  lon numeric(9,5) not null,
  address text,
  is_primary boolean not null default false,
  persona_scope text[] not null default '{}', -- {'piet','reed','steve'}
  created_at timestamptz not null default now()
);

create index if not exists idx_user_locations_user on public.user_locations(user_id);

-- ---------- subscriptions ----------
-- Eén actieve rij per user per tier. Trial tot 2026-06-01 voor founders.
do $$ begin
  create type public.subscription_tier as enum ('free','piet','reed','steve');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_status as enum ('trialing','active','past_due','canceled','expired');
exception when duplicate_object then null; end $$;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tier public.subscription_tier not null default 'free',
  status public.subscription_status not null default 'trialing',
  is_founder boolean not null default true,       -- alle pre-1-juni-signups = founder
  trial_end timestamptz not null default '2026-06-01 00:00:00+02',
  mollie_customer_id text,
  mollie_subscription_id text,
  started_at timestamptz not null default now(),
  canceled_at timestamptz,
  founder_price_cents int,                         -- bv 299 (Piet), 499 (Reed), 2900 (Steve)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_subscriptions_user_tier_active
  on public.subscriptions(user_id, tier)
  where status in ('trialing','active','past_due');

create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_subscriptions_trial_end on public.subscriptions(trial_end) where status = 'trialing';

-- ---------- persona_preferences ----------
-- Persoonlijk profiel per persona. JSONB voor flexibele schema-evolutie.
create table if not exists public.persona_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  persona text not null check (persona in ('piet','reed','steve')),
  prefs jsonb not null default '{}'::jsonb,
  -- Piet voorbeeld:  {"hond":{"naam":"Peppercorn"},"fiets":true,"tuin":true,"kinderen":false,"astma":false}
  -- Reed voorbeeld:  {"kelder_gevoelig":true,"plat_dak":false,"baby":false,"paard_wei":false,"waterschade_historie":"2018"}
  -- Steve voorbeeld: {"branche":"strandtent","capaciteit":120,"drempels":{"wind_bft":6,"regen_mm":2,"temp_min":5,"onweer":true},"deadlines":{"inkoop_uur":14,"annulering_uur":16}}
  onboarding_stage int not null default 1,         -- 1=basis, 2=uitgebreid, 3=volledig
  last_updated timestamptz not null default now()
);

create unique index if not exists idx_persona_prefs_user_persona
  on public.persona_preferences(user_id, persona);

-- ---------- forecast_log ----------
-- Elke dagelijkse brief die we versturen. Voor accuracy-tracking + "gisteren zei ik X".
create table if not exists public.forecast_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  location_id uuid references public.user_locations(id) on delete cascade,
  persona text not null check (persona in ('piet','reed','steve')),
  sent_at timestamptz not null default now(),
  forecast_json jsonb not null,                    -- de ruwe forecast-data
  brief_text text,                                  -- de LLM-gegenereerde brief
  subject text,
  resend_id text,                                   -- Resend message id voor tracking
  confidence_avg numeric(4,3),
  accuracy_score numeric(4,3)                       -- ingevuld door verification cron
);

create index if not exists idx_forecast_log_user_date on public.forecast_log(user_id, sent_at desc);
create index if not exists idx_forecast_log_persona on public.forecast_log(persona, sent_at desc);

-- ---------- decision_log ----------
-- Closing-the-loop: opgevolgd ja/nee per aanbeveling (Steve primair).
create table if not exists public.decision_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  forecast_log_id uuid references public.forecast_log(id) on delete cascade,
  decision text not null check (decision in ('followed','ignored','partial')),
  note text,
  created_at timestamptz not null default now()
);

-- ---------- founder_counts (view) ----------
-- Publiek leesbare teller voor "Nog X van 25 founder-plekken"
create or replace view public.founder_counts as
  select
    tier,
    count(*) filter (where is_founder) as founder_count,
    count(*) as total_count
  from public.subscriptions
  where status in ('trialing','active','past_due')
  group by tier;

-- ---------- RLS ----------
alter table public.user_profile enable row level security;
alter table public.user_locations enable row level security;
alter table public.subscriptions enable row level security;
alter table public.persona_preferences enable row level security;
alter table public.forecast_log enable row level security;
alter table public.decision_log enable row level security;

-- user_profile: eigen rij read+write
drop policy if exists "user_profile self" on public.user_profile;
create policy "user_profile self" on public.user_profile
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- user_locations: eigen rijen read+write
drop policy if exists "user_locations self" on public.user_locations;
create policy "user_locations self" on public.user_locations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- subscriptions: eigen rij read (schrijven via service-role / webhook)
drop policy if exists "subscriptions self read" on public.subscriptions;
create policy "subscriptions self read" on public.subscriptions
  for select using (auth.uid() = user_id);

-- persona_preferences: eigen rijen read+write
drop policy if exists "persona_preferences self" on public.persona_preferences;
create policy "persona_preferences self" on public.persona_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- forecast_log: eigen rijen read-only (schrijven via service-role)
drop policy if exists "forecast_log self read" on public.forecast_log;
create policy "forecast_log self read" on public.forecast_log
  for select using (auth.uid() = user_id);

-- decision_log: eigen rijen read+write
drop policy if exists "decision_log self" on public.decision_log;
create policy "decision_log self" on public.decision_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- Trigger: auto-create profile + free subscription on signup ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.user_profile (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  -- Auto-grant founder trial voor alle persona's tot 1 juni 2026
  insert into public.subscriptions (user_id, tier, status, is_founder, trial_end, founder_price_cents)
  values
    (new.id, 'piet', 'trialing', true, '2026-06-01 00:00:00+02', 299)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Trigger: updated_at ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists touch_user_profile on public.user_profile;
create trigger touch_user_profile before update on public.user_profile
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_subscriptions on public.subscriptions;
create trigger touch_subscriptions before update on public.subscriptions
  for each row execute function public.touch_updated_at();
