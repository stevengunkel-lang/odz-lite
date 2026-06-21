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

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <section className="w-full rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
          <LiteLogo />

          <h1 className="mt-7 text-4xl font-black tracking-tight text-white">
            Login
          </h1>

          <p className="mt-2 text-sm leading-6 text-white/60">
            Einloggen und deine Kunden, Termine, Einsätze und Abrechnungen
            sicher speichern.
          </p>

          <div className="mt-6 space-y-3">
            <input
              className="dark-input"
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="dark-input"
              type="password"
              placeholder="Passwort"
              value={passwort}
              onChange={(e) => setPasswort(e.target.value)}
            />

            <button
              onClick={login}
              disabled={loading}
              className="w-full rounded-3xl bg-gradient-to-r from-rose-300 to-pink-400 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-2xl shadow-rose-950/40 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Bitte warten..." : "Einloggen"}
            </button>

            <button
              onClick={registrieren}
              disabled={loading}
              className="w-full rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white/70 active:scale-[0.99] disabled:opacity-50"
            >
              Account erstellen
            </button>

            {meldung && (
              <div className="rounded-3xl border border-white/10 bg-black/25 p-4 text-sm font-bold text-white/75">
                {meldung}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}