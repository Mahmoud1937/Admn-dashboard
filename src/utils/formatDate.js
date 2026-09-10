export function formatDate(isoString) {
  if (!isoString || isoString.startsWith('0001')) return "-";
  return new Date(isoString).toLocaleDateString("en-GB");
}