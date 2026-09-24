import { useState } from 'react';
import { BrandLogo } from '../../components/BrandLogo';
import { DevicesIcon } from '../../components/Icons';
import { StatusBadge } from '../../components/StatusBadge';
import type { TripPlan } from './types';

type DevicePreviewsProps = { trip: TripPlan };

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
          <strong>Scanning for signs…</strong>
        </div>
      </div>
    </div>
  );
}

export function DevicePreviews({ trip }: DevicePreviewsProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('phone');

  return (
    <div className="device-previews-container">
      {/* Device Switcher Segmented Control */}
      <div className="device-switcher-nav" role="tablist" aria-label="Select preview device">
        <button
          type="button"
          className={`device-switch-btn ${selectedDevice === 'phone' ? 'active' : ''}`}
          onClick={() => setSelectedDevice('phone')}
        >
          01. Smartphone
        </button>
        <button
          type="button"
          className={`device-switch-btn ${selectedDevice === 'dashcam' ? 'active' : ''}`}
          onClick={() => setSelectedDevice('dashcam')}
        >
          02. Dashcam
        </button>
        <button
          type="button"
          className={`device-switch-btn ${selectedDevice === 'twowheeler' ? 'active' : ''}`}
          onClick={() => setSelectedDevice('twowheeler')}
        >
          03. Two-Wheeler HUD
        </button>
        <button
          type="button"
          className={`device-switch-btn ${selectedDevice === 'ev' ? 'active' : ''}`}
          onClick={() => setSelectedDevice('ev')}
        >
          04. EV Cluster
        </button>
      </div>

      <div className="device-preview-stage">
        {selectedDevice === 'phone' && (
          <article className="device-card active-preview">
            <div className="device-card-heading">
              <div>
                <span className="device-number">01</span>
                <h3>Smartphone Mount</h3>
              </div>
              <StatusBadge tone="neutral">Interface preview</StatusBadge>
            </div>
            <div className="phone-frame">
              <div className="phone-island" />
              <div className="device-top">
                <span>WayFarer</span>
                <small>{trip.destinationCountry === 'JP' ? 'Japan (JP)' : 'Philippines (PH)'}</small>
              </div>
              <PreviewContent />
              <div className="phone-action">Parked details</div>
            </div>
            <p className="device-explanation">
              Primary handheld and windshield mount layout with large touch targets, glanceable HUD notifications, and stacked map/camera views.
            </p>
          </article>
        )}

        {selectedDevice === 'dashcam' && (
          <article className="device-card active-preview">
            <div className="device-card-heading">
              <div>
                <span className="device-number">02</span>
                <h3>Vehicle Dashcam</h3>
              </div>
              <StatusBadge tone="neutral">Interface preview</StatusBadge>
            </div>
            <div className="dashcam-frame">
              <div className="lens" />
              <div className="dashcam-screen">
                <div className="device-top">
                  <span>REC · preview</span>
                  <small>Not connected</small>
                </div>
                <PreviewContent compact />
              </div>
              <div className="dashcam-buttons">
                <i />
                <i />
                <i />
              </div>
            </div>
            <p className="device-explanation">
              Glanceable camera-first landscape treatment designed for auxiliary vehicle dashcam screens. Physical dashcam connectivity is planned for future iterations.
            </p>
          </article>
        )}

        {selectedDevice === 'twowheeler' && (
          <article className="device-card two-wheeler-card active-preview">
            <div className="device-card-heading">
              <div>
                <span className="device-number">03</span>
                <h3>Action Camera / Two-Wheeler</h3>
              </div>
              <StatusBadge tone="warning">High-Contrast Preview</StatusBadge>
            </div>
            <div className="action-frame">
              <div className="action-screen">
                <div className="two-wheel-status">
                  <strong>SCANNING</strong>
                  <span>MONITORING ROAD</span>
                </div>
                <div className="proximity-reminder">
                  SIMULATED PROXIMITY ALERT<br />
                  <strong>Maintain Safety Space · Keep Left</strong>
                </div>
              </div>
              <div className="action-lens" />
            </div>
            <p className="device-explanation">
              High-contrast sunlight readable interface without flashing visual distractions. Designed for motorcycle and scooter handlebars.
            </p>

            <div className="preride-mini-card">
              <strong>Two-Wheeler Safety Check:</strong> Wear DOT/ECE approved helmet, check mirror blind spots, and review route details while stationary.
            </div>
          </article>
        )}

        {selectedDevice === 'ev' && (
          <article className="device-card active-preview">
            <div className="device-card-heading">
              <div>
                <span className="device-number">04</span>
                <h3>EV Widescreen Dashboard</h3>
              </div>
              <StatusBadge tone="neutral">Interface preview</StatusBadge>
            </div>
            <div className="ev-frame">
              <div className="ev-side">
                <BrandLogo className="device-brand-mark" />
                <span>Nav</span>
                <span>HUD</span>
              </div>
              <div className="ev-main">
                <div className="device-top">
                  <span>{trip.destination}</span>
                  <small>{trip.useSimulatedOrigin ? 'Simulated Origin' : 'GPS Active'}</small>
                </div>
                <PreviewContent compact />
                <div className="ev-footer">
                  <span>Audio: Active</span>
                  <span>Safety Gate: Enforced</span>
                </div>
              </div>
            </div>
            <p className="device-explanation">
              Ultra-wide horizontal cockpit concept for center console vehicle displays.
            </p>
          </article>
        )}
      </div>

      <div className="device-disclaimer">
        <DevicesIcon size={16} />
        <span>All hardware surface views are simulated concepts demonstrating UI adaptability. No physical vehicle OBD or direct camera bus integration is claimed.</span>
      </div>
    </div>
  );
}
