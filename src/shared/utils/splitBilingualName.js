export function splitBilingualName(fullName = "") {
  const match = fullName.match(/^([\u0600-\u06FF\s]+)([A-Za-z].*)$/);

  if (match) {
    return {
      ar: match[1].trim(),
      en: match[2].trim(),
    };
  }

  return { ar: "", en: fullName.trim() };
}