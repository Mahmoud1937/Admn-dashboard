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

  // NOTE: coordinates live on each branch inside `provider.branches`,
  // NOT on the provider itself. We flatten provider -> branches into
  // one "pin" record per branch before filtering/validating coords.
  const { validProviders, invalidCount } = useMemo(() => {
    let invalid = 0;
    const valid = [];

    for (const p of rawProviders) {
      const branches = p.branches ?? [];

      for (const b of branches) {
        if (hasValidEgyptCoords(b.lat, b.lng)) {
          valid.push({
            // provider-level info
            providerId: p.providerId,
            nameAr: p.nameAr,
            nameEn: p.nameEn,
            type: p.type,
            categoryAr: p.categoryAr,
            imageUrl: p.imageUrl,
            // branch-level info (this is what actually has the pin location)
            branchId: b.branchId,
            lat: b.lat,
            lng: b.lng,
            address: b.address,
            governorate: b.governorate,
            city: b.city,
            phone: b.phone,
          });
        } else {
          invalid += 1;
        }
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
        const haystack = `${p.nameAr || ""} ${p.nameEn || ""} ${p.address || ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [validProviders, category, selectedGovernorate, search]);

  // Bubble = one per (provider, governorate) pair, so each provider gets
  // its own bubble even when it shares a governorate with other providers.
  // Count = number of that provider's branches in that governorate.
  // The governorates list can contain multiple rows for what's really the same
  // governorate (typos/duplicates, e.g. "Cairoo" vs "القاهرة") — those get merged
  // by name before bubbles are built.
  const governorateBubbles = useMemo(() => {
    // group branches by (governorate, providerId)
    const groups = new Map(); // `${govKey}::${providerId}` -> group info
    for (const p of filteredProviders) {
      const govKey = normalizeArabic(p.governorate);
      const groupKey = `${govKey}::${p.providerId}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          govKey,
          providerId: p.providerId,
          nameAr: p.nameAr,
          nameEn: p.nameEn,
          imageUrl: p.imageUrl,
          count: 0,
        });
      }
      groups.get(groupKey).count += 1;
    }

    // resolve governorate center coords (first row wins per normalized name)
    const govCenterByKey = new Map();
    for (const g of governorates) {
      if (!hasValidEgyptCoords(g.centerLat, g.centerLng)) continue;
      const key = normalizeArabic(g.nameAr);
      if (!govCenterByKey.has(key)) {
        govCenterByKey.set(key, {
          id: g.id,
          nameAr: g.nameAr,
          nameEn: g.nameEn,
          centerLat: g.centerLat,
          centerLng: g.centerLng,
        });
      }
    }

    // bucket provider-groups by governorate so siblings can be spread out
    const byGov = new Map();
    for (const group of groups.values()) {
      if (!byGov.has(group.govKey)) byGov.set(group.govKey, []);
      byGov.get(group.govKey).push(group);
    }

    const OFFSET_DEG = 0.12; // small horizontal spread so sibling bubbles sit side-by-side
    const bubbles = [];

    for (const [govKey, groupList] of byGov.entries()) {
      const center = govCenterByKey.get(govKey);
      if (!center) continue; // governorate name has no matching coords row

      groupList.forEach((group, index) => {
        bubbles.push({
          id: `${center.id}-${group.providerId}`,
          governorateId: center.id,
          governorateNameAr: center.nameAr,
          providerId: group.providerId,
          nameAr: group.nameAr,
          nameEn: group.nameEn,
          imageUrl: group.imageUrl,
          count: group.count,
          centerLat: center.centerLat,
          centerLng: center.centerLng,
          // position of this bubble among its siblings at the same governorate
          // point — used by the map layer to spread them apart by a FIXED
          // pixel amount (not a geo offset, which shrinks/grows with zoom)
          siblingIndex: index,
          siblingCount: groupList.length,
        });
      });
    }

    return bubbles;
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