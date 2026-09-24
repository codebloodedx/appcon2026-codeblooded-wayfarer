export const countryCodes = ['JP', 'PH'] as const;
export type CountryCode = (typeof countryCodes)[number];

export type RuleStatus = 'candidate' | 'tested';

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
  status: RuleStatus;
};

export type BriefingCategory = 'law' | 'etiquette';

export type BriefingRecord = {
  id: string;
  countryCode: CountryCode;
  locality?: string;
  category: BriefingCategory;
  priority: number;
  title: string;
  spokenText: string;
  details: string;
  sourceUrl: string;
  reviewedOn: string;
  status: RuleStatus;
};

export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === 'string' && countryCodes.includes(value as CountryCode);
}
