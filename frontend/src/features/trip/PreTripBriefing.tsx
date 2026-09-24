import { StatusBadge } from '../../components/StatusBadge';
import { speakBrowserText } from '../guidance';
import type { BriefingRecord, TripBriefing } from '../guidance/types';
import type { TripPlan } from './types';

type Props = {
  trip: TripPlan;
  briefing: TripBriefing | null;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onBrowseGuidance: () => void;
  onContinue: () => void;
};

export function PreTripBriefing({ trip, briefing, loading, error, onBack, onBrowseGuidance, onContinue }: Props) {
  const countryNames = { JP: 'Japan', PH: 'Philippines' } as const;
  const country = countryNames[trip.destinationCountry];
  const crossBorder = trip.homeCountry !== trip.destinationCountry;
  const ready = briefing?.status === 'ready';
  const priorityName = (priority: BriefingRecord['priority']) => {
    if (typeof priority === 'number') return priority === 1 ? 'CRITICAL' : priority === 2 ? 'HIGH' : 'NORMAL';
    return priority === 'INFO' ? 'NORMAL' : priority;
  };
  return (
    <main className="briefing-page">
      <section className="briefing-card" aria-labelledby="briefing-title">
        <div className="step-label"><span>02</span> Pre-trip safety briefing</div>
        <div className="briefing-heading">
          <div>
            <p className="eyebrow">Plan → Brief → Drive</p>
            <h1 id="briefing-title">{country} <span className="briefing-country-code">{trip.destinationCountry}</span></h1>
            <p>Important {crossBorder ? 'differences' : 'local rules'} before you drive.</p>
            <div className={`briefing-route-context ${crossBorder ? 'cross-border' : ''}`}>
              <span><i>{trip.homeCountry}</i> {countryNames[trip.homeCountry]}</span>
              <b aria-hidden="true">→</b>
              <span><i>{trip.destinationCountry}</i> {country}</span>
              <small>{crossBorder ? 'Cross-border comparison' : 'Same-country guidance'}</small>
            </div>
          </div>
          <StatusBadge tone={ready ? 'success' : loading ? 'info' : 'warning'}>
            {ready ? '3 important rules' : loading ? 'Loading briefing' : 'Briefing unavailable'}
          </StatusBadge>
        </div>

        {loading && <p role="status">Loading and preparing the spoken briefing…</p>}
        {error && <div className="scope-callout" role="alert"><strong>Briefing could not be played:</strong> {error}</div>}
        {briefing?.status === 'unavailable' && <div className="scope-callout"><strong>No reviewed briefing is available for this destination.</strong> Continue only after reviewing official local guidance.</div>}
        {ready && <ol className="briefing-list">
          {briefing.items.map((item) => {
            const priority = priorityName(item.priority);
            return <li key={item.id} className={`briefing-priority-${priority.toLowerCase()}`}>
              <span className="briefing-rule-icon" aria-hidden="true">{item.icon ?? '◆'}</span>
              <div className="briefing-rule-copy">
                <div><span className="briefing-priority">{priority}</span><h2>{item.title}</h2></div>
                <p>{item.details}</p>
                {item.whyItMatters && <small><strong>Why this matters:</strong> {item.whyItMatters}</small>}
                {item.exceptions && <small><strong>Exception:</strong> {item.exceptions}</small>}
              </div>
              <a href={item.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Verified source for ${item.title}`}>Source ↗</a>
            </li>;
          })}
        </ol>}

        {ready && <aside className="briefing-more">
          <div><strong>Want to review more local driving rules?</strong><p>More local rules and reviewed guidance are available in Reviewed Guidance.</p></div>
          <button className="button button-secondary" type="button" onClick={onBrowseGuidance}>Browse Reviewed Guidance</button>
        </aside>}

        <div className="briefing-actions">
          <button className="button button-secondary" type="button" onClick={onBack}>Back</button>
          {ready && <button className="button button-secondary" type="button" onClick={() => speakBrowserText(briefing.speechText, 0.92)}>Replay briefing</button>}
          <button className="button button-primary" type="button" disabled={loading} onClick={onContinue}>Review complete · Start driving</button>
        </div>
        <p className="privacy-note">The camera and map remain inactive until you continue. During the trip, WayFarer reuses these verified rules for timely guidance.</p>
      </section>
    </main>
  );
}
