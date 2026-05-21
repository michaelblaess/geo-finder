type Props = {
  className?: string;
  size?: number;
};

// Editorial Compass-Rose: feine Linien, klassische Atlas-Anmutung.
// Farben uebernehmen die aktuellen Theme-Tokens (currentColor).
export function CompassRose({ className, size = 120 }: Props) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {/* aeusserer Ring */}
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.55" />
      <circle cx="60" cy="60" r="42" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
      <circle cx="60" cy="60" r="28" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.3" />

      {/* Stundenstriche */}
      {Array.from({ length: 32 }).map((_, i) => {
        const angle = (i * 360) / 32;
        const isMajor = i % 8 === 0;
        const isMid = i % 4 === 0 && !isMajor;
        const r1 = 56;
        const r2 = isMajor ? 47 : isMid ? 50 : 53;
        const x1 = 60 + r1 * Math.cos(((angle - 90) * Math.PI) / 180);
        const y1 = 60 + r1 * Math.sin(((angle - 90) * Math.PI) / 180);
        const x2 = 60 + r2 * Math.cos(((angle - 90) * Math.PI) / 180);
        const y2 = 60 + r2 * Math.sin(((angle - 90) * Math.PI) / 180);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={isMajor ? 0.8 : 0.5}
            opacity={isMajor ? 0.7 : 0.4}
          />
        );
      })}

      {/* Hauptstrahlen N-S-O-W */}
      <g fill="currentColor">
        <polygon points="60,12 64,60 60,56 56,60" opacity="0.85" />
        <polygon points="60,108 56,60 60,64 64,60" opacity="0.55" />
        <polygon points="108,60 60,56 64,60 60,64" opacity="0.55" />
        <polygon points="12,60 60,64 56,60 60,56" opacity="0.55" />
      </g>

      {/* diagonale Strahlen */}
      <g fill="currentColor" opacity="0.35">
        <polygon points="93,27 62,58 60,60 58,58" />
        <polygon points="93,93 62,62 60,60 58,62" />
        <polygon points="27,93 58,62 60,60 62,62" />
        <polygon points="27,27 58,58 60,60 62,58" />
      </g>

      {/* zentrale Aussparung */}
      <circle cx="60" cy="60" r="3" fill="var(--color-cream)" stroke="currentColor" strokeWidth="0.6" />

      {/* Buchstaben N E S W */}
      <g fontFamily="var(--font-display)" fontSize="7" fill="currentColor" textAnchor="middle" fontWeight="600" fontStyle="italic">
        <text x="60" y="9">N</text>
        <text x="60" y="116">S</text>
        <text x="114" y="62.5">E</text>
        <text x="6" y="62.5">W</text>
      </g>
    </svg>
  );
}
