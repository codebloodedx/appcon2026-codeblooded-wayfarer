import { useState } from 'react';
import { CameraPanel } from './CameraPanel';

export function CameraDemo() {
  const [active, setActive] = useState(true);
  const [parked, setParked] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const add = (line: string) =>
    setLog((l) => [`${new Date().toLocaleTimeString()} ${line}`, ...l].slice(0, 12));

  return (
    <div style={{ maxWidth: 640, margin: '1rem auto', display: 'grid', gap: '0.75rem' }}>
      <label><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> active</label>
      <label><input type="checkbox" checked={parked} onChange={(e) => setParked(e.target.checked)} /> parked</label>
      <CameraPanel
        active={active}
        parked={parked}
        onSample={async (url) => {
          add(`SAMPLE ${(url.length / 1024).toFixed(0)} KB (data URL)`);
          await new Promise((r) => setTimeout(r, 4000));
        }}
        onCapture={(url) => add(`CAPTURE ${(url.length / 1024).toFixed(0)} KB (data URL)`)}
      />
      <pre style={{ fontSize: 12 }}>{log.join('\n')}</pre>
    </div>
  );
}
