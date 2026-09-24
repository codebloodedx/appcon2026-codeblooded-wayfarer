import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { BriefingRepository } from '../src/briefings.js';
import type { DrivingGuidanceRule, RuleRecord } from '../src/types.js';

const rulesPath = fileURLToPath(new URL('../../shared/rules/rules.json', import.meta.url));
const classesPath = fileURLToPath(new URL('../../data/sign_classes.json', import.meta.url));
const guidancePath = fileURLToPath(new URL('../../shared/rules/driving-guidance.json', import.meta.url));

describe('ten-class sign contract', () => {
  it('contains exactly five Japan and five Philippines classes with reciprocal equivalents', async () => {
    const rules = JSON.parse(await readFile(rulesPath, 'utf8')) as RuleRecord[];
    const manifest = JSON.parse(await readFile(classesPath, 'utf8')) as {
      class_count: number;
      classes: Array<{ index: number; model_class: string; semantic_equivalent: string | null }>;
    };
    assert.equal(rules.length, 10);
    assert.equal(rules.filter((rule) => rule.countryCode === 'JP').length, 5);
    assert.equal(rules.filter((rule) => rule.countryCode === 'PH').length, 5);
    assert.equal(new Set(rules.map((rule) => rule.modelClass)).size, 10);
    assert.equal(manifest.class_count, 10);
    assert.equal(rules.filter((rule) => rule.semanticEquivalent === null).length, 2);
    assert.deepEqual(manifest.classes.map((item) => item.index), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    assert.deepEqual(new Set(manifest.classes.map((item) => item.model_class)), new Set(rules.map((rule) => rule.modelClass)));
    for (const rule of rules) {
      if (!rule.semanticEquivalent) continue;
      const equivalent = rules.find((item) => item.modelClass === rule.semanticEquivalent);
      assert.ok(equivalent, `${rule.modelClass} must name an existing equivalent`);
      assert.notEqual(equivalent.countryCode, rule.countryCode);
      assert.equal(equivalent.normalizedCategory, rule.normalizedCategory);
      assert.equal(equivalent.semanticEquivalent, rule.modelClass);
    }
  });
});

describe('pre-trip briefing catalog', () => {
  it('uses the verified current-guidance records for exactly three prioritized pre-trip essentials', async () => {
    const guidance = JSON.parse(await readFile(guidancePath, 'utf8')) as DrivingGuidanceRule[];
    const repository = new BriefingRepository(guidancePath);
    for (const countryCode of ['JP', 'PH'] as const) {
      const countryBriefings = await repository.testedForTrip(countryCode, undefined, countryCode === 'JP' ? 'PH' : 'JP');
      assert.equal(countryBriefings.length, 3);
      assert.ok(countryBriefings.every((item) => item.status === 'tested' && item.linkedGuidanceRuleId));
      assert.ok(countryBriefings.every((item) => item.spokenText.split(/\s+/).length <= 24));
      assert.ok(countryBriefings.every((item) => guidance.some((rule) => rule.id === item.linkedGuidanceRuleId && rule.sourceUrl === item.sourceUrl)));
      const priorityRanks = countryBriefings.map((item) => ({ CRITICAL: 0, HIGH: 1, NORMAL: 2, INFO: 3 }[String(item.priority)] ?? 4));
      assert.deepEqual(priorityRanks, [...priorityRanks].sort((a, b) => a - b));
    }
  });

  it('adapts copy for PH to JP, JP to PH, and same-country trips', async () => {
    const repository = new BriefingRepository(guidancePath);
    const philippinesToJapan = await repository.testedForTrip('JP', 'Tokyo', 'PH');
    assert.deepEqual(philippinesToJapan.map((item) => item.ruleCategory), ['DRIVING_SIDE', 'RAILROAD_CROSSING', 'TRAFFIC_LIGHT']);
    assert.equal(philippinesToJapan[0].comparisonCountry, 'PH');
    assert.ok(philippinesToJapan.some((item) => /Philippine right-side traffic/i.test(item.spokenText)));

    const japanToPhilippines = await repository.testedForTrip('PH', 'Manila', 'JP');
    assert.equal(japanToPhilippines[0].comparisonCountry, 'JP');
    assert.ok(japanToPhilippines.some((item) => /Japan's left-side traffic/i.test(item.spokenText)));

    const sameCountry = await repository.testedForTrip('PH', 'Manila', 'PH');
    assert.ok(sameCountry.every((item) => item.comparisonCountry === undefined));
    assert.ok(sameCountry.some((item) => item.spokenText === 'Drive on the right side of the road.'));
  });
});
