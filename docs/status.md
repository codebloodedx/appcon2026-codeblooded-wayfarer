# Current status

**Last inspected:** 24 September 2026, Philippine time. **Active sprint:** RoamRight MVP. **Overall health:** At risk. Integration is in progress and the submission is 24 September 2026 at 6:00 PM Philippine time.

## Verified facts

- The public repository existed at `codebloodedx/appcon2026-team-01-temp-project-temp`, default branch `main`, initial commit `03c0c3c`, with README, `.gitignore`, and placeholder directories.
- Issues [#1](https://github.com/codebloodedx/appcon2026-team-01-temp-project-temp/issues/1) through [#5](https://github.com/codebloodedx/appcon2026-team-01-temp-project-temp/issues/5) were revised and assigned to match the consolidated areas in [team roles](team-roles.md).
- The local scaffold installed 177 npm packages with 0 reported audit vulnerabilities. `npm run check` and `npm run build` passed. Direct API and frontend-proxied `/api/health` returned `status: ok`; the app root returned HTTP 200. These are **local foundation checks**, not live-feature or merged-branch evidence.
- GitHub ruleset `23887092` is active on `main`: only Ranee can update it through a PR bypass; it requires a PR, one approval and code owner review, dismisses stale approvals, resolves threads, requires the `build` check, and blocks deletion/force pushes. The effective branch rules were queried after setup. Organization/repository admins can still edit the ruleset; John, Gio and Bryan currently have repository admin access, and John is also an organization admin.
- The [proposal document](https://docs.google.com/document/d/1jxH9OjBbI5yua4vMU1G2QFRlfLCkVng8gfCu-GXFwlk) was read. It describes the live camera/map concept but predates the later exact provider and sign choices.
- Ranee requested integration of Ash's navigation, restricted-zone, proximity and rider-display suggestions. The proposal and interface contract now describe scoped route guidance and clearly labeled simulations. The features themselves remain **not verified**. Current official Makati hours/boundaries and the claimed universal footwear prohibition have not been established.
- [Foundation PR #6](https://github.com/codebloodedx/appcon2026-team-01-temp-project-temp/pull/6) was merged at `cd86247`. Its CI `build` passed.
- [Navigation-scope PR #7](https://github.com/codebloodedx/appcon2026-team-01-temp-project-temp/pull/7) was merged at `03a5991`. Interface contract version 2 is now on `main`.
- Ranee's `mvp/ranee-guidance-map` branch originally implemented strict rule-backed Gemini recognition/explanation/speech APIs. A live setup check later reached Gemini but received an obsolete-model `404` for `gemini-2.5-flash` and depleted-prepay `402` for the replacement model. Ranee then approved migration to Groq-hosted Qwen for recognition/NLP and browser speech synthesis for approved alerts.
- The current local branch replaces the Gemini SDK with `groq-sdk`, preserves strict tested-rule/country gating, changes `/api/speak` to return approved text for browser speech, and updates the frontend adapter and contract to version 3. All 5 backend tests, TypeScript checks, backend/frontend production builds and `git diff --check` pass locally.
- A seven-day Groq key named `RoamRight MVP` is configured only in ignored local `.env` files. A live `qwen/qwen3.8-27b` NLP request returned the required exact response, and the actual `GroqGuidanceModel.recognize` path accepted a generated nonpersonal image and returned only an allowlisted-or-unknown result. This proves provider connectivity and contract handling, not accuracy on the team's physical signs.
- The Google Maps browser key returned an HTTP 200 script for the allowed localhost referrer without invalid-key, referrer, disabled-API, or billing-disabled errors. A rendered route in the integrated UI remains unverified.
- Ranee's branch implements a source-gated pre-trip briefing API and browser-speech adapter. It returns at most three tested reminders matched to country and exact locality; candidate or wrong-locality records are excluded. The six backend tests, TypeScript checks, and production builds pass locally. Reviewed briefing records and Gio's acknowledgment UI are not yet present, so the complete pre-trip experience remains unverified.

## In progress

- Ranee's backend and map/guidance integration package is being prepared for review from `mvp/ranee-guidance-map`.

## Not verified or not started

- Member implementation/PRs and available hours: **Not verified**.
- Source-checked sign/restriction/briefing records, real-sign Groq accuracy, rendered Maps route, combined camera/map UI, pre-trip acknowledgment UI, device previews, and real end-to-end demo: **Not verified**.
- Deployed URL and final submission: **Not verified**.

## Blockers and decisions

| Item | Owner | Impact | Needed next |
| --- | --- | --- | --- |
| Admin access beyond Ranee | Ranee / organization owner | Other admins can edit the ruleset despite the active PR gate | Review access with the team; retain documented Ranee-only merge decision |
| Real supported-sign evidence absent | John and Bryan, then Ranee | Provider connectivity is proven, but recognition accuracy cannot be claimed | Merge a reviewed rule/sign asset and camera package; record one physical supported sign and an unknown case |
| Sign sources and live camera evidence absent | John and Bryan, then Ranee | Cannot claim supported signs | Source review and stationary recognition test |

**Gate recommendation:** Do not call the MVP ready for submission until the member packages are integrated and the stationary supported/unknown/map/voice/source checks have recorded evidence. See [integration checklist](integration-checklist.md).
