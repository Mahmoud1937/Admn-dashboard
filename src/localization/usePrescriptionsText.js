import { useTranslation } from "react-i18next";

export default function usePrescriptionsText() {
  const { t } = useTranslation("prescriptions");
  return (key, options) => t(key, { keySeparator: false, defaultValue: key, ...options });
}
