import egyptGovernorates from "../utils/Egyptgovernorates.json";

// Ray-casting point-in-polygon test (Jordan curve theorem). No external
// dependency (turf/etc) — this is intentionally self-contained so the
// bundle stays small. `ring` is an array of [lng, lat] pairs (GeoJSON
// coordinate order is [lng, lat], NOT [lat, lng]).
function pointInRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInGeometry(lng, lat, geometry) {
  if (geometry.type === "Polygon") {
    const [outerRing, ...holes] = geometry.coordinates;
    if (!pointInRing(lng, lat, outerRing)) return false;
    // a point inside a hole is NOT inside the polygon
    return !holes.some((hole) => pointInRing(lng, lat, hole));
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((polygonCoords) =>
      pointInGeometry(lng, lat, { type: "Polygon", coordinates: polygonCoords })
    );
  }
  return false;
}

// Pre-compute bounding boxes and sort governorates smallest-area-first so
// that a point near a shared border resolves to the more specific/likely
// region first when polygons are (rarely) imprecise/overlapping at the edges.
const featuresWithBBox = egyptGovernorates.features.map((f) => {
  const ringPoints = f.geometry.type === "Polygon"
    ? f.geometry.coordinates.flat(1)
    : f.geometry.coordinates.flat(2);
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const [lng, lat] of ringPoints) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return { feature: f, bbox: { minLng, minLat, maxLng, maxLat } };
});

featuresWithBBox.sort((a, b) => {
  const areaA = (a.bbox.maxLng - a.bbox.minLng) * (a.bbox.maxLat - a.bbox.minLat);
  const areaB = (b.bbox.maxLng - b.bbox.minLng) * (b.bbox.maxLat - b.bbox.minLat);
  return areaA - areaB;
});
 
// المصدر الجغرافي بيرجع الأسماء ببادئة "محافظة " (مثلاً "محافظة القاهرة")،
// لكن باقي التطبيق (dropdown الفلاتر، قائمة المحافظات القادمة من الـ
// backend، ومقارنات normalizeArabic في الهوك) شغالة على الأسماء من غير
// البادئة دي (مثلاً "القاهرة" بس). فبنشيلها هنا في المصدر عشان أي حد
// يستخدم الدالة دي ياخد اسم متسق مع باقي النظام، بدل ما يحصل mismatch
// صامت في أي مقارنة نص لاحقة (زي اللي كان بيمنع ظهور الـ bubbles).
function stripGovernoratePrefix(name) {
  if (!name) return name;
  return name.replace(/^محافظة\s+/, "").replace(/^محافظه\s+/, "").trim();
}
 
/**
 * Resolves an Egyptian governorate from real coordinates using actual
 * geographic boundaries (point-in-polygon), instead of trusting a
 * `governorate` name string coming from the backend (which can be a typo,
 * missing, or simply wrong).
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {{ isoCode: string, nameAr: string, nameEn: string } | null}
 *   null if the point doesn't fall inside any governorate polygon
 *   (e.g. invalid coordinates, or a point outside Egypt).
 */
export function resolveGovernorateFromCoords(lat, lng) {
  if (typeof lat !== "number" || typeof lng !== "number" || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }
  const match = featuresWithBBox.find(({ feature, bbox }) => (
    lng >= bbox.minLng && lng <= bbox.maxLng &&
    lat >= bbox.minLat && lat <= bbox.maxLat &&
    pointInGeometry(lng, lat, feature.geometry)
  ));
  if (!match) return null;
  return {
    ...match.feature.properties,
    nameAr: stripGovernoratePrefix(match.feature.properties.nameAr),
  };
}
 