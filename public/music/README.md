# Hintergrundmusik

Der Musik-Player im Header spielt komprimierte Loops über
[Howler.js](https://howlerjs.com/) (Web Audio API).

## Die Audiodateien liegen NICHT im Repository

Bewusst: Wer den Quellcode klont, bekommt keine Musik mitgeliefert und muss sie
sich selbst besorgen. Die Dateien in diesem Ordner sind per `.gitignore` vom
Commit ausgeschlossen (`*.ogg`, `*.mp3`) - nur diese README ist versioniert.

- **Keine Datei vorhanden → der Player blendet sich komplett aus** (kein Button,
  keine Fehlermeldung).
- **Dateien vorhanden → ein einzelner An/Aus-Button** erscheint im Header.

## Musik lokal holen

```bash
npm run fetch:music
```

Das Script `scripts/fetch-music.mjs` lädt die in der Playlist vorgesehenen Stücke
von ihrer frei lizenzierten Quelle (Internet Archive) hierher. Es ist idempotent
(vorhandene Dateien werden übersprungen) und nicht-fatal.

Auf **GitHub Pages** läuft genau dieser Schritt im Deploy-Workflow vor dem Build
(`.github/workflows/deploy.yml`), damit die Live-Seite Musik hat - ohne dass die
Dateien je im Repo landen. Fällt die Quelle aus, bricht der Deploy nicht ab; dann
fehlt eben die Musik.

## Eigene Stücke hinzufügen

1. Audiodatei als **OGG Vorbis** (ca. 128 kbit/s) hier ablegen, optional MP3 als
   Fallback. Für nahtlose Loops die Stille am Anfang/Ende wegschneiden.
2. Eintrag in `src/lib/music.ts` im Array `PLAYLIST` ergänzen (Dateiname unter
   `src` muss zum abgelegten Dateinamen passen).
3. Soll die Datei beim Deploy automatisch geholt werden: Zuordnung in
   `scripts/fetch-music.mjs` ergänzen.
4. Nachweis in der `CREDITS.md` im Projekt-Root eintragen (die Apache-2.0-Lizenz
   des Codes deckt Musik-Assets **nicht** ab).

## Frei lizenzierte Quellen

Lizenz **pro Stück** prüfen, nie pauschal.

- **Musopen** (musopen.org) - viele Public-Domain- / CC0-Aufnahmen
- **Internet Archive** (archive.org) - Public Domain und CC
- **Free Music Archive** (freemusicarchive.org) - CC, Lizenz je Track
- **Incompetech** (Kevin MacLeod) - CC-BY, Namensnennung nötig
- **OpenGameArt** (opengameart.org) - Game-Musik, gemischte Lizenzen

## Lizenz-Typen kurz

- **CC0 / Public Domain** - frei, keine Auflagen.
- **CC BY** - Namensnennung Pflicht.
- **CC BY-SA** - Namensnennung Pflicht; **ShareAlike** greift nur, wenn du die
  Audiodatei selbst **bearbeitest** (schneidest, remixst) - dann steht die
  bearbeitete Datei wieder unter CC BY-SA. Unverändertes Abspielen färbt **nicht**
  auf den Apache-2.0-Code ab.
- **NC-Varianten** - nur nicht-kommerziell. Für dieses private Projekt nutzbar,
  aber bewusst dokumentieren.
