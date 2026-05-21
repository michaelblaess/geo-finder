// Build-Skript fuer src/data/locations.json
//
// Fuer jeden Wikipedia-Slug holt das Skript via MediaWiki-API:
//   - pageimages (1280px Thumbnail)
//   - coordinates (Lat/Lng)
//   - extracts  (2 Saetze, plain text)
// Bevorzugt die deutsche Wikipedia (Title + Extract auf Deutsch),
// faellt fuer fehlende Felder auf die englische zurueck.
//
// Aufruf: node scripts/build-locations.mjs
// Output: src/data/locations.json

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, "..", "src", "data", "locations.json");
const UA = "geo-finder/0.2 (mail@michaelblaess.de) build script";

// ─── Slug-Liste ─────────────────────────────────────────────────────────
const SLUGS = [
  // EUROPA — Wahrzeichen
  { slug: "Eiffel_Tower", category: "wahrzeichen" },
  { slug: "Brandenburg_Gate", category: "wahrzeichen" },
  { slug: "Big_Ben", category: "wahrzeichen" },
  { slug: "Tower_Bridge", category: "wahrzeichen" },
  { slug: "Buckingham_Palace", category: "wahrzeichen" },
  { slug: "Notre-Dame_de_Paris", category: "wahrzeichen" },
  { slug: "Louvre", category: "wahrzeichen" },
  { slug: "Arc_de_Triomphe", category: "wahrzeichen" },
  { slug: "Sacré-Cœur,_Paris", category: "wahrzeichen" },
  { slug: "Colosseum", category: "wahrzeichen" },
  { slug: "Trevi_Fountain", category: "wahrzeichen" },
  { slug: "Pantheon,_Rome", category: "wahrzeichen" },
  { slug: "St._Peter's_Basilica", category: "wahrzeichen" },
  { slug: "Leaning_Tower_of_Pisa", category: "wahrzeichen" },
  { slug: "Sagrada_Família", category: "wahrzeichen" },
  { slug: "Park_Güell", category: "wahrzeichen" },
  { slug: "Acropolis_of_Athens", category: "wahrzeichen" },
  { slug: "Stonehenge", category: "wahrzeichen" },
  { slug: "Edinburgh_Castle", category: "wahrzeichen" },
  { slug: "Charles_Bridge", category: "wahrzeichen" },
  { slug: "Schönbrunn_Palace", category: "wahrzeichen" },
  { slug: "Saint_Basil's_Cathedral", category: "wahrzeichen" },
  { slug: "Cologne_Cathedral", category: "wahrzeichen" },
  { slug: "Neuschwanstein_Castle", category: "wahrzeichen" },
  { slug: "Atomium", category: "wahrzeichen" },
  { slug: "Manneken_Pis", category: "wahrzeichen" },
  { slug: "Anne_Frank_House", category: "wahrzeichen" },
  { slug: "Windmills_of_Kinderdijk", category: "wahrzeichen" },
  { slug: "Mont_Saint-Michel", category: "wahrzeichen" },
  { slug: "Palace_of_Versailles", category: "wahrzeichen" },

  // EUROPA — Naturwunder
  { slug: "Plitvice_Lakes_National_Park", category: "naturwunder" },
  { slug: "Geirangerfjord", category: "naturwunder" },
  { slug: "Cliffs_of_Moher", category: "naturwunder" },
  { slug: "Mount_Etna", category: "naturwunder" },
  { slug: "Santorini", category: "naturwunder" },
  { slug: "Lauterbrunnen_valley", category: "naturwunder" },

  // NORDAMERIKA — Wahrzeichen
  { slug: "Statue_of_Liberty", category: "wahrzeichen" },
  { slug: "Empire_State_Building", category: "wahrzeichen" },
  { slug: "Times_Square", category: "wahrzeichen" },
  { slug: "Brooklyn_Bridge", category: "wahrzeichen" },
  { slug: "Hollywood_Sign", category: "wahrzeichen" },
  { slug: "Golden_Gate_Bridge", category: "wahrzeichen" },
  { slug: "Las_Vegas_Strip", category: "wahrzeichen" },
  { slug: "Mount_Rushmore", category: "wahrzeichen" },
  { slug: "White_House", category: "wahrzeichen" },
  { slug: "Lincoln_Memorial", category: "wahrzeichen" },
  { slug: "Washington_Monument", category: "wahrzeichen" },
  { slug: "Space_Needle", category: "wahrzeichen" },
  { slug: "CN_Tower", category: "wahrzeichen" },
  { slug: "Chichen_Itza", category: "wahrzeichen" },

  // NORDAMERIKA — Naturwunder
  { slug: "Niagara_Falls", category: "naturwunder" },
  { slug: "Grand_Canyon", category: "naturwunder" },
  { slug: "Yellowstone_National_Park", category: "naturwunder" },
  { slug: "Yosemite_National_Park", category: "naturwunder" },
  { slug: "Antelope_Canyon", category: "naturwunder" },
  { slug: "Monument_Valley", category: "naturwunder" },
  { slug: "Banff_National_Park", category: "naturwunder" },
  { slug: "Lake_Louise_(Alberta)", category: "naturwunder" },
  { slug: "Death_Valley", category: "naturwunder" },

  // SÜDAMERIKA
  { slug: "Christ_the_Redeemer_(statue)", category: "wahrzeichen" },
  { slug: "Sugarloaf_Mountain", category: "wahrzeichen" },
  { slug: "Machu_Picchu", category: "wahrzeichen" },
  { slug: "Moai", category: "wahrzeichen" },
  { slug: "Iguazu_Falls", category: "naturwunder" },
  { slug: "Salar_de_Uyuni", category: "naturwunder" },
  { slug: "Atacama_Desert", category: "naturwunder" },
  { slug: "Galápagos_Islands", category: "naturwunder" },
  { slug: "Torres_del_Paine_National_Park", category: "naturwunder" },
  { slug: "Lake_Titicaca", category: "naturwunder" },

  // ASIEN — Wahrzeichen
  { slug: "Taj_Mahal", category: "wahrzeichen" },
  { slug: "Great_Wall_of_China", category: "wahrzeichen" },
  { slug: "Forbidden_City", category: "wahrzeichen" },
  { slug: "Tiananmen_Square", category: "wahrzeichen" },
  { slug: "Tokyo_Tower", category: "wahrzeichen" },
  { slug: "Tokyo_Skytree", category: "wahrzeichen" },
  { slug: "Shibuya_Crossing", category: "wahrzeichen" },
  { slug: "Fushimi_Inari-taisha", category: "wahrzeichen" },
  { slug: "Sensō-ji", category: "wahrzeichen" },
  { slug: "Kinkaku-ji", category: "wahrzeichen" },
  { slug: "Angkor_Wat", category: "wahrzeichen" },
  { slug: "Petronas_Towers", category: "wahrzeichen" },
  { slug: "Marina_Bay_Sands", category: "wahrzeichen" },
  { slug: "Burj_Khalifa", category: "wahrzeichen" },
  { slug: "Burj_Al_Arab", category: "wahrzeichen" },
  { slug: "Petra", category: "wahrzeichen" },
  { slug: "Hagia_Sophia", category: "wahrzeichen" },
  { slug: "Sultan_Ahmed_Mosque", category: "wahrzeichen" },
  { slug: "Wat_Pho", category: "wahrzeichen" },
  { slug: "Tian_Tan_Buddha", category: "wahrzeichen" },
  { slug: "Itsukushima_Shrine", category: "wahrzeichen" },

  // ASIEN — Naturwunder
  { slug: "Mount_Fuji", category: "naturwunder" },
  { slug: "Cappadocia", category: "naturwunder" },
  { slug: "Hạ_Long_Bay", category: "naturwunder" },
  { slug: "Zhangjiajie_National_Forest_Park", category: "naturwunder" },
  { slug: "Pamukkale", category: "naturwunder" },
  { slug: "Dead_Sea", category: "naturwunder" },

  // AFRIKA
  { slug: "Giza_pyramid_complex", category: "wahrzeichen" },
  { slug: "Great_Sphinx_of_Giza", category: "wahrzeichen" },
  { slug: "Lalibela", category: "wahrzeichen" },
  { slug: "Robben_Island", category: "wahrzeichen" },
  { slug: "Mount_Kilimanjaro", category: "naturwunder" },
  { slug: "Victoria_Falls", category: "naturwunder" },
  { slug: "Serengeti_National_Park", category: "naturwunder" },
  { slug: "Table_Mountain", category: "naturwunder" },
  { slug: "Sossusvlei", category: "naturwunder" },
  { slug: "Sahara", category: "naturwunder" },

  // OZEANIEN
  { slug: "Sydney_Opera_House", category: "wahrzeichen" },
  { slug: "Sydney_Harbour_Bridge", category: "wahrzeichen" },
  { slug: "Bondi_Beach", category: "wahrzeichen" },
  { slug: "Uluru", category: "naturwunder" },
  { slug: "Great_Barrier_Reef", category: "naturwunder" },
  { slug: "Twelve_Apostles_(Victoria)", category: "naturwunder" },
  { slug: "Milford_Sound", category: "naturwunder" },
  { slug: "Tongariro_National_Park", category: "naturwunder" },
];

