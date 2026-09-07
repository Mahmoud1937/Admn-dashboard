const REVERSE_GEOCODE_URL =
  "https://api.bigdatacloud.net/data/reverse-geocode-client";

// Cache is keyed per language because the API returns one language per call.
const locationCache = new Map();

async function fetchReverseGeocode(lat, lng, lang, signal) {
  const cacheKey = `${lang}:${lat.toFixed(5)},${lng.toFixed(5)}`;

  const cached = locationCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const url =
    `${REVERSE_GEOCODE_URL}` +
    `?latitude=${encodeURIComponent(lat)}` +
    `&longitude=${encodeURIComponent(lng)}` +
    `&localityLanguage=${encodeURIComponent(lang)}`;

  try {
    const res = await fetch(url, { signal });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    const admin = (data.localityInfo?.administrative ?? []).filter(
      (item) =>
        typeof item.name === "string" &&
        item.name.trim() !== ""
    );

    /*
     * Egypt usually has:
     *
     * Country
     *   ↓
     * Governorate
     *   ↓
     * Markaz / Qism / City
     *   ↓
     * District / Neighborhood
     *
     * But the exact hierarchy isn't guaranteed for every coordinate,
     * so we use admin levels as a best-effort lookup.
     */

    const governorateEntry = admin.find(
      (item) => item.adminLevel === 4
    );

    const cityEntries = admin.filter(
      (item) =>
        item.adminLevel >= 5 &&
        item.adminLevel <= 7
    );

    const districtEntries = admin.filter(
      (item) => item.adminLevel >= 8
    );

    const result = {
      governorate:
        governorateEntry?.name ??
        data.principalSubdivision ??
        null,

      city:
        cityEntries.at(-1)?.name ??
        data.city ??
        data.locality ??
        null,

      district:
        districtEntries.at(-1)?.name ??
        data.locality ??
        null,

    };

    locationCache.set(cacheKey, result);

    return result;
  } catch (error) {
    if (error?.name === "AbortError") {
      return null;
    }

    return null;
  }
}

// Returns governorate / city / district in BOTH Arabic and English. If one of
// the two lookups fails, its fields are null and the UI falls back to the
// language that succeeded.
export async function getLocationFromCoords(lat, lng, signal) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const [ar, en] = await Promise.all([
    fetchReverseGeocode(lat, lng, "ar", signal),
    fetchReverseGeocode(lat, lng, "en", signal),
  ]);

  return {
    governorateAr: ar?.governorate ?? null,
    governorateEn: en?.governorate ?? null,
    cityAr: ar?.city ?? null,
    cityEn: en?.city ?? null,
    districtAr: ar?.district ?? null,
    districtEn: en?.district ?? null,
  };
}
