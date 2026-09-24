# WayFarer integration checklist

This checklist separates implemented modules from evidence captured in the final stationary demonstration.

## Before combining member work

- [x] `/api/rules`, `/api/briefing`, `/api/recognize`, `/api/explain`, and `/api/speak` match interface contract version 4.
- [x] Recognition accepts only `JP` or `PH`, approved image formats, and reviewed allowlisted IDs from the resolved country.
- [x] Candidate matches are visibly labeled but silent; invented, unsupported-country, and unclear results remain unknown.
- [x] `MapPanel` exposes the locked props, labels simulated or fallback location, and shows route errors.
- [x] The Philippines restriction option is visibly labeled **Simulation** and makes no compliance claim.
- [x] Frontend guidance functions expose rule listing, recognition, explanation, and browser speech playback.
- [x] The briefing adapter returns and speaks only tested country/locality-matched records, with an unavailable fallback.
- [x] Three source-reviewed Japan reminders are present in `shared/rules/briefings.json` and load through the briefing API.
- [x] John's reviewed candidate `shared/rules/rules.json`, sources, test matrix, and sign assets are combined locally.
- [x] Bryan's `CameraPanel` is combined locally and wired to live sampling and parked capture/upload.
- [x] Gio's traveler UI is combined locally and imports the camera, map, briefing, and guidance modules.

## Stationary demo evidence

- [ ] Start the session from a user action and grant camera and location permissions; trigger browser speech from that user-started session.
- [x] Browser check confirms Start trip loads three reviewed reminders before a separate acknowledgment activates map and camera; the speech call completed without a UI error.
- [ ] Keep the live camera and destination map visible together.
- [ ] Confirm a visibly labeled simulated Japan origin, route line, ETA, and next-turn card.
- [ ] Present one tested physical sign and confirm the returned country, rule, source, and one spoken alert.
- [ ] Present an unsupported scene and confirm `unknown` with no spoken driving guidance.
- [ ] Confirm parked capture can show the reviewed explanation and source.
- [ ] Confirm a repeated sign does not create overlapping or duplicate audio.
- [ ] Confirm camera denial leaves the map and parked upload available.
- [ ] Capture screenshots or a short recording and record the browser, sign, result, and limitations.

## Submission claims

- [ ] Label mock construction, restricted-zone, proximity, and device screens as simulations or interface previews.
- [ ] Do not claim broad country coverage, live road-condition feeds, physical device connections, or active-road safety validation.
- [ ] Record the exact commands and live checks that passed on final `main`.
