import { useCallback, useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import { MUSIC_VOLUME, PLAYLIST, type Track } from "../lib/music";

// Loest einen Quellpfad gegen das Vite-Base auf (z.B. "/geo-finder/").
// Absolute URLs bleiben unveraendert.
function resolveSrc(src: string[]): string[] {
  const base = import.meta.env.BASE_URL;
  return src.map((s) => (/^https?:\/\//.test(s) ? s : `${base}${s}`));
}

// Prueft per HEAD, ob eine Datei tatsaechlich ausgeliefert wird. Ein SPA-Server
// kann fuer Unbekanntes die index.html mit Status 200 zurueckgeben - deshalb
// zusaetzlich den Content-Type gegen text/html absichern.
async function isAvailable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) {
      return false;
    }
    const type = res.headers.get("content-type") ?? "";
    return !type.startsWith("text/html");
  } catch {
    return false;
  }
}

// Hintergrundmusik-Player. Genau eine Instanz gehoert in den (persistenten)
// Layout-Header, damit die Wiedergabe ueber Routenwechsel hinweg weiterlaeuft.
//
// Verhalten laut Vorgabe:
//   - Ist keine Audiodatei erreichbar, rendert die Komponente nichts (kein
//     Button, keine Fehlermeldung).
//   - Sind Dateien da, erscheint ein einzelner An/Aus-Button.
//   - Wiedergabe startet ausschliesslich per Klick (Browser-Autoplay-Policy)
//     und zykliert die verfuegbaren Titel.
export function MusicPlayer() {
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState<Track[]>([]);
  const [playing, setPlaying] = useState(false);

  const howlRef = useRef<Howl | null>(null);
  const availableRef = useRef<Track[]>([]);
  const indexRef = useRef(0);
  const failCountRef = useRef(0);
  const startTrackRef = useRef<(i: number) => void>(() => {});

  // Beim Mount pruefen, welche Titel real ausgeliefert werden
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const checks = await Promise.all(PLAYLIST.map((t) => isAvailable(resolveSrc(t.src)[0])));
      if (cancelled) {
        return;
      }
      const ok = PLAYLIST.filter((_, i) => checks[i]);
      availableRef.current = ok;
      setAvailable(ok);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Startet den Titel am (umlaufenden) Index und beginnt die Wiedergabe.
  // Bei Lade-/Wiedergabefehlern wird uebersprungen; schlagen alle fehl, stoppt es.
  const startTrack = useCallback((i: number) => {
    const list = availableRef.current;
    const len = list.length;
    if (0 === len) {
      return;
    }
    const wrapped = ((i % len) + len) % len;
    const track = list[wrapped];

    howlRef.current?.unload();

    const howl = new Howl({
      src: resolveSrc(track.src),
      // Web Audio (kein html5) fuer nahtloses Looping und exakte Lautstaerke
      html5: false,
      loop: false,
      volume: MUSIC_VOLUME,
      onplay: () => {
        failCountRef.current = 0;
      },
      onend: () => startTrackRef.current(indexRef.current + 1),
      onloaderror: () => advanceAfterError(wrapped),
      onplayerror: () => advanceAfterError(wrapped),
    });

    howlRef.current = howl;
    howl.play();

    indexRef.current = wrapped;
    setPlaying(true);
  }, []);

  startTrackRef.current = startTrack;

  // Springt nach einem Fehler zum naechsten Titel. Nach einer vollen Runde ohne
  // Erfolg wird aufgegeben, damit keine Endlosschleife entsteht.
  function advanceAfterError(failedIndex: number) {
    failCountRef.current += 1;
    if (failCountRef.current > availableRef.current.length) {
      failCountRef.current = 0;
      setPlaying(false);
      return;
    }
    startTrackRef.current(failedIndex + 1);
  }

  // Howl beim Unmount freigeben (greift praktisch nur beim App-Ende)
  useEffect(() => {
    return () => {
      howlRef.current?.unload();
    };
  }, []);

  const toggle = useCallback(() => {
    const howl = howlRef.current;
    if (playing && howl) {
      howl.pause();
      setPlaying(false);
      return;
    }
    if (howl && "loaded" === howl.state()) {
      howl.play();
      setPlaying(true);
      return;
    }
    startTrack(indexRef.current);
  }, [playing, startTrack]);

  if (!ready || 0 === available.length) {
    return null;
  }

  const label = playing ? "Musik aus" : "Musik an";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center transition-colors ${
        playing ? "text-rust" : "text-ink-soft hover:text-rust"
      }`}
    >
      <TaktGlyph playing={playing} />
    </button>
  );
}

// Drei Haarstriche als Signatur-Glyph: im Ruhezustand still, beim Abspielen im
// gestaffelten Dirigenten-Takt (Animation in index.css, Bewegungsreduktion dort
// beruecksichtigt).
function TaktGlyph({ playing }: { playing: boolean }) {
  const restingScale = ["scaleY(0.4)", "scaleY(0.7)", "scaleY(0.5)"];
  return (
    <span className="flex h-4 items-end gap-[3px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-4 w-[2px] origin-bottom bg-current ${playing ? `animate-beat-${i + 1}` : ""}`}
          style={playing ? undefined : { transform: restingScale[i] }}
        />
      ))}
    </span>
  );
}
