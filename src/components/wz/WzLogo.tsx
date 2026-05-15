import Image from "next/image";

interface Props {
  /** Als gegeven, wrap het logo in een <a>. Pass `null` om geen link te renderen
   *  (handig wanneer een ouder al een Link/anchor om de logo heen heeft staan,
   *  anders krijg je geneste anchors = invalide HTML). */
  href?: string | null;
  pillClassName?: string;
  height?: number;
  ariaLabel?: string;
}

export default function WzLogo({
  href = "/",
  pillClassName = "",
  height = 20,
  ariaLabel = "Weerzone — naar home",
}: Props) {
  const inner = (
    <Image
      src="/brand/weerzone-logo.png"
      alt="Weerzone"
      width={Math.round(height * 4.26)}
      height={height}
      priority
      style={{ height, width: "auto", display: "block" }}
    />
  );

  const className = `inline-flex items-center rounded-[10px] bg-[var(--wz-blue)] px-3 py-1.5 ${pillClassName}`;

  if (href === null) {
    return <span className={className}>{inner}</span>;
  }
  return (
    <a href={href} className={className} aria-label={ariaLabel}>
      {inner}
    </a>
  );
}
