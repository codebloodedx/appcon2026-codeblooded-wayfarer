import { useEffect, useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { listRules } from '../guidance';
import type { CountryCode, RuleRecord } from '../guidance/types';

const signAssets: Record<string, string> = {
  'jp-stop': '/signs/jp-stop.svg',
  'jp-railway': '/signs/jp-railway.svg',
  'ph-no-right-turn': '/signs/ph-no-right-turn.svg',
};

export function SupportedSignsView({ countryCode }: { countryCode: CountryCode }) {
  const [rules, setRules] = useState<RuleRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    listRules(countryCode).then((records) => { if (active) setRules(records); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Rules could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [countryCode]);
  const tested = rules.filter((rule) => rule.status === 'tested');
  const country = countryCode === 'JP' ? 'Japan' : 'Philippines';
  return (
    <section className="signs-view" aria-labelledby="signs-title">
      <div className="page-heading"><div><p className="eyebrow">Transparent prototype scope</p><h1 id="signs-title">Signs included in this prototype</h1><p>Candidate signs can be recognized for testing but remain silent. Only signs that pass the live acceptance gate may provide spoken driving guidance.</p></div><StatusBadge tone={tested.length ? 'success' : 'warning'}>{tested.length} tested · {rules.length - tested.length} candidates</StatusBadge></div>
      {loading && <p role="status">Loading sign records…</p>}
      {error && <div className="scope-callout" role="alert"><strong>Sign records unavailable:</strong> {error}</div>}
      {!loading && !error && rules.length === 0 && <div className="signs-empty"><div className="empty-sign" aria-hidden="true"><span>?</span></div><h2>No sign records for {country}</h2><p>Add source-reviewed records before testing recognition.</p></div>}
      {!loading && !error && rules.length > 0 && <div className="supported-grid">
        {rules.map((rule) => <article className="detail-card sign-record-card" key={rule.id}>
          {signAssets[rule.id] && <img src={signAssets[rule.id]} alt={`${rule.label} reference sign`} />}
          <div><p className="panel-kicker">{country} · {rule.status === 'tested' ? 'Tested' : 'Candidate'}</p><h2>{rule.label}</h2><p>{rule.status === 'tested' ? rule.shortAlert : 'Available for controlled vision testing. Spoken advice is disabled until acceptance.'}</p><a href={rule.sourceUrl} target="_blank" rel="noreferrer">Reviewed source</a><p className="muted">Reviewed {rule.reviewedOn}</p></div>
          <StatusBadge tone={rule.status === 'tested' ? 'success' : 'warning'}>{rule.status}</StatusBadge>
        </article>)}
      </div>}
      <article className="unknown-policy"><div className="unknown-icon" aria-hidden="true">?</div><div><p className="panel-kicker">Safe fallback</p><h2>Unknown signs produce no driving advice</h2><p>Unsupported, unclear, or uncertain signs stay silent. Follow posted signs and local authorities.</p></div></article>
    </section>
  );
}
