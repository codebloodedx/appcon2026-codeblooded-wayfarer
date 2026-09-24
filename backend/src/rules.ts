import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { CountryCode, RuleRecord, SignCategory } from './types.js';
import { isCountryCode, isSignCategory } from './types.js';

const defaultRulesPath = fileURLToPath(new URL('../../shared/rules/rules.json', import.meta.url));

function isRuleRecord(value: unknown): value is RuleRecord {
  if (!value || typeof value !== 'object') return false;
  const rule = value as Partial<RuleRecord>;
  return (
    typeof rule.id === 'string' &&
    isCountryCode(rule.countryCode) &&
    typeof rule.label === 'string' &&
    typeof rule.officialName === 'string' &&
    isSignCategory(rule.normalizedCategory) &&
    typeof rule.meaning === 'string' &&
    (rule.signKind === 'regulatory' || rule.signKind === 'warning' || rule.signKind === 'information') &&
    Array.isArray(rule.aliases) && rule.aliases.every((item) => typeof item === 'string') &&
    typeof rule.visualDescription === 'string' &&
    typeof rule.assetPath === 'string' &&
    typeof rule.countrySpecific === 'boolean' &&
    typeof rule.shortAlert === 'string' &&
    typeof rule.explanation === 'string' &&
    Array.isArray(rule.conditions) &&
    rule.conditions.every((item) => typeof item === 'string') &&
    Array.isArray(rule.exceptions) &&
    rule.exceptions.every((item) => typeof item === 'string') &&
    typeof rule.sourceUrl === 'string' &&
    /^https:\/\//.test(rule.sourceUrl) &&
    typeof rule.reviewedOn === 'string' &&
    (rule.status === 'candidate' || rule.status === 'tested')
  );
}

export class RuleRepository {
  constructor(private readonly rulesPath = process.env.RULES_PATH || defaultRulesPath) {}

  async all(): Promise<RuleRecord[]> {
    try {
      const parsed: unknown = JSON.parse(await readFile(this.rulesPath, 'utf8'));
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isRuleRecord);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
  }

  async byCountry(countryCode: CountryCode): Promise<RuleRecord[]> {
    return (await this.all()).filter((rule) => rule.countryCode === countryCode);
  }

  async byCategory(category: SignCategory): Promise<RuleRecord[]> {
    return (await this.all()).filter((rule) => rule.normalizedCategory === category);
  }

  async testedByCountry(countryCode: CountryCode): Promise<RuleRecord[]> {
    return (await this.byCountry(countryCode)).filter((rule) => rule.status === 'tested');
  }

  async findTested(countryCode: CountryCode, signId: string): Promise<RuleRecord | undefined> {
    return (await this.testedByCountry(countryCode)).find((rule) => rule.id === signId);
  }
}
