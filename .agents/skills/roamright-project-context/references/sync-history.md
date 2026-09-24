# Context synchronization history

## 2026-09-24 — Difference-based pre-trip briefing

- Trigger: Ranee requested a short, safety-first briefing that adapts to home and destination countries and reuses Current Guidance rules.
- Unified pre-trip and in-drive copy in `shared/rules/driving-guidance.json` through optional verified `briefing` metadata.
- `GET /api/briefing` now accepts `homeCountry`, preserves exact locality and required-context filtering, and returns up to seven priority-sorted essentials.
- The traveler UI shows six compact cards per supported country with icons, priority, comparison context, exceptions, sources, and a direct Start driving action.
- Automated acceptance covers PH to JP, JP to PH, and same-country behavior.

## Initial bounded setup audit

- Baseline commit: `03c0c3c` on `main`.
- Target: local `setup/roamright-foundation` working tree; final commit not yet recorded.
- Date: 23 September 2026, Philippine time.
- Evidence: cloned repository tree, issues #1–#5, absent branch ruleset, linked Google proposal, user decisions on scope and ownership.
- Guidance added: `AGENTS.md`, repo-local context skill, scope, architecture/contracts, team areas, run guide, status and dashboard.
- Still unverified: merged setup, actual build/CI, enforced branch rules, keys, and working MVP features.

After the foundation is merged, record the merged commit and inspect material diffs before promoting any status claim. Do not update context automatically on every code edit.

## Proposal navigation sync

- Trigger: Ranee explicitly asked to integrate Ash's suggestions in the linked proposal.
- Baseline: foundation PR #6 at `687d04c`, still unmerged when this edit began.
- Changed guidance: country detection/fallback; route line/next turn/ETA target; a clearly simulated PH restricted-zone alternative; simulated proximity preview; parked rider check and high-contrast two-wheeler preview.
- Accuracy boundary: current Makati restriction details and universal footwear illegality are not verified. No live route compliance, fixed-distance alert, or physical HUD claim is approved by this context update.
- Actual implementation and integrated test evidence: not verified.

## Merged foundation correction

- During this sync, GitHub showed PR #6 had merged at `cd86247` while the scope commit was pushed to its former branch. The contract update was moved onto a new branch from current `main` so it can be reviewed separately.
- Foundation CI and the local navigation-branch type check/build passed. Navigation changes and feature behavior remain unmerged/unverified.

## Groq and browser-speech migration checkpoint

- Trigger: Ranee explicitly approved replacing the blocked Gemini setup and asked for the free NLP/vision stack to be integrated.
- Evidence: the configured Gemini key reached the API but `gemini-2.5-flash` returned an obsolete-model `404`; the recommended replacement returned depleted-prepay `402`. The Maps JavaScript key returned an authorized script for the allowed localhost referrer.
- Local architecture change: replace `@google/genai` with `groq-sdk`; use `qwen/qwen3.8-27b` for allowlisted sign recognition and reviewed-record NLP; return tested `shortAlert` text from `/api/speak`; let the browser synthesize speech.
- Safety boundary retained: model output identifies only allowlisted tested IDs and never supplies the legal rule. Country mismatch, low confidence, unsupported and provider-limited cases yield no invented guidance.
- Live provider update: a seven-day key is stored only in ignored local `.env` files. An exact-response NLP probe and the actual recognition class with a generated nonpersonal image passed against `qwen/qwen3.8-27b`.
- Still unverified: physical supported-sign accuracy, rendered route, browser speech in the integrated traveler UI, member packages, and stationary demo evidence.

## Pre-trip briefing contract checkpoint

- Trigger: Ranee requested that the assistant automatically speak important rules and etiquette before driving, including locality-sensitive restrictions such as number coding.
- Local architecture change: add a tested-record-only briefing repository and `GET /api/briefing`; add frontend retrieval and browser-speech functions; require exact locality matching and cap the briefing at three priority-ordered reminders.
- UI contract: the first Start trip action presents and speaks the briefing; a separate acknowledgment starts the live map/camera session.
- Safety boundary: candidate, wrong-country, and wrong-locality records are not returned. Missing data yields an unavailable state instead of model-generated legal guidance.
- Evidence: six backend tests, backend/frontend TypeScript checks, and production builds pass locally.
- Still unverified: John's real briefing records, Gio's briefing/acknowledgment interface, browser audio in the integrated journey, and submission evidence.

