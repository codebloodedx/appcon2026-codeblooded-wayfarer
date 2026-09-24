import { useState, type FormEvent } from 'react';
import { BrandLogo, wayfarerLogoUrl } from '../../components/BrandLogo';
import { PlaceSearchInput } from '../map';
import type { CountryCode, TripPlan } from './types';

type TripSetupProps = { initialTrip: TripPlan; onStart: (trip: TripPlan) => void };
const countries: Array<{ code: CountryCode; name: string; flag: string }> = [
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
];
const demoOrigins: Record<CountryCode, { label: string; coordinate: { lat: number; lng: number } }> = {
  JP: { label: 'Tokyo Station', coordinate: { lat: 35.6812, lng: 139.7671 } },
  PH: { label: 'National University Manila', coordinate: { lat: 14.6042, lng: 120.9947 } },
};
const countryBounds: Record<CountryCode, { north: number; south: number; east: number; west: number }> = {
  JP: { north: 46.5, south: 20, east: 154, west: 122 },
  PH: { north: 22.5, south: 4, east: 127, west: 116 },
};

function countryForPoint(point: { lat: number; lng: number }): CountryCode | null {
  return (Object.entries(countryBounds) as Array<[CountryCode, (typeof countryBounds)[CountryCode]]>)
    .find(([, bounds]) => point.lat >= bounds.south && point.lat <= bounds.north && point.lng >= bounds.west && point.lng <= bounds.east)?.[0] ?? null;
}

