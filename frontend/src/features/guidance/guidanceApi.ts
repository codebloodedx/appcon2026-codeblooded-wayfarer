import type { ComparisonResult, CountryCode, RecognitionResult, RecognitionTestCase, RuleRecord, TripBriefing } from './types';

async function parseError(response: Response): Promise<Error> {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return new Error(body?.error || `Request failed (${response.status})`);
}

export async function listRules(countryCode: CountryCode): Promise<RuleRecord[]> {
  const response = await fetch(`/api/rules?countryCode=${countryCode}`);
  if (!response.ok) throw await parseError(response);
  return response.json() as Promise<RuleRecord[]>;
}

export async function getTripBriefing(countryCode: CountryCode, locality?: string): Promise<TripBriefing> {
  const query = new URLSearchParams({ countryCode });
  if (locality?.trim()) query.set('locality', locality.trim());
  const response = await fetch(`/api/briefing?${query}`);
  if (!response.ok) throw await parseError(response);
  return response.json() as Promise<TripBriefing>;
}

export async function playTripBriefing(countryCode: CountryCode, locality?: string): Promise<TripBriefing> {
  const briefing = await getTripBriefing(countryCode, locality);
  if (briefing.status === 'unavailable') return briefing;
  speakBrowserText(briefing.speechText, 0.92);
  return briefing;
}

export function speakBrowserText(text: string, rate = 0.95): SpeechSynthesisUtterance {
  if (!('speechSynthesis' in window)) throw new Error('Spoken guidance is unavailable in this browser');
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export async function recognizeSign(countryCode: CountryCode, imageDataUrl: string): Promise<RecognitionResult> {
  const response = await fetch('/api/recognize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ countryCode, imageDataUrl }),
    signal: AbortSignal.timeout(30_000),
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

export async function playRuleAlert(countryCode: CountryCode, signId: string): Promise<SpeechSynthesisUtterance> {
  const response = await fetch('/api/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ countryCode, signId }),
  });
  if (!response.ok) throw await parseError(response);
  const body = await response.json() as { text: string; engine: 'browser-speech-synthesis' };
  return speakBrowserText(body.text);
}

export async function listRecognitionTests(): Promise<RecognitionTestCase[]> {
  const response = await fetch('/api/recognition-tests');
  if (!response.ok) throw await parseError(response);
  return response.json() as Promise<RecognitionTestCase[]>;
}

export async function compareSigns(first: { countryCode: CountryCode; imageDataUrl: string }, second: { countryCode: CountryCode; imageDataUrl: string }): Promise<ComparisonResult> {
  const response = await fetch('/api/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ first, second }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw await parseError(response);
  return response.json() as Promise<ComparisonResult>;
}
