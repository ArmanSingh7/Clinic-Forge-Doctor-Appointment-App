/**
 * HeroBackground — Reusable animated background for the hero section.
 * Renders floating blobs + pulse rings using pure CSS keyframes (defined in App.css).
 * All elements are absolutely positioned behind content (z-index: 0).
 * Parent section must have  position: relative  and  overflow: hidden.
 */
export default function HeroBackground() {
  return (
    <>
      {/* ── Floating Blobs ── */}

      {/* Top-right large blob */}
      <div
        className="hero-blob hero-blob--tr"
        style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 420,
          height: 420,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 40% 40%, rgba(27,110,181,0.18), rgba(27,110,181,0.04) 70%)',
          filter: 'blur(28px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Bottom-left large blob */}
      <div
        className="hero-blob hero-blob--bl"
        style={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 60% 60%, rgba(61,179,158,0.15), rgba(61,179,158,0.03) 70%)',
          filter: 'blur(34px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Mid accent blob */}
      <div
        className="hero-blob hero-blob--mid"
        style={{
          position: 'absolute',
          top: '35%',
          right: '15%',
          width: 220,
          height: 220,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(232,168,56,0.10), rgba(232,168,56,0.02) 70%)',
          filter: 'blur(20px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* ── Pulse Rings ── */}

      {/* Ring 1 — centred top-right quadrant */}
      <div
        className="hero-pulse-ring hero-pulse-ring--1"
        style={{
          position: 'absolute',
          top: '12%',
          right: '8%',
          width: 180,
          height: 180,
          borderRadius: '50%',
          border: '2px solid rgba(27,110,181,0.20)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Ring 2 — slight offset, slower phase */}
      <div
        className="hero-pulse-ring hero-pulse-ring--2"
        style={{
          position: 'absolute',
          top: '12%',
          right: '8%',
          width: 180,
          height: 180,
          borderRadius: '50%',
          border: '2px solid rgba(27,110,181,0.12)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Ring 3 — bottom-left, teal tone */}
      <div
        className="hero-pulse-ring hero-pulse-ring--3"
        style={{
          position: 'absolute',
          bottom: '18%',
          left: '6%',
          width: 140,
          height: 140,
          borderRadius: '50%',
          border: '2px solid rgba(61,179,158,0.18)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
