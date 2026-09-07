import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getClientLocations } from "../services/ClientMapService";
import { hasValidEgyptCoords } from "../utils/Mapcoords";
import { resolveGovernorateFromCoords } from "../utils/Resolvegovernorate";
import { getAllGovernorateCenters } from "../utils/GovernorateCenters";
import { normalizeArabic } from "../utils/Arabictext";

const EGYPT_CENTER_LAT = 26.8;
const EGYPT_CENTER_LNG = 30.8;
const CLIENT_GRID_SIZE_METERS = 200;
const EARTH_RADIUS_METERS = 6_378_137;

export const useClientLocationsQuery = (enabled) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["client-locations"],
    queryFn: getClientLocations,
    enabled,
    staleTime: 5 * 60_000,
  });

  // 1) Validate raw coords + assign the governorate from the geographic
  // polygons (source of truth). City/district are NOT known yet here.
  const baseLocations = useMemo(() => {
    let invalid = 0;
    const valid = [];
    for (const c of data ?? []) {
      if (!hasValidEgyptCoords(c.lat, c.lng)) {
        invalid += 1;
        continue;
      }
      const resolvedGov = resolveGovernorateFromCoords(c.lat, c.lng);
      if (!resolvedGov) {
        invalid += 1;
        continue;
      }
      valid.push({
        id: c.id ?? null,
        lat: c.lat,
        lng: c.lng,
        governorate: resolvedGov.nameAr,
        governorateNameEn: resolvedGov.nameEn,
        governorateIsoCode: resolvedGov.isoCode,
      });
    }
    return { locations: valid, invalidCount: invalid };
  }, [data]);

  const locations = baseLocations.locations;

  // A deterministic 200m × 200m geographic grid. Unlike a screen-pixel
  // marker cluster, its membership never changes when the user zooms: every
  // cell remains one bubble containing all of its clients.
  const locationBubbles = useMemo(() => {
    const buckets = new Map();

    for (const client of locations) {
      const x = EARTH_RADIUS_METERS * (client.lng * Math.PI / 180);
      const y = EARTH_RADIUS_METERS * Math.log(
        Math.tan(Math.PI / 4 + (client.lat * Math.PI / 180) / 2)
      );
      const column = Math.floor(x / CLIENT_GRID_SIZE_METERS);
      const row = Math.floor(y / CLIENT_GRID_SIZE_METERS);
      const id = `${column}-${row}`;
      const bucket = buckets.get(id) ?? {
        id: `client-grid-${id}`,
        count: 0,
        latTotal: 0,
        lngTotal: 0,
        governorates: new Map(),
      };

      bucket.count += 1;
      bucket.latTotal += client.lat;
      bucket.lngTotal += client.lng;
      const governorate = bucket.governorates.get(client.governorateIsoCode) ?? {
        id: client.governorateIsoCode,
        nameAr: client.governorate,
        nameEn: client.governorateNameEn,
        count: 0,
      };
      governorate.count += 1;
      bucket.governorates.set(client.governorateIsoCode, governorate);
      buckets.set(id, bucket);
    }

    return Array.from(buckets.values()).map((bucket) => ({
      id: bucket.id,
      count: bucket.count,
      // The bubble is centred on its members while the bucket boundary stays
      // fixed, so it does not jump or split when map zoom changes.
      lat: bucket.latTotal / bucket.count,
      lng: bucket.lngTotal / bucket.count,
      governorates: Array.from(bucket.governorates.values()).sort(
        (a, b) => b.count - a.count
      ),
    }));
  }, [locations]);

  const governorateBubbles = useMemo(() => {
    const byGov = new Map(); // normalizedGovName -> { count }

    for (const c of locations) {
      const govKey = normalizeArabic(c.governorate);
      byGov.set(govKey, (byGov.get(govKey) ?? 0) + 1);
    }

    const govCenterByKey = new Map();
    for (const g of getAllGovernorateCenters()) {
      if (!hasValidEgyptCoords(g.centerLat, g.centerLng)) continue;
      const key = normalizeArabic(g.nameAr);
      if (!govCenterByKey.has(key)) {
        govCenterByKey.set(key, {
          id: g.isoCode,
          nameAr: g.nameAr,
          nameEn: g.nameEn,
          centerLat: g.centerLat,
          centerLng: g.centerLng,
        });
      }
    }

    const bubbles = [];
    for (const [govKey, count] of byGov.entries()) {
      const center = govCenterByKey.get(govKey);
      if (!center) continue;
      bubbles.push({
        id: center.id,
        governorateNameAr: center.nameAr,
        governorateNameEn: center.nameEn,
        centerLat: center.centerLat,
        centerLng: center.centerLng,
        count,
      });
    }

    return bubbles;
  }, [locations]);

  const countryBubble = useMemo(() => {
    if (locations.length === 0) return null;
    return {
      id: "egypt-clients",
      governorateNameAr: "مصر",
      governorateNameEn: "Egypt",
      centerLat: EGYPT_CENTER_LAT,
      centerLng: EGYPT_CENTER_LNG,
      count: locations.length,
    };
  }, [locations]);

  return {
    locations,
    locationBubbles,
    governorateBubbles,
    countryBubble,
    totalCount: locations.length,
    invalidCount: baseLocations.invalidCount,
    isLoading,
    isError,
    error,
    refetch,
  };
};
