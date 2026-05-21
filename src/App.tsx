import { HashRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Start } from "./pages/Start";
import { Spiel } from "./pages/Spiel";
import { Victory } from "./pages/Victory";
import { Highscore } from "./pages/Highscore";
import { Datenschutz } from "./pages/Datenschutz";
import { Impressum } from "./pages/Impressum";

// HashRouter, weil GitHub Pages kein SPA-Routing kennt — der Hash bleibt im Browser
// und wird nicht an den Server geschickt.
export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Start />} />
          <Route path="spiel" element={<Spiel />} />
          <Route path="victory" element={<Victory />} />
          <Route path="highscore" element={<Highscore />} />
          <Route path="datenschutz" element={<Datenschutz />} />
          <Route path="impressum" element={<Impressum />} />
          <Route path="*" element={<Start />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
