import Groq from 'groq-sdk';
import type { ParsedImage } from './image.js';
import type { CountryCode, RuleRecord } from './types.js';

export interface GuidanceModel {
  recognize(image: ParsedImage, countryCode: CountryCode, allowedRules: RuleRecord[]): Promise<string | null>;
  explain(rule: RuleRecord, question: string): Promise<string>;
}

type RecognitionPayload = {
  signId?: unknown;
  confidence?: unknown;
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
    return new Groq({ apiKey: requireKey() });
  }

  async recognize(image: ParsedImage, countryCode: CountryCode, allowedRules: RuleRecord[]): Promise<string | null> {
    if (allowedRules.length === 0) return null;
    const allowedIds = allowedRules.map((rule) => rule.id);
    const labels = allowedRules.map((rule) => ({ id: rule.id, label: rule.label }));
    const response = await this.client().chat.completions.create({
      model: process.env.GROQ_VISION_MODEL || 'qwen/qwen3.8-27b',
      temperature: 0,
      max_completion_tokens: 120,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: [
            'You are the visual recognition component of WayFarer.',
            'Identify only a clearly visible road sign from the supplied allowlist.',
            'The selected country is context, not evidence that a sign is present.',
            'When the image is unclear, unsupported, or ambiguous, return unknown.',
            'Return JSON only: {"signId":"allowed ID or unknown","confidence":0.0}.',
          ].join(' '),
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Selected country: ${countryCode}\nAllowed signs: ${JSON.stringify(labels)}`,
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
    const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0;
    return typeof parsed.signId === 'string'
      && allowedIds.includes(parsed.signId)
      && confidence >= 0.65
      ? parsed.signId
      : null;
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
