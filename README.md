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
- [MVP tracker](https://github.com/codebloodedx/appcon2026-codeblooded-wayfarer/issues/5)

The [proposal document](https://docs.google.com/document/d/1jxH9OjBbI5yua4vMU1G2QFRlfLCkVng8gfCu-GXFwlk) describes the concept. This repository records implementation scope and verified status as the team builds.

## Ownership, Intellectual Property & Attributions

### 1. Ownership & License
WayFarer is created and developed by **Team CodeBlooded (AppCon 2026 Team 01)**. In accordance with AppCon 2026 rules and mechanics, the team retains full ownership of the intellectual property, code, designs, concepts, and innovations developed during the hackathon. The software is released to the public under the terms of the [MIT License](LICENSE).

### 2. Third-Party Dependencies & Open-Source Libraries
WayFarer attributes and complies with all respective open-source licenses for its dependencies:
* **Frontend:** [React](https://react.dev/) (MIT), [Vite](https://vitejs.dev/) (MIT), [@googlemaps/js-api-loader](https://github.com/googlemaps/js-api-loader) (Apache 2.0).
* **Backend:** [Node.js](https://nodejs.org/) (OpenJS Foundation), [Express](https://expressjs.com/) (MIT), [Google Gen AI SDK](https://github.com/googleapis/js-genai) (Apache 2.0), [dotenv](https://github.com/motdotla/dotenv) (BSD-2-Clause).
* **Development & Verification:** [TypeScript](https://www.typescriptlang.org/) (Apache 2.0), [TSX](https://github.com/privatenumber/tsx) (MIT), [Supertest](https://github.com/ladjs/supertest) (MIT).
* **Datasets & Training Imagery:** [Ritsumeikan Japanese Road Signs](https://universe.roboflow.com/ritsumeikan/japanese-road-signs) and [NOS Philippine Traffic Sign Dataset](https://universe.roboflow.com/nos-workspace-vsodn/philippine-traffic-sign-dataset-9kz1e-qvpnr-jirzn) (both CC BY 4.0).
* **Official Signage Standards:** Japanese regulatory traffic signs are official standards under the Road Traffic Act and public domain under Article 13 of the Copyright Act of Japan. Philippine road signage standards are public domain under Section 176 of RA 8293. Vector SVG reproductions were created by John Asher Manit for this project.

### 3. Proprietary Components & Cloud Services
In compliance with hackathon guidelines regarding proprietary APIs and third-party cloud services:
* **Google Maps JavaScript & Routes API (Google Cloud):**
  * *Purpose:* Calculates and renders driving routes, turn-by-turn road geometry, ETA, and distance.
  * *Access & Substitution Instructions:* Evaluators can configure their own key by adding `VITE_GOOGLE_MAPS_API_KEY` to the root `.env` file (enabling Maps JavaScript API and Routes API in Google Cloud).
  * *Public Accessibility & Graceful Fallback:* The core functionality—including safety briefings, camera sampling, sign recognition, parked rule inspector, and NLP Q&A—remains fully accessible to the public even when Maps credentials are not present.
* **Google Gemini API:**
  * *Purpose:* Performs rapid visual classification of road signs and rule-grounded natural language explanation.
  * *Access & Substitution Instructions:* Evaluators can create a Gemini API key for an eligible Google AI Studio project and set `GEMINI_API_KEY` in the backend environment. Keep this server-side variable out of frontend code and source control.
  * *Public Accessibility & Graceful Fallback:* Candidate protection and fallback algorithms ensure the system operates safely without hallucinating advice when provider access is limited.

### 4. Sponsor & Organizer Recognition
WayFarer was built for **AppCon 2026**. Full permission is granted to event organizers and sponsors to showcase, present, and promote this project for evaluation, hackathon exhibition, and promotional purposes, with appropriate attribution to **Team CodeBlooded**.
