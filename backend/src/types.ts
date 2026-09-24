export const countryCodes = ['JP', 'PH'] as const;
export type CountryCode = (typeof countryCodes)[number];

export type RuleStatus = 'candidate' | 'tested';

export const signCategories = ['STOP', 'MAX_SPEED', 'PEDESTRIAN_CROSSING', 'NO_PARKING', 'NO_U_TURN'] as const;
export type SignCategory = (typeof signCategories)[number];
export const modelClasses = ['JP_STOP', 'JP_MAX_SPEED_30', 'JP_PEDESTRIAN_CROSSING', 'JP_NO_PARKING', 'JP_NO_U_TURN', 'PH_STOP', 'PH_MAX_SPEED_50', 'PH_PEDESTRIAN_CROSSING', 'PH_NO_PARKING', 'PH_NO_U_TURN'] as const;
export type ModelClass = (typeof modelClasses)[number];

export type SignKind = 'regulatory' | 'warning' | 'information';

export type RuleRecord = {
  id: string;
  modelClass: ModelClass;
  semanticEquivalent: ModelClass | null;
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
  modelClass: ModelClass | null;
  normalizedCategory: SignCategory | null;
  confidence: number;
  closestReferenceId: string | null;
  visualSimilarity: number;
  semanticSimilarity: number;
  evidence: RecognitionEvidence;
  bbox: [number, number, number, number] | null;
};

export type MatchType = 'EXACT_MATCH' | 'SEMANTIC_MATCH' | 'RELATED' | 'NO_MATCH';

export type BriefingCategory = 'law' | 'etiquette';
export type BriefingRuleCategory = 'RAILROAD_CROSSING' | 'TRAFFIC_LIGHT' | 'ROUNDABOUT' | 'RESTRICTED_DRIVING_TIME' | 'LICENSE_PLATE_RESTRICTION' | 'HEADLIGHTS' | 'INTERSECTION' | 'STOP_SIGN' | 'PEDESTRIAN_RIGHT_OF_WAY' | 'DRIVING_SIDE' | 'PARKING_RESTRICTION' | 'LOCAL_ROAD_SIGNS' | 'OTHER';

export type BriefingRecord = {
  id: string;
  countryCode: CountryCode;
  locality?: string;
  category: BriefingCategory;
  ruleCategory?: BriefingRuleCategory;
  priority: GuidancePriority | number;
  title: string;
  spokenText: string;
  details: string;
  icon?: string;
  whyItMatters?: string;
  exceptions?: string;
  comparisonCountry?: CountryCode;
  comparisonMessages?: Partial<Record<CountryCode, string>>;
  linkedGuidanceRuleId?: string;
  sourceUrl: string;
  reviewedOn: string;
  status: RuleStatus;
};

export const guidanceEvents = ['TRIP_START', 'RAILROAD_CROSSING', 'INTERSECTION', 'TRAFFIC_LIGHT', 'ROUNDABOUT', 'TURN', 'PEDESTRIAN_CROSSING', 'COUNTRY_RULE_ZONE', 'RESTRICTED_TIME_ZONE', 'HEADLIGHT_RULE', 'STOP_SIGN', 'ROAD_SIGN_DETECTION'] as const;
export type GuidanceEvent = (typeof guidanceEvents)[number];
export type GuidancePriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'INFO';
export type DrivingGuidanceRule = {
  id: string;
  countryCode: CountryCode;
  event: GuidanceEvent;
  priority: GuidancePriority;
  title: string;
  message: string;
  sourceUrl: string;
  verified: boolean;
  triggerMode: 'route' | 'cv' | 'simulation';
  cooldownSeconds: number;
  jurisdiction?: { type: 'country' | 'region' | 'city' | 'road'; value: string };
  requiredContext?: Array<'vehiclePlate' | 'currentTime' | 'vehicleType'>;
  timeWindow?: { days?: string[]; start?: string; end?: string; timezone?: string };
  briefing?: {
    category: BriefingRuleCategory;
    title: string;
    message: string;
    icon: string;
    reviewedOn: string;
    whyItMatters?: string;
    exceptions?: string;
    comparisonMessages?: Partial<Record<CountryCode, string>>;
  };
};

export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === 'string' && countryCodes.includes(value as CountryCode);
}

export function isSignCategory(value: unknown): value is SignCategory {
  return typeof value === 'string' && signCategories.includes(value as SignCategory);
}

export function isModelClass(value: unknown): value is ModelClass {
  return typeof value === 'string' && modelClasses.includes(value as ModelClass);
}

export function isGuidanceEvent(value: unknown): value is GuidanceEvent {
  return typeof value === 'string' && guidanceEvents.includes(value as GuidanceEvent);
}
