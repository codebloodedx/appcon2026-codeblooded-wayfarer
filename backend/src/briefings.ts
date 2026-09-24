import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { isCountryCode, type BriefingRecord, type CountryCode } from './types.js';

const defaultBriefingsPath = fileURLToPath(new URL('../../shared/rules/briefings.json', import.meta.url));

function isBriefingRecord(value: unknown): value is BriefingRecord {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<BriefingRecord>;
  return (
    typeof item.id === 'string' &&
    isCountryCode(item.countryCode) &&
    (item.locality === undefined || typeof item.locality === 'string') &&
    (item.category === 'law' || item.category === 'etiquette') &&
    Number.isInteger(item.priority) &&
    typeof item.priority === 'number' &&
    item.priority >= 1 &&
    typeof item.title === 'string' &&
    typeof item.spokenText === 'string' &&
    typeof item.details === 'string' &&
    typeof item.sourceUrl === 'string' &&
    /^https:\/\//.test(item.sourceUrl) &&
    typeof item.reviewedOn === 'string' &&
    (item.status === 'candidate' || item.status === 'tested')
  );
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
      return parsed.filter(isBriefingRecord);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
  }

  async testedForTrip(countryCode: CountryCode, locality?: string): Promise<BriefingRecord[]> {
    const requestedLocality = locality ? normalizeLocality(locality) : null;
    return (await this.all())
      .filter((item) => {
        if (item.countryCode !== countryCode || item.status !== 'tested') return false;
        if (!item.locality) return true;
        return requestedLocality === normalizeLocality(item.locality);
      })
      .sort((left, right) => left.priority - right.priority)
      .slice(0, 3);
  }
}
