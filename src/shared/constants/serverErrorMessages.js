export const SERVER_ERROR_MESSAGES = {
  MapUrlCoordinatesNotFound:
    "Map URL must include location coordinates. Open the pin in Google Maps and copy the full URL from the address bar.",
};

export function humanizeServerError(code) {
  return SERVER_ERROR_MESSAGES[code] ?? code;
}