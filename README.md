# WayFarer

WayFarer is a hackathon MVP for the **Cross-Border Driving Rules & Local Manners Assistant** theme. The planned experience pairs a route map with a live camera, recognizes a small reviewed set of road signs, and gives brief location-specific spoken guidance. The focused demo is a traveler accustomed to driving in the Philippines navigating a route within Japan. A separate Philippines restricted-zone route preview and rider interface preview are scoped as visibly labeled demonstrations.

**Current state:** the local `integration/wayfarer-mvp` branch combines the traveler UI, live camera/capture package, reviewed candidate rules/assets, Groq/Qwen recognition and grounded NLP, browser speech, pre-trip briefing, and Maps route component. Automated checks and the browser journey pass locally. Physical live-camera acceptance, a configured Maps key, and final merge/deployment evidence remain open. See [current status](docs/status.md).

## Get started

Requires Node.js 22.12+ and npm. From a fresh clone:

```text
npm install
copy .env.example .env
npm run dev
```

On macOS/Linux, use `cp .env.example .env`. Open the local frontend URL printed by Vite. The `.env` file is local and must not be committed. Run `npm test`, `npm run check`, and `npm run build` before opening a pull request. See [how to run](docs/how-to-run.md) for keys, troubleshooting, and checks.

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
