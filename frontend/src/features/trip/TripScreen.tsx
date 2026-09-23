import { useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import type { TripPlan } from './types';

type TripScreenProps = { trip: TripPlan; onPark: () => void };

export function TripScreen({ trip, onPark }: TripScreenProps) {
  const [avoidZones, setAvoidZones] = useState(true);

  return (
    <section className="trip-view" aria-labelledby="trip-heading">
      <div className="trip-heading-row">
        <div>
          <p className="eyebrow">Stationary judging view</p>
          <h1 id="trip-heading">Your route in Japan</h1>
          <p className="muted">Map and camera stay together. Keep interactions brief before driving.</p>
        </div>
        <button className="button button-dark" type="button" onClick={onPark}>Parked details <span aria-hidden="true">→</span></button>
      </div>

      <div className="trip-status-strip" aria-label="Trip status">
        <div><span className="flag-tile" aria-hidden="true">🇯🇵</span><span><small>Current country</small><strong>Japan</strong></span></div>
        <div><span className="source-icon" aria-hidden="true">⌖</span><span><small>Location source</small><strong>{trip.useSimulatedOrigin ? 'Simulated · Tokyo Station' : 'GPS · permission required'}</strong></span></div>
        <StatusBadge tone="warning">{trip.useSimulatedOrigin ? 'Simulated location' : 'GPS not started'}</StatusBadge>
      </div>

      <div className="judging-grid">
        <article className="panel map-panel" aria-labelledby="map-title">
          <div className="panel-header overlay-header">
            <div><p className="panel-kicker">Destination map</p><h2 id="map-title">Tokyo Station → {trip.destination}</h2></div>
            <StatusBadge tone="warning">Adapter pending</StatusBadge>
          </div>
          <div className="map-canvas" role="img" aria-label="Map integration unavailable. Route shown is a simulated interface preview.">
            <div className="map-grid" />
            <div className="water-shape one" /><div className="water-shape two" />
            <svg className="route-line" viewBox="0 0 500 300" aria-hidden="true">
              <path d="M88,224 C130,170 164,210 214,153 S310,152 352,96 S410,95 438,62" />
              <circle cx="88" cy="224" r="8" /><circle cx="438" cy="62" r="9" />
            </svg>
            <span className="map-label origin">Tokyo Station<small>Simulated origin</small></span>
            <span className="map-label destination">{trip.destination}<small>Destination</small></span>
            <div className="integration-empty">
              <strong>Map adapter not merged</strong>
              <span>This schematic is an interface preview, not live navigation.</span>
            </div>
          </div>
          <div className="route-summary">
            <div><small>Next turn</small><strong>Route guidance unavailable</strong></div>
            <div><small>ETA</small><strong>—</strong></div>
            <StatusBadge tone="neutral">Not verified</StatusBadge>
          </div>
        </article>

        <article className="panel camera-panel" aria-labelledby="camera-title">
          <div className="panel-header dark-header">
            <div><p className="panel-kicker">Live camera</p><h2 id="camera-title">Road sign view</h2></div>
            <span className="camera-offline"><i /> Not connected</span>
          </div>
          <div className="camera-canvas">
            <div className="camera-frame" aria-hidden="true"><span /><span /><span /><span /></div>
            <div className="camera-empty">
              <span className="camera-symbol" aria-hidden="true">▣</span>
              <strong>Camera component not merged</strong>
              <p>Live permission and sampling controls will appear here through the locked CameraPanel interface.</p>
            </div>
          </div>
          <div className="recognition-strip">
            <span className="pulse-dot" aria-hidden="true" />
            <div><small>Recognition</small><strong>Unknown · no driving advice</strong></div>
            <StatusBadge tone="neutral">Safe fallback</StatusBadge>
          </div>
        </article>
      </div>

      <div className="driving-grid">
        <article className="guidance-card">
          <div className="guidance-icon" aria-hidden="true">?</div>
          <div>
            <div className="guidance-title"><p className="panel-kicker">Current guidance</p><StatusBadge>Unknown sign</StatusBadge></div>
            <h2>No verified sign recognized</h2>
            <p>Continue to follow posted signs and local authorities. RoamRight will not invent advice for an unknown or unsupported sign.</p>
          </div>
          <div className="audio-status" aria-label="Audio status"><span aria-hidden="true">◖))</span><span><small>Audio</small><strong>Not played</strong></span></div>
        </article>

        <article className="restricted-card">
          <div>
            <p className="panel-kicker">Philippines route preference</p>
            <h2>Avoid restricted zones</h2>
            <p>Applied only to Philippine routes when verified zone data is available.</p>
          </div>
          <label className="switch" aria-label="Avoid restricted zones">
            <input type="checkbox" checked={avoidZones} onChange={(event) => setAvoidZones(event.target.checked)} />
            <span />
          </label>
          <div className="verification-row">
            <StatusBadge tone="warning">Zone data simulated</StatusBadge>
            <StatusBadge tone="warning">Alternative route simulated</StatusBadge>
          </div>
        </article>
      </div>

      <p className="safety-banner"><strong>Before you move:</strong> Set your destination and review details while parked. This MVP does not provide production navigation or safety-critical guidance.</p>
    </section>
  );
}
