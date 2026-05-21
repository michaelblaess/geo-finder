import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { clearScores, loadScores } from "../lib/highscore";
import { clearPlayedIds, playedCount } from "../lib/playedHistory";
import { totalLocations } from "../lib/locations";
import type { StoredScore } from "../lib/types";

export function Highscore() {
  const [scores, setScores] = useState<StoredScore[]>([]);
  const [played, setPlayed] = useState(0);
  const total = totalLocations();

  useEffect(() => {
    setScores(loadScores());
    setPlayed(playedCount());
  }, []);

  function handleReset() {
    if (!confirm("Wirklich alle lokalen Einträge löschen?")) return;
    clearScores();
    setScores([]);
  }

  function handleResetPlayed() {
    if (!confirm(`Gespielte Orte vergessen — alle ${total} sind wieder im Pool. Wirklich?`)) return;
    clearPlayedIds();
    setPlayed(0);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="animate-rise mb-10">
        <p className="small-caps text-[11px] text-rust">Bestenliste</p>
        <h1 className="mt-3 font-headline text-5xl font-semibold tracking-tight text-ink">
          Bestenliste der Reisenden
        </h1>
        <p className="mt-3 max-w-xl font-display text-base text-ink-soft">
          Die zehn besten Reisen — gespeichert ausschließlich in deinem Browser, ohne Server,
          ohne Konto.
        </p>
      </div>

      <div className="animate-rise-1 rule mb-4">
        <span className="small-caps text-[10px]">{scores.length} Einträge</span>
      </div>

      {scores.length === 0 ? (
        <div className="animate-rise-2 border border-paper-rule bg-cream-deep/40 p-12 text-center">
          <p className="font-headline text-2xl italic text-ink-soft">
            Noch keine Reise unternommen.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-3 bg-ink px-6 py-3.5 text-cream transition-colors hover:bg-rust active:translate-y-px"
          >
            <span className="small-caps text-xs">Erste Reise antreten</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </Link>
        </div>
      ) : (
        <ol className="animate-rise-2 divide-y divide-paper-rule border-y border-paper-rule">
          {scores.map((s, i) => {
            const isFirst = i === 0;
            return (
              <li
                key={s.playedAt}
                className="grid grid-cols-[auto_1fr_auto] items-baseline gap-x-5 py-4 transition-colors hover:bg-cream-deep/40"
              >
                <span
                  className={`font-headline text-3xl italic ${
                    isFirst ? "text-gold" : i === 1 ? "text-rust" : i === 2 ? "text-moss" : "text-ink-muted"
                  }`}
                >
                  №&thinsp;{i + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-headline text-xl italic text-ink">{s.nickname}</p>
                  <p className="text-xs text-ink-muted">
                    {new Date(s.playedAt).toLocaleString("de-DE")}
                  </p>
                </div>
                <p className={`font-headline text-2xl ${isFirst ? "text-gold" : "text-rust"}`}>
                  {s.totalPoints.toLocaleString("de-DE")}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      {scores.length > 0 ? (
        <div className="animate-rise-3 mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="border border-ink/20 px-4 py-2 text-xs transition-colors hover:border-rust hover:text-rust"
          >
            <span className="small-caps">Liste löschen</span>
          </button>
        </div>
      ) : null}

      <div className="mt-12 border-t border-paper-rule pt-6">
        <p className="small-caps text-[11px] text-rust">Pool-Status</p>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
          <p className="font-display text-base text-ink-soft">
            <span className="font-headline text-2xl italic text-ink">{played}</span> von{" "}
            <span className="font-headline italic">{total}</span> Orten bereits gespielt.
          </p>
          {played > 0 ? (
            <button
              type="button"
              onClick={handleResetPlayed}
              className="border border-ink/20 px-4 py-2 text-xs transition-colors hover:border-rust hover:text-rust"
            >
              <span className="small-caps">Pool zurücksetzen</span>
            </button>
          ) : null}
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          Bereits gespielte Orte werden nicht erneut ausgewählt. Wenn der Pool leer
          ist, setzt er sich automatisch zurück.
        </p>
      </div>

      <p className="mt-8 text-xs text-ink-muted">
        <span className="small-caps">Hinweis</span> &nbsp;·&nbsp; Highscores und Pool-Verlauf
        werden ausschließlich in deinem Browser gespeichert (localStorage). Sie verlassen
        dein Gerät nicht.
      </p>
    </div>
  );
}
