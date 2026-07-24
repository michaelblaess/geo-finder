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
  // Bereits im Hintergrund geladener Folgetitel
  const nextRef = useRef<{ index: number; howl: Howl } | null>(null);

  // Beim Mount pruefen, welche Titel real ausgeliefert werden. Jeder Titel hat
  // mehrere Formate (Ogg zuerst, MP3 als Fallback fuer Safari vor 18.4). Geprueft
  // wird JEDE Quelle, weil je nach Build auch nur eines der Formate da sein kann.
  // Ergebnis sind Titel mit bereits aufgeloesten, real vorhandenen Quellen.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const checks = await Promise.all(
        PLAYLIST.map(async (t) => {
          const urls = resolveSrc(t.src);
          const flags = await Promise.all(urls.map(isAvailable));
          return { ...t, src: urls.filter((_, i) => flags[i]) };
        }),
      );
      if (cancelled) {
        return;
      }
      const ok = checks.filter((t) => t.src.length > 0);
      availableRef.current = ok;
      setAvailable(ok);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Baut einen Howl fuer einen Titel, ohne ihn zu starten.
  //
  // html5: true ist hier bewusst gesetzt. Mit Web Audio laedt Howler die Datei
  // komplett herunter und dekodiert sie, BEVOR der erste Ton kommt - bei 2 bis
  // 3 MB je Satz eine hoerbare Wartezeit nach dem Klick. Die howler-Doku
  // empfiehlt HTML5 Audio ausdruecklich fuer grosse Dateien, dann laeuft die
  // Wiedergabe waehrend des Ladens an. Die Vorteile von Web Audio (nahtlose
  // Loops, exakte Zeitsteuerung, Effekte) braucht Hintergrundmusik nicht.
  function buildHowl(track: Track): Howl {
    return new Howl({
      // Quellen sind bereits aufgeloest und auf real vorhandene Dateien
      // gefiltert. Howler nimmt daraus das Format, das der Browser kann.
      src: track.src,
      html5: true,
      loop: false,
      volume: MUSIC_VOLUME,
    });
  }

  // Holt den naechsten Titel schon waehrend des laufenden in den Speicher,
  // damit der Wechsel ohne Pause passiert. Howler laedt beim Erzeugen von
  // selbst los (Option preload, Standard true).
  function preloadNext(i: number) {
    const list = availableRef.current;
    const len = list.length;
    if (len < 2) {
      return;
    }
    const wrapped = ((i % len) + len) % len;
    if (nextRef.current?.index === wrapped) {
      return;
    }
    nextRef.current?.howl.unload();
    nextRef.current = { index: wrapped, howl: buildHowl(list[wrapped]) };
  }

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

    // Wurde genau dieser Titel schon vorgeladen, den fertigen Howl nehmen.
    const prepared = nextRef.current;
    nextRef.current = null;
    let howl: Howl;
    if (prepared && prepared.index === wrapped) {
      howl = prepared.howl;
    } else {
      prepared?.howl.unload();
      howl = buildHowl(track);
    }

    // Handler erst hier setzen, weil ein vorgeladener Howl noch keine hat.
    howl.off();
    howl.on("play", () => {
      failCountRef.current = 0;
      preloadNext(wrapped + 1);
    });
    howl.on("end", () => startTrackRef.current(indexRef.current + 1));
    howl.on("loaderror", () => advanceAfterError(wrapped));
    howl.on("playerror", () => advanceAfterError(wrapped));

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

  // Howls beim Unmount freigeben (greift praktisch nur beim App-Ende)
  useEffect(() => {
    return () => {
      howlRef.current?.unload();
      nextRef.current?.howl.unload();
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
      className={`inline-flex items-center gap-2 border px-2.5 py-1.5 transition-colors ${
        playing
          ? "border-rust/50 bg-rust-soft text-rust"
          : "border-paper-rule text-ink-soft hover:border-rust/40 hover:text-rust"
      }`}
    >
      <TaktGlyph playing={playing} />
      <span className="small-caps text-[11px] leading-none">Musik</span>
    </button>
  );
}

// Drei Haarstriche als Signatur-Glyph: im Ruhezustand still, beim Abspielen im
// gestaffelten Dirigenten-Takt (Animation in index.css, Bewegungsreduktion dort
// beruecksichtigt).
function TaktGlyph({ playing }: { playing: boolean }) {
  const restingScale = ["scaleY(0.4)", "scaleY(0.75)", "scaleY(0.5)"];
  return (
    <span className="flex h-3.5 items-end gap-[3px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-3.5 w-[2px] origin-bottom bg-current ${playing ? `animate-beat-${i + 1}` : ""}`}
          style={playing ? undefined : { transform: restingScale[i] }}
        />
      ))}
    </span>
  );
}