// ─── Hilfsfunktionen ────────────────────────────────────────────────────

// Manuelle Overrides fuer Edge-Cases an Kontinent-Grenzen
// (Naher Osten, Bosporus, Karibik, Pazifik)
const CONTINENT_OVERRIDES = {
  Burj_Khalifa: "Asien",
  Burj_Al_Arab: "Asien",
  Petra: "Asien",
  Hagia_Sophia: "Europa",
  Sultan_Ahmed_Mosque: "Europa",
  Cappadocia: "Asien",
  Pamukkale: "Asien",
  Dead_Sea: "Asien",
};

function continentFromCoords(lat, lng) {
  if (lat <= -60) return "Antarktis";
  if (lat >= 35 && lng >= -10 && lng <= 60) return "Europa";
  if (lat >= -10 && lng >= 60 && lng <= 180) return "Asien";
  if (lat <= 35 && lat >= -35 && lng >= -20 && lng <= 55) return "Afrika";
  if (lat >= 12 && (lng <= -50 || lng >= 170)) return "Nordamerika";
  if (lat <= 12 && lng >= -85 && lng <= -30) return "Südamerika";
  if (lat <= 0 && lng >= 110) return "Ozeanien";
  if (lng >= -10 && lng <= 60) return "Europa";
  if (lng >= 60) return "Asien";
  return "Nordamerika";
}

