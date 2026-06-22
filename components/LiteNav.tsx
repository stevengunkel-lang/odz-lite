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

  function seiteWechseln() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-[9rem] px-4">
      <div className="absolute inset-x-0 bottom-0 h-full bg-[linear-gradient(to_top,#020617_0%,rgba(2,6,23,0.98)_28%,rgba(2,6,23,0.78)_56%,rgba(2,6,23,0.32)_80%,transparent_100%)]" />

      <div className="pointer-events-auto absolute inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+0.85rem)] mx-auto w-[calc(100%-2rem)] max-w-[26rem] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/94 p-2 shadow-2xl shadow-black/55 backdrop-blur-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-300/[0.075] via-white/[0.025] to-black/20" />

        <div className="relative grid h-[3.35rem] grid-cols-6 gap-1 text-center">
          {navItems.map((item) => {
            const aktiv = istAktiv(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                scroll={true}
                onClick={seiteWechseln}
                aria-current={aktiv ? "page" : undefined}
                className={[
                  "flex h-[3.35rem] min-w-0 select-none items-center justify-center rounded-[1.45rem] border px-1 text-[8.5px] font-black uppercase leading-none tracking-[0.08em] outline-none",
                  "transition-colors duration-150 ease-out",
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