import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isFounderEmail, FOUNDER_TIER } from "@/lib/founders";
import type { PersonaTier } from "@/lib/personas";
import PrijzenClient from "./PrijzenClient";

export const dynamic = "force-dynamic";

export default async function PrijzenPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userTier: PersonaTier | null = null;
  let isFounder = false;

  if (user) {
    isFounder = isFounderEmail(user.email);

    if (!isFounder) {
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("tier, status")
        .eq("user_id", user.id)
        .in("status", ["trialing", "active"]);

      const ranking: Record<string, number> = { steve: 3, reed: 2, piet: 1 };
      const best = (subs ?? []).sort(
        (a, b) => (ranking[b.tier] ?? 0) - (ranking[a.tier] ?? 0)
      )[0];
      userTier = (best?.tier ?? null) as PersonaTier | null;
    } else {
      userTier = FOUNDER_TIER;
    }
  }

  return <PrijzenClient userTier={userTier} isFounder={isFounder} />;
}
