# RoamRight integration checklist

This checklist separates implemented modules from evidence captured in the final stationary demonstration.

## Before combining member work

- [x] `/api/rules`, `/api/recognize`, `/api/explain`, and `/api/speak` match interface contract version 2.
- [x] Recognition accepts only `JP` or `PH`, approved image formats, and tested rule IDs from the resolved country.
- [x] Candidate, invented, unsupported-country, and unclear results produce no rule-backed alert.
- [x] `MapPanel` exposes the locked props, labels simulated or fallback location, and shows route errors.
- [x] The Philippines restriction option is visibly labeled **Simulation** and makes no compliance claim.
- [x] Frontend guidance functions expose rule listing, recognition, explanation, and Gemini audio playback.
- [ ] John's reviewed `shared/rules/rules.json` and source document are merged.
- [ ] Bryan's `CameraPanel` is merged and supplies valid JPEG samples.
- [ ] Gio's trip UI is merged and imports the camera, map, and guidance modules.

## Stationary demo evidence

- [ ] Start the session from a user action and grant camera, location, and audio permissions.
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
