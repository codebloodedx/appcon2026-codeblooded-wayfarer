import type { ReactNode } from 'react';
import type { SimulationMode } from '../features/trip/types';

type SimulationFrameProps = {
  mode: SimulationMode;
  children: ReactNode;
  onChangeMode: () => void;
};

export function SimulationFrame({ mode, children, onChangeMode }: SimulationFrameProps) {
  const label = mode === 'phone' ? 'Phone simulation' : 'PC simulation';

  return (
    <div className={`simulation-stage simulation-${mode}`}>
      <div className="simulation-toolbar">
        <div>
          <span className="simulation-live-dot" aria-hidden="true" />
          <span><small>Interface simulation</small><strong>{label}</strong></span>
        </div>
        <button type="button" onClick={onChangeMode}>Change view</button>
      </div>
      <div className="simulation-device">
        {mode === 'phone' && (
          <div className="simulation-phone-hardware" aria-hidden="true">
            <span className="phone-button phone-mute" />
            <span className="phone-button phone-volume-up" />
            <span className="phone-button phone-volume-down" />
            <span className="phone-button phone-power" />
            <span className="phone-island">
              <i className="phone-speaker" />
              <i className="phone-camera" />
              <i className="phone-sensor" />
            </span>
            <span className="phone-gesture-bar" />
          </div>
        )}
        <div className="simulation-viewport">{children}</div>
      </div>
    </div>
  );
}
