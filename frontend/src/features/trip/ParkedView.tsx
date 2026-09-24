import { useState, type FormEvent } from 'react';
import { CameraIcon, CheckIcon, ExternalLinkIcon, SparklesIcon } from '../../components/Icons';
import { StatusBadge } from '../../components/StatusBadge';
import { CameraPanel } from '../camera';
import { explainRule, speakBrowserText } from '../guidance';
import type { CountryCode, RuleRecord } from '../guidance/types';
import type { TripPlan } from './types';

type Props = {
  trip: TripPlan;
  currentCountry: CountryCode | null;
  locationSource: 'gps' | 'selected' | 'simulated';
  latestRule: RuleRecord | null;
  candidateRule: RuleRecord | null;
  guidanceError: string | null;
  onCapture: (imageDataUrl: string) => void;
};

const names: Record<CountryCode, string> = { JP: 'Japan', PH: 'Philippines' };

export function ParkedView({
  trip,
  currentCountry,
  locationSource,
  latestRule,
  candidateRule,
  guidanceError,
  onCapture,
}: Props) {
  const [tab, setTab] = useState<'inspector' | 'manners' | 'checklist'>('inspector');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);

  // Pre-drive checklist state
  const [checklist, setChecklist] = useState({
    mounted: true,
    audioCheck: true,
    mirrors: false,
    belt: true,
    routeSet: true,
  });

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
    <div className="parked-container">
      {/* Segmented Tab Navigation inside the Drawer */}
      <div className="parked-tabs-nav" role="tablist" aria-label="Parked sections">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'inspector'}
          className={`parked-tab-btn ${tab === 'inspector' ? 'active' : ''}`}
          onClick={() => setTab('inspector')}
        >
          Sign Inspector & Q&A
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'manners'}
          className={`parked-tab-btn ${tab === 'manners' ? 'active' : ''}`}
          onClick={() => setTab('manners')}
        >
          {names[trip.destinationCountry]} Manners
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'checklist'}
          className={`parked-tab-btn ${tab === 'checklist' ? 'active' : ''}`}
          onClick={() => setTab('checklist')}
        >
          Safety Checklist
        </button>
      </div>

      {/* Tab 1: Sign Inspector & Manual Photo Upload */}
      {tab === 'inspector' && (
        <div className="parked-tab-pane">
          <div className="inspector-hero-card">
            <div className="hero-sign-preview">
              {detectedRule ? (
                <img
                  src={detectedRule.assetPath || `/signs/${detectedRule.id}.svg`}
                  alt={detectedRule.label}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="empty-sign-box">
                  <CameraIcon size={32} />
                  <span>No Sign Selected</span>
                </div>
              )}
            </div>

            <div className="hero-sign-info">
              <div className="hero-badge-row">
                <StatusBadge tone={latestRule ? 'success' : candidateRule ? 'warning' : 'neutral'}>
                  {latestRule ? 'Tested Record' : candidateRule ? 'Candidate (Silent)' : 'Stationary Capture'}
                </StatusBadge>
                {(trip.useSimulatedOrigin || locationSource === 'simulated') && (
                  <span className="source-note">Tokyo Demo Source</span>
                )}
              </div>
              <h3>{detectedRule?.label ?? 'Manual Sign Capture'}</h3>
              <p>
                {latestRule?.explanation ??
                  (candidateRule
                    ? 'Candidate sign recognized by Groq vision model. Grounded driving advice stays silent until verification.'
                    : 'Capture a photo of an unfamiliar road sign while parked, or upload an image from your device.')}
              </p>
              {guidanceError && <p className="field-error" role="alert">{guidanceError}</p>}
              {detectedRule && (
                <a
                  href={detectedRule.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="legal-source-link"
                >
                  <span>Official Legal Source (JAF / Authorities)</span>
                  <ExternalLinkIcon size={12} />
                </a>
              )}
            </div>
          </div>

          <div className="parked-actions-grid">
            {/* Manual Camera / File Upload Component */}
            <div className="action-card">
              <div className="action-card-header">
                <CameraIcon size={18} />
                <h4>Photo Upload / Camera Capture</h4>
              </div>
              <CameraPanel active parked onSample={async () => undefined} onCapture={onCapture} />
              <p className="helper-text">Works while parked to inspect signs with zero risk to driving safety.</p>
            </div>

            {/* Grounded NLP Question Form */}
            <div className="action-card">
              <div className="action-card-header">
                <SparklesIcon size={18} />
                <h4>Ask WayFarer About This Rule</h4>
              </div>
              <form onSubmit={(e) => void ask(e)} className="nlp-form">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={
                    latestRule
                      ? `Ask: "Can I turn right here?", "Do I need to come to a complete stop?"`
                      : 'Recognize a tested sign first to ask grounded questions.'
                  }
                  disabled={!latestRule}
                  rows={3}
                />
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={!latestRule || !question.trim() || asking}
                >
                  {asking ? 'Checking verified record…' : 'Ask Question'}
                </button>
              </form>

              {questionError && <p className="field-error">{questionError}</p>}
              {answer && (
                <div className="nlp-answer-card">
                  <div className="answer-header">
                    <SparklesIcon size={14} />
                    <strong>Verified Answer (Grounded in Law)</strong>
                  </div>
                  <p>{answer}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Road Manners & Etiquette */}
      {tab === 'manners' && (
        <div className="parked-tab-pane">
          <div className="manners-grid">
            {trip.destinationCountry === 'JP' ? (
              <>
                <div className="manner-card">
                  <div className="manner-num">01</div>
                  <div className="manner-body">
                    <h4>Keep to the Left Side of the Road</h4>
                    <p>In Japan, vehicles drive on the left side and the steering wheel is on the right. Give way to oncoming traffic when turning right.</p>
                  </div>
                </div>

                <div className="manner-card">
                  <div className="manner-num">02</div>
                  <div className="manner-body">
                    <h4>Complete 0 km/h Stop at Stop Signs (止まれ)</h4>
                    <p>You must come to a total, motionless stop behind the stop line. Rolling stops (slow rolling) are illegal and strictly fined.</p>
                  </div>
                </div>

                <div className="manner-card">
                  <div className="manner-num">03</div>
                  <div className="manner-body">
                    <h4>Mandatory Stop at Railway Crossings (踏切)</h4>
                    <p>Always come to a complete stop immediately before train tracks, open your driver window slightly to listen for bells, and check both ways.</p>
                  </div>
                </div>

                <div className="manner-card">
                  <div className="manner-num">04</div>
                  <div className="manner-body">
                    <h4>"Thank You" Hazard Flash (サンキューハザード)</h4>
                    <p>A common Japanese courtesy: flash your hazard lights 2–3 times when another driver yields to let you merge.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="manner-card">
                  <div className="manner-num">01</div>
                  <div className="manner-body">
                    <h4>Drive on the Right Side</h4>
                    <p>The Philippines drives on the right side. Be cautious of public utility jeepneys and tricycles loading on the right curb.</p>
                  </div>
                </div>

                <div className="manner-card">
                  <div className="manner-num">02</div>
                  <div className="manner-body">
                    <h4>No Right Turn on Red Unless Permitted</h4>
                    <p>Right turn on red is prohibited unless an official MMDA/LTO sign explicitly states "Right Turn on Red with Care".</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Pre-Drive Safety Checklist */}
      {tab === 'checklist' && (
        <div className="parked-tab-pane">
          <div className="checklist-container">
            <h3>Pre-Drive Departure Checklist</h3>
            <p className="muted">Ensure your cockpit and vehicle are properly prepared before shifting out of Park.</p>

            <div className="checklist-items">
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={checklist.mounted}
                  onChange={(e) => setChecklist({ ...checklist, mounted: e.target.checked })}
                />
                <span className="check-box">{checklist.mounted && <CheckIcon size={14} />}</span>
                <span className="check-text">
                  <strong>Smartphone mounted securely</strong>
                  <small>Device is placed eye-level without obstructing windshield road view.</small>
                </span>
              </label>

              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={checklist.audioCheck}
                  onChange={(e) => setChecklist({ ...checklist, audioCheck: e.target.checked })}
                />
                <span className="check-box">{checklist.audioCheck && <CheckIcon size={14} />}</span>
                <span className="check-text">
                  <strong>Audio volume audible</strong>
                  <small>Sound is clear for WayFarer voice alerts over road and engine noise.</small>
                </span>
              </label>

              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={checklist.mirrors}
                  onChange={(e) => setChecklist({ ...checklist, mirrors: e.target.checked })}
                />
                <span className="check-box">{checklist.mirrors && <CheckIcon size={14} />}</span>
                <span className="check-text">
                  <strong>Mirrors & blind spots checked</strong>
                  <small>Side and rearview mirrors adjusted for local left/right driving perspective.</small>
                </span>
              </label>

              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={checklist.belt}
                  onChange={(e) => setChecklist({ ...checklist, belt: e.target.checked })}
                />
                <span className="check-box">{checklist.belt && <CheckIcon size={14} />}</span>
                <span className="check-text">
                  <strong>Seatbelts fastened for all passengers</strong>
                  <small>Mandatory for all seats under Japan Road Traffic Act Article 71-3.</small>
                </span>
              </label>

              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={checklist.routeSet}
                  onChange={(e) => setChecklist({ ...checklist, routeSet: e.target.checked })}
                />
                <span className="check-box">{checklist.routeSet && <CheckIcon size={14} />}</span>
                <span className="check-text">
                  <strong>Destination locked before moving</strong>
                  <small>No manual phone handling while in motion.</small>
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
