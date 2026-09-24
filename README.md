# WayFarer

WayFarer is a hackathon MVP for the **Cross-Border Driving Rules & Local Manners Assistant** theme. The planned experience pairs a route map with a live camera, recognizes a small reviewed set of road signs, and gives brief location-specific spoken guidance. The focused demo is a traveler accustomed to driving in the Philippines navigating a route within Japan. A separate Philippines restricted-zone route preview and rider interface preview are scoped as visibly labeled demonstrations.

**Current state:** the integrated MVP combines the traveler UI, phone/PC simulation entry, live camera/capture package, reviewed candidate rules/assets, Gemini on Vertex AI recognition and grounded NLP, browser speech, pre-trip briefing, and a Google Maps route simulation. The map now supports separate origin and destination search, route preview, smooth simulated movement along returned road geometry, pause/resume/speed controls, rerouting, and trip completion while the camera remains available. Automated checks, live Gemini NLP/vision probes, and Philippines/Japan browser journeys pass locally. Physical live-camera acceptance and deployment evidence remain open. See [current status](docs/status.md).

## Get started

Requires Node.js 22.12+ and npm. From a fresh clone:

```text
npm install
copy .env.example .env
npm run dev
```

On macOS/Linux, use `cp .env.example .env`. Open the local frontend URL printed by Vite. The `.env` file is local and must not be committed. Run `npm test`, `npm run check`, and `npm run build` before opening a pull request. See [how to run](docs/how-to-run.md) for keys, troubleshooting, and checks.

## Test semantic sign recognition

1. Start the app with `npm run dev`, choose **PC simulation**, complete the pre-trip briefing, and press **Start camera** in the Trip view.
2. Use the **Live camera test set** below the map/camera. Open a fixture on a second screen or print it, then hold it in front of the live camera while stationary.
3. The live camera card shows when it is waiting or analyzing. A successful candidate/recognized response draws an amber/green square around the returned sign box and updates the normalized category, country, confidence, match type, and equivalent sign. Frames are normally sampled every 2.5 seconds; provider rate limits trigger a visible retry delay.
4. Edit the trip destination to switch between the Japan and Philippines live test sets. The camera country context and reviewed records change together.
5. Use **Reviewed Guidance** to browse verified destination rules, search/filter the library, capture or upload an unfamiliar sign, and inspect its reviewed details and source while parked. Test visual variation in the live camera by changing the sign angle, lighting, distance, crop, obstruction, and background while stationary.

See [recognition architecture](docs/recognition-architecture.md) for the audit, ten-class boundary, YOLO training path, thresholds, and safety gate, and [test matrix](docs/test-matrix.md) for the five Japan classes, five Philippines classes, four true semantic pairs, and the related speed-sign case.

## Test the navigation simulation

1. Start the app, choose **Phone simulation**, select the Philippines, and use **National University Manila** as From and **SM Mall of Asia** as To. Manual search and a browser-resolved GPS origin are also supported.
2. Complete the briefing and confirm that the route preview shows Google road geometry, distance, duration, and a first maneuver before driving.
3. Select **Start Driving**. Confirm that the WayFarer marker follows the route, rotates with travel direction, the map follows it, and remaining distance, time, ETA, and progress update.
4. Test **Pause**, **Resume**, **1x/2x/4x**, camera expand/collapse, and a destination change during the trip. A changed destination is calculated from the current simulated position.
5. Let the simulation finish and confirm **Destination reached**, **End Trip**, and **Restart Simulation**. Repeat with the Japan demo, such as Tokyo Station to Shibuya, to verify the flow is not Philippines-specific.

## Project guide

- [Scope and source of truth](docs/project-context.md)
- [Team areas and skills](docs/team-roles.md)
- [Architecture and integration contract](docs/architecture.md)
- [API and component contracts](docs/interface-contract.md)
- [Roadmap](docs/roadmap.md) and [current status](docs/status.md)
- [Contribution and PR rules](CONTRIBUTING.md)
- [Integration checklist](docs/integration-checklist.md)
- [MVP tracker](https://github.com/codebloodedx/appcon2026-team-01-temp-project-temp/issues/5)

The [proposal document](https://docs.google.com/document/d/1jxH9OjBbI5yua4vMU1G2QFRlfLCkVng8gfCu-GXFwlk) describes the concept. This repository records implementation scope and verified status as the team builds.
