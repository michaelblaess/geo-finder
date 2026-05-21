const STORAGE_KEY = "geo-finder:theme";

export type Theme = "dark" | "light";

// Liest das aktuelle Theme aus dem DOM (gesetzt durch das Skript in index.html)
export function getCurrentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

// Schaltet das Theme um und speichert die Wahl
export function setTheme(theme: Theme): void {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignorieren
  }
}

// Toggelt zwischen dark/light
export function toggleTheme(): Theme {
  const next: Theme = getCurrentTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}
