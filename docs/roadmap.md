# WayFarer delivery roadmap

The submission deadline is **24 September 2026 at 6:00 PM Philippine time**. This is one short MVP sprint with explicit gates rather than several speculative phases.

| Gate | Outcome | Entry condition | Evidence to accept |
| --- | --- | --- | --- |
| 1. Foundation | Fresh clone runs; scope, paths, interfaces and merge rules are published | Placeholder repository | `npm install`, health page, `npm run check`, `npm run build`, repo docs and verified ruleset on `main` |
| 2. Parallel areas | Gio UI, Bryan camera, John rules/evidence, Ranee AI/map/voice | Gate 1 merged to `main` | Independent issue PRs change only owned files and include area-specific checks |
| 3. Integration | Route map and live camera together; one reviewed sign triggers brief browser-spoken guidance | Required area PRs merged | Stationary end-to-end demo, route line/next turn/ETA if available, `unknown` case, source and simulation labels |
| 4. Submission | Rehearsed pitch and honest project description | Gate 3 accepted by Ranee | Final `main` check, demo runbook, submission form and backup demo evidence |

The critical path is foundation → real camera frame → validated sign ID → reviewed rule → browser-spoken approved alert with map visible. If time tightens, keep one tested complete sign and an `unknown` case; do not expand to unverified signs or physical device integrations. The current gate state is in [status](status.md).

## Navigation additions from the proposal

1. **Target for the same MVP:** show the route line, next turn and ETA; resolve the country from permitted device location, with an explicit selected-country fallback. Keep the map usable when camera permission is denied and permit a parked-only photo upload.
2. **Clearly labeled demonstration:** PH **Avoid restricted zones** toggle with a Makati example and alternate route, only if route/zone data can be displayed honestly. Mock data is a simulation; current official hours, plate coverage, exceptions and boundaries remain unverified. A proximity reminder can be a stationary simulation, not a claim of live 300 m/200 m triggering.
3. **Interface preview:** high-contrast, non-flashing two-wheeler layout and parked pre-ride checklist. Footwear legality is not stated unless John verifies the precise rule and circumstances.

None of these additions may displace the complete sign → reviewed rule → spoken alert → `unknown` proof. Live compliance rerouting, fixed-distance GPS alerts, production turn-by-turn navigation, and physical HUD performance are future capabilities unless implemented and tested.
