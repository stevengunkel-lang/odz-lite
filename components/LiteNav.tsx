"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LiteNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md border-t border-white/10 bg-slate-950/90 px-2 pb-5 pt-3 backdrop-blur-2xl">
      <div className="grid grid-cols-6 gap-1 text-center text-[9px] font-black uppercase tracking-[0.08em] text-white/55">
        <Link
          href="/"
          className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-1 py-3 text-rose-100"
        >
          Heute
        </Link>

        <Link
          href="/kunden"
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-1 py-3"
        >
          Kunden
        </Link>

        <Link
          href="/auftraege"
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-1 py-3"
        >
          Objekt
        </Link>

        <Link
          href="/termine"
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-1 py-3"
        >
          Termin
        </Link>

        <Link
          href="/auswertung"
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-1 py-3"
        >
          Abrech.
        </Link>

        <Link
          href="/profil"
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-1 py-3"
        >
          Profil
        </Link>
      </div>
    </nav>
  );
}