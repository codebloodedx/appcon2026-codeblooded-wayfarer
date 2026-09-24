import type { ParsedImage } from './image.js';
import type { CountryCode, ModelRecognition, RecognitionEvidence, RuleRecord } from './types.js';

export interface GuidanceModel {
  recognize(image: ParsedImage, countryCode: CountryCode, catalog: RuleRecord[]): Promise<ModelRecognition>;
  explain(rule: RuleRecord, question: string): Promise<string>;
}

export const recognitionThreshold = 0.55;
export const semanticMatchThreshold = 0.7;
export const exactVisualThreshold = 0.9;

export function score(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

export function parseEvidence(value: unknown): RecognitionEvidence {
  const evidence = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const field = (name: string) => typeof evidence[name] === 'string' ? String(evidence[name]).slice(0, 160) : '';
  return { shape: field('shape'), symbol: field('symbol'), text: field('text'), color: field('color') };
}

export function emptyRecognition(): ModelRecognition {
  return {
    detectedCountry: null,
    detectedSign: null,
    modelClass: null,
    normalizedCategory: null,
    confidence: 0,
    closestReferenceId: null,
    visualSimilarity: 0,
    semanticSimilarity: 0,
    evidence: { shape: '', symbol: '', text: '', color: '' },
    bbox: null,
  };
}

export function parseBoundingBox(value: unknown): [number, number, number, number] | null {
  if (!Array.isArray(value) || value.length !== 4 || !value.every((point) => typeof point === 'number' && Number.isFinite(point))) return null;
  const scale = value.some((point) => point > 1) && value.every((point) => point >= 0 && point <= 1000) ? 1000 : 1;
  const points = value.map((point) => score(point / scale));
  return points[0] < points[2] && points[1] < points[3] ? points as [number, number, number, number] : null;
}
