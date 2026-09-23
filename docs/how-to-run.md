# How to run and check RoamRight

## Prerequisites

- Node.js 22.12+ and npm 10+.
- A modern browser. Camera and location permissions work on `localhost` or HTTPS; the app must request permission when a session starts.
- Gemini and Google Maps keys are optional for the foundation health check. They are required for the later AI and map integration.

## Fresh clone

```text
git clone https://github.com/codebloodedx/appcon2026-team-01-temp-project-temp.git
cd appcon2026-team-01-temp-project-temp
npm install
```

Copy `.env.example` to `.env` (`copy .env.example .env` in Windows Command Prompt, `Copy-Item .env.example .env` in PowerShell, or `cp .env.example .env` on macOS/Linux). Leave keys blank for the foundation check. Never commit `.env`. When adding keys later, keep `GEMINI_API_KEY` server-side; restrict the browser Maps key by website origin.

Start both services:

```text
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The starter page should say **Backend connected**. The API health response is available at `http://localhost:3001/api/health`.

## Checks

```text
npm run check
npm run build
git diff --check
```

The build verifies TypeScript and produces ignored `dist/` folders. It does not prove the later camera/map/Gemini journey; each area must attach its own functional evidence. No test runner is configured yet, so do not report unit tests as passing.

## Common problems

- **Backend unavailable:** Check both services are running and port 3001 is free; the frontend dev server proxies `/api` to port 3001.
- **Camera or location denied:** Use `localhost` or HTTPS, inspect browser site permissions, and retry from the app's start-session action. Do not grant permission automatically.
- **Map missing:** Check the Maps key and allowed website origin; a blank key is expected in the foundation starter.
- **Gemini unavailable:** Check the backend key and API quota without printing the key. Do not expose it in frontend code or screenshots.
