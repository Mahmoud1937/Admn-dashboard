import { useTranslation } from "react-i18next";

export default function useProviderMapText() {
  const { t } = useTranslation("providerMap");
  return (key, options) => t(key, { keySeparator: false, defaultValue: key, ...options });
}
