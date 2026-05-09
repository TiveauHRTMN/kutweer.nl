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
      className="mt-6 mb-6 px-8 sm:px-10 pt-14 pb-10"
      style={{
        borderRadius: 20,
        background: "#3b7ff0",
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: "0 12px 40px rgba(59,127,240,0.2)",
        color: "#ffffff",
      }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-4">
            <Link href="/" className="inline-block mb-5 hover:opacity-80 transition-opacity">
              <LogoFull height={28} />
            </Link>
            <p className="text-sm leading-relaxed font-black mb-3 opacity-90">
              Hyperlokaal weer voor keuzes vandaag en morgen.
            </p>
            <a
              href="mailto:info@weerzone.nl"
              className="text-sm font-black transition-colors hover:opacity-70"
            >
              info@weerzone.nl
            </a>
          </div>

          {/* Links */}
          <div className="md:col-span-8 grid grid-cols-2 gap-6">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h4 className="text-[10px] font-black uppercase tracking-[0.22em] mb-4 opacity-50">
                  {section.title}
                </h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[13px] font-black transition-colors hover:opacity-70"
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
        <div className="pt-8 flex flex-col items-center gap-4 border-t border-white/10">
          <span className="text-[13px] font-black uppercase tracking-[0.22em] opacity-40">
            WEERZONE · Powered by Tiveau
          </span>
          <div className="flex flex-wrap justify-center gap-5">
            {SOCIALS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target={href !== "#" ? "_blank" : undefined}
                rel={href !== "#" ? "noopener noreferrer" : undefined}
                className="text-[11px] uppercase font-black tracking-widest transition-colors hover:opacity-70 opacity-60"
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
