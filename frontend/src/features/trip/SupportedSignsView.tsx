import { useEffect, useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { listRules } from '../guidance';
import type { CountryCode, RuleRecord } from '../guidance/types';

export function SupportedSignsView({
  countryCode,
  onClose,
}: {
  countryCode: CountryCode;
  onClose?: () => void;
}) {
  const [rules, setRules] = useState<RuleRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    listRules(countryCode)
      .then((records) => {
        if (active) setRules(records);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Rules could not be loaded.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [countryCode]);

  const tested = rules.filter((rule) => rule.status === 'tested');
  const country = countryCode === 'JP' ? 'Japan' : 'Philippines';

  return (
    <div className="drawer-overlay-container" role="dialog" aria-modal="true" aria-labelledby="signs-title">
      <div className="drawer-backdrop" onClick={onClose} />
      <section className="drawer-sheet signs-sheet">
        <div className="drawer-drag-handle" />
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Transparent Prototype Scope</p>
            <h1 id="signs-title">Supported Signs Catalog</h1>
            <p className="drawer-subtitle">
              Only source-reviewed signs that pass live-camera testing may be marked working.
            </p>
          </div>
          <div className="drawer-header-actions">
            <StatusBadge tone={tested.length ? 'success' : 'warning'}>
              {tested.length} tested in {country}
            </StatusBadge>
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

        <div className="drawer-tab-content">
          {loading && <p role="status">Loading sign records…</p>}
          {error && (
            <div className="scope-callout" role="alert">
              <strong>Sign records unavailable:</strong> {error}
            </div>
          )}
          {!loading && !error && tested.length === 0 && (
            <div className="signs-empty">
              <div className="empty-sign" aria-hidden="true">
                <span>?</span>
              </div>
              <h2>No tested signs for {country}</h2>
              <p>
                Candidate records are not driving guidance. The live camera test and reviewed source
                must be confirmed before a sign is called supported.
              </p>
            </div>
          )}
          {!loading && !error && tested.length > 0 && (
            <div className="supported-grid">
              {tested.map((rule) => (
                <article className="detail-card" key={rule.id}>
                  <p className="panel-kicker">{country} · Tested record</p>
                  <h2>{rule.label}</h2>
                  <p>{rule.shortAlert}</p>
                  <a href={rule.sourceUrl} target="_blank" rel="noreferrer">
                    Reviewed source
                  </a>
                  <p className="muted">
                    Reviewed {rule.reviewedOn}. Live camera recognition evidence must be checked
                    separately.
                  </p>
                </article>
              ))}
            </div>
          )}
          <article className="unknown-policy">
            <div className="unknown-icon" aria-hidden="true">
              ?
            </div>
            <div>
              <p className="panel-kicker">Safe fallback policy</p>
              <h2>Unknown signs produce zero driving advice</h2>
              <p>
                Unsupported, unclear, or uncertain signs stay silent. Follow posted signs and local
                authorities.
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
