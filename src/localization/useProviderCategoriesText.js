import { useTranslation } from "react-i18next";

export default function useProviderCategoriesText() {
  const { t } = useTranslation("providerCategories");
  return (key, options) => t(key, { keySeparator: false, defaultValue: key, ...options });
}
