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
            <span className="simulation-phone-status">
              <b>9:41</b>
              <span className="simulation-phone-signals">
                <i className="phone-signal-bars" />
                <i className="phone-wifi" />
                <i className="phone-battery" />
              </span>
            </span>
            <span className="simulation-phone-island">
              <i className="simulation-phone-speaker" />
              <i className="simulation-phone-sensor" />
              <i className="simulation-phone-camera" />
            </span>
            <span className="simulation-phone-gesture-bar" />
          </div>
        )}
        <div className="simulation-viewport">{children}</div>
      </div>
    </div>
  );
}
