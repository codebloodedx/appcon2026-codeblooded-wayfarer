import type { CountryCode, RecognitionResult, RuleRecord } from './types';

async function parseError(response: Response): Promise<Error> {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return new Error(body?.error || `Request failed (${response.status})`);
}

export async function listRules(countryCode: CountryCode): Promise<RuleRecord[]> {
  const response = await fetch(`/api/rules?countryCode=${countryCode}`);
  if (!response.ok) throw await parseError(response);
  return response.json() as Promise<RuleRecord[]>;
}

export async function recognizeSign(countryCode: CountryCode, imageDataUrl: string): Promise<RecognitionResult> {
  const response = await fetch('/api/recognize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ countryCode, imageDataUrl }),
  });
  if (!response.ok) throw await parseError(response);
  return response.json() as Promise<RecognitionResult>;
}

export async function explainRule(countryCode: CountryCode, signId: string, question: string) {
  const response = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ countryCode, signId, question }),
  });
  if (!response.ok) throw await parseError(response);
  return response.json() as Promise<{ answer: string; sourceUrl: string }>;
}

export async function playRuleAlert(countryCode: CountryCode, signId: string): Promise<HTMLAudioElement> {
  const response = await fetch('/api/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ countryCode, signId }),
  });
  if (!response.ok) throw await parseError(response);
  const url = URL.createObjectURL(await response.blob());
  const audio = new Audio(url);
  audio.addEventListener('ended', () => URL.revokeObjectURL(url), { once: true });
  audio.addEventListener('error', () => URL.revokeObjectURL(url), { once: true });
  await audio.play();
  return audio;
}
