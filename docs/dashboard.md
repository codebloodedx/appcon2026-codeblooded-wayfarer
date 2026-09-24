# RoamRight MVP dashboard

**Snapshot:** 24 September 2026, Philippine time. **Deadline:** 24 September 2026, 6:00 PM Philippine time. **Health:** At risk. **Active goal:** integrate one complete, source-checked live sign journey.

| Area | Owner | Status | Evidence now | Dependency on `main` | Next action |
| --- | --- | --- | --- | --- | --- |
| Foundation, AI, Maps, voice, integration | Ranee | Provider migration and live provider probes passed locally | PR #6 and #7 merged. `mvp/ranee-guidance-map` has Groq/Qwen APIs, browser speech, map/guidance adapters, tests and build checks. Live NLP and image requests passed with the short-lived local key | Reviewed rules, camera, trip UI and real sign evidence | Integrate member PRs, then run one reviewed physical sign and unknown case |
| Traveler UI | Gio | Planned | Issue #2 assigned; code not verified | Locked contract and scaffold | Build trip/route/parked/supported-sign experience and labeled rider previews |
| Rules and test evidence | John | Planned | Issue #3 assigned; official sign candidates identified; Makati/footwear claims not verified | Locked record schema | Review sign rules and PH restriction/gear claims; prepare test matrix |
| Live camera and capture | Bryan | Planned | Issue #4 assigned; code not verified | Locked camera props and scaffold | Build camera/capture/upload fallback and verify permissions/cleanup |

## Decisions and blockers

1. **Ranee:** Foundation PR #6 and contract PR #7 are merged. Ruleset `23887092` is active; admin access still lets several teammates edit it, so role access should be reviewed with the organization owner.
2. **Ranee:** Maps key and localhost restriction returned an authorized Maps JavaScript response. Gemini was rejected by obsolete-model and depleted-prepay errors, so Ranee approved migration to Groq/Qwen plus browser speech. A seven-day Groq key is configured locally; exact NLP and synthetic-image recognition probes passed. Real supported-sign accuracy remains unverified.
3. **Ranee:** Hold the supported list to live-tested signs; remove a candidate if recognition or rule accuracy fails.
4. **Ranee and John:** The proposal's navigation additions are planned, not working. Show any Makati avoidance or proximity reminder as **simulation** until rule/zone sources and route/timing behavior are actually verified. Do not claim a universal footwear prohibition.

## Roadmap and gate

Foundation and contract v2: **Merged**, CI passed. Contract v3 and Ranee's Groq/browser-speech migration are local changes on the active branch; all 5 backend tests, TypeScript checks, production builds, `git diff --check`, live NLP and synthetic-image recognition probes pass locally. Real-sign accuracy and end-to-end behavior remain **not verified**. The submission gate needs a fresh-clone run, reviewed sign source, live camera + map + speech demonstration, `unknown` response, simulation labels, merged PRs, and final `main` review. Current recommendation: **Do not approve submission readiness yet**.

This dashboard is a point-in-time evidence report, not an automatic issue-status update. Refresh it after a meaningful merged checkpoint; do not promote a feature from an issue assignment or screenshot alone.
