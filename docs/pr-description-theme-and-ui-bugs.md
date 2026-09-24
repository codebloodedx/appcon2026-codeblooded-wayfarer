## Linked issue

Closes #15 (Supersedes PR #15: Harmonize UI theme, fix briefing button contrast, replace temporary emojis, and preserve simulation frame)  
Relates to #5 (MVP Tracker & Submission Readiness)

---

## What changed

This PR selectively integrates and refines the design improvements from PR #15 without introducing unwanted scope reductions, deletions, or PWA bloat:

- **Preserved Screen 0 ("Choose Device Type Simulation"):**
  - Retained `LandingPage.tsx` as the entry screen before trip setup, honoring the simulation chassis for AppCon judge evaluations.
  - Adopted Screen 0's brand color scheme (`#0072e8`, `#0039a6`, `#0a2a66`, `#46628f`, `#e6f1ff`, `#bcd7fa`, `#ffffff`) globally across all steps as unified CSS design tokens.

- **Fixed Step 2 (Pre-Trip Safety Briefing) Button Visibility:**
  - Resolved the white-on-white text bug caused by `.button-secondary` having `background: white` without explicit text color inside `.briefing-card` (which had `color: white`).
  - Restyled `.briefing-page` and `.briefing-card` with clean, accessible light sky and crisp white backgrounds.
  - Added dedicated semantic button classes (`.briefing-btn-browse`, `.briefing-btn-back`, `.briefing-btn-replay`, `.briefing-btn-start`) with high-contrast text (`#0a2a66`), clear borders, and accessible focus states.

- **Contained Bottom-Sheet Drawers Inside Phone Frame & Viewport:**
  - Resolved UI bug where tapping bottom nav items ("Guidance", "Signs", "Devices") broke out of the simulated phone chassis and expanded across the entire desktop browser window.
  - Converted `.drawer-overlay` from `position: fixed` to `position: absolute; inset: 0;` inside `.app-shell.google-maps-layout`, ensuring the overlay and drawer remain strictly bounded within the phone frame during desktop browser simulation testing.
  - Constrained `.bottom-sheet-drawer` to `max-height: min(88%, 760px)` and added curvature matching the phone frame (`border-radius: 1.5rem 1.5rem 2rem 2rem`).
  - In mobile media queries (`@media (max-width: 768px)`), maintained full-screen `fixed` overlay with `100vw` / `88dvh` for real mobile phone displays.

- **Harmonized Step 3 (Active Driving Cockpit) Theme:**
  - Applied the simulation blue aesthetic to `.gmaps-search-bar`, `.current-guidance-card`, `.camera-pip`, and `.gmaps-bottom-nav`.
  - Replaced the high-visibility neon green tab highlight with brand cobalt blue (`#0072e8`).

- **Replaced Temporary Emojis with Accessible Vector SVGs:**
  - Created vector SVG icon components in `frontend/src/components/Icons.tsx`:
    - `CountryBadge` (crisp, accessible badges for Philippines `PH` and Japan `JP`)
    - `EditIcon`, `TrafficLightIcon`, `StopSignIcon`, `PedestrianIcon`, `RailroadIcon`, and `TurnIcon`
  - Replaced all emoji flags (`🇵🇭`, `🇯🇵`) and glyphs (`✦`, `◎`, `→`) across `TripSetup.tsx`, `PreTripBriefing.tsx`, `DevicePreviews.tsx`, `ParkedView.tsx`, and `SupportedSignsView.tsx`.

- **Strict Scope Boundaries (No PWA / No Core Deletions):**
  - Excluded PWA manifest, service workers, and offline caches.
  - Left backend routing, Groq vision inference, route interpolation, and camera modules completely untouched.

---

## Owned files changed

All changed files fall strictly within Gio's owned traveler UI area (`frontend/src/features/trip/**`, `frontend/src/components/**`, `frontend/src/styles.css`):

- `frontend/src/components/Icons.tsx`
- `frontend/src/features/trip/DevicePreviews.tsx`
- `frontend/src/features/trip/ParkedView.tsx`
- `frontend/src/features/trip/PreTripBriefing.tsx`
- `frontend/src/features/trip/SupportedSignsView.tsx`
- `frontend/src/features/trip/TripScreen.tsx`
- `frontend/src/features/trip/TripSetup.tsx`
- `frontend/src/styles.css`

---

## Verification actually run

- [x] `npm run check` (TypeScript verification passed across backend and frontend, 0 errors)
- [x] `npm run build` (Backend build and Vite production client bundle built in 381ms)
- [x] `git diff --check` (Clean whitespace, no trailing whitespace)
- [x] `npm test -w backend` (All 26 backend tests passed across guidance, rules, simulation math, and route interpolation)
- [x] Visual & layout verification: Verified bottom-sheet drawer ("Guidance", "Signs", "Devices") opens smoothly inside the phone frame without leaking onto desktop viewport; verified real mobile media query rules; verified Step 2 briefing button contrast.

---

## Evidence and limitations

- **Diff Stat:**
  Styles and components updated across traveler UI area; bottom-sheet drawer contained inside phone chassis.
- **Test Evidence:**
  ```text
  ▶ WayFarer guidance API (10 tests)
  ▶ ten-class sign contract (1 test)
  ▶ pre-trip briefing catalog (2 tests)
  ▶ camera detection overlay (3 tests)
  ▶ navigation route interpolation (3 tests)
  ▶ realistic driving simulation math (7 tests)
  ℹ tests 26 | suites 6 | pass 26 | fail 0
  ```
- **Limitations:**
  - Device previews and GPS routes remain simulated per project scope.
  - Spoken guidance continues to strictly gate against verified rule records (`rules.json`), keeping unverified signs silent.

---

## Review

Request `@seavens3nt`. Do not self-merge or bypass checks.
