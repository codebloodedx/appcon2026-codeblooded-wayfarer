import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { CountryCode, SignCategory } from './types.js';

const defaultPath = fileURLToPath(new URL('../../shared/rules/recognition-tests.json', import.meta.url));

export type RecognitionTestCase = {
  id: string;
  testType: 'country-specific' | 'equivalent';
  input: string;
  countryCode: CountryCode;
  expectedCategory: SignCategory;
  assetPath: string;
  pairId?: string;
  expectedResult: string;
};

export async function readRecognitionTests(): Promise<RecognitionTestCase[]> {
  const parsed = JSON.parse(await readFile(defaultPath, 'utf8')) as unknown;
  return Array.isArray(parsed) ? parsed as RecognitionTestCase[] : [];
}
