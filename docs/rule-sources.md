# Rule sources and asset provenance

**Owner:** John Asher Manit (`@99lash`)

**Reviewed:** 2026-09-24
**Status:** Candidate records. No sign is supported until the integrated live-camera test passes.

| Record | Reviewed instruction | Primary source | Current limit |
| --- | --- | --- | --- |
| `jp-stop` | Stop before the stop line, or just before the intersection if there is no line. | [JAF motor vehicle training, Stop Signs](https://english.jaf.or.jp/safe-driving/quiz/motorvehicles) | The camera must identify the physical sign before this becomes a tested alert. |
| `jp-railway` | The sign warns of a crossing ahead. At the crossing, stop and check unless traffic lights govern passage. | [JAF motor vehicle training, Crossing a Level Crossing](https://english.jaf.or.jp/safe-driving/quiz/motorvehicles) | The camera sees the advance warning sign, not the crossing or its signals. Do not claim proximity or issue an unconditional stop instruction. |
| `ph-no-right-turn` | No right turn where this general prohibition sign applies. | [LTO Filipino Driver's Manual, Volume 1, Road Traffic Signs](https://lto.gov.ph/wp-content/uploads/2023/10/FDM-Vol.-1-2nd-Edition.pdf) | This symbol is distinct from the manual's separate “No Right Turn on Red Signal” sign. |

The rule text in `shared/rules/rules.json` is a paraphrase of these sources. It is not a verbatim quotation of a statute. No fixed distance, penalty, or location-specific exception is inferred from an image. Groq-hosted Qwen identifies an allowlisted candidate sign but is never a rule source.

## Sign assets

| File | Provenance | Use |
| --- | --- | --- |
| `frontend/public/signs/jp-stop.svg` | Original simplified illustration based on the inverted triangle described by [JAF](https://english.jaf.or.jp/safe-driving/quiz/motorvehicles). The lettering and geometry are not asserted to be an exact official sign plate. | Recognition printout and candidate UI. |
| `frontend/public/signs/jp-railway.svg` | Based on [Wikimedia Commons file 207-B](https://commons.wikimedia.org/wiki/File:Japan_road_sign_207-B.svg), which records author Monaneko and a Japanese public-domain government-sign rationale. | Candidate warning sign. |
| `frontend/public/signs/ph-no-right-turn.svg` | Original simplified vector of the general No Right Turn symbol shown in the [LTO manual](https://lto.gov.ph/wp-content/uploads/2023/10/FDM-Vol.-1-2nd-Edition.pdf). [Commons R3-13](https://commons.wikimedia.org/wiki/File:Philippines_road_sign_R3-13.svg) is an additional design reference; its file page identifies a Philippine-government public-domain rationale. | General turn prohibition only. |

## Unverified claims kept out of guidance

Current Makati number-coding hours, exceptions, and boundary geometry are not established here. The route preview stays labeled simulation. A universal ban on sandals or slippers for every driver or rider is not established by the sources in issue #3; the UI may only give a parked gear reminder without a legal claim.

## Gate to `tested`

Run the integrated stationary test in `docs/test-matrix.md` with a physical sign through the live camera, then record the observed model ID, source-linked rule, speech output, negative/unknown controls, browser, date, and failures. Ranee reviews that evidence before a record is promoted from `candidate` to `tested`.
