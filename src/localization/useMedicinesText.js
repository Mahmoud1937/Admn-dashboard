import { useTranslation } from "react-i18next";

export default function useMedicinesText() {
  const { t } = useTranslation("medicines");
  return (key, options) => t(key, { keySeparator: false, defaultValue: key, ...options });
}
