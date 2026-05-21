// Debug-Mode wird ueber URL ?debug=1 oder localStorage aktiviert.
//
// Zwei Logging-Ebenen:
//   log()         — immer aktiv, fuer High-Level-Events (Spielstart, Tipp, Endscore)
//   debugLog()    — nur wenn Debug-Mode aktiv (Wahre Position, Distanz-Math, etc.)

const STORAGE_KEY = "geo-finder:debug";
const URL_PARAM = "debug";

export function initDebugFromUrl(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has(URL_PARAM)) {
      const value = params.get(URL_PARAM);
      const enable = value === "1" || value === "true";
      localStorage.setItem(STORAGE_KEY, enable ? "1" : "0");
      return enable;
    }
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

let active = false;
export function setDebugActive(value: boolean): void {
  active = value;
}
export function isDebugActive(): boolean {
  return active;
}

const PREFIX_STYLE_LOG = "color:#fff;background:#b45309;padding:2px 8px;border-radius:4px;font-weight:700;font-family:ui-monospace,monospace";
const PREFIX_STYLE_DEBUG = "color:#1c1917;background:#facc15;padding:2px 8px;border-radius:4px;font-weight:700;font-family:ui-monospace,monospace";

// Top-Level-Log: immer sichtbar, keine sensitiven Spoiler-Daten
export function log(label: string, data?: unknown): void {
  if (data === undefined) {
    console.log(`%cgeo-finder%c %c${label}`, PREFIX_STYLE_LOG, "", "color:inherit;font-weight:600");
  } else {
    console.log(`%cgeo-finder%c %c${label}`, PREFIX_STYLE_LOG, "", "color:inherit;font-weight:600", data);
  }
}

// Debug-Log: nur mit ?debug=1 sichtbar, kann Spoiler enthalten (z.B. Wahrheits-Lat/Lng)
export function debugLog(label: string, data?: unknown): void {
  if (!active) return;
  if (data === undefined) {
    console.log(`%cdebug%c %c${label}`, PREFIX_STYLE_DEBUG, "", "color:#a16207;font-style:italic");
  } else {
    console.log(`%cdebug%c %c${label}`, PREFIX_STYLE_DEBUG, "", "color:#a16207;font-style:italic", data);
  }
}

export function debugTable(label: string, rows: unknown[]): void {
  if (!active) return;
  console.groupCollapsed(`%cdebug%c %c${label}`, PREFIX_STYLE_DEBUG, "", "color:#a16207;font-style:italic");
  console.table(rows);
  console.groupEnd();
}

export function debugGroup(label: string, run: () => void): void {
  if (!active) {
    run();
    return;
  }
  console.group(`%cdebug%c %c${label}`, PREFIX_STYLE_DEBUG, "", "color:#a16207;font-style:italic");
  try {
    run();
  } finally {
    console.groupEnd();
  }
}
