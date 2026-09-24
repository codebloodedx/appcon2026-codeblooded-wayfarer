# Semantic sign recognition architecture

**Updated:** 24 September 2026  
**Scope:** Controlled Japan and Philippines prototype. All newly expanded sign records remain `candidate` until live acceptance evidence exists.

## Audit of the previous implementation

The previous path did not use image hashes, pixel comparison, template matching, filename matching, or a local embedding model. It sent the image to Groq-hosted Qwen, but constrained the model to one exact ID from the selected country's three-record allowlist. The response contract contained only `signId` and `confidence`; the backend discarded OCR, symbol, country, category, similarity, and reasoning signals. A fixed `0.65` threshold then accepted or rejected the exact ID.

This made the multimodal model behave like a tiny closed-set lookup. It could not express that two visually different signs shared a meaning, and it could not return a normalized category independently of a country-specific reference.

## Current pipeline

```text
Input image
  ↓
Whole-frame sign inspection (live camera already supplies sampled frames)
  ↓
Multimodal feature reading: shape + symbol + OCR text + color + layout
  ↓
Normalized semantic category (for example NO_PARKING)
  ↓
Closest visual catalog record and detected-country evidence
  ↓
Backend validation against known categories and record IDs
  ↓
Active-country rule resolution + opposite-country equivalent lookup
  ↓
Candidate/tested safety gate
```

There is no local embedding model in this MVP. Qwen's multimodal representation supplies visual and semantic judgments in one call. The backend keeps those two scores separate, validates every category and reference against the local catalog, and never accepts model-generated legal guidance.

## Match definitions and thresholds

| Match type | Rule |
| --- | --- |
| `EXACT_MATCH` | The closest reference is the active-country rule and visual similarity is at least `0.90`. |
| `SEMANTIC_MATCH` | The normalized category resolves to an active-country rule and semantic similarity is at least `0.70`, even when the closest design differs or comes from the other country. |
| `RELATED` | A category was suggested, but its semantic evidence is below the acceptance threshold. Related is not treated as a successful recognition. |
| `NO_MATCH` | The category is missing or unsupported. |

The model result is considered classifiable at confidence `0.55` or greater. A result below that returns unknown. These MVP thresholds are explicit constants in `backend/src/groq.ts`; they must be recalibrated from recorded test evidence before production use.

## Why this is not memorizing fixtures

- The request sent to the model contains category meanings, aliases, and visual descriptions, not asset filenames or expected test labels.
- The result can normalize to a category even when no exact visual reference is selected.
- Live-camera tests vary the physical angle, lighting, crop, obstruction, apparent size, and background. The application does not perform pixel or template comparison.
- The backend resolves meaning first and the local country record second.
- Static SVGs are reproducible test fixtures. They are not used as templates and their pixels are never compared by application code.

## Safety boundary

Recognition evidence and source-reviewed driving guidance remain separate. Candidate classifications and semantic debug data appear directly under the live camera. Parked details provides manual photo capture/upload and source review. Candidate records cannot call `/api/speak` or `/api/explain`; only a record promoted to `tested` after live positive and negative evidence can produce spoken guidance.

The expanded catalog is useful for model evaluation, not proof of reliable on-road operation. Whole-frame inspection may miss small signs in cluttered scenes; a production system should add an object detector/crop stage, collect licensed real-world images, calibrate by category, and measure confusion and false-positive rates.
