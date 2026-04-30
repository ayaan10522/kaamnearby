// Geolocation utilities — Haversine distance + browser geolocation helper

export interface GeoCoords {
  lat: number;
  lng: number;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Distance in kilometers between two coords using Haversine formula */
export const distanceKm = (a: GeoCoords, b: GeoCoords): number => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/** Format distance to human-friendly string */
export const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
};

/** Request browser geolocation (returns null on failure) */
export const getCurrentLocation = (): Promise<GeoCoords | null> =>
  new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 10000, enableHighAccuracy: false, maximumAge: 5 * 60 * 1000 }
    );
  });

/** Returns distance between job and user, or null if either coord missing */
export const jobDistanceKm = (
  userCoords?: GeoCoords | null,
  jobCoords?: GeoCoords | null
): number | null => {
  if (!userCoords || !jobCoords) return null;
  if (
    typeof userCoords.lat !== 'number' ||
    typeof userCoords.lng !== 'number' ||
    typeof jobCoords.lat !== 'number' ||
    typeof jobCoords.lng !== 'number'
  )
    return null;
  return distanceKm(userCoords, jobCoords);
};
