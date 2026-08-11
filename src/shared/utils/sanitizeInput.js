export function sanitizeNameInput(value) {
  return value
    .replace(/^\s+/, "")       // امنع أي مسافات في أول الحقل
    .replace(/\s{2,}/g, " ");  // اقصر أي مسافات متتالية لمسافة واحدة بس
}