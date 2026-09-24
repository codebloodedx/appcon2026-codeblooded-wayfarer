import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { BriefingRepository } from '../src/briefings.js';
import { DrivingGuidanceRepository } from '../src/drivingGuidance.js';
import type { GuidanceModel } from '../src/guidanceModel.js';
import { RuleRepository } from '../src/rules.js';
import { emptyRecognition } from '../src/guidanceModel.js';
import type { BriefingRecord, DrivingGuidanceRule, ModelClass, ModelRecognition, RuleRecord, SignCategory } from '../src/types.js';

const testedRule: RuleRecord = {
  id: 'jp-stop',
  modelClass: 'JP_STOP',
  semanticEquivalent: 'PH_STOP',
  countryCode: 'JP',
  label: 'Stop',
  officialName: 'Stop',
  normalizedCategory: 'STOP',
  meaning: 'Come to a complete stop.',
  signKind: 'regulatory',
  aliases: ['STOP'],
  visualDescription: 'A stop sign.',
  assetPath: '/signs/test/jp-stop.svg',
  countrySpecific: false,
  shortAlert: 'Reviewed short alert.',
  explanation: 'Reviewed explanation.',
  conditions: [],
  exceptions: [],
  sourceUrl: 'https://example.gov/rule',
  reviewedOn: '2026-09-24',
  status: 'tested',
};

const candidateRule: RuleRecord = {
  ...testedRule,
  id: 'jp-speed-30',
  modelClass: 'JP_MAX_SPEED_30',
  semanticEquivalent: null,
  label: 'Maximum speed 30',
  officialName: 'Maximum speed',
  normalizedCategory: 'MAX_SPEED',
  meaning: 'Do not exceed 30 kilometers per hour.',
  status: 'candidate',
};

const philippinesStop: RuleRecord = {
  ...testedRule,
  id: 'ph-stop',
  modelClass: 'PH_STOP',
  semanticEquivalent: 'JP_STOP',
  countryCode: 'PH',
  assetPath: '/signs/test/ph-stop.svg',
};

let directory = '';
let rules: RuleRepository;
let briefings: BriefingRepository;
let drivingGuidance: DrivingGuidanceRepository;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'roamright-'));
  const path = join(directory, 'rules.json');
  await writeFile(path, JSON.stringify([testedRule, candidateRule, philippinesStop]));
  rules = new RuleRepository(path);
  const briefingPath = join(directory, 'briefings.json');
  const briefingRecords: BriefingRecord[] = [
    {
      id: 'jp-driving-side', countryCode: 'JP', category: 'law', priority: 1,
      title: 'Keep left', spokenText: 'Keep to the left side of the road.', details: 'Reviewed details.',
      sourceUrl: 'https://example.gov/jp', reviewedOn: '2026-09-24', status: 'tested',
    },
    {
      id: 'ph-local-restriction', countryCode: 'PH', locality: 'Makati', category: 'law', priority: 1,
      title: 'Local restriction', spokenText: 'Check the reviewed local restriction.', details: 'Reviewed details.',
      sourceUrl: 'https://example.gov/ph', reviewedOn: '2026-09-24', status: 'tested',
    },
    {
      id: 'ph-unverified', countryCode: 'PH', category: 'etiquette', priority: 2,
      title: 'Candidate reminder', spokenText: 'This must never be spoken.', details: 'Unverified.',
      sourceUrl: 'https://example.gov/ph', reviewedOn: '2026-09-24', status: 'candidate',
    },
  ];
  await writeFile(briefingPath, JSON.stringify(briefingRecords));
  briefings = new BriefingRepository(briefingPath);
  const guidancePath = join(directory, 'driving-guidance.json');
  const guidanceRecords: DrivingGuidanceRule[] = [
    { id: 'jp-rail', countryCode: 'JP', event: 'RAILROAD_CROSSING', priority: 'CRITICAL', title: 'Railroad crossing', message: 'Railroad crossing ahead. Stop and check both directions.', sourceUrl: 'https://example.gov/jp', verified: true, triggerMode: 'simulation', cooldownSeconds: 20, jurisdiction: { type: 'country', value: 'Japan' } },
    { id: 'ph-stop-guidance', countryCode: 'PH', event: 'STOP_SIGN', priority: 'HIGH', title: 'Stop sign', message: 'Stop sign ahead. Stop at the marked line.', sourceUrl: 'https://example.gov/ph', verified: true, triggerMode: 'cv', cooldownSeconds: 15, jurisdiction: { type: 'country', value: 'Philippines' } },
    { id: 'ph-makati-coding', countryCode: 'PH', event: 'RESTRICTED_TIME_ZONE', priority: 'INFO', title: 'Local restriction', message: 'Local vehicle restriction may apply.', sourceUrl: 'https://example.gov/ph', verified: true, triggerMode: 'simulation', cooldownSeconds: 60, jurisdiction: { type: 'city', value: 'Makati' } },
    { id: 'ph-context-required', countryCode: 'PH', event: 'HEADLIGHT_RULE', priority: 'INFO', title: 'Headlights', message: 'Headlights are required for this condition.', sourceUrl: 'https://example.gov/ph', verified: true, triggerMode: 'route', cooldownSeconds: 60, requiredContext: ['currentTime'] },
  ];
  await writeFile(guidancePath, JSON.stringify(guidanceRecords));
  drivingGuidance = new DrivingGuidanceRepository(guidancePath);
});

