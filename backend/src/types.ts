export const countryCodes = ['JP', 'PH'] as const;
export type CountryCode = (typeof countryCodes)[number];

export type RuleStatus = 'candidate' | 'tested';

export const signCategories = ['STOP', 'NO_ENTRY', 'MAX_SPEED', 'PEDESTRIAN_CROSSING', 'NO_PARKING', 'NO_U_TURN', 'NO_RIGHT_TURN', 'RAILWAY_CROSSING_AHEAD', 'SLOW', 'HORN_REQUIRED', 'MOPED_TWO_STAGE_RIGHT', 'PRIORITY_ROAD_AHEAD', 'TIRE_CHAINS_REQUIRED', 'NO_JEEPNEYS', 'NO_TRICYCLES', 'NO_PUSHCARTS', 'NO_ANIMAL_DRAWN_VEHICLES', 'BUS_PUJ_STOP'] as const;
export type SignCategory = (typeof signCategories)[number];

export type SignKind = 'regulatory' | 'warning' | 'information';

export type RuleRecord = {
  id: string;
  countryCode: CountryCode;
  label: string;
  officialName: string;
  normalizedCategory: SignCategory;
  meaning: string;
  signKind: SignKind;
  aliases: string[];
  visualDescription: string;
  assetPath: string;
  countrySpecific: boolean;
  shortAlert: string;
  explanation: string;
  conditions: string[];
  exceptions: string[];
  etiquette?: string;
  sourceUrl: string;
  reviewedOn: string;
  status: RuleStatus;
};

export type RecognitionEvidence = {
  shape: string;
  symbol: string;
  text: string;
  color: string;
};

export type ModelRecognition = {
  detectedCountry: CountryCode | null;
  detectedSign: string | null;
  normalizedCategory: SignCategory | null;
  confidence: number;
  closestReferenceId: string | null;
  visualSimilarity: number;
  semanticSimilarity: number;
  evidence: RecognitionEvidence;
};

export type MatchType = 'EXACT_MATCH' | 'SEMANTIC_MATCH' | 'RELATED' | 'NO_MATCH';

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

export function isSignCategory(value: unknown): value is SignCategory {
  return typeof value === 'string' && signCategories.includes(value as SignCategory);
}
