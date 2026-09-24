# Rule sources and asset provenance

**Owner:** John Asher Manit (`@99lash`)
**Reviewed:** 24 September 2026
**Status:** Ten candidate records. No sign is supported until licensed held-out and physical live-camera evidence pass.

## Official rule sources

| Country | Active visual classes | Primary rule source |
| --- | --- | --- |
| Japan | Stop, Maximum Speed 30, Pedestrian Crossing, No Parking, No U-turn | [Japan National Police Agency road rules and sign sheet](https://www.npa.go.jp/english/bureau/traffic/document/r8_followtherules_en02.pdf) |
| Philippines | Stop, Maximum Speed 50, Pedestrian Crossing, No Parking, No U-turn | [LTO Filipino Driver's Manual, Volume 1](https://lto.gov.ph/wp-content/uploads/2023/10/FDM-Vol.-1-2nd-Edition.pdf) |

Japan traffic-light phrasing is cross-checked against [JAF Traffic Rules in Japan](https://english.jaf.or.jp/driving-in-japan/traffic-rules). Japan stop/railroad training context is also available in [JAF Motor Vehicle Training](https://english.jaf.or.jp/safe-driving/quiz/motorvehicles). Rule text in `shared/rules/` is a short paraphrase and retains its source URL. No fixed distance, penalty, or local exception is inferred from a sign image.

## Candidate training-photo sources

| Dataset | License / inspected size | Usable selected labels | Gap before training |
| --- | --- | --- | --- |
| [Ritsumeikan Japanese Road Signs](https://universe.roboflow.com/ritsumeikan/japanese-road-signs) | CC BY 4.0; 195 images | `Speed Limit 30`; photographs inside broad Warning/Information/Mandatory/Prohibitory classes | Manually inspect and relabel Stop, Pedestrian Crossing, No Parking, and No U-turn into exact classes. |
| [NOS Philippine Traffic Sign Dataset](https://universe.roboflow.com/nos-workspace-vsodn/philippine-traffic-sign-dataset-9kz1e-qvpnr-jirzn) | CC BY 4.0; 5,895 images | `50kph_speed_limit`, `pedestrian_crossing`, `no_parking`, `no_uturn` | Exact Stop label was absent from the inspected class list; add licensed PH Stop photos. |
| [Philippine Traffic Sign Dataset 2](https://universe.roboflow.com/louie-pxb7x/philippine-traffic-sign-dataset-2-ykwa6-kgiii) | CC BY 4.0; 3,538 augmented images | Same four exact PH categories as an alternative | Do not mix augmentations or near-duplicates across train and held-out splits. |

`data/sign_classes.json` records the exact source and current preparation status per class. A public dataset page is evidence of availability and license, not evidence that the training data has already been exported. Preserve attribution and the downloaded version metadata when the team exports it.

## Interface fixtures

The illustrations under `frontend/public/signs/test/` are simplified SVG fixtures for the supported-sign list and stationary camera demo. They are not model training data, held-out validation data, or pixel templates. The application never compares input pixels to these files.

## Current Guidance rules

`shared/rules/driving-guidance.json` stores verified short prompts separately from vision output. Each record identifies country, event, priority, message, source, trigger mode, cooldown, and jurisdiction. Japan and Philippines rules never share a runtime record. City or time-based restrictions require matching locality and necessary context; otherwise the repository withholds them.

Controlled route events are explicitly labeled `simulation`. CV events depend on a recognized, tested sign. Browser speech begins only while navigation status is `driving`, uses a priority queue, and deduplicates an event instance.

## Unverified claims kept out of guidance

Current Metro Manila number-coding hours, exceptions, vehicle conditions, and boundary geometry are not established in the active rules. The route preview stays labeled simulation. Missing locality, time, weather, plate, or vehicle context causes the relevant rule to be withheld rather than guessed.

## Gate to `tested`

1. Export licensed photographs and complete the exact-class relabeling.
2. Pass `python ml/audit_dataset.py` with no duplicate split leakage.
3. Train and record model/version/parameters.
4. Pass the unseen validation matrix in `docs/test-matrix.md`.
5. Run one supported and one unknown physical live-camera control and record browser, commit, scores, audio state, and screenshots under `docs/evidence/`.
6. Ranee reviews the evidence before changing any record from `candidate` to `tested`.
