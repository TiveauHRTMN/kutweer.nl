import Link from "next/link";
import { LogoFull } from "./Logo";

const SOCIALS = [
  { label: "X",         href: "https://x.com/weerzone" },
  { label: "Instagram", href: "https://www.instagram.com/weerzonenl" },
  { label: "YouTube",   href: "https://youtube.com/@weerzone" },
  { label: "TikTok",    href: "https://www.tiktok.com/@weerzonenl" },
  { label: "Reddit",    href: "https://www.reddit.com/user/No_Slip_3007/" },
  { label: "Wikidata",  href: "https://www.wikidata.org/wiki/Q139675943" },
];

const SECTIONS = [
  {
    title: "Weerzone",
    links: [
      { label: "Over Weerzone",       href: "/over" },
      { label: "Veelgestelde vragen", href: "/over#faq" },
      { label: "Abonnementen",        href: "/prijzen" },
      { label: "Zakelijk",            href: "/zakelijk" },
      { label: "Contact",             href: "/contact" },
    ],
  },
  {
    title: "Info",
    links: [
      { label: "Privacybeleid",       href: "/privacy" },
      { label: "Cookie-instellingen", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      className="mt-12 mb-6 mx-4 sm:mx-6 lg:mx-8 px-8 sm:px-10 pt-14 pb-10"
      style={{
        borderRadius: 28,
        background: "rgba(6,10,18,0.88)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "inset 0 2px 0 rgba(255,255,255,0.05), 0 12px 40px rgba(0,0,0,0.40)",
      }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-4">
            <Link href="/" className="inline-block mb-5">
              <LogoFull height={28} />
            </Link>
            <p className="text-sm leading-relaxed font-medium mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
              Hyperlokaal weer voor keuzes vandaag en morgen.
            </p>
            <a
              href="mailto:info@weerzone.nl"
              className="text-sm font-medium hover:text-white transition-colors"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              info@weerzone.nl
            </a>
          </div>

          {/* Links */}
          <div className="md:col-span-8 grid grid-cols-2 gap-6">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h4
                  className="text-[10px] font-black uppercase tracking-[0.22em] mb-4"
                  style={{ color: "rgba(255,255,255,0.40)" }}
                >
                  {section.title}
                </h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[13px] font-medium hover:text-white transition-colors"
                        style={{ color: "rgba(255,255,255,0.65)" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div
          className="pt-8 flex flex-col items-center gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <span
            className="text-[13px] font-black uppercase tracking-[0.22em]"
            style={{ color: "#ffd21a" }}
          >
            WEERZONE · Powered by Tiveau
          </span>
          <div className="flex flex-wrap justify-center gap-5">
            {SOCIALS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target={href !== "#" ? "_blank" : undefined}
                rel={href !== "#" ? "noopener noreferrer" : undefined}
                className="text-[11px] uppercase font-black tracking-widest hover:text-white transition-colors"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
