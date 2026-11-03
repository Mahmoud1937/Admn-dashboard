export const MEDICINE_UNITS = ["Box", "Bottle", "Tube"];

// The API may serialize MedicineUnit as either its name or its numeric value.
export function getMedicineUnitName(value) {
  if (value == null || value === "") return "";

  return MEDICINE_UNITS.find(
    (name, index) =>
      name.toLowerCase() === String(value).toLowerCase() ||
      index + 1 === Number(value)
  ) ?? "";
}
