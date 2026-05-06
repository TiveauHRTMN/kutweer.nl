'use client';

import Link from "next/link";
import { useFeatureFlagVariantKey } from "posthog-js/react";
import { useEffect, useState } from "react";

export default function HomePitchCTA() {
  const [mounted, setMounted] = useState(false);
  // Haal de variant op uit PostHog. 'control' is origineel, 'test' is de nieuwe variant.
  const variant = useFeatureFlagVariantKey("cta-pitch-test");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Om te voorkomen dat de server en client verschillen (hydration errors), 
  // tonen we standaard de control variant totdat PostHog is geladen.
  const isTest = mounted && variant === "test";

  if (isTest) {
    return (
      <Link
        href="/prijzen"
        className="inline-block px-8 py-4 rounded-full bg-accent-orange text-white font-black text-sm shadow-2xl hover:bg-slate-900 transition-all transform hover:scale-105"
      >
        Kies jouw persona →
      </Link>
    );
  }

  // De Control variant (origineel)
  return (
    <Link
      href="/prijzen"
      className="inline-block px-8 py-4 rounded-full bg-white text-slate-900 font-black text-sm shadow-2xl hover:bg-accent-orange hover:text-white transition-all transform hover:scale-105"
    >
      Vergelijk de weerhulpen →
    </Link>
  );
}
