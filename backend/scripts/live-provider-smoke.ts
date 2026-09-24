import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GroqGuidanceModel } from '../src/groq.js';
import type { CountryCode, RuleRecord } from '../src/types.js';

const backendDirectory = fileURLToPath(new URL('..', import.meta.url));
dotenv.config({ path: resolve(backendDirectory, '..', '.env') });

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function mimeType(path: string): 'image/jpeg' | 'image/png' | 'image/webp' {
  const extension = extname(path).toLowerCase();
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  throw new Error('The image must be a JPEG, PNG, or WebP file.');
}

const requestedCountry = argument('country') || 'JP';
if (requestedCountry !== 'JP' && requestedCountry !== 'PH') {
  throw new Error('--country must be JP or PH.');
}
const countryCode: CountryCode = requestedCountry;
const signId = argument('id') || (countryCode === 'JP' ? 'jp-stop' : 'ph-stop');
const label = argument('label') || 'Stop';
const imagePath = argument('image');

const testRule: RuleRecord = {
  id: signId,
  countryCode,
  label,
  shortAlert: 'Come to a complete stop and proceed only when it is safe.',
  explanation: 'This test record requires the driver to come to a complete stop before proceeding safely.',
  conditions: ['Use this record only for the provider smoke test.'],
  exceptions: [],
  etiquette: 'Avoid abrupt braking when a safe gradual stop is possible.',
  sourceUrl: 'https://example.invalid/provider-smoke-test',
  reviewedOn: new Date().toISOString().slice(0, 10),
  status: 'tested',
};

const model = new GroqGuidanceModel();
const answer = await model.explain(testRule, 'What should the driver do?');
console.log('NLP provider: PASS');
console.log(`Grounded answer: ${answer}`);

if (!imagePath) {
  console.log('Vision provider: SKIPPED (pass --image with a JPEG, PNG, or WebP sign image)');
  process.exit(0);
}

const absoluteImagePath = resolve(imagePath);
const bytes = await readFile(absoluteImagePath);
if (bytes.byteLength > 1_500_000) throw new Error('The image must be 1.5 MB or smaller.');
const recognizedId = await model.recognize(
  { mimeType: mimeType(absoluteImagePath), base64: bytes.toString('base64') },
  countryCode,
  [testRule],
);
console.log('Vision provider: PASS');
console.log(`Recognition result: ${recognizedId || 'unknown'}`);
console.log(`Expected allowlisted ID: ${signId}`);
console.log(recognizedId === signId ? 'Expected sign match: YES' : 'Expected sign match: NO');
