import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
import { isDebugActive } from "../lib/debug";
import { hasActiveGame } from "../lib/gameSession";

export function Layout() {
  const debug = isDebugActive();
  const location = useLocation();
  const showResume = location.pathname !== "/spiel" && hasActiveGame();
  const [menuOpen, setMenuOpen] = useState(false);

  // Menue bei Routenwechsel automatisch schliessen
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // ESC schliesst das Menue
  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Body-Scroll sperren wenn Menue offen
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [menuOpen]);

  return (
    <div className="relative flex min-h-full flex-col bg-cream text-ink">
      <header className="sticky top-0 z-20 border-b border-paper-rule bg-cream/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="group flex items-baseline gap-3">
            <span aria-hidden className="block h-2 w-2 rounded-full bg-rust transition-transform group-hover:scale-125" />
            <span className="font-headline text-2xl font-semibold tracking-tight text-ink">
              geo
              <em className="font-medium not-italic text-rust" style={{ fontStyle: "italic" }}>finder</em>
            </span>
          </Link>

          {/* Desktop-Nav (ab sm sichtbar) */}
          <nav className="hidden items-center gap-1 text-sm sm:flex">
            {showResume ? <ResumePill /> : null}
            {debug ? <DebugBadge /> : null}
            <NavItem to="/highscore">Bestenliste</NavItem>
            <ThemeToggle />
          </nav>

          {/* Mobile: Hamburger-Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Menü öffnen"
            className="relative inline-flex h-10 w-10 items-center justify-center text-ink-soft transition-colors hover:text-rust sm:hidden"
          >
            {showResume ? (
              <span
                aria-hidden
                className="absolute right-1.5 top-1.5 block h-2 w-2 rounded-full bg-rust shadow-sm"
              />
            ) : null}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <Outlet />
      </main>

      <footer className="relative z-10 border-t border-paper-rule bg-cream-deep/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs text-ink-muted">
          <span className="small-caps">Privates Schülerprojekt · Nicht kommerziell</span>
          <div className="flex gap-5">
            <Link to="/datenschutz" className="hover:text-rust hover:underline underline-offset-4">
              Datenschutz
            </Link>
            <Link to="/impressum" className="hover:text-rust hover:underline underline-offset-4">
              Impressum
            </Link>
          </div>
        </div>
      </footer>

      {/* Mobile-Off-Canvas-Menue */}
      {menuOpen ? (
        <>
          <button
            type="button"
            aria-label="Menü schließen"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm sm:hidden"
          />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col bg-cream shadow-2xl sm:hidden">
            <div className="flex items-center justify-between border-b border-paper-rule px-5 py-4">
              <span className="small-caps text-[11px] text-rust">Navigation</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Menü schließen"
                className="inline-flex h-9 w-9 items-center justify-center text-ink-soft transition-colors hover:text-rust"
              >
                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden>
                  <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-1 flex-col">
              {showResume ? (
                <Link
                  to="/spiel"
                  className="group flex items-center justify-between border-b border-paper-rule bg-rust/10 px-5 py-4 transition-colors hover:bg-rust/15"
                >
                  <span className="flex items-center gap-3">
                    <span aria-hidden className="block h-2 w-2 rounded-full bg-rust animate-pulse-soft" />
                    <span className="small-caps text-xs text-rust">Reise läuft</span>
                  </span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="text-rust transition-transform group-hover:translate-x-0.5">
                    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                  </svg>
                </Link>
              ) : null}

              <MobileLink to="/" label="Start" />
              <MobileLink to="/highscore" label="Bestenliste" />
              <MobileLink to="/datenschutz" label="Datenschutz" />
              <MobileLink to="/impressum" label="Impressum" />

              <div className="mt-auto border-t border-paper-rule">
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="small-caps text-xs text-ink-soft">Ansicht</span>
                  <ThemeToggle />
                </div>
                {debug ? (
                  <div className="border-t border-paper-rule px-5 py-3">
                    <span className="small-caps text-[10px] text-gold">Debug-Modus aktiv</span>
                  </div>
                ) : null}
              </div>
            </nav>
          </aside>
        </>
      ) : null}
    </div>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative px-3 py-1.5 text-sm font-medium transition-colors ${
          isActive ? "text-rust" : "text-ink-soft hover:text-ink"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="small-caps">{children}</span>
          {isActive ? (
            <span className="absolute inset-x-3 -bottom-0.5 h-px bg-rust" aria-hidden />
          ) : null}
        </>
      )}
    </NavLink>
  );
}

function MobileLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `border-b border-paper-rule px-5 py-4 transition-colors ${
          isActive ? "bg-cream-deep/60 text-rust" : "text-ink hover:bg-cream-deep/40"
        }`
      }
    >
      <span className="small-caps text-sm">{label}</span>
    </NavLink>
  );
}

function ResumePill() {
  return (
    <Link
      to="/spiel"
      className="group mr-2 inline-flex items-center gap-2 bg-rust px-3 py-1.5 text-cream transition-colors hover:bg-rust-deep"
    >
      <span aria-hidden className="block h-1.5 w-1.5 rounded-full bg-cream animate-pulse-soft" />
      <span className="small-caps text-[10px]">Reise läuft</span>
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden className="transition-transform group-hover:translate-x-0.5">
        <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      </svg>
    </Link>
  );
}

function DebugBadge() {
  return (
    <span className="mr-2 rounded-full border border-gold/60 bg-gold-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gold">
      Debug
    </span>
  );
}
