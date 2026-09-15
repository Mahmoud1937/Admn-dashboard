export function formatDate(isoString) {
  if (!isoString || isoString.startsWith('0001')) return "-";
  return new Date(isoString).toLocaleDateString("en-GB");
}
export function formatDateTimeShort(isoString) {
  if (!isoString || isoString.startsWith('0001')) return "-";
  const d = new Date(isoString);
  const datePart = d.toLocaleDateString("en-GB");
  const timePart = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${datePart} ${timePart}`;
}