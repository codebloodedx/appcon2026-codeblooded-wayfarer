import { useState, type FormEvent } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { CameraPanel } from '../camera';
import { explainRule, speakBrowserText } from '../guidance';
import type { CountryCode, RuleRecord } from '../guidance/types';
import type { TripPlan } from './types';

type Props = { trip: TripPlan; currentCountry: CountryCode | null; locationSource: 'gps' | 'selected' | 'simulated'; latestRule: RuleRecord | null; candidateRule: RuleRecord | null; guidanceError: string | null; onCapture: (imageDataUrl: string) => void };
const names: Record<CountryCode, string> = { JP: 'Japan', PH: 'Philippines' };

export function ParkedView({ trip, currentCountry, locationSource, latestRule, candidateRule, guidanceError, onCapture }: Props) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const detectedRule = latestRule ?? candidateRule;

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!latestRule || !currentCountry || !question.trim()) return;
    setAsking(true);
    setQuestionError(null);
    try {
      const result = await explainRule(currentCountry, latestRule.id, question.trim());
      setAnswer(result.answer);
      speakBrowserText(result.answer);
    } catch (error) {
      setQuestionError(error instanceof Error ? error.message : 'The assistant could not answer.');
    } finally {
      setAsking(false);
    }
  }

  return (
    <section className="parked-view" aria-labelledby="parked-title">
      <div className="page-heading"><div><p className="eyebrow">Review while stationary</p><h1 id="parked-title">Parked details</h1><p>Capture a sign, inspect its reviewed source, and ask a grounded question.</p></div><StatusBadge tone="success">Parked view</StatusBadge></div>
      <div className="parked-grid">
        <article className="detail-card route-detail"><p className="panel-kicker">Trip overview</p><h2>{names[trip.homeCountry]} → {names[trip.destinationCountry]}</h2><dl><div><dt>Destination</dt><dd>{trip.destination}</dd></div><div><dt>Current country</dt><dd>{currentCountry ? names[currentCountry] : 'Unsupported or unknown'}</dd></div><div><dt>Location source</dt><dd>{locationSource === 'simulated' ? 'Simulated origin' : locationSource === 'gps' ? 'GPS detection' : 'Selected fallback'}</dd></div><div><dt>Route</dt><dd>See the map for current route status</dd></div></dl></article>
        <article className="detail-card etiquette-card"><p className="panel-kicker">Reviewed guidance</p><h2>{detectedRule?.label ?? `Before driving in ${names[trip.destinationCountry]}`}</h2><p>{latestRule?.explanation ?? (candidateRule ? 'The model recognized this candidate sign, but it cannot provide driving advice until the acceptance test is complete.' : 'No live sign has been recognized. Review official requirements and local road etiquette before driving.')}</p>{latestRule?.etiquette && <p>{latestRule.etiquette}</p>}{detectedRule ? <a href={detectedRule.sourceUrl} target="_blank" rel="noreferrer">Open reviewed source</a> : <div className="source-placeholder"><span aria-hidden="true">↗</span><span><strong>No source-linked recognition yet</strong><small>Only tested records can produce guidance.</small></span></div>}{guidanceError && <p className="field-error" role="alert">{guidanceError}</p>}</article>
        <article className="detail-card photo-card"><p className="panel-kicker">Manual photo exploration</p><h2>Inspect a sign while parked</h2><CameraPanel active parked onSample={async () => undefined} onCapture={onCapture} /><p className="muted">Capture or upload a sign while stationary. Candidate matches remain silent.</p></article>
        <article className="detail-card assistant-card"><p className="panel-kicker">Grounded NLP assistant</p><h2>Ask about the recognized rule</h2><form onSubmit={(event) => void ask(event)}><label className="field-label" htmlFor="rule-question">Your question</label><textarea id="rule-question" value={question} maxLength={300} onChange={(event) => setQuestion(event.target.value)} placeholder="What should I do at this sign?" disabled={!latestRule} /><button className="button button-primary" type="submit" disabled={!latestRule || !question.trim() || asking}>{asking ? 'Checking reviewed record…' : 'Ask WayFarer'}</button></form>{!latestRule && <p className="muted">A tested sign must be recognized before the assistant can answer.</p>}{questionError && <p className="field-error" role="alert">{questionError}</p>}{answer && <div className="assistant-answer" aria-live="polite"><strong>WayFarer</strong><p>{answer}</p></div>}</article>
      </div>
    </section>
  );
}
