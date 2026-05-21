import type { Continent, Difficulty } from "./types";

const STORAGE_KEY = "geo-finder:difficulty";

// Sekunden pro Etappe im "schwer"-Modus
export const TIMER_SECONDS = 30;

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  einfach: "Einfach",
  mittel: "Mittel",
  schwer: "Schwer",
};

export function loadDifficulty(): Difficulty {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "einfach" || v === "mittel" || v === "schwer") return v;
  } catch {
    // ignorieren
  }
  return "einfach";
}

export function saveDifficulty(d: Difficulty): void {
  try {
    localStorage.setItem(STORAGE_KEY, d);
  } catch {
    // ignorieren
  }
}

// Vorzoom-Kameras pro Kontinent fuer Schwierigkeit "einfach"
export const CONTINENT_VIEWS: Record<Continent, { center: [number, number]; zoom: number }> = {
  Europa: { center: [10, 50], zoom: 3.4 },
  Asien: { center: [95, 30], zoom: 2.6 },
  Afrika: { center: [20, 5], zoom: 2.6 },
  Nordamerika: { center: [-100, 45], zoom: 2.6 },
  Südamerika: { center: [-60, -20], zoom: 3 },
  Ozeanien: { center: [140, -25], zoom: 3 },
  Antarktis: { center: [0, -75], zoom: 2.5 },
};

// Welche Kamera wird beim Etappenstart verwendet? Bei "einfach" der Kontinent,
// bei "mittel"/"schwer" die Welt-Uebersicht.
export function viewForRound(
  difficulty: Difficulty,
  continent: Continent | undefined,
): { center: [number, number]; zoom: number } {
  if (difficulty === "einfach" && continent !== undefined) {
    return CONTINENT_VIEWS[continent];
  }
  return { center: [10, 30], zoom: 1.2 };
}
