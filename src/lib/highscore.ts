import type { GameResult, StoredScore } from "./types";

const STORAGE_KEY = "geo-finder:scores";
const MAX_SCORES = 10;

// Liest die gespeicherten Highscores aus dem localStorage
export function loadScores(): StoredScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredScore[];
  } catch {
    return [];
  }
}

// Speichert ein neues Spielergebnis und kuerzt die Liste auf MAX_SCORES
export function saveScore(result: GameResult): StoredScore[] {
  const newEntry: StoredScore = {
    nickname: result.nickname,
    totalPoints: result.totalPoints,
    rounds: result.rounds.map((r) => ({
      distanceKm: r.distanceKm,
      points: r.points,
      locationLabel: r.location.label,
    })),
    playedAt: result.playedAt,
  };

  const all = [...loadScores(), newEntry]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, MAX_SCORES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Speicher voll oder Privacy-Modus — ignorieren
  }
  return all;
}

// Loescht alle Highscores
export function clearScores(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignorieren
  }
}
