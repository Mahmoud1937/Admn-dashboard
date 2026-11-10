import { useState } from "react";
import { useTranslation } from "react-i18next";
import useLanguage from "../localization/useLanguage";

export default function LanguageSwitcher() {
  const { t } = useTranslation("common");
  const { language, direction, changeLanguage } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  const handleChange = async (event) => {
    setIsChanging(true);
    try {
      await changeLanguage(event.target.value);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <label className="flex items-center" lang={language} dir={direction}>
      <span className="sr-only">{t("language")}</span>
      <select
        value={language}
        onChange={(event) => void handleChange(event)}
        disabled={isChanging}
        aria-label={t("language")}
        className="max-w-28 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-400 focus:outline-none sm:max-w-none sm:px-3 sm:text-sm"
      >
        <option value="en">{t("english")}</option>
        <option value="ar">{t("arabic")}</option>
      </select>
    </label>
  );
}
