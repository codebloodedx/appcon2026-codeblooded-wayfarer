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
  | { status: 'unknown'; signId: null; rule: null };
