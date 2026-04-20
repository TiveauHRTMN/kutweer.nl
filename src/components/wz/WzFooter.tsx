import Link from "next/link";
import WzLogo from "./WzLogo";

const COLUMNS: Array<{ heading: string; items: Array<{ label: string; href: string }> }> = [
  {
    heading: "Product",
    items: [
      { label: "Piet", href: "/prijzen#piet" },
      { label: "Reed", href: "/prijzen#reed" },
      { label: "Steve", href: "/prijzen#steve" },
      { label: "Prijzen", href: "/prijzen" },
    ],
  },
  {
    heading: "Bedrijf",
    items: [
      { label: "Over ons", href: "/over" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Pers", href: "/pers" },
    ],
  },
  {
    heading: "Juridisch",
    items: [
      { label: "Voorwaarden", href: "/voorwaarden" },
      { label: "Privacy", href: "/privacy" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

export default function WzFooter() {
  return (
    <footer
      className="mt-16 py-12 px-5 sm:px-12"
      style={{ background: "#0f1a2c", color: "#b9c4dc" }}
    >
      <div
        className="max-w-[1200px] mx-auto grid gap-8"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
      >
        <div>
          <div className="mb-3.5">
            <WzLogo />
          </div>
          <p className="text-[13px] leading-[1.6] max-w-[260px]" style={{ color: "#8998b9" }}>
            48 uur vooruit. De rest is ruis. Dagelijks weer voor Nederland, zonder reclame.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <div
              className="mb-3.5 text-xs font-extrabold uppercase tracking-[0.1em]"
              style={{ color: "#fff" }}
            >
              {col.heading}
            </div>
            <ul className="list-none p-0 m-0 grid gap-2">
              {col.items.map((i) => (
                <li key={i.label}>
                  <Link
                    href={i.href}
                    className="text-sm no-underline hover:underline"
                    style={{ color: "#8998b9" }}
                  >
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        className="max-w-[1200px] mx-auto mt-8 pt-6 border-t text-xs"
        style={{ borderColor: "rgba(255,255,255,0.08)", color: "#6b7997" }}
      >
        © {new Date().getFullYear()} Weerzone · Made with ☀ in Nederland
      </div>
    </footer>
  );
}
