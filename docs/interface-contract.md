# MVP interface contract — version 1

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

The component obtains permission after a user action, shows the live video, samples JPEG frames no more often than the configured interval, waits for each `onSample` call before another, and releases tracks on stop/unmount. `onCapture` is available only in parked mode. Gio owns the surrounding page; Bryan owns camera internals.

## Map component (Ranee)

Export `MapPanel` from `frontend/src/features/map/MapPanel.tsx`:

```ts
type MapPanelProps = {
  countryCode: 'JP' | 'PH';
  destination: string;
  demoOrigin?: { lat: number; lng: number; label: string };
};
```

If `demoOrigin` is passed, the UI must visibly say **Simulated location** and display its label. Otherwise ask browser location permission on user action. A map or route failure must be visible; do not silently show a static route as live navigation.

## Guidance adapter and API (Ranee)

- `GET /api/health` → `{ "status": "ok", "service": "roamright-api" }` (implemented foundation).
- `GET /api/rules?countryCode=JP` → array of source-reviewed sign records for the country, including candidate/tested status.
- `POST /api/recognize` with `{ "countryCode": "JP", "imageDataUrl": "data:image/jpeg;base64,..." }` → `{ "status": "recognized", "signId": "jp-stop", "rule": { ...reviewedRecord } }` or `{ "status": "unknown", "signId": null, "rule": null }`. Only known IDs from the selected country may be returned. No rule text is invented by the model.
- `POST /api/explain` with `{ "countryCode": "JP", "signId": "jp-stop", "question": "..." }` → `{ "answer": "...", "sourceUrl": "..." }`. The answer is constrained to the reviewed record; unsupported questions return an uncertainty response.
- `POST /api/speak` with `{ "countryCode": "JP", "signId": "jp-stop" }` → audio from Gemini TTS for that record's approved `shortAlert`, with an appropriate audio content type. If unavailable, return an error that UI can disclose rather than silently claiming another voice is Gemini.

Backend checks required: country enum, known sign ID, image MIME/size, request limits, and safe errors without exposing keys. Browser calls go through the Vite `/api` proxy in development. Maps and Gemini API keys are separate.

## Trip UI (Gio)

Own the entire traveler flow in `frontend/src/features/trip/`, using the camera, map, and guidance interfaces above. Show home country, destination country, destination, active/parked mode, latest recognized rule, source, audio status, unknown/loading/errors, and the supported-sign list. Device modes are labeled **interface previews**. Do not hard-code a second sign rule in the UI.
