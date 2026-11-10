import { useTranslation } from "react-i18next";

export default function useClientsText() {
  const { t } = useTranslation("clients");
  return (key, options) => t(key, { keySeparator: false, defaultValue: key, ...options });
}
