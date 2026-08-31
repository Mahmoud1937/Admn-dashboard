import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, CircleMarker, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  faLocationDot,
  faPhone,
  faCity,
  faHashtag,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CATEGORY_COLOR_BY_NAME, FALLBACK_CATEGORY_COLOR } from "./CategoryTabs";
import { resolveGovernorateFromCoords } from "../utils/Resolvegovernorate";

const EGYPT_CENTER = [26.8, 30.8];
const DEFAULT_ZOOM = 6;
// Below this zoom level: show governorate bubbles. At/above it: show individual pins.
const INDIVIDUAL_PIN_ZOOM = 8;
// Minimum gap (px) enforced between two bubble edges once they're pushed apart.
const BUBBLE_SPACING_PADDING = 6;
const GOVERNORATE_COLORS = {
  "القاهرة": "#2563EB",
  "الجيزة": "#7C3AED",
  "القليوبية": "#DB2777",
  "الإسكندرية": "#0891B2",
  "البحيرة": "#059669",
  "مطروح": "#65A30D",
  "دمياط": "#EA580C",
  "الدقهلية": "#CA8A04",
  "الشرقية": "#DC2626",
  "الغربية": "#9333EA",
  "كفر الشيخ": "#0D9488",
  "المنوفية": "#4F46E5",
  "بورسعيد": "#0284C7",
  "الإسماعيلية": "#16A34A",
  "السويس": "#E11D48",
  "شمال سيناء": "#B45309",
  "جنوب سيناء": "#C2410C",
  "الفيوم": "#65A30D",
  "بني سويف": "#7C3AED",
  "المنيا": "#2563EB",
  "أسيوط": "#DC2626",
  "سوهاج": "#0891B2",
  "قنا": "#9333EA",
  "الأقصر": "#EA580C",
  "أسوان": "#059669",
  "الوادي الجديد": "#CA8A04",
  // كانت ناقصة، فكانت بتاخد اللون الرمادي الافتراضي بدل لون مميز
  "البحر الأحمر": "#F59E0B",
};

const FALLBACK_GOVERNORATE_COLOR = "#64748B";

function governorateColor(name) {
  return GOVERNORATE_COLORS[name] || FALLBACK_GOVERNORATE_COLOR;
}
function bubbleSize(count) {
  return count >= 100 ? 56 : count >= 25 ? 48 : 40;
}



function createBubbleIcon(count, governorateName) {
  const color = governorateColor(governorateName);
  const size = bubbleSize(count);
  return L.divIcon({
    html: `
      <div style="
        width:${size}px;height:${size}px;border-radius:9999px;background:white;
        border:3px solid ${color};display:flex;align-items:center;justify-content:center;
        font-weight:700;color:${color};font-size:${count >= 100 ? 15 : 13}px;
        box-shadow:0 1px 4px rgba(0,0,0,0.25);
      ">${count}+</div>`,
    className: "",
    iconSize: [size, size],
  });
}

function buildClusterIconHtml(count, color, size, providersInCluster) {
  const grouped = new Map();
  for (const p of providersInCluster) {
    const key = p.nameAr;
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }
  const tooltipRows = Array.from(grouped.entries())
    .map(([name, cnt]) => `<div style="display:flex;justify-content:space-between;gap:8px;padding:2px 0;"><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</span><span style="flex-shrink:0;opacity:0.5;">${cnt}</span></div>`)
    .join("");
  const tooltipHtml = grouped.size > 0
    ? `<div class="cluster-tooltip" style="
        display:none;position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);
        background:white;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.15);
        padding:8px 12px;min-width:160px;max-width:220px;z-index:10000;
        border:1px solid #e5e7eb;pointer-events:none;
        font-family:sans-serif;font-size:12px;color:#374151;
        direction:rtl;text-align:right;
      ">
        <div style="font-weight:700;margin-bottom:4px;border-bottom:1px solid #f3f4f6;padding-bottom:4px;">
          ${grouped.size} Provider
        </div>
        <div style="max-height:192px;overflow-y:auto;">${tooltipRows}</div>
      </div>`
    : "";
  return `
    <div style="position:relative;cursor:pointer;" onmouseenter="this.querySelector('.cluster-tooltip').style.display='block'" onmouseleave="this.querySelector('.cluster-tooltip').style.display='none'">
      ${tooltipHtml}
      <div style="
        width:${size}px;height:${size}px;border-radius:9999px;background:white;
        border:3px solid ${color};display:flex;align-items:center;justify-content:center;
        font-weight:700;color:${color};font-size:${count >= 100 ? 15 : 13}px;
        box-shadow:0 1px 4px rgba(0,0,0,0.25);
      ">${count}+</div>
    </div>`;
}