function continentFor(slug, lat, lng) {
  return CONTINENT_OVERRIDES[slug] ?? continentFromCoords(lat, lng);
}

async function getDeTitle(enSlug) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(enSlug)}&prop=langlinks&lllang=de&format=json&redirects=1&origin=*`;
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) return null;
  const d = await r.json();
  const pages = d?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  return page?.langlinks?.[0]?.["*"] ?? null;
}

async function fetchOnWiki(title, lang) {
  const url =
    `https://${lang}.wikipedia.org/w/api.php?` +
    `action=query&titles=${encodeURIComponent(title)}` +
    `&prop=pageimages|coordinates|extracts|pageprops` +
    `&pithumbsize=1280&exintro=true&exsentences=2&explaintext=true` +
    `&ppprop=wikibase_item` +
    `&format=json&redirects=1&origin=*`;
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) return null;
  const d = await r.json();
  const pages = d?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  if (!page || page.missing !== undefined) return null;
  return {
    title: page.title,
    image: page.thumbnail?.source,
    lat: page.coordinates?.[0]?.lat,
    lng: page.coordinates?.[0]?.lon,
    extract: page.extract,
    wikidataId: page.pageprops?.wikibase_item,
  };
}

// Holt fuer eine Liste von Wikidata-IDs die jeweilige country (P17)-Q-ID
async function fetchClaimsBatch(qids) {
  const result = {};
  for (let i = 0; i < qids.length; i += 50) {
    const chunk = qids.slice(i, i + 50);
    const url =
      `https://www.wikidata.org/w/api.php?` +
      `action=wbgetentities&ids=${chunk.join("|")}` +
      `&props=claims&format=json&origin=*`;
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (!r.ok) continue;
    const d = await r.json();
    for (const id of chunk) {
      const claim = d?.entities?.[id]?.claims?.P17?.[0];
      result[id] = claim?.mainsnak?.datavalue?.value?.id ?? null;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return result;
}

// Holt fuer eine Liste von Q-IDs die deutsche Beschriftung (Fallback Englisch)
async function fetchLabelsBatch(qids) {
  const result = {};
  for (let i = 0; i < qids.length; i += 50) {
    const chunk = qids.slice(i, i + 50);
    const url =
      `https://www.wikidata.org/w/api.php?` +
      `action=wbgetentities&ids=${chunk.join("|")}` +
      `&props=labels&languages=de|en&format=json&origin=*`;
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (!r.ok) continue;
    const d = await r.json();
    for (const id of chunk) {
      const labels = d?.entities?.[id]?.labels;
      result[id] = labels?.de?.value ?? labels?.en?.value ?? id;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return result;
}

// Listet alle Bilder eines Artikels (Filenamen mit 'File:'-Prefix)
async function fetchArticleImages(title, lang) {
  const url =
    `https://${lang}.wikipedia.org/w/api.php?` +
    `action=query&titles=${encodeURIComponent(title)}` +
    `&prop=images&imlimit=30&format=json&redirects=1&origin=*`;
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) return [];
  const d = await r.json();
  const page = Object.values(d?.query?.pages ?? {})[0];
  return (page?.images ?? []).map((i) => i.title);
}

// Holt fuer ein File die 1280px-Thumb-URL via Commons (haelt sprachneutrale Files
// auf einer einzigen Wiki). Akzeptiert sowohl 'File:' (en) als auch 'Datei:' (de).
async function fetchImageThumb(fileTitle) {
  const normalized = fileTitle.replace(/^(Datei|Bild|Fichier|Archivo):/i, "File:");
  const url =
    `https://commons.wikimedia.org/w/api.php?` +
    `action=query&titles=${encodeURIComponent(normalized)}` +
    `&prop=imageinfo&iiprop=url|mime&iiurlwidth=1280` +
    `&format=json&redirects=1&origin=*`;
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) return null;
  const d = await r.json();
  const page = Object.values(d?.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  return { url: info.thumburl ?? info.url, mime: info.mime };
}

// Heuristik: ist dieser Filename vermutlich eine Karte/ein Diagramm/ein Wappen?
function isProbablyMap(filename) {
  if (typeof filename !== "string") return false;
  const f = filename.toLowerCase();
  if (f.endsWith(".svg")) return true;
  return /(map|karte|reliefkarte|lageplan|locator|topographic|topo_|plan_|scheme|diagram|chart|flag|flagge|wappen|coat[_-]of[_-]arms|emblem|seal|logo|boundary|satellite|^sat[A-Z]|_sat[A-Z])/i.test(filename);
}

// Entfernt utm-Tracking-Parameter aus Wikimedia-URLs
function cleanUrl(url) {
  return url
    .replace(/[?&]utm_[^&]+/g, (m) => (m.startsWith("?") ? "?" : ""))
    .replace(/[?&]$/, "")
    .replace(/\?$/, "");
}

function trimExtract(text) {
  if (!text) return undefined;
  // Auf 2 Saetze beschraenken (API liefert manchmal mehr)
  const m = text.match(/^.+?[.!?](?:\s+.+?[.!?])?/s);
  return (m ? m[0] : text).trim();
}

async function buildLocation({ slug, category }) {
  try {
    const deTitle = await getDeTitle(slug);
    const onDe = deTitle ? await fetchOnWiki(deTitle, "de") : null;
    const onEn = await fetchOnWiki(slug, "en");

    let image = onDe?.image ?? onEn?.image;
    const lat = onDe?.lat ?? onEn?.lat;
    const lng = onDe?.lng ?? onEn?.lng;

    if (!image || lat === undefined || lng === undefined) {
      console.warn(`  ⚠ ${slug}: missing image/coords (de=${!!onDe}, en=${!!onEn})`);
      return null;
    }

    // Heuristik: wenn pageimage vermutlich eine Karte ist, durch Foto aus dem
    // Artikel ersetzen. Wir nutzen die englische Wiki, weil die meist mehr
    // Bilder pro Artikel hat.
    if (isProbablyMap(image)) {
      const articleTitle = deTitle ?? slug;
      const lang = deTitle ? "de" : "en";
      let candidates = await fetchArticleImages(articleTitle, lang);
      if (candidates.length === 0 && lang === "de") {
        candidates = await fetchArticleImages(slug, "en");
      }
      let replaced = false;
      for (const f of candidates) {
        if (isProbablyMap(f)) continue;
        if (!/\.(jpg|jpeg|png|webp)$/i.test(f)) continue;
        const info = await fetchImageThumb(f);
        if (info?.url && info.mime?.startsWith("image/")) {
          image = cleanUrl(info.url);
          replaced = true;
          break;
        }
      }
      if (!replaced) {
        console.warn(`  ⚠ ${slug}: pageimage sieht aus wie Karte, kein Foto im Artikel gefunden — verwerfe`);
        return null;
      }
    }

    const label = onDe?.title ?? onEn?.title ?? slug.replace(/_/g, " ");
    const extract = trimExtract(onDe?.extract ?? onEn?.extract);
    const wikipediaUrl = deTitle
      ? `https://de.wikipedia.org/wiki/${encodeURIComponent(deTitle.replace(/ /g, "_"))}`
      : `https://en.wikipedia.org/wiki/${encodeURIComponent(slug)}`;

    return {
      id: slug,
      image,
      lat,
      lng,
      label,
      category,
      continent: continentFor(slug, lat, lng),
      extract,
      wikipediaUrl,
      credit: "Foto: Wikimedia Commons",
      _wikidataId: onDe?.wikidataId ?? onEn?.wikidataId ?? null,
    };
  } catch (err) {
    console.warn(`  ✗ ${slug}: ${err.message}`);
    return null;
  }
}

// ─── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log(`Verarbeite ${SLUGS.length} Wikipedia-Slugs ...`);
  const out = [];
  for (const entry of SLUGS) {
    process.stdout.write(`  · ${entry.slug.padEnd(40, " ")}`);
    const loc = await buildLocation(entry);
    if (loc !== null) {
      out.push(loc);
      console.log(`✓  ${loc.label} (${loc.continent})`);
    }
    // sehr leichtes Rate-Limiting, sonst beschwert sich Wikipedia
    await new Promise((r) => setTimeout(r, 80));
  }

  // Ueberpruefe Verteilung pro Kontinent
  const byContinent = {};
  for (const loc of out) {
    byContinent[loc.continent] = (byContinent[loc.continent] ?? 0) + 1;
  }
  console.log("\nVerteilung:", byContinent);
  console.log(`\nGesamt: ${out.length} / ${SLUGS.length} (${SLUGS.length - out.length} verworfen)`);

  // Wikidata: countries auflösen
  console.log("\nLaender via Wikidata aufloesen ...");
  const wdIds = out.map((l) => l._wikidataId).filter((x) => typeof x === "string");
  const claimsByWd = await fetchClaimsBatch(wdIds);
  const countryIds = [...new Set(Object.values(claimsByWd).filter(Boolean))];
  console.log(`  ${wdIds.length} Items abgefragt, ${countryIds.length} Laender`);
  const labels = await fetchLabelsBatch(countryIds);
  let withCountry = 0;
  for (const loc of out) {
    const cid = loc._wikidataId ? claimsByWd[loc._wikidataId] : null;
    if (cid && labels[cid]) {
      loc.country = labels[cid];
      withCountry++;
    }
    delete loc._wikidataId;
  }
  console.log(`  ${withCountry} Locations mit Land versehen`);

  await fs.writeFile(OUTPUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`\nGeschrieben: ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
