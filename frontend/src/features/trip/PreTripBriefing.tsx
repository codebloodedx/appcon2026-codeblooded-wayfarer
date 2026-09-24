import { StatusBadge } from '../../components/StatusBadge';
import { speakBrowserText } from '../guidance';
import type { TripBriefing } from '../guidance/types';
import type { TripPlan } from './types';

type Props = {
  trip: TripPlan;
  briefing: TripBriefing | null;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onContinue: () => void;
};

export function PreTripBriefing({ trip, briefing, loading, error, onBack, onContinue }: Props) {
  const country = trip.destinationCountry === 'JP' ? 'Japan' : 'the Philippines';
  const ready = briefing?.status === 'ready';
  return (
    <main className="briefing-page">
      <section className="briefing-card" aria-labelledby="briefing-title">
        <div className="step-label"><span>02</span> Pre-trip safety briefing</div>
        <div className="briefing-heading">
          <div>
            <p className="eyebrow">Before driving in {country}</p>
            <h1 id="briefing-title">Listen now. Drive with less uncertainty.</h1>
            <p>WayFarer reads a short set of reviewed destination rules before activating the camera and route.</p>
          </div>
          <StatusBadge tone={ready ? 'success' : loading ? 'info' : 'warning'}>
            {ready ? `${briefing.items.length} reviewed reminders` : loading ? 'Loading briefing' : 'Briefing unavailable'}
          </StatusBadge>
        </div>

        {loading && <p role="status">Loading and preparing the spoken briefing…</p>}
        {error && <div className="scope-callout" role="alert"><strong>Briefing could not be played:</strong> {error}</div>}
        {briefing?.status === 'unavailable' && <div className="scope-callout"><strong>No reviewed briefing is available for this destination.</strong> Continue only after reviewing official local guidance.</div>}
        {ready && <ol className="briefing-list">
          {briefing.items.map((item) => <li key={item.id}>
            <div><span>{String(item.priority).padStart(2, '0')}</span><h2>{item.title}</h2></div>
            <p>{item.details}</p>
            <a href={item.sourceUrl} target="_blank" rel="noreferrer">Reviewed source</a>
          </li>)}
        </ol>}

        <div className="briefing-actions">
          <button className="button button-secondary" type="button" onClick={onBack}>Back</button>
          {ready && <button className="button button-secondary" type="button" onClick={() => speakBrowserText(briefing.speechText, 0.92)}>Replay briefing</button>}
          <button className="button button-primary" type="button" disabled={loading} onClick={onContinue}>I understand — begin trip</button>
        </div>
        <p className="privacy-note">The camera and map remain inactive until you continue. WayFarer supplements official signs and local authorities.</p>
      </section>
    </main>
  );
}
