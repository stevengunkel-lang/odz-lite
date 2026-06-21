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
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-md border-t border-white/10 bg-slate-950/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-2xl">
      <div className="grid h-14 grid-cols-6 gap-1 text-center">
        {navItems.map((item) => {
          const aktiv = istAktiv(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={aktiv ? "page" : undefined}
              className={[
                "flex h-14 min-w-0 select-none items-center justify-center rounded-2xl border px-1 text-[9px] font-black uppercase leading-none tracking-[0.08em]",
                "transition-[background-color,border-color,color,box-shadow] duration-200 ease-out",
                aktiv
                  ? "border-rose-300/35 bg-rose-300/15 text-rose-100 shadow-[0_0_22px_rgba(251,113,133,0.22)]"
                  : "border-white/10 bg-white/[0.04] text-white/55 shadow-none hover:border-rose-300/20 hover:bg-rose-300/10 hover:text-rose-100",
              ].join(" ")}
            >
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}