# Rule and sign test matrix

**Owner:** John Asher Manit (`@99lash`)
**Updated:** 2026-09-24

All sign records currently have `candidate` status. `POST /api/recognize` may return a visibly labeled `candidate` result so the controlled vision path can be tested, but the UI must provide no driving instruction or spoken alert. `POST /api/explain` and `POST /api/speak` must reject candidate IDs. Promotion to `tested` still requires the physical live-camera evidence below; a static asset or provider smoke test is not acceptance evidence.

| ID | Stationary input | Country | Expected after source review and live gate | Evidence to record |
| --- | --- | --- | --- | --- |
| JP-STOP-1 | Physical Japan stop-sign printout, frontal | JP | `jp-stop` | Camera frame, model ID, short alert, source, audio |
| JP-STOP-2 | Same printout at several angles and distances | JP | `jp-stop` or honest `unknown` | Angle, distance, observed result, latency |
| JP-RAIL-1 | Physical railway-ahead printout | JP | `jp-railway` | Warning-sign match; confirm no false claim that crossing is immediately ahead |
| PH-TURN-1 | Physical general No Right Turn printout | PH | `ph-no-right-turn` | Correct general prohibition, no red-signal-only wording |
| NEG-BLANK | Blank scene | JP | `unknown`, no audio | Response and silence |
| NEG-OTHER | Unsupported speed sign | JP | `unknown`, no audio | Response and silence |
| NEG-COUNTRY | PH sign with JP current country | JP | `unknown`, no audio | Response and silence |
| PERMISSION | Deny camera, then use parked upload | JP | Map stays usable; uploaded still is labeled parked capture | Screenshot and error state |

For each run, write the date, browser, device, model configuration (without keys), source commit, input asset or physical sign, observed ID, response status, audio status, elapsed time, and pass/fail. Save actual screenshots or a short recording under `docs/evidence/` only after checking they show no secrets or unrelated private content. Do not mark a test passed from a planned row.

A sign becomes `tested` only after its source and wording are accepted and the integrated live-camera positive and negative cases are recorded. If any unknown input yields driving guidance, stop the demo and treat it as a blocker.
