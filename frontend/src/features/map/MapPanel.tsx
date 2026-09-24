import { useCallback, useEffect, useRef, useState } from 'react';
import type { CountryCode } from '../guidance/types';
import type { GuidanceEvent } from '../guidance/types';
import { configureGoogleMaps, importLibrary } from './googleMaps';
import { bearingBetween, cumulativeDistances, pointAtDistance, type RoutePoint } from './navigationMath';
import { advanceSpeed, approachDistanceForSpeed, approachTargetKph, brakingDistanceForSpeed, CITY_CRUISE_KPH, cruiseSpeedForRoute, interpolateBearing, motionStateFor, playbackLabel, type DrivingEventPlan, type SignalPhase, type VehicleMotionState } from './drivingSimulation';

export type NavigationStatus = 'loading' | 'preview' | 'driving' | 'paused' | 'arrived' | 'error';
export type RouteGuidanceEvent = { id: string; event: GuidanceEvent; progress: number; coordinate: RoutePoint; source: 'simulation' };
export type MapPanelProps = {
  countryCode: CountryCode;
  origin: string;
  originCoordinate?: RoutePoint;
  destination: string;
  destinationCoordinate?: RoutePoint;
  originSource: 'gps' | 'selected' | 'simulated';
  avoidRestrictedZones?: boolean;
  onCountryResolved?: (countryCode: CountryCode | null, source: 'gps' | 'selected' | 'simulated') => void;
  onNavigationStatusChange?: (status: NavigationStatus) => void;
  onGuidanceEvent?: (event: RouteGuidanceEvent) => void;
  externalDrivingEvent?: { id: string; event: GuidanceEvent } | null;
};
type RouteSummary = {
  totalDistance: number;
  totalDuration: number;
  remainingDistance: number;
  remainingDuration: number;
  nextInstruction: string;
  nextDistance: number;
  progress: number;
};
type Step = { instruction: string; endDistance: number; isTurn: boolean };

const countryNames: Record<CountryCode, string> = { JP: 'Japan', PH: 'Philippines' };
const countryBounds: Record<CountryCode, { north: number; south: number; east: number; west: number }> = {
  JP: { north: 46.5, south: 20, east: 154, west: 122 },
  PH: { north: 22.5, south: 4, east: 127, west: 116 },
};
const emptySummary: RouteSummary = { totalDistance: 0, totalDuration: 0, remainingDistance: 0, remainingDuration: 0, nextInstruction: 'Follow the highlighted route', nextDistance: 0, progress: 0 };
const simulatedEvents: Record<CountryCode, Array<{ event: GuidanceEvent; progress: number }>> = {
  JP: [{ event: 'INTERSECTION', progress: 0.16 }, { event: 'TRAFFIC_LIGHT', progress: 0.34 }, { event: 'RAILROAD_CROSSING', progress: 0.56 }, { event: 'PEDESTRIAN_CROSSING', progress: 0.76 }],
  PH: [{ event: 'INTERSECTION', progress: 0.18 }, { event: 'TRAFFIC_LIGHT', progress: 0.36 }, { event: 'PEDESTRIAN_CROSSING', progress: 0.55 }, { event: 'RAILROAD_CROSSING', progress: 0.74 }],
};

