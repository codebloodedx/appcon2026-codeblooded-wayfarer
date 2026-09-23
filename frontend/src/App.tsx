import { useEffect, useState } from 'react';
import { AppShell } from './components/AppShell';
import { wayfarerLogoUrl } from './components/BrandLogo';
import { DevicePreviews } from './features/trip/DevicePreviews';
import { ParkedView } from './features/trip/ParkedView';
import { SupportedSignsView } from './features/trip/SupportedSignsView';
import { TripScreen } from './features/trip/TripScreen';
import { TripSetup } from './features/trip/TripSetup';
import type { AppView, TripPlan } from './features/trip/types';

const DEFAULT_TRIP: TripPlan = {
  homeCountry: 'PH',
  destinationCountry: 'JP',
  destination: 'Shibuya, Tokyo',
  useSimulatedOrigin: true,
};

export default function App() {
  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [view, setView] = useState<AppView>('trip');

  useEffect(() => {
    document.title = 'WayFarer';

    const existingIcon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const favicon = existingIcon ?? document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = wayfarerLogoUrl;

    if (!existingIcon) {
      document.head.appendChild(favicon);
    }
  }, []);

  if (!trip) {
    return <TripSetup initialTrip={DEFAULT_TRIP} onStart={setTrip} />;
  }

  return (
    <AppShell
      activeView={view}
      destination={trip.destination}
      onChangeView={setView}
      onEditTrip={() => setTrip(null)}
    >
      {view === 'trip' && <TripScreen trip={trip} onPark={() => setView('parked')} />}
      {view === 'parked' && <ParkedView trip={trip} />}
      {view === 'signs' && <SupportedSignsView />}
      {view === 'devices' && <DevicePreviews trip={trip} />}
    </AppShell>
  );
}
