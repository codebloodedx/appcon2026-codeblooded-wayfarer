import { StatusBadge } from '../../components/StatusBadge';
import type { CountryCode, RuleRecord } from '../guidance/types';
import type { TripPlan } from './types';

type Props = {
  trip: TripPlan;
  currentCountry: CountryCode | null;
  locationSource: 'gps' | 'selected' | 'simulated';
  latestRule: RuleRecord | null;
};
const names: Record<CountryCode, string> = { JP: 'Japan', PH: 'Philippines' };

export function ParkedView({ trip, currentCountry, locationSource, latestRule }: Props) {
  return (
    <section className="parked-view" aria-labelledby="parked-title">
      <div className="page-heading">
        <div><p className="eyebrow">Review while stationary</p><h1 id="parked-title">Parked details</h1><p>Trip context, reviewed sources, and manual photo exploration belong here.</p></div>
        <StatusBadge tone="success">Parked view</StatusBadge>
      </div>
      <div className="parked-grid">
        <article className="detail-card route-detail">
          <p className="panel-kicker">Trip overview</p>
          <h2>{names[trip.homeCountry]} → {names[trip.destinationCountry]}</h2>
          <dl>
            <div><dt>Destination</dt><dd>{trip.destination}</dd></div>
            <div><dt>Current country</dt><dd>{currentCountry ? names[currentCountry] : 'Unsupported or unknown'}</dd></div>
            <div><dt>Location source</dt><dd>{locationSource === 'simulated' ? 'Simulated origin' : locationSource === 'gps' ? 'GPS detection' : 'Selected fallback'}</dd></div>
            <div><dt>Route</dt><dd>See the map for current route status</dd></div>
          </dl>
        </article>
        <article className="detail-card etiquette-card">
          <p className="panel-kicker">Reviewed guidance</p>
          <h2>{latestRule?.label ?? `Before driving in ${names[trip.destinationCountry]}`}</h2>
          <p>{latestRule?.explanation ?? 'No live sign has been recognized. Review official requirements and local road etiquette before driving.'}</p>
          {latestRule?.etiquette && <p>{latestRule.etiquette}</p>}
          {latestRule ? <a href={latestRule.sourceUrl} target="_blank" rel="noreferrer">Open reviewed source</a> : <div className="source-placeholder"><span aria-hidden="true">↗</span><span><strong>No source-linked recognition yet</strong><small>Only tested records can produce guidance.</small></span></div>}
        </article>
        <article className="detail-card photo-card">
          <p className="panel-kicker">Manual photo exploration</p>
          <h2>Inspect a sign while parked</h2>
          <div className="photo-drop" aria-disabled="true"><span aria-hidden="true">＋</span><strong>Capture unavailable</strong><small>The camera component has not been merged. No photo is being analyzed.</small></div>
        </article>
      </div>
    </section>
  );
}
