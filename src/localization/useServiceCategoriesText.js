import { useTranslation } from "react-i18next";

export default function useServiceCategoriesText() {
  const { t } = useTranslation("serviceCategories");
  return (key, options) => t(key, { keySeparator: false, defaultValue: key, ...options });
}
