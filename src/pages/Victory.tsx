import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { saveScore } from "../lib/highscore";
import { formatDistance } from "../lib/scoring";
import { log } from "../lib/debug";
import type { GameResult, StoredScore } from "../lib/types";

const ROUND_NUMERAL = ["I", "II", "III", "IV", "V"];

// Zaehlt eine Zahl in ms hoch fuer einen sanften Reveal
function useCountUp(target: number, durationMs = 1400): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const elapsed = t - start;
      const ratio = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - ratio, 3);
      setValue(Math.round(target * eased));
      if (ratio < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

export function Victory() {
  const navigate = useNavigate();
  const routerLoc = useLocation();
  const result = (routerLoc.state as { result?: GameResult } | null)?.result;

  useEffect(() => {
    if (result === undefined) {
      navigate("/", { replace: true });
    }
  }, [result, navigate]);

  const [savedScores, setSavedScores] = useState<StoredScore[] | null>(null);
  useEffect(() => {
    if (result === undefined || savedScores !== null) return;
    const updated = saveScore(result);
    setSavedScores(updated);
    log("Highscore gespeichert", { gesamtEintrage: updated.length });
  }, [result, savedScores]);

  const rank = useMemo(() => {
    if (savedScores === null || result === undefined) return null;
    const idx = savedScores.findIndex(
      (s) => s.playedAt === result.playedAt && s.totalPoints === result.totalPoints,
    );
    return idx >= 0 ? idx + 1 : null;
  }, [savedScores, result]);

  const counted = useCountUp(result?.totalPoints ?? 0);

  if (result === undefined) return null;

  const ratio = result.totalPoints / 25000;
  let kicker = "Ein Versuch";
  let headline = "Geschafft.";
  if (ratio >= 0.8) {
    kicker = "Bemerkenswert";
    headline = "Weltreisende.";
  } else if (ratio >= 0.5) {
    kicker = "Sehr gut";
    headline = "Gute Reise.";
  } else if (ratio >= 0.2) {
    kicker = "Solide";
    headline = "Solide Etappen.";
  } else {
    kicker = "Noch nicht";
    headline = "Noch ein Versuch?";
  }

  return (
    <div className="topo-bg">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        {/* Editorial-Headline */}
        <div className="animate-rise">
          <p className="small-caps text-[11px] text-rust">Schlussbericht</p>
          <h1 className="mt-3 font-headline text-6xl font-semibold leading-[0.95] tracking-tight text-ink sm:text-7xl">
            {kicker}.<br />
            <span className="italic font-medium text-rust">{headline}</span>
          </h1>
        </div>

        {/* Hauptzahl */}
        <div className="animate-rise-1 mt-12 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="small-caps text-[10px] text-ink-soft">Punktestand</p>
            <p className="mt-2 font-headline text-[18vw] leading-[0.85] tracking-tighter text-ink sm:text-[12rem]">
              {counted.toLocaleString("de-DE")}
            </p>
            <p className="mt-2 font-display text-sm text-ink-soft">
              von 25.000 möglichen Punkten erspielt durch{" "}
              <span className="italic">{result.nickname}</span>
              {rank !== null ? (
                <>
                  {" "}— Platz <span className="text-rust">№ {rank}</span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        {/* Editorial-Trennlinie */}
        <div className="animate-rise-2 mt-14 rule">
          <span className="small-caps text-[10px]">Etappenbuch</span>
        </div>

        {/* Etappen-Tabelle */}
        <ul className="animate-rise-3 mt-6 divide-y divide-paper-rule">
          {result.rounds.map((r, i) => (
            <li key={i} className="grid grid-cols-[auto_1fr_auto_auto] items-baseline gap-x-5 py-4">
              <span className="font-headline text-2xl italic text-ink-muted">
                {ROUND_NUMERAL[i] ?? i + 1}
              </span>
              <span className="font-headline text-lg italic text-ink">{r.location.label}</span>
              <span className="text-sm text-ink-soft">
                {r.distanceKm < 0 ? (
                  <span className="small-caps text-[10px] text-gold">übersprungen</span>
                ) : (
                  formatDistance(r.distanceKm)
                )}
              </span>
              <span className="font-headline text-xl text-rust">
                {r.points.toLocaleString("de-DE")}
              </span>
            </li>
          ))}
        </ul>

        {/* Aktionen */}
        <div className="animate-rise-4 mt-10 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              log("Neue Reise startet", { spieler: result.nickname });
              navigate("/spiel", { state: { nickname: result.nickname } });
            }}
            className="group inline-flex flex-1 items-center justify-center gap-3 bg-ink px-6 py-4 text-cream transition-colors hover:bg-rust active:translate-y-px"
          >
            <span className="small-caps text-xs">Neue Reise antreten</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="transition-transform group-hover:translate-x-0.5">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </button>
          <Link
            to="/highscore"
            className="inline-flex flex-1 items-center justify-center border border-ink/25 px-6 py-4 text-ink transition-colors hover:border-rust hover:text-rust"
          >
            <span className="small-caps text-xs">Bestenliste ansehen</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
