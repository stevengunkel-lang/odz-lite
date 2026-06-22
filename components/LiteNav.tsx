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
    <nav className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-slate-950 via-slate-950/78 to-transparent" />

      <div className="pointer-events-auto relative mx-auto w-[calc(100%-0.35rem)] max-w-[26rem] overflow-hidden rounded-[2rem] border border-rose-200/18 bg-slate-950/88 p-2 shadow-2xl shadow-black/55 backdrop-blur-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.16),transparent_42%)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.055] via-transparent to-black/20" />

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