function createProviderIcon(type, imageUrl) {
  const color = CATEGORY_COLOR_BY_NAME[(type || "").toLowerCase()] || FALLBACK_CATEGORY_COLOR;

  const imageHtml = imageUrl
    ? `<img
         src="${imageUrl}"
         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
         style="width:100%;height:100%;border-radius:9999px;object-fit:cover;display:block;"
       />
       <div style="display:none;width:100%;height:100%;border-radius:9999px;background:${color}22;"></div>`
    : `<div style="width:100%;height:100%;border-radius:9999px;background:${color}22;"></div>`;

  return L.divIcon({
    html: `
      <div style="
        width:30px;height:30px;border-radius:9999px;background:white;
        border:2px solid ${color};box-shadow:0 1px 3px rgba(0,0,0,0.3);
        overflow:hidden;padding:2px;box-sizing:border-box;
      ">${imageHtml}</div>`,
    className: "",
    iconSize: [30, 30],
  });
}

function BranchPopupCard({ p }) {
  const color = CATEGORY_COLOR_BY_NAME[(p.type || "").toLowerCase()] || FALLBACK_CATEGORY_COLOR;

  return (
    <div className="w-64 overflow-hidden rounded-xl font-sans" dir="rtl">
      <div
        className="flex items-center gap-3 p-3"
        style={{ background: `linear-gradient(135deg, ${color}1a, ${color}05)` }}
      >
        <div
          className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white shadow-sm"
          style={{ border: `2px solid ${color}` }}
        >
          {p.imageUrl ? (
            <img
              src={p.imageUrl}
              alt={p.nameAr}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}
        </div>
        <div className="min-w-0">
          <div className="flex flex-col text-start">
            <span className="text-base font-semibold text-gray-900 leading-tight">
              {p.nameEn}
            </span>
            <span className="text-sm text-gray-500 leading-tight">
              {p.nameAr}
            </span>
          </div>

          <div className="mt-1 flex flex-col items-center gap-1">
            <span
              className="inline-flex justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{ background: `${color}22`, color: color }}
            >
              {p.categoryEn || p.type}
            </span>

            <span>
              {p.categoryAr || p.type}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-gray-100 bg-white p-3 text-xs text-gray-700">
        {p.address && (
          <div className="flex items-start gap-2">
            <FontAwesomeIcon icon={faLocationDot} className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />
            <span>{p.address}</span>
          </div>
        )}
        {(p.governorate || p.city) && (
          <div className="flex items-start gap-2">
            <FontAwesomeIcon icon={faCity} className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />
            <span>{[p.governorate, p.city].filter(Boolean).join(" — ")}</span>
          </div>
        )}
        {p.phone && (
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faPhone} className="h-3 w-3 shrink-0 text-gray-400" />
            <a href={`tel:${p.phone}`} className="font-medium text-blue-700 hover:underline" dir="ltr">
              {p.phone}
            </a>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-3 py-1.5 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <FontAwesomeIcon icon={faBuilding} className="h-2.5 w-2.5" />
          Provider #{p.providerId}
        </span>
        <span className="flex items-center gap-1">
          <FontAwesomeIcon icon={faHashtag} className="h-2.5 w-2.5" />
          Branch #{p.branchId}
        </span>
      </div>
    </div>
  );
}

function ZoomWatcher({ onZoomChange }) {
  useMapEvents({
    zoomend: (e) => onZoomChange(e.target.getZoom()),
  });
  return null;
}

function SizeFixer() {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize(), 100);
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);
  return null;
}

function FlyToGovernorate({ selectedGovernorate }) {
  const map = useMap();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (selectedGovernorate) {
      map.flyTo([selectedGovernorate.centerLat, selectedGovernorate.centerLng], INDIVIDUAL_PIN_ZOOM);
    } else if (map.getZoom() > DEFAULT_ZOOM) {
      map.flyTo(EGYPT_CENTER, DEFAULT_ZOOM);
    }
  }, [selectedGovernorate, map]);

  return null;
}

