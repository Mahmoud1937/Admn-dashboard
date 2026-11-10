import { useState } from "react";
import { useTranslation } from "react-i18next";
import useLanguage from "../localization/useLanguage";

export default function LanguageSwitcher() {
  const { t } = useTranslation("common");
  const { language, changeLanguage } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  const handleChange = async () => {
    if (isChanging) return;
    setIsChanging(true);
    try {
      await changeLanguage(language === "en" ? "ar" : "en");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={language === "ar"}
      aria-label={`${t("language")}: ${t("arabic")}`}
      aria-busy={isChanging || undefined}
      title={t(language === "ar" ? "english" : "arabic")}
      lang={language}
      dir="ltr"
      onClick={() => void handleChange()}
      disabled={isChanging}
      className="relative inline-grid h-9 w-24 shrink-0 grid-cols-2 items-center rounded-full border border-slate-200 bg-slate-100 p-1 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
    >
      <span aria-hidden="true" className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%_-_0.25rem)] rounded-full bg-blue-900 shadow-sm transition-transform duration-200 motion-reduce:transition-none ${language === "ar" ? "translate-x-full" : "translate-x-0"}`} />
      <span aria-hidden="true" lang="en" className={`relative text-center ${language === "en" ? "text-white" : "text-slate-500"}`}>EN</span>
      <span aria-hidden="true" lang="ar" className={`relative text-center ${language === "ar" ? "text-white" : "text-slate-500"}`}>ع</span>
    </button>
  );
}