## WayFarer local integration checkpoint

- Trigger: Ranee confirmed the WayFarer product name and explicitly requested integration of the traveler UI, NLP, computer vision, camera, rules, and pre-trip briefing.
- Combined locally: PR #8 traveler UI, PR #10 rule candidates/assets, PR #11 camera/capture, and Ranee's Groq/Qwen, Maps, voice, and briefing work on `integration/wayfarer-mvp`.
- Runtime behavior: setup → three-item sourced briefing → acknowledgment → combined map/camera; live or parked frames call recognition; candidate matches are visible but silent; tested matches can unlock speech and parked grounded Q&A.
- Evidence: 204 packages with zero reported audit vulnerabilities; seven backend tests, TypeScript checks, production builds, and diff check pass; live NLP and static Japan-stop vision pass; integrated API returns `candidate`; browser setup, briefing, active trip, signs, and parked views render.
- Remaining: Maps key is blank in this checkout, real browser camera permission/physical sign evidence is absent, no sign is tested, and the branch is not pushed, reviewed, merged, deployed, or submitted.

## Navigation simulation checkpoint

- Trigger: Ranee requested a functional Google Maps-style route simulation using PR #12 as a mobile interaction reference while preserving WayFarer's visual system and live camera workflow.
- Local branch: `feature/navigation-simulation` from merged `main` at `c6ffcc0`; changes remain uncommitted at this checkpoint.
- Implemented: separate From/To place search, explicit GPS/manual/demo-origin states, actual Google route geometry, route preview, smooth interpolated marker and bearing, follow camera, remaining metrics, 1x/2x/4x controls, pause/resume/end, reroute from current simulated position, arrival/restart, camera PiP, sign-alert HUD, fixed bottom navigation, and retained-map bottom sheets.

## 2026-09-24 - PR #15 visual integration checkpoint

- Trigger: Ranee approved combining PR #15's UI with her newer functional navigation and assistant work while retaining her features.
- Integration: preserved the phone/PC landing, From/To search, Start Driving state, route interpolation, 50-60 km/h vehicle speed, playback controls, camera tracking, Gemini recognition, concise speech, briefing, and reviewed rules. Adopted PR #15's branding, icon library, fixed phone hardware, Google Maps-style cockpit, bottom navigation, bottom-sheet drawer, responsive styles, manifest, and app icons.
- Safety fixes: removed the duplicate older guidance hook, kept country-specific sources, restricted service-worker registration to production, and made navigation documents network-first to prevent stale local UI.
- Evidence: 26 tests, TypeScript checks, production build, diff check, phone and desktop setup renders, bottom-sheet guidance, and an active Tokyo route at 50 km/h passed locally.
- State: committed locally on `integration/pr15-ui`; not pushed or merged to `main`. Physical-camera and trained-model evidence remain open.

## 2026-09-24 - Repository-wide PR integration audit

- Already present: merged PRs #6, #7, #8, #9, #10, #11, and #13 are verified ancestors of the integration branch.
- Added: PR #14's reusable render error boundary and PR #16's one-screen landing plus transparent brand symbol.
- Retained over PR #16: the newer Trip Setup with From/To Places suggestions, explicit origin state, GPS fallback, judging origin, and route coordinates.
- Corrected: PR #16's `JSX.Element` compile failure now uses `ReactElement`.
- Reference only: PR #12 says not to merge. Its accepted map-first, PiP, HUD, bottom-nav, and bottom-sheet patterns are represented by the PR #15 integration.
- State: all applicable PR work is represented locally on `integration/pr15-ui`; no push or merge to `main` has occurred.
- Evidence: ten automated tests, TypeScript checks, production build, and diff check pass. Browser checks covered National University Manila to SM Mall of Asia, mid-drive reroute to Rizal Park, and Tokyo Station to Shibuya through arrival and restart.
- Boundary: Google supplies the route path and current traffic estimate; marker travel and elapsed trip are accelerated stationary simulations. Browser camera permission and physical sign recognition remain manual acceptance gates.

