import { useState, type FormEvent } from 'react';
import { BrandLogo } from '../../components/BrandLogo';
import type { CountryCode, TripPlan } from './types';

const tripSetupCss = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');

/* Same tokens as the landing page so the two screens read as one product. */
.ts-page {
  --ts-blue: #0072e8;
  --ts-blue-deep: #0039a6;
  --ts-ink: #0a2a66;
  --ts-ink-soft: #46628f;
  --ts-sky: #e6f1ff;
  --ts-sky-line: #bcd7fa;
  --ts-white: #ffffff;
  --ts-error: #c62828;

  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  container-type: inline-size; /* lets the layout react to its own width, e.g. inside the phone frame */
  background: var(--ts-blue);
  color: var(--ts-white);
  font-family: 'Nunito', 'Quicksand', system-ui, -apple-system, 'Segoe UI', sans-serif;
}

/* Never show the app's white page behind us (PC mode) */
html:has(.ts-page),
body:has(.ts-page) {
  background: #0072e8;
}

/* Fills the frame in phone mode, and the whole window in PC mode */
.ts-shell {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 100%;
}

@container (min-width: 901px) {
  .ts-shell { min-height: 100dvh; }
}

/* ---------- Background route ---------- */
.ts-route {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.ts-route-line,
.ts-route-pin {
  fill: none;
  stroke: rgba(255, 255, 255, 0.13);
  stroke-width: 46;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ts-route-line {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: ts-route-draw 1.9s cubic-bezier(0.5, 0, 0.2, 1) 0.15s forwards;
}

.ts-route-pin {
  stroke-width: 24;
  opacity: 0;
  animation: ts-pin-drop 0.5s ease-out 1.8s forwards;
}

@keyframes ts-route-draw { to { stroke-dashoffset: 0; } }
@keyframes ts-pin-drop { to { opacity: 1; } }

/* ---------- Layout ---------- */
.ts-layout {
  position: relative;
  z-index: 1;
  width: min(100%, 1120px);
  box-sizing: border-box;
  margin: auto; /* safe centering: never clips the top when content is tall */
  padding: clamp(16px, 4cqw, 40px);
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 460px);
  gap: clamp(24px, 6cqw, 72px);
  align-items: center;
}

.ts-intro {
  display: grid;
  gap: clamp(16px, 2.5cqw, 30px);
  align-content: center;
}

/* ---------- Brand ---------- */
.ts-brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ts-brand > :first-child {
  flex: none;
  width: clamp(56px, 8cqw, 76px);
  height: clamp(56px, 8cqw, 76px);
  object-fit: contain;
}

.ts-brand-text {
  display: grid;
  gap: 8px;
  line-height: 1.1;
}

.ts-brand-text strong {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -0.01em;
  text-shadow: 0 3px 0 var(--ts-blue-deep);
}

.ts-brand-text small {
  font-size: 0.9rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.82);
}

/* ---------- Intro copy ---------- */
.ts-copy h1 {
  margin: 0;
  font-size: clamp(2.1rem, 7cqw, 4rem);
  font-weight: 900;
  line-height: 1.02;
  letter-spacing: -0.025em;
  text-shadow: 0 4px 0 var(--ts-blue-deep);
}

.ts-copy p {
  margin: 12px 0 0;
  max-width: 30rem;
  font-size: clamp(0.95rem, 2cqw, 1.1rem);
  font-weight: 600;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.92);
}

/* ---------- Journey: home -> destination, follows the selected countries ---------- */
.ts-journey {
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: 32rem;
}

.ts-stop {
  display: grid;
  justify-items: center;
  gap: 2px;
  min-width: 104px;
  padding: 12px 16px;
  border-radius: 20px;
  background: var(--ts-white);
  color: var(--ts-ink);
  box-shadow: 0 5px 0 var(--ts-blue-deep);
}

.ts-stop-flag { font-size: 2rem; line-height: 1.1; }
.ts-stop strong { font-size: 0.95rem; font-weight: 900; }
.ts-stop small { font-size: 0.8rem; font-weight: 700; color: var(--ts-ink-soft); }

.ts-journey-route {
  position: relative;
  flex: 1;
  min-width: 40px;
  height: 36px;
}

.ts-journey-route svg {
  display: block;
  width: 100%;
  height: 100%;
}

