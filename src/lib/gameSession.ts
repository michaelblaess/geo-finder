// Persistiert die aktive Spielsession in sessionStorage,
// damit der Spieler von beliebigen Seiten zurueck zum laufenden Spiel kann.
// Wird beim Spielende explizit geloescht.

import type { Difficulty, Location, Round } from "./types";

const KEY = "geo-finder:activeGame";

export type Phase = "guessing" | "result";

export type ActiveGame = {
  nickname: string;
  difficulty: Difficulty;
  locations: Location[];
  roundIndex: number;
  guess: { lat: number; lng: number } | null;
  phase: Phase;
  completedRounds: Round[];
  currentResult: { distanceKm: number; points: number } | null;
};

export function loadActiveGame(): ActiveGame | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as ActiveGame;
    if (!Array.isArray(parsed.locations) || parsed.locations.length === 0) return null;
    if (parsed.roundIndex >= parsed.locations.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveActiveGame(g: ActiveGame): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(g));
  } catch {
    // ignorieren
  }
}

export function clearActiveGame(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignorieren
  }
}

export function hasActiveGame(): boolean {
  return loadActiveGame() !== null;
}
