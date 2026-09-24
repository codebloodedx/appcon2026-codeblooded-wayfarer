# Ten-class recognition validation matrix

**Updated:** 24 September 2026
**Status:** Matrix defined; trained YOLO and held-out photo results are not yet available.

The active catalog contains exactly five Japan visual classes and five Philippines visual classes. SVGs are interface fixtures only. Final PASS/FAIL must come from licensed unseen road photographs or physical live-camera inputs that were never used for training.

## Class matrix

| Input class | Country | Expected category | Predicted category | Confidence | Semantic equivalent | Result |
| --- | --- | --- | --- | --- | --- | --- |
| `JP_STOP` | Japan | `STOP` | Pending | Pending | `PH_STOP` | NOT RUN |
| `JP_MAX_SPEED_30` | Japan | `MAX_SPEED` | Pending | Pending | None; value differs | NOT RUN |
| `JP_PEDESTRIAN_CROSSING` | Japan | `PEDESTRIAN_CROSSING` | Pending | Pending | `PH_PEDESTRIAN_CROSSING` | NOT RUN |
| `JP_NO_PARKING` | Japan | `NO_PARKING` | Pending | Pending | `PH_NO_PARKING` | NOT RUN |
| `JP_NO_U_TURN` | Japan | `NO_U_TURN` | Pending | Pending | `PH_NO_U_TURN` | NOT RUN |
| `PH_STOP` | Philippines | `STOP` | Pending | Pending | `JP_STOP` | NOT RUN |
| `PH_MAX_SPEED_50` | Philippines | `MAX_SPEED` | Pending | Pending | None; value differs | NOT RUN |
| `PH_PEDESTRIAN_CROSSING` | Philippines | `PEDESTRIAN_CROSSING` | Pending | Pending | `JP_PEDESTRIAN_CROSSING` | NOT RUN |
| `PH_NO_PARKING` | Philippines | `NO_PARKING` | Pending | Pending | `JP_NO_PARKING` | NOT RUN |
| `PH_NO_U_TURN` | Philippines | `NO_U_TURN` | Pending | Pending | `JP_NO_U_TURN` | NOT RUN |

## Semantic pair expectations

| Japan design | Philippines design | Normalized meaning | Expected comparison |
| --- | --- | --- | --- |
| `JP_STOP` | `PH_STOP` | `STOP` | `SEMANTIC_MATCH` |
| `JP_MAX_SPEED_30` | `PH_MAX_SPEED_50` | `MAX_SPEED` | `RELATED`; never substitute one posted value for the other. |
| `JP_PEDESTRIAN_CROSSING` | `PH_PEDESTRIAN_CROSSING` | `PEDESTRIAN_CROSSING` | `SEMANTIC_MATCH` |
| `JP_NO_PARKING` | `PH_NO_PARKING` | `NO_PARKING` | `SEMANTIC_MATCH` |
| `JP_NO_U_TURN` | `PH_NO_U_TURN` | `NO_U_TURN` | `SEMANTIC_MATCH` |

A semantic match never means the sign pixels, posted numeric value, conditions, or jurisdiction are identical. The country-specific class remains available for exact local guidance.

## Required unseen variations

For every class, record at least one held-out example for each available condition:

- different road/background and sign instance
- oblique photo angle
- bright and low lighting
- resized or distant sign
- partial crop or obstruction
- mild blur/noise
- typography or language variation that remains a legitimate sign

Do not apply transformations that change the sign's meaning. Split source photographs before augmentation and run `python ml/audit_dataset.py` to detect byte-identical train/validation/test leakage.

## Runtime safety tests

| Test | Expected |
| --- | --- |
| Blank scene | `NO_MATCH`; no speech |
| Unsupported sign | `NO_MATCH`; no speech |
| Supported category below semantic threshold | `RELATED`; no speech |
| Candidate class | Debug data visible; no legal alert or grounded Q&A |
| Tested class while route preview is open | No Current Guidance speech |
| Tested class after Start Driving | Short country-local guidance; queued once |
| Japan drive | Only JP rules are returned/spoken |
| Philippines drive | Only PH rules are returned/spoken |

`ml/validate_yolo.py` writes `image`, `country`, `expected_class`, `predicted_class`, `confidence`, `normalized_meaning`, bounding-box IoU, and PASS/FAIL. Record physical-camera evidence under `docs/evidence/` with commit, browser, model/weights, variation, response, audio state, and screenshot.
