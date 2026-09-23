import { StatusBadge } from '../../components/StatusBadge';

export function SupportedSignsView() {
  return (
    <section className="signs-view" aria-labelledby="signs-title">
      <div className="page-heading">
        <div><p className="eyebrow">Transparent prototype scope</p><h1 id="signs-title">Supported signs in this prototype</h1><p>Only source-reviewed signs that pass live-camera testing may be shown as working.</p></div>
        <StatusBadge tone="warning">0 tested signs on main</StatusBadge>
      </div>

      <div className="scope-callout">
        <span aria-hidden="true">i</span>
        <div><strong>The reviewed sign set has not been merged.</strong><p>No sign is being presented as supported or working. Candidate examples in planning documents are intentionally omitted until their records, source links, images, and test status are available.</p></div>
      </div>

      <div className="signs-empty">
        <div className="empty-sign" aria-hidden="true"><span>?</span></div>
        <h2>No verified signs to display yet</h2>
        <p>When John’s reviewed data is merged, each card will show the actual sign image, country, short explanation, official source link, and demo recognition status.</p>
        <div className="sign-card-anatomy" aria-label="Expected supported sign card fields">
          <span>Sign image</span><span>Country</span><span>Short explanation</span><span>Source link</span><span>Recognition status</span>
        </div>
      </div>

      <article className="unknown-policy">
        <div className="unknown-icon" aria-hidden="true">?</div>
        <div><p className="panel-kicker">Unknown is a safe result</p><h2>Unsupported signs never produce driving advice</h2><p>If the camera sees a sign outside the tested set—or cannot identify it confidently—RoamRight returns <code>unknown</code>, stays silent, and directs the traveler to posted signs and local authorities.</p></div>
      </article>
    </section>
  );
}
