import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Pfad-Praefix muss zum GitHub-Pages-Pfad passen: /<reponame>/
// Bei Custom-Domain auf "/" aendern.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/geo-finder/",
});
