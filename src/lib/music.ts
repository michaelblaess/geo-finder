// Musik-Konfiguration fuer den Hintergrund-Player.
//
// WICHTIG: Die Audiodateien liegen NICHT im Repository. Sie werden zur
// Build-Zeit von ihrer frei lizenzierten Quelle nach public/music/ geholt
// (Script scripts/fetch-music.mjs, siehe public/music/README.md) und sind per
// .gitignore vom Commit ausgeschlossen. Fehlt eine Datei, spielt der Player sie
// still nicht ab - ohne Fehlermeldung. Sind gar keine Dateien vorhanden, zeigt
// der Header keinen Musik-Button.

export interface Track {
  // Anzeigename des Stuecks
  title: string;
  // Urheber / Interpret
  artist: string;
  // Quelldateien relativ zum Vite-Base (public/). Reihenfolge = Fallback-Kette.
  // Aufloesung gegen import.meta.env.BASE_URL passiert im Player.
  src: string[];
  // Lizenzkuerzel fuer die Anzeige
  license: string;
  // Nachweis-/Quell-URL
  url?: string;
}

// Grundlautstaerke des Hintergrund-Players (0..1). Bewusst gedaempft, damit die
// Musik das Spiel begleitet statt es zu uebertoenen.
export const MUSIC_VOLUME = 0.45;

// Playlist. Die Dateinamen muessen zu den Zielpfaden in scripts/fetch-music.mjs
// passen. Aktuell drei Saetze aus Vivaldis "Vier Jahreszeiten" in der frei
// lizenzierten Einspielung von John Harrison mit den Wichita State University
// Chamber Players (CC BY-SA 4.0).
export const PLAYLIST: Track[] = [
  {
    title: "Der Frühling - I. Allegro",
    artist: "Vivaldi · John Harrison / Wichita State University Chamber Players",
    src: ["music/vivaldi-fruehling-1-allegro.ogg"],
    license: "CC BY-SA 4.0",
    url: "https://johnharrison.cc/the-four-seasons/",
  },
  {
    title: "Der Herbst - I. Allegro",
    artist: "Vivaldi · John Harrison / Wichita State University Chamber Players",
    src: ["music/vivaldi-herbst-1-allegro.ogg"],
    license: "CC BY-SA 4.0",
    url: "https://johnharrison.cc/the-four-seasons/",
  },
  {
    title: "Der Winter - II. Largo",
    artist: "Vivaldi · John Harrison / Wichita State University Chamber Players",
    src: ["music/vivaldi-winter-2-largo.ogg"],
    license: "CC BY-SA 4.0",
    url: "https://johnharrison.cc/the-four-seasons/",
  },
];
