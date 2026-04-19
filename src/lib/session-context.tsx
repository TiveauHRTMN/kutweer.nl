"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PERSONA_ORDER, type PersonaTier } from "@/lib/personas";
import { isFounderEmail, FOUNDER_TIER } from "@/lib/founders";

interface SessionState {
  user: User | null;
  tier: PersonaTier | null;   // actieve tier (trialing|active) of null
  loading: boolean;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionState>({
  user: null,
  tier: null,
  loading: true,
  refresh: async () => {},
});

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [tier, setTier] = useState<PersonaTier | null>(null);
  const [loading, setLoading] = useState(true);

  async function hydrate() {
    const { data: userData } = await supabase.auth.getUser();
    const u = userData.user ?? null;
    setUser(u);
    if (!u) {
      setTier(null);
      setLoading(false);
      return;
    }
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("tier, status")
      .eq("user_id", u.id)
      .in("status", ["trialing", "active"])
      .maybeSingle();
    let t = (sub?.tier ?? null) as PersonaTier | null;
    // Founder-bypass: eigenaar krijgt altijd de hoogste tier.
    if (!t && isFounderEmail(u.email)) {
      t = FOUNDER_TIER;
    }
    setTier(t && PERSONA_ORDER.includes(t) ? t : null);
    setLoading(false);
  }

  useEffect(() => {
    hydrate();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      hydrate();
    });
    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SessionContext.Provider value={{ user, tier, loading, refresh: hydrate }}>
      {children}
    </SessionContext.Provider>
  );
}
