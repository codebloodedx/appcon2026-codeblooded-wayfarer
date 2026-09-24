# MVP interface contract — version 4

**Contract owner:** Ranee. This is the proposed integration baseline for the four independent work areas. A change requires a decision recorded in the issue and a matching update to this file before dependent code changes.

## Shared sign record

`shared/rules/rules.json` is a JSON array. John owns its contents. Each record has:

```json
{
  "id": "jp-stop",
  "countryCode": "JP",
  "label": "Stop (止まれ)",
  "shortAlert": "Stop at this sign and check for traffic before proceeding.",
  "explanation": "Full source-reviewed text, including conditions and exceptions.",
  "conditions": [],
  "exceptions": [],
  "sourceUrl": "https://english.jaf.or.jp/driving-in-japan/traffic-rules",
  "reviewedOn": "2026-09-23",
  "status": "candidate"
}
```

`status` is `candidate` or `tested`. Only a record with a valid source, correct country, and a passed live-camera test can be shown as supported. The example wording above is a **schema illustration**, not an approved alert.

## Local restriction evidence (John)

`shared/rules/restrictions.json` may hold a reviewed Philippines restricted-zone example. Each record must identify its country/locality, affected vehicle/plate conditions, days and hours, exceptions, current official source URL, review date, and the source of any zone boundary. Mark it `candidate` until every field is checked. A mock boundary or route belongs to Ranee's map demo data and is separately marked `simulation`; it must never be presented as an official restriction boundary. If the current rule or boundary cannot be verified, the toggle remains a **simulated route preview**.

## Pre-trip briefing evidence (John)

`shared/rules/briefings.json` is a JSON array of the most important reviewed rules and etiquette reminders to present before driving. A record has `id`, `countryCode`, optional exact `locality`, `category` (`law` or `etiquette`), integer `priority`, `title`, `spokenText`, `details`, `sourceUrl`, `reviewedOn`, and `status` (`candidate` or `tested`). Only `tested` records may be returned or spoken. The API returns at most three reminders, ordered by priority.

Local restrictions such as vehicle number-coding rules must include the exact locality and must not be treated as a nationwide Philippines rule. John must verify the applicable vehicle or plate conditions, schedule, exceptions, current official source, and review date before changing the record to `tested`. If no matching tested record exists, the app says the briefing is unavailable and does not improvise one.

## Camera component (Bryan)

Export `CameraPanel` from `frontend/src/features/camera/CameraPanel.tsx` with these props:

```ts
type CameraPanelProps = {
  active: boolean;
  parked: boolean;
  onSample: (imageDataUrl: string) => Promise<void>;
  onCapture: (imageDataUrl: string) => void;
};
```

The component obtains permission after a user action, shows the live video, samples JPEG frames no more often than the configured interval, waits for each `onSample` call before another, and releases tracks on stop/unmount. `onCapture` is available only in parked mode. If camera permission is denied, the component keeps a visible disabled state and offers parked-only file upload through the same `onCapture` callback; it must not imply that an uploaded still came from live detection. Gio owns the surrounding page; Bryan owns camera internals.

## Map component (Ranee)

Export `MapPanel` from `frontend/src/features/map/MapPanel.tsx`:

```ts
type MapPanelProps = {
  countryCode: 'JP' | 'PH';
  destination: string;
  demoOrigin?: { lat: number; lng: number; label: string };
  avoidRestrictedZones?: boolean;
  onCountryResolved?: (countryCode: 'JP' | 'PH' | null, source: 'gps' | 'selected' | 'simulated') => void;
};
```

Render an interactive map, route line, next-turn card, and ETA when the route service supplies them. If `demoOrigin` is passed, the UI must visibly say **Simulated location** and display its label; this overrides physical GPS only for the stationary demo. Otherwise ask browser location permission on user action and resolve the current country. If denied, report `source: 'selected'`, label the country as **Selected fallback**, and do not claim a detected crossing. An unsupported or uncertain country yields `null` and no rule-backed driving alert. A map or route failure must be visible; do not silently show a static route as live navigation.

