// Rough bounding box for Egypt — used to filter out obviously bad lat/lng
// (e.g. {lat:1,lng:1}, {lat:90,lng:180}) that would otherwise place a
// marker in the ocean or off the map entirely.
const EGYPT_BOUNDS = {
  minLat: 20,
  maxLat: 33,
  minLng: 23,
  maxLng: 38,
};

export function hasValidEgyptCoords(lat, lng) {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    lat >= EGYPT_BOUNDS.minLat &&
    lat <= EGYPT_BOUNDS.maxLat &&
    lng >= EGYPT_BOUNDS.minLng &&
    lng <= EGYPT_BOUNDS.maxLng
  );
}