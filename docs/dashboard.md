# WayFarer MVP dashboard

**Snapshot:** 24 September 2026, Philippine time. **Deadline:** 24 September 2026, 6:00 PM Philippine time. **Health:** Navigation and structured guidance implemented locally; ten-class model evidence remains open.

| Area | Owner | Local integration status | Evidence | Remaining gate |
| --- | --- | --- | --- | --- |
| Traveler UI | Gio | Combined and extended under Ranee's current navigation request | Setup, briefing, map cockpit, bottom navigation/drawers, parked, signs, and devices rendered in browser | Final responsive/manual acceptance |
| Camera and capture | Bryan | Combined from PR #11 and wired | Live sampler and parked capture/upload build and render | Grant real permission; physical supported/unknown test |
| Rules and assets | John | Re-scoped to exactly 10 candidate visual classes | Ten-class manifest, semantic pairs, official rule URLs, UI fixtures | Export/relabel licensed photos; source and live acceptance |
| AI, Maps, voice, integration | Ranee | Navigation, current-guidance, and recognition changes local on `feature/navigation-simulation` | Structured country rules, automatic TTS queue, route events, ten-class API/debug contract, YOLO training/audit scripts | Train/validate weights; physical camera test; PR review |

## Current decisions

1. Product name: **WayFarer**.
2. Candidate signs remain visibly labeled as prototype evidence. During active driving, a detection may speak only its brief source-reviewed `shortAlert`; unknown signs stay silent and unrestricted legal Q&A remains gated.
3. Only a physical live-camera pass plus source review permits promotion to `tested`.
4. Makati restriction routing, proximity alerts, and hardware surfaces remain clearly labeled simulations or interface previews.
5. The current navigation branch is local and does not bypass the required PR/review gate for `main`.
6. Route geometry comes from Google Maps; movement and elapsed travel are accelerated stationary simulations and are labeled as such.
