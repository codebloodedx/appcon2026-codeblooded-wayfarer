import type { ReactNode } from 'react';
import type { SimulationMode } from '../features/trip/types';
import { DevicesIcon } from './Icons';

type SimulationFrameProps = {
  mode: SimulationMode;
  children: ReactNode;
  onToggleMode?: () => void;
};

export function SimulationFrame({ mode, children, onToggleMode }: SimulationFrameProps) {
  const isPhone = mode === 'phone';

  return (
    <div className={`simulation-stage simulation-${mode}`}>
      <div className="simulation-toolbar" role="toolbar" aria-label="Display mode switcher">
        <div className="simulation-toolbar-left">
          <span className="simulation-live-dot" aria-hidden="true" />
          <span>
            <small>Display Preview</small>
            <strong>{isPhone ? 'Smartphone In-Car Frame' : 'Full-Width Cockpit'}</strong>
          </span>
        </div>
        {onToggleMode && (
          <button
            type="button"
            className="simulation-toggle-btn"
            onClick={onToggleMode}
            title={isPhone ? 'Switch to wide cockpit view' : 'Switch to smartphone frame'}
          >
            <DevicesIcon size={14} />
            <span>{isPhone ? 'Wide PC View' : 'Phone Frame'}</span>
          </button>
        )}
      </div>
      <div className="simulation-device">
        {isPhone && (
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
