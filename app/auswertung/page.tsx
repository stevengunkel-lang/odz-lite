"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import LiteLogo from "../../components/LiteLogo";

type Profil = {
  id: string;
  user_id: string;
  name: string | null;
  firma: string | null;
  adresse: string | null;
  email: string | null;
  telefon: string | null;
  created_at: string;
};

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

function aktuellerMonat() {
  const heute = new Date();
  const jahr = heute.getFullYear();
  const monat = String(heute.getMonth() + 1).padStart(2, "0");

  return `${jahr}-${monat}`;
}

function monatLabel(monat: string) {
  const [jahr, monatZahl] = monat.split("-");

  return new Date(Number(jahr), Number(monatZahl) - 1, 1).toLocaleDateString(
    "de-CH",
    {
      month: "long",
      year: "numeric",
    }
  );
}

function formatiereDatum(datum: string) {
  return new Date(`${datum}T12:00:00`).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function chf(betrag: number) {
  return `${betrag.toFixed(2)} CHF`;
}

export default function AuswertungPage() {
  const [userId, setUserId] = useState("");
  const [profil, setProfil] = useState<Profil | null>(null);
  const [kunden, setKunden] = useState<Kunde[]>([]);
  const [auftraege, setAuftraege] = useState<Auftrag[]>([]);
  const [einsaetze, setEinsaetze] = useState<Einsatz[]>([]);

  const [kundeId, setKundeId] = useState("");
  const [monat, setMonat] = useState(aktuellerMonat());

  const [meldung, setMeldung] = useState("");
  const [loading, setLoading] = useState(true);

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

    const id = userData.user.id;
    setUserId(id);

    const { data: profilData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", id)
      .maybeSingle();

    setProfil((profilData || null) as Profil | null);

    const { data: kundenData, error: kundenError } = await supabase
      .from("kunden")
      .select("*")
      .eq("user_id", id)
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
      .eq("user_id", id)
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
      .eq("user_id", id)
      .order("datum", { ascending: true })
      .order("von", { ascending: true });

    setLoading(false);

    if (einsaetzeError) {
      setMeldung(einsaetzeError.message);
      return;
    }

    setEinsaetze((einsaetzeData || []) as Einsatz[]);
  }

  const ausgewaehlterKunde = useMemo(
    () => kunden.find((kunde) => kunde.id === kundeId) || null,
    [kunden, kundeId]
  );

  const kundenEinsaetze = useMemo(() => {
    return einsaetze
      .filter((einsatz) => einsatz.kunde_id === kundeId)
      .filter((einsatz) => einsatz.datum.startsWith(monat))
      .sort((a, b) => {
        const datumVergleich = a.datum.localeCompare(b.datum);
        if (datumVergleich !== 0) return datumVergleich;
        return a.von.localeCompare(b.von);
      });
  }, [einsaetze, kundeId, monat]);

  const totalStunden = useMemo(() => {
    return kundenEinsaetze.reduce(
      (summe, einsatz) => summe + Number(einsatz.stunden || 0),
      0
    );
  }, [kundenEinsaetze]);

  const stundensatz = Number(ausgewaehlterKunde?.stundensatz || 0);
  const totalBetrag = totalStunden * stundensatz;

  const kundenMitEinsatz = useMemo(() => {
    const ids = new Set(
      einsaetze
        .filter((einsatz) => einsatz.datum.startsWith(monat))
        .map((einsatz) => einsatz.kunde_id)
    );

    return kunden.filter((kunde) => ids.has(kunde.id));
  }, [kunden, einsaetze, monat]);

  const monatsEinsaetze = useMemo(
    () => einsaetze.filter((einsatz) => einsatz.datum.startsWith(monat)),
    [einsaetze, monat]
  );

  const monatsStunden = useMemo(
    () =>
      monatsEinsaetze.reduce(
        (summe, einsatz) => summe + Number(einsatz.stunden || 0),
        0
      ),
    [monatsEinsaetze]
  );

  function auftragName(id?: string | null) {
    if (!id) return "Allgemein";

    return auftraege.find((auftrag) => auftrag.id === id)?.name || "Allgemein";
  }

  function auftragOrt(id?: string | null) {
    if (!id) return "";

    return auftraege.find((auftrag) => auftrag.id === id)?.ort || "";
  }

  function auftragArt(id?: string | null) {
    if (!id) return "Reinigung";

    return auftraege.find((auftrag) => auftrag.id === id)?.art || "Reinigung";
  }

  function pdfErstellen() {
    setMeldung("");

    if (!ausgewaehlterKunde) {
      setMeldung("Bitte Kunde auswählen.");
      return;
    }

    if (kundenEinsaetze.length === 0) {
      setMeldung("Für diesen Kunden und Monat gibt es keine Einsätze.");
      return;
    }

    const doc = new jsPDF();

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Monatszeit-Abrechnung", 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(244, 114, 182);
    doc.text("ODZ. Lite", 176, 18);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Leistungserbringer", 14, 42);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const absender = [
      profil?.firma || profil?.name || "Profil nicht ausgefüllt",
      profil?.adresse || "",
      profil?.email || "",
      profil?.telefon || "",
    ].filter(Boolean);

    absender.forEach((zeile, index) => {
      doc.text(zeile, 14, 48 + index * 5);
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Kunde", 120, 42);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const empfaenger = [
      ausgewaehlterKunde.name,
      ausgewaehlterKunde.adresse || "",
      ausgewaehlterKunde.email || "",
      ausgewaehlterKunde.telefon || "",
    ].filter(Boolean);

    empfaenger.forEach((zeile, index) => {
      doc.text(zeile, 120, 48 + index * 5);
    });

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 76, 196, 76);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Zeitraum: ${monatLabel(monat)}`, 14, 86);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Stundensatz: ${stundensatz.toFixed(2)} CHF/h`, 14, 93);
    doc.text(`Anzahl Einsätze: ${kundenEinsaetze.length}`, 14, 100);

    doc.setFillColor(255, 241, 242);
    doc.roundedRect(120, 82, 76, 23, 3, 3, "F");

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Total", 126, 91);

    doc.setFontSize(12);
    doc.text(`${totalStunden.toFixed(2)} h`, 126, 99);
    doc.text(chf(totalBetrag), 160, 99);

    const rows = kundenEinsaetze.map((einsatz) => {
      const einsatzBetrag = Number(einsatz.stunden || 0) * stundensatz;

      return [
        formatiereDatum(einsatz.datum),
        `${einsatz.von.slice(0, 5)}-${einsatz.bis.slice(0, 5)}`,
        Number(einsatz.pause || 0) > 0 ? String(einsatz.pause) : "-",
        Number(einsatz.stunden || 0).toFixed(2),
        auftragName(einsatz.auftrag_id),
        auftragArt(einsatz.auftrag_id),
        auftragOrt(einsatz.auftrag_id) || "-",
        einsatz.notiz || "-",
        chf(einsatzBetrag),
      ];
    });

    autoTable(doc, {
      startY: 116,
      head: [
        [
          "Datum",
          "Zeit",
          "Pause",
          "Std.",
          "Objekt",
          "Arbeit",
          "Ort",
          "Notiz",
          "Betrag",
        ],
      ],
      body: rows,
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 19 },
        1: { cellWidth: 18 },
        2: { cellWidth: 13 },
        3: { cellWidth: 13 },
        4: { cellWidth: 25 },
        5: { cellWidth: 24 },
        6: { cellWidth: 23 },
        7: { cellWidth: 31 },
        8: { cellWidth: 20, halign: "right" },
      },
      margin: { left: 10, right: 10 },
    });

    const pageCount = doc.getNumberOfPages();

    for (let index = 1; index <= pageCount; index++) {
      doc.setPage(index);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 285, 196, 285);

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Powered by ODZ.", 14, 291);
      doc.text(`Seite ${index} / ${pageCount}`, 178, 291);
    }

    const dateiname = `Monatszeit-Abrechnung_${ausgewaehlterKunde.name}_${monat}.pdf`
      .replaceAll(" ", "_")
      .replaceAll("/", "-");

    doc.save(dateiname);
  }

  if (false && loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] border border-rose-300/20 bg-rose-300/10 text-2xl font-black text-rose-100">
            ODZ.
          </div>

          <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-white/40">
            Auswertung wird geladen
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md space-y-5 px-4 pt-4 pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <section className="relative flex min-h-[330px] flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-rose-300/[0.16] via-white/[0.04] to-black/30 p-6 shadow-2xl shadow-black/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.24),transparent_35%)]" />

        <div className="relative z-10">
          <LiteLogo small />

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
            Abrechnung
          </h1>

          <p className="mt-2 text-sm font-medium leading-6 text-white/65">
            Monatszeit-Abrechnung pro Kunde erstellen. Stunden und Betrag werden
            automatisch berechnet.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2 rounded-3xl border border-white/10 bg-black/25 p-2 text-center backdrop-blur-xl">
            <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xl font-black text-rose-100">
                {kundenMitEinsatz.length}
              </p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/45">
                Kunden
              </p>
            </div>

            <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xl font-black text-white">
                {monatsEinsaetze.length}
              </p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/45">
                Einsätze
              </p>
            </div>

            <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xl font-black text-white">
                {monatsStunden.toFixed(1)}
              </p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/45">
                Stunden
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-200">
          Monatszeit-Abrechnung
        </p>

        <h2 className="mt-1 text-2xl font-black">PDF erstellen</h2>

        {kunden.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm font-bold text-yellow-100">
            Bitte zuerst einen Kunden anlegen.
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

            <input
              className="dark-input text-base"
              type="month"
              value={monat}
              onChange={(e) => setMonat(e.target.value)}
            />

            <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
                Ausgewählt
              </p>

              <p className="mt-2 text-xl font-black text-white">
                {ausgewaehlterKunde?.name || "Kein Kunde"}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-lg font-black text-rose-100">
                    {kundenEinsaetze.length}
                  </p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/40">
                    Einsätze
                  </p>
                </div>

                <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-lg font-black text-white">
                    {totalStunden.toFixed(1)}
                  </p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/40">
                    Stunden
                  </p>
                </div>

                <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-lg font-black text-white">
                    {totalBetrag.toFixed(0)}
                  </p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/40">
                    CHF
                  </p>
                </div>
              </div>

              {!ausgewaehlterKunde?.stundensatz && (
                <div className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-3 text-sm font-bold text-yellow-100">
                  Für diesen Kunden ist kein Stundensatz hinterlegt. Betrag wird
                  mit 0 CHF berechnet.
                </div>
              )}

              {!profil && (
                <div className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-3 text-sm font-bold text-yellow-100">
                  Profil ist noch nicht ausgefüllt. Die Absenderdaten fehlen im
                  PDF.
                </div>
              )}
            </div>

            <button
              onClick={pdfErstellen}
              className="w-full rounded-3xl bg-gradient-to-r from-rose-300 to-pink-400 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-2xl shadow-rose-950/40"
            >
              Monatszeit-Abrechnung herunterladen
            </button>

            {meldung && (
              <div className="rounded-3xl border border-white/10 bg-black/25 p-4 text-sm font-bold text-white/75">
                {meldung}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-200">
          Übersicht
        </p>

        <h2 className="mt-1 text-2xl font-black">Einsätze im Monat</h2>

        <div className="mt-4 space-y-3">
          {kundenEinsaetze.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white/55">
              Für diese Auswahl sind keine Einsätze gespeichert.
            </div>
          ) : (
            kundenEinsaetze.map((einsatz) => (
              <div
                key={einsatz.id}
                className="rounded-3xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black">
                      {formatiereDatum(einsatz.datum)}
                    </p>

                    <p className="mt-1 text-sm text-white/55">
                      {einsatz.von.slice(0, 5)} - {einsatz.bis.slice(0, 5)}
                      {Number(einsatz.pause || 0) > 0
                        ? ` · Pause ${einsatz.pause} h`
                        : ""}
                    </p>

                    <p className="mt-2 inline-flex rounded-2xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-rose-100">
                      {auftragArt(einsatz.auftrag_id)}
                    </p>

                    <p className="mt-2 text-sm text-white/50">
                      {auftragName(einsatz.auftrag_id)}
                      {auftragOrt(einsatz.auftrag_id)
                        ? ` · ${auftragOrt(einsatz.auftrag_id)}`
                        : ""}
                    </p>

                    {einsatz.notiz && (
                      <p className="mt-2 text-sm text-white/45">
                        {einsatz.notiz}
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-right">
                    <p className="text-sm font-black text-rose-100">
                      {Number(einsatz.stunden).toFixed(2)} h
                    </p>
                    <p className="mt-1 text-[10px] font-black text-white/45">
                      {chf(Number(einsatz.stunden) * stundensatz)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}