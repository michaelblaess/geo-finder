import { useEffect, useRef } from "react";
import maplibregl, { type Map as MapLibreMap, type Marker, type LngLatLike } from "maplibre-gl";
import { isDebugActive } from "../lib/debug";

type Props = {
  // Tipp-Marker (klickbar setzen). null = noch kein Tipp.
  guess: { lat: number; lng: number } | null;
  // Wahre Position (wird erst nach Tipp-Abgabe sichtbar). null = nicht zeigen.
  truth?: { lat: number; lng: number } | null;
  // Zeigt die Wahrheit auch ohne Tipp-Abgabe (Debug-Mode)
  debugTruth?: { lat: number; lng: number } | null;
  // Klick-Handler — null bedeutet "Karte ist gelockt"
  onMapClick: ((lat: number, lng: number) => void) | null;
  // Discriminator fuer Etappenwechsel — bei Aenderung wird die Karte
  // auf initialView geflogen
  viewKey?: number | string;
  // Start-Kamera fuer den naechsten Etappenstart
  initialView?: { center: [number, number]; zoom: number } | null;
};

// OpenFreeMap (https://openfreemap.org) liefert kostenlose Vektor-Tiles
// ohne API-Key und ohne harte Limits. Faellt automatisch auf einen
// einfachen OSM-Raster-Style zurueck, wenn der Vektor-Style nicht laedt.
const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

const FALLBACK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap-Mitwirkende",
      maxzoom: 19,
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

