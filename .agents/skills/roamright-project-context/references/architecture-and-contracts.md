# Architecture and contract routing

- Directory ownership and data flow: [`docs/architecture.md`](../../../../docs/architecture.md).
- Sign/restriction/briefing evidence, camera upload fallback, country/route props, and HTTP routes: [`docs/interface-contract.md`](../../../../docs/interface-contract.md).
- Setup and verification commands: [`docs/how-to-run.md`](../../../../docs/how-to-run.md).
- Contribution and merge rules: [`CONTRIBUTING.md`](../../../../CONTRIBUTING.md).

The local `integration/wayfarer-mvp` branch combines the traveler UI, camera, candidate rule assets, map adapter, Groq/Qwen recognition and grounded NLP APIs, candidate/tested safety gate, source-reviewed pre-trip briefing, browser speech, and focused tests. Physical live-camera acceptance, a configured Maps key, tested-rule speech/Q&A, PR review, and deployment remain separate gates.
