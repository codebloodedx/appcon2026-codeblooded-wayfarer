import { BrandLogo } from '../../components/BrandLogo';
import type { SimulationMode } from './types';

type LandingPageProps = {
  onSelect: (mode: SimulationMode) => void;
};

const modes: Array<{
  id: SimulationMode;
  label: string;
  eyebrow: string;
  description: string;
  icon: string;
}> = [
  {
    id: 'phone',
    label: 'Phone simulation',
    eyebrow: 'Traveler view',
    description: 'Experience the compact interface a traveler would use on the road.',
    icon: '▯',
  },
  {
    id: 'desktop',
    label: 'PC simulation',
    eyebrow: 'Demo view',
    description: 'Use the full dashboard layout for judging, testing, and presentation.',
    icon: '▰',
  },
];

export function LandingPage({ onSelect }: LandingPageProps) {
  return (
    <main className="landing-page">
      <div className="landing-glow landing-glow-one" />
      <div className="landing-glow landing-glow-two" />

      <section className="landing-content" aria-labelledby="landing-title">
        <div className="landing-brand">
          <BrandLogo />
          <span><strong>WayFarer</strong><small>Know the road. Respect the place.</small></span>
        </div>

        <div className="landing-copy">
          <p className="eyebrow">Cross-border driving companion</p>
          <h1 id="landing-title">How would you like to explore WayFarer?</h1>
          <p>Choose an interface simulation. Both options use the same trip briefing, live sign recognition, reviewed local guidance, and Google Maps route experience.</p>
        </div>

        <div className="landing-options" aria-label="Choose an interface simulation">
          {modes.map((mode) => (
            <button className="simulation-choice" type="button" key={mode.id} onClick={() => onSelect(mode.id)}>
              <span className={`simulation-choice-icon ${mode.id}`} aria-hidden="true">{mode.icon}</span>
              <span className="simulation-choice-copy">
                <small>{mode.eyebrow}</small>
                <strong>{mode.label}</strong>
                <span>{mode.description}</span>
              </span>
              <span className="simulation-choice-arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </div>

        <p className="landing-note">Stationary prototype demonstration · Philippines and Japan MVP</p>
      </section>
    </main>
  );
}
