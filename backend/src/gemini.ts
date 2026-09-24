import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { ParsedImage } from './image.js';
import {
  emptyRecognition,
  parseBoundingBox,
  parseEvidence,
  recognitionThreshold,
  score,
  type GuidanceModel,
} from './guidanceModel.js';
import { isModelClass, type CountryCode, type ModelClass, type ModelRecognition, type RuleRecord, type SignCategory } from './types.js';

type RecognitionPayload = {
  detectedCountry?: unknown;
  detectedSign?: unknown;
  modelClass?: unknown;
  normalizedCategory?: unknown;
  confidence?: unknown;
  closestReferenceId?: unknown;
  visualSimilarity?: unknown;
  semanticSimilarity?: unknown;
  evidence?: unknown;
  bbox?: unknown;
};

const unknownAnswer = 'The reviewed source does not answer that question.';

function requireProject(): string {
  const project = process.env.GOOGLE_CLOUD_PROJECT?.trim();
  if (!project) throw new Error('GEMINI_NOT_CONFIGURED');
  return project;
}

function client(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (apiKey) return new GoogleGenAI({ apiKey });

  return new GoogleGenAI({
    vertexai: true,
    project: requireProject(),
    location: process.env.GOOGLE_CLOUD_LOCATION?.trim() || 'global',
  });
}

function parseJsonObject(content: string | undefined): RecognitionPayload {
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

function flattenRecognitionPayload(payload: RecognitionPayload): RecognitionPayload {
  if (!payload.detectedSign || typeof payload.detectedSign !== 'object' || Array.isArray(payload.detectedSign)) return payload;
  const nested = payload.detectedSign as RecognitionPayload;
  return {
    ...payload,
    ...nested,
    detectedSign: typeof nested.detectedSign === 'string'
      ? nested.detectedSign
      : typeof nested.modelClass === 'string'
        ? nested.modelClass
        : null,
  };
}

export class GeminiGuidanceModel implements GuidanceModel {
  async recognize(image: ParsedImage, countryCode: CountryCode, catalog: RuleRecord[]): Promise<ModelRecognition> {
    const unknown = emptyRecognition();
    if (catalog.length === 0) return unknown;
    const allowedIds = new Set(catalog.map((rule) => rule.id));
    const allowedCategories = new Set(catalog.map((rule) => rule.normalizedCategory));
    const references = catalog.map((rule) => ({
      id: rule.id,
      modelClass: rule.modelClass,
      country: rule.countryCode,
      officialName: rule.officialName,
      normalizedCategory: rule.normalizedCategory,
      meaning: rule.meaning,
      aliases: rule.aliases,
      visualDescription: rule.visualDescription,
    }));
    const response = await client().models.generateContent({
      model: process.env.GEMINI_VISION_MODEL?.trim() || 'gemini-3.6-flash',
      contents: [{
        role: 'user',
        parts: [
          { text: `Country hint: ${countryCode}\nSemantic sign catalog: ${JSON.stringify(references)}` },
          { inlineData: { mimeType: image.mimeType, data: image.base64 } },
        ],
      }],
      config: {
        systemInstruction: [
          'You are the visual recognition component of WayFarer.',
          'Classify one clearly visible traffic sign by its rule or meaning, not by exact pixels, typography, language, or artwork.',
          'Use shape, symbol, OCR text, color, and layout as evidence. Treat country as a hint, never proof.',
          'Choose exactly one supplied modelClass, then return its normalizedCategory. Never create another class.',
          'A differently designed sign can share the same normalizedCategory. Do not require an identical reference image.',
          'Return null values when the sign is unclear, unsupported, or ambiguous. Never invent a category or reference ID.',
          'visualSimilarity measures design resemblance; semanticSimilarity measures meaning/category agreement.',
          'Search the whole photo, including signs shown on paper or another screen during a stationary prototype demo.',
          'Return bbox as [xMin,yMin,xMax,yMax], each normalized from 0 to 1, tightly around only the visible sign face.',
          'Do not return the whole image as the bbox unless the sign face truly fills almost the entire image.',
          'Return one flat JSON object only. Do not nest fields inside detectedSign.',
          'The flat keys are detectedCountry (JP, PH, or null), detectedSign (a short string or null), modelClass, normalizedCategory, confidence, closestReferenceId, visualSimilarity, semanticSimilarity, bbox, and evidence {shape,symbol,text,color}. Scores are 0 to 1.',
        ].join(' '),
        maxOutputTokens: 800,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        responseMimeType: 'application/json',
      },
    });

    const parsed = flattenRecognitionPayload(parseJsonObject(response.text));
    if (process.env.WAYFARER_PROVIDER_DEBUG === 'true') {
      console.debug('Gemini recognition payload:', JSON.stringify(parsed));
    }
    const category = typeof parsed.normalizedCategory === 'string' && allowedCategories.has(parsed.normalizedCategory as SignCategory)
      ? parsed.normalizedCategory as SignCategory
      : null;
    const modelClass = isModelClass(parsed.modelClass) && catalog.some((rule) => rule.modelClass === parsed.modelClass)
      ? parsed.modelClass as ModelClass
      : null;
    const proposedReference = typeof parsed.closestReferenceId === 'string' && allowedIds.has(parsed.closestReferenceId)
      ? catalog.find((rule) => rule.id === parsed.closestReferenceId)
      : undefined;
    const referenceId = proposedReference?.normalizedCategory === category && proposedReference.modelClass === modelClass ? proposedReference.id : null;
    const result: ModelRecognition = {
      detectedCountry: parsed.detectedCountry === 'JP' || parsed.detectedCountry === 'PH' ? parsed.detectedCountry : null,
      detectedSign: typeof parsed.detectedSign === 'string' ? parsed.detectedSign.slice(0, 120) : null,
      modelClass,
      normalizedCategory: category,
      confidence: score(parsed.confidence),
      closestReferenceId: referenceId,
      visualSimilarity: score(parsed.visualSimilarity),
      semanticSimilarity: score(parsed.semanticSimilarity),
      evidence: parseEvidence(parsed.evidence),
      bbox: parseBoundingBox(parsed.bbox),
    };
    return result.confidence >= recognitionThreshold && result.normalizedCategory && result.modelClass ? result : unknown;
  }

  async explain(rule: RuleRecord, question: string): Promise<string> {
    const reviewedContext = {
      label: rule.label,
      explanation: rule.explanation,
      conditions: rule.conditions,
      exceptions: rule.exceptions,
      etiquette: rule.etiquette,
    };
    const response = await client().models.generateContent({
      model: process.env.GEMINI_TEXT_MODEL?.trim() || 'gemini-3.6-flash',
      contents: `Reviewed record: ${JSON.stringify(reviewedContext)}\nTraveler question: ${question}`,
      config: {
        systemInstruction: `Answer briefly using only the reviewed record. Do not add rules, penalties, distances, times, or exceptions. If the record does not answer the question, reply exactly: ${unknownAnswer}`,
        temperature: 0,
        maxOutputTokens: 160,
      },
    });
    return response.text?.trim() || unknownAnswer;
  }
}
