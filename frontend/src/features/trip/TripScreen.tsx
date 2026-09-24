import { useEffect, useMemo, useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { CameraPanel } from '../camera';
import { listRules } from '../guidance';
import type { CountryCode, RecognitionDebug, RuleRecord } from '../guidance/types';
import { MapPanel } from '../map';
import type { TripPlan } from './types';

type Props = {
  trip: TripPlan;
  currentCountry: CountryCode | null;
  locationSource: 'gps' | 'selected' | 'simulated';
  latestRule: RuleRecord | null;
  candidateRule: RuleRecord | null;
  recognitionDebug: RecognitionDebug | null;
  guidanceError: string | null;
  audioStatus: string;
  onCountryResolved: (country: CountryCode | null, source: 'gps' | 'selected' | 'simulated') => void;
  onRecognize: (imageDataUrl: string) => Promise<void>;
  onPark: () => void;
};
const names: Record<CountryCode, string> = { JP: 'Japan', PH: 'Philippines' };
const demoOrigins = {
  JP: { lat: 35.6812, lng: 139.7671, label: 'Tokyo Station' },
  PH: { lat: 14.5547, lng: 121.0244, label: 'Makati City' },
};

export function TripScreen({ trip, currentCountry, locationSource, latestRule, candidateRule, recognitionDebug, guidanceError, audioStatus, onCountryResolved, onRecognize, onPark }: Props) {
  const [avoidZones, setAvoidZones] = useState(false);
  const [testRules, setTestRules] = useState<RuleRecord[]>([]);
  const demoOrigin = trip.useSimulatedOrigin ? demoOrigins[trip.destinationCountry] : undefined;
  const showZonePreview = trip.destinationCountry === 'PH';
  const detectedRule = latestRule ?? candidateRule;
  useEffect(() => {
    const countryCode = currentCountry ?? trip.destinationCountry;
    let active = true;
    listRules(countryCode).then((records) => { if (active) setTestRules(records); }).catch(() => { if (active) setTestRules([]); });
    return () => { active = false; };
  }, [currentCountry, trip.destinationCountry]);
  const cameraTargets = useMemo(() => {
    const specific = testRules.filter((rule) => rule.countrySpecific).slice(0, 5);
    const equivalents = testRules.filter((rule) => !rule.countrySpecific && rule.assetPath.includes('/test/')).slice(0, 6);
    return [...specific, ...equivalents];
  }, [testRules]);
  return (
    <section className="trip-view" aria-labelledby="trip-heading">
      <div className="trip-heading-row"><div><p className="eyebrow">Stationary judging view</p><h1 id="trip-heading">Your route in {names[trip.destinationCountry]}</h1><p className="muted">The map and live camera stay together. Run the demonstration while stationary.</p></div><button className="button button-dark" type="button" onClick={onPark}>Parked details <span aria-hidden="true">→</span></button></div>
      <div className="trip-status-strip" aria-label="Trip status"><div><span className="flag-tile" aria-hidden="true">{currentCountry === 'PH' ? '🇵🇭' : currentCountry === 'JP' ? '🇯🇵' : '🌐'}</span><span><small>Current country</small><strong>{currentCountry ? names[currentCountry] : 'Unsupported location'}</strong></span></div><div><span className="source-icon" aria-hidden="true">⌖</span><span><small>Location source</small><strong>{locationSource === 'simulated' ? `Simulated · ${demoOrigin?.label}` : locationSource === 'gps' ? 'Detected by GPS' : 'Selected fallback · GPS not resolved'}</strong></span></div><StatusBadge tone="warning">{locationSource === 'simulated' ? 'Simulated location' : locationSource === 'gps' ? 'GPS location' : 'Selected fallback'}</StatusBadge></div>
      <div className="judging-grid">
        <article className="panel map-panel" aria-label="Destination route"><MapPanel countryCode={trip.destinationCountry} destination={trip.destination} demoOrigin={demoOrigin} avoidRestrictedZones={showZonePreview && avoidZones} onCountryResolved={onCountryResolved} /></article>
        <article className="panel camera-panel" aria-labelledby="camera-title"><div className="panel-header dark-header"><div><p className="panel-kicker">Camera</p><h2 id="camera-title">Live road sign view</h2></div><span className="camera-online">User controlled</span></div><CameraPanel active parked={false} onSample={onRecognize} onCapture={() => undefined} /><div className="recognition-strip" aria-live="polite"><span className="pulse-dot" aria-hidden="true" /><div><small>Live recognition</small><strong>{guidanceError ? 'Service unavailable' : latestRule ? latestRule.label : candidateRule ? `${candidateRule.label} · candidate` : 'Scanning · no supported sign'}</strong></div><StatusBadge tone={guidanceError ? 'danger' : latestRule ? 'success' : candidateRule ? 'warning' : 'neutral'}>{guidanceError ? 'Error' : latestRule ? 'Reviewed rule' : candidateRule ? 'Silent candidate' : 'Safe fallback'}</StatusBadge></div>{recognitionDebug && <div className="live-semantic-trace" aria-label="Live recognition explanation"><div><small>Category</small><strong>{recognitionDebug.normalizedCategory ?? 'UNKNOWN'}</strong></div><div><small>Match</small><strong>{recognitionDebug.matchType}</strong></div><div><small>Confidence</small><strong>{Math.round(recognitionDebug.confidence * 100)}%</strong></div><div><small>Semantic</small><strong>{Math.round(recognitionDebug.semanticSimilarity * 100)}%</strong></div><div><small>Detected country</small><strong>{recognitionDebug.detectedCountry ? names[recognitionDebug.detectedCountry] : 'Unknown'}</strong></div><div><small>Equivalent</small><strong>{recognitionDebug.equivalentSign ? `${names[recognitionDebug.equivalentSign.countryCode]} · ${recognitionDebug.equivalentSign.label}` : 'None in catalog'}</strong></div><p><b>Why:</b> {recognitionDebug.evidence.symbol || recognitionDebug.evidence.text || recognitionDebug.evidence.shape || 'No reliable visual evidence returned.'}</p></div>}</article>
      </div>
      <article className="live-test-guide" aria-labelledby="live-test-title"><div><p className="panel-kicker">Live camera test set · {names[currentCountry ?? trip.destinationCountry]}</p><h2 id="live-test-title">Hold one of these signs in front of the camera</h2><p>The camera samples a frame every 2.5 seconds. Use a printed sign or second screen while stationary; the expected normalized category is shown below each reference.</p></div><div className="live-test-targets">{cameraTargets.map((rule) => <a key={rule.id} href={rule.assetPath} target="_blank" rel="noreferrer" title={`Open ${rule.label} test fixture`}><img src={rule.assetPath} alt={`${rule.label} live-camera test target`} /><span>{rule.label}<code>{rule.normalizedCategory}</code></span></a>)}</div><p className="live-test-note">To test the other country, edit the trip and choose that destination so the live country context and reviewed rule record change together.</p></article>
      <div className="driving-grid"><article className="guidance-card"><div className="guidance-icon" aria-hidden="true">{latestRule ? '!' : candidateRule ? '⌁' : '?'}</div><div><div className="guidance-title"><p className="panel-kicker">Current guidance</p><StatusBadge tone={candidateRule ? 'warning' : 'neutral'}>{latestRule ? 'Source reviewed and tested' : candidateRule ? 'Candidate recognition' : 'No sign detected'}</StatusBadge></div><h2>{detectedRule?.label ?? 'No verified sign recognized'}</h2><p>{guidanceError ?? latestRule?.shortAlert ?? (candidateRule ? 'The vision model matched a candidate sign. WayFarer stays silent until the live test and source review gate are accepted.' : 'Follow posted signs and local authorities. Unknown and unsupported signs produce no driving advice.')}</p>{detectedRule && <a href={detectedRule.sourceUrl} target="_blank" rel="noreferrer">View reviewed source</a>}</div><div className="audio-status" aria-label="Audio status"><span aria-hidden="true">◖))</span><span><small>Audio</small><strong>{audioStatus}</strong></span></div></article>{showZonePreview && <article className="restricted-card"><div><p className="panel-kicker">Philippines route preview</p><h2>Restricted zone simulation</h2><p>The map can label a simulated avoidance preview. It does not calculate or verify a compliant alternate route.</p></div><label className="switch" aria-label="Show restricted zone simulation"><input type="checkbox" checked={avoidZones} onChange={(event) => setAvoidZones(event.target.checked)} /><span /></label><div className="verification-row"><StatusBadge tone="warning">Simulation only</StatusBadge><StatusBadge tone="warning">No compliant route claim</StatusBadge></div></article>}</div>
      <p className="safety-banner"><strong>Before you move:</strong> Set your destination and review details while parked. This MVP does not provide production navigation or safety-critical guidance.</p>
    </section>
  );
}
