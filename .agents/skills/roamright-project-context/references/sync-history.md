# Context synchronization history

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
