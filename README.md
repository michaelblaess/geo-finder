# Geo Finder

<p align="center">
  <img src="docs/flags/gb.svg" height="13" alt=""> <b>English</b> ·
  <img src="docs/flags/de.svg" height="13" alt=""> <a href="README.de.md">Deutsch</a>
</p>

---

A GeoGuessr-style browser game - free, static, no backend.
A non-commercial project by Michael Blaess.

## Status

Phase 1 (MVP) and Phase 2 (comfort + content) complete. See
[`plan.md`](./plan.md) for the full project plan and next steps
(music, Vercel/Supabase migration).

## How it works

1. You land at a location somewhere in the world
2. On the map on the right, you guess where the photo was taken
3. The closer your guess, the more points you score
4. 5 rounds per game, and your final score goes on the local high-score list

## Stack

- Vite + React 19 + TypeScript + Tailwind CSS 4
- MapLibre GL JS + OpenStreetMap tiles
- Local images in `public/locations/`
- `localStorage` for high scores and settings
- Hosting: GitHub Pages

Completely free, no API keys, no credit card, no backend.

## License

[Apache License 2.0](./LICENSE) for the code. Individual images keep their original licenses.
