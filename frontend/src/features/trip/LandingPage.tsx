import { BrandLogo } from '../../components/BrandLogo';
import type { ReactElement } from 'react';
import type { SimulationMode } from './types';

const landingCss = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');

.landing-page {
  --lp-blue: #0072e8;
  --lp-blue-deep: #0039a6;
  --lp-ink: #0a2a66;
  --lp-ink-soft: #46628f;
  --lp-sky: #e6f1ff;
  --lp-sky-line: #bcd7fa;
  --lp-white: #ffffff;
  --lp-extrude: 0 8px 0 var(--lp-blue-deep);

  position: relative;
  height: 100dvh;
  display: grid;
  place-items: center;
  padding: clamp(12px, 2.5vh, 32px) clamp(16px, 4vw, 48px);
  overflow: hidden;
  background: var(--lp-blue);
  color: var(--lp-white);
  font-family: 'Nunito', 'Quicksand', system-ui, -apple-system, 'Segoe UI', sans-serif;
}

.landing-route {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.landing-route-line,
.landing-route-pin {
  fill: none;
  stroke: rgba(255, 255, 255, 0.13);
  stroke-width: 46;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.landing-route-line {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: route-draw 1.9s cubic-bezier(0.5, 0, 0.2, 1) 0.15s forwards;
}

.landing-route-pin {
  stroke-width: 24;
  opacity: 0;
  animation: pin-drop 0.5s ease-out 1.8s forwards;
}

@keyframes route-draw {
  to { stroke-dashoffset: 0; }
}

@keyframes pin-drop {
  to { opacity: 1; }
}

/* ---------- Layout ---------- */
.landing-content {
  position: relative;
  z-index: 1;
  width: min(100%, 1040px);
  display: grid;
  gap: clamp(10px, 2.2vh, 24px);
}

/* ---------- Brand ---------- */
.landing-brand {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: -4px;
}

/* The logo sits directly on the blue, no tile around it. */
.landing-brand > :first-child {
  flex: none;
  width: clamp(56px, 9vh, 76px);
  height: clamp(56px, 9vh, 76px);
  object-fit: contain;
}

.landing-brand-text {
  display: grid;
  gap: 8px;
  line-height: 1.1;
}

.landing-brand-text strong {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -0.01em;
  text-shadow: 0 3px 0 var(--lp-blue-deep);
}

.landing-brand-text small {
  font-size: 0.9rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.82);
}

/* ---------- Copy ---------- */
.landing-copy {
  max-width: 34rem;
}

.landing-copy h1 {
  margin: 0;
  font-size: clamp(2rem, min(5vw, 7vh), 3.6rem);
  font-weight: 900;
  line-height: 1.02;
  letter-spacing: -0.025em;
  text-shadow: 0 4px 0 var(--lp-blue-deep);
  text-wrap: balance;
}

.landing-copy p {
  margin: clamp(8px, 1.6vh, 14px) 0 0;
  max-width: 32rem;
  font-size: clamp(0.95rem, 1.5vw, 1.1rem);
  font-weight: 600;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.92);
}

/* ---------- Choices ---------- */
.landing-choose {
  margin: 0 0 -2px;
  font-size: clamp(1.05rem, 2.4vh, 1.3rem);
  font-weight: 800;
  letter-spacing: -0.005em;
}

.landing-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(14px, 2.5vw, 28px);
  padding-bottom: 8px; /* room for the extrusion */
}

.simulation-choice {
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'preview preview'
    'copy go';
  align-items: end;
  gap: clamp(8px, 1.6vh, 14px);
  padding: 12px 12px clamp(12px, 2vh, 18px);
  border-radius: 28px;
  background: var(--lp-white);
  color: var(--lp-ink);
  box-shadow: var(--lp-extrude);
  transition: transform 0.14s ease, box-shadow 0.14s ease;
}

.simulation-choice:hover {
  transform: translateY(-3px);
  box-shadow: 0 11px 0 var(--lp-blue-deep);
}

