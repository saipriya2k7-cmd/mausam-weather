import { CITIES } from '../data/cities';
import { CityProfile } from '../types/weather';

export interface LocationResult {
  city: CityProfile;
  source: 'gps' | 'ip' | 'preset' | 'manual';
  accuracyMeters?: number;
  detectedName?: string;
  detectedState?: string;
  distanceToStationKm?: number;
  latitude: number;
  longitude: number;
  status: 'success' | 'permission_denied' | 'fallback_ip' | 'fallback_preset';
  statusMessage?: string;
}

// Calculate Haversine distance in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Find closest IMD observatory from our registry
export function findNearestStation(lat: number, lon: number): {
  city: CityProfile;
  distanceKm: number;
} {
  let closest = CITIES[0];
  let minDistance = Infinity;

  for (const c of CITIES) {
    const dist = calculateDistanceKm(lat, lon, c.lat, c.lon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = c;
    }
  }

  return {
    city: closest,
    distanceKm: minDistance,
  };
}

// Fast, CORS-compliant reverse geocode via BigDataCloud client API
async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<{ name?: string; state?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const cityName = data.city || data.locality || data.principalSubdivision;
      const stateName = data.principalSubdivision || data.countryName;
      return { name: cityName, state: stateName };
    }
  } catch {
    // Graceful fallback
  }
  return {};
}

// Multi-endpoint CORS-friendly IP Geolocation
async function fetchIpGeolocation(): Promise<{
  lat: number;
  lon: number;
  city?: string;
  region?: string;
} | null> {
  // Strategy 1: BigDataCloud client IP geolocation
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      'https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en',
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        return {
          lat: data.latitude,
          lon: data.longitude,
          city: data.city || data.locality || data.principalSubdivision,
          region: data.principalSubdivision,
        };
      }
    }
  } catch {
    // Continue to next strategy
  }

  // Strategy 2: ipwho.is (CORS enabled)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        return {
          lat: data.latitude,
          lon: data.longitude,
          city: data.city,
          region: data.region,
        };
      }
    }
  } catch {
    // Continue to next strategy
  }

  // Strategy 3: freeipapi.com (CORS enabled)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch('https://freeipapi.com/api/json', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        return {
          lat: data.latitude,
          lon: data.longitude,
          city: data.cityName,
          region: data.regionName,
        };
      }
    }
  } catch {
    // All IP lookups failed
  }

  return null;
}

// Master auto-detect function
export async function autoDetectLocation(): Promise<LocationResult> {
  // 1. First attempt: Browser Geolocation API
  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: false, // Low accuracy is faster and works inside iframes/cellular/Wi-Fi
            timeout: 5000,
            maximumAge: 300000, // 5 min cache
          }
        );
      });

      const { latitude, longitude, accuracy } = pos.coords;
      const { city: nearestCity, distanceKm } = findNearestStation(latitude, longitude);
      const rev = await reverseGeocodeCoordinates(latitude, longitude);

      const resolvedCityName = rev.name || nearestCity.name;
      const resolvedStateName = rev.state || nearestCity.state;

      const detectedCity: CityProfile = {
        ...nearestCity,
        id: `detected_${latitude.toFixed(2)}_${longitude.toFixed(2)}`,
        name: resolvedCityName,
        hindiName: nearestCity.hindiName,
        state: resolvedStateName,
        lat: latitude,
        lon: longitude,
        isDetected: true,
        distanceKm,
      };

      return {
        city: detectedCity,
        source: 'gps',
        accuracyMeters: accuracy,
        detectedName: resolvedCityName,
        detectedState: resolvedStateName,
        distanceToStationKm: distanceKm,
        latitude,
        longitude,
        status: 'success',
        statusMessage: `Locked via GPS · ${distanceKm} km to ${nearestCity.name} IMD Observatory`,
      };
    } catch (geoError: any) {
      // If user denied permission or iframe policy restricted it
      const isPermissionDenied = geoError?.code === 1;
      console.info(
        isPermissionDenied
          ? 'Browser GPS permission not granted; trying network IP geolocation...'
          : 'GPS timed out; trying network IP geolocation...'
      );
    }
  }

  // 2. Second attempt: Resilient IP Geolocation
  const ipLoc = await fetchIpGeolocation();
  if (ipLoc) {
    const { city: nearestCity, distanceKm } = findNearestStation(ipLoc.lat, ipLoc.lon);

    const detectedCity: CityProfile = {
      ...nearestCity,
      id: `ip_${ipLoc.lat.toFixed(2)}_${ipLoc.lon.toFixed(2)}`,
      name: ipLoc.city || nearestCity.name,
      state: ipLoc.region || nearestCity.state,
      lat: ipLoc.lat,
      lon: ipLoc.lon,
      isDetected: true,
      distanceKm,
    };

    return {
      city: detectedCity,
      source: 'ip',
      detectedName: ipLoc.city,
      detectedState: ipLoc.region,
      distanceToStationKm: distanceKm,
      latitude: ipLoc.lat,
      longitude: ipLoc.lon,
      status: 'fallback_ip',
      statusMessage: `Located via Network IP · Nearest station: ${nearestCity.name}`,
    };
  }

  // 3. Fallback: Default to National Capital Observatory (New Delhi)
  const defaultCity = CITIES[0];
  return {
    city: defaultCity,
    source: 'preset',
    latitude: defaultCity.lat,
    longitude: defaultCity.lon,
    distanceToStationKm: 0,
    status: 'fallback_preset',
    statusMessage: 'Location permission needed for GPS. Defaulted to IMD National Observatory, New Delhi.',
  };
}
