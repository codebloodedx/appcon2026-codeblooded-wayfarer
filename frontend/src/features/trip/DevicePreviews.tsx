import { useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { BrandLogo } from '../../components/BrandLogo';
import type { TripPlan } from './types';

type DevicePreviewsProps = {
  trip: TripPlan;
  onClose?: () => void;
};

type DeviceType = 'phone' | 'dashcam' | 'twowheeler' | 'ev';

function PreviewContent({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'preview-content compact-preview' : 'preview-content'}>
      <div className="mini-map">
        <svg viewBox="0 0 160 80" aria-hidden="true">
          <path d="M8 67 C35 61 38 25 70 38 S104 57 123 22 S145 14 153 8" />
        </svg>
        <span>→</span>
      </div>
      <div className="mini-guidance">
        <span>?</span>
        <div>
          <small>Recognition</small>
          <strong>Unknown · Safe Fallback</strong>
        </div>
      </div>
    </div>
  );
}

export function DevicePreviews({ trip, onClose }: DevicePreviewsProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('phone');

  return (
    <div className="drawer-overlay-container" role="dialog" aria-modal="true" aria-labelledby="devices-title">
      <div className="drawer-backdrop" onClick={onClose} />
      <section className="drawer-sheet devices-sheet">
        <div className="drawer-drag-handle" />
        <div className="drawer-header">
          <div>
            <p className="eyebrow">One Trip · Adaptable Automotive Surfaces</p>
            <h1 id="devices-title">Device Interface Previews</h1>
            <p className="drawer-subtitle">
              Interactive previews simulating how WayFarer adapts to different hardware displays. All screens maintain safe fallback and require no physical hardware connections.
            </p>
          </div>
          <div className="drawer-header-actions">
            <StatusBadge tone="info">Interface Previews Only</StatusBadge>
            {onClose && (
              <button
                type="button"
                className="drawer-close-btn"
                onClick={onClose}
                aria-label="Close drawer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Interactive Device Selector Tabs */}
        <div className="drawer-segmented-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={selectedDevice === 'phone'}
            className={`tab-btn ${selectedDevice === 'phone' ? 'active' : ''}`}
            onClick={() => setSelectedDevice('phone')}
          >
            📱 Smartphone
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedDevice === 'dashcam'}
            className={`tab-btn ${selectedDevice === 'dashcam' ? 'active' : ''}`}
            onClick={() => setSelectedDevice('dashcam')}
          >
            📹 Smart Dashcam
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedDevice === 'twowheeler'}
            className={`tab-btn ${selectedDevice === 'twowheeler' ? 'active' : ''}`}
            onClick={() => setSelectedDevice('twowheeler')}
          >
            🏍️ Two-Wheeler HUD
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedDevice === 'ev'}
            className={`tab-btn ${selectedDevice === 'ev' ? 'active' : ''}`}
            onClick={() => setSelectedDevice('ev')}
          >
            ⚡ EV Center Display
          </button>
        </div>

        <div className="drawer-tab-content device-preview-viewport">
          {selectedDevice === 'phone' && (
            <article className="featured-device-display">
              <div className="device-headline">
                <div>
                  <span className="device-number">01</span>
                  <h2>Primary Smartphone View</h2>
                </div>
                <StatusBadge>Interface preview</StatusBadge>
              </div>
              <div className="phone-frame">
                <div className="phone-island" />
                <div className="device-top">
                  <span>WayFarer</span>
                  <small>{trip.destinationCountry === 'JP' ? '🇯🇵 Japan' : '🇵🇭 Philippines'}</small>
                </div>
                <PreviewContent />
                <div className="phone-action">Parked details</div>
              </div>
              <p className="device-caption">
                Primary handheld cockpit layout with large touch targets and stacked map/camera surfaces.
              </p>
            </article>
          )}

          {selectedDevice === 'dashcam' && (
            <article className="featured-device-display">
              <div className="device-headline">
                <div>
                  <span className="device-number">02</span>
                  <h2>Windshield Mounted Dashcam</h2>
                </div>
                <StatusBadge>Interface preview</StatusBadge>
              </div>
              <div className="dashcam-frame">
                <div className="lens" />
                <div className="dashcam-screen">
                  <div className="device-top">
                    <span>REC · preview</span>
                    <small>Standby</small>
                  </div>
                  <PreviewContent compact />
                </div>
                <div className="dashcam-buttons"><i /><i /><i /></div>
              </div>
              <p className="device-caption">
                Glanceable camera-first layout. Uses vehicle camera hardware for continuous sign monitoring.
              </p>
            </article>
          )}

          {selectedDevice === 'twowheeler' && (
            <article className="featured-device-display">
              <div className="device-headline">
                <div>
                  <span className="device-number">03</span>
                  <h2>Action Camera & Two-Wheeler High-Contrast HUD</h2>
                </div>
                <StatusBadge tone="warning">Interface preview</StatusBadge>
              </div>
              <div className="action-frame">
                <div className="action-screen">
                  <div className="two-wheel-status">
                    <strong>UNKNOWN SIGN</strong>
                    <span>SAFE FALLBACK ACTIVE</span>
                  </div>
                  <div className="proximity-reminder">
                    SIMULATED PROXIMITY REMINDER<br />
                    <strong>Slow down · Keep safe space</strong>
                  </div>
                </div>
                <div className="action-lens" />
              </div>
              <p className="device-caption">
                High-contrast layout designed for direct sunlight visibility without flashing borders.
              </p>
            </article>
          )}

          {selectedDevice === 'ev' && (
            <article className="featured-device-display">
              <div className="device-headline">
                <div>
                  <span className="device-number">04</span>
                  <h2>EV Infotainment Center Console</h2>
                </div>
                <StatusBadge>Interface preview</StatusBadge>
              </div>
              <div className="ev-frame">
                <div className="ev-side">
                  <BrandLogo className="device-brand-mark" />
                  <span>Trip</span>
                  <span>Signs</span>
                </div>
                <div className="ev-main">
                  <div className="device-top">
                    <span>{trip.destination}</span>
                    <small>{trip.useSimulatedOrigin ? 'Simulated location' : 'Location active'}</small>
                  </div>
                  <PreviewContent compact />
                  <div className="ev-footer">
                    <span>Audio: Ready</span>
                    <span>ETA: Active</span>
                  </div>
                </div>
              </div>
              <p className="device-caption">
                Wide-format dashboard concept for modern in-car infotainment screens.
              </p>
            </article>
          )}
        </div>
      </section>
    </div>
  );
}
