import { PERSONAS, type PersonaTier } from "@/lib/personas";

interface Props {
  tier: PersonaTier;
  size?: "sm" | "md";
}

/**
 * Persona-label dat half over de rechterkant van het WEERZONE-logo ligt,
 * als een gekleurde sticker. Piet=groen, Reed=rood, Steve=blauw.
 *
 * Bedoeld om binnen een `position: relative` container te worden geplaatst,
 * direct naast (of in) het logo — de badge absoluteert zichzelf.
 */
export default function PersonaBadge({ tier, size = "md" }: Props) {
  const p = PERSONAS[tier];
  const textSize = size === "sm" ? "text-[10px]" : "text-[10px] sm:text-xs";
  const padding = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-0.5 sm:px-2.5 sm:py-1";

  return (
    <span
      className={`absolute top-1/2 right-[-10px] sm:right-0 translate-x-0 sm:translate-x-1/2 -translate-y-1/2 ${padding} ${textSize} font-black uppercase tracking-wider text-white rounded-full shadow-lg whitespace-nowrap pointer-events-none select-none z-10 border-2 border-white/90`}
      style={{ background: p.color }}
    >
      {p.name}
    </span>
  );
}
