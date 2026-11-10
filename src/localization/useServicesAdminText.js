import { useTranslation } from "react-i18next";

export default function useServicesAdminText() {
  const { t } = useTranslation("servicesAdmin");
  return (key, options) => t(key, { keySeparator: false, defaultValue: key, ...options });
}
