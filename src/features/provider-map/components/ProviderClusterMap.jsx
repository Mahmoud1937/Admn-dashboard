import { useState, useCallback, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap, useMapEvents } from "react-leaflet";
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
import { CATEGORIES } from "./CategoryTabs";

const EGYPT_CENTER = [26.8, 30.8];
const DEFAULT_ZOOM = 6;
// Below this zoom level: show governorate bubbles. At/above it: show individual pins.
const INDIVIDUAL_PIN_ZOOM = 9;

// Deterministic color per provider, so the same provider always renders
// with the same bubble color, and different providers sharing a governorate
// are visually distinguishable from one another.
const PROVIDER_COLOR_PALETTE = [
  "#16a34a", "#2563eb", "#dc2626", "#f59e0b", "#7c3aed",
  "#db2777", "#0891b2", "#65a30d", "#ea580c", "#4f46e5",
];

function hashToIndex(str, mod) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

function providerColor(providerId) {
  return PROVIDER_COLOR_PALETTE[hashToIndex(String(providerId), PROVIDER_COLOR_PALETTE.length)];
}

function createBubbleIcon(count, color, offsetXPx = 0) {
  const size = count >= 100 ? 56 : count >= 25 ? 48 : 40;
  // Default anchor centers the icon on the marker's lat/lng (size/2, size/2).
  // Shrinking anchor.x shifts the icon rightward on screen; growing it shifts
  // left — this keeps a FIXED pixel gap between sibling bubbles regardless
  // of zoom level, unlike offsetting the marker's actual lat/lng.
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
    iconAnchor: [size / 2 - offsetXPx, size / 2],
  });
}

function createProviderIcon(type, imageUrl) {
  // provider.type comes from the API as "Doctors" (capitalized), but
  // CATEGORIES keys are lowercase ("doctors") — compare case-insensitively.
  const meta = CATEGORIES.find((c) => c.key.toLowerCase() === (type || "").toLowerCase()) || CATEGORIES[0];

  const imageHtml = imageUrl
    ? `<img
         src="${imageUrl}"
         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
         style="width:100%;height:100%;border-radius:9999px;object-fit:cover;display:block;"
       />
       <div style="display:none;width:100%;height:100%;border-radius:9999px;background:${meta.color}22;"></div>`
    : `<div style="width:100%;height:100%;border-radius:9999px;background:${meta.color}22;"></div>`;

  return L.divIcon({
    html: `
      <div style="
        width:30px;height:30px;border-radius:9999px;background:white;
        border:2px solid ${meta.color};box-shadow:0 1px 3px rgba(0,0,0,0.3);
        overflow:hidden;padding:2px;box-sizing:border-box;
      ">${imageHtml}</div>`,
    className: "",
    iconSize: [30, 30],
  });
}

// Rich, branded popup card for an individual branch — shows every field the
// backend returns for that branch (logo, names, category, type, address,
// governorate/city, phone, and the branch/provider reference ids).
function BranchPopupCard({ p }) {
  const meta = CATEGORIES.find((c) => c.key.toLowerCase() === (p.type || "").toLowerCase()) || CATEGORIES[0];

  return (
    <div className="w-64 overflow-hidden rounded-xl font-sans" dir="rtl">
      {/* Header: logo + name + category, on a soft tinted band matching the provider's category color */}
      <div
        className="flex items-center gap-3 p-3"
        style={{ background: `linear-gradient(135deg, ${meta.color}1a, ${meta.color}05)` }}
      >
        <div
          className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white shadow-sm"
          style={{ border: `2px solid ${meta.color}` }}
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
          <p className="truncate text-sm font-bold text-gray-900">{p.nameAr}</p>
          {p.nameEn && <p className="truncate text-xs text-gray-500">{p.nameEn}</p>}
          <span
            className="mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ background: `${meta.color}22`, color: meta.color }}
          >
            {p.categoryAr || p.type}
          </span>
        </div>
      </div>

      {/* Body: every detail field from the branch record */}
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

      {/* Footer: technical reference ids from the backend, kept small/muted */}
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

// Leaflet measures its container's size on mount. Inside a flex layout, the
// wrapper div can still be at height 0 at that exact moment (before the flex
// box finishes resolving), so Leaflet falls back to a tiny/incorrect size and
// the map renders zoomed out to the whole world instead of centered on Egypt.
// Forcing an invalidateSize() shortly after mount (and on window resize) fixes it.
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

// Flies the map to the selected governorate (or back to the Egypt-wide view
// when cleared) so picking a governorate is visibly reflected on the map,
// even before the filtered results finish rendering.
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
    } else {
      map.flyTo(EGYPT_CENTER, DEFAULT_ZOOM);
    }
  }, [selectedGovernorate, map]);

  return null;
}

// Fixed pixel gap between sibling bubbles sharing the same governorate point,
// so the spacing looks the same at every zoom level.
const SIBLING_SPACING_PX = 26;

function GovernorateBubble({ bubble, onSelectProvider }) {
  const map = useMap();
  const color = providerColor(bubble.providerId);
  const offsetXPx =
    (bubble.siblingIndex - (bubble.siblingCount - 1) / 2) * SIBLING_SPACING_PX;

  return (
    <Marker
      position={[bubble.centerLat, bubble.centerLng]}
      icon={createBubbleIcon(bubble.count, color, offsetXPx)}
      eventHandlers={{
        click: () => {
          // focus on THIS provider only, so once we zoom in we show just its
          // branches instead of every provider's branches in the area
          onSelectProvider(bubble.providerId);
          map.flyTo([bubble.centerLat, bubble.centerLng], INDIVIDUAL_PIN_ZOOM);
        },
      }}
    >
      <Popup>
        <div className="text-sm">
          <p className="font-semibold">{bubble.nameAr}</p>
          <p className="text-gray-500">{bubble.governorateNameAr}</p>
          <p className="text-gray-500">{bubble.count} branches</p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function ProviderClusterMap({
  providers,
  governorateBubbles,
  selectedGovernorate = null,
  clientLocations = [],
  showUsers = false,
}) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  // Set when a specific provider's bubble is clicked, so the individual-pin
  // view below shows only THAT provider's branches instead of every
  // provider's branches that happen to share the same area.
  const [focusedProviderId, setFocusedProviderId] = useState(null);
  const showIndividualPins = zoom >= INDIVIDUAL_PIN_ZOOM;

  const handleZoomChange = useCallback((z) => {
    setZoom(z);
    // zooming back out past the pin threshold means the person is no longer
    // looking at one provider's cluster — drop the focus so bubbles (and a
    // later re-zoom) go back to showing everyone again
    if (z < INDIVIDUAL_PIN_ZOOM) {
      setFocusedProviderId(null);
    }
  }, []);

  const pinsToShow = focusedProviderId
    ? providers.filter((p) => p.providerId === focusedProviderId)
    : providers;

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
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {!showIndividualPins &&
        governorateBubbles.map((bubble) => (
          <GovernorateBubble key={bubble.id} bubble={bubble} onSelectProvider={setFocusedProviderId} />
        ))}

      {showIndividualPins &&
        pinsToShow.map((p) => (
          <Marker
            key={p.branchId}
            position={[p.lat, p.lng]}
            icon={createProviderIcon(p.type, p.imageUrl)}
          >
            <Popup minWidth={256} maxWidth={280} className="branch-popup">
              <BranchPopupCard p={p} />
            </Popup>
          </Marker>
        ))}

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