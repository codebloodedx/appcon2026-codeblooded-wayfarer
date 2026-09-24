# Semantic sign test matrix

**Owner:** John Asher Manit (`@99lash`) for rule/source evidence; Ranee for recognition integration
**Updated:** 24 September 2026

All records are `candidate`. A PASS in the Recognition Lab means the model returned the expected normalized category. It does not promote the sign to tested driving guidance. Record browser, model name, commit, variation, scores, response, audio state, and screenshot under `docs/evidence/` for a live acceptance run.

## Country-specific set

These categories are documented by the named country's source and are not normally part of the other country's standard sign catalog used by this prototype.

| Input | Expected category | Country | Expected detection result |
| --- | --- | --- | --- |
| Slow (徐行 / SLOW) | `SLOW` | Japan | Japan-specific candidate |
| Use of the Horn | `HORN_REQUIRED` | Japan | Japan-specific candidate |
| Moped two-stage right turn | `MOPED_TWO_STAGE_RIGHT` | Japan | Japan-specific candidate |
| Priority road ahead | `PRIORITY_ROAD_AHEAD` | Japan | Japan-specific candidate |
| Road closed without tire chains | `TIRE_CHAINS_REQUIRED` | Japan | Japan-specific candidate |
| No Jeepneys | `NO_JEEPNEYS` | Philippines | Philippines-specific candidate |
| No Tricycles | `NO_TRICYCLES` | Philippines | Philippines-specific candidate |
| No Pushcarts | `NO_PUSHCARTS` | Philippines | Philippines-specific candidate |
| No Animal-drawn Vehicles | `NO_ANIMAL_DRAWN_VEHICLES` | Philippines | Philippines-specific candidate |
| BUS–PUJ Stop | `BUS_PUJ_STOP` | Philippines | Philippines-specific candidate |

## Cross-country equivalent pairs

| Japan input | Philippines input | Expected normalized category | Expected pair result |
| --- | --- | --- | --- |
| Inverted-triangle Stop (止まれ) | Octagonal STOP | `STOP` | `SEMANTIC_MATCH` |
| Red-disc No Entry | Philippine No Entry restriction | `NO_ENTRY` | `SEMANTIC_MATCH` |
| Maximum Speed 40 | Maximum speed restriction 40 | `MAX_SPEED` | `SEMANTIC_MATCH` |
| Blue Pedestrian Crossing | Yellow diamond Pedestrian Crossing | `PEDESTRIAN_CROSSING` | `SEMANTIC_MATCH` |
| Blue/red No Parking | Text/symbol No Parking | `NO_PARKING` | `SEMANTIC_MATCH` |
| Japan No U-turn | Philippine No U-turn | `NO_U_TURN` | `SEMANTIC_MATCH` |

Each individual result must return its expected category. The pair comparison must return `semanticMatch: true`. The images are intentionally different designs; identical images are not required.

## Visual variation suite

Run every country-specific input and both images from every equivalent pair under:

1. Original fixture
2. Changed photo angle
3. Low lighting
4. Shifted color/saturation
5. Cropped edges
6. Partial obstruction
7. Resized/small sign
8. Different busy background

The lab applies these transformations to a rasterized image before upload. The model does not receive the filename or expected label. A category mismatch is FAIL. An honest unknown under severe obstruction is recorded as FAIL for that test row but must remain silent; a confident wrong driving category is a blocker.

## Negative and safety checks

| Input | Expected |
| --- | --- |
| Blank scene | `NO_MATCH`, unknown, no audio |
| Unsupported sign | `NO_MATCH`, unknown, no audio |
| Related but different restriction | `RELATED`, no successful semantic match, no audio |
| Candidate result | Visible candidate data, `/api/speak` and `/api/explain` reject it |

The executable catalog is `shared/rules/recognition-tests.json`. The parked **Recognition lab** screen renders the requested columns: Input, Expected Category, Predicted Category, Country, Confidence, Semantic Match, and Result.
