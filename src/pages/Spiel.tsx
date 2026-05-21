import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BildPanel } from "../components/BildPanel";
import { GuessMap } from "../components/GuessMap";
import { RoundResult } from "../components/RoundResult";
import { pickRandomLocations } from "../lib/locations";
import { haversineKm, pointsFromDistance } from "../lib/scoring";
import { debugGroup, debugLog, debugTable, isDebugActive, log } from "../lib/debug";
import {
  clearActiveGame,
  loadActiveGame,
  saveActiveGame,
  type Phase,
} from "../lib/gameSession";
import { loadDifficulty, TIMER_SECONDS, viewForRound } from "../lib/difficulty";
import { addPlayedId, locationKey } from "../lib/playedHistory";
import { vibrateReveal, vibrateTap } from "../lib/haptic";
import type { Difficulty, GameResult, Round } from "../lib/types";

const TOTAL_ROUNDS = 5;

export function Spiel() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const routerState = routerLocation.state as
    | { nickname?: string; difficulty?: Difficulty }
    | null;
  const stateNickname = routerState?.nickname ?? "Anonym";
  const stateDifficulty: Difficulty = routerState?.difficulty ?? loadDifficulty();

  // Initial state: aktive Reise wiederherstellen oder neu starten
  const initial = useMemo(() => {
    const saved = loadActiveGame();
    if (saved !== null) {
      log("Aktive Reise wiederhergestellt", {
        spieler: saved.nickname,
        schwierigkeit: saved.difficulty,
        etappe: saved.roundIndex + 1,
        bisherigePunkte: saved.completedRounds.reduce((s, r) => s + r.points, 0),
      });
      return saved;
    }
    const locations = pickRandomLocations(TOTAL_ROUNDS);
    log("Spielsession startet", {
      spieler: stateNickname,
      schwierigkeit: stateDifficulty,
      runden: locations.length,
    });
    debugGroup("Gezogene Locations (DEBUG)", () => {
      debugTable(
        "Pool",
        locations.map((p, i) => ({
          "#": i + 1,
          Ort: p.label,
          Lat: p.lat,
          Lng: p.lng,
          Kontinent: p.continent,
        })),
      );
    });
    return {
      nickname: stateNickname,
      difficulty: stateDifficulty,
      locations,
      roundIndex: 0,
      guess: null,
      phase: "guessing" as Phase,
      completedRounds: [] as Round[],
      currentResult: null as { distanceKm: number; points: number } | null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [nickname] = useState(initial.nickname);
  const [difficulty] = useState<Difficulty>(initial.difficulty);
  const [locations] = useState(initial.locations);
  const [roundIndex, setRoundIndex] = useState(initial.roundIndex);
  const [guess, setGuess] = useState(initial.guess);
  const [phase, setPhase] = useState<Phase>(initial.phase);
  const [completedRounds, setCompletedRounds] = useState(initial.completedRounds);
  const [currentResult, setCurrentResult] = useState(initial.currentResult);

  // Persistiere bei jeder Aenderung — so kann der Spieler navigieren und zurueckkommen
  useEffect(() => {
    saveActiveGame({
      nickname,
      difficulty,
      locations,
      roundIndex,
      guess,
      phase,
      completedRounds,
      currentResult,
    });
  }, [nickname, difficulty, locations, roundIndex, guess, phase, completedRounds, currentResult]);

  const current = locations[roundIndex];

  // Beim Wechsel der Runde loggen — Stadtname NICHT, sonst Spoiler
  useEffect(() => {
    if (current === undefined) return;
    log(`Etappe ${roundIndex + 1} von ${TOTAL_ROUNDS} laeuft`);
    debugLog("Wahre Position (DEBUG)", { lat: current.lat, lng: current.lng, label: current.label });
  }, [roundIndex, current]);

  // Timer fuer Schwer-Modus
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  useEffect(() => {
    if (difficulty !== "schwer" || phase !== "guessing" || current === undefined) {
      return;
    }
    const start = Date.now();
    setSecondsLeft(TIMER_SECONDS);
    const id = window.setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const left = Math.max(0, TIMER_SECONDS - elapsed);
      setSecondsLeft(Math.ceil(left));
      if (left <= 0) {
        window.clearInterval(id);
        // Auto-Submit: aktueller Tipp oder 0 Punkte
        if (guessRef.current !== null) {
          const g = guessRef.current;
          const distanceKm = haversineKm(g.lat, g.lng, current.lat, current.lng);
          const points = pointsFromDistance(distanceKm);
          log(`Etappe ${roundIndex + 1} (Zeit abgelaufen): ${current.label}`, {
            tipp: `${g.lat.toFixed(3)}, ${g.lng.toFixed(3)}`,
            distanzKm: Math.round(distanceKm),
            punkte: points,
          });
          setCurrentResult({ distanceKm, points });
        } else {
          log(`Etappe ${roundIndex + 1}: Zeit abgelaufen ohne Tipp`, { punkte: 0 });
          setCurrentResult({ distanceKm: -1, points: 0 });
        }
        setPhase("result");
      }
    }, 250);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, phase, roundIndex]);

  // Aktuellen guess fuer den Timer-Callback referenzieren (vermeidet stale closure)
  const guessRef = useRef(guess);
  useEffect(() => {
    guessRef.current = guess;
  }, [guess]);

  function handleSubmit() {
    if (guess === null) return;
    vibrateTap();
    const distanceKm = haversineKm(guess.lat, guess.lng, current.lat, current.lng);
    const points = pointsFromDistance(distanceKm);
    log(`Etappe ${roundIndex + 1}: ${current.label}`, {
      tipp: `${guess.lat.toFixed(3)}, ${guess.lng.toFixed(3)}`,
      ziel: `${current.lat.toFixed(3)}, ${current.lng.toFixed(3)}`,
      distanzKm: Math.round(distanceKm),
      punkte: points,
    });
    setCurrentResult({ distanceKm, points });
    setPhase("result");
    // Doppel-Pulse beim Reveal — kurze Verzoegerung damit Tap und Reveal trennbar fuehlen
    setTimeout(vibrateReveal, 200);
  }

  function handleContinue() {
    if (currentResult === null) return;
    const finishedRound: Round = {
      location: current,
      guessLat: guess?.lat ?? 0,
      guessLng: guess?.lng ?? 0,
      distanceKm: currentResult.distanceKm,
      points: currentResult.points,
    };
    addPlayedId(locationKey(current));
    const nextCompleted = [...completedRounds, finishedRound];

    if (roundIndex + 1 >= TOTAL_ROUNDS) {
      const totalPoints = nextCompleted.reduce((sum, r) => sum + r.points, 0);
      const result: GameResult = {
        nickname,
        totalPoints,
        rounds: nextCompleted,
        playedAt: new Date().toISOString(),
      };
      log("Reise beendet", {
        spieler: nickname,
        gesamtpunkte: totalPoints,
        maxMoeglich: 25000,
      });
      clearActiveGame();
      navigate("/victory", { state: { result } });
      return;
    }

    advanceRound(nextCompleted);
  }

  // Naechste Etappe einleiten — wenn die View-Transitions-API verfuegbar ist,
  // wird der Wechsel als Slide-Animation gerendert (Bild slidet links raus,
  // neues von rechts rein). Browser ohne Support nutzen den CSS-Slide via key.
  function advanceRound(nextCompleted: Round[]) {
    const apply = () => {
      setCompletedRounds(nextCompleted);
      setRoundIndex(roundIndex + 1);
      setGuess(null);
      setCurrentResult(null);
      setPhase("guessing");
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (typeof doc.startViewTransition === "function") {
      doc.startViewTransition(() => apply());
    } else {
      apply();
    }
  }

  function handleDebugSkip() {
    if (current === undefined) return;
    const skippedRound: Round = {
      location: current,
      guessLat: 0,
      guessLng: 0,
      distanceKm: -1,
      points: 0,
    };
    addPlayedId(locationKey(current));
    const nextCompleted = [...completedRounds, skippedRound];
    debugLog(`Etappe ${roundIndex + 1} uebersprungen`);

    if (roundIndex + 1 >= TOTAL_ROUNDS) {
      const result: GameResult = {
        nickname,
        totalPoints: nextCompleted.reduce((sum, r) => sum + r.points, 0),
        rounds: nextCompleted,
        playedAt: new Date().toISOString(),
      };
      clearActiveGame();
      navigate("/victory", { state: { result } });
      return;
    }

    advanceRound(nextCompleted);
  }

  useEffect(() => {
    if (locations.length === 0) {
      navigate("/");
    }
  }, [locations, navigate]);

  const isLastRound = roundIndex + 1 >= TOTAL_ROUNDS;
  const totalSoFar = completedRounds.reduce((sum, r) => sum + r.points, 0);
  const debug = isDebugActive();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 pt-5 pb-28 sm:px-6 sm:py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-paper-rule pb-3 text-sm">
        <div className="flex items-baseline gap-3">
          <span className="small-caps text-[10px] text-ink-muted">Reisende</span>
          <span className="font-headline text-lg italic text-ink">{nickname}</span>
        </div>
        {difficulty === "schwer" && phase === "guessing" ? (
          <div className="flex items-baseline gap-3">
            <span className="small-caps text-[10px] text-ink-muted">Zeit</span>
            <span
              className={`font-headline text-lg tabular-nums ${
                secondsLeft <= 10 ? "text-rust animate-pulse-soft" : "text-ink"
              }`}
            >
              {secondsLeft}s
            </span>
          </div>
        ) : null}
        <div className="flex items-baseline gap-3">
          <span className="small-caps text-[10px] text-ink-muted">Punkte</span>
          <span className="font-headline text-lg text-rust">
            {totalSoFar.toLocaleString("de-DE")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="h-[32vh] sm:h-[42vh] lg:h-[70vh]">
          <BildPanel
            key={roundIndex}
            location={current}
            roundIndex={roundIndex}
            totalRounds={TOTAL_ROUNDS}
            reveal={phase === "result"}
            hint={difficulty === "einfach" ? current.continent : null}
          />
        </div>
        <div className="h-[48vh] sm:h-[55vh] lg:h-[70vh]">
          <GuessMap
            guess={guess}
            truth={phase === "result" ? { lat: current.lat, lng: current.lng } : null}
            debugTruth={
              debug && phase === "guessing" ? { lat: current.lat, lng: current.lng } : null
            }
            onMapClick={phase === "guessing" ? (lat, lng) => setGuess({ lat, lng }) : null}
            viewKey={roundIndex}
            initialView={
              phase === "guessing" ? viewForRound(difficulty, current.continent) : null
            }
          />
        </div>
      </div>

      {phase === "guessing" ? (
        <div className="
          fixed inset-x-0 bottom-0 z-30
          flex items-center gap-2
          border-t border-paper-rule bg-cream/95 px-4 py-3 backdrop-blur
          pb-[max(env(safe-area-inset-bottom),0.75rem)]
          sm:static sm:flex-wrap sm:justify-end sm:gap-3
          sm:border-t-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none
        ">
          {debug ? (
            <button
              type="button"
              onClick={handleDebugSkip}
              className="border border-gold/60 bg-gold-soft px-3 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/20 sm:px-4"
            >
              <span className="small-caps text-[10px]">
                <span className="sm:hidden">Skip</span>
                <span className="hidden sm:inline">Etappe überspringen (DEBUG)</span>
              </span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={guess === null}
            className="group inline-flex flex-1 items-center justify-center gap-3 bg-ink px-6 py-3.5 text-cream transition-all hover:bg-rust active:translate-y-px disabled:cursor-not-allowed disabled:bg-ink-muted/40 disabled:text-cream/70 sm:flex-initial sm:w-auto"
          >
            <span className="small-caps text-xs">Tipp abgeben</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="transition-transform group-hover:translate-x-0.5">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </button>
        </div>
      ) : currentResult !== null ? (
        <RoundResult
          location={current}
          distanceKm={currentResult.distanceKm}
          points={currentResult.points}
          isLastRound={isLastRound}
          onContinue={handleContinue}
        />
      ) : null}
    </div>
  );
}