.ts-journey-route path {
  fill: none;
  stroke: var(--ts-white);
  stroke-width: 5;
  stroke-linecap: round;
  stroke-dasharray: 0.1 12;
  vector-effect: non-scaling-stroke;
}

/* Ring pin at the destination end, like the logo */
.ts-journey-route::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  width: 18px;
  height: 18px;
  margin-top: -9px;
  box-sizing: border-box;
  border: 4px solid var(--ts-white);
  border-radius: 50%;
  background: var(--ts-blue);
}

.ts-note {
  margin: 0;
  max-width: 32rem;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.8);
}

/* Groups the two country fields; only becomes a 2-column row on phone */
.ts-row { display: contents; }

/* ---------- Form card ---------- */
.ts-card {
  display: grid;
  gap: 14px;
  padding: clamp(18px, 4cqw, 32px);
  margin-bottom: 8px; /* room for the extrusion */
  border-radius: 28px;
  background: var(--ts-white);
  color: var(--ts-ink);
  box-shadow: 0 8px 0 var(--ts-blue-deep);
}

.ts-card h2 {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 900;
  letter-spacing: -0.015em;
}

.ts-muted {
  margin: -6px 0 2px;
  font-size: 0.98rem;
  font-weight: 600;
  color: var(--ts-ink-soft);
}

.ts-field {
  display: grid;
  gap: 6px;
}

.ts-label {
  font-size: 0.92rem;
  font-weight: 800;
}

.ts-control {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 52px;
  padding: 0 14px;
  border: 2px solid var(--ts-sky-line);
  border-radius: 16px;
  background: var(--ts-sky);
  transition: border-color 0.14s ease, box-shadow 0.14s ease, background 0.14s ease;
}

.ts-control:focus-within {
  border-color: var(--ts-blue);
  background: var(--ts-white);
  box-shadow: 0 0 0 4px rgba(0, 114, 232, 0.18);
}

.ts-control.invalid {
  border-color: var(--ts-error);
  background: #fff5f5;
}

.ts-control-icon {
  display: grid;
  place-items: center;
  flex: none;
  font-size: 1.3rem;
  line-height: 1;
  color: var(--ts-blue);
}

.ts-control select,
.ts-control input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--ts-ink);
  font: inherit;
  font-size: 1rem;
  font-weight: 700;
}

.ts-control input::placeholder { color: #7f97bd; font-weight: 600; }

.ts-control select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  padding-right: 24px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230a2a66' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0 center;
  background-size: 16px;
}

.ts-error {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ts-error);
}

.ts-toggle {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border: 2px solid var(--ts-sky-line);
  border-radius: 16px;
  background: var(--ts-sky);
  cursor: pointer;
}

.ts-toggle input {
  flex: none;
  width: 22px;
  height: 22px;
  margin: 1px 0 0;
  accent-color: var(--ts-blue);
  cursor: pointer;
}

.ts-toggle input:focus-visible {
  outline: 3px solid var(--ts-blue);
  outline-offset: 3px;
}

.ts-toggle > span {
  display: grid;
  gap: 2px;
}

.ts-toggle strong { font-size: 0.98rem; font-weight: 900; }
.ts-toggle small { font-size: 0.85rem; font-weight: 700; color: var(--ts-ink-soft); }

.ts-submit {
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 56px;
  margin: 4px 0 5px;
  border-radius: 18px;
  background: var(--ts-blue);
  color: var(--ts-white);
  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 900;
  box-shadow: 0 5px 0 var(--ts-blue-deep);
  transition: transform 0.14s ease, box-shadow 0.14s ease;
}

.ts-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 0 var(--ts-blue-deep);
}

/* Pressing sinks the button into its own shadow */
.ts-submit:active {
  transform: translateY(4px);
  box-shadow: 0 1px 0 var(--ts-blue-deep);
}

.ts-submit:focus-visible {
  outline: 4px solid var(--ts-blue);
  outline-offset: 4px;
}

.ts-privacy {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.45;
  color: var(--ts-ink-soft);
}

/* ---------- Responsive ---------- */
/* Container queries (not viewport media queries), so the phone frame gets the
   stacked layout even when the browser window itself is wide. */