export function GuessMap({ guess, truth, debugTruth, onMapClick, viewKey, initialView }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const guessMarkerRef = useRef<Marker | null>(null);
  const truthMarkerRef = useRef<Marker | null>(null);
  const debugMarkerRef = useRef<Marker | null>(null);
  const lineSourceAdded = useRef(false);
  const onMapClickRef = useRef(onMapClick);

  // Ref aktuell halten, damit der einmal registrierte Listener immer den aktuellen Handler nutzt
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // Karte einmalig initialisieren
  useEffect(() => {
    if (containerRef.current === null || mapRef.current !== null) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OPENFREEMAP_STYLE,
      center: initialView?.center ?? [10, 30],
      zoom: initialView?.zoom ?? 1.2,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    // Map-Speed anpassen — Default-Scroll-Zoom ist sehr behaebig (1/450).
    // Mit 1/100 ist das Mausrad ~4x schneller.
    map.scrollZoom.setWheelZoomRate(1 / 100);
    map.scrollZoom.setZoomRate(1 / 80);

    // Beschriftungen auf Deutsch umstellen, mit Fallback auf name:latin und name.
    // 'style.load' feuert beim ersten Laden und bei jedem setStyle erneut —
    // perfekt fuer den Fallback-Fall.
    map.on("style.load", () => {
      const style = map.getStyle();
      const layers = style.layers ?? [];
      for (const layer of layers) {
        const layout = (layer as { layout?: Record<string, unknown> }).layout;
        if (layout && "text-field" in layout) {
          try {
            map.setLayoutProperty(layer.id, "text-field", [
              "coalesce",
              ["get", "name:de"],
              ["get", "name:latin"],
              ["get", "name"],
            ]);
          } catch {
            // einzelne Layer dürfen scheitern (z. B. wenn ein Layer kein Standard-Schema hat)
          }
        }
      }
    });

    // Falls OpenFreeMap nicht erreichbar ist, auf OSM-Raster zurueckfallen
    map.on("error", (e) => {
      const msg = e?.error?.message ?? "";
      if (msg.includes("style") || msg.includes("Failed to fetch")) {
        try {
          map.setStyle(FALLBACK_STYLE);
        } catch {
          // ignorieren
        }
      }
    });

    map.on("click", (e) => {
      const handler = onMapClickRef.current;
      if (handler === null) return;
      handler(e.lngLat.lat, e.lngLat.lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Bei Etappenwechsel auf den passenden Continent-Zoom (oder Welt) fliegen
  const lastViewKey = useRef<number | string | undefined>(viewKey);
  useEffect(() => {
    const map = mapRef.current;
    if (map === null) return;
    if (viewKey === lastViewKey.current) return;
    lastViewKey.current = viewKey;
    const target = initialView ?? { center: [10, 30] as [number, number], zoom: 1.2 };
    map.flyTo({ center: target.center, zoom: target.zoom, duration: 700, essential: true });
  }, [viewKey, initialView]);

  // Tipp-Marker aktualisieren
  useEffect(() => {
    const map = mapRef.current;
    if (map === null) return;

    if (guess === null) {
      if (guessMarkerRef.current !== null) {
        guessMarkerRef.current.remove();
        guessMarkerRef.current = null;
      }
      return;
    }

    const lngLat: LngLatLike = [guess.lng, guess.lat];
    if (guessMarkerRef.current === null) {
      guessMarkerRef.current = new maplibregl.Marker({ color: "#b45309" })
        .setLngLat(lngLat)
        .addTo(map);
    } else {
      guessMarkerRef.current.setLngLat(lngLat);
    }
  }, [guess]);

  // Debug-Marker fuer wahre Position waehrend des Ratens
  useEffect(() => {
    const map = mapRef.current;
    if (map === null) return;

    if (debugMarkerRef.current !== null) {
      debugMarkerRef.current.remove();
      debugMarkerRef.current = null;
    }
    if (debugTruth === undefined || debugTruth === null) return;
    if (!isDebugActive()) return;

    const el = document.createElement("div");
    el.style.width = "16px";
    el.style.height = "16px";
    el.style.borderRadius = "50%";
    el.style.background = "rgba(34, 197, 94, 0.85)";
    el.style.border = "2px solid #fff";
    el.style.boxShadow = "0 0 0 2px rgba(34,197,94,0.4)";
    el.title = "DEBUG: wahre Position";

    debugMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([debugTruth.lng, debugTruth.lat])
      .addTo(map);
  }, [debugTruth]);

  // Wahrheits-Marker + Linie aktualisieren (nach Tipp-Abgabe)
  useEffect(() => {
    const map = mapRef.current;
    if (map === null) return;

    if (truthMarkerRef.current !== null) {
      truthMarkerRef.current.remove();
      truthMarkerRef.current = null;
    }
    if (lineSourceAdded.current && map.getLayer("guess-line") !== undefined) {
      map.removeLayer("guess-line");
    }
    if (lineSourceAdded.current && map.getSource("guess-line") !== undefined) {
      map.removeSource("guess-line");
      lineSourceAdded.current = false;
    }

    if (truth === undefined || truth === null) return;

    truthMarkerRef.current = new maplibregl.Marker({ color: "#3f6212" })
      .setLngLat([truth.lng, truth.lat])
      .addTo(map);

    // Pulse-Ring am Tipp-Marker fuer ~900 ms (visuelles Echo der Vibration)
    if (guessMarkerRef.current !== null) {
      const el = guessMarkerRef.current.getElement();
      el.classList.add("marker-pulse");
      const id = window.setTimeout(() => {
        el.classList.remove("marker-pulse");
      }, 1000);
      // cleanup ueber Marker-Recreation handled durch ref-tracking
      void id;
    }

    if (guess !== null) {
      const ensureSource = () => {
        if (map.getSource("guess-line") !== undefined) return;
        map.addSource("guess-line", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [
                [guess.lng, guess.lat],
                [truth.lng, truth.lat],
              ],
            },
          },
        });
        map.addLayer({
          id: "guess-line",
          type: "line",
          source: "guess-line",
          paint: {
            "line-color": "#1c1917",
            "line-width": 1.5,
            "line-dasharray": [2, 3],
          },
        });
        lineSourceAdded.current = true;
      };

      if (map.isStyleLoaded()) {
        ensureSource();
      } else {
        map.once("load", ensureSource);
      }

      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([guess.lng, guess.lat]);
      bounds.extend([truth.lng, truth.lat]);
      map.fitBounds(bounds, { padding: 60, maxZoom: 8, duration: 450 });
    }
  }, [truth, guess]);

  return (
    <div className="relative h-full w-full overflow-hidden border border-ink/10 shadow-[0_30px_60px_-20px_rgba(28,25,23,0.25)]">
      <div ref={containerRef} className="h-full w-full" />
      {onMapClick !== null && guess === null ? (
        <div className="pointer-events-none absolute inset-x-0 top-4 mx-auto w-fit bg-ink/85 px-4 py-1.5 backdrop-blur-sm">
          <span className="small-caps text-[10px] text-cream">Klicke auf die Karte um zu raten</span>
        </div>
      ) : null}
    </div>
  );
}
