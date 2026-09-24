export type CountryCode = 'JP' | 'PH';
export type RuleRecord = {
  id: string;
  countryCode: CountryCode;
  label: string;
  shortAlert: string;
  explanation: string;
  conditions: string[];
  exceptions: string[];
  etiquette?: string;
  sourceUrl: string;
  reviewedOn: string;
  status: 'candidate' | 'tested';
};

export type RecognitionResult =
  | { status: 'recognized'; signId: string; rule: RuleRecord }
  | { status: 'candidate'; signId: string; rule: RuleRecord }
  | { status: 'unknown'; signId: null; rule: null };

export type BriefingRecord = {
  id: string;
  countryCode: CountryCode;
  locality?: string;
  category: 'law' | 'etiquette';
  priority: number;
  title: string;
  spokenText: string;
  details: string;
  sourceUrl: string;
  reviewedOn: string;
  status: 'candidate' | 'tested';
};

export type TripBriefing =
  | { status: 'ready'; countryCode: CountryCode; locality: string | null; items: BriefingRecord[]; speechText: string }
  | { status: 'unavailable'; countryCode: CountryCode; locality: string | null; items: []; speechText: null };
