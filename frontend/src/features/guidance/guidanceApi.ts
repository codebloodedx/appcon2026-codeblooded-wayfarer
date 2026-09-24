import type { CountryCode, DrivingGuidanceRule, RecognitionResult, RuleRecord, TripBriefing } from './types';

export class ApiRequestError extends Error {
  constructor(message: string, readonly code?: string, readonly retryAfterMs?: number) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

async function parseError(response: Response): Promise<Error> {
  const body = (await response.json().catch(() => null)) as { error?: string; code?: string; retryAfterSeconds?: number } | null;
  const headerSeconds = Number(response.headers.get('Retry-After'));
  const seconds = typeof body?.retryAfterSeconds === 'number' ? body.retryAfterSeconds : Number.isFinite(headerSeconds) ? headerSeconds : undefined;
  return new ApiRequestError(body?.error || `Request failed (${response.status})`, body?.code, seconds ? seconds * 1000 : undefined);
}

export async function listRules(countryCode: CountryCode): Promise<RuleRecord[]> {
  const response = await fetch(`/api/rules?countryCode=${countryCode}`, { cache: 'no-store' });
  if (!response.ok) throw await parseError(response);
  return response.json() as Promise<RuleRecord[]>;
}

export async function getTripBriefing(countryCode: CountryCode, locality?: string, homeCountry?: CountryCode): Promise<TripBriefing> {
  const query = new URLSearchParams({ countryCode });
  if (locality?.trim()) query.set('locality', locality.trim());
  if (homeCountry) query.set('homeCountry', homeCountry);
  const response = await fetch(`/api/briefing?${query}`, { cache: 'no-store' });
  if (!response.ok) throw await parseError(response);
  return response.json() as Promise<TripBriefing>;
}

export async function listDrivingGuidance(countryCode: CountryCode, locality?: string): Promise<DrivingGuidanceRule[]> {
  const query = new URLSearchParams({ countryCode });
  if (locality?.trim()) query.set('locality', locality.trim());
  const response = await fetch(`/api/driving-guidance?${query}`, { cache: 'no-store' });
  if (!response.ok) throw await parseError(response);
  const body = await response.json() as { rules: DrivingGuidanceRule[] };
  return body.rules;
}

export async function playTripBriefing(countryCode: CountryCode, locality?: string, homeCountry?: CountryCode): Promise<TripBriefing> {
  const briefing = await getTripBriefing(countryCode, locality, homeCountry);
  if (briefing.status === 'unavailable') return briefing;
  speakBrowserText(briefing.speechText, 0.92);
  return briefing;
}

const preferredFemaleVoiceNames = [
  'Microsoft Aria Online',
  'Microsoft Jenny Online',
  'Microsoft Zira',
  'Samantha',
  'Ava',
  'Victoria',
  'Karen',
  'Moira',
  'Tessa',
  'Google US English',
];

export function configureWayfarerVoice(utterance: SpeechSynthesisUtterance, rate = 0.95): SpeechSynthesisUtterance {
  utterance.lang = 'en-US';
  utterance.rate = rate;
  utterance.pitch = 1.05;
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const ranked = preferredFemaleVoiceNames
    .map((name) => voices.find((voice) => voice.name.toLocaleLowerCase().includes(name.toLocaleLowerCase())))
    .find((voice): voice is SpeechSynthesisVoice => Boolean(voice));
  const englishFallback = voices.find((voice) => /^en(-|_)/i.test(voice.lang) && /female|woman|zira|aria|jenny|samantha|ava|victoria|karen|moira|tessa/i.test(voice.name));
  utterance.voice = ranked ?? englishFallback ?? voices.find((voice) => /^en-US$/i.test(voice.lang)) ?? voices.find((voice) => /^en/i.test(voice.lang)) ?? null;
  return utterance;
}

export function speakBrowserText(text: string, rate = 0.95): SpeechSynthesisUtterance {
  if (!('speechSynthesis' in window)) throw new Error('Spoken guidance is unavailable in this browser');
  const synth = window.speechSynthesis;
  const utterance = configureWayfarerVoice(new SpeechSynthesisUtterance(text), rate);
  synth.cancel();
  if (synth.getVoices().length > 0) {
    synth.speak(utterance);
  } else {
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      configureWayfarerVoice(utterance, rate);
      synth.speak(utterance);
    };
    synth.addEventListener('voiceschanged', start, { once: true });
    window.setTimeout(start, 300);
  }
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
  return response.json() as Promise<{ answer: string; sourceUrl: string; status: 'candidate' | 'tested' }>;
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
