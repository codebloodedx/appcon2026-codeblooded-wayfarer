import { useState } from 'react';
import { MapPanel } from '../map';
import type { CountryCode, RuleRecord } from '../guidance/types';
import { StatusBadge } from '../../components/StatusBadge';
import type { TripPlan } from './types';

type Props = {
  trip: TripPlan;
  currentCountry: CountryCode | null;
  locationSource: 'gps' | 'selected' | 'simulated';
  latestRule: RuleRecord | null;
  guidanceError: string | null;
  audioStatus: string;
  onCountryResolved: (country: CountryCode | null, source: 'gps' | 'selected' | 'simulated') => void;
  onPark: () => void;
};
const names: Record<CountryCode, string> = { JP: 'Japan', PH: 'Philippines' };
const demoOrigins = {
  JP: { lat: 35.6812, lng: 139.7671, label: 'Tokyo Station' },
  PH: { lat: 14.5547, lng: 121.0244, label: 'Makati City' },
};

export function TripScreen({ trip, currentCountry, locationSource, latestRule, guidanceError, audioStatus, onCountryResolved, onPark }: Props) {
  const [avoidZones, setAvoidZones] = useState(false);
  const demoOrigin = trip.useSimulatedOrigin ? demoOrigins[trip.destinationCountry] : undefined;
  const showZonePreview = trip.destinationCountry === 'PH';
  return (
    <section className="trip-view" aria-labelledby="trip-heading">
      <div className="trip-heading-row">
        <div>
          <p className="eyebrow">Stationary judging view</p>
          <h1 id="trip-heading">Your route in {names[trip.destinationCountry]}</h1>
          <p className="muted">The map and camera area stay together. Set up the trip while parked.</p>
        </div>
        <button className="button button-dark" type="button" onClick={onPark}>Parked details <span aria-hidden="true">→</span></button>
      </div>
      <div className="trip-status-strip" aria-label="Trip status">
        <div><span className="flag-tile" aria-hidden="true">{currentCountry === 'PH' ? '🇵🇭' : currentCountry === 'JP' ? '🇯🇵' : '🌐'}</span><span><small>Current country</small><strong>{currentCountry ? names[currentCountry] : 'Unsupported location'}</strong></span></div>
        <div><span className="source-icon" aria-hidden="true">⌖</span><span><small>Location source</small><strong>{locationSource === 'simulated' ? `Simulated · ${demoOrigin?.label}` : locationSource === 'gps' ? 'Detected by GPS' : 'Selected fallback · GPS not resolved'}</strong></span></div>
        <StatusBadge tone="warning">{locationSource === 'simulated' ? 'Simulated location' : locationSource === 'gps' ? 'GPS location' : 'Selected fallback'}</StatusBadge>
      </div>
      <div className="judging-grid">
        <article className="panel map-panel" aria-label="Destination route">
          <MapPanel countryCode={trip.destinationCountry} destination={trip.destination} demoOrigin={demoOrigin} avoidRestrictedZones={showZonePreview && avoidZones} onCountryResolved={onCountryResolved} />
        </article>
        <article className="panel camera-panel" aria-labelledby="camera-title">
          <div className="panel-header dark-header"><div><p className="panel-kicker">Camera</p><h2 id="camera-title">Road sign view</h2></div><span className="camera-offline">Not connected</span></div>
          <div className="camera-canvas"><div className="camera-frame" aria-hidden="true"><span /><span /><span /><span /></div><div className="camera-empty"><span className="camera-symbol" aria-hidden="true">▣</span><strong>Live camera unavailable</strong><p>The camera component has not been merged. Sign recognition cannot start from this view yet.</p></div></div>
          <div className="recognition-strip" aria-live="polite"><span className="pulse-dot" aria-hidden="true" /><div><small>Recognition</small><strong>{guidanceError ? 'Service unavailable' : latestRule ? latestRule.label : 'Unknown · no driving advice'}</strong></div><StatusBadge tone={guidanceError ? 'danger' : 'neutral'}>{guidanceError ? 'Error' : latestRule ? 'Reviewed rule' : 'Safe fallback'}</StatusBadge></div>
        </article>
      </div>
      <div className="driving-grid">
        <article className="guidance-card">
          <div className="guidance-icon" aria-hidden="true">{latestRule ? '!' : '?'}</div>
          <div><div className="guidance-title"><p className="panel-kicker">Current guidance</p><StatusBadge>{latestRule ? 'Source reviewed' : 'No sign detected'}</StatusBadge></div><h2>{latestRule ? latestRule.label : 'No verified sign recognized'}</h2><p>{guidanceError ?? latestRule?.shortAlert ?? 'Follow posted signs and local authorities. Unknown and unsupported signs produce no driving advice.'}</p>{latestRule && <a href={latestRule.sourceUrl} target="_blank" rel="noreferrer">View rule source</a>}</div>
          <div className="audio-status" aria-label="Audio status"><span aria-hidden="true">◖))</span><span><small>Audio</small><strong>{audioStatus}</strong></span></div>
        </article>
        {showZonePreview && <article className="restricted-card">
          <div><p className="panel-kicker">Philippines route preview</p><h2>Restricted zone simulation</h2><p>The map can label a simulated avoidance preview. It does not calculate or verify a compliant alternate route.</p></div>
          <label className="switch" aria-label="Show restricted zone simulation"><input type="checkbox" checked={avoidZones} onChange={(event) => setAvoidZones(event.target.checked)} /><span /></label>
          <div className="verification-row"><StatusBadge tone="warning">Simulation only</StatusBadge><StatusBadge tone="warning">No compliant route claim</StatusBadge></div>
        </article>}
      </div>
      <p className="safety-banner"><strong>Before you move:</strong> Set your destination and review details while parked. This MVP does not provide production navigation or safety-critical guidance.</p>
    </section>
  );
}
