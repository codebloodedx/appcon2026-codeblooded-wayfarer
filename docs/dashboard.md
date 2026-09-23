# RoamRight MVP dashboard

**Snapshot:** 24 September 2026, Philippine time. **Deadline:** 24 September 2026, 6:00 PM Philippine time. **Health:** At risk. **Active goal:** integrate one complete, source-checked live sign journey.

| Area | Owner | Status | Evidence now | Dependency on `main` | Next action |
| --- | --- | --- | --- | --- | --- |
| Foundation, AI, Maps, voice, integration | Ranee | Contracts merged; owned implementation ready for PR review | PR #6 and #7 merged. `mvp/ranee-guidance-map` has APIs, map/guidance adapters, tests, checks, build, and no-key smoke results | Rules, camera, and trip UI packages | Review owned implementation, then integrate member PRs and perform live-key checks |
| Traveler UI | Gio | Planned | Issue #2 assigned; code not verified | Locked contract and scaffold | Build trip/route/parked/supported-sign experience and labeled rider previews |
| Rules and test evidence | John | Planned | Issue #3 assigned; official sign candidates identified; Makati/footwear claims not verified | Locked record schema | Review sign rules and PH restriction/gear claims; prepare test matrix |
| Live camera and capture | Bryan | Planned | Issue #4 assigned; code not verified | Locked camera props and scaffold | Build camera/capture/upload fallback and verify permissions/cleanup |

## Decisions and blockers

1. **Ranee:** Foundation PR #6 and contract PR #7 are merged. Ruleset `23887092` is active; admin access still lets several teammates edit it, so role access should be reviewed with the organization owner.
2. **Ranee:** Obtain/test Gemini and Maps keys locally without committing them. Coverage, free quotas, and audio availability remain unverified in this project.
3. **Ranee:** Hold the supported list to live-tested signs; remove a candidate if recognition or rule accuracy fails.
4. **Ranee and John:** The proposal's navigation additions are planned, not working. Show any Makati avoidance or proximity reminder as **simulation** until rule/zone sources and route/timing behavior are actually verified. Do not claim a universal footwear prohibition.

## Roadmap and gate

Foundation and contract v2: **Merged**, CI passed. Ranee's owned AI/map/guidance package: **Locally verified without live keys and ready for review**. Member areas and end-to-end integration: **Not verified**. The submission gate needs a fresh-clone run, reviewed sign source, live camera + map + speech demonstration, `unknown` response, simulation labels, merged PRs, and final `main` review. Current recommendation: **Do not approve submission readiness yet**.

This dashboard is a point-in-time evidence report, not an automatic issue-status update. Refresh it after a meaningful merged checkpoint; do not promote a feature from an issue assignment or screenshot alone.
