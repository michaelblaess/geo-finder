# Geo Finder

<p align="center">
  <img src="docs/flags/gb.svg" height="13" alt=""> <a href="README.md">English</a> ·
  <img src="docs/flags/de.svg" height="13" alt=""> <b>Deutsch</b>
</p>

---

Ein GeoGuessr-ähnliches Browser-Spiel - kostenlos, statisch, ohne Backend.
Ein nicht-kommerzielles Projekt von Michael Blaess.

## Status

Phase 1 (MVP) und Phase 2 (Comfort + Inhalte) abgeschlossen, optionale
Hintergrundmusik seit v0.2.0. Siehe [`plan.md`](./plan.md) für den
vollständigen Projektplan und die nächsten Schritte (Vercel/Supabase-Migration).

## Spielprinzip

1. Du landest in einem Standort irgendwo auf der Welt
2. Auf der Karte rechts rätst du, wo das Bild aufgenommen wurde
3. Je näher dein Tipp, desto mehr Punkte
4. 5 Runden pro Spiel, am Ende dein Score auf der lokalen Highscore-Liste

## Musik

Das Spiel kann optional Hintergrundmusik abspielen. Sie ist standardmäßig aus
und startet erst, wenn Du im Kopfbereich auf den Knopf "Musik" drückst -
Browser unterbinden Autoplay ohnehin, und es soll Deine Entscheidung bleiben.

**In diesem Repository liegen keine Audiodateien.** Wer das Projekt klont,
bringt seine eigene Musik mit. `npm run fetch:music` lädt eine kleine Auswahl
frei lizenzierter Aufnahmen nach `public/music/`; der Deploy-Workflow ruft
dasselbe Skript auf, so kommt die gehostete Fassung an ihre Musik.

Ist keine Audiodatei vorhanden, wird nichts abgespielt und es erscheint kein
Knopf - keine Fehlermeldung, kein kaputtes Symbol.

Wie Du eigene Titel einträgst, steht in
[`public/music/README.md`](./public/music/README.md), die Nachweise der auf der
gehosteten Fassung verwendeten Aufnahmen in [`CREDITS.md`](./CREDITS.md).

## Stack

- Vite + React 19 + TypeScript + Tailwind CSS 4
- MapLibre GL JS + OpenStreetMap-Tiles
- Howler.js für die optionale Hintergrundmusik
- Lokale Bilder in `public/locations/`
- `localStorage` für Highscores und Einstellungen
- Hosting: GitHub Pages

Komplett kostenlos, keine API-Keys, keine Kreditkarte, kein Backend.

## Lizenz

[Apache License 2.0](./LICENSE) für den Code. Einzelne Bilder behalten ihre Original-Lizenz.
