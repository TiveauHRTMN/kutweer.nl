import Link from "next/link";
import { LogoFull } from "../Logo";

export default function WzFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="px-4 sm:px-6 pt-6 pb-10">
      <div className="max-w-[1200px] mx-auto card p-6 sm:p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="col-span-2">
            <LogoFull height={28} className="mb-4 opacity-90" />
            <p className="text-slate-500 text-xs max-w-xs leading-relaxed font-medium uppercase tracking-wider">
              HET EERLIJKE WEERBERICHT.<br/>
              48 UUR VOORUIT. DE REST IS RUIS.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li><Link href="/prijzen" className="text-sm text-slate-700 hover:text-slate-900 transition-colors">Prijzen</Link></li>
              <li><Link href="/mijnweer" className="text-sm text-slate-700 hover:text-slate-900 transition-colors">Mijn Weer</Link></li>
              <li><Link href="/waarschuwingen" className="text-sm text-slate-700 hover:text-slate-900 transition-colors">Waarschuwingen</Link></li>
              <li><Link href="/zakelijk" className="text-sm text-slate-700 hover:text-slate-900 transition-colors">Zakelijk</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="text-sm text-slate-700 hover:text-slate-900 transition-colors">Privacy</Link></li>
              <li><Link href="/contact" className="text-sm text-slate-700 hover:text-slate-900 transition-colors">Contact</Link></li>
              <li><Link href="/over" className="text-sm text-slate-700 hover:text-slate-900 transition-colors">Over</Link></li>
              <li><Link href="/" className="text-sm text-slate-700 hover:text-slate-900 transition-colors">Homepage</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            © {currentYear} WEERZONE.nl — POWERED BY TIVEAU
          </span>
        </div>
      </div>
    </footer>
  );
}
