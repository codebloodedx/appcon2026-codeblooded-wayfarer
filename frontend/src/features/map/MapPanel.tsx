import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { useEffect, useRef, useState } from 'react';
import type { CountryCode } from '../guidance/types';

export type MapPanelProps = {
  countryCode: CountryCode;
  destination: string;
  demoOrigin?: { lat: number; lng: number; label: string };
  avoidRestrictedZones?: boolean;
  onCountryResolved?: (countryCode: CountryCode | null, source: 'gps' | 'selected' | 'simulated') => void;
};

type Origin = { lat: number; lng: number };
type RouteSummary = { eta: string; distance: string; nextTurn: string };

const countryNames: Record<CountryCode, string> = { JP: 'Japan', PH: 'Philippines' };
let mapsConfigured = false;

function configureMaps() {
  if (mapsConfigured) return true;
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  if (!key) return false;
  setOptions({ key, v: 'weekly', language: 'en' });
  mapsConfigured = true;
  return true;
}

function locate(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, {
    enableHighAccuracy: true,
    timeout: 10_000,
    maximumAge: 30_000,
  }));
}

export function MapPanel({ countryCode, destination, demoOrigin, avoidRestrictedZones = false, onCountryResolved }: MapPanelProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState<Origin | null>(demoOrigin || null);
  const [locationLabel, setLocationLabel] = useState(demoOrigin ? `Simulated location · ${demoOrigin.label}` : 'Location not requested');
  const [status, setStatus] = useState('Enter a destination to calculate a route.');
  const [summary, setSummary] = useState<RouteSummary | null>(null);

  useEffect(() => {
    if (demoOrigin) {
      setOrigin(demoOrigin);
      setLocationLabel(`Simulated location · ${demoOrigin.label}`);
      onCountryResolved?.(countryCode, 'simulated');
    }
  }, [countryCode, demoOrigin, onCountryResolved]);

  useEffect(() => {
    let cancelled = false;
    let polylines: google.maps.Polyline[] = [];
    let markers: google.maps.marker.AdvancedMarkerElement[] = [];
    async function renderRoute() {
      if (!origin || !destination.trim() || !mapElement.current) return;
      if (!configureMaps()) {
        setStatus('Map unavailable: add a restricted Google Maps browser key.');
        return;
      }
      setStatus('Calculating route…');
      setSummary(null);
      try {
        const [{ Map }, { Route }, { AdvancedMarkerElement }, { Geocoder }] = await Promise.all([
          importLibrary('maps'),
          importLibrary('routes'),
          importLibrary('marker'),
          importLibrary('geocoding'),
        ]);
        if (cancelled || !mapElement.current) return;
        const map = new Map(mapElement.current, { center: origin, zoom: 13, mapId: 'DEMO_MAP_ID' });
        const geocoded = await new Geocoder().geocode({ address: `${destination}, ${countryNames[countryCode]}` });
        const destinationResult = geocoded.results[0];
        const destinationCountry = destinationResult?.address_components
          .find((component) => component.types.includes('country'))?.short_name;
        if (!destinationResult || destinationCountry !== countryCode) {
          throw new Error(`Choose a destination within ${countryNames[countryCode]}.`);
        }
        const { routes } = await Route.computeRoutes({
          origin,
          destination: destinationResult.geometry.location,
          travelMode: 'DRIVING',
          routingPreference: 'TRAFFIC_AWARE',
          fields: ['path', 'viewport', 'durationMillis', 'distanceMeters', 'legs', 'legs.steps'],
        });
        const route = routes?.[0];
        if (!route) throw new Error('No route was returned for this destination.');
        polylines = route.createPolylines({ polylineOptions: { strokeColor: '#6d4aff', strokeWeight: 6 } });
        polylines.forEach((line) => line.setMap(map));
        markers = await route.createWaypointAdvancedMarkers({ map });
        if (route.viewport) map.fitBounds(route.viewport, 48);
        const firstStep = route.legs?.[0]?.steps?.[0];
        setSummary({
          eta: route.durationMillis ? `${Math.max(1, Math.round(route.durationMillis / 60_000))} min` : 'Unavailable',
          distance: route.distanceMeters ? `${(route.distanceMeters / 1000).toFixed(1)} km` : 'Unavailable',
          nextTurn: firstStep?.instructions || 'Follow the highlighted route',
        });
        setStatus('Route supplied by Google Maps. Keep following local signs and conditions.');
        void AdvancedMarkerElement;
      } catch (error) {
        if (!cancelled) setStatus(error instanceof Error ? `Route unavailable: ${error.message}` : 'Route unavailable.');
      }
    }
    void renderRoute();
    return () => {
      cancelled = true;
      polylines.forEach((line) => line.setMap(null));
      markers.forEach((marker) => { marker.map = null; });
    };
  }, [countryCode, destination, origin]);

  async function useDeviceLocation() {
    if (!navigator.geolocation) {
      setLocationLabel(`Selected fallback · ${countryNames[countryCode]}`);
      onCountryResolved?.(countryCode, 'selected');
      return;
    }
    try {
      setLocationLabel('Requesting location…');
      const position = await locate();
      const point = { lat: position.coords.latitude, lng: position.coords.longitude };
      setOrigin(point);
      if (!configureMaps()) throw new Error('Map key missing');
      const { Geocoder } = await importLibrary('geocoding');
      const result = await new Geocoder().geocode({ location: point });
      const code = result.results.flatMap((item) => item.address_components)
        .find((component) => component.types.includes('country'))?.short_name;
      const resolved = code === 'JP' || code === 'PH' ? code : null;
      setLocationLabel(resolved ? `Detected location · ${countryNames[resolved]}` : 'Detected location · Unsupported country');
      onCountryResolved?.(resolved, 'gps');
    } catch {
      setOrigin(null);
      setLocationLabel(`Selected fallback · ${countryNames[countryCode]}`);
      setStatus('Location unavailable. Select a demo location to show a route.');
      onCountryResolved?.(countryCode, 'selected');
    }
  }

  return (
    <section className="map-panel" aria-label="Destination map">
      <header className="map-panel__header">
        <div>
          <strong>{locationLabel}</strong>
          <p aria-live="polite">{status}</p>
        </div>
        {!demoOrigin && <button type="button" onClick={() => void useDeviceLocation()}>Use my location</button>}
      </header>
      {avoidRestrictedZones && (
        <p className="map-panel__simulation"><strong>Simulation:</strong> Restricted-zone avoidance is a route preview and is not a legal-compliance claim.</p>
      )}
      <div ref={mapElement} className="map-panel__canvas" style={{ minHeight: 320 }} />
      {summary && (
        <div className="map-panel__route" aria-label="Route summary">
          <span><strong>ETA</strong> {summary.eta}</span>
          <span><strong>Distance</strong> {summary.distance}</span>
          <span><strong>Next</strong> {summary.nextTurn}</span>
        </div>
      )}
    </section>
  );
}
