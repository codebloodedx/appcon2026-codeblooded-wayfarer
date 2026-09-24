import { StatusBadge } from '../../components/StatusBadge';
import { BrandLogo } from '../../components/BrandLogo';
import { CountryBadge } from '../../components/Icons';
import type { TripPlan } from './types';

type DevicePreviewsProps = { trip: TripPlan };

function PreviewContent({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'preview-content compact-preview' : 'preview-content'}>
      <div className="mini-map"><svg viewBox="0 0 160 80" aria-hidden="true"><path d="M8 67 C35 61 38 25 70 38 S104 57 123 22 S145 14 153 8" /></svg><span>→</span></div>
      <div className="mini-guidance"><span>?</span><div><small>Recognition</small><strong>Unknown</strong></div></div>
    </div>
  );
}

export function DevicePreviews({ trip }: DevicePreviewsProps) {
  return (
    <section className="devices-view" aria-labelledby="devices-title">
      <div className="page-heading">
        <div><p className="eyebrow">One trip, adaptable surfaces</p><h1 id="devices-title">Device interface previews</h1><p>All previews reuse the same destination and safe unknown state. They do not represent connected hardware.</p></div>
        <StatusBadge tone="info">Interface previews only</StatusBadge>
      </div>

      <div className="device-grid">
        <article className="device-card">
          <div className="device-card-heading"><div><span className="device-number">01</span><h2>Phone</h2></div><StatusBadge>Interface preview</StatusBadge></div>
          <div className="phone-frame"><div className="phone-island" /><div className="device-top"><span>WayFarer</span><small><CountryBadge code={trip.destinationCountry} size="sm" /> {trip.destinationCountry === 'JP' ? 'Japan' : 'Philippines'}</small></div><PreviewContent /><div className="phone-action">Reviewed Guidance</div></div>
          <p>Primary handheld layout with large targets and a stacked map/camera summary.</p>
        </article>

        <article className="device-card">
          <div className="device-card-heading"><div><span className="device-number">02</span><h2>Dashcam</h2></div><StatusBadge>Interface preview</StatusBadge></div>
          <div className="dashcam-frame"><div className="lens" /><div className="dashcam-screen"><div className="device-top"><span>REC · preview</span><small>Not connected</small></div><PreviewContent compact /></div><div className="dashcam-buttons"><i /><i /><i /></div></div>
          <p>Glanceable camera-first treatment. A physical dashcam connection is future work.</p>
        </article>

        <article className="device-card two-wheeler-card">
          <div className="device-card-heading"><div><span className="device-number">03</span><h2>Action camera / two-wheeler</h2></div><StatusBadge tone="warning">Interface preview</StatusBadge></div>
          <div className="action-frame"><div className="action-screen"><div className="two-wheel-status"><strong>UNKNOWN SIGN</strong><span>NO GUIDANCE</span></div><div className="proximity-reminder">SIMULATED PROXIMITY REMINDER<br /><strong>Slow down · keep space</strong></div></div><div className="action-lens" /></div>
          <p>High contrast without flashing borders. The parked checklist can mention suitable footwear and protective gear without claiming universal illegality.</p>
        </article>

        <article className="device-card">
          <div className="device-card-heading"><div><span className="device-number">04</span><h2>EV display</h2></div><StatusBadge>Interface preview</StatusBadge></div>
          <div className="ev-frame"><div className="ev-side"><BrandLogo className="device-brand-mark" /><span>Trip</span><span>Signs</span></div><div className="ev-main"><div className="device-top"><span>{trip.destination}</span><small>{trip.useSimulatedOrigin ? 'Simulated location' : 'Location not resolved'}</small></div><PreviewContent compact /><div className="ev-footer"><span>Audio: off</span><span>ETA: —</span></div></div></div>
          <p>Wide-format dashboard concept. It does not imply a vehicle connection or production navigation.</p>
        </article>
      </div>

      <section className="preride-card">
        <div><p className="panel-kicker">Parked pre-ride checklist</p><h2>Before using a two-wheeler</h2></div>
        <ul><li>Wear appropriate protective gear</li><li>Choose secure, suitable footwear</li><li>Mount devices before moving</li><li>Review the route while parked</li></ul>
        <p>No universal legal claim is made about sandals or slippers. Confirm local requirements from an official, reviewed source.</p>
      </section>
    </section>
  );
}
