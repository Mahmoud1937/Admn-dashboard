
export function normalizeArabic(str) {
  if (!str) return "";
  return str
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[\u064B-\u065F\u0670]/g, "") // strip tashkeel/diacritics
    .replace(/[إأآا]/g, "ا") // unify alef forms
    .replace(/ة/g, "ه") // unify teh marbuta / heh (common typo source)
    .replace(/ى/g, "ي") // unify alef maksura / yeh
    .toLowerCase();
}
 