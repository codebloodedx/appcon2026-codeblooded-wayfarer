import { useState, type ReactNode } from 'react';
import type { AppView, CountryCode, TripPlan } from '../features/trip/types';
import { BrandLogo } from './BrandLogo';

type AppShellProps = {
  activeView: AppView;
  trip: TripPlan;
  children: ReactNode;
  onChangeView: (view: AppView) => void;
  onEditTrip: () => void;
  onUpdateTrip?: (trip: TripPlan) => void;
  onRequestLocation?: () => void;
};

const navItems: Array<{ id: AppView; label: string; icon: string }> = [
  { id: 'trip', label: 'Map', icon: '🗺️' },
  { id: 'parked', label: 'Parked', icon: '🅿️' },
  { id: 'signs', label: 'Signs', icon: '🛑' },
  { id: 'devices', label: 'Devices', icon: '📱' },
];

export function AppShell({
  activeView,
  trip,
  children,
  onChangeView,
  onEditTrip,
  onUpdateTrip,
  onRequestLocation,
}: AppShellProps) {
  const [editingRoute, setEditingRoute] = useState(false);
  const [destinationInput, setDestinationInput] = useState(trip.destination);

  function handleSaveDestination(e: React.FormEvent) {
    e.preventDefault();
    if (!destinationInput.trim()) return;
    onUpdateTrip?.({
      ...trip,
      destination: destinationInput.trim(),
    });
    setEditingRoute(false);
  }

  function handleSwitchCountry(code: CountryCode) {
    onUpdateTrip?.({
      ...trip,
      destinationCountry: code,
      destination: code === 'JP' ? 'Shibuya, Tokyo' : 'Makati City',
    });
    setDestinationInput(code === 'JP' ? 'Shibuya, Tokyo' : 'Makati City');
    setEditingRoute(false);
  }

  return (
    <div className="app-shell google-maps-layout">
      {/* Google Maps style floating top search bar */}
      <header className="gmaps-search-bar" role="search" aria-label="Route and location search">
        <div className="gmaps-search-inner">
          <button
            className="gmaps-search-btn"
            type="button"
            onClick={onEditTrip}
            title="Return to setup"
            aria-label="Return to setup"
          >
            <BrandLogo className="gmaps-search-logo" />
          </button>

          <div className="gmaps-search-center" onClick={() => setEditingRoute(true)}>
            <div className="gmaps-country-badge">
              <span>{trip.homeCountry === 'PH' ? '🇵🇭' : '🇯🇵'}</span>
              <span className="route-arrow">→</span>
              <span>{trip.destinationCountry === 'PH' ? '🇵🇭' : '🇯🇵'}</span>
            </div>
            <div className="gmaps-search-query">
              <strong>{trip.destination}</strong>
              <small>{trip.useSimulatedOrigin ? 'Simulated Origin' : 'GPS Active'}</small>
            </div>
          </div>

          <button
            className="gmaps-change-btn"
            type="button"
            onClick={() => setEditingRoute(!editingRoute)}
            title="Change route / destination"
            aria-label="Change route"
          >
            ✏️
          </button>
        </div>

        {/* Inline Route Modifier Popover */}
        {editingRoute && (
          <form className="gmaps-route-popover" onSubmit={handleSaveDestination}>
            <div className="route-popover-header">
              <strong>Change Route Destination</strong>
              <button
                type="button"
                className="close-popover-btn"
                onClick={() => setEditingRoute(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="country-switch-row">
              <label>Drive Country:</label>
              <div className="country-switch-buttons">
                <button
                  type="button"
                  className={trip.destinationCountry === 'JP' ? 'active' : ''}
                  onClick={() => handleSwitchCountry('JP')}
                >
                  🇯🇵 Japan
                </button>
                <button
                  type="button"
                  className={trip.destinationCountry === 'PH' ? 'active' : ''}
                  onClick={() => handleSwitchCountry('PH')}
                >
                  🇵🇭 Philippines
                </button>
              </div>
            </div>

            <div className="input-wrap compact">
              <span aria-hidden="true">⌖</span>
              <input
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                placeholder="Enter destination address..."
                autoFocus
              />
            </div>

            <div className="route-popover-actions">
              <button
                type="button"
                className="button button-secondary compact"
                onClick={onRequestLocation}
              >
                📍 Use my location
              </button>
              <button type="submit" className="button button-primary compact">
                Update Route
              </button>
            </div>
          </form>
        )}
      </header>

      {/* Main Full-Viewport Content Area */}
      <main className="gmaps-viewport">{children}</main>

      {/* Google Maps style fixed bottom navigation bar */}
      <nav className="gmaps-bottom-nav" aria-label="Main Navigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`gmaps-nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onChangeView(item.id)}
            aria-current={activeView === item.id ? 'page' : undefined}
          >
            <span className="gmaps-nav-icon">{item.icon}</span>
            <span className="gmaps-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
