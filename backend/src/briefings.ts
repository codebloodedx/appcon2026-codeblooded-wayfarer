import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { isCountryCode, isGuidanceEvent, type BriefingRecord, type CountryCode, type DrivingGuidanceRule, type GuidancePriority } from './types.js';

const defaultBriefingsPath = fileURLToPath(new URL('../../shared/rules/driving-guidance.json', import.meta.url));
const priorityOrder: Record<GuidancePriority, number> = { CRITICAL: 0, HIGH: 1, NORMAL: 2, INFO: 3 };
const briefingImportance: Partial<Record<NonNullable<BriefingRecord['ruleCategory']>, number>> = {
  DRIVING_SIDE: 0,
  RAILROAD_CROSSING: 1,
  TRAFFIC_LIGHT: 2,
  STOP_SIGN: 3,
  PEDESTRIAN_RIGHT_OF_WAY: 4,
  INTERSECTION: 5,
};
const briefingCategories = new Set(['RAILROAD_CROSSING', 'TRAFFIC_LIGHT', 'ROUNDABOUT', 'RESTRICTED_DRIVING_TIME', 'LICENSE_PLATE_RESTRICTION', 'HEADLIGHTS', 'INTERSECTION', 'STOP_SIGN', 'PEDESTRIAN_RIGHT_OF_WAY', 'DRIVING_SIDE', 'PARKING_RESTRICTION', 'LOCAL_ROAD_SIGNS', 'OTHER']);

function isBriefingRecord(value: unknown): value is BriefingRecord {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<BriefingRecord>;
  return (
    typeof item.id === 'string' &&
    isCountryCode(item.countryCode) &&
    (item.locality === undefined || typeof item.locality === 'string') &&
    (item.category === 'law' || item.category === 'etiquette') &&
    ((typeof item.priority === 'number' && Number.isInteger(item.priority) && item.priority >= 1) || ['CRITICAL', 'HIGH', 'NORMAL', 'INFO'].includes(String(item.priority))) &&
    typeof item.title === 'string' &&
    typeof item.spokenText === 'string' &&
    typeof item.details === 'string' &&
    typeof item.sourceUrl === 'string' &&
    /^https:\/\//.test(item.sourceUrl) &&
    typeof item.reviewedOn === 'string' &&
    (item.status === 'candidate' || item.status === 'tested')
  );
}

function isGuidanceRuleWithBriefing(value: unknown): value is DrivingGuidanceRule & { briefing: NonNullable<DrivingGuidanceRule['briefing']> } {
  if (!value || typeof value !== 'object') return false;
  const rule = value as Partial<DrivingGuidanceRule>;
  const briefing = rule.briefing;
  return typeof rule.id === 'string' && isCountryCode(rule.countryCode) && isGuidanceEvent(rule.event)
    && typeof rule.priority === 'string' && rule.priority in priorityOrder && rule.verified === true && Boolean(briefing)
    && typeof briefing?.category === 'string' && briefingCategories.has(briefing.category)
    && typeof briefing?.title === 'string' && typeof briefing.message === 'string'
    && briefing.message.split(/\s+/).length <= 24 && typeof briefing.icon === 'string'
    && typeof briefing.reviewedOn === 'string' && typeof rule.sourceUrl === 'string' && /^https:\/\//.test(rule.sourceUrl);
}

function localityFor(rule: DrivingGuidanceRule): string | undefined {
  if (!rule.jurisdiction || rule.jurisdiction.type === 'country') return undefined;
  return rule.jurisdiction.value;
}

function normalizeLocality(value: string): string {
  return value.trim().toLocaleLowerCase('en');
}

export class BriefingRepository {
  constructor(private readonly briefingsPath = process.env.BRIEFINGS_PATH || defaultBriefingsPath) {}

  async all(): Promise<BriefingRecord[]> {
    try {
      const parsed: unknown = JSON.parse(await readFile(this.briefingsPath, 'utf8'));
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((value): BriefingRecord[] => {
        if (isBriefingRecord(value)) return [value];
        if (!isGuidanceRuleWithBriefing(value) || (value.requiredContext?.length ?? 0) > 0) return [];
        return [{
          id: `briefing-${value.id}`,
          linkedGuidanceRuleId: value.id,
          countryCode: value.countryCode,
          locality: localityFor(value),
          category: 'law',
          ruleCategory: value.briefing.category,
          priority: value.priority,
          title: value.briefing.title,
          spokenText: value.briefing.message,
          details: value.briefing.message,
          icon: value.briefing.icon,
          whyItMatters: value.briefing.whyItMatters,
          exceptions: value.briefing.exceptions,
          comparisonMessages: value.briefing.comparisonMessages,
          sourceUrl: value.sourceUrl,
          reviewedOn: value.briefing.reviewedOn,
          status: 'tested',
        }];
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
  }

  async testedForTrip(countryCode: CountryCode, locality?: string, homeCountry?: CountryCode): Promise<BriefingRecord[]> {
    const requestedLocality = locality ? normalizeLocality(locality) : null;
    return (await this.all())
      .filter((item) => {
        if (item.countryCode !== countryCode || item.status !== 'tested') return false;
        if (!item.locality) return true;
        return requestedLocality === normalizeLocality(item.locality);
      })
      .sort((left, right) => {
        const rank = (priority: BriefingRecord['priority']) => typeof priority === 'number' ? priority : priorityOrder[priority];
        const priorityDifference = rank(left.priority) - rank(right.priority);
        if (priorityDifference !== 0) return priorityDifference;
        const leftDifference = homeCountry && homeCountry !== countryCode && left.comparisonMessages?.[homeCountry] ? 0 : 1;
        const rightDifference = homeCountry && homeCountry !== countryCode && right.comparisonMessages?.[homeCountry] ? 0 : 1;
        if (leftDifference !== rightDifference) return leftDifference - rightDifference;
        return (briefingImportance[left.ruleCategory ?? 'OTHER'] ?? 99) - (briefingImportance[right.ruleCategory ?? 'OTHER'] ?? 99);
      })
      .slice(0, 3)
      .map((item) => {
        const comparisonCountry = homeCountry && homeCountry !== countryCode ? homeCountry : undefined;
        const comparisonMessage = comparisonCountry ? item.comparisonMessages?.[comparisonCountry] : undefined;
        return {
          ...item,
          comparisonCountry,
          spokenText: comparisonMessage ?? item.spokenText,
          details: comparisonMessage ?? item.details,
          comparisonMessages: undefined,
        };
      });
  }
}
