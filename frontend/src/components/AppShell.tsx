import type { MouseEvent, ReactNode } from 'react';
import type { AppView } from '../features/trip/types';
import { MapIcon, ParkedIcon, SettingsIcon, SignsIcon } from './Icons';

type AppShellProps = {
  activeView: AppView;
  children: ReactNode;
  onChangeView: (view: AppView) => void;
};

export const appPaths: Record<AppView, string> = {
  trip: '/trip',
  navigation: '/navigation',
  'reviewed-guidance': '/reviewed-guidance',
  'sign-recognition': '/sign-recognition',
  settings: '/settings',
};

export function appViewFromPath(pathname: string): AppView {
  return (Object.entries(appPaths) as Array<[AppView, string]>).find(([, path]) => path === pathname)?.[0] ?? 'navigation';
}

const navItems: Array<{
  id: AppView;
  label: string;
  icon: (size?: number) => ReactNode;
}> = [
  { id: 'navigation', label: 'Navigation', icon: (size = 18) => <MapIcon size={size} /> },
  { id: 'reviewed-guidance', label: 'Reviewed Guidance', icon: (size = 18) => <ParkedIcon size={size} /> },
  { id: 'sign-recognition', label: 'Signs', icon: (size = 18) => <SignsIcon size={size} /> },
  { id: 'settings', label: 'Settings', icon: (size = 18) => <SettingsIcon size={size} /> },
];

export function AppShell({ activeView, children, onChangeView }: AppShellProps) {
  function navigate(event: MouseEvent<HTMLAnchorElement>, view: AppView) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onChangeView(view);
  }

  return (
    <div className={`app-shell routed-app-shell page-${activeView}`}>
      <main className="routed-page">{children}</main>
      <nav className="gmaps-bottom-nav routed-bottom-nav" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <a
              key={item.id}
              className={`gmaps-nav-item ${isActive ? 'active' : ''}`}
              href={appPaths[item.id]}
              onClick={(event) => navigate(event, item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="gmaps-nav-icon">{item.icon(20)}</span>
              <span className="gmaps-nav-label">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