/* Pressing sinks the card into its own shadow */
.simulation-choice:active {
  transform: translateY(6px);
  box-shadow: 0 2px 0 var(--lp-blue-deep);
}

.simulation-choice:focus-visible {
  outline: 4px solid var(--lp-white);
  outline-offset: 6px;
}

.simulation-choice-preview {
  grid-area: preview;
  display: block;
  border-radius: 18px;
  background: var(--lp-sky);
  overflow: hidden;
}

.simulation-choice-preview svg {
  display: block;
  width: 100%;
  height: clamp(84px, 24vh, 210px);
}

.simulation-choice-copy {
  grid-area: copy;
  display: grid;
  gap: 4px;
  padding-left: 8px;
}

.simulation-choice-copy small {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--lp-blue);
}

.simulation-choice-copy strong {
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: -0.01em;
}

.simulation-choice-copy > span {
  max-width: 24rem;
  font-size: 0.98rem;
  font-weight: 600;
  line-height: 1.45;
  color: var(--lp-ink-soft);
}

.simulation-choice-go {
  grid-area: go;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-right: 6px;
  border-radius: 50%;
  background: var(--lp-blue);
  color: var(--lp-white);
  transition: transform 0.14s ease;
}

.simulation-choice:hover .simulation-choice-go {
  transform: translateX(3px);
}

/* ---------- Illustration parts ---------- */
.il-frame { fill: var(--lp-white); stroke: var(--lp-ink); stroke-width: 3; }
.il-map   { fill: var(--lp-sky-line); }
.il-side  { fill: var(--lp-sky); }
.il-line  { fill: var(--lp-sky-line); }
.il-cta   { fill: var(--lp-blue); }
.il-dot   { fill: var(--lp-sky-line); }
.il-stand { fill: var(--lp-ink); }
.il-route { fill: none; stroke: var(--lp-blue); stroke-width: 5; stroke-linecap: round; }
.il-pin   { fill: var(--lp-white); stroke: var(--lp-blue); stroke-width: 4; }

/* ---------- Footer note ---------- */
.landing-note {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
}

/* ---------- Responsive ---------- */
@media (max-width: 720px) {
  .landing-options {
    grid-template-columns: 1fr;
  }

  /* On small screens, put the preview beside the text to keep both choices above the fold */
  .simulation-choice {
    grid-template-columns: 112px 1fr auto;
    grid-template-areas: 'preview copy go';
    align-items: center;
    gap: 12px;
    padding: 12px 14px 12px 12px;
  }

  .simulation-choice-preview svg { height: auto; }
  .simulation-choice-copy { padding-left: 0; }
  .simulation-choice-copy strong { font-size: 1.2rem; }
  .simulation-choice-copy > span { font-size: 0.9rem; }
  .simulation-choice-go { width: 38px; height: 38px; margin-right: 0; }
}

