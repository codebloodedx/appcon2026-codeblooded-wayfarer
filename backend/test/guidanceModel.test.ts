import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseBoundingBox, parseGeminiBoundingBox } from '../src/guidanceModel.js';

describe('Gemini bounding boxes', () => {
  it('converts documented y/x coordinates into the UI x/y order', () => {
    assert.deepEqual(parseGeminiBoundingBox([100, 250, 800, 900]), [0.25, 0.1, 0.9, 0.8]);
  });

  it('accepts normalized Gemini coordinates for compatibility', () => {
    assert.deepEqual(parseGeminiBoundingBox([0.1, 0.25, 0.8, 0.9]), [0.25, 0.1, 0.9, 0.8]);
  });

  it('rejects malformed, inverted, negative, and oversized coordinates', () => {
    assert.equal(parseBoundingBox([0.1, 0.2, 0.3]), null);
    assert.equal(parseGeminiBoundingBox([800, 250, 100, 900]), null);
    assert.equal(parseGeminiBoundingBox([-1, 250, 800, 900]), null);
    assert.equal(parseGeminiBoundingBox([100, 250, 1200, 900]), null);
  });
});
