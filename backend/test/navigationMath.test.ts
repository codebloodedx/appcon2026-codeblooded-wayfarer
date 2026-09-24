import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { bearingBetween, cumulativeDistances, pointAtDistance } from '../../frontend/src/features/map/navigationMath.js';
import { advanceSpeed, approachTargetKph, brakingDistanceForSpeed, cruiseSpeedForRoute, interpolateBearing, motionStateFor, playbackLabel } from '../../frontend/src/features/map/drivingSimulation.js';

describe('navigation route interpolation', () => {
  const path = [
    { lat: 14.6042, lng: 120.9947 },
    { lat: 14.5942, lng: 120.9947 },
    { lat: 14.5842, lng: 121.0047 },
  ];
  const cumulative = cumulativeDistances(path);

  it('builds increasing distance along every route segment', () => {
    assert.equal(cumulative.length, path.length);
    assert.equal(cumulative[0], 0);
    assert.ok(cumulative[1] > 1000);
    assert.ok(cumulative[2] > cumulative[1]);
  });

  it('interpolates within the route instead of jumping between vertices', () => {
    const middle = pointAtDistance(path, cumulative, cumulative[1] / 2);
    assert.ok(middle.point.lat < path[0].lat);
    assert.ok(middle.point.lat > path[1].lat);
    assert.equal(middle.point.lng, path[0].lng);
  });

  it('returns a travel bearing in degrees', () => {
    const bearing = bearingBetween(path[0], path[1]);
    assert.ok(bearing > 170 && bearing < 190);
  });
});

describe('realistic driving simulation math', () => {
  it('accelerates and brakes gradually without overshooting the target speed', () => {
    assert.equal(advanceSpeed(0, 55, 1000), 7.2);
    assert.equal(advanceSpeed(55, 0, 1000), 42.04);
    assert.equal(advanceSpeed(54, 55, 1000), 55);
  });

  it('keeps normal route cruising between 50 and 60 kilometers per hour', () => {
    assert.equal(cruiseSpeedForRoute(35), 50);
    assert.equal(cruiseSpeedForRoute(55), 55);
    assert.equal(cruiseSpeedForRoute(75), 60);
    assert.equal(cruiseSpeedForRoute(Number.NaN), 55);
  });

  it('starts braking within the requested 50 to 80 meter event zone', () => {
    assert.equal(brakingDistanceForSpeed(20), 50);
    assert.ok(brakingDistanceForSpeed(36) >= 50 && brakingDistanceForSpeed(36) <= 80);
    assert.equal(brakingDistanceForSpeed(60), 80);
  });

  it('reduces the safe target speed as a full-stop event gets closer', () => {
    const atSixtyMeters = approachTargetKph(60, 60, 36, 0);
    const atThirtyMeters = approachTargetKph(30, 60, 36, 0);
    const atTenMeters = approachTargetKph(10, 60, 36, 0);
    assert.equal(atSixtyMeters, 36);
    assert.ok(atThirtyMeters < atSixtyMeters);
    assert.ok(atSixtyMeters > atTenMeters);
    assert.equal(approachTargetKph(0, 60, 36, 0), 0);
  });

  it('reports movement state from speed intent and prioritizes turns', () => {
    assert.equal(motionStateFor(0, 0, false), 'STOPPED');
    assert.equal(motionStateFor(20, 35, false), 'ACCELERATING');
    assert.equal(motionStateFor(35, 15, false), 'DECELERATING');
    assert.equal(motionStateFor(18, 18, true), 'TURNING');
  });

  it('rotates through the shortest bearing path across north', () => {
    assert.equal(interpolateBearing(350, 10, 0.5), 0);
    assert.equal(interpolateBearing(10, 350, 0.5), 0);
  });

  it('keeps playback mode separate from vehicle speed labels', () => {
    assert.equal(playbackLabel(1), 'Realistic · 50–60 km/h');
    assert.equal(playbackLabel(2), 'Fast Demo · 2× playback');
    assert.equal(playbackLabel(4), 'Quick Demo · 4× playback');
  });
});
