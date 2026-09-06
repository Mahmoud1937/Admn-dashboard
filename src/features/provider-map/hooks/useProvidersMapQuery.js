import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMapData } from "../services/ProviderMapService";
import { hasValidEgyptCoords } from "../utils/Mapcoords";
import { normalizeArabic } from "../utils/Arabictext";
import { resolveGovernorateFromCoords } from "../utils/Resolvegovernorate";
import { getAllGovernorateCenters } from "../utils/GovernorateCenters";


const EGYPT_CENTER_LAT = 26.8;
const EGYPT_CENTER_LNG = 30.8;

export const useProvidersMapQuery = ({ providerCategoryId, governorateId, search }) => {
const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ["providers-map-data", providerCategoryId],
  queryFn: () => getMapData(providerCategoryId),
  staleTime: 5 * 60_000,
});

  const rawProviders = data?.providers ?? [];
  const governorates = data?.governorates ?? [];

const selectedGovernorate = useMemo(() => {
  if (!governorateId) return null;
  return getAllGovernorateCenters().find((g) => g.isoCode === governorateId) || null;
}, [governorateId])
  const { validProviders, invalidCount } = useMemo(() => {
    let invalid = 0;
    const valid = [];

    for (const p of rawProviders) {
      const branches = p.branches ?? [];

      for (const b of branches) {
        if (!hasValidEgyptCoords(b.lat, b.lng)) {
          invalid += 1;
          continue;
        }

        const resolvedGov = resolveGovernorateFromCoords(b.lat, b.lng);
        if (!resolvedGov) {
          invalid += 1;
          continue;
        }

        valid.push({
          // provider-level info
          providerId: p.providerId,
          nameAr: p.nameAr,
          nameEn: p.nameEn,
          type: p.type,
          categoryAr: p.categoryAr,
          // نفس فكرة categoryAr بالظبط بس بالإنجليزي — محتاجة عشان البادج
          // في BranchPopupCard كان بيرجع دايمًا p.type (تصنيف عام) بدل
          // التصنيف الفعلي بالإنجليزي لأن الحقل ده كان مفقود هنا.
          categoryEn: p.categoryEn,
          imageUrl: p.imageUrl,
          // branch-level info (ده اللي فعليًا هيتحط كـ pin بمكانه الصح)
          branchId: b.branchId,
          lat: b.lat,
          lng: b.lng,
          address: b.address,
          city: b.city,
          phone: b.phone,
          // المحافظة المحسوبة فعليًا من الإحداثيات (مش من نص الـ backend)
          governorate: resolvedGov.nameAr,
          governorateNameEn: resolvedGov.nameEn,
          governorateIsoCode: resolvedGov.isoCode,
        });
      }
    }

    return { validProviders: valid, invalidCount: invalid };
  }, [rawProviders]);

  const filteredProviders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return validProviders.filter((p) => {
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
  }, [validProviders, selectedGovernorate, search]);

  const governorateBubbles = useMemo(() => {
    const byGov = new Map(); // normalizedGovName -> { totalCount, providers: Map(providerId -> info) }

    for (const p of filteredProviders) {
      const govKey = normalizeArabic(p.governorate);
      if (!byGov.has(govKey)) {
        byGov.set(govKey, { totalCount: 0, providers: new Map() });
      }
      const group = byGov.get(govKey);
      group.totalCount += 1;

      if (!group.providers.has(p.providerId)) {
        group.providers.set(p.providerId, {
          providerId: p.providerId,
          nameAr: p.nameAr,
          nameEn: p.nameEn,
          imageUrl: p.imageUrl,
          count: 0,
        });
      }
      group.providers.get(p.providerId).count += 1;
    }

    // resolve governorate center coords (أول سطر بيكسب لكل اسم normalized)
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
    for (const [govKey, group] of byGov.entries()) {
      const center = govCenterByKey.get(govKey);
      if (!center) continue; // اسم المحافظة معندوش إحداثيات في جدول الـ lookup

      bubbles.push({
        id: center.id,
        governorateNameAr: center.nameAr,
        governorateNameEn: center.nameEn,
        centerLat: center.centerLat,
        centerLng: center.centerLng,
        count: group.totalCount,
        providers: Array.from(group.providers.values()).sort((a, b) => b.count - a.count),
      });
    }

    return bubbles;
  }, [governorates, filteredProviders]);

  // بابل واحدة مجمعة لكل مصر — بتظهر لما المستخدم يزوّم أوت جدًا (برة زوم
  // مصر العادي)، حيث بابلات كل محافظة على حدة هتبقى مجرد نقط صغيرة
  // متلاصقة مالهاش فايدة عملية. مكانها ثابت في مركز مصر (نفس الإحداثيات
  // اللي الماب بيرجعلها بالـ flyTo الافتراضي)، وبتجمع كل الـ providers من
  // كل المحافظات مع بعض بنفس منطق تجميع بابل المحافظة.
  const countryBubble = useMemo(() => {
    if (filteredProviders.length === 0) return null;

    const providersMap = new Map();
    for (const p of filteredProviders) {
      if (!providersMap.has(p.providerId)) {
        providersMap.set(p.providerId, {
          providerId: p.providerId,
          nameAr: p.nameAr,
          nameEn: p.nameEn,
          imageUrl: p.imageUrl,
          count: 0,
        });
      }
      providersMap.get(p.providerId).count += 1;
    }

    return {
      id: "egypt",
      governorateNameAr: "مصر",
      governorateNameEn: "Egypt",
      centerLat: EGYPT_CENTER_LAT,
      centerLng: EGYPT_CENTER_LNG,
      count: filteredProviders.length,
      providers: Array.from(providersMap.values()).sort((a, b) => b.count - a.count),
    };
  }, [filteredProviders]);

  const invalidGovernorateCount = useMemo(
    () => governorates.filter((g) => !hasValidEgyptCoords(g.centerLat, g.centerLng)).length,
    [governorates]
  );

  return {
    providers: filteredProviders,
    governorateBubbles,
    countryBubble,
    governorates,
    selectedGovernorate,
    totalCount: validProviders.length,
    invalidProviderCount: invalidCount,
    invalidGovernorateCount,
    isLoading,
    isError,
    error,
    refetch,
  };
};