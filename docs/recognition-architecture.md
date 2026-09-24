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
| `EXACT_MATCH` | Both results use the same closest reference and each visual similarity is at least `0.90`. |
| `SEMANTIC_MATCH` | Normalized categories are identical and both semantic similarity scores are at least `0.70`, even if visual designs differ. |
| `RELATED` | Categories differ but belong to a deliberately defined traffic-concept group, such as vehicle-entry restrictions. Related is not treated as a successful recognition. |
| `NO_MATCH` | The category is missing, unsupported, or unrelated. |

The model result is considered classifiable at confidence `0.55` or greater. A result below that returns unknown. These MVP thresholds are explicit constants in `backend/src/groq.ts`; they must be recalibrated from recorded test evidence before production use.

## Why this is not memorizing fixtures

- The request sent to the model contains category meanings, aliases, and visual descriptions, not asset filenames or expected test labels.
- The result can normalize to a category even when no exact visual reference is selected.
- The browser creates altered raster inputs for angle, low light, crop, obstruction, small size, and background tests.
- The backend resolves meaning first and the local country record second.
- Static SVGs are reproducible test fixtures. They are not used as templates and their pixels are never compared by application code.

## Safety boundary

Recognition evidence and source-reviewed driving guidance remain separate. Candidate classifications can appear in the parked test lab, but cannot call `/api/speak` or `/api/explain`. Only a record promoted to `tested` after live positive and negative evidence can produce spoken guidance.

The expanded catalog is useful for model evaluation, not proof of reliable on-road operation. Whole-frame inspection may miss small signs in cluttered scenes; a production system should add an object detector/crop stage, collect licensed real-world images, calibrate by category, and measure confusion and false-positive rates.
