import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { normalizeLanguage } from "./i18n";

export default function useLanguage() {
  const { i18n } = useTranslation("common");
  const queryClient = useQueryClient();
  const language = normalizeLanguage(i18n.resolvedLanguage || i18n.language);

  const changeLanguage = async (nextLanguage) => {
    if (nextLanguage !== "en" && nextLanguage !== "ar") return;
    const localizedQueries = {
      predicate: (query) => !["permissions", "employee-details"].includes(query.queryKey[0]),
    };
    await queryClient.cancelQueries(localizedQueries);
    await i18n.changeLanguage(nextLanguage);
    // API responses include localized names and messages. Refresh active queries
    // and mark cached pages stale so they also reload in the selected language.
    await queryClient.invalidateQueries(localizedQueries);
  };

  return { language, direction: i18n.dir(language), changeLanguage };
}
