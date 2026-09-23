import { useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import type { CountryCode, RuleRecord } from '../guidance/types';
import type { TripPlan } from './types';

type Props = {
  trip: TripPlan;
  currentCountry: CountryCode | null;
  locationSource: 'gps' | 'selected' | 'simulated';
  latestRule: RuleRecord | null;
  onClose?: () => void;
};

const names: Record<CountryCode, string> = { JP: 'Japan', PH: 'Philippines' };

export function ParkedView({ trip, currentCountry, locationSource, latestRule, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'sign' | 'etiquette' | 'checklist'>('sign');

  return (
    <div className="drawer-overlay-container" role="dialog" aria-modal="true" aria-labelledby="parked-title">
      <div className="drawer-backdrop" onClick={onClose} />
      <section className="drawer-sheet parked-sheet">
        <div className="drawer-drag-handle" />

        <div className="drawer-header">
          <div>
            <p className="eyebrow">Stationary Vehicle Safe Mode</p>
            <h1 id="parked-title">Parked Details & Guide</h1>
            <p className="drawer-subtitle">
              Trip context, reviewed law sources, road manners, and manual sign inspection.
            </p>
          </div>
          <div className="drawer-header-actions">
            <StatusBadge tone="success">Parked Safe</StatusBadge>
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

        {/* Segmented Tab Controls */}
        <div className="drawer-segmented-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sign'}
            className={`tab-btn ${activeTab === 'sign' ? 'active' : ''}`}
            onClick={() => setActiveTab('sign')}
          >
            🔍 Sign Inspector
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'etiquette'}
            className={`tab-btn ${activeTab === 'etiquette' ? 'active' : ''}`}
            onClick={() => setActiveTab('etiquette')}
          >
            🗾 Road Manners & Laws
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'checklist'}
            className={`tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('checklist')}
          >
            📋 Pre-Drive Checklist
          </button>
        </div>

        {/* Tab 1: Sign Inspector & Upload */}
        {activeTab === 'sign' && (
          <div className="drawer-tab-content">
            <div className="parked-grid">
              <article className="detail-card etiquette-card">
                <p className="panel-kicker">Active Traffic Rule Record</p>
                <h2>{latestRule?.label ?? `Driving Regulations in ${names[trip.destinationCountry]}`}</h2>
                <p>
                  {latestRule?.explanation ??
                    `No active road sign has been sampled yet. When stationary, you can review official regulations or upload a captured road sign photo below.`}
                </p>
                {latestRule?.etiquette && <p className="etiquette-quote">💡 {latestRule.etiquette}</p>}
                {latestRule ? (
                  <a
                    href={latestRule.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button button-secondary compact"
                  >
                    ↗ Open Reviewed Official Source
                  </a>
                ) : (
                  <div className="source-placeholder">
                    <span aria-hidden="true">↗</span>
                    <span>
                      <strong>Verified Primary Sources</strong>
                      <small>Cites official Japan Automobile Federation (JAF) & LTO manuals.</small>
                    </span>
                  </div>
                )}
              </article>

              <article className="detail-card photo-card">
                <p className="panel-kicker">Manual Sign Photo Exploration</p>
                <h2>Inspect a Sign While Parked</h2>
                <div className="photo-drop" aria-disabled="true">
                  <span aria-hidden="true">📷</span>
                  <strong>Capture / Upload Sign Photo</strong>
                  <small>Upload photo of unfamiliar road signs to inspect official rules.</small>
                </div>
              </article>

              <article className="detail-card route-detail">
                <p className="panel-kicker">Active Journey State</p>
                <h2>{names[trip.homeCountry]} → {names[trip.destinationCountry]}</h2>
                <dl>
                  <div><dt>Destination</dt><dd>{trip.destination}</dd></div>
                  <div><dt>Current Country</dt><dd>{currentCountry ? names[currentCountry] : 'Unsupported'}</dd></div>
                  <div><dt>Location Mode</dt><dd>{locationSource === 'simulated' ? 'Simulated Origin' : locationSource === 'gps' ? 'Live GPS' : 'Selected Fallback'}</dd></div>
                </dl>
              </article>
            </div>
          </div>
        )}

        {/* Tab 2: Road Manners & Etiquette */}
        {activeTab === 'etiquette' && (
          <div className="drawer-tab-content">
            <div className="manners-grid">
              <article className="manner-card">
                <span className="manner-icon">🚗↔️</span>
                <div>
                  <strong>Left-Hand Traffic (Drive on the Left)</strong>
                  <p>In Japan, vehicles drive on the left side of the road. Keep left; pass on the right. Pedestrians always have absolute right-of-way on pedestrian crossings.</p>
                </div>
              </article>

              <article className="manner-card">
                <span className="manner-icon">🛑⚠️</span>
                <div>
                  <strong>Mandatory Stop (0 km/h)</strong>
                  <p>Inverted triangle signs (止まれ) strictly mandate a complete dead stop before the stop line, or before the intersection if no line exists.</p>
                </div>
              </article>

              <article className="manner-card">
                <span className="manner-icon">🚆🚦</span>
                <div>
                  <strong>Train Level Crossings</strong>
                  <p>Under Japan Traffic Act Art. 33, vehicles must stop before railway crossings even if gates are open, unless equipped with an active traffic light.</p>
                </div>
              </article>

              <article className="manner-card">
                <span className="manner-icon">🙏✨</span>
                <div>
                  <strong>Hazard Light Courtesy (Thank-you flash)</strong>
                  <p>Drivers in Japan briefly flash their hazard lights 1-2 times as a polite gesture of gratitude when another car gives way or lets them merge.</p>
                </div>
              </article>
            </div>
          </div>
        )}

        {/* Tab 3: Pre-Trip Safety & Gear Checklist */}
        {activeTab === 'checklist' && (
          <div className="drawer-tab-content">
            <section className="preride-card in-drawer">
              <div>
                <p className="panel-kicker">Pre-Departure Safety Checklist</p>
                <h2>Ready Before You Drive</h2>
                <p className="muted">Ensure all requirements are prepared while parked.</p>
              </div>
              <ul className="interactive-checklist">
                <li><input type="checkbox" defaultChecked /> Mount smartphone / navigation device securely</li>
                <li><input type="checkbox" defaultChecked /> Verify headlights and turn signal operation</li>
                <li><input type="checkbox" /> Insert ETC highway toll card (if taking expressway)</li>
                <li><input type="checkbox" defaultChecked /> Wear seatbelt / safety protective gear</li>
                <li><input type="checkbox" defaultChecked /> Choose secure closed-toe footwear (for riders)</li>
              </ul>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
