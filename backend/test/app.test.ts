import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import type { GuidanceModel } from '../src/gemini.js';
import { RuleRepository } from '../src/rules.js';
import type { RuleRecord } from '../src/types.js';

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

before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'roamright-'));
  const path = join(directory, 'rules.json');
  await writeFile(path, JSON.stringify([testedRule, candidateRule]));
  rules = new RuleRepository(path);
});

after(async () => {
  await rm(directory, { recursive: true, force: true });
});

function modelReturning(signId: string | null): GuidanceModel {
  return {
    async recognize() { return signId; },
    async explain() { return 'Grounded answer.'; },
    async speak() { return Buffer.from('RIFF-test'); },
  };
}

const image = 'data:image/jpeg;base64,/9j/AA==';

describe('RoamRight guidance API', () => {
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

  it('returns unknown when the model emits a candidate or invented ID', async () => {
    for (const signId of ['jp-crossing', 'invented-sign']) {
      const response = await request(createApp({ rules, model: modelReturning(signId) }))
        .post('/api/recognize')
        .send({ countryCode: 'JP', imageDataUrl: image })
        .expect(200);
      assert.deepEqual(response.body, { status: 'unknown', signId: null, rule: null });
    }
  });

  it('does not use a rule from another country', async () => {
    const response = await request(createApp({ rules, model: modelReturning('jp-stop') }))
      .post('/api/recognize')
      .send({ countryCode: 'PH', imageDataUrl: image })
      .expect(200);
    assert.deepEqual(response.body, { status: 'unknown', signId: null, rule: null });
  });

  it('grounds explanations and speech in a tested record', async () => {
    const app = createApp({ rules, model: modelReturning('jp-stop') });
    const explanation = await request(app).post('/api/explain')
      .send({ countryCode: 'JP', signId: 'jp-stop', question: 'What should I do?' }).expect(200);
    assert.equal(explanation.body.sourceUrl, testedRule.sourceUrl);
    await request(app).post('/api/speak').send({ countryCode: 'JP', signId: 'jp-stop' })
      .expect('Content-Type', /audio\/wav/).expect(200);
    await request(app).post('/api/speak').send({ countryCode: 'JP', signId: 'jp-crossing' }).expect(404);
  });
});
