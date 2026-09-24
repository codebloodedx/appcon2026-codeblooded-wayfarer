# Current status

**Last inspected:** 24 September 2026, Philippine time. **Branch:** `integration/pr15-ui`. **Overall health:** PR #15's visual system is integrated with the working navigation and structured Current Guidance; trained ten-class CV evidence and physical-camera acceptance remain open.

## Verified locally

- WayFarer keeps the existing landing, phone/PC simulation, trip setup, three-rule pre-trip briefing, Google route, live camera PiP, searchable Reviewed Guidance, supported signs, and device previews.
- PR #15's WayFarer branding, SVG navigation, fixed phone hardware, full-screen cockpit styling, and reusable bottom-sheet drawers are integrated without replacing the current route, camera, Gemini, speech, briefing, or rule behavior. The service worker registers only in production and uses network-first navigation updates.
- PR #14's reusable React error boundary now protects the application from a blank-screen render failure. PR #16's one-screen interface chooser and transparent WayFarer symbol are integrated; its failing `JSX.Element` type was replaced with the React 19-compatible `ReactElement` type, while the newer functional Trip Setup was retained.
- PR #12 remains an explicitly labeled design-reference-only PR. Its full-screen map, floating controls, camera PiP, fixed navigation, and retained-map drawer concepts are represented by the later PR #15 integration. PRs #6-#11 and #13 are already ancestors of this branch through `main`.
- Google Maps returns the actual route geometry. The stationary simulator interpolates a branded vehicle marker along that path, follows it, updates distance/time/ETA/progress, supports pause/resume/end and 1x/2x/4x speed, reroutes from the simulated position, and reaches a clean trip-complete state.
- The recognition contract is limited to exactly five Japan classes and five Philippines classes. The API reports model class, semantic category, normalized bounding box, confidence, visual/semantic similarity, match type, closest reference, and opposite-country equivalent.
- `data/sign_classes.json`, `shared/rules/rules.json`, `shared/rules/recognition-tests.json`, TypeScript allowlists, and `ml/wayfarer-signs.yaml` use the same ten classes. An automated test checks five classes per country and reciprocal semantic mappings. The 30 km/h Japan and 50 km/h Philippines signs are intentionally `RELATED`, so one value can never replace the other.
- The backend now uses Gemini on Vertex AI to classify sampled whole camera frames and to answer parked questions from reviewed records. During active driving, a recognized or candidate class automatically speaks its concise source-reviewed meaning. Candidate status stays visible, and unknown signs remain silent.
- The live camera now shows its sampling/API state and draws a green tested or amber candidate bounding box from the returned normalized `bbox`. Box coordinates account for the crop created by `object-fit: cover`; a model response without a box does not create a fake location.
- `ml/` provides a YOLO11n transfer-learning path, fixed ten-class config, dataset audit, restrained augmentations, and a held-out per-object validation matrix. The audit rejects missing split coverage, invalid boxes, insufficient unique images, and byte-identical cross-split leakage.
- Current Guidance uses verified structured rules. It is inactive during route preview and activates only after **Start Driving**. Route events are visibly labeled simulated; CV events are separate.
- Guidance is short, country-specific, priority ordered, deduplicated, cooled down, and read automatically through browser speech synthesis without overlap. Pausing or ending navigation cancels queued speech.
- The guidance repository withholds unverified records, wrong-country records, local rules outside their exact locality, and rules whose required context is missing.
- Browser verification on `http://localhost:5173` confirmed the Japan Tokyo Station to Shibuya route preview remained silent, **Start Driving** spoke “Keep left while driving in Japan,” and later simulated events displayed/spoke the intersection, red-light, and railroad-crossing prompts. The camera PiP and map remained visible. The trip reached the completion state. Browser error logs were empty.
- The running API returned exactly five JP and five PH sign records, plus six verified guidance events for each country. No Japanese rule appeared in the Philippines response.
- The former Groq provider was removed after its quota blocked live recognition. Google Cloud CLI and ADC are configured, Vertex AI is enabled, grounded Gemini NLP passed, and the real `/api/recognize` path classified the controlled Japan Stop image as `JP_STOP`/`STOP` with `0.95` confidence and `EXACT_MATCH`.
- The detection box uses the cloud result only to establish the class and initial location. A browser-side grayscale motion tracker then updates the box about ten times per second between cloud samples; it does not classify signs.
- `npm test`: 26/26 pass, including navigation interpolation, 50-60 km/h cruise behavior, normalized box/crop mapping, briefing selection, and rate-limit response tests.
- `npm run check`: backend and frontend pass.
- `npm run build`: backend and Vite production build pass.
- `python -m py_compile ml/audit_dataset.py ml/train_yolo.py ml/validate_yolo.py`: pass.
- The refreshed prototype rendered without browser console errors after the tracking and speech changes.

## Open evidence gates

- No Roboflow dataset export is present in this checkout. Four Japanese categories require exact-class manual relabeling because the inspected Japanese dataset uses broad labels. The inspected Philippines dataset supplies four selected exact labels but no Stop label, so licensed PH Stop photographs are still required.
- Ultralytics and training data are not installed/downloaded here. No YOLO weights have been trained, and no held-out YOLO matrix has been run. Do not claim custom-model accuracy yet.
- All ten sign records remain `candidate`. A person must grant browser camera permission, present unseen physical examples plus an unknown control, and record the results before any sign can become `tested` and speak while driving.
- Live cloud recognition depends on Vertex AI model availability, eligible billing, and quota. Authentication and API enablement pass locally; physical live-camera detection still needs manual evidence with unseen signs and an unknown control.
- The functional checkpoint and PR #15 UI integration are committed locally on `integration/pr15-ui`. They have not been pushed, merged into `main`, deployed, or submitted.

## Next gate

Record physical-camera positive and unknown controls. In parallel, export/relabel licensed data, add PH Stop photographs, and run the YOLO audit/training/held-out matrix. Promote only classes whose evidence passes.
