# Bilder für Spiel-Locations

Hier liegen die Bilder, die im Spiel als „Wo bin ich?" gezeigt werden.

## Empfehlung
- Format: **JPG** oder **PNG** (für Fotos JPG bevorzugen, kleiner)
- Größe: **1024×768** oder **1280×960** (4:3-Verhältnis passt zum Bildbereich)
- Dateigröße: ideal **unter 300 KB** pro Bild — sonst lädt die Seite langsam
- Keine Schrift im Bild, kein "Berlin"-Wasserzeichen, sonst ist das Spiel zu einfach

## Bilder mit Google AI generieren

1. Öffne **Google AI Studio**: https://aistudio.google.com
2. Wähle ein Modell mit Bildgenerierung (Imagen 3 oder Gemini mit Bildausgabe)
3. Beispiel-Prompt:

   ```
   Photorealistic street-view photograph of {STADT}, near {GEBÄUDE/PLATZ},
   daylight, no people, no text, no watermark, 4:3 aspect ratio
   ```

4. Speichere das Ergebnis als JPG ab und benenne es nach Schema:
   `NN-stadt.jpg` (z. B. `09-london.jpg`).
5. Lege die Datei in **diesen Ordner** (`public/locations/`).
6. Trage sie in `src/data/locations.json` ein:

   ```json
   {
     "image": "09-london.jpg",
     "lat": 51.5007,
     "lng": -0.1246,
     "label": "London (Big Ben), Vereinigtes Königreich",
     "credit": "Generiert mit Google AI Studio (Imagen 3)"
   }
   ```

## Wichtig

- Die echten **Lat/Lng-Koordinaten müssen stimmen**, damit die Punkte korrekt
  berechnet werden. Hol sie aus Wikipedia, Google Maps oder OpenStreetMap.
- Bei AI-generierten Bildern im `credit`-Feld unbedingt den **Generator** nennen
  (Google AI Studio, Imagen, Gemini, …) — das landet im Impressum.
- Wenn du Bilder von Wikimedia Commons nimmst: prüfe die Lizenz (z. B.
  CC-BY-SA 4.0) und trage Fotograf + Lizenz in `credit` ein.
- Bei jedem `git push` auf `main` deployt GitHub Actions automatisch die
  neue Version.

## Platzhalter ersetzen

Die mitgelieferten SVGs (`01-berlin.svg` etc.) sind nur farbige Platzhalter.
Sobald du echte Bilder hast: lösche das SVG, lege das Bild mit gleichem
Namens-Stamm ab (`01-berlin.jpg`) und passe in `locations.json` die
`image`-Spalte an.
