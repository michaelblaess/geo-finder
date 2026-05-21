import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { initDebugFromUrl, log, setDebugActive } from "./lib/debug";

const debug = initDebugFromUrl();
setDebugActive(debug);

console.log(
  "%c❦ Geo Finder%c — Editorial Travel Guessing\n%cein nicht-kommerzielles Projekt · github.com/michaelblaess/geo-finder",
  "color:#b45309;font-family:Fraunces,Georgia,serif;font-size:18px;font-weight:700;font-style:italic",
  "color:#78716c;font-family:Manrope,sans-serif;font-size:13px",
  "color:#78716c;font-size:11px",
);

if (debug) {
  console.log(
    "%cDEBUG aktiv%c · setze ?debug=0 in der URL um auszuschalten",
    "color:#1c1917;background:#facc15;padding:2px 8px;border-radius:4px;font-weight:700",
    "color:#a16207;font-style:italic",
  );
}

log("App geladen", { debug, time: new Date().toISOString() });

const rootEl = document.getElementById("root");
if (rootEl === null) {
  throw new Error("Element #root nicht gefunden");
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
