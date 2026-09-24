# Project context

## Identity and user problem

**WayFarer** is Team 01's AppCon 2026 MVP for **Cross-Border Driving Rules & Local Manners Assistant**. The intended user is a traveler driving in a country whose signs, rules, and road manners may differ from home. The prototype story is a Philippines-based traveler driving a route within Japan; the user is not driving across the sea between the two countries.

The product goal is to reduce unintentional violations and misunderstandings with location-appropriate, brief guidance. Safety takes priority over convenience. Unknown signs and missing/uncertain rule records must not produce invented instructions.

## Deadline and judging

- Submission deadline supplied by Ranee: **24 September 2026, 6:00 PM Philippine time**.
- Event-wide rubric: Product 35 (relevance 5, impact/value 10, UI/UX 10, maintainability 10); Technology 30 (functionality 15, technical innovation 15); Creativity 20 (originality 10, design innovation 10); Presentation 15 (clarity/storytelling 10, demo/delivery 5).
- Judges said an MVP is enough and simulated user testing with mock data is acceptable. Mock locations and construction data must be labeled in the product and pitch.

## MVP scope

1. User selects home and destination countries, then chooses separate From and To locations. From supports place search, a user-triggered browser GPS lookup, and visibly labeled demo origins; a failed or denied GPS request never silently becomes a Philippines location.
2. When the user selects **Start trip**, WayFarer first shows and speaks exactly three source-reviewed, priority-sorted essentials from the same rule records used by Current Guidance. Copy adapts when home and destination countries differ; same-country trips use destination guidance without forced comparison. A **Browse Reviewed Guidance** action opens the full destination-filtered library without starting the map or camera session. The user acknowledges the briefing before the map and camera session starts. Local restrictions such as number coding appear only when their exact locality, conditions, schedule, exceptions, current source, and required vehicle/time context are verified.
3. Google Maps returns the actual driving path for route preview and a stationary navigation simulation. The vehicle marker moves smoothly along that path with bearing, follow camera, progress, remaining distance/time, pause/resume/end, 1x/2x/4x speed, rerouting from the current simulated point, and arrival state. The live webcam/phone-camera remains available as a collapsible overlay, and a simulated origin is visibly labeled.
4. Gemini on Vertex AI identifies only a small supported sign set from sampled **live** camera frames. The app checks the result against source-reviewed local rule records before showing or speaking a short alert.
5. Gemini supplies rule-grounded language assistance. The browser reads the approved short alert with speech synthesis. Longer explanation, etiquette, source, and manual photo capture appear in parked mode.
6. A Supported signs screen shows the sign, country, source, and tested status. An unsupported or unclear sign returns `unknown` without driving advice.
7. With location permission, resolve the current country before selecting local guidance. If location is denied or unavailable, show the selected country as a labeled fallback. Camera denial keeps the map usable and allows parked-only photo upload.
8. A Philippines route example may show an **Avoid restricted zones** toggle and alternate Makati route. Until current official restrictions, exceptions, boundaries, and route behavior are verified, the zone and alternate route must be visibly labeled **simulation**, with no compliance claim.
9. Phone, dashcam, action-camera/two-wheeler, and EV layouts may be shown as **interface previews**. A dark, high-contrast two-wheeler preview and parked pre-ride checklist can illustrate the rider experience. Their physical connections and sunlight performance are future work.

The active recognition catalog is deliberately limited to exactly five Japan visual classes and five Philippines visual classes: Stop, one country-specific maximum-speed design, Pedestrian Crossing, No Parking, and No U-turn. Each country design retains its own model class and maps to one of five normalized meanings for semantic comparison. **Reviewed Guidance** provides a searchable country/category library and handles manual photo capture or upload while parked. All ten records remain candidates until licensed unseen-photo validation and live-camera evidence pass. The defensible driving demo minimum remains one complete tested sign and an `unknown` case.

## Outside the MVP

Physical dashcam/action-camera/vehicle connections, live construction detection or feeds, broad country coverage, unrestricted sign recognition, production navigation, and safety-critical use on active roads. The implemented route movement remains an accelerated stationary simulation rather than GPS navigation. Live proximity-triggered reminders (including proposed fixed-distance crossing/turn alerts) and legally reliable restricted-zone rerouting require verified markers, location accuracy, current regulations, and route testing; a stationary simulation may be shown but must be labeled.

## Sources of truth

1. User decisions in this task govern assignments and scope. This file records those decisions for the repo.
2. [Proposal document](https://docs.google.com/document/d/1jxH9OjBbI5yua4vMU1G2QFRlfLCkVng8gfCu-GXFwlk) describes the concept. It predates later decisions on the AI provider and exact sign candidates; use this repo's current contracts for implementation.
3. [Architecture](architecture.md), [interface contract](interface-contract.md), [team areas](team-roles.md), [contribution rules](../CONTRIBUTING.md), and [status](status.md) each own one topic.
4. John's [`rule-sources.md`](rule-sources.md) and `shared/rules/rules.json` will be the authority for each legal/etiquette alert after reviewed and merged. Model output is never a legal source.

## Technical direction

React/TypeScript/Vite frontend; Node/TypeScript/Express backend; Gemini on Vertex AI image understanding and grounded explanations; browser speech synthesis; Google Maps for map and routes; browser camera and location permission. Structured JSON holds verified rule prompts and semantic mappings. The `ml/` directory defines a YOLO11 transfer-learning, dataset-audit, and held-out validation path for the same ten classes; trained weights do not yet exist. Vertex uses backend-only Application Default Credentials. An HTTPS URL or localhost is needed for camera/location use.

The integrated frontend and backend contain the AI, map, camera, rule, voice, country-detection, and route additions. Automated and browser checks are recorded in [status](status.md); physical live-camera acceptance remains open.
