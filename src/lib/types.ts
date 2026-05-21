// Eine Location aus locations.json
export type Continent =
  | "Europa"
  | "Asien"
  | "Afrika"
  | "Nordamerika"
  | "Südamerika"
  | "Ozeanien"
  | "Antarktis";

export type LocationCategory = "wahrzeichen" | "naturwunder" | "stadt";

export type Difficulty = "einfach" | "mittel" | "schwer";

export type Location = {
  id?: string;
  image: string;
  lat: number;
  lng: number;
  label: string;
  credit: string;
  category?: LocationCategory;
  continent?: Continent;
  country?: string;
  extract?: string;
  wikipediaUrl?: string;
};

// Ein abgeschlossener Spielzug
export type Round = {
  location: Location;
  guessLat: number;
  guessLng: number;
  distanceKm: number;
  points: number;
};

// Endergebnis eines Spiels — wird an /victory uebergeben
export type GameResult = {
  nickname: string;
  totalPoints: number;
  rounds: Round[];
  playedAt: string;
};

// Highscore-Eintrag im localStorage
export type StoredScore = {
  nickname: string;
  totalPoints: number;
  rounds: Array<{ distanceKm: number; points: number; locationLabel: string }>;
  playedAt: string;
};

// Settings im localStorage
export type Settings = {
  theme: "dark" | "light";
  musicMuted: boolean;
  musicVolume: number;
};
