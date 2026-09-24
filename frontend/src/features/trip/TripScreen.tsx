import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { CameraPanel } from '../camera';
import { listDrivingGuidance, useGuidanceAnnouncer } from '../guidance';
import type { CountryCode, DrivingGuidanceRule, GuidanceEvent, RecognitionDebug, RuleRecord } from '../guidance/types';
import { MapPanel, PlaceSearchInput } from '../map';
import type { NavigationStatus, RouteGuidanceEvent } from '../map';
import type { TripPlan } from './types';

type Props = {
  trip: TripPlan;
  currentCountry: CountryCode | null;
  latestRule: RuleRecord | null;
  candidateRule: RuleRecord | null;
  recognitionDebug: RecognitionDebug | null;
  guidanceError: string | null;
  onCountryResolved: (country: CountryCode | null, source: 'gps' | 'selected' | 'simulated') => void;
  onRecognize: (imageDataUrl: string) => Promise<void>;
  onUpdateTrip: (trip: TripPlan) => void;
  onEditTrip: () => void;
  onNavigationStateChange?: (status: NavigationStatus) => void;
};
const names: Record<CountryCode, string> = { JP: 'Japan', PH: 'Philippines' };

export function TripScreen({ trip, currentCountry, latestRule, candidateRule, recognitionDebug, guidanceError, onCountryResolved, onRecognize, onUpdateTrip, onEditTrip, onNavigationStateChange }: Props) {
  const [cameraExpanded, setCameraExpanded] = useState(true);
  const [routeEditorOpen, setRouteEditorOpen] = useState(false);
  const [destinationInput, setDestinationInput] = useState(trip.destination);
  const [destinationCoordinate, setDestinationCoordinate] = useState(trip.destinationCoordinate);
  const [avoidZones, setAvoidZones] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [navigationStatus, setNavigationStatus] = useState<NavigationStatus>('loading');
  const [guidanceRules, setGuidanceRules] = useState<DrivingGuidanceRule[]>([]);
  const [pendingRouteEvent, setPendingRouteEvent] = useState<RouteGuidanceEvent | null>(null);
  const [currentGuidance, setCurrentGuidance] = useState<DrivingGuidanceRule | null>(null);
  const detectedRule = latestRule ?? candidateRule;
  const showZonePreview = trip.destinationCountry === 'PH';
  const guidanceActive = navigationStatus === 'driving';
  const announcerEnabled = guidanceActive || Boolean(detectedRule);
  const { announce, status: announcementStatus } = useGuidanceAnnouncer(announcerEnabled);
  const lastAnnouncedRuleId = useRef<string | null>(null);

  useEffect(() => {
    setDestinationInput(trip.destination);
    setDestinationCoordinate(trip.destinationCoordinate);
  }, [trip.destination, trip.destinationCoordinate]);
  useEffect(() => setAlertDismissed(false), [detectedRule?.id]);
  useEffect(() => {
    const countryCode = currentCountry ?? trip.destinationCountry;
    const locality = trip.destination.split(',').at(-1)?.trim();
    let active = true;
    listDrivingGuidance(countryCode, locality).then((records) => { if (active) setGuidanceRules(records); }).catch(() => { if (active) setGuidanceRules([]); });
    return () => { active = false; };
  }, [currentCountry, trip.destination, trip.destinationCountry]);

  useEffect(() => {
    if (!guidanceActive || !pendingRouteEvent) return;
    const rule = guidanceRules.find((item) => item.event === pendingRouteEvent.event);
    if (!rule) return;
    setCurrentGuidance(rule);
    announce(rule, pendingRouteEvent.id);
    setPendingRouteEvent(null);
  }, [announce, guidanceActive, guidanceRules, pendingRouteEvent]);

  useEffect(() => {
    if (!detectedRule) {
      lastAnnouncedRuleId.current = null;
      return;
    }
    if (detectedRule.id === lastAnnouncedRuleId.current) return;
    lastAnnouncedRuleId.current = detectedRule.id;
    const eventByCategory: Partial<Record<RuleRecord['normalizedCategory'], GuidanceEvent>> = {
      STOP: 'STOP_SIGN', PEDESTRIAN_CROSSING: 'PEDESTRIAN_CROSSING',
    };
    const event = eventByCategory[detectedRule.normalizedCategory] ?? 'ROAD_SIGN_DETECTION';
    const matchingRule = guidanceRules.find((item) => item.event === event && item.triggerMode === 'cv');
    const rule: DrivingGuidanceRule = matchingRule ?? {
      id: `sign-${detectedRule.id}`, countryCode: detectedRule.countryCode, event, priority: 'HIGH',
      title: detectedRule.label, message: detectedRule.shortAlert, sourceUrl: detectedRule.sourceUrl,
      verified: true, triggerMode: 'cv', cooldownSeconds: 15,
    };
    setCurrentGuidance(rule);
    announce(rule, `camera-${detectedRule.id}`);
  }, [announce, detectedRule, guidanceRules]);
  const cameraDetection = useMemo(() => {
    if (!detectedRule || !recognitionDebug?.bbox || (!latestRule && !candidateRule)) return null;
    return {
      bbox: recognitionDebug.bbox,
      label: detectedRule.label,
      confidence: recognitionDebug.confidence,
      status: latestRule ? 'recognized' as const : 'candidate' as const,
    };
  }, [candidateRule, detectedRule, latestRule, recognitionDebug]);
  const externalDrivingEvent = useMemo(() => {
    if (!detectedRule || navigationStatus !== 'driving') return null;
    const event: GuidanceEvent | null = detectedRule.normalizedCategory === 'STOP'
      ? 'STOP_SIGN'
      : detectedRule.normalizedCategory === 'PEDESTRIAN_CROSSING' ? 'PEDESTRIAN_CROSSING' : null;
    if (!event) return null;
    return { id: `camera-motion-${detectedRule.id}`, event };
  }, [detectedRule, navigationStatus]);
  const recognitionStatus = guidanceError
    ? 'error' as const
    : latestRule
      ? 'recognized' as const
      : candidateRule
        ? 'candidate' as const
        : recognitionDebug
          ? 'unknown' as const
          : 'waiting' as const;

  const handleNavigationStatus = useCallback((status: NavigationStatus) => {
    setNavigationStatus(status);
    onNavigationStateChange?.(status);
    if (status === 'preview' || status === 'loading' || status === 'error') {
      setCurrentGuidance(null);
      setPendingRouteEvent(null);
    }
  }, [onNavigationStateChange]);
  const handleRouteGuidance = useCallback((event: RouteGuidanceEvent) => setPendingRouteEvent(event), []);

  function updateDestination(event: FormEvent) {
    event.preventDefault();
    if (!destinationInput.trim()) return;
    onUpdateTrip({ ...trip, destination: destinationInput.trim(), destinationCoordinate });
    setRouteEditorOpen(false);
  }

  return (
    <section className="navigation-cockpit trip-viewport-container" aria-label="WayFarer navigation simulation">
      <div className="trip-map-fullscreen">
        <MapPanel
          countryCode={trip.destinationCountry}
          origin={trip.origin}
          originCoordinate={trip.originCoordinate}
          originSource={trip.originSource}
          destination={trip.destination}
          destinationCoordinate={trip.destinationCoordinate}
          avoidRestrictedZones={showZonePreview && avoidZones}
          onCountryResolved={onCountryResolved}
          onNavigationStatusChange={handleNavigationStatus}
          onGuidanceEvent={handleRouteGuidance}
          externalDrivingEvent={externalDrivingEvent}
        />
      </div>

      <aside className="desktop-driving-sidebar" aria-label="Driving assistant">
        <div className="desktop-cockpit-heading">
          <span className="desktop-cockpit-mark" aria-hidden="true">W</span>
          <span><strong>WayFarer</strong><small>Driving in {names[currentCountry ?? trip.destinationCountry]}</small></span>
        </div>

        <header className="navigation-search-bar gmaps-search-bar">
          <button className="navigation-back" type="button" onClick={() => setRouteEditorOpen((open) => !open)} aria-label="Edit route">⌄</button>
          <button className="navigation-route-summary" type="button" onClick={() => setRouteEditorOpen(true)}>
            <span><small>From</small><strong>{trip.origin}</strong></span>
            <i aria-hidden="true">↓</i>
            <span><small>To</small><strong>{trip.destination}</strong></span>
          </button>
          <button className="navigation-edit" type="button" onClick={() => setRouteEditorOpen((open) => !open)} aria-label="Change destination">✎</button>
          {routeEditorOpen && (
            <form className="route-editor-popover" onSubmit={updateDestination}>
              <div><strong>Change destination</strong><button type="button" onClick={() => setRouteEditorOpen(false)} aria-label="Close route editor">×</button></div>
              <p>WayFarer will pause and calculate from the simulated vehicle’s current position.</p>
              <PlaceSearchInput id="active-destination" label="To" value={destinationInput} countryCode={trip.destinationCountry} placeholder="Enter a new destination" onChange={(value) => { setDestinationInput(value); setDestinationCoordinate(undefined); }} onSelect={(place) => { setDestinationInput(place.label); setDestinationCoordinate(place.coordinate); }} />
              <button className="button button-primary full" type="submit">Update Route <span>→</span></button>
              <button className="route-new-trip" type="button" onClick={onEditTrip}>Change origin or driving country</button>
            </form>
          )}
        </header>

        <section className="desktop-guidance-section" aria-labelledby="current-guidance-label">
          <div className="desktop-section-heading"><span id="current-guidance-label">Current guidance</span><b>{navigationStatus === 'driving' ? 'Live' : navigationStatus}</b></div>
          {(navigationStatus === 'driving' || navigationStatus === 'paused') && currentGuidance ? (
            <aside className={`current-guidance-card priority-${currentGuidance.priority.toLowerCase()}`} aria-live="polite">
              <span className="current-guidance-icon" aria-hidden="true">{currentGuidance.event === 'TRAFFIC_LIGHT' ? '●' : currentGuidance.event === 'RAILROAD_CROSSING' ? '╳' : currentGuidance.event === 'PEDESTRIAN_CROSSING' ? '↟' : currentGuidance.event === 'STOP_SIGN' ? '!' : '↱'}</span>
              <div><small>{currentGuidance.priority} · {currentGuidance.title}</small><strong>{currentGuidance.message}</strong><span>{names[currentGuidance.countryCode]} rule · {currentGuidance.triggerMode === 'simulation' ? 'Simulated route event' : 'Camera detection'} · {announcementStatus}</span></div>
              <a href={currentGuidance.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Source for ${currentGuidance.title}`}>Source</a>
            </aside>
          ) : (
            <div className="navigation-monitor-pill"><span /><strong>{guidanceError ? 'Sign recognition unavailable' : navigationStatus === 'preview' ? 'Guidance starts with Start Driving' : navigationStatus === 'driving' || navigationStatus === 'paused' ? 'Continue on the current road.' : 'Preparing route guidance'}</strong><small>{guidanceError ? 'Map simulation remains available' : 'Verified prompts only · unknown signs stay silent'}</small></div>
          )}
        </section>

        {showZonePreview && <label className="navigation-zone-control"><span><strong>Avoid restricted zone</strong><small>Simulation preview</small></span><input type="checkbox" checked={avoidZones} onChange={(event) => setAvoidZones(event.target.checked)} /></label>}

        <aside className={`camera-pip floating-camera-pip ${cameraExpanded ? 'expanded' : 'collapsed'}`}>
          <button className="camera-pip-toggle camera-pip-header" type="button" onClick={() => setCameraExpanded((expanded) => !expanded)} aria-expanded={cameraExpanded}>
            <span><i /> <strong>Road Sign Camera</strong><small>{guidanceError ? 'Unavailable' : detectedRule?.label ?? 'Tracking ready'}</small></span>
            <b>{cameraExpanded ? '▾ Minimize' : '▴ Expand'}</b>
          </button>
          <div className="camera-pip-body">
            <CameraPanel active parked={false} onSample={onRecognize} onCapture={() => undefined} detection={cameraDetection} recognitionStatus={recognitionStatus} />
            {guidanceError && <p className="camera-service-error" role="alert">Recognition is temporarily unavailable. The camera remains active and will retry.</p>}
          </div>
        </aside>

        {!alertDismissed && detectedRule && (
          <aside className={`navigation-sign-alert ${latestRule ? 'verified' : 'candidate'}`} aria-live="polite">
            <img src={detectedRule.assetPath} alt="" />
            <div>
              <span>Detected sign · {Math.round((recognitionDebug?.confidence ?? 0) * 100)}%</span>
              <strong>{detectedRule.label}</strong>
              <small>{names[detectedRule.countryCode]}{recognitionDebug?.equivalentSign ? ` · Equivalent ${names[recognitionDebug.equivalentSign.countryCode]}: ${recognitionDebug.equivalentSign.meaning}` : ''}</small>
              <p>{detectedRule.shortAlert}</p>
            </div>
            <button type="button" onClick={() => setAlertDismissed(true)} aria-label="Dismiss sign alert">×</button>
          </aside>
        )}
      </aside>
    </section>
  );
}
