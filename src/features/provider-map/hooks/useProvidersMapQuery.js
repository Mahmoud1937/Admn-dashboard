import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMapData } from "../services/ProviderMapService";
import { hasValidEgyptCoords } from "../utils/Mapcoords";
import { normalizeArabic } from "../utils/Arabictext";

export const useProvidersMapQuery = ({ category, governorateId, search }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["providers-map-data"],
    queryFn: getMapData,
    staleTime: 5 * 60_000, // whole dataset comes in one shot, cache for 5 min
  });

  const rawProviders = data?.providers ?? [];
  const governorates = data?.governorates ?? [];

  const selectedGovernorate = useMemo(
    () => governorates.find((g) => g.id === governorateId) || null,
    [governorates, governorateId]
  );

  const { validProviders, invalidCount } = useMemo(() => {
    let invalid = 0;
    const valid = [];
    for (const p of rawProviders) {
      if (hasValidEgyptCoords(p.lat, p.lng)) {
        valid.push(p);
      } else {
        invalid += 1;
      }
    }
    return { validProviders: valid, invalidCount: invalid };
  }, [rawProviders]);

  const filteredProviders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return validProviders.filter((p) => {
      if (category !== "All" && p.type?.toLowerCase() !== category.toLowerCase()) return false;
      if (
        selectedGovernorate &&
        normalizeArabic(p.governorate) !== normalizeArabic(selectedGovernorate.nameAr)
      )
        return false;
      if (term) {
        const haystack = `${p.name || ""} ${p.nameEn || ""} ${p.address || ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [validProviders, category, selectedGovernorate, search]);

  // Bubble = one dot per DISTINCT governorate name, counting filtered providers in it.
  // The governorates list can contain multiple rows for what's really the same
  // governorate (typos/duplicates, e.g. "Cairoo" vs "القاهرة") — those get merged
  // into a single bubble here instead of rendering one overlapping bubble each.
  const governorateBubbles = useMemo(() => {
    const counts = new Map();
    for (const p of filteredProviders) {
      const key = normalizeArabic(p.governorate);
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const byNormalizedName = new Map();
    for (const g of governorates) {
      if (!hasValidEgyptCoords(g.centerLat, g.centerLng)) continue;
      const key = normalizeArabic(g.nameAr);
      if (!byNormalizedName.has(key)) {
        // first row wins for id/label/center; later duplicate rows just
        // contribute their providers' count (already merged above by name)
        byNormalizedName.set(key, {
          id: g.id,
          nameAr: g.nameAr,
          nameEn: g.nameEn,
          centerLat: g.centerLat,
          centerLng: g.centerLng,
          count: counts.get(key) || 0,
        });
      }
    }

    return Array.from(byNormalizedName.values()).filter((b) => b.count > 0);
  }, [governorates, filteredProviders]);

  const invalidGovernorateCount = useMemo(
    () => governorates.filter((g) => !hasValidEgyptCoords(g.centerLat, g.centerLng)).length,
    [governorates]
  );

  return {
    providers: filteredProviders,
    governorates,
    governorateBubbles,
    selectedGovernorate,
    totalCount: validProviders.length,
    invalidProviderCount: invalidCount,
    invalidGovernorateCount,
    isLoading,
    isError,
    error,
  };
};