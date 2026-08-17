import { useState, useCallback, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CATEGORIES } from "./CategoryTabs";

const EGYPT_CENTER = [26.8, 30.8];
const DEFAULT_ZOOM = 6;
// Below this zoom level: show governorate bubbles. At/above it: show individual pins.
const INDIVIDUAL_PIN_ZOOM = 9;

function clusterColor(count) {
  if (count >= 100) return "#dc2626"; // red
  if (count >= 25) return "#f59e0b"; // orange/amber
  return "#16a34a"; // green
}

function createBubbleIcon(count) {
  const color = clusterColor(count);
  const size = count >= 100 ? 56 : count >= 25 ? 48 : 40;
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

function createProviderIcon(type) {
  const meta = CATEGORIES.find((c) => c.key === type) || CATEGORIES[0];
  return L.divIcon({
    html: `
      <div style="
        width:26px;height:26px;border-radius:9999px;background:white;
        border:2px solid ${meta.color};box-shadow:0 1px 3px rgba(0,0,0,0.3);
      "></div>`,
    className: "",
    iconSize: [26, 26],
  });
}

// Tracks the map's current zoom so we know whether to show bubbles or pins
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

function GovernorateBubble({ bubble }) {
  const map = useMap();
  return (
    <Marker
      position={[bubble.centerLat, bubble.centerLng]}
      icon={createBubbleIcon(bubble.count)}
      eventHandlers={{
        click: () => map.flyTo([bubble.centerLat, bubble.centerLng], INDIVIDUAL_PIN_ZOOM),
      }}
    >
      <Popup>
        <div className="text-sm">
          <p className="font-semibold">{bubble.nameAr}</p>
          <p className="text-gray-500">{bubble.count} providers</p>
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
  const showIndividualPins = zoom >= INDIVIDUAL_PIN_ZOOM;

  const handleZoomChange = useCallback((z) => setZoom(z), []);

  return (
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
          <GovernorateBubble key={bubble.id} bubble={bubble} />
        ))}

      {showIndividualPins &&
        providers.map((p) => (
          <Marker
            key={p.branchId}
            position={[p.lat, p.lng]}
            icon={createProviderIcon(p.type)}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{p.name}</p>
                <p className="text-gray-500">{p.categoryAr}</p>
                {p.address && <p className="mt-1">{p.address}</p>}
                {p.phone && <p className="text-gray-500">{p.phone}</p>}
              </div>
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
  );
}