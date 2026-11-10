import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import commonEn from "./locales/en/common.json";
import commonAr from "./locales/ar/common.json";
import providersEn from "./locales/en/providers.json";
import providersAr from "./locales/ar/providers.json";
import loginEn from "./locales/en/login.json";
import loginAr from "./locales/ar/login.json";
import sidebarEn from "./locales/en/sidebar.json";
import sidebarAr from "./locales/ar/sidebar.json";
import navbarEn from "./locales/en/navbar.json";
import navbarAr from "./locales/ar/navbar.json";
import providerDetailsEn from "./locales/en/providerDetails.json";
import providerDetailsAr from "./locales/ar/providerDetails.json";
import dashboardEn from "./locales/en/dashboard.json";
import dashboardAr from "./locales/ar/dashboard.json";

export const LANGUAGE_STORAGE_KEY = "admin.uiLanguage";

export function normalizeLanguage(value) {
  return value === "ar" ? "ar" : "en";
}

function getSavedLanguage() {
  try {
    return normalizeLanguage(globalThis.localStorage?.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return "en";
  }
}

export function getActiveLanguage() {
  return normalizeLanguage(i18n.resolvedLanguage || i18n.language);
}

function syncDocumentLanguage(language) {
  const activeLanguage = normalizeLanguage(language);
  if (globalThis.document?.documentElement) {
    document.documentElement.lang = activeLanguage;
    document.documentElement.dir = i18n.dir(activeLanguage);
  }
  try {
    globalThis.localStorage?.setItem(LANGUAGE_STORAGE_KEY, activeLanguage);
  } catch {
    // A blocked storage write must not prevent changing the UI language.
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { common: commonEn, providers: providersEn, login: loginEn, sidebar: sidebarEn, navbar: navbarEn, providerDetails: providerDetailsEn, dashboard: dashboardEn },
    ar: { common: commonAr, providers: providersAr, login: loginAr, sidebar: sidebarAr, navbar: navbarAr, providerDetails: providerDetailsAr, dashboard: dashboardAr },
  },
  lng: getSavedLanguage(),
  fallbackLng: "en",
  supportedLngs: ["en", "ar"],
  ns: ["common", "providers", "login", "sidebar", "navbar", "providerDetails", "dashboard"],
  defaultNS: "common",
  initAsync: false,
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", syncDocumentLanguage);
syncDocumentLanguage(getActiveLanguage());

export default i18n;
