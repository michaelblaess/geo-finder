export function Impressum() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="small-caps text-[11px] text-rust">Kolophon</p>
      <h1 className="mt-3 font-headline text-5xl font-semibold tracking-tight text-ink">
        Impressum
      </h1>
      <p className="mt-4 max-w-xl font-display text-base leading-relaxed text-ink-soft">
        Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz) und § 18 Abs. 2 MStV (Medienstaatsvertrag).
      </p>

      <div className="mt-12 space-y-10 text-ink">
        <Section
          n="I"
          title="Verantwortlich für den Inhalt"
          body={
            <address className="not-italic">
              <span className="block font-headline text-xl text-ink">Stefan Waßmann</span>
              <span className="block">Quellweg 36A</span>
              <span className="block">15345 Rehfelde</span>
              <span className="block">Deutschland</span>
              <span className="mt-3 block">
                <a
                  href="mailto:st.ar.wassmann@gmx.de"
                  className="text-rust underline-offset-4 hover:underline"
                >
                  st.ar.wassmann@gmx.de
                </a>
              </span>
            </address>
          }
        />

        <Section
          n="II"
          title="Hinweis zum Projekt"
          body={
            <p>
              Diese Seite ist ein privates Schülerprojekt und wird nicht kommerziell betrieben.
              Es findet keine Werbung, kein Verkauf und kein Sponsoring statt.
            </p>
          }
        />

        <Section
          n="III"
          title="Haftung für Inhalte"
          body={
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen
              Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir
              jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
              überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
              hinweisen.
            </p>
          }
        />

        <Section
          n="IV"
          title="Haftung für Links"
          body={
            <p>
              Diese Seite enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir
              keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
              Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
              Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          }
        />

        <Section
          n="V"
          title="Bildnachweise"
          body={
            <>
              <p>
                Die im Spiel verwendeten Standortbilder werden von{" "}
                <a
                  href="https://commons.wikimedia.org"
                  className="text-rust underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Wikimedia Commons
                </a>{" "}
                hotgelinkt. Es gelten die jeweiligen Lizenzen der einzelnen Bilder
                (überwiegend CC-BY-SA, Public Domain oder vergleichbar).
              </p>
              <p>
                Die genauen URLs pro Standort sind in der Datei{" "}
                <code className="font-display text-sm text-rust">src/data/locations.json</code> im
                Projekt-Repository dokumentiert. Über die Wikimedia-URL gelangt man jeweils
                zur Originalseite mit Fotograf- und Lizenzangaben.
              </p>
            </>
          }
        />

        <Section
          n="VI"
          title="Schriften"
          body={
            <p>
              Display: <em>Fraunces</em> (Stephen Nixon, OFL).
              <br />
              Body: <em>Manrope</em> (Mikhail Sharanda, OFL).
              <br />
              Beide Schriften werden selbst gehostet ausgeliefert.
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
