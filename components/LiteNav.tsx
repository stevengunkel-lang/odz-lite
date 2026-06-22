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
    <nav className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom)+0.8rem)]">
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-[linear-gradient(to_top,#020617_0%,rgba(2,6,23,0.96)_34%,rgba(2,6,23,0.72)_62%,rgba(2,6,23,0.28)_82%,transparent_100%)]" />

      <div className="pointer-events-auto relative mx-auto w-[calc(100%-0.35rem)] max-w-[26rem] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/94 p-2 shadow-2xl shadow-black/55 backdrop-blur-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-300/[0.075] via-white/[0.025] to-black/20" />

        <div className="relative grid h-[3.35rem] grid-cols-6 gap-1 text-center">
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
                    ? "border-rose-300/40 bg-rose-300/16 text-rose-100 shadow-[0_0_20px_rgba(251,113,133,0.20)]"
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
