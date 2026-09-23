# Project context

## Identity and user problem

**RoamRight** is Team 01's AppCon 2026 MVP for **Cross-Border Driving Rules & Local Manners Assistant**. The intended user is a traveler driving in a country whose signs, rules, and road manners may differ from home. The prototype story is a Philippines-based traveler driving a route within Japan; the user is not driving across the sea between the two countries.

The product goal is to reduce unintentional violations and misunderstandings with location-appropriate, brief guidance. Safety takes priority over convenience. Unknown signs and missing/uncertain rule records must not produce invented instructions.

## Deadline and judging

- Submission deadline supplied by Ranee: **24 September 2026, 6:00 PM Philippine time**.
- Event-wide rubric: Product 35 (relevance 5, impact/value 10, UI/UX 10, maintainability 10); Technology 30 (functionality 15, technical innovation 15); Creativity 20 (originality 10, design innovation 10); Presentation 15 (clarity/storytelling 10, demo/delivery 5).
- Judges said an MVP is enough and simulated user testing with mock data is acceptable. Mock locations and construction data must be labeled in the product and pitch.

## MVP scope

1. User selects home and destination countries and a destination within the destination country.
2. An interactive destination route (line, next-turn card, ETA) and live webcam/phone-camera view appear together during the stationary demonstration. A simulated origin is visibly labeled.
3. Gemini identifies only a small supported sign set from sampled **live** camera frames. The app checks the result against source-reviewed local rule records before showing or speaking a short alert.
4. Gemini supplies language assistance and spoken audio from reviewed rule content. Longer explanation, etiquette, source, and manual photo capture appear in parked mode.
5. A Supported signs screen shows the sign, country, source, and tested status. An unsupported or unclear sign returns `unknown` without driving advice.
6. With location permission, resolve the current country before selecting local guidance. If location is denied or unavailable, show the selected country as a labeled fallback. Camera denial keeps the map usable and allows parked-only photo upload.
7. A Philippines route example may show an **Avoid restricted zones** toggle and alternate Makati route. Until current official restrictions, exceptions, boundaries, and route behavior are verified, the zone and alternate route must be visibly labeled **simulation**, with no compliance claim.
8. Phone, dashcam, action-camera/two-wheeler, and EV layouts may be shown as **interface previews**. A dark, high-contrast two-wheeler preview and parked pre-ride checklist can illustrate the rider experience. Their physical connections and sunlight performance are future work.

Candidate demo signs are Japan Stop (止まれ), Japan Railway crossing ahead, and Philippines No right turn. They become **supported** only after John verifies the rule/source and the team verifies live-camera recognition. The defensible minimum is one complete tested sign and an `unknown` case.

## Outside the MVP

Physical dashcam/action-camera/vehicle connections, live construction detection or feeds, broad country coverage, unrestricted sign recognition, production navigation, and safety-critical use on active roads. Live proximity-triggered reminders (including proposed fixed-distance crossing/turn alerts) and legally reliable restricted-zone rerouting require verified markers, location accuracy, current regulations, and route testing; a stationary simulation may be shown but must be labeled.

## Sources of truth

1. User decisions in this task govern assignments and scope. This file records those decisions for the repo.
2. [Proposal document](https://docs.google.com/document/d/1jxH9OjBbI5yua4vMU1G2QFRlfLCkVng8gfCu-GXFwlk) describes the concept. It predates later decisions on Gemini and the exact sign candidates; use this repo's current contracts for implementation.
3. [Architecture](architecture.md), [interface contract](interface-contract.md), [team areas](team-roles.md), [contribution rules](../CONTRIBUTING.md), and [status](status.md) each own one topic.
4. John's [`rule-sources.md`](rule-sources.md) and `shared/rules/rules.json` will be the authority for each legal/etiquette alert after reviewed and merged. Gemini output is never a legal source.

## Technical direction

React/TypeScript/Vite frontend; Node/TypeScript/Express backend; Gemini image understanding, language assistance, and text-to-speech; Google Maps for map and routes; browser camera and location permission. A small JSON rule library is sufficient for the MVP. No model training or database is required. The Gemini key stays server-side. An HTTPS URL or localhost is needed for camera/location use.

The frontend/backend scaffold and health endpoint are present; the AI, map, camera, rule, voice, country detection, and route additions are not yet verified. See [status](status.md).
