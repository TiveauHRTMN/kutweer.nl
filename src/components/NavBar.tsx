"use client";

import Link from "next/link";
import { Lock, PieChart, AlertTriangle, Building2, CreditCard, LogIn, LogOut } from "lucide-react";
import { useSession } from "@/lib/session-context";

type Props = {
  activeCity?: string;
  isLocating?: boolean;
};

export default function NavBar({ activeCity, isLocating }: Props) {
  const { user, tier } = useSession();
  const hasSub = !!tier;

  const handleLockedClick = (e: React.MouseEvent) => {
    if (!hasSub) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("wz:open-persona-modal"));
    }
  };

  return (
    <nav aria-label="Hoofdnavigatie" className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-lg">
      <ul className="flex items-center justify-between overflow-x-auto no-scrollbar px-2 py-1.5">
        <li className="flex-1">
          <Link
            href="/piet"
            onClick={handleLockedClick}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all hover:bg-white/10 ${!hasSub ? "opacity-60" : ""}`}
          >
            <div className="relative">
              <PieChart className="w-4 h-4 text-white mb-1" />
              {!hasSub && <Lock className="w-2 h-2 text-white absolute -top-1 -right-1" />}
            </div>
            <span className="text-[9px] font-black uppercase tracking-tighter text-white">Piet</span>
          </Link>
        </li>
        <li className="flex-1">
          <Link
            href="/reed"
            onClick={handleLockedClick}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all hover:bg-white/10 ${!hasSub ? "opacity-60" : ""}`}
          >
            <div className="relative">
              <AlertTriangle className="w-4 h-4 text-white mb-1" />
              {!hasSub && <Lock className="w-2 h-2 text-white absolute -top-1 -right-1" />}
            </div>
            <span className="text-[9px] font-black uppercase tracking-tighter text-white">Reed</span>
          </Link>
        </li>
        <li className="flex-1">
          <Link href="/zakelijk" className="flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all hover:bg-white/10">
            <Building2 className="w-4 h-4 text-white mb-1" />
            <span className="text-[9px] font-black uppercase tracking-tighter text-white">Steve</span>
          </Link>
        </li>
        <li className="flex-1">
          <Link href="/prijzen" className="flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all hover:bg-white/10">
            <CreditCard className="w-4 h-4 text-white mb-1" />
            <span className="text-[9px] font-black uppercase tracking-tighter text-white">Prijzen</span>
          </Link>
        </li>
        <li className="flex-1">
          {user ? (
            <button
              onClick={async () => {
                const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
                const supabase = createSupabaseBrowserClient();
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="w-full flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 text-white mb-1" />
              <span className="text-[9px] font-black uppercase tracking-tighter text-white">Logout</span>
            </button>
          ) : (
            <Link href="/app/login" className="flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all hover:bg-white/10">
              <LogIn className="w-4 h-4 text-white mb-1" />
              <span className="text-[9px] font-black uppercase tracking-tighter text-white">Login</span>
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
