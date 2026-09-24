type Props = {
  spokenGuidance: boolean;
  onSpokenGuidanceChange: (enabled: boolean) => void;
};

export function SettingsView({ spokenGuidance, onSpokenGuidanceChange }: Props) {
  return (
    <section className="routed-content-page settings-page" aria-labelledby="settings-title">
      <div className="page-heading"><div><p className="eyebrow">Preferences</p><h1 id="settings-title">Settings</h1><p>Control the guidance experience used by the current trip.</p></div></div>
      <div className="settings-list">
        <label className="settings-row"><span><strong>Spoken guidance</strong><small>Automatically read concise verified guidance while navigation is active.</small></span><input type="checkbox" checked={spokenGuidance} onChange={(event) => onSpokenGuidanceChange(event.target.checked)} /></label>
        <div className="settings-row"><span><strong>Guidance language</strong><small>English is the reviewed prototype language. Additional translated prompts remain future work.</small></span><b>English</b></div>
        <div className="settings-row"><span><strong>Camera recognition</strong><small>Camera permission and live recognition are started from Navigation or the parked sign tools.</small></span><b>On demand</b></div>
        <div className="settings-row"><span><strong>Simulation speed</strong><small>Choose 1×, 2×, or 4× from the active Navigation route panel.</small></span><b>Navigation</b></div>
      </div>
    </section>
  );
}
