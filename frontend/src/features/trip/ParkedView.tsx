import { useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import type { InterfaceState, TripPlan } from './types';

type ParkedViewProps = { trip: TripPlan };

const states: Array<{ id: InterfaceState; label: string }> = [
  { id: 'ready', label: 'Integration pending' },
  { id: 'loading', label: 'Loading' },
  { id: 'location-denied', label: 'Location denied' },
  { id: 'camera-denied', label: 'Camera denied' },
  { id: 'unknown', label: 'Unknown sign' },
  { id: 'offline', label: 'Offline / API error' },
  { id: 'map-key', label: 'Missing map key' },
];

const stateContent: Record<InterfaceState, { title: string; copy: string; tone: 'neutral' | 'warning' | 'danger' | 'info'; action?: string }> = {
  ready: { title: 'Waiting for integration modules', copy: 'The UI shell is ready, but map, camera, guidance, and reviewed sign data are not yet present on main.', tone: 'warning' },
  loading: { title: 'Preparing your trip…', copy: 'Map, camera, and source-reviewed guidance are loading. Keep this screen open.', tone: 'info' },
  'location-denied': { title: 'Using selected-country fallback', copy: 'Location permission was denied or unavailable. Guidance uses the visibly selected destination country and does not claim GPS detection.', tone: 'warning' },
  'camera-denied': { title: 'Camera permission was denied', copy: 'Enable camera access in browser site settings, then use the camera component’s retry control.', tone: 'danger', action: 'Review permission steps' },
  unknown: { title: 'Sign not recognized', copy: 'No driving advice or audio is produced for unclear, unsupported, or uncertain signs.', tone: 'neutral' },
  offline: { title: 'Guidance service unavailable', copy: 'Check your connection and try again while parked. Continue to follow posted signs and local authorities.', tone: 'danger', action: 'Try again' },
  'map-key': { title: 'Map could not load', copy: 'The Google Maps key is missing or not authorized for this origin. No live route is being shown.', tone: 'danger', action: 'View technical details' },
};

export function ParkedView({ trip }: ParkedViewProps) {
  const [selectedState, setSelectedState] = useState<InterfaceState>('ready');
  const content = stateContent[selectedState];

  return (
    <section className="parked-view" aria-labelledby="parked-title">
      <div className="page-heading">
        <div><p className="eyebrow">Safe to explore while stationary</p><h1 id="parked-title">Parked details</h1><p>Long-form explanations, sources, etiquette, and manual photo exploration belong here.</p></div>
        <StatusBadge tone="success">Parked mode</StatusBadge>
      </div>

      <div className="parked-grid">
        <article className="detail-card route-detail">
          <p className="panel-kicker">Trip overview</p>
          <h2>Philippines → Japan</h2>
          <dl>
            <div><dt>Destination</dt><dd>{trip.destination}</dd></div>
            <div><dt>Origin source</dt><dd>{trip.useSimulatedOrigin ? 'Tokyo Station · simulated' : 'Browser GPS · permission required'}</dd></div>
            <div><dt>Route status</dt><dd>Not available until map adapter integration</dd></div>
          </dl>
        </article>

        <article className="detail-card etiquette-card">
          <p className="panel-kicker">Local awareness</p>
          <h2>Before driving in Japan</h2>
          <p>Review official requirements and local road etiquette before the trip. Source-reviewed guidance will appear here after the rule set is merged.</p>
          <div className="source-placeholder"><span aria-hidden="true">↗</span><span><strong>No source-linked rule available</strong><small>John’s reviewed records are not on main yet.</small></span></div>
        </article>

        <article className="detail-card photo-card">
          <p className="panel-kicker">Manual photo exploration</p>
          <h2>Inspect a sign while parked</h2>
          <div className="photo-drop" aria-disabled="true"><span aria-hidden="true">＋</span><strong>Capture control unavailable</strong><small>Enabled only through the parked CameraPanel callback.</small></div>
        </article>
      </div>

      <section className="state-lab" aria-labelledby="state-lab-title">
        <div className="state-lab-heading">
          <div><p className="panel-kicker">Interface state preview</p><h2 id="state-lab-title">Verify the important fallbacks</h2></div>
          <StatusBadge tone="info">Parked-only controls</StatusBadge>
        </div>
        <div className="state-tabs" role="tablist" aria-label="Preview interface states">
          {states.map((state) => <button key={state.id} type="button" role="tab" aria-selected={selectedState === state.id} className={selectedState === state.id ? 'active' : ''} onClick={() => setSelectedState(state.id)}>{state.label}</button>)}
        </div>
        <div className={`state-preview ${content.tone}`} role="tabpanel" aria-live="polite">
          <span className="state-symbol" aria-hidden="true">{selectedState === 'loading' ? '⋯' : selectedState === 'unknown' ? '?' : selectedState === 'ready' ? 'i' : '!'}</span>
          <div><StatusBadge tone={content.tone}>{states.find((state) => state.id === selectedState)?.label}</StatusBadge><h3>{content.title}</h3><p>{content.copy}</p>{content.action && <button type="button" className="button button-secondary" disabled>{content.action}</button>}</div>
        </div>
      </section>
    </section>
  );
}
