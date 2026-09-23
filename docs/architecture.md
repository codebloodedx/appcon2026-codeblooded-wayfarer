# Architecture and ownership map

```text
frontend/src/features/trip/       Gio: complete traveler experience
frontend/src/features/camera/     Bryan: browser camera and parked capture
frontend/src/features/map/        Ranee: map, country lookup, route and restriction preview
frontend/src/features/guidance/   Ranee: frontend AI API/audio adapter
frontend/src/components/          Gio: reusable presentation components
backend/src/                      Ranee: Gemini classification, rule lookup, NLP/TTS API
shared/rules/                     John: reviewed sign/rule and restriction records
frontend/public/signs/            John: sign assets with provenance
docs/rule-sources.md              John: official rule evidence
docs/test-matrix.md, evidence/    John: actual test evidence
```

The shared contract lives in [interface-contract.md](interface-contract.md). Read it before implementing an import or response shape; change it only after Ranee records the decision. Until modules are implemented, these paths are planned ownership boundaries, not evidence that a feature exists.

## Data flow

```text
Browser camera (live) → Bryan's frame callback → Ranee's guidance adapter
  → backend Gemini sign classification → strict supported-ID validation
  → John's source-reviewed rule record → brief UI alert and Gemini speech

Browser location or labeled demo location → Ranee's map adapter → resolved country and route line/next turn/ETA
Optional PH restriction toggle → Ranee's route preview → verified or explicitly simulated avoidance state
User parked photo or denied-camera file upload → Bryan's capture callback → guidance adapter → reviewed explanation/source
```

The camera view is live; recognition uses sampled frames and may have latency. The map does not prove a live road-condition feed or legally compliant rerouting. Country source, simulated origin, and mocked restrictions are visible in the interface. Detailed interaction belongs in parked mode. Fixed-distance GPS reminders, a pre-ride gear checklist, and a two-wheeler high-contrast HUD are either labeled stationary previews or future work until tested. Do not claim a universal slipper/sandal prohibition or flashing HUD safety benefit without evidence.

## Integration rules

- Gemini identifies a candidate sign; the reviewed record supplies the traffic rule. Validate sign IDs and country before alerting.
- Keep `GEMINI_API_KEY` on the backend. The browser Maps key is restricted by origin. Never commit either key.
- Do not claim connected dashcams, vehicles, smartwatches, or construction data based on device previews or mock markers.
- Every boundary has a sample response in the interface contract, allowing independent work. Members do not change another member's directory to bypass a mismatch.
