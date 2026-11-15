export function isNumericInput(value, allowDecimal = false) {
  return (allowDecimal ? /^\d*(?:\.\d*)?$/ : /^\d*$/).test(value);
}

export function sanitizeNumericInput(value, allowDecimal = false) {
  const clean = String(value ?? "").replace(allowDecimal ? /[^0-9.]/g : /\D/g, "");
  if (!allowDecimal) return clean;
  const point = clean.indexOf(".");
  return point < 0 ? clean : clean.slice(0, point + 1) + clean.slice(point + 1).replace(/\./g, "");
}

export function canInsertNumericText(input, text, allowDecimal = false) {
  if (!isNumericInput(text, allowDecimal)) return false;
  // Native number inputs do not expose their selection range.
  if (input.selectionStart == null) return true;
  const next = input.value.slice(0, input.selectionStart) + text + input.value.slice(input.selectionEnd);
  return isNumericInput(next, allowDecimal);
}
