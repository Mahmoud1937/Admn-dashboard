import { useTranslation } from "react-i18next";

export default function DateInput({ className = "", ...props }) {
  const { i18n } = useTranslation("common");
  return <input type="date" lang={i18n.resolvedLanguage === "ar" ? "ar" : "en-GB"} className={className} {...props} />;
}
