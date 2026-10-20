export type LatLng = { lat: number; lng: number };

export const RADIUS_OPTIONS_KM = [1, 3, 5, 10] as const;

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance between two points in kilometers. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Lat/lng rectangle that fully contains the circle of `radiusKm` around `center`.
 * Used as a cheap index-friendly SQL prefilter before the exact haversine check.
 */
export function boundingBox(center: LatLng, radiusKm: number) {
  const latDelta = (radiusKm / EARTH_RADIUS_KM) * (180 / Math.PI);
  const cosLat = Math.max(Math.cos(toRad(center.lat)), 1e-6);
  const lngDelta = latDelta / cosLat;
  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLng: center.lng - lngDelta,
    maxLng: center.lng + lngDelta,
  };
}

/** Keep items within `radiusKm` of `center`, annotated with their distance. */
export function withinRadius<T extends LatLng>(
  items: T[],
  center: LatLng,
  radiusKm: number,
): (T & { distanceKm: number })[] {
  return items
    .map((item) => ({ ...item, distanceKm: haversineKm(center, item) }))
    .filter((item) => item.distanceKm <= radiusKm);
}

export function formatDistance(km: number): string {
  if (km < 0.1) return "100m 이내";
  if (km < 1) return `${Math.round(km * 10) * 100}m`;
  return `${km.toFixed(1)}km`;
}
