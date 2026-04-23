-- Extensions: pg_net voor de optionele Hermes-webhook op signup.
-- Op Supabase managed werkt dit met de default postgres rol.
-- Falen op een gelockte rol? Skip deze regel en gebruik Dashboard →
-- Database → Extensions → pg_net.
create extension if not exists pg_net with schema extensions;

-- ============================================================
-- WELCOME SERIES (Hermes-owned)
-- Adds bookkeeping for 5-mail onboarding sequence + optional
-- pg_net webhook to notify Hermes immediately on signup so mail 1
-- arrives within minutes instead of on the next 06:00 cron tick.
--
-- Prereqs (enable in Supabase Dashboard > Database > Extensions):
--   - pg_net   (for HTTP notify to Hermes on signup — OPTIONAL)
--   - vault    (built-in; used to store hermes_welcome_webhook URL)
-- If either is missing the trigger silently falls back to "no notify"
-- and Hermes's scheduled cron picks up the user on the next run.
--
-- Hermes contract:
--   - SELECT * FROM welcome_queue WHERE next_step IS NOT NULL
--   - Send the template matching next_step
--   - After sending: UPDATE user_profile SET welcome_step = next_step,
--     welcome_last_sent_at = now(); INSERT INTO email_log (...)
--   - Respect user_preferences.subscribed_marketing = false (already
--     filtered by the view)
-- ============================================================

-- 1. Profile columns ---------------------------------------------------
alter table public.user_profile
  add column if not exists welcome_step int not null default 0;

alter table public.user_profile
  add column if not exists welcome_last_sent_at timestamptz;

create index if not exists idx_user_profile_welcome_step
  on public.user_profile(welcome_step)
  where welcome_step < 5;

-- 2. Marketing consent -------------------------------------------------
-- Simple 1:1 with auth.users. one-click unsubscribe flips this to false.
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  subscribed_marketing boolean not null default true,
  unsubscribed_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

drop policy if exists "user_preferences self" on public.user_preferences;
create policy "user_preferences self" on public.user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. Email log ---------------------------------------------------------
-- Hermes writes here after every send. Opens/clicks updated via
-- Resend webhook (Hermes endpoint updates by resend_id).
create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template text not null,                 -- 'welcome_1' .. 'welcome_5' | others later
  step int,                                -- 1..5 for welcome series, null otherwise
  resend_id text,                          -- returned by Resend API
  subject text not null,
  sent_at timestamptz not null default now(),
  opened_at timestamptz,
  clicked_at timestamptz,
  bounced boolean not null default false,
  feedback text                            -- 👍 / 👎 / free text via reply-webhook
);

create index if not exists idx_email_log_user on public.email_log(user_id);
create index if not exists idx_email_log_template on public.email_log(template);
create index if not exists idx_email_log_resend on public.email_log(resend_id);

alter table public.email_log enable row level security;
drop policy if exists "email_log self read" on public.email_log;
create policy "email_log self read" on public.email_log
  for select using (auth.uid() = user_id);
-- writes are service-role only — no policy needed

-- 4. Extend handle_new_user trigger -----------------------------------
-- Keep existing behaviour (profile + subscription) and also seed
-- user_preferences + optionally ping Hermes webhook via pg_net.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  hermes_url text;
begin
  -- profile (unchanged)
  insert into public.user_profile (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  -- subscription (unchanged)
  insert into public.subscriptions (user_id, tier, status, is_founder, trial_end, founder_price_cents)
  values (new.id, 'piet', 'trialing', true, '2026-06-01 00:00:00+02', 299)
  on conflict do nothing;

  -- marketing consent default
  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  -- Optional: notify Hermes now so mail 1 arrives within minutes.
  -- Store the URL in vault: `select vault.create_secret('<url>', 'hermes_welcome_webhook')`
  -- If the secret does not exist we silently skip and let Hermes's 06:00 cron pick it up.
  begin
    select decrypted_secret into hermes_url
      from vault.decrypted_secrets
      where name = 'hermes_welcome_webhook'
      limit 1;

    if hermes_url is not null then
      perform net.http_post(
        url     := hermes_url,
        headers := jsonb_build_object('Content-Type', 'application/json'),
        body    := jsonb_build_object(
          'event',   'new_signup',
          'user_id', new.id,
          'email',   new.email,
          'created_at', new.created_at
        )
      );
    end if;
  exception
    when undefined_table then
      -- vault or pg_net extension not installed — ignore, cron will catch it
      null;
    when others then
      raise warning 'Hermes webhook notify failed: %', SQLERRM;
  end;

  return new;
end;
$$;

-- Trigger is already bound to auth.users via earlier migration; no re-bind needed.

-- 5. Helper view for Hermes to pick next batch ------------------------
-- Hermes can `SELECT * FROM public.welcome_queue` instead of rebuilding
-- the logic on its side. Returns rows ready for their next mail now.
create or replace view public.welcome_queue as
select
  up.id as user_id,
  up.email,
  up.full_name,
  up.postcode,
  up.welcome_step,
  up.welcome_last_sent_at,
  s.tier as chosen_tier,
  up.created_at as signup_at,
  -- which step should fire now?
  case
    when up.welcome_step = 0 then 1
    when up.welcome_step = 1 and up.welcome_last_sent_at < now() - interval '2 days' then 2
    when up.welcome_step = 2 and up.welcome_last_sent_at < now() - interval '3 days' then 3
    when up.welcome_step = 3 and up.welcome_last_sent_at < now() - interval '4 days' then 4
    when up.welcome_step = 4 and up.welcome_last_sent_at < now() - interval '5 days' then 5
    else null
  end as next_step
from public.user_profile up
left join public.subscriptions s
  on s.user_id = up.id and s.status in ('trialing', 'active')
left join public.user_preferences pref on pref.user_id = up.id
where (pref.subscribed_marketing is null or pref.subscribed_marketing = true)
  and up.welcome_step < 5;

comment on view public.welcome_queue is
  'Rows where next_step is not null are ready to be sent now. Hermes filters `where next_step is not null` and picks the appropriate template.';
