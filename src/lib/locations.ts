import locationsData from "../data/locations.json";
import type { Location } from "./types";
import { clearPlayedIds, loadPlayedIds, locationKey } from "./playedHistory";
import { log } from "./debug";

const LOCATIONS = locationsData as Location[];

// Gibt eine zufaellige, nicht-wiederholende Auswahl von n Locations zurueck.
// Beruecksichtigt die played-history: bereits gespielte Orte werden uebersprungen.
// Wenn weniger als n nicht-gespielte Orte verbleiben, wird die played-history
// automatisch zurueckgesetzt — der gesamte Pool ist dann wieder verfuegbar.
export function pickRandomLocations(n: number): Location[] {
  const played = loadPlayedIds();
  let available = LOCATIONS.filter((l) => !played.has(locationKey(l)));

  if (available.length < n) {
    log("Locations-Pool aufgebraucht — automatischer Reset", {
      gespielt: played.size,
      verfuegbar: available.length,
      gesamt: LOCATIONS.length,
    });
    clearPlayedIds();
    available = [...LOCATIONS];
  }

  if (n >= available.length) {
    return [...available].sort(() => Math.random() - 0.5);
  }
  const pool = [...available];
  const out: Location[] = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return out;
}

export function totalLocations(): number {
  return LOCATIONS.length;
}

// Nimmt eine externe URL direkt; bei lokalem Dateinamen wird BASE_URL vorangestellt.
export function imageUrl(image: string): string {
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return `${import.meta.env.BASE_URL}locations/${image}`;
}
