import type { ReactNode } from 'react';
import type { AppView } from '../features/trip/types';
import { BottomSheetDrawer } from './BottomSheetDrawer';
import { DevicesIcon, MapIcon, ParkedIcon, SignsIcon } from './Icons';

type AppShellProps = {
  activeView: AppView;
  cockpit: ReactNode;
  children?: ReactNode;
  onChangeView: (view: AppView) => void;
};

const navItems: Array<{
  id: AppView;
  label: string;
  icon: (size?: number) => ReactNode;
  parked?: boolean;
}> = [
  { id: 'trip', label: 'Map', icon: (size = 18) => <MapIcon size={size} /> },
  { id: 'parked', label: 'Guidance', icon: (size = 18) => <ParkedIcon size={size} />, parked: true },
  { id: 'signs', label: 'Signs', icon: (size = 18) => <SignsIcon size={size} />, parked: true },
  { id: 'devices', label: 'Devices', icon: (size = 18) => <DevicesIcon size={size} />, parked: true },
];

export function AppShell({ activeView, cockpit, children, onChangeView }: AppShellProps) {
  const activeNavItem = navItems.find((item) => item.id === activeView);

  return (
    <div className="app-shell google-maps-layout">
      <main className="gmaps-main-viewport navigation-content">{cockpit}</main>

      <BottomSheetDrawer
        isOpen={activeView !== 'trip'}
        onClose={() => onChangeView('trip')}
        title={activeNavItem?.label ?? ''}
        icon={activeNavItem?.icon(20)}
      >
        {activeView !== 'trip' && children}
      </BottomSheetDrawer>

      <nav className="gmaps-bottom-nav" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`gmaps-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onChangeView(item.id)}
              aria-current={isActive ? 'page' : undefined}
              title={item.id === 'parked' ? 'Reviewed Guidance' : item.label}
            >
              <span className="gmaps-nav-icon">{item.icon(20)}</span>
              <span className="gmaps-nav-label">{item.label}</span>
              {item.parked && <span className="parked-pill-dot" title="Use while parked" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
