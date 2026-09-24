import type { IncomingMessage, ServerResponse } from 'node:http';
import app from '../backend/src/app.js';

const apiPaths = new Set(['health', 'rules', 'briefing', 'driving-guidance', 'recognize', 'explain', 'speak']);

export default function handler(request: IncomingMessage, response: ServerResponse) {
  const url = new URL(request.url || '/', 'http://localhost');
  const path = url.searchParams.get('wayfarerPath');
  if (!path || !apiPaths.has(path)) {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Unknown API route' }));
    return;
  }

  url.searchParams.delete('wayfarerPath');
  request.url = `/api/${path}${url.search}`;
  app(request, response);
}
