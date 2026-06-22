"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import LiteLogo from "../components/LiteLogo";

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

type Einsatz = {
  id: string;
  user_id: string;
  kunde_id: string;
  auftrag_id: string | null;
  datum: string;
  von: string;
  bis: string;
  pause: number;
  stunden: number;
  notiz: string | null;
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

function monatVonHeute() {
  return heuteISO().slice(0, 7);
}

function formatiereDatum(datum: string) {
  return new Date(`${datum}T12:00:00`).toLocaleDateString("de-CH", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

function berechneStunden(von: string, bis: string, pause: number) {
  if (!von || !bis) return 0;

  const [vonH, vonM] = von.split(":").map(Number);
  const [bisH, bisM] = bis.split(":").map(Number);

  const start = vonH * 60 + vonM;
  const ende = bisH * 60 + bisM;
  const pauseMinuten = Number(pause || 0) * 60;

  const minuten = ende - start - pauseMinuten;

  if (minuten <= 0) return 0;

  return Math.round((minuten / 60) * 100) / 100;
}

function startDerWoche() {
  const heute = new Date();
  const tag = heute.getDay();
  const diff = tag === 0 ? -6 : 1 - tag;

  const montag = new Date(heute);
  montag.setDate(heute.getDate() + diff);
  montag.setHours(12, 0, 0, 0);

  return montag;
}

function datumISO(datum: Date) {
  const jahr = datum.getFullYear();
  const monat = String(datum.getMonth() + 1).padStart(2, "0");
  const tag = String(datum.getDate()).padStart(2, "0");

  return `${jahr}-${monat}-${tag}`;
}

function tagKurz(datum: Date) {
  return datum.toLocaleDateString("de-CH", {
    weekday: "short",
  });
}

function tagNummer(datum: Date) {
  return datum.toLocaleDateString("de-CH", {
    day: "2-digit",
  });
}

export default function Home() {
  const [userId, setUserId] = useState("");
  const [kunden, setKunden] = useState<Kunde[]>([]);
  const [auftraege, setAuftraege] = useState<Auftrag[]>([]);
  const [einsaetze, setEinsaetze] = useState<Einsatz[]>([]);
  const [termine, setTermine] = useState<Termin[]>([]);

  const [kundeId, setKundeId] = useState("");
  const [auftragId, setAuftragId] = useState("");
  const [datum, setDatum] = useState(heuteISO());
  const [von, setVon] = useState("08:00");
  const [bis, setBis] = useState("12:00");
  const [pause, setPause] = useState("0");
  const [notiz, setNotiz] = useState("");

  const [meldung, setMeldung] = useState("");
  const [loading, setLoading] = useState(true);
  const [speichernLoading, setSpeichernLoading] = useState(false);
  const [bearbeitenId, setBearbeitenId] = useState<string | null>(null);
  const [ausgewaehlterTag, setAusgewaehlterTag] = useState(heuteISO());

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

    const { data: einsaetzeData, error: einsaetzeError } = await supabase
      .from("einsaetze")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("datum", { ascending: false })
      .order("von", { ascending: false });

    if (einsaetzeError) {
      setMeldung(einsaetzeError.message);
      setLoading(false);
      return;
    }

    setEinsaetze((einsaetzeData || []) as Einsatz[]);

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

  const stunden = useMemo(
    () => berechneStunden(von, bis, Number(pause || 0)),
    [von, bis, pause]
  );

  const heuteEinsaetze = useMemo(
    () => einsaetze.filter((eintrag) => eintrag.datum === heuteISO()),
    [einsaetze]
  );

  const heuteTermine = useMemo(
    () =>
      termine
        .filter(
          (termin) =>
            termin.datum === heuteISO() && termin.status === "Geplant"
        )
        .sort((a, b) => a.von.localeCompare(b.von)),
    [termine]
  );

  const letzteEinsaetze = useMemo(() => {
    return [...einsaetze]
      .sort((a, b) => {
        const datumVergleich = b.datum.localeCompare(a.datum);
        if (datumVergleich !== 0) return datumVergleich;
        return b.von.localeCompare(a.von);
      })
      .slice(0, 10);
  }, [einsaetze]);

  const wochenTage = useMemo(() => {
    const montag = startDerWoche();

    return Array.from({ length: 7 }).map((_, index) => {
      const tag = new Date(montag);
      tag.setDate(montag.getDate() + index);

      const iso = datumISO(tag);

      const tagEinsaetze = einsaetze.filter(
        (einsatz) => einsatz.datum === iso
      );

      const tagTermine = termine
        .filter(
          (termin) => termin.datum === iso && termin.status === "Geplant"
        )
        .sort((a, b) => a.von.localeCompare(b.von));

      const tagStunden = tagEinsaetze.reduce(
        (summe, einsatz) => summe + Number(einsatz.stunden || 0),
        0
      );

      return {
        iso,
        label: tagKurz(tag),
        tag: tagNummer(tag),
        eintraege: tagEinsaetze,
        termine: tagTermine,
        stunden: tagStunden,
        istHeute: iso === heuteISO(),
      };
    });
  }, [einsaetze, termine]);

  const tagDetails = useMemo(() => {
    const tag = wochenTage.find((eintrag) => eintrag.iso === ausgewaehlterTag);

    return {
      iso: ausgewaehlterTag,
      label: tag ? `${tag.label}, ${tag.tag}` : "Ausgewählter Tag",
      eintraege: tag?.eintraege || [],
      termine: tag?.termine || [],
      stunden: tag?.stunden || 0,
    };
  }, [wochenTage, ausgewaehlterTag]);

  const monatsEinsaetze = useMemo(
    () =>
      einsaetze.filter((eintrag) =>
        eintrag.datum.startsWith(monatVonHeute())
      ),
    [einsaetze]
  );

  const monatsStunden = useMemo(
    () =>
      monatsEinsaetze.reduce(
        (summe, eintrag) => summe + Number(eintrag.stunden || 0),
        0
      ),
    [monatsEinsaetze]
  );

  const kundenDiesenMonat = useMemo(() => {
    return new Set(monatsEinsaetze.map((eintrag) => eintrag.kunde_id)).size;
  }, [monatsEinsaetze]);

  function kundeName(id: string) {
    return kunden.find((kunde) => kunde.id === id)?.name || "Unbekannter Kunde";
  }

  function auftragName(id?: string | null) {
    if (!id) return "Allgemeiner Einsatz";

    return (
      auftraege.find((auftrag) => auftrag.id === id)?.name ||
      "Allgemeiner Einsatz"
    );
  }

  function auftragOrt(id?: string | null) {
    if (!id) return "";
    return auftraege.find((auftrag) => auftrag.id === id)?.ort || "";
  }

  function auftragArt(id?: string | null) {
    if (!id) return "";
    return auftraege.find((auftrag) => auftrag.id === id)?.art || "";
  }

  function formularLeeren() {
    setBearbeitenId(null);
    setVon("08:00");
    setBis("12:00");
    setPause("0");
    setNotiz("");
    setDatum(heuteISO());

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
      setMeldung("Bitte Kunde und Zeit ausfüllen.");
      return;
    }

    if (stunden <= 0) {
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
      pause: Number(pause || 0),
      stunden,
      notiz: notiz.trim() || null,
    };

    setSpeichernLoading(true);

    if (bearbeitenId) {
      const { error } = await supabase
        .from("einsaetze")
        .update(payload)
        .eq("id", bearbeitenId)
        .eq("user_id", userId);

      setSpeichernLoading(false);

      if (error) {
        setMeldung(error.message);
        return;
      }

      formularLeeren();
      setMeldung("Einsatz aktualisiert.");
      await ladeDaten();
      return;
    }

    const { error } = await supabase.from("einsaetze").insert(payload);

    setSpeichernLoading(false);

    if (error) {
      setMeldung(error.message);
      return;
    }

    setVon("08:00");
    setBis("12:00");
    setPause("0");
    setNotiz("");
    setMeldung("Einsatz gespeichert.");
    await ladeDaten();
  }

  function bearbeiten(eintrag: Einsatz) {
    setBearbeitenId(eintrag.id);
    setKundeId(eintrag.kunde_id);
    setAuftragId(eintrag.auftrag_id || "");
    setDatum(eintrag.datum);
    setVon(eintrag.von.slice(0, 5));
    setBis(eintrag.bis.slice(0, 5));
    setPause(String(eintrag.pause || 0));
    setNotiz(eintrag.notiz || "");
    setMeldung("Einsatz kann jetzt bearbeitet werden.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function loeschen(id: string) {
    const sicher = confirm("Einsatz wirklich löschen?");
    if (!sicher) return;

    const { error } = await supabase
      .from("einsaetze")
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

    setMeldung("Einsatz gelöscht.");
    await ladeDaten();
  }

  function EinsatzKarte({ eintrag }: { eintrag: Einsatz }) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-black">{kundeName(eintrag.kunde_id)}</p>

            <p className="mt-1 text-sm text-white/55">
              {auftragName(eintrag.auftrag_id)}
              {auftragOrt(eintrag.auftrag_id)
                ? ` · ${auftragOrt(eintrag.auftrag_id)}`
                : ""}
            </p>

            {auftragArt(eintrag.auftrag_id) && (
              <p className="mt-2 inline-flex rounded-2xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-rose-100">
                {auftragArt(eintrag.auftrag_id)}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-right">
            <p className="text-sm font-black text-rose-100">
              {Number(eintrag.stunden).toFixed(2)} h
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs font-bold uppercase tracking-[0.15em] text-white/40">
          {formatiereDatum(eintrag.datum)} · {eintrag.von.slice(0, 5)} -{" "}
          {eintrag.bis.slice(0, 5)}
          {Number(eintrag.pause) > 0 ? ` · Pause ${eintrag.pause} h` : ""}
        </p>

        {eintrag.notiz && (
          <p className="mt-2 text-sm text-white/55">{eintrag.notiz}</p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => bearbeiten(eintrag)}
            className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-3 py-3 text-xs font-black uppercase tracking-widest text-rose-100"
          >
            Bearbeiten
          </button>

          <button
            onClick={() => loeschen(eintrag.id)}
            className="rounded-2xl border border-red-300/20 bg-red-300/10 px-3 py-3 text-xs font-black uppercase tracking-widest text-red-100"
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
            Dashboard wird geladen
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
            Heute
          </h1>

          <p className="mt-3 max-w-xs text-[13px] font-semibold leading-6 text-white/65">
            Termine sehen, Zeit erfassen und Monatszeit-Abrechnung automatisch
            vorbereiten.
          </p>
        </div>

        <div className="relative z-10 mt-5 grid grid-cols-4 gap-1.5 rounded-[1.7rem] border border-white/10 bg-black/32 p-1.5 text-center shadow-inner shadow-black/30 backdrop-blur-xl">
          <div className="flex h-[62px] flex-col items-center justify-center rounded-[1.25rem] border border-rose-200/10 bg-white/[0.055] px-1">
            <p className="text-lg font-black leading-none text-rose-100 tabular-nums">
              {heuteTermine.length}
            </p>
            <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/45">
              Termine
            </p>
          </div>

          <div className="flex h-[62px] flex-col items-center justify-center rounded-[1.25rem] border border-rose-200/10 bg-white/[0.055] px-1">
            <p className="text-lg font-black leading-none text-white tabular-nums">
              {heuteEinsaetze.length}
            </p>
            <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/45">
              Arbeit
            </p>
          </div>

          <div className="flex h-[62px] flex-col items-center justify-center rounded-[1.25rem] border border-rose-200/10 bg-white/[0.055] px-1">
            <p className="text-lg font-black leading-none text-white tabular-nums">
              {stunden.toFixed(1)}
            </p>
            <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/45">
              Aktuell
            </p>
          </div>

          <div className="flex h-[62px] flex-col items-center justify-center rounded-[1.25rem] border border-rose-200/10 bg-white/[0.055] px-1">
            <p className="text-lg font-black leading-none text-white tabular-nums">
              {monatsStunden.toFixed(1)}
            </p>
            <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/45">
              Monat
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.85rem] border border-rose-200/10 bg-white/[0.052] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-200">
          Woche
        </p>

        <h2 className="mt-1 text-2xl font-black">Kalender</h2>

        <p className="mt-1 text-sm text-white/55">
          Tag antippen und Tagesansicht direkt öffnen.
        </p>

        <div className="mt-4 grid grid-cols-7 gap-2">
          {wochenTage.map((tag) => (
            <button
              key={tag.iso}
              onClick={() => setAusgewaehlterTag(tag.iso)}
              className={
                tag.iso === ausgewaehlterTag
                  ? "min-h-[96px] rounded-2xl border border-rose-200/40 bg-gradient-to-br from-rose-300/25 to-pink-400/10 p-2 text-center shadow-[0_0_22px_rgba(251,113,133,0.20)] transition-colors duration-200"
                  : tag.istHeute
                  ? "min-h-[96px] rounded-2xl border border-rose-300/30 bg-rose-300/20 p-2 text-center shadow-[0_0_18px_rgba(251,113,133,0.13)] transition-colors duration-200"
                  : "min-h-[96px] rounded-2xl border border-white/10 bg-black/25 p-2 text-center transition-colors duration-200"
              }
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-white/45">
                {tag.label}
              </p>

              <p
                className={
                  tag.iso === ausgewaehlterTag || tag.istHeute
                    ? "mt-1 text-lg font-black text-rose-100"
                    : "mt-1 text-lg font-black text-white"
                }
              >
                {tag.tag}
              </p>

              <div className="mt-2 flex justify-center gap-1">
                <div
                  className={
                    tag.eintraege.length > 0
                      ? "h-2 w-2 rounded-full bg-rose-300"
                      : "h-2 w-2 rounded-full bg-white/10"
                  }
                />

                <div
                  className={
                    tag.termine.length > 0
                      ? "h-2 w-2 rounded-full bg-pink-400"
                      : "h-2 w-2 rounded-full bg-white/10"
                  }
                />
              </div>

              <p className="mt-2 text-[10px] font-black text-white/45">
                {tag.stunden > 0 ? `${tag.stunden.toFixed(1)}h` : "-"}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-100">
                Tagesansicht
              </p>

              <h3 className="mt-1 text-xl font-black text-white">
                {tagDetails.label}
              </h3>

              <p className="mt-1 text-sm text-white/50">
                {tagDetails.termine.length} Termin
                {tagDetails.termine.length === 1 ? "" : "e"} ·{" "}
                {tagDetails.eintraege.length} Einsatz
                {tagDetails.eintraege.length === 1 ? "" : "e"} ·{" "}
                {tagDetails.stunden.toFixed(2)} h
              </p>
            </div>

            <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs font-black text-rose-100">
              {tagDetails.stunden.toFixed(1)} h
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {tagDetails.termine.length === 0 &&
            tagDetails.eintraege.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/55">
                Für diesen Tag ist noch nichts eingetragen.
              </div>
            ) : (
              <>
                {tagDetails.termine.map((termin) => (
                  <div
                    key={termin.id}
                    className="rounded-2xl border border-pink-300/20 bg-pink-300/10 p-3"
                  >
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-100">
                      Termin
                    </p>

                    <p className="mt-1 text-sm font-black text-white">
                      {termin.von.slice(0, 5)} - {termin.bis.slice(0, 5)} ·{" "}
                      {kundeName(termin.kunde_id)}
                    </p>

                    <p className="mt-1 text-sm text-white/55">
                      {auftragName(termin.auftrag_id)}
                      {auftragOrt(termin.auftrag_id)
                        ? ` · ${auftragOrt(termin.auftrag_id)}`
                        : ""}
                    </p>

                    {termin.notiz && (
                      <p className="mt-2 text-sm text-white/50">
                        {termin.notiz}
                      </p>
                    )}
                  </div>
                ))}

                {tagDetails.eintraege.map((eintrag) => (
                  <EinsatzKarte key={eintrag.id} eintrag={eintrag} />
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[1.85rem] border border-rose-200/10 bg-white/[0.052] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-200">
          {bearbeitenId ? "Einsatz bearbeiten" : "Einsatz erfassen"}
        </p>

        <h2 className="mt-1 text-2xl font-black">
          {bearbeitenId ? "Einsatz ändern" : "Zeit eintragen"}
        </h2>

        <p className="mt-1 text-sm text-white/55">
          Pflicht ist nur Kunde und Zeit. Auftrag und Ort sind optional.
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

            <input
              className="dark-input text-base"
              inputMode="decimal"
              placeholder="Pause optional, z.B. 0.5"
              value={pause}
              onChange={(e) => setPause(e.target.value)}
            />

            <textarea
              className="dark-input min-h-24 resize-none text-base"
              placeholder="Notiz optional"
              value={notiz}
              onChange={(e) => setNotiz(e.target.value)}
            />

            <div className="rounded-3xl border border-rose-300/20 bg-rose-300/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-100/70">
                Berechnete Zeit
              </p>
              <p className="mt-1 text-4xl font-black text-white">
                {stunden.toFixed(2)} h
              </p>
            </div>

            <button
              onClick={speichern}
              disabled={speichernLoading}
              className="w-full rounded-3xl border border-rose-100/30 bg-gradient-to-r from-rose-200 via-rose-300 to-pink-400 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-2xl shadow-rose-950/40 disabled:opacity-50"
            >
              {speichernLoading
                ? "Speichern..."
                : bearbeitenId
                ? "Änderungen speichern"
                : "Einsatz speichern"}
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
          Verlauf
        </p>

        <h2 className="mt-1 text-2xl font-black">Letzte Einsätze</h2>

        <div className="mt-4 space-y-3">
          {letzteEinsaetze.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white/55">
              Noch keine Einsätze gespeichert.
            </div>
          ) : (
            letzteEinsaetze.map((eintrag) => (
              <EinsatzKarte key={eintrag.id} eintrag={eintrag} />
            ))
          )}
        </div>
      </section>

      <section className="rounded-[1.85rem] border border-rose-200/10 bg-white/[0.052] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-200">
          Monat
        </p>

        <h2 className="mt-1 text-2xl font-black">Übersicht</h2>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-center">
            <p className="text-2xl font-black text-rose-100">
              {monatsEinsaetze.length}
            </p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/45">
              Einsätze
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-center">
            <p className="text-2xl font-black text-white">
              {kundenDiesenMonat}
            </p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/45">
              Kunden
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-center">
            <p className="text-2xl font-black text-white">
              {monatsStunden.toFixed(1)}
            </p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/45">
              Stunden
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}