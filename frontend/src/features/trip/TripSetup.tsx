import { useState, type FormEvent } from 'react';
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
  const destinationCountryName = countries.find((country) => country.code === trip.destinationCountry)?.name ?? 'destination country';

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trip.destination.trim()) {
      setError(`Enter a city, landmark, or address in ${destinationCountryName}.`);
      return;
    }
    onStart({ ...trip, destination: trip.destination.trim() });
  }

  return (
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
          <p className="muted">We’ll tailor the interface to the destination country.</p>

          <label className="field-label" htmlFor="home-country">Home country</label>
          <div className="select-wrap">
            <span aria-hidden="true">{countries.find((country) => country.code === trip.homeCountry)?.flag}</span>
            <select id="home-country" value={trip.homeCountry} onChange={(event) => setTrip({ ...trip, homeCountry: event.target.value as CountryCode })}>
              {countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
            </select>
          </div>

          <label className="field-label" htmlFor="destination-country">Destination country</label>
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

          <button className="button button-primary full" type="submit">Open trip view <span aria-hidden="true">→</span></button>
          <p className="privacy-note">Location and camera permissions are requested only when their integrated controls are available.</p>
        </form>
      </section>
    </main>
  );
}
