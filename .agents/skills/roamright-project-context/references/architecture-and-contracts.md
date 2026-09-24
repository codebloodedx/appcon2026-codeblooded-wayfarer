# Architecture and contract routing

- Directory ownership and data flow: [`docs/architecture.md`](../../../../docs/architecture.md).
- Sign, driving-guidance, camera, country/route props, and HTTP routes: [`docs/interface-contract.md`](../../../../docs/interface-contract.md).
- Recognition and YOLO preparation: [`docs/recognition-architecture.md`](../../../../docs/recognition-architecture.md) and [`ml/README.md`](../../../../ml/README.md).
- Setup and verification commands: [`docs/how-to-run.md`](../../../../docs/how-to-run.md).
- Contribution and merge rules: [`CONTRIBUTING.md`](../../../../CONTRIBUTING.md).

The local `feature/navigation-simulation` branch combines the traveler flow, actual Google route geometry, smooth stationary navigation simulation, retained live camera PiP, and exactly ten recognition classes. Gemini on Vertex AI is the configured whole-frame prototype recognizer; a YOLO11 transfer-learning/audit/validation scaffold is present but has no trained weights. Visual classes normalize into five meanings and only the active country's reviewed record can be selected.

Current Guidance loads verified structured rules from `GET /api/driving-guidance`. It is disabled during route preview, starts on Start Driving, accepts structured route/simulation/CV events, shows a short source-linked card, and uses a priority speech queue with deduplication and cooldown. City/time/context rules are withheld unless the required jurisdiction and data match. Simulated route events remain visibly labeled.

Pre-trip returns exactly three source-reviewed essentials from the same catalog, ranked by safety priority, cross-country misunderstanding risk, and category importance. Its destination-aware CTA opens Reviewed Guidance without starting navigation. Reviewed Guidance uses the full verified country/locality guidance result plus source-reviewed sign records and provides country, available-locality, category, and text filters for parked use.

The live `CameraPanel` accepts normalized detection boxes and recognition state. It maps a valid box into the cropped `object-fit: cover` video, uses amber for candidates and green for tested records, and shows waiting/analyzing/unknown/error status. Recognition rate-limit responses include a retry delay that the sampler honors.

Physical live-camera acceptance, model training/held-out evidence, tested-rule CV speech, PR review, and deployment remain separate gates.
