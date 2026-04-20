-- Fix: handle_new_user maakte altijd een 'piet' abonnement aan,
-- ongeacht welke persona de gebruiker koos. Nu leest de trigger
-- de 'chosen_tier' uit raw_user_meta_data (gezet via signInWithOtp
-- options.data.chosen_tier) en maakt de juiste subscription.
--
-- Geen chosen_tier? → geen auto-subscription. De gebruiker wordt
-- dan in /app/onboarding gevraagd om een persona te kiezen.
--
-- Draai deze SQL in de Supabase SQL editor (production).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  chosen text := new.raw_user_meta_data ->> 'chosen_tier';
  trial_end_at timestamptz := '2026-06-01 00:00:00+02';
  price_cents int;
begin
  -- user_profile altijd aanmaken
  insert into public.user_profile (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  -- Subscription alleen als er een geldige persona gekozen is
  if chosen in ('piet', 'reed', 'steve') then
    price_cents := case chosen
      when 'piet' then 299
      when 'reed' then 499
      when 'steve' then 1499
    end;

    insert into public.subscriptions
      (user_id, tier, status, is_founder, trial_end, founder_price_cents)
    values
      (new.id, chosen, 'trialing', true, trial_end_at, price_cents)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
