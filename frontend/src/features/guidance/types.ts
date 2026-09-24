export type CountryCode = 'JP' | 'PH';
export type SignCategory = 'STOP' | 'MAX_SPEED' | 'PEDESTRIAN_CROSSING' | 'NO_PARKING' | 'NO_U_TURN';
export type ModelClass = 'JP_STOP' | 'JP_MAX_SPEED_30' | 'JP_PEDESTRIAN_CROSSING' | 'JP_NO_PARKING' | 'JP_NO_U_TURN' | 'PH_STOP' | 'PH_MAX_SPEED_50' | 'PH_PEDESTRIAN_CROSSING' | 'PH_NO_PARKING' | 'PH_NO_U_TURN';
export type MatchType = 'EXACT_MATCH' | 'SEMANTIC_MATCH' | 'RELATED' | 'NO_MATCH';
export type RuleRecord = {
  id: string;
  modelClass: ModelClass;
  semanticEquivalent: ModelClass | null;
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
  modelClass: ModelClass | null;
  normalizedCategory: SignCategory | null;
  confidence: number;
  closestReferenceId: string | null;
  closestReference: RuleRecord | null;
  visualSimilarity: number;
  semanticSimilarity: number;
  matchType: MatchType;
  equivalentSign: RuleRecord | null;
  evidence: { shape: string; symbol: string; text: string; color: string };
  bbox: [number, number, number, number] | null;
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
  status: 'candidate' | 'tested';
};

export type TripBriefing =
  | { status: 'ready'; countryCode: CountryCode; homeCountry: CountryCode | null; locality: string | null; items: BriefingRecord[]; speechText: string }
  | { status: 'unavailable'; countryCode: CountryCode; homeCountry: CountryCode | null; locality: string | null; items: []; speechText: null };

export type GuidanceEvent = 'TRIP_START' | 'RAILROAD_CROSSING' | 'INTERSECTION' | 'TRAFFIC_LIGHT' | 'ROUNDABOUT' | 'TURN' | 'PEDESTRIAN_CROSSING' | 'COUNTRY_RULE_ZONE' | 'RESTRICTED_TIME_ZONE' | 'HEADLIGHT_RULE' | 'STOP_SIGN' | 'ROAD_SIGN_DETECTION';
export type GuidancePriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'INFO';
export type BriefingRuleCategory = 'RAILROAD_CROSSING' | 'TRAFFIC_LIGHT' | 'ROUNDABOUT' | 'RESTRICTED_DRIVING_TIME' | 'LICENSE_PLATE_RESTRICTION' | 'HEADLIGHTS' | 'INTERSECTION' | 'STOP_SIGN' | 'PEDESTRIAN_RIGHT_OF_WAY' | 'DRIVING_SIDE' | 'PARKING_RESTRICTION' | 'LOCAL_ROAD_SIGNS' | 'OTHER';
export type DrivingGuidanceRule = {
  id: string;
  countryCode: CountryCode;
  event: GuidanceEvent;
  priority: GuidancePriority;
  title: string;
  message: string;
  sourceUrl: string;
  verified: true;
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
