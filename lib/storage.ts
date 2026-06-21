export type Profil = {
  name?: string;
  firma?: string;
  adresse?: string;
  email?: string;
  telefon?: string;
};

export type Kunde = {
  id: string;
  name: string;
  adresse?: string;
  email?: string;
  telefon?: string;
  stundensatz?: number;
  createdAt: string;
};

export type Auftrag = {
  id: string;
  kundeId: string;
  name?: string;
  ort?: string;
  art?: string;
  beschreibung?: string;
  status: "Aktiv" | "Abgeschlossen";
  createdAt: string;
};

export type Einsatz = {
  id: string;
  kundeId: string;
  auftragId?: string;
  datum: string;
  von: string;
  bis: string;
  pause: number;
  stunden: number;
  notiz?: string;
  createdAt: string;
};

export type Termin = {
  id: string;
  kundeId: string;
  auftragId?: string;
  datum: string;
  von: string;
  bis: string;
  notiz?: string;
  status: "Geplant" | "Erledigt";
  createdAt: string;
};

const PROFIL_KEY = "odz_lite_profil";
const KUNDEN_KEY = "odz_lite_kunden";
const AUFTRAEGE_KEY = "odz_lite_auftraege";
const EINSAETZE_KEY = "odz_lite_einsaetze";
const TERMINE_KEY = "odz_lite_termine";

function istBrowser() {
  return typeof window !== "undefined";
}

function lese<T>(key: string): T[] {
  if (!istBrowser()) return [];

  const roh = localStorage.getItem(key);
  if (!roh) return [];

  try {
    return JSON.parse(roh) as T[];
  } catch {
    return [];
  }
}

function speichere<T>(key: string, daten: T[]) {
  if (!istBrowser()) return;
  localStorage.setItem(key, JSON.stringify(daten));
}

export function ladeProfil(): Profil {
  if (!istBrowser()) return {};

  const roh = localStorage.getItem(PROFIL_KEY);
  if (!roh) return {};

  try {
    return JSON.parse(roh) as Profil;
  } catch {
    return {};
  }
}

export function speichereProfil(profil: Profil) {
  if (!istBrowser()) return;
  localStorage.setItem(PROFIL_KEY, JSON.stringify(profil));
}

export function ladeKunden() {
  return lese<Kunde>(KUNDEN_KEY);
}

export function speichereKunden(kunden: Kunde[]) {
  speichere(KUNDEN_KEY, kunden);
}

export function ladeAuftraege() {
  return lese<Auftrag>(AUFTRAEGE_KEY);
}

export function speichereAuftraege(auftraege: Auftrag[]) {
  speichere(AUFTRAEGE_KEY, auftraege);
}

export function ladeEinsaetze() {
  return lese<Einsatz>(EINSAETZE_KEY);
}

export function speichereEinsaetze(einsaetze: Einsatz[]) {
  speichere(EINSAETZE_KEY, einsaetze);
}

export function ladeTermine() {
  return lese<Termin>(TERMINE_KEY);
}

export function speichereTermine(termine: Termin[]) {
  speichere(TERMINE_KEY, termine);
}

export function neueId() {
  return crypto.randomUUID();
}

export function berechneStunden(von: string, bis: string, pause: number) {
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

export function heuteISO() {
  return new Date().toISOString().split("T")[0];
}