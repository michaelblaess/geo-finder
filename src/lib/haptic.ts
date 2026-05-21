// Subtiles Vibrations-Feedback fuer mobile Geraete.
// Auf Geraeten ohne Vibrations-API ist es ein No-op.

export function vibrateTap(): void {
  try {
    navigator.vibrate?.(15);
  } catch {
    // ignorieren
  }
}

export function vibrateReveal(): void {
  try {
    navigator.vibrate?.([60, 30, 60]);
  } catch {
    // ignorieren
  }
}
