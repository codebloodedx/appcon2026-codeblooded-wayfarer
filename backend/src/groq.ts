import Groq from 'groq-sdk';
import type { ParsedImage } from './image.js';
import type { CountryCode, ModelRecognition, RecognitionEvidence, RuleRecord, SignCategory } from './types.js';

export interface GuidanceModel {
  recognize(image: ParsedImage, countryCode: CountryCode, catalog: RuleRecord[]): Promise<ModelRecognition>;
  explain(rule: RuleRecord, question: string): Promise<string>;
}

type RecognitionPayload = {
  detectedCountry?: unknown;
  detectedSign?: unknown;
  normalizedCategory?: unknown;
  confidence?: unknown;
  closestReferenceId?: unknown;
  visualSimilarity?: unknown;
  semanticSimilarity?: unknown;
  evidence?: unknown;
};

const unknownAnswer = 'The reviewed source does not answer that question.';

function requireKey(): string {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) throw new Error('GROQ_NOT_CONFIGURED');
  return key;
}

function parseJsonObject(content: string | null): RecognitionPayload {
  if (!content) return {};
  try {
    return JSON.parse(content) as RecognitionPayload;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try {
      return JSON.parse(match[0]) as RecognitionPayload;
    } catch {
      return {};
    }
  }
}

export class GroqGuidanceModel implements GuidanceModel {
  private client(): Groq {
    return new Groq({ apiKey: requireKey(), timeout: 25_000, maxRetries: 1 });
  }

  async recognize(image: ParsedImage, countryCode: CountryCode, catalog: RuleRecord[]): Promise<ModelRecognition> {
    const unknown = emptyRecognition();
    if (catalog.length === 0) return unknown;
    const allowedIds = new Set(catalog.map((rule) => rule.id));
    const allowedCategories = new Set(catalog.map((rule) => rule.normalizedCategory));
    const references = catalog.map((rule) => ({
      id: rule.id,
      country: rule.countryCode,
      officialName: rule.officialName,
      normalizedCategory: rule.normalizedCategory,
      meaning: rule.meaning,
      aliases: rule.aliases,
      visualDescription: rule.visualDescription,
    }));
    const response = await this.client().chat.completions.create({
      model: process.env.GROQ_VISION_MODEL || 'qwen/qwen3.8-27b',
      temperature: 0,
      max_completion_tokens: 420,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: [
            'You are the visual recognition component of WayFarer.',
            'Classify one clearly visible traffic sign by its rule or meaning, not by exact pixels, typography, language, or artwork.',
            'Use shape, symbol, OCR text, color, and layout as evidence. Treat country as a hint, never proof.',
            'First choose a normalizedCategory from the catalog, then the closest country-specific reference.',
            'A differently designed sign can share the same normalizedCategory. Do not require an identical reference image.',
            'Return unknown values when the sign is unclear, unsupported, or ambiguous. Never invent a category or reference ID.',
            'visualSimilarity measures design resemblance to the closest reference; semanticSimilarity measures meaning/category agreement.',
            'Return JSON only with detectedCountry (JP, PH, or null), detectedSign, normalizedCategory, confidence, closestReferenceId, visualSimilarity, semanticSimilarity, and evidence {shape,symbol,text,color}. Scores are 0 to 1.',
          ].join(' '),
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Country hint: ${countryCode}\nSemantic sign catalog: ${JSON.stringify(references)}`,
            },
            {
              type: 'image_url',
              image_url: { url: `data:${image.mimeType};base64,${image.base64}` },
            },
          ],
        },
      ],
    });

    const parsed = parseJsonObject(response.choices[0]?.message?.content || null);
    const category = typeof parsed.normalizedCategory === 'string' && allowedCategories.has(parsed.normalizedCategory as SignCategory)
      ? parsed.normalizedCategory as SignCategory
      : null;
    const proposedReference = typeof parsed.closestReferenceId === 'string' && allowedIds.has(parsed.closestReferenceId)
      ? catalog.find((rule) => rule.id === parsed.closestReferenceId)
      : undefined;
    const referenceId = proposedReference?.normalizedCategory === category ? proposedReference.id : null;
    const evidence = parseEvidence(parsed.evidence);
    const result: ModelRecognition = {
      detectedCountry: parsed.detectedCountry === 'JP' || parsed.detectedCountry === 'PH' ? parsed.detectedCountry : null,
      detectedSign: typeof parsed.detectedSign === 'string' ? parsed.detectedSign.slice(0, 120) : null,
      normalizedCategory: category,
      confidence: score(parsed.confidence),
      closestReferenceId: referenceId,
      visualSimilarity: score(parsed.visualSimilarity),
      semanticSimilarity: score(parsed.semanticSimilarity),
      evidence,
    };
    return result.confidence >= recognitionThreshold && result.normalizedCategory ? result : unknown;
  }

  async explain(rule: RuleRecord, question: string): Promise<string> {
    const reviewedContext = {
      label: rule.label,
      explanation: rule.explanation,
      conditions: rule.conditions,
      exceptions: rule.exceptions,
      etiquette: rule.etiquette,
    };
    const response = await this.client().chat.completions.create({
      model: process.env.GROQ_TEXT_MODEL || 'qwen/qwen3.8-27b',
      temperature: 0,
      max_completion_tokens: 160,
      messages: [
        {
          role: 'system',
          content: `Answer briefly using only the reviewed record. Do not add rules, penalties, distances, times, or exceptions. If the record does not answer the question, reply exactly: ${unknownAnswer}`,
        },
        {
          role: 'user',
          content: `Reviewed record: ${JSON.stringify(reviewedContext)}\nTraveler question: ${question}`,
        },
      ],
    });
    return response.choices[0]?.message?.content?.trim() || unknownAnswer;
  }
}

export const recognitionThreshold = 0.55;
export const semanticMatchThreshold = 0.7;
export const exactVisualThreshold = 0.9;

function score(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

function parseEvidence(value: unknown): RecognitionEvidence {
  const evidence = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const field = (name: string) => typeof evidence[name] === 'string' ? String(evidence[name]).slice(0, 160) : '';
  return { shape: field('shape'), symbol: field('symbol'), text: field('text'), color: field('color') };
}

export function emptyRecognition(): ModelRecognition {
  return {
    detectedCountry: null,
    detectedSign: null,
    normalizedCategory: null,
    confidence: 0,
    closestReferenceId: null,
    visualSimilarity: 0,
    semanticSimilarity: 0,
    evidence: { shape: '', symbol: '', text: '', color: '' },
  };
}
