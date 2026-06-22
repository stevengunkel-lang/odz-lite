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
    <nav className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.15rem)] left-0 right-0 z-50 px-3">
      <div className="mx-auto w-full max-w-[25.2rem] overflow-hidden rounded-[2rem] border border-rose-200/18 bg-slate-950/90 p-2 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="grid h-[3.35rem] grid-cols-6 gap-1 text-center">
          {navItems.map((item) => {
            const aktiv = istAktiv(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktiv ? "page" : undefined}
                className={[
                  "flex h-[3.35rem] min-w-0 select-none items-center justify-center rounded-[1.45rem] border px-1 text-[8.5px] font-black uppercase leading-none tracking-[0.08em]",
                  "transition-[background-color,border-color,color,box-shadow] duration-200 ease-out",
                  aktiv
                    ? "border-rose-300/40 bg-gradient-to-br from-rose-300/20 to-pink-400/10 text-rose-100 shadow-[0_0_24px_rgba(251,113,133,0.24)]"
                    : "border-white/10 bg-white/[0.035] text-white/55 shadow-none",
                ].join(" ")}
              >
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
