import { useState } from "react";
import type { Location } from "../lib/types";
import { imageUrl } from "../lib/locations";
import { log } from "../lib/debug";

type Props = {
  location: Location;
  roundIndex: number;
  totalRounds: number;
  // true = das Spiel ist in der Result-Phase, dann darf der Label gezeigt werden
  reveal: boolean;
  // Optionaler Hinweis-Text (z. B. Kontinent bei Schwierigkeit "einfach")
  hint?: string | null;
};

const ROUND_NUMERAL = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export function BildPanel({ location, roundIndex, totalRounds, reveal, hint }: Props) {
  const [errored, setErrored] = useState(false);
  const url = imageUrl(location.image);

  return (
    <figure
      style={{ viewTransitionName: "bild" } as React.CSSProperties}
      className="group relative h-full w-full overflow-hidden border border-ink/10 bg-cream-deep shadow-[0_30px_60px_-20px_rgba(28,25,23,0.25)]"
    >
      {/* Bild */}
      {errored ? (
        <FallbackPlate url={url} />
      ) : (
        <img
          key={url}
          src={url}
          alt={`Standortbild Etappe ${roundIndex + 1}`}
          className="h-full w-full object-cover"
          draggable={false}
          onLoad={() => {
            log(`Bild geladen — Etappe ${roundIndex + 1}`, { url });
          }}
          onError={() => {
            console.warn(
              `%cgeo-finder%c Bild konnte nicht geladen werden`,
              "color:#fff;background:#dc2626;padding:2px 8px;border-radius:4px;font-weight:700",
              "color:#dc2626;font-weight:600",
              { etappe: roundIndex + 1, url, location: location.label },
            );
            setErrored(true);
          }}
        />
      )}

      {/* Verlauf von oben/unten fuer Lesbarkeit */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/55 to-transparent"
      />

      {/* Etappen-Marke oben links */}
      <figcaption className="absolute left-5 top-5 flex items-center gap-3 text-cream">
        <span className="small-caps text-[10px] opacity-90">Etappe</span>
        <span className="font-headline text-3xl italic leading-none">
          {ROUND_NUMERAL[roundIndex] ?? roundIndex + 1}
        </span>
        <span className="text-cream/60">/</span>
        <span className="font-display text-sm opacity-80">{totalRounds}</span>
      </figcaption>

      {/* Hinweis oben rechts (Schwierigkeit "einfach") */}
      {hint !== undefined && hint !== null && !reveal ? (
        <div className="absolute right-5 top-5 flex items-baseline gap-2 text-cream">
          <span className="small-caps text-[10px] opacity-90">Hinweis</span>
          <span className="font-headline text-base italic">{hint}</span>
        </div>
      ) : null}

      {/* Credit unten rechts */}
      <span className="absolute bottom-4 right-5 max-w-[60%] truncate text-right font-display text-[10px] uppercase tracking-widest text-cream/70">
        {location.credit}
      </span>

      {/* Reveal: Label-Overlay nach Tipp */}
      {reveal ? (
        <div className="absolute bottom-5 left-5 max-w-[70%] rounded-sm bg-cream/95 px-3 py-2 shadow-md backdrop-blur">
          <p className="small-caps text-[10px] text-rust">Hier warst du</p>
          <p className="font-headline text-lg italic text-ink">{location.label}</p>
        </div>
      ) : null}
    </figure>
  );
}

function FallbackPlate({ url }: { url: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-cream-deep p-8 text-center">
      <p className="font-headline text-3xl italic text-ink-muted">Bild nicht verfügbar</p>
      <p className="mt-2 small-caps text-[10px] text-ink-muted">offline · cors · oder url tot</p>
      <p className="mt-6 max-w-md break-all font-display text-[10px] text-ink-muted/70">{url}</p>
    </div>
  );
}
