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

export function TripScreen({
  trip,
  currentCountry,
  locationSource,
  latestRule,
  guidanceError,
  audioStatus,
  onCountryResolved,
  onPark,
}: Props) {
  const [cameraExpanded, setCameraExpanded] = useState(false);
  const [avoidZones, setAvoidZones] = useState(false);

  const demoOrigin = trip.useSimulatedOrigin ? demoOrigins[trip.destinationCountry] : undefined;
  const showZonePreview = trip.destinationCountry === 'PH';

  return (
    <div className="trip-viewport-container">
      {/* 1. Full Viewport Google Maps Layer */}
      <div className="trip-map-fullscreen">
        <MapPanel
          countryCode={trip.destinationCountry}
          destination={trip.destination}
          demoOrigin={demoOrigin}
          avoidRestrictedZones={showZonePreview && avoidZones}
          onCountryResolved={onCountryResolved}
        />
      </div>

      {/* 2. Floating Top Eye-Level HUD Sign Alert */}
      <div className="floating-hud-overlay">
        {latestRule ? (
          <div className="hud-sign-card active" onClick={onPark} role="button" tabIndex={0} title="Tap for parked details">
            <div className="hud-sign-symbol">
              <img src={`/signs/${latestRule.id}.svg`} alt={latestRule.label} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
              <span className="fallback-sign-text">{latestRule.label.slice(0, 4)}</span>
            </div>
            <div className="hud-sign-content">
              <div className="hud-sign-header">
                <StatusBadge tone="danger">ACTION REQUIRED</StatusBadge>
                <span className="hud-country-tag">{currentCountry ? names[currentCountry] : ''}</span>
              </div>
              <strong className="hud-sign-title">{latestRule.label}</strong>
              <p className="hud-sign-alert">{latestRule.shortAlert}</p>
            </div>
            <div className="hud-audio-indicator" title={`Audio status: ${audioStatus}`}>
              <span className="soundwave-bar bar1" />
              <span className="soundwave-bar bar2" />
              <span className="soundwave-bar bar3" />
            </div>
          </div>
        ) : (
          <div className="hud-sign-card standby">
            <span className="standby-pulse" />
            <div className="hud-standby-text">
              <strong>Road Sign Monitoring Active</strong>
              <small>Safe fallback · Unknown signs yield no advice</small>
            </div>
            <span className="hud-shield-icon">🛡️</span>
          </div>
        )}

        {/* Location Status Pill */}
        <div className="floating-location-pill">
          <span className="location-flag">{currentCountry === 'PH' ? '🇵🇭' : currentCountry === 'JP' ? '🇯🇵' : '🌐'}</span>
          <span className="location-text">
            {locationSource === 'simulated'
              ? `Simulated · ${demoOrigin?.label}`
              : locationSource === 'gps'
              ? 'GPS Location'
              : 'Selected Fallback (Turn on GPS)'}
          </span>
          <StatusBadge tone={locationSource === 'gps' ? 'success' : 'warning'}>
            {locationSource === 'simulated' ? 'Simulation' : locationSource === 'gps' ? 'Live GPS' : 'Fallback'}
          </StatusBadge>
        </div>
      </div>

      {/* 3. Collapsible Camera PiP / Split-Screen Strip */}
      <div className={`camera-pip-widget ${cameraExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="camera-pip-header" onClick={() => setCameraExpanded(!cameraExpanded)}>
          <div className="pip-status-indicator">
            <span className="pip-live-dot" />
            <strong>Road Sign Camera</strong>
            <small>{guidanceError ? 'Offline' : latestRule ? latestRule.label : 'Standby'}</small>
          </div>
          <button
            type="button"
            className="pip-toggle-btn"
            aria-label={cameraExpanded ? 'Minimize camera' : 'Expand camera'}
          >
            {cameraExpanded ? '▾ Minimize' : '▴ Camera Feed'}
          </button>
        </div>

        <div className="camera-pip-viewport">
          <div className="camera-canvas-mini">
            <div className="camera-frame-reticle" aria-hidden="true">
              <span /><span /><span /><span />
            </div>
            <div className="camera-empty-state">
              <span className="cam-icon" aria-hidden="true">▣</span>
              <strong>Live Camera Feed</strong>
              <p>Samples road signs in front of vehicle</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Philippines Restricted Zone Toggle Floating Drawer (Only if destination is PH) */}
      {showZonePreview && (
        <div className="floating-zone-toggle">
          <div>
            <strong>Avoid Makati Restricted Zone</strong>
            <small>Simulation preview</small>
          </div>
          <label className="switch" aria-label="Avoid restricted zone">
            <input type="checkbox" checked={avoidZones} onChange={(e) => setAvoidZones(e.target.checked)} />
            <span />
          </label>
        </div>
      )}
    </div>
  );
}
