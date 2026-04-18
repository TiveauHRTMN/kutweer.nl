import { PERSONAS, type PersonaTier } from "@/lib/personas";

interface Props {
  tier: PersonaTier;
  size?: "sm" | "md";
}

/**
 * Compact persona-naam naast het WEERZONE-logo.
 * Zichtbaar wanneer gebruiker een actieve (trialing/active) subscription heeft.
 * Brand blijft intact (logo onveranderd), persona is een badge die eigenaar toont.
 */
export default function PersonaBadge({ tier, size = "md" }: Props) {
  const p = PERSONAS[tier];
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";

  return (
    <span className="inline-flex items-center gap-1.5 ml-2">
      <span className="text-white/30 select-none">·</span>
      <span
        className={`${dotSize} rounded-full shrink-0`}
        style={{ background: p.color }}
        aria-hidden
      />
      <span
        className={`${textSize} font-black uppercase tracking-wider`}
        style={{ color: p.color }}
      >
        {p.name}
      </span>
    </span>
  );
}
