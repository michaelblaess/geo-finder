// Merkt sich, welche Locations bereits gespielt wurden.
// Wird ueber alle Reisen hinweg in localStorage gespeichert.
// Bei leerem Restpool automatisch resetbar.

import type { Location } from "./types";

const STORAGE_KEY = "geo-finder:playedIds";

export function locationKey(loc: Location): string {
  return loc.id ?? loc.image;
}

export function loadPlayedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed as string[]);
  } catch {
    return new Set();
  }
}

function saveIds(ids: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // ignorieren
  }
}

export function addPlayedId(id: string): void {
  const set = loadPlayedIds();
  set.add(id);
  saveIds(set);
}

export function addPlayedLocations(locs: Location[]): void {
  const set = loadPlayedIds();
  for (const l of locs) set.add(locationKey(l));
  saveIds(set);
}

export function clearPlayedIds(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignorieren
  }
}

export function playedCount(): number {
  return loadPlayedIds().size;
}
