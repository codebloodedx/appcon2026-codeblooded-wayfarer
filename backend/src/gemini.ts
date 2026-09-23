import { GoogleGenAI, Type } from '@google/genai';
import type { CountryCode, RuleRecord } from './types.js';
import type { ParsedImage } from './image.js';

export interface GuidanceModel {
  recognize(image: ParsedImage, countryCode: CountryCode, allowedRules: RuleRecord[]): Promise<string | null>;
  explain(rule: RuleRecord, question: string): Promise<string>;
  speak(text: string): Promise<Buffer>;
}

function requireKey(): string {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error('GEMINI_NOT_CONFIGURED');
  return key;
}

function wavFromPcm(pcm: Buffer, sampleRate = 24_000): Buffer {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

export class GeminiGuidanceModel implements GuidanceModel {
  private client(): GoogleGenAI {
    return new GoogleGenAI({ apiKey: requireKey() });
  }

  async recognize(image: ParsedImage, countryCode: CountryCode, allowedRules: RuleRecord[]): Promise<string | null> {
    if (allowedRules.length === 0) return null;
    const allowedIds = allowedRules.map((rule) => rule.id);
    const labels = allowedRules.map((rule) => `${rule.id}: ${rule.label}`).join('\n');
    const response = await this.client().models.generateContent({
      model: process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash',
      contents: [
        { inlineData: { mimeType: image.mimeType, data: image.base64 } },
        { text: `Classify the most prominent road sign for country ${countryCode}. Return one allowed ID only when it is clearly visible; otherwise return unknown.\n${labels}` },
      ],
      config: {
        temperature: 0,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: { signId: { type: Type.STRING, enum: [...allowedIds, 'unknown'] } },
          required: ['signId'],
        },
      },
    });
    try {
      const parsed = JSON.parse(response.text || '{}') as { signId?: unknown };
      return typeof parsed.signId === 'string' && allowedIds.includes(parsed.signId) ? parsed.signId : null;
    } catch {
      return null;
    }
  }

  async explain(rule: RuleRecord, question: string): Promise<string> {
    const reviewedContext = JSON.stringify({
      label: rule.label,
      explanation: rule.explanation,
      conditions: rule.conditions,
      exceptions: rule.exceptions,
      etiquette: rule.etiquette,
    });
    const response = await this.client().models.generateContent({
      model: process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash',
      contents: `Reviewed record: ${reviewedContext}\nTraveler question: ${question}`,
      config: {
        temperature: 0,
        maxOutputTokens: 160,
        systemInstruction: 'Answer briefly using only the reviewed record. Do not add rules, penalties, distances, times, or exceptions. If the record does not answer the question, reply exactly: The reviewed source does not answer that question.',
      },
    });
    return response.text?.trim() || 'The reviewed source does not answer that question.';
  }

  async speak(text: string): Promise<Buffer> {
    const interaction = await this.client().interactions.create({
      model: process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview',
      input: `Read this driving alert clearly and calmly, exactly as written: ${text}`,
      response_format: { type: 'audio' },
      generation_config: { speech_config: [{ voice: process.env.GEMINI_TTS_VOICE || 'Kore' }] },
    });
    const audioData = interaction.output_audio?.data;
    if (!audioData) throw new Error('GEMINI_AUDIO_UNAVAILABLE');
    return wavFromPcm(Buffer.from(audioData, 'base64'));
  }
}