## Ten-class recognition and Current Guidance checkpoint

- Trigger: Ranee requested exactly five Japan and five Philippines visual classes, transfer-learning preparation, semantic normalization, and concise verified driving guidance that starts only after Start Driving.
- Implemented locally: ten-class manifests and API allowlists; model-class/bounding-box recognition output; semantic equivalents; structured driving-rule endpoint; country/jurisdiction/context filtering; simulated route events; Current Guidance HUD; automatic priority speech queue, deduplication, and cooldown; YOLO11 dataset audit, train, and held-out validation scripts.
- Evidence: 13 automated tests, TypeScript checks, Vite/backend production build, Python script compilation, empty browser error log, exact 5+5 live API count, and a Japan route run through trip start, intersection, red-light, railroad-crossing, and arrival.
- Boundary: the inspected licensed datasets still require export and relabeling, the Philippines Stop class needs licensed photos, no YOLO weights or held-out model result exists, and all ten CV records remain candidates pending physical-camera evidence.

## Live detection overlay and quota diagnosis

- Trigger: Ranee reported that the live camera showed no detection and requested a square around a detected sign.
- Cause reproduced: a real Japan Stop request reached `/api/recognize`, but the configured Groq account returned HTTP 429. Camera capture was not the failing boundary.
- Implemented locally: higher-resolution 960px samples, visible waiting/analyzing/unknown/error states, aspect-correct normalized bounding boxes over the live video, a local translation tracker between cloud samples, amber candidate and green tested styling, provider retry backoff, and automatic concise speech for both tested and visibly labeled candidate detections during active driving.
- Boundary: a box appears only when the recognizer returns a valid class and bbox. Groq quota or a trained local detector is still required for actual live detections.

## Gemini on Vertex AI provider checkpoint

- Trigger: Ranee asked to replace the rate-limited provider with Gemini for both computer vision and NLP and confirmed use of the Google Cloud trial setup.
- Implemented locally: `@google/genai` in Vertex mode, backend-only Application Default Credentials, Gemini Flash image classification, Gemini Flash-Lite reviewed-record explanations, the unchanged ten-class/semantic API contract, and the existing local tracking, verified-rule, browser-speech, and provider-backoff boundaries.
- Configuration: `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `GOOGLE_GENAI_USE_VERTEXAI`, `GEMINI_VISION_MODEL`, and `GEMINI_TEXT_MODEL`; no Gemini credential is exposed to the browser bundle.
- Evidence: Google Cloud CLI 586.0.0 installed; CLI and ADC authentication configured; Vertex AI API enabled; grounded NLP passed; the controlled Japan Stop image returned `JP_STOP`, normalized `STOP`, `0.95` confidence, and `EXACT_MATCH` through the real `/api/recognize` endpoint; 17 automated tests, TypeScript checks, and production build pass.
- Open gate: physical-camera evidence with unseen signs and an unknown control is not complete. The historical Groq evidence above remains history rather than current provider status.

## Three-rule briefing and Reviewed Guidance checkpoint

- Trigger: Ranee requested a faster pre-trip experience with only three rules and renamed the parked information area to Reviewed Guidance.
- Implemented locally: briefing selection now returns exactly three essentials ranked by safety priority, cross-country misunderstanding risk, and category importance; the pre-trip CTA opens the destination-filtered Reviewed Guidance library without activating navigation.
- Reviewed Guidance: country, available-locality, category, and search filters; source-linked rule and sign cards, prior sign review, and manual parked capture remain available. Active navigation shows a parked-use notice. Trip Context and the Grounded Assistant were removed from this page by Ranee's follow-up decision.
- Evidence: 25 automated tests, TypeScript checks, production build, and diff check pass.
- Boundary: physical-camera acceptance, commit/PR review, deployment, and submission remain open.
