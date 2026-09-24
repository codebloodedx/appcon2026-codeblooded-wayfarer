import { useEffect, useState, type FormEvent } from 'react';
import { BrandLogo } from '../../components/BrandLogo';
import { ArrowRightIcon, ShieldCheckIcon, SparklesIcon, TargetIcon } from '../../components/Icons';
import { StatusBadge } from '../../components/StatusBadge';
import type { CountryCode, TripPlan } from './types';

type TripSetupProps = {
  initialTrip: TripPlan;
  onStart: (trip: TripPlan) => void;
};

const countries: Array<{ code: CountryCode; name: string; label: string }> = [
  { code: 'PH', name: 'Philippines', label: 'PH' },
  { code: 'JP', name: 'Japan', label: 'JP' },
];

export function TripSetup({ initialTrip, onStart }: TripSetupProps) {
  const [trip, setTrip] = useState(initialTrip);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  useEffect(() => {
    setTrip(initialTrip);
  }, [initialTrip]);

  const destinationCountryName = countries.find((country) => country.code === trip.destinationCountry)?.name ?? 'destination country';

  function handleDetectLocation() {
    if (!('geolocation' in navigator)) {
      setLocationNotice('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationNotice(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const isJapan = latitude > 24 && longitude > 122;
        const isPhilippines = latitude >= 4 && latitude <= 22 && longitude >= 116 && longitude <= 128;
        const detected: CountryCode = isJapan ? 'JP' : isPhilippines ? 'PH' : 'JP';
        setTrip((prev) => ({
          ...prev,
          destinationCountry: detected,
          destination: detected === 'JP' ? 'Shibuya, Tokyo' : 'Makati City',
          useSimulatedOrigin: false,
        }));
        setLocationNotice(`Auto-detected: ${detected === 'JP' ? 'Japan (JP)' : 'Philippines (PH)'}`);
        setLocating(false);
      },
      (err) => {
        setLocationNotice(
          err.code === 1
            ? 'Location permission was denied in browser.'
            : err.code === 2
            ? 'Device GPS is turned off. Please enable Location in phone settings.'
            : 'Unable to retrieve location. Please select manually.'
        );
        setLocating(false);
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

  function handleQuickDestination(dest: string, country: CountryCode) {
    setTrip((prev) => ({
      ...prev,
      destinationCountry: country,
      destination: dest,
    }));
    setError('');
  }

  return (
    <main className="setup-page">
      <section className="setup-intro" aria-labelledby="setup-title">
        <a className="brand setup-brand" href="#setup-title">
          <BrandLogo />
          <span>
            <strong>WayFarer</strong>
            <small>Know the road. Respect the place.</small>
          </span>
        </a>

        <div className="setup-copy">
          <div className="setup-title-row">
            <div>
              <p className="eyebrow">Cross-Border Driving Companion</p>
              <h1 id="setup-title">
                Arrive curious.<br />
                <span>Drive informed.</span>
              </h1>
              <p>Real-time traffic sign recognition, verified local rules, and audio driving guidance for overseas travelers.</p>
            </div>
          </div>

          <div className="journey-visual" aria-label="Selected route between countries">
            <div className="journey-node">
              <span className="country-chip">{trip.homeCountry}</span>
              <strong>Home</strong>
              <small>{trip.homeCountry === 'PH' ? 'Philippines' : 'Japan'}</small>
            </div>
            <div className="journey-line">
              <span className="journey-icon" aria-hidden="true"><ArrowRightIcon size={18} /></span>
            </div>
            <div className="journey-node">
              <span className="country-chip highlight">{trip.destinationCountry}</span>
              <strong>Destination</strong>
              <small>{destinationCountryName}</small>
            </div>
          </div>

          {trip.useSimulatedOrigin && (
            <div className="demo-mode-banner">
              <StatusBadge tone="warning">Demo Mode Active</StatusBadge>
              <span>Using stationary Tokyo judging route · zero-hallucination JAF sources</span>
            </div>
          )}
        </div>
      </section>

      <section className="setup-panel" aria-label="Plan a trip">
        <form className="setup-card" onSubmit={submit}>
          <div className="setup-card-header">
            <div className="step-label"><span>01</span> Route & Mode Setup</div>
            {trip.useSimulatedOrigin && (
              <span className="demo-pill-indicator">Demo Mode: Tokyo</span>
            )}
          </div>

          <h2>Where are you driving?</h2>
          <p className="muted">The HUD and audio alerts will calibrate to the destination country's traffic laws.</p>

          <div className="form-grid">
            <div className="field-group">
              <label className="field-label" htmlFor="home-country">Origin country (Driver's license)</label>
              <div className="select-wrap">
                <span className="select-badge">{trip.homeCountry}</span>
                <select
                  id="home-country"
                  value={trip.homeCountry}
                  onChange={(event) => setTrip({ ...trip, homeCountry: event.target.value as CountryCode })}
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name} ({country.label})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-group">
              <div className="field-label-row">
                <label className="field-label" htmlFor="destination-country">Current / Destination country to drive</label>
                <button
                  type="button"
                  className="detect-location-btn"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  title="Detect country using device GPS"
                >
                  <TargetIcon size={12} />
                  <span>{locating ? 'Detecting…' : 'Detect My Location'}</span>
                </button>
              </div>
              <div className="select-wrap">
                <span className="select-badge highlight">{trip.destinationCountry}</span>
                <select
                  id="destination-country"
                  value={trip.destinationCountry}
                  onChange={(event) => {
                    const nextCountry = event.target.value as CountryCode;
                    setTrip({
                      ...trip,
                      destinationCountry: nextCountry,
                      destination: nextCountry === 'JP' ? 'Shibuya, Tokyo' : 'Makati City',
                    });
                    setError('');
                  }}
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name} ({country.label})
                    </option>
                  ))}
                </select>
              </div>
              {locationNotice && (
                <p className={`location-status-pill ${locationNotice.startsWith('Auto-detected') ? 'success' : 'muted'}`} role="status">
                  {locationNotice}
                </p>
              )}
            </div>
          </div>

          <div className="field-group">
            <div className="field-label-row">
              <label className="field-label" htmlFor="destination">Destination in {destinationCountryName}</label>
              <div className="quick-presets" aria-label="Quick preset destinations">
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => handleQuickDestination('Shibuya, Tokyo', 'JP')}
                >
                  Shibuya
                </button>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => handleQuickDestination('Ginza, Tokyo', 'JP')}
                >
                  Ginza
                </button>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => handleQuickDestination('Makati City', 'PH')}
                >
                  Makati
                </button>
              </div>
            </div>
            <div className="input-wrap">
              <span className="input-icon" aria-hidden="true"><TargetIcon size={16} /></span>
              <input
                id="destination"
                value={trip.destination}
                onChange={(event) => {
                  setTrip({ ...trip, destination: event.target.value });
                  setError('');
                }}
                placeholder="e.g. Shibuya, Tokyo"
                aria-describedby={error ? 'destination-error' : undefined}
              />
            </div>
            {error && <p className="field-error" id="destination-error" role="alert">{error}</p>}
          </div>

          {/* Dedicated Demo Mode Toggle Switch */}
          <div className="demo-toggle-card">
            <div className="demo-toggle-copy">
              <div className="demo-toggle-title">
                <strong>Stationary Demo Simulation</strong>
                {trip.useSimulatedOrigin && <span className="active-dot" aria-hidden="true" />}
              </div>
              <p>Pre-loads Tokyo Station route with tested road sign candidates for stationary hackathon evaluation.</p>
            </div>
            <label className="switch" aria-label="Toggle Demo Simulation Mode">
              <input
                type="checkbox"
                checked={trip.useSimulatedOrigin}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setTrip((prev) => ({
                    ...prev,
                    useSimulatedOrigin: checked,
                    destination: checked && prev.destinationCountry === 'JP' ? 'Shibuya, Tokyo' : prev.destination,
                  }));
                }}
              />
              <span className="slider round" />
            </label>
          </div>

          <button className="button button-primary full" type="submit">
            Start Trip Briefing <span className="btn-icon" aria-hidden="true"><ArrowRightIcon size={16} /></span>
          </button>
        </form>

        {/* Sakay.ph style informative guide */}
        <section className="setup-guide-strip" aria-label="How WayFarer Works">
          <div className="guide-card">
            <span className="guide-num">01</span>
            <div className="guide-body">
              <strong>Route & Origin</strong>
              <p>Simulate stationary Tokyo routes or drive locally with automatic country detection.</p>
            </div>
          </div>
          <div className="guide-card">
            <span className="guide-num">02</span>
            <div className="guide-body">
              <strong>Pre-Trip Briefing</strong>
              <p>Listen to mandatory source-checked road rules before shifting out of park.</p>
            </div>
          </div>
          <div className="guide-card">
            <span className="guide-num">03</span>
            <div className="guide-body">
              <strong>Live Driving Guidance (HUD)</strong>
              <p>Zero-hallucination sign alerts, Google Maps route lines, and Groq vision camera feed.</p>
            </div>
          </div>
        </section>

        <div className="transparency-badges" aria-label="System verification badges">
          <div className="transparency-badge">
            <ShieldCheckIcon size={16} />
            <span>Zero Hallucination Gate</span>
          </div>
          <div className="transparency-badge">
            <SparklesIcon size={16} />
            <span>Groq Vision & Browser Voice</span>
          </div>
          <div className="transparency-badge">
            <TargetIcon size={16} />
            <span>100dvh Automotive Guidance</span>
          </div>
        </div>
      </section>
    </main>
  );
}
