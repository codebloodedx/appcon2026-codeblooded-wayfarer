import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { BriefingRepository } from '../src/briefings.js';
import type { GuidanceModel } from '../src/groq.js';
import { RuleRepository } from '../src/rules.js';
import type { BriefingRecord, RuleRecord } from '../src/types.js';

const testedRule: RuleRecord = {
  id: 'jp-stop',
  countryCode: 'JP',
  label: 'Stop',
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
  id: 'jp-crossing',
  label: 'Railway crossing',
  status: 'candidate',
};

let directory = '';
let rules: RuleRepository;
let briefings: BriefingRepository;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'roamright-'));
  const path = join(directory, 'rules.json');
  await writeFile(path, JSON.stringify([testedRule, candidateRule]));
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
});

after(async () => {
  await rm(directory, { recursive: true, force: true });
});

function modelReturning(signId: string | null): GuidanceModel {
  return {
    async recognize() { return signId; },
    async explain() { return 'Grounded answer.'; },
  };
}

const image = 'data:image/jpeg;base64,/9j/AA==';

describe('WayFarer guidance API', () => {
  it('returns only tested country and locality-matched pre-trip reminders', async () => {
    const app = createApp({ rules, briefings, model: modelReturning(null) });
    const japan = await request(app).get('/api/briefing?countryCode=JP').expect(200);
    assert.equal(japan.body.status, 'ready');
    assert.deepEqual(japan.body.items.map((item: BriefingRecord) => item.id), ['jp-driving-side']);
    assert.match(japan.body.speechText, /Keep to the left side/);

    const wrongLocality = await request(app).get('/api/briefing?countryCode=PH&locality=Manila').expect(200);
    assert.deepEqual(wrongLocality.body, {
      status: 'unavailable', countryCode: 'PH', locality: 'Manila', items: [], speechText: null,
    });

    const makati = await request(app).get('/api/briefing?countryCode=PH&locality=Makati').expect(200);
    assert.deepEqual(makati.body.items.map((item: BriefingRecord) => item.id), ['ph-local-restriction']);
  });

  it('rejects invalid countries and image formats', async () => {
    const app = createApp({ rules, model: modelReturning('jp-stop') });
    await request(app).post('/api/recognize').send({ countryCode: 'US', imageDataUrl: image }).expect(400);
    await request(app).post('/api/recognize').send({ countryCode: 'JP', imageDataUrl: 'not-an-image' }).expect(400);
  });

  it('returns the reviewed tested rule for an allowed recognition', async () => {
    const response = await request(createApp({ rules, model: modelReturning('jp-stop') }))
      .post('/api/recognize')
      .send({ countryCode: 'JP', imageDataUrl: image })
      .expect(200);
    assert.equal(response.body.status, 'recognized');
    assert.equal(response.body.rule.id, 'jp-stop');
  });

  it('returns a candidate classification without promoting it to driving guidance', async () => {
    const response = await request(createApp({ rules, model: modelReturning('jp-crossing') }))
      .post('/api/recognize')
      .send({ countryCode: 'JP', imageDataUrl: image })
      .expect(200);
    assert.equal(response.body.status, 'candidate');
    assert.equal(response.body.signId, 'jp-crossing');
    assert.equal(response.body.rule.status, 'candidate');
    await request(createApp({ rules, model: modelReturning('jp-crossing') }))
      .post('/api/speak')
      .send({ countryCode: 'JP', signId: 'jp-crossing' })
      .expect(404);
  });

  it('returns unknown when the model emits an invented ID', async () => {
    const response = await request(createApp({ rules, model: modelReturning('invented-sign') }))
      .post('/api/recognize')
      .send({ countryCode: 'JP', imageDataUrl: image })
      .expect(200);
    assert.deepEqual(response.body, { status: 'unknown', signId: null, rule: null });
  });

  it('does not use a rule from another country', async () => {
    const response = await request(createApp({ rules, model: modelReturning('jp-stop') }))
      .post('/api/recognize')
      .send({ countryCode: 'PH', imageDataUrl: image })
      .expect(200);
    assert.deepEqual(response.body, { status: 'unknown', signId: null, rule: null });
  });

  it('grounds explanations and browser speech text in a tested record', async () => {
    const app = createApp({ rules, model: modelReturning('jp-stop') });
    const explanation = await request(app).post('/api/explain')
      .send({ countryCode: 'JP', signId: 'jp-stop', question: 'What should I do?' }).expect(200);
    assert.equal(explanation.body.sourceUrl, testedRule.sourceUrl);
    const speech = await request(app).post('/api/speak').send({ countryCode: 'JP', signId: 'jp-stop' }).expect(200);
    assert.deepEqual(speech.body, { text: testedRule.shortAlert, engine: 'browser-speech-synthesis' });
    await request(app).post('/api/speak').send({ countryCode: 'JP', signId: 'jp-crossing' }).expect(404);
  });
});
