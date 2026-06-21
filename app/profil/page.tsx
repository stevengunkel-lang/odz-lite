"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import LiteLogo from "../../components/LiteLogo";

type Profil = {
  id?: string;
  user_id: string;
  name?: string | null;
  firma?: string | null;
  adresse?: string | null;
  email?: string | null;
  telefon?: string | null;
};

export default function ProfilPage() {
  const [userId, setUserId] = useState("");
  const [profilId, setProfilId] = useState("");

  const [name, setName] = useState("");
  const [firma, setFirma] = useState("");
  const [adresse, setAdresse] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");

  const [meldung, setMeldung] = useState("");
  const [loading, setLoading] = useState(true);
  const [speichernLoading, setSpeichernLoading] = useState(false);

  useEffect(() => {
    ladeProfil();
  }, []);

  async function ladeProfil() {
    setLoading(true);
    setMeldung("");

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/login";
      return;
    }

    setUserId(userData.user.id);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (error) {
      setMeldung(error.message);
      setLoading(false);
      return;
    }

    if (data) {
      const profil = data as Profil;

      setProfilId(profil.id || "");
      setName(profil.name || "");
      setFirma(profil.firma || "");
      setAdresse(profil.adresse || "");
      setEmail(profil.email || "");
      setTelefon(profil.telefon || "");
    } else {
      setEmail(userData.user.email || "");
    }

    setLoading(false);
  }

  async function speichern() {
    setMeldung("");

    if (!userId) {
      setMeldung("Kein Benutzer gefunden.");
      return;
    }

    setSpeichernLoading(true);

    const payload = {
      user_id: userId,
      name: name.trim() || null,
      firma: firma.trim() || null,
      adresse: adresse.trim() || null,
      email: email.trim() || null,
      telefon: telefon.trim() || null,
    };

    if (profilId) {
      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", profilId)
        .eq("user_id", userId);

      setSpeichernLoading(false);

      if (error) {
        setMeldung(error.message);
        return;
      }

      setMeldung("Profil gespeichert.");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .insert(payload)
      .select("id")
      .single();

    setSpeichernLoading(false);

    if (error) {
      setMeldung(error.message);
      return;
    }

    setProfilId(data.id);
    setMeldung("Profil gespeichert.");
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function cloudDatenLoeschen() {
    const sicher = confirm(
      "Wirklich alle Kunden, Objekte, Einsätze und Termine in Supabase löschen? Das Profil bleibt erhalten."
    );

    if (!sicher || !userId) return;

    setMeldung("");

    const { error: termineError } = await supabase
      .from("termine")
      .delete()
      .eq("user_id", userId);

    const { error: einsaetzeError } = await supabase
      .from("einsaetze")
      .delete()
      .eq("user_id", userId);

    const { error: auftraegeError } = await supabase
      .from("auftraege")
      .delete()
      .eq("user_id", userId);

    const { error: kundenError } = await supabase
      .from("kunden")
      .delete()
      .eq("user_id", userId);

    const fehler =
      termineError || einsaetzeError || auftraegeError || kundenError;

    if (fehler) {
      setMeldung(fehler.message);
      return;
    }

    setMeldung("Cloud-Testdaten gelöscht. Profil wurde behalten.");
  }

  async function allesLoeschen() {
    const sicher = confirm(
      "Wirklich ALLES löschen? Profil, Kunden, Objekte, Einsätze und Termine werden entfernt."
    );

    if (!sicher || !userId) return;

    const ganzSicher = confirm(
      "Letzte Bestätigung: Alle ODZ. Lite Daten in Supabase löschen?"
    );

    if (!ganzSicher) return;

    setMeldung("");

    await supabase.from("termine").delete().eq("user_id", userId);
    await supabase.from("einsaetze").delete().eq("user_id", userId);
    await supabase.from("auftraege").delete().eq("user_id", userId);
    await supabase.from("kunden").delete().eq("user_id", userId);

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    if (error) {
      setMeldung(error.message);
      return;
    }

    setProfilId("");
    setName("");
    setFirma("");
    setAdresse("");
    setEmail("");
    setTelefon("");

    setMeldung("Alle Cloud-Daten wurden gelöscht.");
  }

  if (false && loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] border border-rose-300/20 bg-rose-300/10 text-2xl font-black text-rose-100">
            ODZ.
          </div>

          <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-white/40">
            Profil wird geladen
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-rose-300/[0.16] via-white/[0.04] to-black/30 p-6 shadow-2xl shadow-black/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.24),transparent_35%)]" />

        <div className="relative z-10">
          <LiteLogo />

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
            Profil
          </h1>

          <p className="mt-2 text-sm font-medium leading-6 text-white/65">
            Angaben für die Monatszeit-Abrechnung und dein ODZ. Lite Konto.
          </p>

          <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Abrechnung von
            </p>

            <p className="mt-1 text-2xl font-black text-rose-100">
              {firma || name || "Noch nicht eingerichtet"}
            </p>

            <p className="mt-1 text-sm text-white/50">
              Wird automatisch auf der PDF angezeigt.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-200">
          Einstellungen
        </p>

        <h2 className="mt-1 text-2xl font-black">Absender einrichten</h2>

        <div className="mt-5 space-y-3">
          <input
            className="dark-input"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="dark-input"
            placeholder="Firma / Geschäftsname optional"
            value={firma}
            onChange={(e) => setFirma(e.target.value)}
          />

          <input
            className="dark-input"
            placeholder="Adresse optional"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
          />

          <input
            className="dark-input"
            placeholder="E-Mail optional"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="dark-input"
            placeholder="Telefon optional"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
          />

          <button
            onClick={speichern}
            disabled={speichernLoading}
            className="w-full rounded-3xl bg-gradient-to-r from-rose-300 to-pink-400 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-2xl shadow-rose-950/40 active:scale-[0.99] disabled:opacity-50"
          >
            {speichernLoading ? "Speichern..." : "Profil speichern"}
          </button>

          {meldung && (
            <div className="rounded-3xl border border-white/10 bg-black/25 p-4 text-sm font-bold text-white/75">
              {meldung}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-200">
          Konto
        </p>

        <h2 className="mt-1 text-2xl font-black">Login</h2>

        <p className="mt-3 text-sm leading-6 text-white/55">
          Du bist angemeldet. Mit Logout kommst du zurück zur Anmeldung.
        </p>

        <button
          onClick={logout}
          className="mt-5 w-full rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white/70 active:scale-[0.99]"
        >
          Logout
        </button>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-200">
          Daten
        </p>

        <h2 className="mt-1 text-2xl font-black">Cloud-Daten löschen</h2>

        <p className="mt-3 text-sm leading-6 text-white/55">
          Vor der Abgabe kannst du Testkunden, Einsätze, Objekte und Termine in
          Supabase löschen. Das Profil kann bleiben.
        </p>

        <div className="mt-5 space-y-3">
          <button
            onClick={cloudDatenLoeschen}
            className="w-full rounded-3xl border border-yellow-300/20 bg-yellow-300/10 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-yellow-100 active:scale-[0.99]"
          >
            Testdaten löschen
          </button>

          <button
            onClick={allesLoeschen}
            className="w-full rounded-3xl border border-red-300/20 bg-red-300/10 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-red-100 active:scale-[0.99]"
          >
            Alles löschen
          </button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-200">
          Speicherung
        </p>

        <h2 className="mt-1 text-2xl font-black">Aktueller Stand</h2>

        <p className="mt-3 text-sm leading-6 text-white/55">
          Dein Profil wird jetzt mit Supabase gespeichert. Als nächstes stellen
          wir Kunden, Objekte, Einsätze, Termine und Abrechnung vollständig auf
          Supabase um.
        </p>
      </section>
    </div>
  );
}