@container (max-width: 900px) {
  .ts-layout { grid-template-columns: minmax(0, 1fr); gap: 24px; }
}

@container (max-width: 480px) {
  .ts-stop { min-width: 88px; padding: 10px 12px; }
}

/* ---------- Phone: blue header + white bottom sheet, all on one screen ---------- */
@container (max-width: 600px) {
  .ts-copy p,
  .ts-journey,
  .ts-note,
  .ts-muted,
  .ts-privacy,
  .ts-brand-text small { display: none; }

  /* Header stays, the sheet takes the rest of the screen */
  .ts-layout {
    width: 100%;
    margin: 0;
    padding: 0;
    gap: 0;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto 1fr;
    align-items: stretch;
  }

  .ts-intro { align-content: start; gap: 18px; padding: 20px 20px 26px; }
  .ts-brand { gap: 10px; }
  .ts-brand > :first-child { width: 44px; height: 44px; }
  .ts-brand-text strong { font-size: 1.25rem; }
  .ts-copy h1 { font-size: clamp(1.9rem, 8.5cqw, 2.4rem); }

  .ts-panel { display: flex; }

  .ts-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin: 0;
    padding: 22px 20px calc(22px + env(safe-area-inset-bottom, 0px));
    border-radius: 28px 28px 0 0;
    box-shadow: 0 -5px 0 var(--ts-blue-deep);
  }

  /* The headline above already says it; keep this heading for screen readers only */
  .ts-card h2 {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  /* Home and destination side by side */
  .ts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .ts-row .ts-control-icon { display: none; }
  .ts-row .ts-control { padding: 0 12px; }

  .ts-field { gap: 6px; }
  .ts-label { font-size: 0.82rem; font-weight: 800; color: var(--ts-ink-soft); }
  .ts-control { height: 52px; border-radius: 16px; }

  /* Switch instead of a checkbox */
  .ts-toggle {
    flex-direction: row-reverse;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 4px 0;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .ts-toggle strong { font-size: 0.95rem; }
  .ts-toggle small { font-size: 0.82rem; }

  .ts-toggle input {
    appearance: none;
    -webkit-appearance: none;
    position: relative;
    width: 50px;
    height: 30px;
    margin: 0;
    border-radius: 999px;
    background: var(--ts-sky-line);
    transition: background 0.18s ease;
  }

  .ts-toggle input::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--ts-white);
    box-shadow: 0 2px 0 rgba(10, 42, 102, 0.25);
    transition: transform 0.18s ease;
  }

  .ts-toggle input:checked { background: var(--ts-blue); }
  .ts-toggle input:checked::after { transform: translateX(20px); }

  /* Primary action pinned to the bottom of the sheet */
  .ts-submit { height: 54px; margin: auto 0 5px; font-size: 1.05rem; }
}