function countryForPoint(point: RoutePoint): CountryCode | null {
  return (Object.entries(countryBounds) as Array<[CountryCode, (typeof countryBounds)[CountryCode]]>)
    .find(([, bounds]) => point.lat >= bounds.south && point.lat <= bounds.north && point.lng >= bounds.west && point.lng <= bounds.east)?.[0] ?? null;
}
function formatDistance(meters: number) {
  return meters < 1000 ? `${Math.max(0, Math.round(meters / 10) * 10)} m` : `${(meters / 1000).toFixed(1)} km`;
}
function formatDuration(milliseconds: number) {
  const minutes = Math.max(0, Math.ceil(milliseconds / 60_000));
  return minutes >= 60 ? `${Math.floor(minutes / 60)} hr ${minutes % 60} min` : `${minutes} min`;
}
function etaFor(milliseconds: number) {
  return new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date(Date.now() + milliseconds));
}
function cleanInstruction(instruction: string | null) {
  return instruction?.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() || 'Continue on the highlighted route';
}
export function MapPanel({ countryCode, origin, originCoordinate, destination, destinationCoordinate, originSource, avoidRestrictedZones = false, onCountryResolved, onNavigationStatusChange, onGuidanceEvent, externalDrivingEvent = null }: MapPanelProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const vehicleMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const vehicleArrowRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<RoutePoint[]>([]);
  const cumulativeRef = useRef<number[]>([]);
  const stepsRef = useRef<Step[]>([]);
  const currentPointRef = useRef<RoutePoint | null>(null);
  const distanceRef = useRef(0);
  const totalDistanceRef = useRef(0);
  const totalDurationRef = useRef(0);
  const cruiseSpeedRef = useRef(CITY_CRUISE_KPH);
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const lastUiUpdateRef = useRef(0);
  const lastMotionUiUpdateRef = useRef(0);
  const currentSpeedRef = useRef(0);
  const currentBearingRef = useRef(0);
  const simulationClockRef = useRef(0);
  const eventPlansRef = useRef<DrivingEventPlan[]>([]);
  const completedEventsRef = useRef(new Set<string>());
  const announcedEventsRef = useRef(new Set<string>());
  const activeStopRef = useRef<{ id: string; until: number } | null>(null);
  const signalClearAtRef = useRef(0);
  const navigationStatusRef = useRef<NavigationStatus>('loading');
  const routeBoundsRef = useRef<google.maps.LatLngBounds | null>(null);
  const routeInstanceRef = useRef(0);
  const statusCallbackRef = useRef(onNavigationStatusChange);
  const guidanceCallbackRef = useRef(onGuidanceEvent);
  const [status, setStatus] = useState<NavigationStatus>('loading');
  const [message, setMessage] = useState('Preparing Google Maps…');
  const [summary, setSummary] = useState<RouteSummary>(emptySummary);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [vehicleSpeed, setVehicleSpeed] = useState(0);
  const [motionState, setMotionState] = useState<VehicleMotionState>('STOPPED');
  const [signalPhase, setSignalPhase] = useState<SignalPhase>(null);

  useEffect(() => { statusCallbackRef.current = onNavigationStatusChange; }, [onNavigationStatusChange]);
  useEffect(() => { guidanceCallbackRef.current = onGuidanceEvent; }, [onGuidanceEvent]);

  const setNavigationStatus = useCallback((value: NavigationStatus) => {
    navigationStatusRef.current = value;
    setStatus(value);
    statusCallbackRef.current?.(value);
  }, []);

  const stopAnimation = useCallback(() => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    lastFrameRef.current = 0;
  }, []);

  const resetMotion = useCallback(() => {
    currentSpeedRef.current = 0;
    currentBearingRef.current = 0;
    simulationClockRef.current = 0;
    completedEventsRef.current.clear();
    announcedEventsRef.current.clear();
    activeStopRef.current = null;
    signalClearAtRef.current = 0;
    setVehicleSpeed(0);
    setMotionState('STOPPED');
    setSignalPhase(null);
  }, []);

  const updateProgress = useCallback((travelled: number, force = false) => {
    const path = pathRef.current;
    const cumulative = cumulativeRef.current;
    const totalDistance = totalDistanceRef.current;
    const totalDuration = totalDurationRef.current;
    if (!path.length || !totalDistance) return;
    const clamped = Math.min(totalDistance, Math.max(0, travelled));
    const { point, index } = pointAtDistance(path, cumulative, clamped);
    const nextPoint = path[Math.min(index + 1, path.length - 1)];
    const targetBearing = bearingBetween(point, nextPoint);
    const bearing = interpolateBearing(currentBearingRef.current, targetBearing, force ? 1 : 0.18);
    currentBearingRef.current = bearing;
    currentPointRef.current = point;
    distanceRef.current = clamped;
    if (vehicleMarkerRef.current) vehicleMarkerRef.current.position = point;
    if (vehicleArrowRef.current) vehicleArrowRef.current.style.transform = `rotate(${bearing}deg)`;
    const now = performance.now();
    if (mapRef.current && (force || now - lastUiUpdateRef.current > 110)) {
      mapRef.current.panTo(point);
      mapRef.current.setZoom(17);
      const progress = totalDistance ? clamped / totalDistance : 0;
      const remainingDistance = Math.max(0, totalDistance - clamped);
      const remainingDuration = Math.max(0, totalDuration * (1 - progress));
      const step = stepsRef.current.find((item) => item.endDistance > clamped) ?? stepsRef.current.at(-1);
      setSummary((current) => ({
        ...current,
        progress,
        remainingDistance,
        remainingDuration,
        nextInstruction: step?.instruction || 'Continue to the destination',
        nextDistance: Math.max(0, (step?.endDistance ?? totalDistance) - clamped),
      }));
      lastUiUpdateRef.current = now;
    }
  }, []);

  const runAnimation = useCallback((timestamp: number) => {
    if (navigationStatusRef.current !== 'driving') return;
    if (!lastFrameRef.current) lastFrameRef.current = timestamp;
    const elapsed = Math.min(100, timestamp - lastFrameRef.current);
    lastFrameRef.current = timestamp;
    const simulationElapsed = elapsed * playbackSpeed;
    simulationClockRef.current += simulationElapsed;
    if (signalClearAtRef.current && simulationClockRef.current >= signalClearAtRef.current) {
      signalClearAtRef.current = 0;
      setSignalPhase(null);
    }
    const totalDistance = totalDistanceRef.current;
    const travelled = distanceRef.current;
    const pendingEvent = eventPlansRef.current
      .filter((event) => !completedEventsRef.current.has(event.id) && event.distance >= travelled - 1)
      .sort((a, b) => a.distance - b.distance)[0];
    const distanceToEvent = pendingEvent ? pendingEvent.distance - travelled : Number.POSITIVE_INFINITY;
    if (pendingEvent && distanceToEvent <= pendingEvent.prepareDistance && !announcedEventsRef.current.has(pendingEvent.id)) {
      announcedEventsRef.current.add(pendingEvent.id);
      const { point } = pointAtDistance(pathRef.current, cumulativeRef.current, travelled);
      guidanceCallbackRef.current?.({ id: `route-${routeInstanceRef.current}-${pendingEvent.id}`, event: pendingEvent.event, progress: totalDistance ? travelled / totalDistance : 0, coordinate: point, source: 'simulation' });
    }

    let targetSpeed = cruiseSpeedRef.current;
    let turning = false;
    const turnDistance = stepsRef.current.find((step) => step.isTurn && step.endDistance >= travelled)?.endDistance;
    if (turnDistance !== undefined && turnDistance - travelled <= 65) {
      targetSpeed = Math.min(targetSpeed, 18);
      turning = turnDistance - travelled <= 30;
    }
    if (pendingEvent && distanceToEvent <= pendingEvent.brakingDistance) {
      targetSpeed = Math.min(targetSpeed, approachTargetKph(Math.max(0, distanceToEvent), pendingEvent.brakingDistance, cruiseSpeedRef.current, pendingEvent.targetSpeedKph));
    }

    if (activeStopRef.current) {
      targetSpeed = 0;
      if (simulationClockRef.current >= activeStopRef.current.until) {
        const stoppedId = activeStopRef.current.id;
        completedEventsRef.current.add(stoppedId);
        activeStopRef.current = null;
        const wasTrafficLight = stoppedId.includes('TRAFFIC_LIGHT');
        setSignalPhase(wasTrafficLight ? 'GREEN' : null);
        signalClearAtRef.current = wasTrafficLight ? simulationClockRef.current + 3_000 : 0;
        targetSpeed = cruiseSpeedRef.current;
      }
    }

    currentSpeedRef.current = advanceSpeed(currentSpeedRef.current, targetSpeed, simulationElapsed);
    if (pendingEvent?.stopDurationMs && distanceToEvent <= 1.5 && currentSpeedRef.current < 1 && !activeStopRef.current) {
      currentSpeedRef.current = 0;
      activeStopRef.current = { id: pendingEvent.id, until: simulationClockRef.current + pendingEvent.stopDurationMs };
      setSignalPhase(pendingEvent.event === 'TRAFFIC_LIGHT' ? 'RED' : null);
    } else if (pendingEvent?.event === 'TRAFFIC_LIGHT' && distanceToEvent <= pendingEvent.prepareDistance && !completedEventsRef.current.has(pendingEvent.id)) {
      setSignalPhase('RED');
    }

    const motion = motionStateFor(currentSpeedRef.current, targetSpeed, turning);
    const proposedDistance = travelled + (currentSpeedRef.current / 3.6) * (simulationElapsed / 1000);
    const nextDistance = activeStopRef.current
      ? Math.min(travelled, pendingEvent?.distance ?? travelled)
      : pendingEvent?.stopDurationMs && proposedDistance >= pendingEvent.distance
        ? pendingEvent.distance
        : Math.min(totalDistance, proposedDistance);
    updateProgress(nextDistance);
    if (timestamp - lastMotionUiUpdateRef.current > 100) {
      setVehicleSpeed(currentSpeedRef.current);
      setMotionState(motion);
      lastMotionUiUpdateRef.current = timestamp;
    }
    if (nextDistance >= totalDistance) {
      updateProgress(totalDistance, true);
      setNavigationStatus('arrived');
      stopAnimation();
      return;
    }
    animationRef.current = requestAnimationFrame(runAnimation);
  }, [playbackSpeed, setNavigationStatus, stopAnimation, updateProgress]);

  useEffect(() => {
    if (status === 'driving') animationRef.current = requestAnimationFrame(runAnimation);
    return stopAnimation;
  }, [runAnimation, status, stopAnimation]);

  useEffect(() => () => {
    stopAnimation();
    polylineRef.current?.setMap(null);
    markersRef.current.forEach((marker) => { marker.map = null; });
    if (vehicleMarkerRef.current) vehicleMarkerRef.current.map = null;
    polylineRef.current = null;
    markersRef.current = [];
    vehicleMarkerRef.current = null;
    mapRef.current = null;
  }, [stopAnimation]);

  useEffect(() => {
    let cancelled = false;
    async function calculateRoute() {
      const previousStatus = navigationStatusRef.current;
      const reroutePoint = currentPointRef.current;
      stopAnimation();
      routeInstanceRef.current += 1;
      resetMotion();
      setNavigationStatus('loading');
      setMessage('Calculating a real driving route…');
      if (!origin.trim() || !destination.trim()) {
        setMessage('Choose both a starting point and destination.');
        setNavigationStatus('error');
        return;
      }
      if (!configureGoogleMaps()) {
        setMessage('Maps API unavailable. Add a restricted Google Maps browser key.');
        setNavigationStatus('error');
        return;
      }
      try {
        const [{ Map }, { Route }, { AdvancedMarkerElement }] = await Promise.all([
          importLibrary('maps'), importLibrary('routes'), importLibrary('marker'),
        ]);
        if (cancelled || !mapElement.current) return;
        mapRef.current ??= new Map(mapElement.current, { center: originCoordinate || { lat: countryCode === 'JP' ? 35.6812 : 14.6042, lng: countryCode === 'JP' ? 139.7671 : 120.9947 }, zoom: 13, mapId: 'DEMO_MAP_ID', disableDefaultUI: true, zoomControl: true, gestureHandling: 'greedy' });
        const rerouteOrigin = reroutePoint && ['driving', 'paused'].includes(previousStatus)
          ? reroutePoint
          : originCoordinate || `${origin}, ${countryNames[countryCode]}`;
        const result = await Route.computeRoutes({
          origin: rerouteOrigin,
          destination: destinationCoordinate || `${destination}, ${countryNames[countryCode]}`,
          travelMode: 'DRIVING',
          routingPreference: 'TRAFFIC_AWARE',
          region: countryCode.toLowerCase(),
          polylineQuality: 'HIGH_QUALITY',
          fields: ['path', 'viewport', 'durationMillis', 'staticDurationMillis', 'distanceMeters', 'legs'],
        });
        const route = result.routes?.[0];
        const routePath = route?.path?.map((point) => ({ lat: point.lat, lng: point.lng })) ?? [];
        if (!route || routePath.length < 2) throw new Error('No drivable route was returned.');
        const end = routePath.at(-1)!;
        if (countryForPoint(end) !== countryCode) throw new Error(`Choose a destination within ${countryNames[countryCode]}.`);
        if (cancelled) return;

        polylineRef.current?.setMap(null);
        markersRef.current.forEach((marker) => { marker.map = null; });
        vehicleMarkerRef.current && (vehicleMarkerRef.current.map = null);
        pathRef.current = routePath;
        cumulativeRef.current = cumulativeDistances(routePath);
        const pathDistance = cumulativeRef.current.at(-1) ?? route.distanceMeters ?? 0;
        const totalDistance = pathDistance || route.distanceMeters || 0;
        const totalDuration = route.durationMillis || route.staticDurationMillis || 0;
        totalDistanceRef.current = totalDistance;
        totalDurationRef.current = totalDuration;
        const averageRouteKph = totalDuration > 0 ? totalDistance / (totalDuration / 3_600_000) / 1000 : CITY_CRUISE_KPH;
        cruiseSpeedRef.current = cruiseSpeedForRoute(averageRouteKph);
        let stepDistance = 0;
        stepsRef.current = (route.legs?.flatMap((leg) => leg.steps) ?? []).map((step) => {
          stepDistance += step.distanceMeters;
          const instruction = cleanInstruction(step.instructions);
          return { instruction, endDistance: Math.min(totalDistance, stepDistance), isTurn: /turn|merge|roundabout|ramp|fork|u-turn/i.test(instruction) };
        });
        if (!stepsRef.current.length) stepsRef.current = [{ instruction: 'Follow the highlighted route', endDistance: totalDistance, isTurn: false }];
        eventPlansRef.current = simulatedEvents[countryCode].map((item, index) => {
          const stopDuration = item.event === 'TRAFFIC_LIGHT' ? 5_000 : item.event === 'RAILROAD_CROSSING' ? 3_000 : item.event === 'PEDESTRIAN_CROSSING' ? 3_000 : 0;
          const targetSpeed = stopDuration ? 0 : item.event === 'INTERSECTION' ? 15 : 20;
          return {
            id: `${item.event}-${index}`,
            event: item.event,
            distance: totalDistance * item.progress,
            prepareDistance: approachDistanceForSpeed(cruiseSpeedRef.current),
            brakingDistance: brakingDistanceForSpeed(cruiseSpeedRef.current),
            targetSpeedKph: targetSpeed,
            stopDurationMs: stopDuration,
            label: item.event === 'TRAFFIC_LIGHT' ? 'Simulated red light' : item.event === 'RAILROAD_CROSSING' ? 'Simulated railroad crossing' : item.event === 'PEDESTRIAN_CROSSING' ? 'Simulated pedestrian crossing' : 'Simulated intersection',
          };
        });
        polylineRef.current = new google.maps.Polyline({ map: mapRef.current, path: routePath, strokeColor: '#0868ff', strokeOpacity: 0.94, strokeWeight: 7 });
        const [startMarker, endMarker] = [routePath[0], end].map((position, index) => new AdvancedMarkerElement({ map: mapRef.current!, position, title: index === 0 ? 'Route origin' : 'Destination' }));
        markersRef.current = [startMarker, endMarker];
        const markerShell = document.createElement('div');
        markerShell.className = 'wayfarer-vehicle-marker';
        const arrow = document.createElement('div');
        arrow.className = 'wayfarer-vehicle-arrow';
        arrow.textContent = '▲';
        markerShell.appendChild(arrow);
        vehicleArrowRef.current = arrow;
        vehicleMarkerRef.current = new AdvancedMarkerElement({ map: mapRef.current, position: routePath[0], title: 'Simulated vehicle', content: markerShell });
        routeBoundsRef.current = route.viewport || null;
        if (route.viewport) mapRef.current.fitBounds(route.viewport, 54);
        currentPointRef.current = routePath[0];
        distanceRef.current = 0;
        const firstStep = stepsRef.current[0];
        setSummary({ totalDistance, totalDuration, remainingDistance: totalDistance, remainingDuration: totalDuration, nextInstruction: firstStep.instruction, nextDistance: firstStep.endDistance, progress: 0 });
        setMessage('Route supplied by Google Maps · navigation movement is simulated.');
        setNavigationStatus('preview');
        onCountryResolved?.(countryCode, originSource);
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? `Route unavailable: ${error.message}` : 'Route request failed.');
          setNavigationStatus('error');
        }
      }
    }
    void calculateRoute();
    return () => { cancelled = true; };
  }, [countryCode, destination, destinationCoordinate, onCountryResolved, origin, originCoordinate, originSource, resetMotion, setNavigationStatus, stopAnimation]);

  useEffect(() => {
    if (!externalDrivingEvent || navigationStatusRef.current !== 'driving') return;
    if (eventPlansRef.current.some((item) => item.id === externalDrivingEvent.id)) return;
    const stopRequired = externalDrivingEvent.event === 'STOP_SIGN';
    announcedEventsRef.current.add(externalDrivingEvent.id);
    eventPlansRef.current.push({
      id: externalDrivingEvent.id,
      event: externalDrivingEvent.event,
      distance: Math.min(totalDistanceRef.current - 2, distanceRef.current + (stopRequired ? 65 : 45)),
      prepareDistance: approachDistanceForSpeed(currentSpeedRef.current || cruiseSpeedRef.current),
      brakingDistance: brakingDistanceForSpeed(currentSpeedRef.current || cruiseSpeedRef.current),
      targetSpeedKph: stopRequired ? 0 : 15,
      stopDurationMs: stopRequired ? 2_500 : 0,
      label: stopRequired ? 'Camera detected stop sign' : 'Camera detected road sign',
    });
  }, [externalDrivingEvent]);

  function startDriving() {
    if (!pathRef.current.length) return;
    const beginning = status === 'preview' || status === 'arrived' || distanceRef.current >= summary.totalDistance;
    if (status === 'arrived' || distanceRef.current >= summary.totalDistance) updateProgress(0, true);
    if (beginning) {
      resetMotion();
      announcedEventsRef.current.add('TRIP_START');
      guidanceCallbackRef.current?.({ id: `route-${routeInstanceRef.current}-TRIP_START`, event: 'TRIP_START', progress: 0, coordinate: pathRef.current[0], source: 'simulation' });
    }
    setNavigationStatus('driving');
  }
  function pause() { stopAnimation(); setMotionState('STOPPED'); setNavigationStatus('paused'); }
  function stop() {
    stopAnimation();
    resetMotion();
    updateProgress(0, true);
    if (routeBoundsRef.current) mapRef.current?.fitBounds(routeBoundsRef.current, 54);
    setNavigationStatus('preview');
  }

  const driving = status === 'driving' || status === 'paused';
  return (
    <section className={`navigation-map navigation-${status}`} aria-label="WayFarer navigation map">
      <div ref={mapElement} className="navigation-map-canvas" />
      <div className="map-attribution-status" role="status"><span className={status === 'error' ? 'error-dot' : 'route-dot'} />{message}</div>
      {avoidRestrictedZones && <p className="navigation-simulation-note"><strong>Simulation:</strong> restricted-zone avoidance is not a legal-compliance claim.</p>}

      {status === 'loading' && <div className="route-loading-card"><span className="route-spinner" /><strong>Calculating route</strong><small>Using Google Maps road geometry</small></div>}
      {status === 'error' && <div className="route-error-card"><strong>Route unavailable</strong><p>{message}</p></div>}
      {status === 'preview' && summary.totalDistance > 0 && (
        <div className="route-preview-card">
          <div><small>Route preview</small><strong>{formatDuration(summary.totalDuration)} · {formatDistance(summary.totalDistance)}</strong><span>{summary.nextInstruction}</span></div>
          <button type="button" onClick={startDriving}>Start Driving <span aria-hidden="true">➜</span></button>
        </div>
      )}
      {driving && (
        <>
          <div className="navigation-maneuver"><span className="maneuver-arrow" aria-hidden="true">↱</span><div><small>Next maneuver</small><strong>{summary.nextInstruction}</strong><span>{formatDistance(summary.nextDistance)}</span></div>{signalPhase && <b className={`simulated-signal ${signalPhase.toLowerCase()}`}>{signalPhase} · simulation</b>}</div>
          <div className="navigation-progress-card">
            <div className="navigation-metrics"><span><strong>{formatDuration(summary.remainingDuration)}</strong><small>{formatDistance(summary.remainingDistance)}</small></span><span><strong>{Math.round(status === 'paused' ? 0 : vehicleSpeed)} km/h</strong><small>{status === 'paused' ? 'PAUSED' : motionState}</small></span><span><strong>{etaFor(summary.remainingDuration)}</strong><small>ETA</small></span></div>
            <div className="route-progress-track"><span style={{ width: `${Math.round(summary.progress * 100)}%` }} /></div>
            <div className="navigation-controls">
              {status === 'driving' ? <button type="button" onClick={pause}>Pause</button> : <button type="button" onClick={startDriving}>Resume</button>}
              <label>Playback<select value={playbackSpeed} onChange={(event) => setPlaybackSpeed(Number(event.target.value))}><option value={1}>1× · 50–60 km/h</option><option value={2}>2× · Fast demo</option><option value={4}>4× · Quick demo</option></select><small>{playbackLabel(playbackSpeed)}</small></label>
              <button type="button" className="end-drive" onClick={stop}>End</button>
            </div>
          </div>
        </>
      )}
      {status === 'arrived' && (
        <div className="destination-reached-card"><span aria-hidden="true">✓</span><small>Destination reached</small><strong>Trip complete</strong><p>{formatDistance(summary.totalDistance)} simulated along the Google route.</p><div><button type="button" onClick={stop}>End Trip</button><button type="button" onClick={startDriving}>Restart Simulation</button></div></div>
      )}
    </section>
  );
}
