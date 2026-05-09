import Link from "next/link";
import { LogoFull } from "../Logo";

export default function WzFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="mt-10 mb-10 px-8 sm:px-12 py-12 mx-4 sm:mx-0"
      style={{
        borderRadius: 20,
        background: "#3b7ff0",
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: "0 12px 40px rgba(59,127,240,0.2)",
        color: "#ffffff",
      }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <LogoFull height={32} className="mb-6" />
            <p className="text-xs max-w-xs leading-relaxed font-black uppercase tracking-wider opacity-90">
              HET EERLIJKE WEERBERICHT.<br/>
              48 UUR VOORUIT. DE REST IS RUIS.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-60">Product</h4>
            <ul className="space-y-4">
              <li><Link href="/prijzen" className="text-sm font-black transition-colors hover:opacity-70">Prijzen</Link></li>
              <li><Link href="/mijnweer" className="text-sm font-black transition-colors hover:opacity-70">Mijn Weer</Link></li>
              <li><Link href="/waarschuwingen" className="text-sm font-black transition-colors hover:opacity-70">Waarschuwingen</Link></li>
              <li><Link href="/zakelijk" className="text-sm font-black transition-colors hover:opacity-70">Zakelijk</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-60">Support</h4>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="text-sm font-black transition-colors hover:opacity-70">Privacy</Link></li>
              <li><Link href="/contact" className="text-sm font-black transition-colors hover:opacity-70">Contact</Link></li>
              <li><Link href="/" className="text-sm font-black transition-colors hover:opacity-70">Homepage</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
               © {currentYear} WEERZONE.nl — POWERED BY TIVEAU
             </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
