import { getActiveLanguage } from "../localization/i18n";

const dateLocale = () => getActiveLanguage() === "ar" ? "ar-EG" : "en-GB";

export function formatDate(isoString) {
  if (!isoString || isoString.startsWith('0001')) return "-";
  return new Date(isoString).toLocaleDateString(dateLocale());
}
export function formatDateTimeShort(isoString) {
  if (!isoString || isoString.startsWith('0001')) return "-";
  const d = new Date(isoString);
  const datePart = d.toLocaleDateString(dateLocale());
  const timePart = d.toLocaleTimeString(dateLocale(), { hour: "2-digit", minute: "2-digit" });
  return `${datePart} ${timePart}`;
}
