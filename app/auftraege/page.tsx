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

const objektArten = [
  "Kein Auftrag / Allgemein",
  "Wohnung",
  "Haus",
  "Büro",
  "Eigene Eingabe",
];

const arbeitsArten = [
  "Reinigung",
  "Fensterputzen",
  "Endreinigung",
  "Reitstall",
  "Sonstiges",
  "Eigene Eingabe",
];

export default function AuftraegePage() {
  const [userId, setUserId] = useState("");
  const [kunden, setKunden] = useState<Kunde[]>([]);
  const [auftraege, setAuftraege] = useState<Auftrag[]>([]);

  const [kundeId, setKundeId] = useState("");
  const [objektArt, setObjektArt] = useState("Kein Auftrag / Allgemein");
  const [eigeneObjektArt, setEigeneObjektArt] = useState("");
  const [arbeitsArt, setArbeitsArt] = useState("Reinigung");
  const [eigeneArbeitsArt, setEigeneArbeitsArt] = useState("");
  const [ort, setOrt] = useState("");
  const [beschreibung, setBeschreibung] = useState("");

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

    setLoading(false);

    if (auftraegeError) {
      setMeldung(auftraegeError.message);
      return;
    }

    setAuftraege((auftraegeData || []) as Auftrag[]);
  }

  const aktiveAuftraege = useMemo(
    () => auftraege.filter((auftrag) => auftrag.status === "Aktiv"),
    [auftraege]
  );

  const abgeschlosseneAuftraege = useMemo(
    () => auftraege.filter((auftrag) => auftrag.status === "Abgeschlossen"),
    [auftraege]
  );

  function kundeName(id: string) {
    return kunden.find((kunde) => kunde.id === id)?.name || "Unbekannter Kunde";
  }

  function finalerObjektName() {
    if (objektArt === "Eigene Eingabe") {
      return eigeneObjektArt.trim() || "Eigener Auftrag";
    }

    if (objektArt === "Kein Auftrag / Allgemein") {
      return "Allgemeiner Auftrag";
    }

    return objektArt;
  }

  function finaleArbeitsArt() {
    if (arbeitsArt === "Eigene Eingabe") {
      return eigeneArbeitsArt.trim() || "Sonstiges";
    }

    return arbeitsArt;
  }

  function formularLeeren() {
    setObjektArt("Kein Auftrag / Allgemein");
    setEigeneObjektArt("");
    setArbeitsArt("Reinigung");
    setEigeneArbeitsArt("");
    setOrt("");
    setBeschreibung("");
    setBearbeitenId(null);

    if (kunden.length > 0) {
      setKundeId(kunden[0].id);
    }
  }

  async function speichern() {
    setMeldung("");

    if (!userId) {
      setMeldung("Kein Benutzer gefunden.");
      return;
    }

    if (!kundeId) {
      setMeldung("Bitte zuerst einen Kunden auswählen.");
      return;
    }

    const payload = {
      user_id: userId,
      kunde_id: kundeId,
      name: finalerObjektName(),
      ort: ort.trim() || null,
      art: finaleArbeitsArt(),
      beschreibung: beschreibung.trim() || null,
      status: "Aktiv",
    };

    setSpeichernLoading(true);

    if (bearbeitenId) {
      const { error } = await supabase
        .from("auftraege")
        .update(payload)
        .eq("id", bearbeitenId)
        .eq("user_id", userId);

      setSpeichernLoading(false);

      if (error) {
        setMeldung(error.message);
        return;
      }

      formularLeeren();
      setMeldung("Auftrag aktualisiert.");
      await ladeDaten();
      return;
    }

    const { error } = await supabase.from("auftraege").insert(payload);

    setSpeichernLoading(false);

    if (error) {
      setMeldung(error.message);
      return;
    }

    formularLeeren();
    setMeldung("Auftrag gespeichert.");
    await ladeDaten();
  }

  function bearbeiten(auftrag: Auftrag) {
    setBearbeitenId(auftrag.id);
    setKundeId(auftrag.kunde_id);

    const name = auftrag.name || "Allgemeiner Auftrag";

    if (
      name === "Wohnung" ||
      name === "Haus" ||
      name === "Büro" ||
      name === "Allgemeiner Auftrag"
    ) {
      setObjektArt(
        name === "Allgemeiner Auftrag" ? "Kein Auftrag / Allgemein" : name
      );
      setEigeneObjektArt("");
    } else {
      setObjektArt("Eigene Eingabe");
      setEigeneObjektArt(name);
    }

    const art = auftrag.art || "Reinigung";

    if (
      art === "Reinigung" ||
      art === "Fensterputzen" ||
      art === "Endreinigung" ||
      art === "Reitstall" ||
      art === "Sonstiges"
    ) {
      setArbeitsArt(art);
      setEigeneArbeitsArt("");
    } else {
      setArbeitsArt("Eigene Eingabe");
      setEigeneArbeitsArt(art);
    }

    setOrt(auftrag.ort || "");
    setBeschreibung(auftrag.beschreibung || "");
    setMeldung("Auftrag kann jetzt bearbeitet werden.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function statusWechseln(auftrag: Auftrag) {
    const neuerStatus =
      auftrag.status === "Aktiv" ? "Abgeschlossen" : "Aktiv";

    const { error } = await supabase
      .from("auftraege")
      .update({ status: neuerStatus })
      .eq("id", auftrag.id)
      .eq("user_id", userId);

    if (error) {
      setMeldung(error.message);
      return;
    }

    setMeldung(
      neuerStatus === "Aktiv"
        ? "Auftrag wieder aktiviert."
        : "Auftrag abgeschlossen."
    );

    await ladeDaten();
  }

  async function loeschen(id: string) {
    const sicher = confirm("Auftrag wirklich löschen?");
    if (!sicher) return;

    const { error } = await supabase
      .from("auftraege")
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

    setMeldung("Auftrag gelöscht.");
    await ladeDaten();
  }

  function AuftragKarte({ auftrag }: { auftrag: Auftrag }) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-black">
              {auftrag.name || "Allgemeiner Auftrag"}
            </p>

            <p className="mt-1 text-sm text-white/55">
              {kundeName(auftrag.kunde_id)}
              {auftrag.ort ? ` · ${auftrag.ort}` : ""}
            </p>

            {auftrag.art && (
              <p className="mt-2 inline-flex rounded-2xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-rose-100">
                {auftrag.art}
              </p>
            )}

            {auftrag.beschreibung && (
              <p className="mt-3 text-sm text-white/50">
                {auftrag.beschreibung}
              </p>
            )}
          </div>

          <div
            className={
              auftrag.status === "Aktiv"
                ? "rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-black text-emerald-100"
                : "rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/50"
            }
          >
            {auftrag.status}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={() => bearbeiten(auftrag)}
            className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-2 py-3 text-[10px] font-black uppercase tracking-widest text-rose-100"
          >
            Bearb.
          </button>

          <button
            onClick={() => statusWechseln(auftrag)}
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-2 py-3 text-[10px] font-black uppercase tracking-widest text-white/70"
          >
            {auftrag.status === "Aktiv" ? "Fertig" : "Aktiv"}
          </button>

          <button
            onClick={() => loeschen(auftrag.id)}
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
            Objekte werden geladen
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md space-y-5 px-4 pt-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
      <section className="relative flex min-h-[330px] flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-rose-300/[0.16] via-white/[0.04] to-black/30 p-6 shadow-2xl shadow-black/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.24),transparent_35%)]" />

        <div className="relative z-10 flex flex-1 flex-col justify-between gap-5">
          <div>
            <LiteLogo small />

            <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
              Objekte
            </h1>

            <p className="mt-2 text-sm font-medium leading-6 text-white/65">
              Aufträge oder Objekte optional erfassen. Einsätze können auch ohne
              Objekt gespeichert werden.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-3xl border border-white/10 bg-black/25 p-2 text-center backdrop-blur-xl">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xl font-black text-rose-100">
                {auftraege.length}
              </p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/45">
                Gesamt
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xl font-black text-white">
                {aktiveAuftraege.length}
              </p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/45">
                Aktiv
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xl font-black text-white">
                {abgeschlosseneAuftraege.length}
              </p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/45">
                Fertig
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-200">
          {bearbeitenId ? "Objekt bearbeiten" : "Neues Objekt"}
        </p>

        <h2 className="mt-1 text-2xl font-black">
          {bearbeitenId ? "Objekt ändern" : "Objekt anlegen"}
        </h2>

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
              value={objektArt}
              onChange={(e) => setObjektArt(e.target.value)}
            >
              {objektArten.map((art) => (
                <option key={art} value={art}>
                  {art}
                </option>
              ))}
            </select>

            {objektArt === "Eigene Eingabe" && (
              <input
                className="dark-input text-base"
                placeholder="Eigene Objektart, z.B. Praxis, Laden, Ferienwohnung"
                value={eigeneObjektArt}
                onChange={(e) => setEigeneObjektArt(e.target.value)}
              />
            )}

            <select
              className="dark-input text-base"
              value={arbeitsArt}
              onChange={(e) => setArbeitsArt(e.target.value)}
            >
              {arbeitsArten.map((art) => (
                <option key={art} value={art}>
                  {art}
                </option>
              ))}
            </select>

            {arbeitsArt === "Eigene Eingabe" && (
              <input
                className="dark-input text-base"
                placeholder="Eigene Art, z.B. Stall, Praxisreinigung"
                value={eigeneArbeitsArt}
                onChange={(e) => setEigeneArbeitsArt(e.target.value)}
              />
            )}

            <input
              className="dark-input text-base"
              placeholder="Ort optional"
              value={ort}
              onChange={(e) => setOrt(e.target.value)}
            />

            <textarea
              className="dark-input min-h-24 resize-none text-base"
              placeholder="Beschreibung optional"
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
            />

            <button
              onClick={speichern}
              disabled={speichernLoading}
              className="w-full rounded-3xl bg-gradient-to-r from-rose-300 to-pink-400 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-2xl shadow-rose-950/40 disabled:opacity-50"
            >
              {speichernLoading
                ? "Speichern..."
                : bearbeitenId
                ? "Änderungen speichern"
                : "Objekt speichern"}
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

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-200">
          Aktiv
        </p>

        <h2 className="mt-1 text-2xl font-black">Aktive Objekte</h2>

        <div className="mt-4 space-y-3">
          {aktiveAuftraege.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white/55">
              Keine aktiven Objekte gespeichert.
            </div>
          ) : (
            aktiveAuftraege.map((auftrag) => (
              <AuftragKarte key={auftrag.id} auftrag={auftrag} />
            ))
          )}
        </div>
      </section>

      {abgeschlosseneAuftraege.length > 0 && (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
            Archiv
          </p>

          <h2 className="mt-1 text-2xl font-black">Abgeschlossene Objekte</h2>

          <div className="mt-4 space-y-3">
            {abgeschlosseneAuftraege.map((auftrag) => (
              <AuftragKarte key={auftrag.id} auftrag={auftrag} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}