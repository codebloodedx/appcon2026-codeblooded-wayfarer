# Ten-class traffic-sign recognition architecture

**Updated:** 24 September 2026  
**Scope:** Exactly five Japan classes and five Philippines classes. All ten remain `candidate` until licensed held-out photos and physical live-camera evidence pass.

## Audit

The repository had no YOLO package, training data, weights, detector, crop stage, image hashes, pixel comparison, template matching, filename matching, or local embeddings. Live recognition samples a whole camera frame every 2.5 seconds and sends it to Gemini on Vertex AI. The earlier catalog was too broad: 24 candidate records and 18 normalized categories. Its strict reference-ID prompt made a capable multimodal model behave like a small closed-set lookup.

## Active classes

`data/sign_classes.json`, `shared/rules/rules.json`, the backend allowlist, and `ml/wayfarer-signs.yaml` now share exactly these ten classes:

- Japan: `JP_STOP`, `JP_MAX_SPEED_30`, `JP_PEDESTRIAN_CROSSING`, `JP_NO_PARKING`, `JP_NO_U_TURN`
- Philippines: `PH_STOP`, `PH_MAX_SPEED_50`, `PH_PEDESTRIAN_CROSSING`, `PH_NO_PARKING`, `PH_NO_U_TURN`

The five normalized categories are `STOP`, `MAX_SPEED`, `PEDESTRIAN_CROSSING`, `NO_PARKING`, and `NO_U_TURN`. Stop, Pedestrian Crossing, No Parking, and No U-turn name their true cross-country equivalent through `semanticEquivalent`. Japan 30 km/h and Philippines 50 km/h share the broad `MAX_SPEED` category but deliberately have no semantic equivalent because their posted values differ.

## Current live path

```text
Sampled live camera frame
  -> Gemini whole-frame visual reading
  -> one allowlisted modelClass + normalized bounding box
  -> normalized semantic category
  -> active-country rule lookup
  -> candidate/tested safety gate
  -> compact debug output
```

The response includes country, model class, normalized category, confidence, bounding box, closest reference, visual similarity, semantic similarity, match type, and equivalent class. Gemini supplies recognition evidence only. It does not write road rules.

## Match definitions

| Match type | Meaning |
| --- | --- |
| `EXACT_MATCH` | Predicted class and closest active-country reference are the same, with visual similarity at least `0.90`. |
| `SEMANTIC_MATCH` | Country designs differ, but both normalize to the same category with semantic similarity at least `0.70`. |
| `RELATED` | A supported category was suggested below the semantic threshold; it is not accepted. |
| `NO_MATCH` | No supported class/category was returned. |

The multimodal confidence threshold is `0.55`. These values are prototype constants in `backend/src/guidanceModel.ts` and require calibration with held-out evidence.

## YOLO transfer-learning path

`ml/` adds a reproducible YOLO11 transfer-learning scaffold without pretending weights exist:

1. Export only the selected source labels with the source license intact.
2. Manually relabel the broad Japanese source categories into the exact selected classes.
3. Add licensed Philippines Stop photographs; that exact class is absent from the inspected public PH dataset labels.
4. Split by source image before augmentation into train, validation, and test.
5. Run `python ml/audit_dataset.py`. It checks class counts, annotation validity, missing split coverage, and duplicate leakage by SHA-256.
6. Run `python ml/train_yolo.py` to fine-tune pretrained `yolo11n.pt` with restrained augmentation.
7. Run `python ml/validate_yolo.py <weights>` to create a held-out per-object matrix and fail when any row is missed, misclassified, or below the requested IoU.

No dataset export, trained weights, or held-out YOLO result is committed. A Roboflow account/API export and manual relabeling are still required. The Gemini live path is therefore the current prototype recognizer after Vertex authentication succeeds.

## Data provenance

- Japan candidate source: Ritsumeikan Japanese Road Signs on Roboflow Universe, CC BY 4.0, 195 images. Its public labels are broad except `Speed Limit 30`, so four exact classes require photo review and relabeling.
- Philippines candidate source: NOS Philippine Traffic Sign Dataset, CC BY 4.0, 5,895 images. It exposes exact labels for speed 50, pedestrian crossing, no parking, and no U-turn. It does not expose Stop in the inspected public class list.
- Louie's Philippine Traffic Sign Dataset 2, CC BY 4.0, 3,538 augmented images, is documented as an alternative for the same four exact PH labels.

The SVGs in `frontend/public/signs/test/` are UI/demo fixtures only. They must never enter the training, validation, or held-out test sets.

## Safety boundary

All ten records remain `candidate`. During active driving, a candidate detection is visibly labeled and may speak only the concise source-reviewed `shortAlert` already stored in the catalog. The model never writes the message. `/api/speak` and unrestricted `/api/explain` remain gated to tested records. A record becomes `tested` only after source review, unseen-photo validation, and a physical live-camera positive and negative run are recorded. Unknown or unsupported frames remain silent.
