"use client";

export type LocationItem = { id: string; name: string };

type LocationsCacheShape = {
  version: number;
  cities: LocationItem[];
  districtsByCity: Record<string, LocationItem[]>;
  neighborhoodsByDistrict: Record<string, LocationItem[]>;
  updatedAt: number;
};

const CACHE_KEY = "locations-cache-v1";
const CURRENT_VERSION = 1;

let memoryCache: LocationsCacheShape | null = null;

export function getCache(): LocationsCacheShape | null {
  if (memoryCache) return memoryCache;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocationsCacheShape;
    if (parsed.version !== CURRENT_VERSION) return null;
    memoryCache = parsed;
    return memoryCache;
  } catch {
    return null;
  }
}

export function setCache(next: LocationsCacheShape): void {
  memoryCache = next;
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
}

export function ensureCache(): LocationsCacheShape {
  const existing = getCache();
  if (existing) return existing;
  const fresh: LocationsCacheShape = {
    version: CURRENT_VERSION,
    cities: [],
    districtsByCity: {},
    neighborhoodsByDistrict: {},
    updatedAt: Date.now(),
  };
  setCache(fresh);
  return fresh;
}

export function upsertCities(cities: LocationItem[]): void {
  const c = ensureCache();
  c.cities = cities;
  c.updatedAt = Date.now();
  setCache(c);
}

export function upsertDistricts(cityId: string, districts: LocationItem[]): void {
  const c = ensureCache();
  c.districtsByCity[cityId] = districts;
  c.updatedAt = Date.now();
  setCache(c);
}

export function upsertNeighborhoods(districtId: string, neighborhoods: LocationItem[]): void {
  const c = ensureCache();
  c.neighborhoodsByDistrict[districtId] = neighborhoods;
  c.updatedAt = Date.now();
  setCache(c);
}

export function readCities(): LocationItem[] { return ensureCache().cities; }
export function readDistricts(cityId: string | undefined): LocationItem[] {
  if (!cityId) return [];
  return ensureCache().districtsByCity[cityId] ?? [];
}
export function readNeighborhoods(districtId: string | undefined): LocationItem[] {
  if (!districtId) return [];
  return ensureCache().neighborhoodsByDistrict[districtId] ?? [];
}


