import type { CountryCode, RecognitionResult, RuleRecord, TripBriefing } from './types';

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
  if (!('speechSynthesis' in window)) throw new Error('Spoken guidance is unavailable in this browser');
  const utterance = new SpeechSynthesisUtterance(briefing.speechText);
  utterance.lang = 'en-US';
  utterance.rate = 0.92;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return briefing;
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

export async function playRuleAlert(countryCode: CountryCode, signId: string): Promise<SpeechSynthesisUtterance> {
  const response = await fetch('/api/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ countryCode, signId }),
  });
  if (!response.ok) throw await parseError(response);
  if (!('speechSynthesis' in window)) throw new Error('Spoken guidance is unavailable in this browser');
  const body = await response.json() as { text: string; engine: 'browser-speech-synthesis' };
  const utterance = new SpeechSynthesisUtterance(body.text);
  utterance.lang = 'en-US';
  utterance.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return utterance;
}
