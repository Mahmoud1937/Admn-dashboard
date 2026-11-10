import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { normalizeLanguage } from "./i18n";

export default function useLanguage() {
  const { i18n } = useTranslation("common");
  const queryClient = useQueryClient();
  const language = normalizeLanguage(i18n.resolvedLanguage || i18n.language);

  const changeLanguage = async (nextLanguage) => {
    if (nextLanguage !== "en" && nextLanguage !== "ar") return;
    await i18n.changeLanguage(nextLanguage);
    // Providers cache keys include the language; mark earlier entries stale if
    // the user returns to a language while keeping other pages untouched.
    await queryClient.invalidateQueries({ queryKey: ["providers"], refetchType: "none" });
  };

  return { language, direction: i18n.dir(language), changeLanguage };
}
