export type CountryCode = 'JP' | 'PH';
export type SignCategory = 'STOP' | 'NO_ENTRY' | 'MAX_SPEED' | 'PEDESTRIAN_CROSSING' | 'NO_PARKING' | 'NO_U_TURN' | 'NO_RIGHT_TURN' | 'RAILWAY_CROSSING_AHEAD' | 'SLOW' | 'HORN_REQUIRED' | 'MOPED_TWO_STAGE_RIGHT' | 'PRIORITY_ROAD_AHEAD' | 'TIRE_CHAINS_REQUIRED' | 'NO_JEEPNEYS' | 'NO_TRICYCLES' | 'NO_PUSHCARTS' | 'NO_ANIMAL_DRAWN_VEHICLES' | 'BUS_PUJ_STOP';
export type MatchType = 'EXACT_MATCH' | 'SEMANTIC_MATCH' | 'RELATED' | 'NO_MATCH';
export type RuleRecord = {
  id: string;
  countryCode: CountryCode;
  label: string;
  officialName: string;
  normalizedCategory: SignCategory;
  meaning: string;
  signKind: 'regulatory' | 'warning' | 'information';
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
  status: 'candidate' | 'tested';
};

export type RecognitionDebug = {
  detectedCountry: CountryCode | null;
  detectedSign: string | null;
  normalizedCategory: SignCategory | null;
  confidence: number;
  closestReferenceId: string | null;
  closestReference: RuleRecord | null;
  visualSimilarity: number;
  semanticSimilarity: number;
  matchType: MatchType;
  equivalentSign: RuleRecord | null;
  evidence: { shape: string; symbol: string; text: string; color: string };
};

export type RecognitionResult =
  | { status: 'recognized'; signId: string; rule: RuleRecord; debug: RecognitionDebug }
  | { status: 'candidate'; signId: string; rule: RuleRecord; debug: RecognitionDebug }
  | { status: 'unknown'; signId: null; rule: null; debug: RecognitionDebug };

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
