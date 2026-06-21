"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import LiteLogo from "./LiteLogo";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [eingeloggt, setEingeloggt] = useState(false);

  useEffect(() => {
    let aktiv = true;

    async function pruefen() {
      const { data } = await supabase.auth.getSession();
      const hatSession = !!data.session;

      if (!aktiv) return;

      setEingeloggt(hatSession);
      setInitialCheckDone(true);

      if (!hatSession && pathname !== "/login") {
        router.replace("/login");
        return;
      }

      if (hatSession && pathname === "/login") {
        router.replace("/");
      }
    }

    pruefen();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const hatSession = !!session;

        setEingeloggt(hatSession);
        setInitialCheckDone(true);

        if (!hatSession && pathname !== "/login") {
          router.replace("/login");
        }

        if (hatSession && pathname === "/login") {
          router.replace("/");
        }
      }
    );

    return () => {
      aktiv = false;
      listener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (!initialCheckDone) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="text-center">
          <LiteLogo />
          <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-white/40">
            App startet
          </p>
        </div>
      </main>
    );
  }

  if (!eingeloggt && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
}