export function Datenschutz() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="small-caps text-[11px] text-rust">Klauseln</p>
      <h1 className="mt-3 mb-2 font-headline text-5xl font-semibold tracking-tight text-ink">
        Datenschutz
      </h1>
      <p className="mt-4 max-w-xl font-display text-base leading-relaxed text-ink-soft">
        Diese Anwendung ist ein privates Schülerprojekt und kommt ohne Anmeldung,
        Konto oder Tracking aus.
      </p>

      <div className="mt-12 space-y-10 text-ink">
        <Section
          n="I"
          title="Verantwortlicher"
          body={
            <p>
              Siehe{" "}
              <a href="#/impressum" className="text-rust underline-offset-4 hover:underline">
                Impressum
              </a>
              .
            </p>
          }
        />

        <Section
          n="II"
          title="Welche Daten werden gespeichert?"
          body={
            <>
              <p>
                Im <code className="font-display text-sm text-rust">localStorage</code> deines
                Browsers werden folgende Angaben gespeichert, ausschließlich auf deinem Gerät,
                ohne Übertragung an uns:
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                <li>der von dir eingegebene Nickname (optional)</li>
                <li>deine letzten zehn Highscores</li>
                <li>deine Theme-Wahl (Tag / Nacht)</li>
              </ul>
              <p className="mt-3">
                Du kannst diese Daten jederzeit über die Browser-Funktion „Daten der Website
                löschen" oder über die Schaltfläche „Liste löschen" auf der Bestenliste-Seite entfernen.
              </p>
            </>
          }
        />

        <Section n="III" title="Cookies" body={<p>Es werden keine Cookies gesetzt.</p>} />

        <Section
          n="IV"
          title="Drittanbieter"
          body={
            <>
              <p>
                Beim Aufruf der Seite und im Spielverlauf werden Anfragen an folgende Dienste
                gestellt, wodurch deren Server deine IP-Adresse verarbeiten:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  <strong>GitHub Pages</strong> (GitHub, Inc., 88 Colin P Kelly Jr St,
                  San Francisco, CA 94107, USA) — hostet diese Seite.{" "}
                  <a
                    href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement"
                    className="text-rust underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Datenschutz
                  </a>
                </li>
                <li>
                  <strong>OpenFreeMap</strong> (tiles.openfreemap.org) — liefert die Karten-Tiles
                  basierend auf OpenStreetMap-Daten.{" "}
                  <a
                    href="https://openfreemap.org"
                    className="text-rust underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    openfreemap.org
                  </a>
                </li>
                <li>
                  <strong>Wikimedia Commons</strong> (Wikimedia Foundation, Inc., 1 Montgomery
                  Street Suite 1600, San Francisco, CA 94104, USA) — liefert die Standortbilder
                  als Hotlinks von <code className="font-display text-sm">upload.wikimedia.org</code>.{" "}
                  <a
                    href="https://meta.wikimedia.org/wiki/Privacy_policy"
                    className="text-rust underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Datenschutz
                  </a>
                </li>
                <li>
                  <strong>OpenStreetMap</strong> (Datenquelle der Karten-Tiles, OpenStreetMap
                  Foundation, Cambridge, UK) — wird ggf. als Fallback direkt angefragt.{" "}
                  <a
                    href="https://wiki.osmfoundation.org/wiki/Privacy_Policy"
                    className="text-rust underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Datenschutz
                  </a>
                </li>
              </ul>
            </>
          }
        />

        <Section
          n="V"
          title="Schriften"
          body={
            <p>
              Die verwendeten Schriften (Fraunces, Manrope) werden direkt aus diesem Projekt
              ausgeliefert (selbst gehostet). Es findet keine Verbindung zu Google Fonts statt.
            </p>
          }
        />

        <Section
          n="VI"
          title="Deine Rechte"
          body={
            <p>
              Da wir keine personenbezogenen Daten erheben oder speichern, gibt es keine
              Auskunfts-, Löschungs- oder Berichtigungsanforderung an uns. Wende dich für
              solche Anfragen direkt an die oben genannten Drittanbieter.
            </p>
          }
        />
      </div>
    </article>
  );
}

function Section({ n, title, body }: { n: string; title: string; body: React.ReactNode }) {
  return (
    <section className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
      <span className="font-headline text-3xl italic text-ink-muted">{n}</span>
      <div>
        <h2 className="font-headline text-2xl font-semibold text-ink">{title}</h2>
        <div className="mt-3 space-y-3 font-display text-base leading-relaxed text-ink-soft">
          {body}
        </div>
      </div>
    </section>
  );
}
