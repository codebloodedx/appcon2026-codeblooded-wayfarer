import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fitNormalizedBoxToCover } from '../../frontend/src/features/camera/detectionOverlay.js';

describe('camera detection overlay', () => {
  it('maps a normalized box into a same-ratio stage', () => {
    assert.deepEqual(fitNormalizedBoxToCover([0.25, 0.2, 0.75, 0.8], 1600, 900, 800, 450), {
      left: 200, top: 90, width: 400, height: 270,
    });
  });

  it('accounts for vertical cropping from object-fit cover', () => {
    assert.deepEqual(fitNormalizedBoxToCover([0.25, 0.25, 0.75, 0.75], 640, 480, 640, 360), {
      left: 160, top: 60, width: 320, height: 240,
    });
  });

  it('rejects invalid or fully cropped boxes', () => {
    assert.equal(fitNormalizedBoxToCover([0.9, 0.9, 0.1, 0.1], 640, 480, 640, 360), null);
    assert.equal(fitNormalizedBoxToCover([0, 0, 0.1, 0.05], 640, 480, 640, 360), null);
  });
});
