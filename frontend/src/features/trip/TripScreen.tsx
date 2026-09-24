import { useEffect, useMemo, useState } from 'react';
import {
  AudioWaveIcon,
  CameraIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  SignsIcon,
} from '../../components/Icons';
import { StatusBadge } from '../../components/StatusBadge';
import { CameraPanel } from '../camera';
import { listRules } from '../guidance';
import type { CountryCode, RecognitionDebug, RuleRecord } from '../guidance/types';
import { MapPanel } from '../map';
import type { TripPlan } from './types';

type Props = {
  trip: TripPlan;
  currentCountry: CountryCode | null;
  locationSource: 'gps' | 'selected' | 'simulated';
  latestRule: RuleRecord | null;
  candidateRule: RuleRecord | null;
  recognitionDebug: RecognitionDebug | null;
  guidanceError: string | null;
  audioStatus: string;
  onCountryResolved: (country: CountryCode | null, source: 'gps' | 'selected' | 'simulated') => void;
  onRecognize: (imageDataUrl: string) => Promise<void>;
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
  candidateRule,
  recognitionDebug,
  guidanceError,
  audioStatus,
  onCountryResolved,
  onRecognize,
  onPark,
}: Props) {
  const [cameraExpanded, setCameraExpanded] = useState(false);
  const [avoidZones, setAvoidZones] = useState(false);
  const [testRules, setTestRules] = useState<RuleRecord[]>([]);

  const demoOrigin = trip.useSimulatedOrigin ? demoOrigins[trip.destinationCountry] : undefined;
  const showZonePreview = trip.destinationCountry === 'PH';
  const detectedRule = latestRule ?? candidateRule;

  useEffect(() => {
    const countryCode = currentCountry ?? trip.destinationCountry;
    let active = true;
    listRules(countryCode)
      .then((records) => {
        if (active) setTestRules(records);
      })
      .catch(() => {
        if (active) setTestRules([]);
      });
    return () => {
      active = false;
    };
  }, [currentCountry, trip.destinationCountry]);

  const cameraTargets = useMemo(() => {
    const specific = testRules.filter((rule) => rule.countrySpecific).slice(0, 5);
    const equivalents = testRules.filter((rule) => !rule.countrySpecific && rule.assetPath.includes('/test/')).slice(0, 6);
    return [...specific, ...equivalents];
  }, [testRules]);

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

      {/* 2. Top Eye-Level Floating HUD Alert Card */}
      <div className="floating-hud-overlay" aria-live="polite">
        {detectedRule ? (
          <div
            className={`hud-sign-card ${latestRule ? 'active' : 'candidate'}`}
            onClick={onPark}
            role="button"
            tabIndex={0}
            title="Tap for parked details and rule source"
          >
            <div className="hud-sign-symbol">
              <img
                src={detectedRule.assetPath || `/signs/${detectedRule.id}.svg`}
                alt={detectedRule.label}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="fallback-sign-text">{detectedRule.label.slice(0, 4)}</span>
            </div>

            <div className="hud-sign-content">
              <div className="hud-badge-row">
                <StatusBadge tone={guidanceError ? 'danger' : latestRule ? 'danger' : 'warning'}>
                  {guidanceError ? 'GUIDANCE NOTICE' : latestRule ? 'ACTION REQUIRED' : 'CANDIDATE SIGN'}
                </StatusBadge>
                <div className="hud-voice-equalizer" title={audioStatus}>
                  <AudioWaveIcon size={16} />
                  <span>{audioStatus.includes('Speaking') ? 'Speaking…' : 'Grounded Voice'}</span>
                </div>
              </div>
              <h2 className="hud-sign-title">{detectedRule.label}</h2>
              <p className="hud-sign-desc">
                {guidanceError ?? latestRule?.shortAlert ?? 'Candidate detected. WayFarer stays silent until live verification passes.'}
              </p>
              <div className="hud-tap-hint">
                <span>Tap for full JAF legal source & manners</span>
                <ExternalLinkIcon size={12} />
              </div>
            </div>
          </div>
        ) : guidanceError ? (
          <div className="hud-idle-pill hud-error-pill" role="alert">
            <span className="hud-radar-dot danger" aria-hidden="true" />
            <span className="hud-idle-text">{guidanceError}</span>
          </div>
        ) : (
          <div className="hud-idle-pill">
            <span className="hud-radar-dot" aria-hidden="true" />
            <span className="hud-idle-text">
              {locationSource === 'simulated' ? 'Demo Mode · ' : ''}
              Monitoring road signs · {trip.destinationCountry === 'JP' ? 'Keep Left / 0 km/h Stop' : 'Standard Traffic Rules'}
            </span>
          </div>
        )}
      </div>

      {/* 3. Restricted Zone Preview (Philippines specific) */}
      {showZonePreview && (
        <div className="floating-zone-toggle">
          <label className="zone-switch-label">
            <input
              type="checkbox"
              checked={avoidZones}
              onChange={(e) => setAvoidZones(e.target.checked)}
            />
            <span>Avoid Restricted Zones (Simulation)</span>
          </label>
        </div>
      )}

      {/* 4. Collapsible Floating Camera PiP Widget */}
      <div className={`floating-camera-pip ${cameraExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="camera-pip-header" onClick={() => setCameraExpanded(!cameraExpanded)}>
          <div className="camera-pip-title">
            <CameraIcon size={16} />
            <span>Live Camera Feed</span>
            <span className="pip-status-dot" aria-hidden="true" />
          </div>
          <button
            type="button"
            className="pip-toggle-btn"
            aria-label={cameraExpanded ? 'Minimize camera feed' : 'Expand camera feed'}
            title={cameraExpanded ? 'Minimize camera feed' : 'Expand camera feed'}
          >
            {cameraExpanded ? <ChevronDownIcon size={18} /> : <ChevronUpIcon size={18} />}
          </button>
        </div>

        {/* Camera content: always mounted so stream & sampler remain active, but visually collapsed */}
        <div className="camera-pip-body">
          <CameraPanel
            active
            parked={false}
            onSample={onRecognize}
            onCapture={() => undefined}
          />

          {/* Semantic recognition trace when expanded */}
          {recognitionDebug && (
            <div className="pip-semantic-trace">
              <div className="trace-item">
                <small>Category</small>
                <strong>{recognitionDebug.normalizedCategory ?? 'UNKNOWN'}</strong>
              </div>
              <div className="trace-item">
                <small>Match</small>
                <strong>{recognitionDebug.matchType}</strong>
              </div>
              <div className="trace-item">
                <small>Confidence</small>
                <strong>{Math.round(recognitionDebug.confidence * 100)}%</strong>
              </div>
              <div className="trace-item">
                <small>Semantic</small>
                <strong>{Math.round(recognitionDebug.semanticSimilarity * 100)}%</strong>
              </div>
            </div>
          )}

          {/* Test fixtures strip */}
          <div className="pip-fixtures-section">
            <div className="fixtures-header">
              <SignsIcon size={14} />
              <small>Hold sign to camera ({names[currentCountry ?? trip.destinationCountry]}):</small>
            </div>
            <div className="pip-fixtures-scroll">
              {cameraTargets.map((rule) => (
                <a
                  key={rule.id}
                  href={rule.assetPath}
                  target="_blank"
                  rel="noreferrer"
                  className="fixture-thumbnail"
                  title={`Open ${rule.label} test fixture`}
                >
                  <img src={rule.assetPath} alt={rule.label} />
                  <span>{rule.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