@media (max-height: 620px) {
  .landing-copy p,
  .landing-note { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .landing-route-line { animation: none; stroke-dashoffset: 0; }
  .landing-route-pin  { animation: none; opacity: 1; }
  .simulation-choice,
  .simulation-choice-go { transition: none; }
}
`;

type LandingPageProps = {
  onSelect: (mode: SimulationMode) => void;
};

const modes: Array<{
  id: SimulationMode;
  label: string;
  eyebrow: string;
  description: string;
}> = [
  {
    id: 'phone',
    label: 'Phone simulation',
    eyebrow: 'Traveler view',
    description: 'The compact interface a traveler uses on the road.',
  },
  {
    id: 'desktop',
    label: 'PC simulation',
    eyebrow: 'Demo view',
    description: 'The full dashboard for judging, testing, and presenting.',
  },
];

function PhonePreview() {
  return (
    <svg viewBox="0 0 320 200" role="img" aria-label="Phone layout preview">
      <rect className="il-frame" x="112" y="8" width="96" height="184" rx="16" />
      <rect className="il-map" x="120" y="22" width="80" height="102" rx="6" />
      <path className="il-route" d="M128 112 C140 60, 158 118, 170 74 S186 44, 192 38" />
      <circle className="il-pin" cx="192" cy="38" r="6" />
      <rect className="il-line" x="122" y="134" width="76" height="8" rx="4" />
      <rect className="il-line" x="122" y="150" width="52" height="8" rx="4" />
      <rect className="il-cta" x="122" y="166" width="76" height="14" rx="7" />
    </svg>
  );
}

function DesktopPreview() {
  return (
    <svg viewBox="0 0 320 200" role="img" aria-label="Desktop layout preview">
      <rect className="il-frame" x="28" y="18" width="264" height="150" rx="12" />
      <rect className="il-side" x="38" y="46" width="64" height="112" rx="6" />
      <rect className="il-line" x="46" y="56" width="48" height="7" rx="3.5" />
      <rect className="il-line" x="46" y="72" width="36" height="7" rx="3.5" />
      <rect className="il-line" x="46" y="88" width="44" height="7" rx="3.5" />
      <rect className="il-cta" x="46" y="136" width="48" height="12" rx="6" />
      <rect className="il-map" x="110" y="46" width="172" height="112" rx="6" />
      <path className="il-route" d="M124 138 C150 70, 176 150, 206 92 S252 60, 264 66" />
      <circle className="il-pin" cx="264" cy="66" r="7" />
      <circle className="il-dot" cx="38" cy="32" r="3" />
      <circle className="il-dot" cx="49" cy="32" r="3" />
      <circle className="il-dot" cx="60" cy="32" r="3" />
      <rect className="il-stand" x="140" y="168" width="40" height="10" rx="3" />
      <rect className="il-stand" x="116" y="178" width="88" height="8" rx="4" />
    </svg>
  );
}

const previews: Record<SimulationMode, () => ReactElement> = {
  phone: PhonePreview,
  desktop: DesktopPreview,
};

export function LandingPage({ onSelect }: LandingPageProps) {
  return (
    <main className="landing-page">
      <style>{landingCss}</style>

      <svg
        className="landing-route"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path
          className="landing-route-line"
          pathLength={1}
          d="M-40 640 C140 800, 250 380, 420 530 S700 840, 870 560 S1120 220, 1290 300"
        />
        <circle className="landing-route-pin" cx="1335" cy="290" r="34" />
      </svg>

      <section className="landing-content" aria-labelledby="landing-title">
        <div className="landing-brand">
          <BrandLogo />
          <span className="landing-brand-text">
            <strong>WayFarer</strong>
            <small>Know the road. Respect the place.</small>
          </span>
        </div>

        <div className="landing-copy">
          <h1 id="landing-title">
            Never a Stranger
            <br />
            on Any Road.
          </h1>
          <p>
            Both views share the same trip briefing, live sign recognition, reviewed local
            guidance, and Google Maps route.
          </p>
        </div>

        <h2 className="landing-choose">Choose how to try WayFarer</h2>

        <div className="landing-options" role="group" aria-label="Choose an interface simulation">
          {modes.map((mode) => {
            const Preview = previews[mode.id];
            return (
              <button
                className={`simulation-choice ${mode.id}`}
                type="button"
                key={mode.id}
                onClick={() => onSelect(mode.id)}
              >
                <span className="simulation-choice-preview" aria-hidden="true">
                  <Preview />
                </span>
                <span className="simulation-choice-copy">
                  <small>{mode.eyebrow}</small>
                  <strong>{mode.label}</strong>
                  <span>{mode.description}</span>
                </span>
                <span className="simulation-choice-go" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <path
                      d="M9 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
            );
          })}
        </div>

        <p className="landing-note">
          Stationary prototype demonstration for the Philippines and Japan.
        </p>
      </section>
    </main>
  );
}
