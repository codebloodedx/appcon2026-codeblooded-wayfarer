import { useEffect, useState } from 'react';

export default function App() {
  const [apiStatus, setApiStatus] = useState('Checking backend…');

  useEffect(() => {
    fetch('/api/health')
      .then((response) => {
        if (!response.ok) throw new Error('Backend unavailable');
        return response.json() as Promise<{ status: string }>;
      })
      .then((body) => setApiStatus(body.status === 'ok' ? 'Backend connected' : 'Backend unavailable'))
      .catch(() => setApiStatus('Backend unavailable'));
  }, []);

  return (
    <main className="starter">
      <p className="eyebrow">AppCon 2026 · Team 01</p>
      <h1>RoamRight</h1>
      <p>Cross-border driving rules and local manners assistant</p>
      <p className="status">{apiStatus}</p>
      <p className="note">Project foundation is running. Trip, camera, map, and guidance features are in progress.</p>
    </main>
  );
}
