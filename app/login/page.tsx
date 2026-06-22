"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import LiteLogo from "../../components/LiteLogo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [meldung, setMeldung] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setMeldung("");

    if (!email || !passwort) {
      setMeldung("Bitte E-Mail und Passwort eingeben.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: passwort,
    });

    setLoading(false);

    if (error) {
      setMeldung(error.message);
      return;
    }

    window.location.href = "/";
  }

  async function registrieren() {
    setMeldung("");

    if (!email || !passwort) {
      setMeldung("Bitte E-Mail und Passwort eingeben.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: passwort,
    });

    setLoading(false);

    if (error) {
      setMeldung(error.message);
      return;
    }

    setMeldung("Account erstellt. Du kannst dich jetzt einloggen.");
  }

  function beiEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      login();
    }
  }

  return (
    <main className="min-h-dvh overflow-hidden bg-slate-950 px-4 py-[calc(1.25rem+env(safe-area-inset-top))] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(251,113,133,0.22),transparent_34%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#020617_100%)]" />
      <div className="pointer-events-none fixed inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-rose-200/40 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-2.5rem-env(safe-area-inset-top))] w-full max-w-md items-center">
        <section className="relative w-full overflow-hidden rounded-[2rem] border border-rose-200/20 bg-gradient-to-br from-rose-300/[0.18] via-white/[0.055] to-slate-950/74 p-5 shadow-2xl shadow-black/50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.32),transparent_38%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(244,114,182,0.18),transparent_42%)]" />
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-rose-200/40 to-transparent" />

          <div className="relative z-10">
            <LiteLogo small />

            <h1 className="mt-6 text-[2.15rem] font-black leading-none tracking-tight text-white">
              Willkommen
            </h1>

            <p className="mt-3 max-w-xs text-[13px] font-semibold leading-6 text-white/65">
              Einloggen und Kunden, Termine, Einsätze und Monatszeit-Abrechnung
              sicher speichern.
            </p>

            <div className="mt-6 rounded-[1.7rem] border border-white/10 bg-black/32 p-1.5 shadow-inner shadow-black/30 backdrop-blur-xl">
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="flex h-[62px] flex-col items-center justify-center rounded-[1.25rem] border border-rose-200/10 bg-white/[0.055] px-1">
                  <p className="text-lg font-black leading-none text-rose-100">
                    ODZ.
                  </p>
                  <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/45">
                    Lite
                  </p>
                </div>

                <div className="flex h-[62px] flex-col items-center justify-center rounded-[1.25rem] border border-rose-200/10 bg-white/[0.055] px-1">
                  <p className="text-lg font-black leading-none text-white">
                    iOS
                  </p>
                  <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/45">
                    App
                  </p>
                </div>

                <div className="flex h-[62px] flex-col items-center justify-center rounded-[1.25rem] border border-rose-200/10 bg-white/[0.055] px-1">
                  <p className="text-lg font-black leading-none text-white">
                    Live
                  </p>
                  <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/45">
                    Cloud
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <input
                className="dark-input text-base"
                type="email"
                placeholder="E-Mail"
                autoComplete="email"
                value={email}
                onKeyDown={beiEnter}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="dark-input text-base"
                type="password"
                placeholder="Passwort"
                autoComplete="current-password"
                value={passwort}
                onKeyDown={beiEnter}
                onChange={(e) => setPasswort(e.target.value)}
              />

              <button
                onClick={login}
                disabled={loading}
                className="w-full rounded-3xl border border-rose-100/30 bg-gradient-to-r from-rose-200 via-rose-300 to-pink-400 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-2xl shadow-rose-950/40 disabled:opacity-50"
              >
                {loading ? "Bitte warten..." : "Einloggen"}
              </button>

              <button
                onClick={registrieren}
                disabled={loading}
                className="w-full rounded-3xl border border-white/10 bg-white/[0.045] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white/70 shadow-xl shadow-black/20 disabled:opacity-50"
              >
                Account erstellen
              </button>

              {meldung && (
                <div className="rounded-3xl border border-white/10 bg-black/25 p-4 text-sm font-bold leading-6 text-white/75">
                  {meldung}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
