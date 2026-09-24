# Current status

**Last inspected:** 24 September 2026, Philippine time. **Active sprint:** WayFarer MVP. **Overall health:** Integrated locally; final demo gates remain. **Deadline:** 24 September 2026, 6:00 PM Philippine time.

## Verified facts

- Foundation PR #6, navigation contract PR #7, and the original map/guidance PR #9 are merged on `main`.
- The local `integration/wayfarer-mvp` branch combines PR #8 traveler UI, PR #10 candidate rule records/assets, PR #11 live camera/capture, and Ranee's Groq/Qwen, briefing, Maps, browser-speech, and integration work. The source PR branches each had a successful GitHub `build` check when fetched.
- The product name is **WayFarer**. The browser title, UI, README, project context, and API service label use that name.
- A one-page entry screen now asks the judge to choose **Phone simulation** or **PC simulation**. The selected frame carries the complete existing journey, and **Change view** returns to the selector without discarding the active trip.
- Trip setup now leads to a pre-trip briefing. The browser check loaded three source-reviewed Japan reminders, then required **I understand — begin trip** before rendering the active map/camera screen.
- The active trip renders the map and live `CameraPanel` together. Camera frames call `/api/recognize`; parked capture/upload uses the same path. Candidate matches are displayed as candidates and remain silent. Only tested records can trigger `/api/speak` or grounded sign Q&A.
- The parked view contains manual camera capture/upload, reviewed source detail, and a grounded NLP question form. The supported-sign view shows the actual prototype sign assets and candidate/tested state. Device previews remain labeled as interface previews.
- The backend resolves model output by normalized category into the active country's reviewed record; a closest reference from another country cannot directly select that country's rule. Candidate IDs are rejected by `/api/explain` and `/api/speak`.
- Three Japan pre-trip records are source-reviewed against JAF and marked tested for briefing use: keep left, no turn on red unless a green arrow permits the direction, and seatbelt/driver-attention reminders.
- `npm install` added 204 packages with 0 reported vulnerabilities. All 7 backend tests, backend/frontend TypeScript checks, the production build, and `git diff --check` pass locally.
- Recognition now classifies a normalized sign meaning before resolving a country record. The API returns separate visual/semantic scores, model evidence, closest reference, equivalent sign, and match type in the live camera view.
- The live camera test set includes 5 Japan-specific and 5 Philippines-specific categories plus 6 cross-country equivalent pairs. The catalog contains 24 candidate records, including the two original demo categories, plus generated fixtures. Parked details owns manual capture/upload, source details, and grounded questions.
- Controlled provider probes passed for the Japan Slow fixture (`SLOW`, 95% confidence, 98% visual similarity, 100% semantic similarity) and the differently designed Japan/Philippines Stop examples, which normalized to the same category. These probes do not replace physical live-camera acceptance.
- The active Trip camera now exposes the semantic result for each sampled live frame: normalized category, match type, confidence, semantic similarity, detected country, other-country equivalent, and visual/OCR evidence. A live test-target strip shows five country-specific and six shared fixtures for the active country; changing the trip switches the country context and target set.
- Live Groq/Qwen provider checks passed with the configured seven-day key: the grounded NLP probe returned the reviewed action, and the vision model identified a rendered Japan stop asset as `jp-stop`. The integrated `/api/recognize` returned `candidate` for that asset, preserving the no-advice gate.
- A restricted Google Maps browser key is configured in the ignored local `.env`. The route implementation uses Maps JavaScript and Routes, validates the returned endpoint against local Japan/Philippines bounds, and does not require the separately restricted Geocoding API.
- Browser verification on `http://localhost:5173` confirmed the landing page, PC journey, phone frame, Google map, Tokyo Station-to-Shibuya route, ETA, distance, and next instruction. The verified route returned 26 minutes, 7.7 km, and **Head south** at the time of the check; those live values can change.

## Remaining gates

- All sign records remain `candidate`. Static provider/API tests and fixture probes prove controlled model behavior only; they are not the required physical live-camera acceptance test. The live-camera matrix rows have not yet been executed and recorded.
- Browser camera permission remained pending in the automated in-app browser. A person must grant permission in Chrome/Edge, present a physical sign, and record the supported and unknown cases.
- Because no sign is yet `tested`, the live sign alert and parked sign Q&A remain correctly gated. After acceptance, Ranee may change the successful record to `tested` and rerun speech/Q&A checks.
- Deployment and event submission evidence have not been recorded.

## Gate recommendation

Do not claim final submission readiness yet. Run one physical sign plus one unknown live-camera case, promote only the successful sign, then verify alert speech and parked Q&A before deployment and submission.
