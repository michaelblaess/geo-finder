import { formatDistance } from "../lib/scoring";
import type { Location } from "../lib/types";

type Props = {
  location: Location;
  distanceKm: number;
  points: number;
  isLastRound: boolean;
  onContinue: () => void;
};

export function RoundResult({ location, distanceKm, points, isLastRound, onContinue }: Props) {
  const hasInfo = location.extract !== undefined && location.extract.length > 0;

  return (
    <div className="animate-rise relative w-full overflow-hidden border border-ink/15 bg-cream-deep/80 backdrop-blur">
      {/* Wertung */}
      <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <div className="border-b border-ink/10 pb-4 sm:border-b-0 sm:border-r sm:pr-6 sm:pb-0">
          <p className="small-caps text-[10px] text-rust">Etappenwertung</p>
          <p className="mt-1 font-headline text-5xl font-semibold tracking-tight text-ink">
            {points.toLocaleString("de-DE")}
          </p>
          <p className="mt-1 small-caps text-[10px] text-ink-soft">Punkte</p>
        </div>

        <div>
          <p className="small-caps text-[10px] text-ink-soft">Das war</p>
          <p className="mt-1 font-headline text-2xl italic leading-tight text-ink">
            {location.label}
          </p>
          {location.country !== undefined ? (
            <p className="mt-1 font-display text-sm text-ink-soft">
              {location.country}
              {location.continent !== undefined ? (
                <span className="text-ink-muted"> · {location.continent}</span>
              ) : null}
            </p>
          ) : null}
          <p className="mt-2 text-sm text-ink-soft">
            {distanceKm < 0 ? (
              <span className="small-caps text-[10px] text-rust">
                Keine Wertung · Zeit abgelaufen
              </span>
            ) : (
              <>
                <span className="small-caps text-[10px]">Distanz</span>
                <span className="mx-2 text-ink/30">·</span>
                <span className="font-display">{formatDistance(distanceKm)}</span>
              </>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="group inline-flex items-center justify-center gap-3 self-stretch bg-ink px-6 py-4 text-cream transition-colors hover:bg-rust active:translate-y-px"
        >
          <span className="small-caps text-xs">{isLastRound ? "Endergebnis" : "Weiter"}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5"
          >
            <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        </button>
      </div>

      {/* Wikipedia-Info, falls vorhanden — als integrierte Sektion mit
          Editorial-Trennlinie, kein zweiter Card */}
      {hasInfo ? (
        <div className="border-t border-ink/10 px-6 py-4">
          <p className="small-caps text-[10px] text-rust">Aus Wikipedia</p>
          <p className="mt-2 font-display text-sm leading-relaxed text-ink">
            {location.extract}
          </p>
          {location.wikipediaUrl !== undefined ? (
            <a
              href={location.wikipediaUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-rust transition-colors hover:text-rust-deep"
            >
              <span className="small-caps text-xs">Mehr lesen</span>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M5 2h7v7M12 2L4 10M2 6v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