export function TripSetup({ initialTrip, onStart }: TripSetupProps) {
  const [trip, setTrip] = useState(initialTrip);
  const [error, setError] = useState('');
  const [locationState, setLocationState] = useState<'idle' | 'loading' | 'gps' | 'denied' | 'unsupported'>('idle');
  const destinationCountryName = countries.find((country) => country.code === trip.destinationCountry)?.name ?? 'destination country';

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trip.origin.trim()) return setError('Enter a starting point or use your current location.');
    if (!trip.destination.trim()) return setError(`Enter a destination in ${destinationCountryName}.`);
    setError('');
    onStart({ ...trip, origin: trip.origin.trim(), destination: trip.destination.trim() });
  }

  function setDemoOrigin(enabled: boolean) {
    const demo = demoOrigins[trip.destinationCountry];
    setTrip((current) => enabled
      ? { ...current, useSimulatedOrigin: true, origin: demo.label, originCoordinate: demo.coordinate, originSource: 'simulated' }
      : { ...current, useSimulatedOrigin: false, origin: '', originCoordinate: undefined, originSource: 'selected' });
    setLocationState('idle');
    setError('');
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationState('unsupported');
      setError('This browser cannot access GPS. Enter an origin manually or use the judging origin.');
      return;
    }
    setLocationState('loading');
    setError('');
    navigator.geolocation.getCurrentPosition((position) => {
      const coordinate = { lat: position.coords.latitude, lng: position.coords.longitude };
      const resolved = countryForPoint(coordinate);
      if (!resolved) {
        setLocationState('unsupported');
        setError('Your GPS location is outside the Japan and Philippines prototype coverage. Enter a supported origin manually.');
        return;
      }
      setLocationState('gps');
      setTrip((current) => ({
        ...current,
        destinationCountry: resolved,
        origin: 'Current GPS location',
        originCoordinate: coordinate,
        originSource: 'gps',
        destination: current.destinationCountry === resolved ? current.destination : '',
        destinationCoordinate: undefined,
        useSimulatedOrigin: false,
      }));
    }, () => {
      setLocationState('denied');
      setError('GPS was denied or unavailable. Enter an origin manually or use the clearly labeled judging origin.');
    }, { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 });
  }

  return (
    <main className="setup-page">
      <section className="setup-intro" aria-labelledby="setup-title">
        <a className="brand setup-brand" href="#setup-title"><BrandLogo /><span><strong>WayFarer</strong><small>Know the road. Respect the place.</small></span></a>
        <div className="setup-copy"><div className="setup-title-row"><div><p className="eyebrow">Cross-border driving companion</p><h1 id="setup-title">Arrive curious.<br /><span>Drive informed.</span></h1><p>Search a real route, preview it, then run a stationary navigation simulation with live sign recognition.</p></div><img className="setup-logo-art" src={wayfarerLogoUrl} alt="WayFarer mountain road logo" /></div><div className="journey-visual" aria-label="Journey from the Philippines to Japan"><div><span>🇵🇭</span><strong>Home</strong><small>Philippines</small></div><div className="journey-line"><span aria-hidden="true">✦</span></div><div><span>🇯🇵</span><strong>Destination</strong><small>Japan</small></div></div><p className="setup-note">Navigation movement is simulated along a route returned by Google Maps. It is not safety-critical navigation.</p></div>
      </section>

      <section className="setup-panel" aria-label="Plan a trip">
        <form className="setup-card" onSubmit={submit}>
          <div className="step-label"><span>01</span> Plan your route</div>
          <h2>Where are you driving?</h2><p className="muted">Choose a starting point and destination within one supported country.</p>
          <label className="field-label" htmlFor="home-country">Home country</label>
          <div className="select-wrap"><span aria-hidden="true">{countries.find((country) => country.code === trip.homeCountry)?.flag}</span><select id="home-country" value={trip.homeCountry} onChange={(event) => setTrip({ ...trip, homeCountry: event.target.value as CountryCode })}>{countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}</select></div>
          <label className="field-label" htmlFor="destination-country">Driving country</label>
          <div className="select-wrap"><span aria-hidden="true">{countries.find((country) => country.code === trip.destinationCountry)?.flag}</span><select id="destination-country" value={trip.destinationCountry} onChange={(event) => { const code = event.target.value as CountryCode; const demo = demoOrigins[code]; setTrip({ ...trip, destinationCountry: code, origin: trip.useSimulatedOrigin ? demo.label : '', originCoordinate: trip.useSimulatedOrigin ? demo.coordinate : undefined, originSource: trip.useSimulatedOrigin ? 'simulated' : 'selected', destination: '', destinationCoordinate: undefined }); setError(''); }}>{countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}</select></div>

          <PlaceSearchInput id="origin" label="From" value={trip.origin} countryCode={trip.destinationCountry} placeholder={trip.destinationCountry === 'PH' ? 'National University Manila' : 'Tokyo Station'} disabled={trip.useSimulatedOrigin || locationState === 'gps'} onChange={(origin) => { setTrip({ ...trip, origin, originCoordinate: undefined, originSource: 'selected', useSimulatedOrigin: false }); setLocationState('idle'); setError(''); }} onSelect={(place) => { setTrip({ ...trip, origin: place.label, originCoordinate: place.coordinate, originSource: 'selected', useSimulatedOrigin: false }); setLocationState('idle'); }} />
          <button className="location-button" type="button" onClick={useMyLocation} disabled={locationState === 'loading'}><span aria-hidden="true">◎</span><span><strong>{locationState === 'loading' ? 'Locating…' : locationState === 'gps' ? 'GPS location selected' : 'Use my location'}</strong><small>{locationState === 'gps' ? 'Actual browser position resolved' : 'Requires browser permission'}</small></span></button>
          <PlaceSearchInput id="destination" label="To" value={trip.destination} countryCode={trip.destinationCountry} placeholder={trip.destinationCountry === 'PH' ? 'SM Mall of Asia' : 'Shibuya, Tokyo'} onChange={(destination) => { setTrip({ ...trip, destination, destinationCoordinate: undefined }); setError(''); }} onSelect={(place) => setTrip({ ...trip, destination: place.label, destinationCoordinate: place.coordinate })} />
          {error && <p className="field-error" role="alert">{error}</p>}
          <label className="toggle-row"><input type="checkbox" checked={trip.useSimulatedOrigin} onChange={(event) => setDemoOrigin(event.target.checked)} /><span><strong>Use {destinationCountryName} judging origin</strong><small>Simulated location · {demoOrigins[trip.destinationCountry].label}</small></span></label>
          <button className="button button-primary full" type="submit">Review trip briefing <span aria-hidden="true">→</span></button>
          <p className="privacy-note">Place suggestions fall back to typed-address routing if Places autocomplete is unavailable.</p>
        </form>
      </section>
    </main>
  );
}
