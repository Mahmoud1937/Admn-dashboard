import { useTranslation } from "react-i18next";

// Shared provider widgets also appear on standalone pages. Those callers keep
// their existing copy unless the provider details route opts them in.
export default function useProviderDetailsText(enabled = true) {
  const { t } = useTranslation("providerDetails");
  return (key, options) => enabled
    ? t(key, { keySeparator: false, defaultValue: key, ...options })
    : key;
}
