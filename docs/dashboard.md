# WayFarer MVP dashboard

**Snapshot:** 24 September 2026, Philippine time. **Deadline:** 24 September 2026, 6:00 PM Philippine time. **Health:** Integrated locally; final evidence remains.

| Area | Owner | Local integration status | Evidence | Remaining gate |
| --- | --- | --- | --- | --- |
| Traveler UI | Gio | Combined from PR #8 and wired | Setup, briefing, trip, parked, signs, and devices rendered in browser | Final responsive/manual acceptance |
| Camera and capture | Bryan | Combined from PR #11 and wired | Live sampler and parked capture/upload build and render | Grant real permission; physical supported/unknown test |
| Rules and assets | John | Combined from PR #10 | Three sourced candidate records, sign assets, sources, and matrix load | Promote only after physical live test |
| AI, Maps, voice, integration | Ranee | Combined on `integration/wayfarer-mvp` | 7 tests, checks/build, live NLP, live vision, integrated candidate API, briefing/browser flow pass | Add Maps key; test route; test real camera and tested-rule speech/Q&A |

## Current decisions

1. Product name: **WayFarer**.
2. Candidate signs may be classified and visibly labeled during controlled testing, but remain silent and cannot answer grounded sign questions.
3. Only a physical live-camera pass plus source review permits promotion to `tested`.
4. Makati restriction routing, proximity alerts, and hardware surfaces remain clearly labeled simulations or interface previews.
5. The current integration branch is local and does not bypass the required PR/review gate for `main`.
