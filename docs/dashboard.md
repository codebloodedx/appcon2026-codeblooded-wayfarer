# RoamRight MVP dashboard

**Snapshot:** 23 September 2026, Philippine time. **Deadline:** 24 September 2026, 6:00 PM Philippine time. **Health:** At risk. **Active goal:** runnable foundation followed by one complete, source-checked live sign journey.

| Area | Owner | Status | Evidence now | Dependency on `main` | Next action |
| --- | --- | --- | --- | --- | --- |
| Foundation, AI, Maps, voice, integration | Ranee | Foundation locally checked; feature work pending | Install/audit, type check, build, API/proxy health and app HTTP 200 passed locally; no merged checks yet | Foundation PR and locked contract | Publish foundation PR, review and merge, configure ruleset, add keys locally |
| Traveler UI | Gio | Planned | Issue #2 assigned; code not verified | Locked contract and scaffold | Build complete trip/parked/supported-sign experience |
| Rules and test evidence | John | Planned | Issue #3 assigned; official candidate sources identified, records not verified | Locked JSON schema | Review rules/exceptions and prepare actual test matrix |
| Live camera and capture | Bryan | Planned | Issue #4 assigned; code not verified | Locked camera props and scaffold | Build camera/capture module and verify permissions/cleanup |

## Decisions and blockers

1. **Ranee:** Accept the foundation scope, interface contract, and own-PR merge path on `main`; the repository currently has no enforced protection.
2. **Ranee:** Obtain/test Gemini and Maps keys locally without committing them. Coverage, free quotas, and audio availability remain unverified in this project.
3. **Ranee:** Hold the supported list to live-tested signs; remove a candidate if recognition or rule accuracy fails.

## Roadmap and gate

Foundation: **At risk**, not merged. Parallel areas: **Not yet active** on a stable `main`. Integration and submission: **Not yet active**. The submission gate needs a fresh-clone run, checks, reviewed sign source, live camera + map + speech demonstration, `unknown` response, simulation labels, merged PRs, and final `main` review. Current recommendation: **Do not approve submission readiness yet**.

This dashboard is a point-in-time evidence report, not an automatic issue-status update. Refresh it after a meaningful merged checkpoint; do not promote a feature from an issue assignment or screenshot alone.
