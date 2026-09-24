import type { ReactNode } from 'react';
import type { AppView } from '../features/trip/types';

type AppShellProps = {
  activeView: AppView;
  children: ReactNode;
  onChangeView: (view: AppView) => void;
};

const navItems: Array<{ id: AppView; label: string; icon: string; parked?: boolean }> = [
  { id: 'trip', label: 'Map', icon: '⌖' },
  { id: 'parked', label: 'Guidance', icon: '≡', parked: true },
  { id: 'signs', label: 'Signs', icon: '◇', parked: true },
  { id: 'devices', label: 'Devices', icon: '▣', parked: true },
];

export function AppShell({ activeView, children, onChangeView }: AppShellProps) {
  return (
    <div className="app-shell navigation-shell">
      <main className="app-content navigation-content">{children}</main>
      <nav className="navigation-bottom-nav" aria-label="Main navigation">
        {navItems.map((item) => <button key={item.id} type="button" className={activeView === item.id ? 'active' : ''} onClick={() => onChangeView(item.id)} aria-current={activeView === item.id ? 'page' : undefined} title={item.id === 'parked' ? 'Reviewed Guidance' : item.label}><span aria-hidden="true">{item.icon}</span><small>{item.label}</small>{item.parked && <i title="Use while parked" />}</button>)}
      </nav>
    </div>
  );
}
