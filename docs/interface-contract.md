# MVP interface contract — version 5

**Contract owner:** Ranee. This is the proposed integration baseline for the four independent work areas. A change requires a decision recorded in the issue and a matching update to this file before dependent code changes.

## Shared sign record

`shared/rules/rules.json` is a JSON array. John owns its contents. Each record has:

```json
{
  "id": "jp-stop",
  "modelClass": "JP_STOP",
  "semanticEquivalent": "PH_STOP",
  "countryCode": "JP",
  "normalizedCategory": "STOP",
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

Pre-trip, Reviewed Guidance, and Current Guidance use the same verified records in `shared/rules/driving-guidance.json`. An optional `briefing` object supplies the concise pre-trip category, title, message, icon, review date, why-it-matters note, exceptions, and home-country comparison copy. The parent rule supplies country, jurisdiction, required context, priority, source, and verification state. The API returns exactly three applicable essentials ordered by safety priority, cross-country misunderstanding risk, and category importance; rules that require missing vehicle or time context are withheld. Reviewed Guidance uses the full verified `/api/driving-guidance` result plus source-reviewed sign records and applies country, available-locality, category, and search filters in the parked UI.

Local restrictions such as vehicle number-coding rules must include the exact locality and must not be treated as a nationwide Philippines rule. John must verify the applicable vehicle or plate conditions, schedule, exceptions, current official source, and review date before changing the record to `tested`. If no matching tested record exists, the app says the briefing is unavailable and does not improvise one.

## Camera component (Bryan)

Export `CameraPanel` from `frontend/src/features/camera/CameraPanel.tsx` with these props:

```ts
type CameraPanelProps = {
  active: boolean;
  parked: boolean;
  onSample: (imageDataUrl: string) => Promise<void>;
  onCapture: (imageDataUrl: string) => void;
  detection?: {
    bbox: [number, number, number, number];
    label: string;
    confidence: number;
    status: 'recognized' | 'candidate';
  } | null;
  recognitionStatus?: 'waiting' | 'recognized' | 'candidate' | 'unknown' | 'error';
};
```

The component obtains permission after a user action, shows the live video, samples JPEG frames no more often than the configured interval, waits for each `onSample` call before another, and releases tracks on stop/unmount. It shows waiting, analyzing, unknown, candidate, recognized, and error states. When a valid normalized `bbox` accompanies a candidate or recognized result, it maps that box through the video's `object-fit: cover` crop and draws it over the corresponding sign. It never invents a box when the model does not return one. A rate-limited request uses the backend retry window before sampling again. `onCapture` is available only in parked mode. If camera permission is denied, the component keeps a visible disabled state and offers parked-only file upload through the same `onCapture` callback; it must not imply that an uploaded still came from live detection. Gio owns the surrounding page; Bryan owns camera internals.

## Map component (Ranee)

Export `MapPanel` from `frontend/src/features/map/MapPanel.tsx`:

```ts
type MapPanelProps = {
  countryCode: 'JP' | 'PH';
  origin: string;
  originCoordinate?: { lat: number; lng: number };
  destination: string;
  destinationCoordinate?: { lat: number; lng: number };
  originSource: 'gps' | 'selected' | 'simulated';
  avoidRestrictedZones?: boolean;
  onCountryResolved?: (countryCode: 'JP' | 'PH' | null, source: 'gps' | 'selected' | 'simulated') => void;
  onNavigationStatusChange?: (status: NavigationStatus) => void;
  onGuidanceEvent?: (event: RouteGuidanceEvent) => void;
};
```

Reuse one persistent Google map instance. Render the origin, destination, returned road polyline, distance, duration, maneuver, and route preview before driving. Navigation states are `loading`, `preview`, `driving`, `paused`, `arrived`, or `error`. In driving mode, interpolate the vehicle through the actual returned path, rotate the marker by bearing, follow it with the map camera, update remaining distance/time/ETA/progress, and provide pause, resume, end, and 1x/2x/4x controls. Clean up animation frames and map overlays on route change and unmount. A destination change while driving recalculates from the current simulated coordinate rather than returning to the original origin.

The trip setup owns user-triggered GPS and place search. `originSource: 'simulated'` must visibly say **Simulated location**. Report `gps` only after a real position resolves. A denied or unavailable GPS request remains visible and must not silently default to the Philippines. An unsupported or uncertain country yields `null` and no rule-backed driving alert. A map, autocomplete, or route failure must be visible; do not silently show a static or straight-line route as live navigation.

In the Philippines preview, `avoidRestrictedZones` may display an alternate route around a Makati example zone. Any mock zone, restriction status, or route must say **Simulation** on the map and route card. Do not label a route compliant until current official plate/day/hour rules, exceptions, boundaries, and the actual computed route have been verified. A missing safe route is an explicit unavailable state, not an invented detour.

## Guidance adapter and API (Ranee)

- `GET /api/health` → `{ "status": "ok", "service": "wayfarer-api" }` (implemented foundation).
- `GET /api/rules?countryCode=JP` → array of source-reviewed sign records for the country, including candidate/tested status.
- `GET /api/briefing?countryCode=JP&homeCountry=PH&locality=Tokyo` → a `ready` response with exactly three verified, priority-ordered essentials and the exact approved `speechText`, or `{ "status": "unavailable", ... "items": [], "speechText": null }`. Cross-country copy is selected only when `homeCountry` differs from `countryCode`. A locality-specific record is returned only for an exact case-insensitive locality match. Unverified records and rules requiring missing context are never returned.
- `GET /api/driving-guidance?countryCode=JP&locality=Tokyo` → verified short rules for that country and matching jurisdiction. Records requiring missing context are withheld. Each item carries event, priority, message, source, trigger mode, cooldown, and jurisdiction.
- `POST /api/recognize` with `{ "countryCode": "JP", "imageDataUrl": "data:image/jpeg;base64,..." }` → `recognized` for a tested record, `candidate` for a source-reviewed record still awaiting live acceptance, or `unknown`. Every response includes `debug`: detected country/name, exact `modelClass`, normalized category, confidence, normalized bounding box, closest catalog reference, separate visual and semantic similarity, shape/symbol/text/color evidence, match type, and any opposite-country equivalent. Only the ten declared classes are accepted. The backend resolves semantic meaning into the active country's record. During active driving, candidate detections remain visibly labeled but do not show or speak driving advice. Unknown and uncertain matches yield no rule. Model-generated legal wording is never spoken.
- `POST /api/explain` with `{ "countryCode": "JP", "signId": "jp-stop", "question": "..." }` → `{ "answer": "...", "sourceUrl": "..." }`. The answer is constrained to the reviewed record; unsupported questions return an uncertainty response.
- `POST /api/speak` with `{ "countryCode": "JP", "signId": "jp-stop" }` → `{ "text": "approved short alert", "engine": "browser-speech-synthesis" }`. The backend returns text only for a tested record in the selected country. The frontend passes that exact text to the browser `speechSynthesis` API and reports an unavailable state when the browser does not support it.

Backend checks required: country enum, known sign ID, image MIME/size, request limits, strict allowlist validation, and safe errors without exposing credentials. Browser calls go through the Vite `/api` proxy in development. Maps uses a restricted browser key; Vertex AI uses backend Application Default Credentials. Gemini output never supplies the legal guidance itself.

## Current Guidance and speech

Current Guidance is inactive during route preview. `MapPanel` emits structured route or simulation events only after **Start Driving**. Camera detections can trigger a CV event only while navigation is driving. The frontend selects a verified rule from `/api/driving-guidance`, shows the short message and source, and puts it in a priority speech queue. The queue prevents overlap, deduplicates an event instance, applies each rule's cooldown, and cancels speech when driving pauses, ends, or the component unmounts. Simulation events are visibly labeled.

## Trip UI (Gio)

Own the entire traveler flow in `frontend/src/features/trip/`, using the camera, map, and guidance interfaces above. Show home country, destination country, detected/fallback country status, destination, active/parked mode, latest recognized rule, source, audio status, unknown/loading/errors, route summary, and the supported-sign list. The active live-camera view also shows normalized category, match type, confidence, semantic similarity, detected country, other-country equivalent, and the strongest model evidence for the latest sampled frame. Its fixture strip follows the active country context. Show the restricted-zone toggle only with a clear live/simulated route state. Device modes are labeled **interface previews**; the two-wheeler preview may include a non-flashing high-contrast layout and a parked pre-ride checklist. A simulated proximity reminder must be labeled as such and must not claim a fixed distance. Do not hard-code a second sign rule or an unverified footwear prohibition in the UI.

Starting a trip is a two-step safety flow. The first user action calls `playTripBriefing(countryCode, locality)`, displays the returned titles/details/sources, and reads the exact approved speech text. Keep the map and camera inactive at this stage. A separate **I understand — begin trip** action starts the active map/camera session. If the briefing is unavailable or speech is unsupported, show that state visibly and still allow the user to read any available content; never synthesize missing rules in the UI.