function ClearSelectionOnZoomOut({ selectedGovernorate, onSelectGovernorate }) {
  useMapEvents({
    zoomend: (e) => {
      if (selectedGovernorate && e.target.getZoom() <= DEFAULT_ZOOM) {
        onSelectGovernorate?.(null);
      }
    },
  });
  return null;
}

function useDeclutteredBubblePositions(bubbles) {
  const map = useMap();
  const [positionById, setPositionById] = useState(() => new Map());

  useEffect(() => {
    if (!map) return;

    const recompute = () => {
      if (bubbles.length === 0) {
        setPositionById(new Map());
        return;
      }

      const nodes = bubbles.map((b) => {
        const point = map.latLngToLayerPoint([b.centerLat, b.centerLng]);
        return { id: b.id, x: point.x, y: point.y, radius: bubbleSize(b.count) / 2 };
      });

      const MAX_ITERATIONS = 24;
      for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        let movedAny = false;

        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const distance = Math.hypot(dx, dy) || 0.01; // avoid div-by-zero when centers coincide
            const minDistance = a.radius + b.radius + BUBBLE_SPACING_PADDING;

            if (distance < minDistance) {
              movedAny = true;
              const overlap = (minDistance - distance) / 2;
              const nx = dx / distance;
              const ny = dy / distance;
              a.x -= nx * overlap;
              a.y -= ny * overlap;
              b.x += nx * overlap;
              b.y += ny * overlap;
            }
          }
        }

        if (!movedAny) break;
      }

      const next = new Map();
      for (const node of nodes) {
        next.set(node.id, map.layerPointToLatLng([node.x, node.y]));
      }
      setPositionById(next);
    };

    recompute();
    map.on("zoomend", recompute);
    map.on("moveend", recompute);
    return () => {
      map.off("zoomend", recompute);
      map.off("moveend", recompute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, bubbles]);

  return positionById;
}

