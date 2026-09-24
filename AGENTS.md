# RoamRight project instructions

- Ranee Mikaella Gutierrez is Project Manager and final decision-maker. A link alone is review only; do not infer permission to push, merge, close, publish or deploy.
- Read `docs/project-context.md`, `docs/interface-contract.md`, `docs/team-roles.md`, and `docs/status.md` before substantive work. Use the repo-local `roamright-project-context` skill for routing and sync.
- File areas: Gio owns traveler UI (`frontend/src/features/trip/**`, `frontend/src/components/**`, `frontend/src/App.tsx`, `frontend/src/styles.css`); Bryan owns `frontend/src/features/camera/**`; John owns `shared/rules/**`, sign assets and rule/test evidence; Ranee owns backend, Maps/guidance frontend adapters, foundation and integration. Do not cross an area without a named Ranee decision.
- Canonical setup: `npm install`, copy `.env.example` to `.env`, then `npm run dev`. Canonical checks: `npm run check`, `npm run build`, `git diff --check`. See `docs/how-to-run.md`.
- Groq/Qwen identification is not a traffic-law source. Only source-reviewed records can become spoken driving guidance. Unknown/uncertain signs yield no driving advice. Label simulated locations and device previews.
- Keep API keys out of Git and browser bundles. Do not claim features complete without actual checks and Ranee's acceptance. Follow `CONTRIBUTING.md` for branches and PR review.
