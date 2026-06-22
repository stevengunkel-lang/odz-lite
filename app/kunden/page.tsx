"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import LiteLogo from "../../components/LiteLogo";

type Kunde = {
  id: string;
  user_id: string;
  name: string;
  adresse: string | null;
  email: string | null;
  telefon: string | null;
  stundensatz: number | null;
  created_at: string;
};

export default function KundenPage() {
  const [userId, setUserId] = useState("");
  const [kunden, setKunden] = useState<Kunde[]>([]);

  const [name, setName] = useState("");
  const [adresse, setAdresse] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [stundensatz, setStundensatz] = useState("");

  const [meldung, setMeldung] = useState("");
  const [loading, setLoading] = useState(true);
  const [speichernLoading, setSpeichernLoading] = useState(false);
  const [bearbeitenId, setBearbeitenId] = useState<string | null>(null);

  useEffect(() => {
    ladeKunden();
  }, []);

  async function ladeKunden() {
    setLoading(true);
    setMeldung("");

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/login";
      return;
    }

    setUserId(userData.user.id);

    const { data, error } = await supabase
      .from("kunden")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      setMeldung(error.message);
      return;
    }

    setKunden((data || []) as Kunde[]);
  }

  const kundenMitSatz = useMemo(
    () => kunden.filter((kunde) => Number(kunde.stundensatz || 0) > 0),
    [kunden]
  );

  const kundenOhneSatz = useMemo(
    () => kunden.filter((kunde) => !kunde.stundensatz),
    [kunden]
  );

  const durchschnittSatz = useMemo(() => {
    if (kundenMitSatz.length === 0) return 0;

    const total = kundenMitSatz.reduce(
      (summe, kunde) => summe + Number(kunde.stundensatz || 0),
      0
    );

    return Math.round(total / kundenMitSatz.length);
  }, [kundenMitSatz]);

  function formularLeeren() {
    setName("");
    setAdresse("");
    setEmail("");
    setTelefon("");
    setStundensatz("");
    setBearbeitenId(null);
  }

  async function speichern() {
    setMeldung("");

    if (!userId) {
      setMeldung("Kein Benutzer gefunden.");
      return;
    }

    if (!name.trim()) {
      setMeldung("Bitte Kundennamen eingeben.");
      return;
    }

    const satz = Number(stundensatz || 0);

    const payload = {
      user_id: userId,
      name: name.trim(),
      adresse: adresse.trim() || null,
      email: email.trim() || null,
      telefon: telefon.trim() || null,
      stundensatz: satz > 0 ? satz : null,
    };

    setSpeichernLoading(true);

    if (bearbeitenId) {
      const { error } = await supabase
        .from("kunden")
        .update(payload)
        .eq("id", bearbeitenId)
        .eq("user_id", userId);

      setSpeichernLoading(false);

      if (error) {
        setMeldung(error.message);
        return;
      }

      formularLeeren();
      setMeldung("Kunde aktualisiert.");
      await ladeKunden();
      return;
    }

    const { error } = await supabase.from("kunden").insert(payload);

    setSpeichernLoading(false);

    if (error) {
      setMeldung(error.message);
      return;
    }

    formularLeeren();
    setMeldung("Kunde gespeichert.");
    await ladeKunden();
  }

  function bearbeiten(kunde: Kunde) {
    setBearbeitenId(kunde.id);
    setName(kunde.name || "");
    setAdresse(kunde.adresse || "");
    setEmail(kunde.email || "");
    setTelefon(kunde.telefon || "");
    setStundensatz(kunde.stundensatz ? String(kunde.stundensatz) : "");
    setMeldung("Kunde kann jetzt bearbeitet werden.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function loeschen(id: string) {
    const sicher = confirm("Kunde wirklich löschen?");
    if (!sicher) return;

    const { error } = await supabase
      .from("kunden")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      setMeldung(error.message);
      return;
    }

    if (bearbeitenId === id) {
      formularLeeren();
    }

    setMeldung("Kunde gelöscht.");
    await ladeKunden();
  }

  if (false && loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] border border-rose-300/20 bg-rose-300/10 text-2xl font-black text-rose-100">
            ODZ.
          </div>

          <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-white/40">
            Kunden werden geladen
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <section className="relative mx-auto flex min-h-[292px] w-[calc(100%-0.35rem)] flex-col justify-between overflow-hidden rounded-[2rem] border border-rose-200/20 bg-gradient-to-br from-rose-300/[0.22] via-white/[0.055] to-slate-950/72 p-5 shadow-2xl shadow-black/45">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.34),transparent_38%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(244,114,182,0.20),transparent_42%)]" />
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-rose-200/40 to-transparent" />

        <div className="relative z-10">
          <LiteLogo small />

          <h1 className="mt-4 text-[2.15rem] font-black leading-none tracking-tight text-white">
            Kunden
          </h1>

          <p className="mt-3 max-w-xs text-[13px] font-semibold leading-6 text-white/65">
            Kunden speichern, Stundensatz hinterlegen und die Abrechnung später
            automatisch vorbereiten.
          </p>
        </div>

        <div className="relative z-10 mt-5 grid grid-cols-4 gap-1.5 rounded-[1.7rem] border border-white/10 bg-black/32 p-1.5 text-center shadow-inner shadow-black/30 backdrop-blur-xl">
          <div className="flex h-[62px] flex-col items-center justify-center rounded-[1.25rem] border border-rose-200/10 bg-white/[0.055] px-1">
            <p className="text-lg font-black leading-none text-rose-100 tabular-nums">
              {kunden.length}
            </p>
            <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/45">
              Kunden
            </p>
          </div>

          <div className="flex h-[62px] flex-col items-center justify-center rounded-[1.25rem] border border-rose-200/10 bg-white/[0.055] px-1">
            <p className="text-lg font-black leading-none text-white tabular-nums">
              {kundenMitSatz.length}
            </p>
            <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/45">
              mit Satz
            </p>
          </div>

          <div className="flex h-[62px] flex-col items-center justify-center rounded-[1.25rem] border border-rose-200/10 bg-white/[0.055] px-1">
            <p className="text-lg font-black leading-none text-white tabular-nums">
              {kundenOhneSatz.length}
            </p>
            <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/45">
              offen
            </p>
          </div>

          <div className="flex h-[62px] flex-col items-center justify-center rounded-[1.25rem] border border-rose-200/10 bg-white/[0.055] px-1">
            <p className="text-lg font-black leading-none text-white tabular-nums">
              {durchschnittSatz}
            </p>
            <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/45">
              Ø CHF
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.85rem] border border-rose-200/10 bg-white/[0.052] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-200">
          {bearbeitenId ? "Kunde bearbeiten" : "Neuer Kunde"}
        </p>

        <h2 className="mt-1 text-2xl font-black">
          {bearbeitenId ? "Kunde ändern" : "Kunde anlegen"}
        </h2>

        <p className="mt-1 text-sm text-white/55">
          Name genügt. Adresse, Kontakt und Stundensatz sind optional.
        </p>

        <div className="mt-5 space-y-3">
          <input
            className="dark-input text-base"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="dark-input text-base"
            inputMode="decimal"
            placeholder="Stundensatz CHF/h optional, z.B. 35"
            value={stundensatz}
            onChange={(e) => setStundensatz(e.target.value)}
          />

          <input
            className="dark-input text-base"
            placeholder="Adresse optional"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
          />

          <input
            className="dark-input text-base"
            placeholder="E-Mail optional"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="dark-input text-base"
            placeholder="Telefon optional"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
          />

          <button
            onClick={speichern}
            disabled={speichernLoading}
            className="w-full rounded-3xl border border-rose-100/30 bg-gradient-to-r from-rose-200 via-rose-300 to-pink-400 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-2xl shadow-rose-950/40 disabled:opacity-50"
          >
            {speichernLoading
              ? "Speichern..."
              : bearbeitenId
              ? "Änderungen speichern"
              : "Kunde speichern"}
          </button>

          {bearbeitenId && (
            <button
              onClick={formularLeeren}
              className="w-full rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white/70"
            >
              Abbrechen
            </button>
          )}

          {meldung && (
            <div className="rounded-3xl border border-white/10 bg-black/25 p-4 text-sm font-bold text-white/75">
              {meldung}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[1.85rem] border border-rose-200/10 bg-white/[0.052] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-200">
          Übersicht
        </p>

        <h2 className="mt-1 text-2xl font-black">Gespeicherte Kunden</h2>

        <div className="mt-4 space-y-3">
          {kunden.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white/55">
              Noch keine Kunden gespeichert.
            </div>
          ) : (
            kunden.map((kunde) => (
              <div
                key={kunde.id}
                className="rounded-3xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black">{kunde.name}</p>

                    {kunde.stundensatz ? (
                      <p className="mt-2 inline-flex rounded-2xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-rose-100">
                        {kunde.stundensatz} CHF/h
                      </p>
                    ) : (
                      <p className="mt-2 inline-flex rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase tracking-widest text-white/45">
                        Kein Satz
                      </p>
                    )}

                    {kunde.adresse && (
                      <p className="mt-2 text-sm text-white/55">
                        {kunde.adresse}
                      </p>
                    )}

                    {kunde.email && (
                      <p className="mt-1 text-sm text-white/45">
                        {kunde.email}
                      </p>
                    )}

                    {kunde.telefon && (
                      <p className="mt-1 text-sm text-white/45">
                        {kunde.telefon}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => bearbeiten(kunde)}
                    className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-3 py-3 text-xs font-black uppercase tracking-widest text-rose-100"
                  >
                    Bearbeiten
                  </button>

                  <button
                    onClick={() => loeschen(kunde.id)}
                    className="rounded-2xl border border-red-300/20 bg-red-300/10 px-3 py-3 text-xs font-black uppercase tracking-widest text-red-100"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