In the Philippines preview, `avoidRestrictedZones` may display an alternate route around a Makati example zone. Any mock zone, restriction status, or route must say **Simulation** on the map and route card. Do not label a route compliant until current official plate/day/hour rules, exceptions, boundaries, and the actual computed route have been verified. A missing safe route is an explicit unavailable state, not an invented detour.

## Guidance adapter and API (Ranee)

- `GET /api/health` → `{ "status": "ok", "service": "wayfarer-api" }` (implemented foundation).
- `GET /api/rules?countryCode=JP` → array of source-reviewed sign records for the country, including candidate/tested status.
- `GET /api/briefing?countryCode=JP&locality=Tokyo` → a `ready` response with at most three tested, priority-ordered records and the exact approved `speechText`, or `{ "status": "unavailable", ... "items": [], "speechText": null }`. A locality-specific record is returned only for an exact case-insensitive locality match. Candidate records are never returned.
- `POST /api/recognize` with `{ "countryCode": "JP", "imageDataUrl": "data:image/jpeg;base64,..." }` → `recognized` for a tested record, `candidate` for a source-reviewed record still awaiting live acceptance, or `unknown`. Every response includes `debug`: detected country/name, normalized category, confidence, closest catalog reference, separate visual and semantic similarity, shape/symbol/text/color evidence, match type, and any opposite-country equivalent. The model classifies meaning against the full catalog; the backend then resolves only the active country's reviewed record. Candidate results remain silent and expose no driving instruction.
- `POST /api/compare` with `first` and `second` image/country objects → both recognition traces plus `EXACT_MATCH`, `SEMANTIC_MATCH`, `RELATED`, or `NO_MATCH` and a boolean `semanticMatch`. Identical pixels are never required for a semantic match.
- `GET /api/recognition-tests` → the controlled country-specific and cross-country test catalog used by the parked Recognition Lab.
- `POST /api/explain` with `{ "countryCode": "JP", "signId": "jp-stop", "question": "..." }` → `{ "answer": "...", "sourceUrl": "..." }`. The answer is constrained to the reviewed record; unsupported questions return an uncertainty response.
- `POST /api/speak` with `{ "countryCode": "JP", "signId": "jp-stop" }` → `{ "text": "approved short alert", "engine": "browser-speech-synthesis" }`. The backend returns text only for a tested record in the selected country. The frontend passes that exact text to the browser `speechSynthesis` API and reports an unavailable state when the browser does not support it.

Backend checks required: country enum, known sign ID, image MIME/size, request limits, strict allowlist validation, and safe errors without exposing keys. Browser calls go through the Vite `/api` proxy in development. Maps and Groq API keys are separate. Groq/Qwen output never supplies the legal guidance itself.

## Trip UI (Gio)

Own the entire traveler flow in `frontend/src/features/trip/`, using the camera, map, and guidance interfaces above. Show home country, destination country, detected/fallback country status, destination, active/parked mode, latest recognized rule, source, audio status, unknown/loading/errors, route summary, and the supported-sign list. The active live-camera view also shows normalized category, match type, confidence, semantic similarity, detected country, other-country equivalent, and the strongest model evidence for the latest sampled frame. Its fixture strip follows the active country context. Show the restricted-zone toggle only with a clear live/simulated route state. Device modes are labeled **interface previews**; the two-wheeler preview may include a non-flashing high-contrast layout and a parked pre-ride checklist. A simulated proximity reminder must be labeled as such and must not claim a fixed distance. Do not hard-code a second sign rule or an unverified footwear prohibition in the UI.

Starting a trip is a two-step safety flow. The first user action calls `playTripBriefing(countryCode, locality)`, displays the returned titles/details/sources, and reads the exact approved speech text. Keep the map and camera inactive at this stage. A separate **I understand — begin trip** action starts the active map/camera session. If the briefing is unavailable or speech is unsupported, show that state visibly and still allow the user to read any available content; never synthesize missing rules in the UI.
