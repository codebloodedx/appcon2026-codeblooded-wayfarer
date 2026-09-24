# Current status

**Last inspected:** 24 September 2026, Philippine time. **Active sprint:** WayFarer MVP. **Overall health:** Integrated locally; final demo gates remain. **Deadline:** 24 September 2026, 6:00 PM Philippine time.

## Verified facts

- Foundation PR #6, navigation contract PR #7, and the original map/guidance PR #9 are merged on `main`.
- The local `integration/wayfarer-mvp` branch combines PR #8 traveler UI, PR #10 candidate rule records/assets, PR #11 live camera/capture, and Ranee's Groq/Qwen, briefing, Maps, browser-speech, and integration work. The source PR branches each had a successful GitHub `build` check when fetched.
- The product name is **WayFarer**. The browser title, UI, README, project context, and API service label use that name.
- Trip setup now leads to a pre-trip briefing. The browser check loaded three source-reviewed Japan reminders, then required **I understand — begin trip** before rendering the active map/camera screen.
- The active trip renders the map and live `CameraPanel` together. Camera frames call `/api/recognize`; parked capture/upload uses the same path. Candidate matches are displayed as candidates and remain silent. Only tested records can trigger `/api/speak` or grounded sign Q&A.
- The parked view contains manual camera capture/upload, reviewed source detail, and a grounded NLP question form. The supported-sign view shows the actual prototype sign assets and candidate/tested state. Device previews remain labeled as interface previews.
- The backend returns candidate classifications only for allowlisted same-country records. Invented and cross-country IDs remain unknown. Candidate IDs are rejected by `/api/explain` and `/api/speak`.
- Three Japan pre-trip records are source-reviewed against JAF and marked tested for briefing use: keep left, no turn on red unless a green arrow permits the direction, and seatbelt/driver-attention reminders.
- `npm install` added 204 packages with 0 reported vulnerabilities. All 7 backend tests, backend/frontend TypeScript checks, production builds, and `git diff --check` pass locally.
- Live Groq/Qwen provider checks passed with the configured seven-day key: the grounded NLP probe returned the reviewed action, and the vision model identified a rendered Japan stop asset as `jp-stop`. The integrated `/api/recognize` returned `candidate` for that asset, preserving the no-advice gate.
- Browser verification on `http://localhost:5174` confirmed meaningful setup, briefing, trip, supported-sign, and parked content with no Vite error overlay observed. Another local WayFarer checkout occupied ports 3001/5173, so this checkout was verified safely on backend 3002 and frontend 5174 through a configurable proxy.

## Remaining gates

- `VITE_GOOGLE_MAPS_API_KEY` is blank in the integration `.env`. The UI correctly shows **Map unavailable: add a restricted Google Maps browser key**. A rendered route, ETA, and next-turn card are not verified in this checkout.
- All three sign records remain `candidate`. The static provider/API test proves model connectivity and controlled recognition, but it is not the required physical live-camera acceptance test.
- Browser camera permission remained pending in the automated in-app browser. A person must grant permission in Chrome/Edge, present a physical sign, and record the supported and unknown cases.
- Because no sign is yet `tested`, the live sign alert and parked sign Q&A remain correctly gated. After acceptance, Ranee may change the successful record to `tested` and rerun speech/Q&A checks.
- The integration branch is local. It has not been pushed, opened as a PR, merged to `main`, deployed, or submitted.

## Gate recommendation

Do not claim final submission readiness yet. Add the restricted Maps key, run one physical sign plus one unknown live-camera case, promote only the successful sign, verify alert speech and parked Q&A, then commit/push the integration branch through the repository's PR review rules.
