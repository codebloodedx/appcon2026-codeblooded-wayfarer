# RoamRight delivery roadmap

The submission deadline is **24 September 2026 at 6:00 PM Philippine time**. This is one short MVP sprint with explicit gates rather than several speculative phases.

| Gate | Outcome | Entry condition | Evidence to accept |
| --- | --- | --- | --- |
| 1. Foundation | Fresh clone runs; scope, paths, interfaces and merge rules are published | Placeholder repository | `npm install`, health page, `npm run check`, `npm run build`, repo docs and verified ruleset on `main` |
| 2. Parallel areas | Gio UI, Bryan camera, John rules/evidence, Ranee AI/map/voice | Gate 1 merged to `main` | Independent issue PRs change only owned files and include area-specific checks |
| 3. Integration | Map and live camera together; one reviewed sign triggers brief Gemini speech | Required area PRs merged | Stationary end-to-end demo, `unknown` case, source and simulation labels |
| 4. Submission | Rehearsed pitch and honest project description | Gate 3 accepted by Ranee | Final `main` check, demo runbook, submission form and backup demo evidence |

The critical path is foundation → real camera frame → validated sign ID → reviewed rule → Gemini audio with map visible. If time tightens, keep one tested complete sign and an `unknown` case; do not expand to unverified signs or physical device integrations. The current gate state is in [status](status.md).
