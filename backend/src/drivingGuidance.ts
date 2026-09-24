import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { isCountryCode, isGuidanceEvent, type CountryCode, type DrivingGuidanceRule } from './types.js';

const defaultPath = fileURLToPath(new URL('../../shared/rules/driving-guidance.json', import.meta.url));
const priorities = new Set(['CRITICAL', 'HIGH', 'NORMAL', 'INFO']);
const triggerModes = new Set(['route', 'cv', 'simulation']);

function isRule(value: unknown): value is DrivingGuidanceRule {
  if (!value || typeof value !== 'object') return false;
  const rule = value as Partial<DrivingGuidanceRule>;
  return typeof rule.id === 'string' && isCountryCode(rule.countryCode) && isGuidanceEvent(rule.event)
    && typeof rule.priority === 'string' && priorities.has(rule.priority)
    && typeof rule.title === 'string' && typeof rule.message === 'string' && rule.message.split(/\s+/).length <= 24
    && typeof rule.sourceUrl === 'string' && rule.sourceUrl.startsWith('https://')
    && typeof rule.verified === 'boolean' && typeof rule.triggerMode === 'string' && triggerModes.has(rule.triggerMode)
    && typeof rule.cooldownSeconds === 'number' && rule.cooldownSeconds >= 0;
}

export class DrivingGuidanceRepository {
  constructor(private readonly path = process.env.DRIVING_GUIDANCE_PATH || defaultPath) {}

  async all(): Promise<DrivingGuidanceRule[]> {
    const parsed: unknown = JSON.parse(await readFile(this.path, 'utf8'));
    return Array.isArray(parsed) ? parsed.filter(isRule) : [];
  }

  async available(countryCode: CountryCode, locality?: string): Promise<DrivingGuidanceRule[]> {
    return (await this.all()).filter((rule) => {
      if (!rule.verified || rule.countryCode !== countryCode || (rule.requiredContext?.length ?? 0) > 0) return false;
      if (!rule.jurisdiction || rule.jurisdiction.type === 'country') return true;
      return Boolean(locality && rule.jurisdiction.value.localeCompare(locality, undefined, { sensitivity: 'accent' }) === 0);
    });
  }
}
