# RoamRight MVP dashboard

**Snapshot:** 23 September 2026, Philippine time. **Deadline:** 24 September 2026, 6:00 PM Philippine time. **Health:** At risk. **Active goal:** runnable foundation followed by one complete, source-checked live sign journey.

| Area | Owner | Status | Evidence now | Dependency on `main` | Next action |
| --- | --- | --- | --- | --- | --- |
| Foundation, AI, Maps, voice, integration | Ranee | Foundation merged; scope update pending; feature work pending | PR #6 merged at `cd86247`; its CI passed. Local checks/build passed for scope branch | Contract v2 review | Merge scope PR, then build AI/map/voice/country/route modules |
| Traveler UI | Gio | Planned | Issue #2 assigned; code not verified | Locked contract and scaffold | Build trip/route/parked/supported-sign experience and labeled rider previews |
| Rules and test evidence | John | Planned | Issue #3 assigned; official sign candidates identified; Makati/footwear claims not verified | Locked record schema | Review sign rules and PH restriction/gear claims; prepare test matrix |
| Live camera and capture | Bryan | Planned | Issue #4 assigned; code not verified | Locked camera props and scaffold | Build camera/capture/upload fallback and verify permissions/cleanup |

## Decisions and blockers

1. **Ranee:** Foundation PR #6 is merged. Review the separate contract v2 PR before implementing the new interfaces. Ruleset `23887092` is active; admin access still lets several teammates edit it, so role access should be reviewed with the organization owner.
2. **Ranee:** Obtain/test Gemini and Maps keys locally without committing them. Coverage, free quotas, and audio availability remain unverified in this project.
3. **Ranee:** Hold the supported list to live-tested signs; remove a candidate if recognition or rule accuracy fails.
4. **Ranee and John:** The proposal's navigation additions are planned, not working. Show any Makati avoidance or proximity reminder as **simulation** until rule/zone sources and route/timing behavior are actually verified. Do not claim a universal footwear prohibition.

## Roadmap and gate

Foundation: **Merged**, CI passed. Parallel areas: **Ready to start** from current `main`; changed interfaces wait for contract v2 acceptance. Integration and submission: **Not yet active**. The submission gate needs a fresh-clone run, checks, reviewed sign source, live camera + map + speech demonstration, `unknown` response, simulation labels, merged PRs, and final `main` review. Current recommendation: **Do not approve submission readiness yet**.

This dashboard is a point-in-time evidence report, not an automatic issue-status update. Refresh it after a meaningful merged checkpoint; do not promote a feature from an issue assignment or screenshot alone.
