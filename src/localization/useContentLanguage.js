import { useState } from "react";
import { useTranslation } from "react-i18next";
import { normalizeLanguage } from "./i18n";

// Bilingual editors allow a manual tab choice until the application language changes.
export default function useContentLanguage() {
  const { i18n } = useTranslation("common");
  const uiLanguage = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const [selection, setSelection] = useState({ uiLanguage, language: uiLanguage });
  if (selection.uiLanguage !== uiLanguage) {
    setSelection({ uiLanguage, language: uiLanguage });
  }
  const language = selection.uiLanguage === uiLanguage ? selection.language : uiLanguage;
  return [language, (nextLanguage) => setSelection({ uiLanguage, language: nextLanguage })];
}
