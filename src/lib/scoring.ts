// Erdradius in Kilometern
const EARTH_RADIUS_KM = 6371;

// Berechnet die Grosskreisdistanz zwischen zwei Punkten (Haversine-Formel)
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

// Punkte fuer eine Runde nach GeoGuessr-Stil:
// 0 km -> 5000 Punkte, faellt exponentiell ab
export function pointsFromDistance(distanceKm: number): number {
  if (distanceKm < 0) return 0;
  return Math.round(5000 * Math.exp(-distanceKm / 2000));
}

// Hilfsformat: "1.234 km" oder "523 m"
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toLocaleString("de-DE", { maximumFractionDigits: 1 })} km`;
}
