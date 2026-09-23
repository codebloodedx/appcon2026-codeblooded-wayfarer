import { useState, useEffect, type FormEvent } from 'react';
import { BrandLogo, wayfarerLogoUrl } from '../../components/BrandLogo';
import type { CountryCode, TripPlan } from './types';

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
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'detected' | 'denied'>('idle');
  const [detectedCountryName, setDetectedCountryName] = useState<string | null>(null);

  const destinationCountryName = countries.find((country) => country.code === trip.destinationCountry)?.name ?? 'destination country';

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          detectLocation();
        } else if (result.state === 'denied') {
          setLocationStatus('denied');
        }
      }).catch(() => {
        // Fallback for browsers that don't support query
      });
    }
  }, []);

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Approximation: Latitude > 25 indicates Japan/East Asia; around 14 is PH
        const inJapan = latitude > 24 && longitude > 122;
        const code: CountryCode = inJapan ? 'JP' : 'PH';
        setDetectedCountryName(inJapan ? 'Japan 🇯🇵' : 'Philippines 🇵🇭');
        setLocationStatus('detected');
        setTrip((prev) => ({
          ...prev,
          destinationCountry: code,
          useSimulatedOrigin: false,
        }));
      },
      () => {
        setLocationStatus('denied');
      },
      { timeout: 8000 }
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trip.destination.trim()) {
      setError(`Enter a city, landmark, or address in ${destinationCountryName}.`);
      return;
    }
    onStart({ ...trip, destination: trip.destination.trim() });
  }

  return (
    <div className="setup-container">
      <main className="setup-page">
        <section className="setup-intro" aria-labelledby="setup-title">
          <a className="brand setup-brand" href="#setup-title">
            <BrandLogo />
            <span><strong>WayFarer</strong><small>Know the road. Respect the place.</small></span>
          </a>
          <div className="setup-copy">
            <div className="setup-title-row">
              <div>
                <p className="eyebrow">Cross-border driving companion</p>
                <h1 id="setup-title">Arrive curious.<br /><span>Drive informed.</span></h1>
                <p>Set your journey and keep local signs, road manners, and sourced guidance within easy reach.</p>
              </div>
              <img className="setup-logo-art" src={wayfarerLogoUrl} alt="WayFarer mountain road logo" />
            </div>
            <div className="journey-visual" aria-label="Journey from the Philippines to Japan">
              <div><span>🇵🇭</span><strong>Home</strong><small>Philippines</small></div>
              <div className="journey-line"><span aria-hidden="true">✦</span></div>
              <div><span>🇯🇵</span><strong>Destination</strong><small>Japan</small></div>
            </div>
            <p className="setup-note">WayFarer supports a stationary MVP demonstration. It is not a replacement for official road signs or local authorities.</p>
          </div>
        </section>

        <section className="setup-panel" aria-label="Plan a trip">
          <form className="setup-card" onSubmit={submit}>
            <div className="step-label"><span>01</span> Plan your trip</div>
            <h2>Where are you driving?</h2>
            <p className="muted">Set your origin and destination country to tailor local traffic guidance.</p>

            {locationStatus !== 'detected' ? (
              <div className="location-prompt-box">
                <div className="location-prompt-info">
                  <span className="location-prompt-icon" aria-hidden="true">📍</span>
                  <div>
                    <strong>Location services</strong>
                    <p>
                      {locationStatus === 'denied'
                        ? 'Location permission denied. You can select manually or use a simulated judging origin.'
                        : 'Turn on location to automatically detect your current country.'}
                    </p>
                  </div>
                </div>
                {locationStatus !== 'denied' && (
                  <button
                    type="button"
                    className="button button-secondary compact"
                    onClick={detectLocation}
                    disabled={locationStatus === 'detecting'}
                  >
                    {locationStatus === 'detecting' ? 'Locating…' : 'Detect current country'}
                  </button>
                )}
              </div>
            ) : (
              <div className="location-detected-box">
                <span className="location-detected-icon" aria-hidden="true">✓</span>
                <div>
                  <small>Detected location</small>
                  <strong>{detectedCountryName}</strong>
                </div>
              </div>
            )}

            <label className="field-label" htmlFor="home-country">Home country (Driver license)</label>
            <div className="select-wrap">
              <span aria-hidden="true">{countries.find((country) => country.code === trip.homeCountry)?.flag}</span>
              <select id="home-country" value={trip.homeCountry} onChange={(event) => setTrip({ ...trip, homeCountry: event.target.value as CountryCode })}>
                {countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
              </select>
            </div>

            <label className="field-label" htmlFor="destination-country">Current / Destination country to drive</label>
            <div className="select-wrap">
              <span aria-hidden="true">{countries.find((country) => country.code === trip.destinationCountry)?.flag}</span>
              <select id="destination-country" value={trip.destinationCountry} onChange={(event) => { setTrip({ ...trip, destinationCountry: event.target.value as CountryCode, destination: '' }); setError(''); }}>
                {countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
              </select>
            </div>

            <label className="field-label" htmlFor="destination">Destination in {destinationCountryName}</label>
            <div className="input-wrap">
              <span aria-hidden="true">⌖</span>
              <input id="destination" value={trip.destination} onChange={(event) => { setTrip({ ...trip, destination: event.target.value }); setError(''); }} placeholder="e.g. Shibuya, Tokyo" aria-describedby={error ? 'destination-error' : undefined} />
            </div>
            {error && <p className="field-error" id="destination-error" role="alert">{error}</p>}

            <label className="toggle-row">
              <input type="checkbox" checked={trip.useSimulatedOrigin} onChange={(event) => setTrip({ ...trip, useSimulatedOrigin: event.target.checked })} />
              <span><strong>Use {destinationCountryName} judging origin</strong><small>Simulated location · {trip.destinationCountry === 'JP' ? 'Tokyo Station' : 'Makati City'}</small></span>
            </label>

            <button className="button button-primary full" type="submit">Start Drive <span aria-hidden="true">→</span></button>
            <p className="privacy-note">Camera and full live navigation will ask for permission when entering the drive view.</p>
          </form>
        </section>
      </main>

      {/* Sakay.ph style informative section */}
      <section className="how-it-works-section" aria-labelledby="how-it-works-title">
        <div className="how-it-works-content">
          <p className="eyebrow text-center">Seamless road adaptation</p>
          <h2 id="how-it-works-title" className="text-center">How WayFarer Works</h2>
          <p className="section-subtitle text-center">Never feel like a stranger on foreign roads. Built specifically for travelers driving abroad.</p>

          <div className="steps-grid">
            <article className="step-card">
              <div className="step-number-badge">01</div>
              <h3>Set Your Route & Country</h3>
              <p>Choose your home country and destination. WayFarer loads the official source-reviewed traffic regulations for your active driving region.</p>
            </article>

            <article className="step-card">
              <div className="step-number-badge">02</div>
              <h3>Drive with Live Guidance</h3>
              <p>Keep your eyes on the road. The dashboard displays an interactive Google Maps route while Gemini vision detects unfamiliar road signs and speaks brief alerts.</p>
            </article>

            <article className="step-card">
              <div className="step-number-badge">03</div>
              <h3>Explore Safely While Parked</h3>
              <p>Pull over to read in-depth local driving etiquette, take photos of unfamiliar road signs for AI explanation, and review official JAF / LTO source references.</p>
            </article>
          </div>

          <div className="features-highlight-strip">
            <div className="feature-pill">
              <span aria-hidden="true">🛡️</span>
              <div>
                <strong>Zero Hallucination</strong>
                <small>Only verified official law records are spoken</small>
              </div>
            </div>
            <div className="feature-pill">
              <span aria-hidden="true">🗺️</span>
              <div>
                <strong>Full-Screen Navigation</strong>
                <small>Integrated Google Maps traffic-aware routes</small>
              </div>
            </div>
            <div className="feature-pill">
              <span aria-hidden="true">🔊</span>
              <div>
                <strong>Gemini Voice Audio</strong>
                <small>Calm, hands-free natural driving alerts</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
