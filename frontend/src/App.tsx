import { useCallback, useEffect, useState } from 'react';
import { AppShell } from './components/AppShell';
import { wayfarerLogoUrl } from './components/BrandLogo';
import { DevicePreviews } from './features/trip/DevicePreviews';
import { ParkedView } from './features/trip/ParkedView';
import { SupportedSignsView } from './features/trip/SupportedSignsView';
import { TripScreen } from './features/trip/TripScreen';
import { TripSetup } from './features/trip/TripSetup';
import type { CountryCode, RuleRecord } from './features/guidance/types';
import type { AppView, TripPlan } from './features/trip/types';

const DEFAULT_TRIP: TripPlan = {
  homeCountry: 'PH',
  destinationCountry: 'JP',
  destination: 'Shibuya, Tokyo',
  useSimulatedOrigin: true,
};

export function App() {
  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [view, setView] = useState<AppView>('trip');
  const [currentCountry, setCurrentCountry] = useState<CountryCode | null>(null);
  const [locationSource, setLocationSource] = useState<'gps' | 'selected' | 'simulated'>('selected');
  const latestRule: RuleRecord | null = null;
  const guidanceError: string | null = null;
  const audioStatus = 'Not played';

  useEffect(() => {
    document.title = 'WayFarer';
    const existingIcon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const favicon = existingIcon ?? document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = wayfarerLogoUrl;
    if (!existingIcon) document.head.appendChild(favicon);
  }, []);

  const onCountryResolved = useCallback((country: CountryCode | null, source: 'gps' | 'selected' | 'simulated') => {
    setCurrentCountry(country);
    setLocationSource(source);
  }, []);

  function startTrip(plan: TripPlan) {
    setTrip(plan);
    setCurrentCountry(plan.destinationCountry);
    setLocationSource(plan.useSimulatedOrigin ? 'simulated' : 'selected');
    setView('trip');
  }

  if (!trip) return <TripSetup initialTrip={DEFAULT_TRIP} onStart={startTrip} />;

  return (
    <AppShell
      activeView={view}
      trip={trip}
      onChangeView={setView}
      onEditTrip={() => setTrip(null)}
      onUpdateTrip={(updated) => setTrip(updated)}
      onRequestLocation={() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            () => setLocationSource('gps'),
            () => setLocationSource('selected')
          );
        }
      }}
    >
      {/* 1. Main Map Viewport stays active in background (No reloads or unmounting) */}
      <TripScreen
        trip={trip}
        currentCountry={currentCountry}
        locationSource={locationSource}
        latestRule={latestRule}
        guidanceError={guidanceError}
        audioStatus={audioStatus}
        onCountryResolved={onCountryResolved}
        onPark={() => setView('parked')}
      />

      {/* 2. Bottom-Sheet Drawers for Secondary Details (Overlay over Map) */}
      {view === 'parked' && (
        <ParkedView
          trip={trip}
          currentCountry={currentCountry}
          locationSource={locationSource}
          latestRule={latestRule}
          onClose={() => setView('trip')}
        />
      )}
      {view === 'signs' && (
        <SupportedSignsView
          countryCode={trip.destinationCountry}
          onClose={() => setView('trip')}
        />
      )}
      {view === 'devices' && (
        <DevicePreviews
          trip={trip}
          onClose={() => setView('trip')}
        />
      )}
    </AppShell>
  );
}

export default App;
