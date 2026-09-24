import type { GuidanceEvent } from '../guidance/types';

export type VehicleMotionState = 'ACCELERATING' | 'CRUISING' | 'DECELERATING' | 'STOPPED' | 'TURNING';
export type SignalPhase = 'RED' | 'GREEN' | null;

export type DrivingEventPlan = {
  id: string;
  event: GuidanceEvent;
  distance: number;
  prepareDistance: number;
  brakingDistance: number;
  targetSpeedKph: number;
  stopDurationMs: number;
  label: string;
};

export const MIN_CRUISE_KPH = 50;
export const MAX_CRUISE_KPH = 60;
export const CITY_CRUISE_KPH = 55;
export const ACCELERATION_MPS2 = 2;
export const BRAKING_MPS2 = 3.6;

export function cruiseSpeedForRoute(averageRouteKph: number) {
  if (!Number.isFinite(averageRouteKph)) return CITY_CRUISE_KPH;
  return Math.min(MAX_CRUISE_KPH, Math.max(MIN_CRUISE_KPH, averageRouteKph));
}

export function approachDistanceForSpeed(speedKph: number) {
  return Math.min(150, Math.max(100, speedKph * 3));
}

export function brakingDistanceForSpeed(speedKph: number) {
  return Math.min(80, Math.max(50, speedKph * 1.7));
}

export function advanceSpeed(currentKph: number, targetKph: number, elapsedSimulationMs: number) {
  const accelerating = targetKph > currentKph;
  const delta = (accelerating ? ACCELERATION_MPS2 : BRAKING_MPS2) * (elapsedSimulationMs / 1000) * 3.6;
  return accelerating ? Math.min(targetKph, currentKph + delta) : Math.max(targetKph, currentKph - delta);
}

export function approachTargetKph(distanceToEvent: number, brakingDistance: number, cruiseSpeedKph: number, finalSpeedKph: number) {
  if (distanceToEvent <= 0) return finalSpeedKph;
  if (distanceToEvent >= brakingDistance) return cruiseSpeedKph;
  const approachRatio = Math.sqrt(distanceToEvent / brakingDistance);
  return finalSpeedKph + (cruiseSpeedKph - finalSpeedKph) * approachRatio;
}

export function motionStateFor(currentKph: number, targetKph: number, turning: boolean): VehicleMotionState {
  if (currentKph < 0.5 && targetKph < 0.5) return 'STOPPED';
  if (turning) return 'TURNING';
  if (targetKph < currentKph - 0.8) return 'DECELERATING';
  if (targetKph > currentKph + 0.8) return 'ACCELERATING';
  return 'CRUISING';
}

export function interpolateBearing(current: number, target: number, amount: number) {
  const shortestDelta = ((target - current + 540) % 360) - 180;
  return (current + shortestDelta * Math.min(1, Math.max(0, amount)) + 360) % 360;
}

export function playbackLabel(multiplier: number) {
  if (multiplier === 1) return 'Realistic · 50–60 km/h';
  if (multiplier === 2) return 'Fast Demo · 2× playback';
  return 'Quick Demo · 4× playback';
}
