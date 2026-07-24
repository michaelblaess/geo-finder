// Holt die Hintergrundmusik zur Build-Zeit nach public/music/.
//
// Die Audiodateien liegen bewusst NICHT im Repository (siehe .gitignore und
// public/music/README.md). Dieses Script laedt sie von ihrer frei lizenzierten
// Quelle (Internet Archive), damit sie im Build und auf GitHub Pages vorhanden
// sind. Wer nur den Quellcode klont, bekommt ohne diesen Lauf keine Musik - das
// Spiel blendet den Player dann einfach aus.
//
// Das Script ist idempotent (vorhandene Dateien werden uebersprungen) und
// NICHT-FATAL: Faellt eine Quelle aus, bricht der Build nicht ab - dann fehlt
// eben die Musik. Beendet sich immer mit Exit-Code 0.

import { mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Vivaldi, "Die vier Jahreszeiten" - Einspielung von John Harrison mit den
// Wichita State University Chamber Players, CC BY-SA. Quelle:
// https://archive.org/details/The_Four_Seasons_Vivaldi-10361
const ARCHIVE_BASE = "https://archive.org/download/The_Four_Seasons_Vivaldi-10361";

// Zwei Formate, absichtlich: Safari spielt Ogg erst ab Version 18.4
// (macOS Sequoia 15.4, iOS 18.4). Ohne MP3 daneben bleibt das Spiel auf
// aelteren Apple-Geraeten stumm. Howler waehlt im Browser das passende aus.
const FORMATE = ["ogg", "mp3"];

// Zuordnung: lokaler Basisname (muss zu PLAYLIST in src/lib/music.ts passen)
// -> Basisname im Archive-Item. Die Endung kommt aus FORMATE dazu.
const TRACKS = [
  {
    local: "vivaldi-fruehling-1-allegro",
    remote: "John_Harrison_with_the_Wichita_State_University_Chamber_Players_-_01_-_Spring_Mvt_1_Allegro",
  },
  {
    local: "vivaldi-herbst-1-allegro",
    remote: "John_Harrison_with_the_Wichita_State_University_Chamber_Players_-_07_-_Autumn_Mvt_1_Allegro",
  },
  {
    local: "vivaldi-winter-2-largo",
    remote: "John_Harrison_with_the_Wichita_State_University_Chamber_Players_-_11_-_Winter_Mvt_2_Largo",
  },
];

const here = dirname(fileURLToPath(import.meta.url));
const targetDir = join(here, "..", "public", "music");

// Prueft, ob eine Datei bereits existiert und nicht leer ist.
async function alreadyThere(path) {
  try {
    const info = await stat(path);
    return info.isFile() && info.size > 0;
  } catch {
    return false;
  }
}

// Laedt eine einzelne Datei (Titel in einem Format); Fehler werden gemeldet,
// nicht geworfen.
async function fetchFile(track, format) {
  const name = `${track.local}.${format}`;
  const target = join(targetDir, name);
  if (await alreadyThere(target)) {
    console.log(`  uebersprungen (vorhanden): ${name}`);
    return true;
  }
  const url = `${ARCHIVE_BASE}/${track.remote}.${format}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  WARN: ${name} - HTTP ${res.status}`);
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(target, buffer);
    const kb = Math.round(buffer.length / 1024);
    console.log(`  geladen: ${name} (${kb} KB)`);
    return true;
  } catch (err) {
    console.warn(`  WARN: ${name} - ${err.message}`);
    return false;
  }
}

async function main() {
  console.log("Hintergrundmusik holen ...");
  try {
    await mkdir(targetDir, { recursive: true });
    let ok = 0;
    const gesamt = TRACKS.length * FORMATE.length;
    for (const track of TRACKS) {
      for (const format of FORMATE) {
        if (await fetchFile(track, format)) {
          ok += 1;
        }
      }
    }
    console.log(`Fertig: ${ok}/${gesamt} Dateien verfuegbar.`);
  } catch (err) {
    // Selbst unerwartete Fehler duerfen den Build nicht kippen
    console.warn(`WARN: Musik-Fetch uebersprungen - ${err.message}`);
  }
}

await main();
process.exit(0);
