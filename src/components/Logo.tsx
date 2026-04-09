interface LogoProps {
  size?: number;
  className?: string;
  variant?: "icon" | "full";
}

/** Favicon-variant: gele cirkel met witte W */
export function LogoIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Gele cirkel */}
      <circle cx="50" cy="50" r="50" fill="#FFE100" />
      {/* Witte W — vette polygon */}
      <polygon
        points="14,26 26,26 50,70 74,26 86,26 62,78 50,56 38,78"
        fill="white"
      />
    </svg>
  );
}

/** Full logo: WeerZone tekst + geel zonnetje */
export function LogoFull({ height = 32, className = "" }: { height?: number; className?: string }) {
  const sunSize = height * 0.75;
  const fontSize = height * 0.85;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: 900,
          color: "white",
          letterSpacing: "-0.03em",
          lineHeight: 1,
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        WeerZone
      </span>
      {/* Zon */}
      <svg
        width={sunSize}
        height={sunSize}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Stralen */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 30 + Math.cos(rad) * 22;
          const y1 = 30 + Math.sin(rad) * 22;
          const x2 = 30 + Math.cos(rad) * 30;
          const y2 = 30 + Math.sin(rad) * 30;
          return (
            <line
              key={angle}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#FFE100"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          );
        })}
        {/* Cirkel */}
        <circle cx="30" cy="30" r="17" fill="#FFE100" />
      </svg>
    </div>
  );
}

/** Default export — combineert beide op basis van variant */
export default function Logo({ size = 36, className = "", variant = "full" }: LogoProps) {
  if (variant === "icon") return <LogoIcon size={size} className={className} />;
  return <LogoFull height={size} className={className} />;
}
