export type RoutePoint = { lat: number; lng: number };

const EARTH_RADIUS_METERS = 6_371_000;
const radians = (degrees: number) => degrees * Math.PI / 180;

export function distanceBetween(a: RoutePoint, b: RoutePoint): number {
  const dLat = radians(b.lat - a.lat);
  const dLng = radians(b.lng - a.lng);
  const lat1 = radians(a.lat);
  const lat2 = radians(b.lat);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(value));
}

export function cumulativeDistances(path: RoutePoint[]): number[] {
  const result = [0];
  for (let index = 1; index < path.length; index += 1) {
    result.push(result[index - 1] + distanceBetween(path[index - 1], path[index]));
  }
  return result;
}

export function pointAtDistance(path: RoutePoint[], cumulative: number[], distance: number): { point: RoutePoint; index: number } {
  if (path.length === 0) return { point: { lat: 0, lng: 0 }, index: 0 };
  if (path.length === 1 || distance <= 0) return { point: path[0], index: 0 };
  const total = cumulative.at(-1) ?? 0;
  if (distance >= total) return { point: path.at(-1)!, index: path.length - 1 };
  let low = 1;
  let high = cumulative.length - 1;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (cumulative[middle] < distance) low = middle + 1;
    else high = middle;
  }
  const endIndex = low;
  const startIndex = endIndex - 1;
  const segmentLength = cumulative[endIndex] - cumulative[startIndex];
  const ratio = segmentLength > 0 ? (distance - cumulative[startIndex]) / segmentLength : 0;
  return {
    point: {
      lat: path[startIndex].lat + (path[endIndex].lat - path[startIndex].lat) * ratio,
      lng: path[startIndex].lng + (path[endIndex].lng - path[startIndex].lng) * ratio,
    },
    index: startIndex,
  };
}

export function bearingBetween(a: RoutePoint, b: RoutePoint): number {
  const lat1 = radians(a.lat);
  const lat2 = radians(b.lat);
  const dLng = radians(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
