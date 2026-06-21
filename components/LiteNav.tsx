"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Heute" },
  { href: "/kunden", label: "Kunden" },
  { href: "/auftraege", label: "Objekt" },
  { href: "/termine", label: "Termin" },
  { href: "/auswertung", label: "Abrech." },
  { href: "/profil", label: "Profil" },
];

export default function LiteNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  function istAktiv(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md border-t border-white/10 bg-slate-950/90 px-2 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-2xl">
      <div className="grid grid-cols-6 gap-1 text-center">
        {navItems.map((item) => {
          const aktiv = istAktiv(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                aktiv
                  ? "flex h-14 items-center justify-center rounded-2xl border border-rose-300/35 bg-rose-300/15 px-1 text-[9px] font-black uppercase tracking-[0.08em] text-rose-100 shadow-[0_0_22px_rgba(251,113,133,0.22)] transition-colors duration-200"
                  : "flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/55 transition-colors duration-200 hover:border-rose-300/20 hover:bg-rose-300/10 hover:text-rose-100"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}