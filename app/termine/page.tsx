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

type Auftrag = {
  id: string;
  user_id: string;
  kunde_id: string;
  name: string | null;
  ort: string | null;
  art: string | null;
  beschreibung: string | null;
  status: "Aktiv" | "Abgeschlossen";
  created_at: string;
};

type Termin = {
  id: string;
  user_id: string;
  kunde_id: string;
  auftrag_id: string | null;
  datum: string;
  von: string;
  bis: string;
  notiz: string | null;
  status: "Geplant" | "Erledigt";
  created_at: string;
};

function heuteISO() {
  const heute = new Date();
  const jahr = heute.getFullYear();
  const monat = String(heute.getMonth() + 1).padStart(2, "0");
  const tag = String(heute.getDate()).padStart(2, "0");

  return `${jahr}-${monat}-${tag}`;
}

function formatiereDatum(datum: string) {
  return new Date(`${datum}T12:00:00`).toLocaleDateString("de-CH", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function TerminePage() {
  const [userId, setUserId] = useState("");
  const [kunden, setKunden] = useState<Kunde[]>([]);
  const [auftraege, setAuftraege] = useState<Auftrag[]>([]);
  const [termine, setTermine] = useState<Termin[]>([]);

  const [kundeId, setKundeId] = useState("");
  const [auftragId, setAuftragId] = useState("");
  const [datum, setDatum] = useState(heuteISO());
  const [von, setVon] = useState("08:00");
  const [bis, setBis] = useState("10:00");
  const [notiz, setNotiz] = useState("");

  const [meldung, setMeldung] = useState("");
  const [loading, setLoading] = useState(true);
  const [speichernLoading, setSpeichernLoading] = useState(false);
  const [bearbeitenId, setBearbeitenId] = useState<string | null>(null);

  useEffect(() => {
    ladeDaten();
  }, []);

  async function ladeDaten() {
    setLoading(true);
    setMeldung("");

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/login";
      return;
    }

    setUserId(userData.user.id);

    const { data: kundenData, error: kundenError } = await supabase
      .from("kunden")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (kundenError) {
      setMeldung(kundenError.message);
      setLoading(false);
      return;
    }

    const geladeneKunden = (kundenData || []) as Kunde[];
    setKunden(geladeneKunden);

    if (geladeneKunden.length > 0 && !kundeId) {
      setKundeId(geladeneKunden[0].id);
    }

    const { data: auftraegeData, error: auftraegeError } = await supabase
      .from("auftraege")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (auftraegeError) {
      setMeldung(auftraegeError.message);
      setLoading(false);
      return;
    }

    setAuftraege((auftraegeData || []) as Auftrag[]);

    const { data: termineData, error: termineError } = await supabase
      .from("termine")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("datum", { ascending: true })
      .order("von", { ascending: true });

    setLoading(false);

    if (termineError) {
      setMeldung(termineError.message);
      return;
    }

    setTermine((termineData || []) as Termin[]);
  }

  const aktiveAuftraege = useMemo(
    () => auftraege.filter((auftrag) => auftrag.status === "Aktiv"),
    [auftraege]
  );

  const passendeAuftraege = useMemo(
    () => aktiveAuftraege.filter((auftrag) => auftrag.kunde_id === kundeId),
    [aktiveAuftraege, kundeId]
  );

  useEffect(() => {
    if (!kundeId) {
      setAuftragId("");
      return;
    }

    const passtNoch = passendeAuftraege.some(
      (auftrag) => auftrag.id === auftragId
    );

    if (!passtNoch) {
      setAuftragId("");
    }
  }, [kundeId, passendeAuftraege, auftragId]);

  const geplanteTermine = useMemo(() => {
    return termine
      .filter((termin) => termin.status === "Geplant")
      .sort((a, b) => {
        const datumVergleich = a.datum.localeCompare(b.datum);
        if (datumVergleich !== 0) return datumVergleich;
        return a.von.localeCompare(b.von);
      });
  }, [termine]);

  const erledigteTermine = useMemo(() => {
    return termine
      .filter((termin) => termin.status === "Erledigt")
      .sort((a, b) => b.datum.localeCompare(a.datum))
      .slice(0, 10);
  }, [termine]);

  const heuteTermine = useMemo(
    () => geplanteTermine.filter((termin) => termin.datum === heuteISO()),
    [geplanteTermine]
  );

  const terminKunden = useMemo(() => {
    return new Set(geplanteTermine.map((termin) => termin.kunde_id)).size;
  }, [geplanteTermine]);

  function kundeName(id: string) {
    return kunden.find((kunde) => kunde.id === id)?.name || "Unbekannter Kunde";
  }

  function auftragName(id?: string | null) {
    if (!id) return "Allgemein";

    return auftraege.find((auftrag) => auftrag.id === id)?.name || "Allgemein";
  }

  function auftragOrt(id?: string | null) {
    if (!id) return "";
    return auftraege.find((auftrag) => auftrag.id === id)?.ort || "";
  }

  function formularLeeren() {
    setBearbeitenId(null);
    setDatum(heuteISO());
    setVon("08:00");
    setBis("10:00");
    setNotiz("");

    if (kunden.length > 0) {
      setKundeId(kunden[0].id);
    }

    setAuftragId("");
  }

  async function speichern() {
    setMeldung("");

    if (!userId) {
      setMeldung("Kein Benutzer gefunden.");
      return;
    }

    if (kunden.length === 0) {
      setMeldung("Bitte zuerst einen Kunden anlegen.");
      return;
    }

    if (!kundeId || !datum || !von || !bis) {
      setMeldung("Bitte Kunde, Datum und Zeit ausfüllen.");
      return;
    }

    if (bis <= von) {
      setMeldung("Bitte gültige Von/Bis-Zeit eingeben.");
      return;
    }

    const payload = {
      user_id: userId,
      kunde_id: kundeId,
      auftrag_id: auftragId || null,
      datum,
      von,
      bis,
      notiz: notiz.trim() || null,
    };

    setSpeichernLoading(true);

    if (bearbeitenId) {
      const { error } = await supabase
        .from("termine")
        .update(payload)
        .eq("id", bearbeitenId)
        .eq("user_id", userId);

      setSpeichernLoading(false);

      if (error) {
        setMeldung(error.message);
        return;
      }

      formularLeeren();
      setMeldung("Termin aktualisiert.");
      await ladeDaten();
      return;
    }

    const { error } = await supabase.from("termine").insert({
      ...payload,
      status: "Geplant",
    });

    setSpeichernLoading(false);

    if (error) {
      setMeldung(error.message);
      return;
    }

    setVon("08:00");
    setBis("10:00");
    setNotiz("");
    setMeldung("Termin gespeichert.");
    await ladeDaten();
  }

  function bearbeiten(termin: Termin) {
    setBearbeitenId(termin.id);
    setKundeId(termin.kunde_id);
    setAuftragId(termin.auftrag_id || "");
    setDatum(termin.datum);
    setVon(termin.von.slice(0, 5));
    setBis(termin.bis.slice(0, 5));
    setNotiz(termin.notiz || "");
    setMeldung("Termin kann jetzt bearbeitet werden.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function statusWechseln(termin: Termin) {
    const neuerStatus =
      termin.status === "Geplant" ? "Erledigt" : "Geplant";

    const { error } = await supabase
      .from("termine")
      .update({ status: neuerStatus })
      .eq("id", termin.id)
      .eq("user_id", userId);

    if (error) {
      setMeldung(error.message);
      return;
    }

    setMeldung(
      neuerStatus === "Geplant"
        ? "Termin wieder geplant."
        : "Termin erledigt."
    );

    await ladeDaten();
  }

  async function loeschen(id: string) {
    const sicher = confirm("Termin wirklich löschen?");
    if (!sicher) return;

    const { error } = await supabase
      .from("termine")
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

    setMeldung("Termin gelöscht.");
    await ladeDaten();
  }

  function TerminKarte({ termin }: { termin: Termin }) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-black">{kundeName(termin.kunde_id)}</p>

            <p className="mt-1 text-sm text-white/55">
              {auftragName(termin.auftrag_id)}
              {auftragOrt(termin.auftrag_id)
                ? ` · ${auftragOrt(termin.auftrag_id)}`
                : ""}
            </p>
          </div>

          <div
            className={
              termin.status === "Geplant"
                ? "rounded-2xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs font-black text-rose-100"
                : "rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-black text-emerald-100"
            }
          >
            {termin.status}
          </div>
        </div>

        <p className="mt-3 text-xs font-bold uppercase tracking-[0.15em] text-white/40">
          {formatiereDatum(termin.datum)} · {termin.von.slice(0, 5)} -{" "}
          {termin.bis.slice(0, 5)}
        </p>

        {termin.notiz && (
          <p className="mt-2 text-sm text-white/55">{termin.notiz}</p>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={() => bearbeiten(termin)}
            className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-2 py-3 text-[10px] font-black uppercase tracking-widest text-rose-100"
          >
            Bearb.
          </button>

          <button
            onClick={() => statusWechseln(termin)}
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-2 py-3 text-[10px] font-black uppercase tracking-widest text-white/70"
          >
            {termin.status === "Geplant" ? "Erledigt" : "Planen"}
          </button>

          <button
            onClick={() => loeschen(termin.id)}
            className="rounded-2xl border border-red-300/20 bg-red-300/10 px-2 py-3 text-[10px] font-black uppercase tracking-widest text-red-100"
          >
            Löschen
          </button>
        </div>
      </div>
    );
  }

  if (false && loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] border border-rose-300/20 bg-rose-300/10 text-2xl font-black text-rose-100">
            ODZ.
          </div>

          <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-white/40">
            Termine werden geladen
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
            Termine
          </h1>

          <p className="mt-3 max-w-xs text-[13px] font-semibold leading-6 text-white/65">
            Einsätze planen, bearbeiten und später direkt im Kalender behalten.
          </p>
        </div>

        <div className="relative z-10 mt-5 grid grid-cols-4 gap-1.5 rounded-[1.7rem] border border-white/10 bg-black/32 p-1.5 text-center shadow-inner shadow-black/30 backdrop-blur-xl">
          <div className="flex h-[62px] flex-col items-center justify-center rounded-[1.25rem] border border-rose-200/10 bg-white/[0.055] px-1">
            <p className="text-lg font-black leading-none text-rose-100 tabular-nums">
              {heuteTermine.length}
            </p>
            <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/45">
              Heute
            </p>
          </div>

          <div className="flex h-[62px] flex-col items-center justify-center rounded-[1.25rem] border border-rose-200/10 bg-white/[0.055] px-1">
            <p className="text-lg font-black leading-none text-white tabular-nums">
              {geplanteTermine.length}
            </p>
            <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/45">
              Offen
            </p>
          </div>

          <div className="flex h-[62px] flex-col items-center justify-center rounded-[1.25rem] border border-rose-200/10 bg-white/[0.055] px-1">
            <p className="text-lg font-black leading-none text-white tabular-nums">
              {erledigteTermine.length}
            </p>
            <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/45">
              Erledigt
            </p>
          </div>

          <div className="flex h-[62px] flex-col items-center justify-center rounded-[1.25rem] border border-rose-200/10 bg-white/[0.055] px-1">
            <p className="text-lg font-black leading-none text-white tabular-nums">
              {terminKunden}
            </p>
            <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/45">
              Kunden
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.85rem] border border-rose-200/10 bg-white/[0.052] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-200">
          {bearbeitenId ? "Termin bearbeiten" : "Neuer Termin"}
        </p>

        <h2 className="mt-1 text-2xl font-black">
          {bearbeitenId ? "Termin ändern" : "Termin eintragen"}
        </h2>

        <p className="mt-1 text-sm text-white/55">
          Kunde, Datum und Zeit reichen. Auftrag und Notiz bleiben optional.
        </p>

        {kunden.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm font-bold text-yellow-100">
            Bitte zuerst unter „Kunden“ einen Kunden anlegen.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <select
              className="dark-input text-base"
              value={kundeId}
              onChange={(e) => setKundeId(e.target.value)}
            >
              {kunden.map((kunde) => (
                <option key={kunde.id} value={kunde.id}>
                  {kunde.name}
                </option>
              ))}
            </select>

            <select
              className="dark-input text-base"
              value={auftragId}
              onChange={(e) => setAuftragId(e.target.value)}
            >
              <option value="">Kein Auftrag / Allgemein</option>

              {passendeAuftraege.map((auftrag) => (
                <option key={auftrag.id} value={auftrag.id}>
                  {auftrag.name || "Allgemeiner Auftrag"}
                  {auftrag.ort ? ` · ${auftrag.ort}` : ""}
                </option>
              ))}
            </select>

            <input
              className="dark-input text-base"
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-widest text-white/45">
                  Von
                </label>
                <input
                  className="dark-input text-base"
                  type="time"
                  value={von}
                  onChange={(e) => setVon(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-widest text-white/45">
                  Bis
                </label>
                <input
                  className="dark-input text-base"
                  type="time"
                  value={bis}
                  onChange={(e) => setBis(e.target.value)}
                />
              </div>
            </div>

            <textarea
              className="dark-input min-h-24 resize-none text-base"
              placeholder="Notiz optional"
              value={notiz}
              onChange={(e) => setNotiz(e.target.value)}
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
                : "Termin speichern"}
            </button>

            {bearbeitenId && (
              <button
                onClick={formularLeeren}
                className="w-full rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white/70"
              >
                Abbrechen
              </button>
            )}
          </div>
        )}

        {meldung && (
          <div className="mt-3 rounded-3xl border border-white/10 bg-black/25 p-4 text-sm font-bold text-white/75">
            {meldung}
          </div>
        )}
      </section>

      <section className="rounded-[1.85rem] border border-rose-200/10 bg-white/[0.052] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-200">
          Heute
        </p>

        <h2 className="mt-1 text-2xl font-black">Heutige Termine</h2>

        <div className="mt-4 space-y-3">
          {heuteTermine.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white/55">
              Heute sind keine Termine geplant.
            </div>
          ) : (
            heuteTermine.map((termin) => (
              <TerminKarte key={termin.id} termin={termin} />
            ))
          )}
        </div>
      </section>

      <section className="rounded-[1.85rem] border border-rose-200/10 bg-white/[0.052] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-200">
          Offen
        </p>

        <h2 className="mt-1 text-2xl font-black">Geplante Termine</h2>

        <div className="mt-4 space-y-3">
          {geplanteTermine.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white/55">
              Keine offenen Termine.
            </div>
          ) : (
            geplanteTermine.map((termin) => (
              <TerminKarte key={termin.id} termin={termin} />
            ))
          )}
        </div>
      </section>

      {erledigteTermine.length > 0 && (
        <section className="rounded-[1.85rem] border border-rose-200/10 bg-white/[0.052] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
            Archiv
          </p>

          <h2 className="mt-1 text-2xl font-black">Erledigte Termine</h2>

          <div className="mt-4 space-y-3">
            {erledigteTermine.map((termin) => (
              <TerminKarte key={termin.id} termin={termin} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
