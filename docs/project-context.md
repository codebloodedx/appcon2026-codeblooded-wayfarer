# Project context

## Identity and user problem

**WayFarer** is Team 01's AppCon 2026 MVP for **Cross-Border Driving Rules & Local Manners Assistant**. The intended user is a traveler driving in a country whose signs, rules, and road manners may differ from home. The prototype story is a Philippines-based traveler driving a route within Japan; the user is not driving across the sea between the two countries.

The product goal is to reduce unintentional violations and misunderstandings with location-appropriate, brief guidance. Safety takes priority over convenience. Unknown signs and missing/uncertain rule records must not produce invented instructions.

## Deadline and judging

- Submission deadline supplied by Ranee: **24 September 2026, 6:00 PM Philippine time**.
- Event-wide rubric: Product 35 (relevance 5, impact/value 10, UI/UX 10, maintainability 10); Technology 30 (functionality 15, technical innovation 15); Creativity 20 (originality 10, design innovation 10); Presentation 15 (clarity/storytelling 10, demo/delivery 5).
- Judges said an MVP is enough and simulated user testing with mock data is acceptable. Mock locations and construction data must be labeled in the product and pitch.

## MVP scope

1. User selects home and destination countries and a destination within the destination country.
2. When the user selects **Start trip**, WayFarer first shows and speaks up to three source-reviewed, location-matched rules or etiquette reminders. The user acknowledges the briefing before the map and camera session starts. Local restrictions such as number coding are spoken only when their exact locality, conditions, schedule, exceptions, and current source are verified.
3. An interactive destination route (line, next-turn card, ETA) and live webcam/phone-camera view appear together during the stationary demonstration. A simulated origin is visibly labeled.
4. Groq-hosted Qwen identifies only a small supported sign set from sampled **live** camera frames. The app checks the result against source-reviewed local rule records before showing or speaking a short alert.
5. Qwen supplies rule-grounded language assistance. The browser reads the approved short alert with speech synthesis. Longer explanation, etiquette, source, and manual photo capture appear in parked mode.
6. A Supported signs screen shows the sign, country, source, and tested status. An unsupported or unclear sign returns `unknown` without driving advice.
7. With location permission, resolve the current country before selecting local guidance. If location is denied or unavailable, show the selected country as a labeled fallback. Camera denial keeps the map usable and allows parked-only photo upload.
8. A Philippines route example may show an **Avoid restricted zones** toggle and alternate Makati route. Until current official restrictions, exceptions, boundaries, and route behavior are verified, the zone and alternate route must be visibly labeled **simulation**, with no compliance claim.
9. Phone, dashcam, action-camera/two-wheeler, and EV layouts may be shown as **interface previews**. A dark, high-contrast two-wheeler preview and parked pre-ride checklist can illustrate the rider experience. Their physical connections and sunlight performance are future work.

The original candidate demo signs are Japan Stop (止まれ), Japan Railway crossing ahead, and Philippines No right turn. The parked semantic-recognition lab adds a broader candidate test catalog: five country-specific categories per country and six cross-country equivalent pairs. These records become **supported** only after source acceptance and live-camera recognition evidence. The defensible driving demo minimum remains one complete tested sign and an `unknown` case.

## Outside the MVP

Physical dashcam/action-camera/vehicle connections, live construction detection or feeds, broad country coverage, unrestricted sign recognition, production navigation, and safety-critical use on active roads. Live proximity-triggered reminders (including proposed fixed-distance crossing/turn alerts) and legally reliable restricted-zone rerouting require verified markers, location accuracy, current regulations, and route testing; a stationary simulation may be shown but must be labeled.

## Sources of truth

1. User decisions in this task govern assignments and scope. This file records those decisions for the repo.
2. [Proposal document](https://docs.google.com/document/d/1jxH9OjBbI5yua4vMU1G2QFRlfLCkVng8gfCu-GXFwlk) describes the concept. It predates later decisions on the AI provider and exact sign candidates; use this repo's current contracts for implementation.
3. [Architecture](architecture.md), [interface contract](interface-contract.md), [team areas](team-roles.md), [contribution rules](../CONTRIBUTING.md), and [status](status.md) each own one topic.
4. John's [`rule-sources.md`](rule-sources.md) and `shared/rules/rules.json` will be the authority for each legal/etiquette alert after reviewed and merged. Model output is never a legal source.

## Technical direction

React/TypeScript/Vite frontend; Node/TypeScript/Express backend; Groq-hosted Qwen image understanding and language assistance; browser speech synthesis; Google Maps for map and routes; browser camera and location permission. A small JSON rule library is sufficient for the MVP. No model training or database is required. The Groq key stays server-side. An HTTPS URL or localhost is needed for camera/location use.

The frontend/backend scaffold and health endpoint are present; the AI, map, camera, rule, voice, country detection, and route additions are not yet verified. See [status](status.md).