after(async () => {
  await rm(directory, { recursive: true, force: true });
});

function prediction(category: SignCategory | null, referenceId: string | null, country: 'JP' | 'PH' | null = 'JP', modelClass: ModelClass | null = 'JP_STOP'): ModelRecognition {
  return {
    ...emptyRecognition(), detectedCountry: country, detectedSign: referenceId,
    normalizedCategory: category, modelClass: category ? modelClass : null, closestReferenceId: referenceId,
    bbox: category ? [0.1, 0.1, 0.8, 0.8] : null,
    confidence: category ? 0.91 : 0, semanticSimilarity: category ? 0.94 : 0, visualSimilarity: category ? 0.93 : 0,
  };
}

function modelReturning(result: ModelRecognition): GuidanceModel {
  return {
    async recognize() { return result; },
    async explain() { return 'Grounded answer.'; },
  };
}

const image = 'data:image/jpeg;base64,/9j/AA==';

describe('WayFarer guidance API', () => {
  it('returns only tested country and locality-matched pre-trip reminders', async () => {
    const app = createApp({ rules, briefings, model: modelReturning(emptyRecognition()) });
    const japan = await request(app).get('/api/briefing?countryCode=JP').expect(200);
    assert.equal(japan.body.status, 'ready');
    assert.deepEqual(japan.body.items.map((item: BriefingRecord) => item.id), ['jp-driving-side']);
    assert.match(japan.body.speechText, /Keep to the left side/);

    const wrongLocality = await request(app).get('/api/briefing?countryCode=PH&locality=Manila').expect(200);
    assert.deepEqual(wrongLocality.body, {
      status: 'unavailable', countryCode: 'PH', homeCountry: null, locality: 'Manila', items: [], speechText: null,
    });

    const makati = await request(app).get('/api/briefing?countryCode=PH&locality=Makati').expect(200);
    assert.deepEqual(makati.body.items.map((item: BriefingRecord) => item.id), ['ph-local-restriction']);

    await request(app).get('/api/briefing?countryCode=JP&homeCountry=US').expect(400);
  });

  it('returns only verified guidance for the current country and matching jurisdiction', async () => {
    const app = createApp({ rules, drivingGuidance, model: modelReturning(emptyRecognition()) });
    const japan = await request(app).get('/api/driving-guidance?countryCode=JP').expect(200);
    assert.deepEqual(japan.body.rules.map((rule: DrivingGuidanceRule) => rule.id), ['jp-rail']);
    assert.ok(japan.body.rules.every((rule: DrivingGuidanceRule) => rule.message.split(/\s+/).length <= 24));

    const manila = await request(app).get('/api/driving-guidance?countryCode=PH&locality=Manila').expect(200);
    assert.deepEqual(manila.body.rules.map((rule: DrivingGuidanceRule) => rule.id), ['ph-stop-guidance']);

    const makati = await request(app).get('/api/driving-guidance?countryCode=PH&locality=Makati').expect(200);
    assert.deepEqual(makati.body.rules.map((rule: DrivingGuidanceRule) => rule.id), ['ph-stop-guidance', 'ph-makati-coding']);
    assert.ok(makati.body.rules.every((rule: DrivingGuidanceRule) => rule.countryCode === 'PH'));
  });

  it('rejects invalid countries and image formats', async () => {
    const app = createApp({ rules, model: modelReturning(prediction('STOP', 'jp-stop')) });
    await request(app).post('/api/recognize').send({ countryCode: 'US', imageDataUrl: image }).expect(400);
    await request(app).post('/api/recognize').send({ countryCode: 'JP', imageDataUrl: 'not-an-image' }).expect(400);
  });

  it('returns the reviewed tested rule for an allowed recognition', async () => {
    const response = await request(createApp({ rules, model: modelReturning(prediction('STOP', 'jp-stop')) }))
      .post('/api/recognize')
      .send({ countryCode: 'JP', imageDataUrl: image })
      .expect(200);
    assert.equal(response.body.status, 'recognized');
    assert.equal(response.body.rule.id, 'jp-stop');
    assert.equal(response.body.debug.normalizedCategory, 'STOP');
    assert.equal(response.body.debug.modelClass, 'JP_STOP');
    assert.deepEqual(response.body.debug.bbox, [0.1, 0.1, 0.8, 0.8]);
    assert.equal(response.body.debug.matchType, 'EXACT_MATCH');
  });

  it('returns a candidate classification without promoting it to driving guidance', async () => {
    const response = await request(createApp({ rules, model: modelReturning(prediction('MAX_SPEED', 'jp-speed-30', 'JP', 'JP_MAX_SPEED_30')) }))
      .post('/api/recognize')
      .send({ countryCode: 'JP', imageDataUrl: image })
      .expect(200);
    assert.equal(response.body.status, 'candidate');
    assert.equal(response.body.signId, 'jp-speed-30');
    assert.equal(response.body.rule.status, 'candidate');
    await request(createApp({ rules, model: modelReturning(prediction('MAX_SPEED', 'jp-speed-30', 'JP', 'JP_MAX_SPEED_30')) }))
      .post('/api/speak')
      .send({ countryCode: 'JP', signId: 'jp-speed-30' })
      .expect(404);
  });

  it('resolves a cross-country visual variant by semantic category', async () => {
    const crossCountryPrediction = {
      ...prediction('STOP', 'ph-stop', 'PH', 'PH_STOP'),
      visualSimilarity: 0.55,
    };
    const response = await request(createApp({ rules, model: modelReturning(crossCountryPrediction) }))
      .post('/api/recognize')
      .send({ countryCode: 'JP', imageDataUrl: image })
      .expect(200);
    assert.equal(response.body.status, 'recognized');
    assert.equal(response.body.rule.id, 'jp-stop');
    assert.equal(response.body.debug.closestReference.id, 'ph-stop');
    assert.equal(response.body.debug.detectedCountry, 'PH');
    assert.equal(response.body.debug.matchType, 'SEMANTIC_MATCH');
  });

  it('maps a foreign visual class to the local rule with the same meaning', async () => {
    const response = await request(createApp({ rules, model: modelReturning(prediction('STOP', 'jp-stop')) }))
      .post('/api/recognize')
      .send({ countryCode: 'PH', imageDataUrl: image })
      .expect(200);
    assert.equal(response.body.status, 'recognized');
    assert.equal(response.body.rule.id, 'ph-stop');
    assert.equal(response.body.rule.countryCode, 'PH');
    assert.equal(response.body.debug.matchType, 'SEMANTIC_MATCH');
  });

  it('returns a retry window when live recognition is rate limited', async () => {
    const rateLimitedModel: GuidanceModel = {
      async recognize() {
        throw Object.assign(new Error('provider limit'), { status: 429, headers: { get: () => '45' } });
      },
      async explain() { return 'unused'; },
    };
    const response = await request(createApp({ rules, model: rateLimitedModel }))
      .post('/api/recognize').send({ countryCode: 'JP', imageDataUrl: image }).expect(503);
    assert.equal(response.headers['retry-after'], '45');
    assert.deepEqual(response.body, {
      error: 'Live recognition is rate limited. Retrying in 45 seconds.',
      code: 'RATE_LIMITED',
      retryAfterSeconds: 45,
    });
  });

  it('does not treat different posted speed values as semantically equivalent', async () => {
    const philippinesSpeed: RuleRecord = {
      ...candidateRule, id: 'ph-speed-50', modelClass: 'PH_MAX_SPEED_50', countryCode: 'PH',
      label: 'Maximum speed 50', meaning: 'Do not exceed 50 kilometers per hour.', assetPath: '/signs/test/ph-speed-50.svg',
    };
    const speedPath = join(directory, 'speed-rules.json');
    await writeFile(speedPath, JSON.stringify([candidateRule, philippinesSpeed]));
    const speedRules = new RuleRepository(speedPath);
    const response = await request(createApp({ rules: speedRules, model: modelReturning(prediction('MAX_SPEED', 'ph-speed-50', 'PH', 'PH_MAX_SPEED_50')) }))
      .post('/api/recognize').send({ countryCode: 'JP', imageDataUrl: image }).expect(200);
    assert.equal(response.body.status, 'unknown');
    assert.equal(response.body.debug.matchType, 'RELATED');
    assert.equal(response.body.rule, null);
  });

  it('grounds explanations and browser speech text in a tested record', async () => {
    const app = createApp({ rules, model: modelReturning(prediction('STOP', 'jp-stop')) });
    const explanation = await request(app).post('/api/explain')
      .send({ countryCode: 'JP', signId: 'jp-stop', question: 'What should I do?' }).expect(200);
    assert.equal(explanation.body.sourceUrl, testedRule.sourceUrl);
    assert.equal(explanation.body.status, 'tested');
    const candidateExplanation = await request(app).post('/api/explain')
      .send({ countryCode: 'JP', signId: 'jp-speed-30', question: 'What does this mean?' }).expect(200);
    assert.equal(candidateExplanation.body.sourceUrl, candidateRule.sourceUrl);
    assert.equal(candidateExplanation.body.status, 'candidate');
    const speech = await request(app).post('/api/speak').send({ countryCode: 'JP', signId: 'jp-stop' }).expect(200);
    assert.deepEqual(speech.body, { text: testedRule.shortAlert, engine: 'browser-speech-synthesis' });
    await request(app).post('/api/speak').send({ countryCode: 'JP', signId: 'jp-speed-30' }).expect(404);
  });

});