function GovernorateBubble({ bubble, displayLatLng, onSelectGovernorate }) {
  const position = displayLatLng ?? [bubble.centerLat, bubble.centerLng];

  return (
    <Marker
      position={position}
      icon={createBubbleIcon(
        bubble.count,
        bubble.governorateNameAr,
        bubble.governorateNameEn
      )}
      eventHandlers={{
        click: () => {
          onSelectGovernorate?.(bubble.id);
        },
      }}
    >
      <Tooltip direction="top" offset={[0, -6]} opacity={1}>
        <div className="w-56 text-sm" dir="rtl">
          <p className="mb-1 font-semibold text-gray-900">{bubble.governorateNameAr}</p>
          <p className="mb-1 font-semibold text-gray-900">{bubble.governorateNameEn}</p>
          <p className="mb-2 text-xs text-gray-500">{bubble.count} Branch</p>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {bubble.providers.map((p) => (
              <div
                key={p.providerId}
                className="flex items-center justify-between px-2 py-1 text-xs"
              >
                <span className="truncate">{p.nameAr}</span>
                <span className="shrink-0 text-gray-400">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
}

function CountryBubble({ bubble }) {
  const map = useMap();

  return (
    <Marker
      position={[bubble.centerLat, bubble.centerLng]}
      icon={createBubbleIcon(bubble.count)}
      eventHandlers={{
        click: () => map.flyTo(EGYPT_CENTER, DEFAULT_ZOOM),
      }}
    >
      <Tooltip direction="top" offset={[0, -6]} opacity={1}>
        <div className="w-56 text-sm" dir="rtl">
          <p className="mb-1 font-semibold text-gray-900">{bubble.governorateNameAr}</p>
          <p className="mb-2 text-xs text-gray-500">{bubble.count} Branch</p>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {bubble.providers.map((p) => (
              <div
                key={p.providerId}
                className="flex items-center justify-between px-2 py-1 text-xs"
              >
                <span className="truncate">{p.nameAr}</span>
                <span className="truncate">{p.nameEn}</span>
                <span className="shrink-0 text-gray-400">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
}

// Wraps the bubble list + decluttering so it only runs (and only subscribes
// to zoom/move events) while bubbles are actually being shown.
function GovernorateBubbleLayer({ bubbles, onSelectGovernorate }) {
  const positionById = useDeclutteredBubblePositions(bubbles);

  return (
    <>
      {bubbles.map((bubble) => (
        <GovernorateBubble
          key={bubble.id}
          bubble={bubble}
          displayLatLng={positionById.get(bubble.id)}
          onSelectGovernorate={onSelectGovernorate}
        />
      ))}
    </>
  );
}
const DISABLE_CLUSTERING_AT_ZOOM = 12;
const CLUSTER_FLY_MAX_ZOOM = 15;
function ClusterClickFlyer({ children, ...clusterProps }) {
  const map = useMap();

  return (
    <MarkerClusterGroup
      {...clusterProps}
      zoomToBoundsOnClick={false}
      onClick={(e) => {
        if (!e.layer) return;

        const bounds = e.layer.getBounds();

        const boundsZoom = map.getBoundsZoom(bounds.pad(0.2));

        const targetZoom = Math.min(
          Math.max(boundsZoom, DISABLE_CLUSTERING_AT_ZOOM),
          CLUSTER_FLY_MAX_ZOOM
        );

        map.flyTo(
          bounds.getCenter(),
          targetZoom,
          { duration: 0.6 }
        );
      }}
    >
      {children}
    </MarkerClusterGroup>
  );
}

export default function ProviderClusterMap({
  providers,
  governorateBubbles,
  countryBubble = null,
  selectedGovernorate = null,
  onSelectGovernorate,
  clientLocations = [],
  showUsers = false,
}) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const showIndividualPins = zoom >= INDIVIDUAL_PIN_ZOOM || !!selectedGovernorate;
  const showCountryBubble = zoom < DEFAULT_ZOOM;
  const showGovernorateBubbles =
    !showIndividualPins &&
    !showCountryBubble &&
    !selectedGovernorate;

  const handleZoomChange = useCallback((z) => setZoom(z), []);

  const providerByKey = useMemo(() => {
    const map = new Map();
    for (const p of providers) {
      map.set(`${p.lat},${p.lng}`, p);
    }
    return map;
  }, [providers]);

  const createClusterIcon = useCallback((cluster) => {
    const count = cluster.getChildCount();
    const markers = cluster.getAllChildMarkers();
    const latlng = markers[0]?.getLatLng();
    const resolved = latlng ? resolveGovernorateFromCoords(latlng.lat, latlng.lng) : null;
    const color = resolved ? governorateColor(resolved.nameAr) : FALLBACK_GOVERNORATE_COLOR;
    const size = bubbleSize(count);
    const providersInCluster = markers
      .map((m) => {
        const ll = m.getLatLng();
        return providerByKey.get(`${ll.lat},${ll.lng}`);
      })
      .filter(Boolean);
    return L.divIcon({
      html: buildClusterIconHtml(count, color, size, providersInCluster),
      className: "",
      iconSize: [size, size],
    });
  }, [providerByKey]);

  return (
    <>
      <style>{`
        .branch-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        .branch-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .branch-popup .leaflet-popup-tip {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
      <MapContainer
        center={EGYPT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        <SizeFixer />
        <ZoomWatcher onZoomChange={handleZoomChange} />
        <FlyToGovernorate selectedGovernorate={selectedGovernorate} />
        <ClearSelectionOnZoomOut
          selectedGovernorate={selectedGovernorate}
          onSelectGovernorate={onSelectGovernorate}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showCountryBubble && countryBubble && <CountryBubble bubble={countryBubble} />}

        {showGovernorateBubbles && (
          <GovernorateBubbleLayer bubbles={governorateBubbles} onSelectGovernorate={onSelectGovernorate} />
        )}

        {showIndividualPins && (
          <ClusterClickFlyer
            chunkedLoading
            maxClusterRadius={40}
            spiderfyOnMaxZoom
            showCoverageOnHover={false}
            disableClusteringAtZoom={DISABLE_CLUSTERING_AT_ZOOM}
            iconCreateFunction={createClusterIcon}
          >
            {providers.map((p) => (
              <Marker key={p.branchId} position={[p.lat, p.lng]} icon={createProviderIcon(p.type, p.imageUrl)}>
                <Popup minWidth={256} maxWidth={280} className="branch-popup">
                  <BranchPopupCard p={p} />
                </Popup>
              </Marker>
            ))}
          </ClusterClickFlyer>
        )}

        {showUsers &&
          clientLocations.map((c, i) => (
            <CircleMarker
              key={`client-${i}-${c.lat}-${c.lng}`}
              center={[c.lat, c.lng]}
              radius={5}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#60a5fa",
                fillOpacity: 0.7,
                weight: 1,
              }}
            />
          ))}
      </MapContainer>
    </>
  );
}