/* ---------- Reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  .ts-route-line { animation: none; stroke-dashoffset: 0; }
  .ts-route-pin  { animation: none; opacity: 1; }
  .ts-submit,
  .ts-toggle input,
  .ts-toggle input::after { transition: none; }
}
`;

type TripSetupProps = {
  initialTrip: TripPlan;
  onStart: (trip: TripPlan) => void;
};

const countries: Array<{ code: CountryCode; name: string; flag: string }> = [
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
];

export function TripSetup({ initialTrip, onStart }: TripSetupProps) {
  const [trip, setTrip] = useState(initialTrip);
  const [error, setError] = useState('');

  const homeCountry = countries.find((country) => country.code === trip.homeCountry);
  const destinationCountry = countries.find((country) => country.code === trip.destinationCountry);
  const destinationCountryName = destinationCountry?.name ?? 'destination country';

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trip.destination.trim()) {
      setError(`Enter a city, landmark, or address in ${destinationCountryName}.`);
      return;
    }
    onStart({ ...trip, destination: trip.destination.trim() });
  }

  return (
    <main className="ts-page">
      <style>{tripSetupCss}</style>

      {/* Same route-into-a-pin motif as the landing page */}
      <svg className="ts-route" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path
          className="ts-route-line"
          pathLength={1}
          d="M-40 640 C140 800, 250 380, 420 530 S700 840, 870 560 S1120 220, 1290 300"
        />
        <circle className="ts-route-pin" cx="1335" cy="290" r="34" />
      </svg>

      <div className="ts-shell">
      <div className="ts-layout">
        <section className="ts-intro" aria-labelledby="setup-title">
          <div className="ts-brand">
            <BrandLogo />
            <span className="ts-brand-text">
              <strong>WayFarer</strong>
              <small>Know the road. Respect the place.</small>
            </span>
          </div>

          <div className="ts-copy">
            <h1 id="setup-title">
              Arrive curious.
              <br />
              Drive informed.
            </h1>
            <p>Set your journey and keep local signs, road manners, and sourced guidance within easy reach.</p>
          </div>

          <div className="ts-journey" aria-label={`Journey from ${homeCountry?.name} to ${destinationCountry?.name}`}>
            <div className="ts-stop">
              <span className="ts-stop-flag" aria-hidden="true">{homeCountry?.flag}</span>
              <strong>Home</strong>
              <small>{homeCountry?.name}</small>
            </div>
            <div className="ts-journey-route" aria-hidden="true">
              <svg viewBox="0 0 200 36" preserveAspectRatio="none">
                <path d="M0 18 C36 -2, 66 38, 100 18 S164 -2, 200 18" />
              </svg>
            </div>
            <div className="ts-stop">
              <span className="ts-stop-flag" aria-hidden="true">{destinationCountry?.flag}</span>
              <strong>Destination</strong>
              <small>{destinationCountry?.name}</small>
            </div>
          </div>

          <p className="ts-note">
            WayFarer supports a stationary MVP demonstration. It is not a replacement for official road signs or local authorities.
          </p>
        </section>

        <section className="ts-panel" aria-label="Plan a trip">
          <form className="ts-card" onSubmit={submit} noValidate>
            <h2>Where are you driving?</h2>
            <p className="ts-muted">We’ll tailor the interface to the destination country.</p>

            <div className="ts-row">
            <div className="ts-field">
              <label className="ts-label" htmlFor="home-country">Home country</label>
              <div className="ts-control">
                <span className="ts-control-icon" aria-hidden="true">{homeCountry?.flag}</span>
                <select
                  id="home-country"
                  value={trip.homeCountry}
                  onChange={(event) => setTrip({ ...trip, homeCountry: event.target.value as CountryCode })}
                >
                  {countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
                </select>
              </div>
            </div>

            <div className="ts-field">
              <label className="ts-label" htmlFor="destination-country">Destination country</label>
              <div className="ts-control">
                <span className="ts-control-icon" aria-hidden="true">{destinationCountry?.flag}</span>
                <select
                  id="destination-country"
                  value={trip.destinationCountry}
                  onChange={(event) => {
                    setTrip({ ...trip, destinationCountry: event.target.value as CountryCode, destination: '' });
                    setError('');
                  }}
                >
                  {countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
                </select>
              </div>
            </div>
            </div>

            <div className="ts-field">
              <label className="ts-label" htmlFor="destination">Destination in {destinationCountryName}</label>
              <div className={`ts-control${error ? ' invalid' : ''}`}>
                <span className="ts-control-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-6-5.2-6-10a6 6 0 1112 0c0 4.8-6 10-6 10z" />
                    <circle cx="12" cy="11" r="2.2" />
                  </svg>
                </span>
                <input
                  id="destination"
                  value={trip.destination}
                  onChange={(event) => {
                    setTrip({ ...trip, destination: event.target.value });
                    setError('');
                  }}
                  placeholder="e.g. Shibuya, Tokyo"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'destination-error' : undefined}
                />
              </div>
              {error && <p className="ts-error" id="destination-error" role="alert">{error}</p>}
            </div>

            <label className="ts-toggle">
              <input
                type="checkbox"
                checked={trip.useSimulatedOrigin}
                onChange={(event) => setTrip({ ...trip, useSimulatedOrigin: event.target.checked })}
              />
              <span>
                <strong>Use {destinationCountryName} judging origin</strong>
                <small>Simulated location: {trip.destinationCountry === 'JP' ? 'Tokyo Station' : 'Makati City'}</small>
              </span>
            </label>

            <button className="ts-submit" type="submit">
              Start trip briefing
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="ts-privacy">Location and camera permissions are requested only when their integrated controls are available.</p>
          </form>
        </section>
      </div>
      </div>
    </main>
  );
}
