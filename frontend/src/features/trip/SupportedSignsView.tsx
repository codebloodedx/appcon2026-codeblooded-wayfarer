import { useEffect, useState } from 'react';
import { ExternalLinkIcon, SearchIcon, ShieldCheckIcon } from '../../components/Icons';
import { StatusBadge } from '../../components/StatusBadge';
import { listRules } from '../guidance';
import type { CountryCode, RuleRecord } from '../guidance/types';

export function SupportedSignsView({ countryCode }: { countryCode: CountryCode }) {
  const [activeCountry, setActiveCountry] = useState<CountryCode>(countryCode);
  const [filter, setFilter] = useState<'all' | 'tested' | 'candidate'>('all');
  const [search, setSearch] = useState('');
  const [rules, setRules] = useState<RuleRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    listRules(activeCountry)
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
  }, [activeCountry]);

  const testedCount = rules.filter((rule) => rule.status === 'tested').length;
  const candidateCount = rules.filter((rule) => rule.status === 'candidate').length;

  const filteredRules = rules.filter((rule) => {
    if (filter === 'tested' && rule.status !== 'tested') return false;
    if (filter === 'candidate' && rule.status !== 'candidate') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        rule.label.toLowerCase().includes(q) ||
        rule.meaning.toLowerCase().includes(q) ||
        rule.normalizedCategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="signs-catalog-container">
      {/* Top Filter Bar */}
      <div className="catalog-header-bar">
        <div className="catalog-country-tabs" role="tablist">
          <button
            type="button"
            className={`catalog-tab ${activeCountry === 'JP' ? 'active' : ''}`}
            onClick={() => setActiveCountry('JP')}
          >
            Japan ({activeCountry === 'JP' ? rules.length : 11})
          </button>
          <button
            type="button"
            className={`catalog-tab ${activeCountry === 'PH' ? 'active' : ''}`}
            onClick={() => setActiveCountry('PH')}
          >
            Philippines ({activeCountry === 'PH' ? rules.length : 11})
          </button>
        </div>

        <div className="catalog-status-pills">
          <button
            type="button"
            className={`status-filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({rules.length})
          </button>
          <button
            type="button"
            className={`status-filter-pill ${filter === 'tested' ? 'active' : ''}`}
            onClick={() => setFilter('tested')}
          >
            Tested ({testedCount})
          </button>
          <button
            type="button"
            className={`status-filter-pill ${filter === 'candidate' ? 'active' : ''}`}
            onClick={() => setFilter('candidate')}
          >
            Candidates ({candidateCount})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="catalog-search-wrap">
        <SearchIcon size={16} />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter signs by name, category, or meaning…"
        />
      </div>

      {loading && <p className="loading-state">Loading verified sign records…</p>}
      {error && <div className="field-error">{error}</div>}

      {!loading && !error && filteredRules.length === 0 && (
        <div className="signs-empty-state">
          <p>No matching signs found for this filter.</p>
        </div>
      )}

      {/* Signs Grid */}
      <div className="signs-card-grid">
        {filteredRules.map((rule) => {
          const isTested = rule.status === 'tested';
          return (
            <article key={rule.id} className="catalog-sign-card">
              <div className="catalog-sign-asset">
                <img src={rule.assetPath} alt={rule.label} />
              </div>

              <div className="catalog-sign-info">
                <div className="catalog-sign-header">
                  <span className="sign-category-tag">
                    {rule.countrySpecific ? 'Country-specific' : rule.normalizedCategory.replace(/_/g, ' ')}
                  </span>
                  <StatusBadge tone={isTested ? 'success' : 'warning'}>
                    {isTested ? 'Tested' : 'Candidate'}
                  </StatusBadge>
                </div>

                <h4>{rule.label}</h4>
                <p className="sign-meaning">{rule.meaning}</p>

                <div className="sign-card-footer">
                  <a
                    href={rule.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="source-cite-link"
                  >
                    <span>Official Source</span>
                    <ExternalLinkIcon size={12} />
                  </a>
                  <small className="reviewed-date">Rev: {rule.reviewedOn}</small>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Zero Hallucination Safety Policy Callout */}
      <div className="safety-policy-banner">
        <div className="policy-icon-col">
          <ShieldCheckIcon size={24} />
        </div>
        <div className="policy-text-col">
          <strong>Zero Hallucination Policy</strong>
          <p>
            WayFarer never invents traffic instructions. Unknown, unsupported, or uncertain signs stay completely silent. Spoken guidance is only generated from verified legal source records.
          </p>
        </div>
      </div>
    </div>
  );
}
