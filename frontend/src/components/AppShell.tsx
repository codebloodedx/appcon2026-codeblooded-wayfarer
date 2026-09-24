import { useState, type FormEvent, type ReactNode } from 'react';
import type { AppView, CountryCode, TripPlan } from '../features/trip/types';
import { BottomSheetDrawer } from './BottomSheetDrawer';
import { BrandLogo } from './BrandLogo';
import { DevicesIcon, MapIcon, ParkedIcon, SearchIcon, SignsIcon } from './Icons';

type AppShellProps = {
  activeView: AppView;
  trip: TripPlan;
  cockpit: ReactNode;
  children?: ReactNode;
  onChangeView: (view: AppView) => void;
  onEditTrip: () => void;
  onUpdateTrip?: (trip: TripPlan) => void;
};

const navItems: Array<{ id: AppView; label: string; icon: (size?: number) => ReactNode; parked?: boolean }> = [
  { id: 'trip', label: 'Map', icon: (size = 18) => <MapIcon size={size} /> },
  { id: 'parked', label: 'Parked', icon: (size = 18) => <ParkedIcon size={size} />, parked: true },
  { id: 'signs', label: 'Signs', icon: (size = 18) => <SignsIcon size={size} />, parked: true },
  { id: 'devices', label: 'Devices', icon: (size = 18) => <DevicesIcon size={size} />, parked: true },
];

export function AppShell({
  activeView,
  trip,
  cockpit,
  children,
  onChangeView,
  onEditTrip,
  onUpdateTrip,
}: AppShellProps) {
  const [editingDestination, setEditingDestination] = useState(false);
  const [destinationInput, setDestinationInput] = useState(trip.destination);

  const activeNavItem = navItems.find((item) => item.id === activeView);

  function handleSaveDestination(event: FormEvent) {
    event.preventDefault();
    if (!destinationInput.trim()) return;
    onUpdateTrip?.({
      ...trip,
      destination: destinationInput.trim(),
    });
    setEditingDestination(false);
  }

  function handleQuickSwitch(country: CountryCode) {
    onUpdateTrip?.({
      ...trip,
      destinationCountry: country,
      destination: country === 'JP' ? 'Shibuya, Tokyo' : 'Makati City',
    });
    setDestinationInput(country === 'JP' ? 'Shibuya, Tokyo' : 'Makati City');
    setEditingDestination(false);
  }

  return (
    <div className="app-shell google-maps-layout">
      {/* Floating Top Search Bar */}
      <header className="gmaps-search-bar" role="search" aria-label="Destination search and status">
        <div className="gmaps-search-inner">
          <button
            className="gmaps-search-btn"
            type="button"
            onClick={onEditTrip}
            title="Edit trip setup"
            aria-label="Edit trip setup"
          >
            <BrandLogo className="gmaps-search-logo" />
          </button>

          <div
            className="gmaps-search-center"
            onClick={() => setEditingDestination(true)}
            role="button"
            tabIndex={0}
            title="Click to edit destination"
          >
            <div className="gmaps-country-badge">
              <span className="country-code-pill">{trip.homeCountry}</span>
              <span className="route-arrow" aria-hidden="true">→</span>
              <span className="country-code-pill highlight">{trip.destinationCountry}</span>
            </div>
            <div className="gmaps-search-query">
              <strong>{trip.destination}</strong>
              {/* Only show demo badge if demo mode is actually active */}
              {trip.useSimulatedOrigin && (
                <small className="demo-badge-indicator">Demo: Tokyo</small>
              )}
            </div>
          </div>

          <button
            className="gmaps-search-icon-btn"
            type="button"
            onClick={() => setEditingDestination(!editingDestination)}
            title="Change destination"
            aria-label="Change destination"
          >
            <SearchIcon size={18} />
          </button>
        </div>

        {/* Inline Destination Switcher Popover */}
        {editingDestination && (
          <form className="gmaps-search-dropdown" onSubmit={handleSaveDestination}>
            <div className="gmaps-dropdown-input-row">
              <input
                type="text"
                autoFocus
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                placeholder="Enter new destination"
              />
              <button type="submit" className="button button-primary compact">
                Set
              </button>
            </div>
            <div className="gmaps-dropdown-presets">
              <small>Switch destination:</small>
              <button type="button" onClick={() => handleQuickSwitch('JP')}>
                Tokyo (JP)
              </button>
              <button type="button" onClick={() => handleQuickSwitch('PH')}>
                Makati (PH)
              </button>
              <button type="button" className="text-btn" onClick={() => setEditingDestination(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </header>

      {/* Main Persistent Cockpit Viewport (Always Mounted) */}
      <main className="gmaps-main-viewport">
        {cockpit}
      </main>

      {/* Reusable Bottom-Sheet Drawer Overlay for Parked, Signs, Devices */}
      <BottomSheetDrawer
        isOpen={activeView !== 'trip'}
        onClose={() => onChangeView('trip')}
        title={activeNavItem?.label ?? ''}
        icon={activeNavItem?.icon(20)}
      >
        {activeView !== 'trip' && children}
      </BottomSheetDrawer>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="gmaps-bottom-nav" aria-label="Bottom Navigation">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`gmaps-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onChangeView(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="gmaps-nav-icon">{item.icon(20)}</span>
              <span className="gmaps-nav-label">{item.label}</span>
              {item.parked && <span className="parked-pill-dot" title="Parked feature" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
