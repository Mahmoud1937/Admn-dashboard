import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import useContentLanguage from "../../localization/useContentLanguage";

function LanguageTabs({ language, onChange }) {
  const { t } = useTranslation("common");
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
      <button
        type="button"
        onClick={() => onChange("en")}
        aria-pressed={language === "en"}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
          language === "en"
            ? "bg-[#1b4477] text-white shadow-sm"
            : "text-gray-500 hover:bg-white hover:text-gray-700"
        }`}
      >
        {t("English")}
      </button>

      <button
        type="button"
        onClick={() => onChange("ar")}
        aria-pressed={language === "ar"}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
          language === "ar"
            ? "bg-[#2caba2] text-white shadow-sm"
            : "text-gray-500 hover:bg-white hover:text-gray-700"
        }`}
      >
        {t("Arabic")}
      </button>
    </div>
  );
}

function NotificationImage({ imageUrl }) {
  const [hasError, setHasError] = useState(false);

  const isValidUrl =
    imageUrl && /^(?:https?:\/\/|blob:).+/i.test(imageUrl.trim());

  if (!isValidUrl || hasError) {
    return null;
  }

  return (
    <img
      key={imageUrl}
      src={imageUrl}
      alt=""
      className="mt-3 h-28 w-full rounded-xl border border-gray-100 object-cover"
      onError={() => setHasError(true)}
    />
  );
}

function PhonePreview({ title, message, imageUrl, lang }) {
  const { t } = useTranslation("common");
  const isArabic = lang === "ar";

  const currentTime = useMemo(
    () =>
      new Date().toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [lang]
  );

  return (
    <div className="mx-auto w-full min-w-0 max-w-[300px]">
      <div className="overflow-hidden rounded-[2rem] border-[5px] border-gray-800 bg-gradient-to-b from-slate-100 to-slate-200 shadow-xl">
        <div className="px-3 pt-3">
          <div className="mx-auto h-1.5 w-16 rounded-full bg-gray-800/70" />

          <div className="py-5 text-center text-[11px] font-medium text-gray-500">
            {currentTime}
          </div>
        </div>

        <div className="px-3">
          <div
            key={lang}
            dir={isArabic ? "rtl" : "ltr"}
            className="notification-preview-in w-full min-w-0 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-sm backdrop-blur"
          >
            <div
              dir="ltr"
              className={`mb-2 flex w-full min-w-0 items-center justify-between gap-2 text-[11px] text-gray-500 ${
                isArabic ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex min-w-0 items-center gap-2 ${
                  isArabic ? "flex-row-reverse" : ""
                }`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#1b4477] text-white">
                  <FontAwesomeIcon icon={faBell} className="text-[9px]" />
                </span>
                <span className="font-semibold text-gray-600">Medicard</span>
              </div>

              <div
                className={`flex shrink-0 items-center gap-1 ${
                  isArabic ? "flex-row-reverse" : ""
                }`}
              >
                <span>•</span>
                <span>{t("now")}</span>
              </div>
            </div>

            <p
              dir={isArabic ? "rtl" : "ltr"}
              className={`w-full min-w-0 whitespace-normal break-words text-sm font-semibold leading-snug text-gray-900 ${isArabic ? "text-right" : "text-left"}`}
            >
              {title || t("Notification title")}
            </p>

            <p
              dir={isArabic ? "rtl" : "ltr"}
              className={`mt-1 w-full min-w-0 whitespace-normal break-words text-xs leading-relaxed text-gray-600 ${isArabic ? "text-right" : "text-left"}`}
            >
              {message || t("Your notification message will appear here.")}
            </p>

            <NotificationImage key={imageUrl} imageUrl={imageUrl} />
          </div>

          <div className="h-24" />
        </div>

        <div className="pb-2">
          <div className="mx-auto h-1 w-24 rounded-full bg-gray-700/60" />
        </div>
      </div>
    </div>
  );
}

export default function NotificationPreview({
  title,
  messageEn,
  messageAr,
  imageUrl,
}) {
  const { t } = useTranslation("adminPages");
  const [language, setLanguage] = useContentLanguage();

  const message =
    language === "ar" ? messageAr : messageEn;

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
            {t("Live preview")}
          </p>

          <LanguageTabs
            language={language}
            onChange={setLanguage}
          />
        </div>

        <PhonePreview
          lang={language}
          title={title}
          message={message}
          imageUrl={imageUrl}
        />

        <p className="mx-auto mt-4 max-w-[280px] text-center text-[11px] leading-relaxed text-gray-400">
          {t("Preview is approximate and may vary slightly depending on the device.")}
        </p>
      </div>
    </aside>
  );
}

