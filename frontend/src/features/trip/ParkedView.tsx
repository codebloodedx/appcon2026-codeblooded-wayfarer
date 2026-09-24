import { useEffect, useMemo, useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { listDrivingGuidance, listRules } from '../guidance';
import type { CountryCode, DrivingGuidanceRule, GuidanceEvent, RuleRecord } from '../guidance/types';
import type { TripPlan } from './types';

type Props = {
  trip: TripPlan;
  navigationActive?: boolean;
  onBack?: () => void;
};

type GuidanceCard = {
  id: string;
  countryCode: CountryCode;
  category: string;
  title: string;
  summary: string;
  priority: string;
  locality: string;
  sourceUrl: string;
  details?: string;
  kind: 'guidance' | 'sign';
};

const names: Record<CountryCode, string> = { JP: 'Japan', PH: 'Philippines' };
const categoryByEvent: Record<GuidanceEvent, string> = {
  TRIP_START: 'Road rules', RAILROAD_CROSSING: 'Railroad crossings', INTERSECTION: 'Road rules',
  TRAFFIC_LIGHT: 'Traffic lights', ROUNDABOUT: 'Roundabouts', TURN: 'Turns on red',
  PEDESTRIAN_CROSSING: 'Pedestrians', COUNTRY_RULE_ZONE: 'Local exceptions',
  RESTRICTED_TIME_ZONE: 'Restricted driving times', HEADLIGHT_RULE: 'Headlights',
  STOP_SIGN: 'Road rules', ROAD_SIGN_DETECTION: 'Road signs',
};

function guidanceCard(rule: DrivingGuidanceRule): GuidanceCard {
  return {
    id: rule.id, countryCode: rule.countryCode, category: categoryByEvent[rule.event],
    title: rule.briefing?.title ?? rule.title, summary: rule.briefing?.message ?? rule.message,
    details: [rule.briefing?.whyItMatters, rule.briefing?.exceptions].filter(Boolean).join(' '),
    priority: rule.priority,
    locality: rule.jurisdiction?.type === 'country' ? names[rule.countryCode] : rule.jurisdiction?.value ?? names[rule.countryCode],
    sourceUrl: rule.sourceUrl, kind: 'guidance',
  };
}

function signCard(rule: RuleRecord): GuidanceCard {
  return {
    id: rule.id, countryCode: rule.countryCode, category: 'Road signs', title: rule.label,
    summary: rule.shortAlert, details: rule.explanation,
    priority: rule.status === 'tested' ? 'TESTED' : 'REVIEWED', locality: names[rule.countryCode],
    sourceUrl: rule.sourceUrl, kind: 'sign',
  };
}

export function ParkedView({ trip, navigationActive = false, onBack }: Props) {
  const [country, setCountry] = useState<CountryCode>(trip.destinationCountry);
  const [category, setCategory] = useState('All');
  const [locality, setLocality] = useState('All');
  const [search, setSearch] = useState('');
  const [guidance, setGuidance] = useState<DrivingGuidanceRule[]>([]);
  const [signs, setSigns] = useState<RuleRecord[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const tripLocality = trip.destination.split(',').at(-1)?.trim();

  useEffect(() => {
    let active = true;
    setLibraryLoading(true);
    setLibraryError(null);
    Promise.all([listDrivingGuidance(country, country === trip.destinationCountry ? tripLocality : undefined), listRules(country)])
      .then(([guidanceRules, signRules]) => {
        if (!active) return;
        setGuidance(guidanceRules);
        setSigns(signRules);
      })
      .catch((error) => {
        if (!active) return;
        setGuidance([]);
        setSigns([]);
        setLibraryError(error instanceof Error ? error.message : 'Reviewed guidance could not be loaded.');
      })
      .finally(() => { if (active) setLibraryLoading(false); });
    return () => { active = false; };
  }, [country, trip.destinationCountry, tripLocality]);

  const cards = useMemo(() => [...guidance.map(guidanceCard), ...signs.map(signCard)], [guidance, signs]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(cards.map((item) => item.category))).sort()], [cards]);
  const localities = useMemo(() => ['All', ...Array.from(new Set(cards.map((item) => item.locality))).sort()], [cards]);
  const filteredCards = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return cards.filter((item) => {
      if (category !== 'All' && item.category !== category) return false;
      if (locality !== 'All' && item.locality !== locality) return false;
      return !query || `${item.title} ${item.summary} ${item.details ?? ''} ${item.category} ${item.locality}`.toLocaleLowerCase().includes(query);
    });
  }, [cards, category, locality, search]);

  useEffect(() => {
    if (!categories.includes(category)) setCategory('All');
    if (!localities.includes(locality)) setLocality('All');
  }, [categories, category, localities, locality]);

  return (
    <section className="parked-view reviewed-guidance-view" aria-labelledby="reviewed-guidance-title">
      {onBack && <button className="reviewed-guidance-back" type="button" onClick={onBack}>← Back to briefing</button>}
      <div className="page-heading">
        <div><p className="eyebrow">Review while stationary</p><h1 id="reviewed-guidance-title">Reviewed Guidance</h1><p>Browse verified local driving rules and guidance before or after a trip.</p></div>
        <StatusBadge tone="success">Parked review</StatusBadge>
      </div>
      {navigationActive && <p className="parked-safety-notice" role="note">Review detailed guidance only when safely parked.</p>}

      <div className="guidance-browser-controls" aria-label="Reviewed guidance filters">
        <label><span>Country</span><select value={country} onChange={(event) => setCountry(event.target.value as CountryCode)}><option value="JP">Japan</option><option value="PH">Philippines</option></select></label>
        <label><span>Region or city</span><select value={locality} onChange={(event) => setLocality(event.target.value)}>{localities.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="guidance-search"><span>Search</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search local driving guidance…" /></label>
      </div>

      <div className="guidance-category-filter" aria-label="Guidance categories">
        {categories.map((item) => <button key={item} type="button" className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
      </div>

      {libraryLoading && <p className="guidance-library-state" role="status">Loading reviewed guidance…</p>}
      {libraryError && <p className="field-error guidance-library-state" role="alert">{libraryError}</p>}
      {!libraryLoading && !libraryError && <div className="guidance-library">
        {filteredCards.map((item) => <article className="guidance-library-card" key={`${item.kind}-${item.id}`}>
          <div><span>{item.category}</span><b className={`guidance-priority priority-${item.priority.toLocaleLowerCase()}`}>{item.priority}</b></div>
          <h2>{item.title}</h2><p>{item.summary}</p><small>{names[item.countryCode]} · {item.locality}</small>
          {item.details && <details><summary>View details</summary><p>{item.details}</p></details>}
          <a href={item.sourceUrl} target="_blank" rel="noreferrer">Reviewed source ↗</a>
        </article>)}
        {filteredCards.length === 0 && <p className="guidance-library-state">No reviewed guidance matches these filters.</p>}
      </div>}
    </section>
  );
}
