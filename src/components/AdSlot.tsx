"use client";

import { useEffect, useRef } from "react";

// Google AdSense publisher ID
const ADSENSE_CLIENT = "ca-pub-6187487207780127";

type AdSlotProps = {
  /** AdSense ad slot ID (from AdSense dashboard) */
  slot: string;
  /** Ad format: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical' */
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  /** Responsive behavior */
  responsive?: boolean;
  /** Optional layout for fluid ads (in-article, in-feed) */
  layout?: string;
  /** Optional layout key for custom fluid layouts */
  layoutKey?: string;
  /** Extra className */
  className?: string;
  /** Minimum display height (prevents CLS) */
  minHeight?: number;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSlot({
  slot,
  format = "auto",
  responsive = true,
  layout,
  layoutKey,
  className = "",
  minHeight = 100,
}: AdSlotProps) {
  const pushed = useRef(false);

  useEffect(() => {
    // Skip if no slot id set yet (prevents dev errors)
    if (!slot || slot === "0000000000") return;
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense script not yet loaded — silent fail, will retry on remount
    }
  }, [slot]);

  // Placeholder when no slot configured yet
  if (!slot || slot === "0000000000") {
    return null;
  }

  return (
    <div className={`ad-slot ${className}`} style={{ minHeight, width: "100%", textAlign: "center" }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
        {...(layout ? { "data-ad-layout": layout } : {})}
        {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
      />
    </div>
  );
}
