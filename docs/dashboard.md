# WayFarer MVP dashboard

**Snapshot:** 24 September 2026, Philippine time. **Deadline:** 24 September 2026, 6:00 PM Philippine time. **Health:** PR #15 UI is integrated with the functional navigation and structured guidance on `integration/pr15-ui`; ten-class model evidence remains open.

| Area | Owner | Local integration status | Evidence | Remaining gate |
| --- | --- | --- | --- | --- |
| Traveler UI | Gio | PR #15 cockpit plus PR #16 one-screen landing integrated without replacing Ranee's functional flow | Phone/PC landing, setup, briefing, full-screen cockpit, SVG bottom navigation, retained-map bottom sheets, parked guidance, signs, and devices rendered in browser | Final responsive/manual acceptance |
| Camera and capture | Bryan | Combined from PR #11 and wired | Live sampler and parked capture/upload build and render | Grant real permission; physical supported/unknown test |
| Rules and assets | John | Re-scoped to exactly 10 candidate visual classes | Ten-class manifest, semantic pairs, official rule URLs, UI fixtures | Export/relabel licensed photos; source and live acceptance |
| AI, Maps, voice, integration | Ranee | Functional checkpoint plus PR #15 UI merge committed locally on `integration/pr15-ui` | Structured country rules, automatic TTS queue, real route movement, 50-60 km/h cruise, route events, ten-class API/debug contract, YOLO training/audit scripts | Train/validate weights; physical camera test; integration review |

## Current decisions

1. Product name: **WayFarer**.
2. Candidate signs remain visibly labeled as prototype evidence. During active driving, a detection may speak only its brief source-reviewed `shortAlert`; unknown signs stay silent and unrestricted legal Q&A remains gated.
3. Only a physical live-camera pass plus source review permits promotion to `tested`.
4. Makati restriction routing, proximity alerts, and hardware surfaces remain clearly labeled simulations or interface previews.
5. The current integration branch is local and does not bypass the required PR/review gate for `main`.
6. Route geometry comes from Google Maps; movement and elapsed travel are accelerated stationary simulations and are labeled as such.
7. PR #12 is design-reference-only; its accepted concepts are carried by the PR #15 integration. PR #14 and PR #16 are locally integrated, and all previously merged PRs remain in the branch ancestry.
