# Team areas and skills

Ranee selected these owners. Each area has one accountable owner and a separate editable file boundary. A teammate may read all repo files, but must not edit another area without Ranee's named approval in the relevant issue.

| Member | GitHub | Complete owned area | Editable implementation paths | Skills and availability |
| --- | --- | --- | --- | --- |
| **Ranee Mikaella Gutierrez** | `@seavens3nt` | Project setup, contracts, Groq/Qwen recognition and rule-grounded NLP, browser voice, Maps, country detection, route guidance and labeled restriction/proximity simulations, final integration/review/submission | root setup files; `backend/**`; `frontend/src/features/map/**`; `frontend/src/features/guidance/**`; project governance/context docs | Specific proficiency and available hours **not verified**; workload is the largest capacity risk. |
| **Gio Joshua Gonzales** | `@GiYo-Mi02` | Complete traveler-facing UI: trip setup, active trip and route summary, restricted-zone control, parked details, supported signs, high-contrast two-wheeler/device previews, responsive/error/accessibility states | `frontend/src/App.tsx`; `frontend/src/features/trip/**`; `frontend/src/components/**`; `frontend/src/styles.css` | Specific proficiency and available hours **not verified**. |
| **John Asher Manit** | `@99lash` | Complete rule knowledge and validation: official sign and PH restriction source review, exception/footwear claim check, records and asset provenance, test design, actual demo evidence and defect reports | `shared/rules/**`; `frontend/public/signs/**`; `docs/rule-sources.md`; `docs/test-matrix.md`; `docs/evidence/**` | Specific proficiency and available hours **not verified**. |
| **Bryan Navarro Lomerio** | `@BryanLomerio` | Complete camera/capture subsystem: permission, live preview, frame sampling, parked photo capture/file-upload fallback, lifecycle/error handling and module verification | `frontend/src/features/camera/**` | Specific proficiency and available hours **not verified**. |

## Independent-start inputs

- Ranee owns and publishes [`interface-contract.md`](interface-contract.md), the runnable scaffold, and [run guide](how-to-run.md) on `main` first. These provide stable imports, request shapes, and commands.
- Gio can implement the full trip UI against documented map/camera/guidance props and sample responses, without waiting for another member's personal handoff.
- Bryan can implement the camera subsystem against documented callback props, without calling Groq or editing Gio's UI.
- John can verify official rule text and draft assets immediately; the final JSON must match the locked schema and evidence must report the actual integrated demo.
- When a merged dependency changes, pull `main` and continue from that file. Report a contradiction on your issue; Ranee decides the affected requirement.

Ranee reviews and accepts member PRs. Members do not approve or merge one another's work. A branch, push, screenshot, or open PR is not a completed-and-verified deliverable.
