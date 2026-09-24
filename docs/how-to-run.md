# How to run and check WayFarer

## Prerequisites

- Node.js 22.12+ and npm 10+.
- A modern browser. Camera and location permissions work on `localhost` or HTTPS; the app must request permission when a session starts.
- Groq and Google Maps keys are optional for the health check. Groq is required for recognition and generated explanations; Maps is required for routes. Browser speech synthesis needs no API key.

## Fresh clone

```text
git clone https://github.com/codebloodedx/appcon2026-team-01-temp-project-temp.git
cd appcon2026-team-01-temp-project-temp
npm install
```

Copy `.env.example` to `.env` (`copy .env.example .env` in Windows Command Prompt, `Copy-Item .env.example .env` in PowerShell, or `cp .env.example .env` on macOS/Linux). Leave keys blank for the foundation check. Never commit `.env`. When adding keys later, keep `GROQ_API_KEY` server-side; restrict the browser Maps key by website origin.

Start both services:

```text
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The API health response is available at `http://localhost:3001/api/health`.

The backend reads reviewed records from `shared/rules/rules.json`. Recognition returns `unknown` until that file contains a matching record marked `tested`. A `candidate` record can appear in the supported-sign list but cannot produce driving guidance.

Create a Groq API key and set `GROQ_API_KEY` locally. The default vision and text model is `qwen/qwen3.8-27b`; confirm the model is still available on the Groq account before the demo. Enable **Maps JavaScript API** and **Routes API** for the Maps project. Restrict `VITE_GOOGLE_MAPS_API_KEY` to the judging site and localhost origins. The Groq key stays on the backend.

## Checks

```text
npm test
npm run check
npm run build
git diff --check
```

The automated API tests verify input validation, tested-record gating, cross-country isolation, unknown fallback, source return, and browser-speech text lookup. They use a fake model and do not prove live Groq, Maps, camera, or speech behavior. Each area must still attach functional evidence from the integrated demo.

### Live Groq NLP and vision smoke test

With `GROQ_API_KEY` configured in the root `.env`, verify the text provider without printing the key:

```powershell
npm.cmd run test:live -w backend
```

To send a real local sign image through the configured vision model:

```powershell
npm.cmd run test:live -w backend -- --image "C:\path\to\jp-stop.jpg" --country JP --id jp-stop --label "Stop (止まれ)"
```

Use `--country PH --id ph-stop --label "Stop"` for a Philippine stop-sign test. The script accepts JPEG, PNG, or WebP files up to 1.5 MB. `Vision provider: PASS` means the request completed; `Expected sign match: YES` is the recognition result needed for that controlled image. This smoke test uses an explicitly labeled temporary test record and does not establish legal accuracy or supported-sign status. The integrated MVP still requires John's reviewed record and Bryan's live camera evidence.

## Common problems

- **Backend unavailable:** Check both services are running and port 3001 is free; the frontend dev server proxies `/api` to port 3001.
- **Camera or location denied:** Use `localhost` or HTTPS, inspect browser site permissions, and retry from the app's start-session action. Do not grant permission automatically.
- **Map missing:** Check the Maps key and allowed website origin; a blank key is expected in the foundation starter.
- **Groq unavailable:** Check the backend key, active model and account limits without printing the key. A `429` response should activate the visibly labeled tested-sign demo fallback instead of inventing a result.
- **No spoken alert:** Confirm the browser supports `speechSynthesis` and that the alert was triggered after a user interaction. The backend returns approved text; the browser produces the voice.
