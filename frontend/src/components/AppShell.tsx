import type { ReactNode } from 'react';
import type { AppView } from '../features/trip/types';
import { BrandLogo } from './BrandLogo';

type AppShellProps = {
  activeView: AppView;
  destination: string;
  children: ReactNode;
  onChangeView: (view: AppView) => void;
  onEditTrip: () => void;
};

const navItems: Array<{ id: AppView; label: string; parked?: boolean }> = [
  { id: 'trip', label: 'Trip' },
  { id: 'parked', label: 'Parked details', parked: true },
  { id: 'signs', label: 'Supported signs', parked: true },
  { id: 'devices', label: 'Device previews', parked: true },
];

export function AppShell({ activeView, destination, children, onChangeView, onEditTrip }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => onChangeView('trip')} aria-label="WayFarer trip home">
          <BrandLogo />
          <span>
            <strong>WayFarer</strong>
            <small>Philippines → Japan</small>
          </span>
        </button>

        <div className="topbar-trip">
          <span className="location-dot" aria-hidden="true" />
          <span><small>Destination</small><strong>{destination}</strong></span>
        </div>

        <button className="button button-secondary compact" type="button" onClick={onEditTrip}>Edit trip</button>
      </header>

      <nav className="view-tabs" aria-label="Trip views">
        {navItems.map((item) => (
          <button
            className={activeView === item.id ? 'view-tab active' : 'view-tab'}
            type="button"
            key={item.id}
            onClick={() => onChangeView(item.id)}
            aria-current={activeView === item.id ? 'page' : undefined}
          >
            {item.label}
            {item.parked && <span className="parked-dot" title="Use while parked" aria-label="Use while parked" />}
          </button>
        ))}
      </nav>

      <main className="app-content">{children}</main>
    </div>
  );
}
