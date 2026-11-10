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
import providerCategoriesEn from "./locales/en/providerCategories.json";
import providerCategoriesAr from "./locales/ar/providerCategories.json";
import providerMapEn from "./locales/en/providerMap.json";
import providerMapAr from "./locales/ar/providerMap.json";
import serviceCategoriesEn from "./locales/en/serviceCategories.json";
import serviceCategoriesAr from "./locales/ar/serviceCategories.json";
import servicesAdminEn from "./locales/en/servicesAdmin.json";
import servicesAdminAr from "./locales/ar/servicesAdmin.json";
import clientsEn from "./locales/en/clients.json";
import clientsAr from "./locales/ar/clients.json";
import medicinesEn from "./locales/en/medicines.json";
import medicinesAr from "./locales/ar/medicines.json";
import prescriptionsEn from "./locales/en/prescriptions.json";
import prescriptionsAr from "./locales/ar/prescriptions.json";
import adminPagesEn from "./locales/en/adminPages.json";
import adminPagesAr from "./locales/ar/adminPages.json";

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
    en: { common: commonEn, providers: providersEn, login: loginEn, sidebar: sidebarEn, navbar: navbarEn, providerDetails: providerDetailsEn, dashboard: dashboardEn, providerCategories: providerCategoriesEn, providerMap: providerMapEn, serviceCategories: serviceCategoriesEn, servicesAdmin: servicesAdminEn, clients: clientsEn, medicines: medicinesEn, prescriptions: prescriptionsEn, adminPages: adminPagesEn },
    ar: { common: commonAr, providers: providersAr, login: loginAr, sidebar: sidebarAr, navbar: navbarAr, providerDetails: providerDetailsAr, dashboard: dashboardAr, providerCategories: providerCategoriesAr, providerMap: providerMapAr, serviceCategories: serviceCategoriesAr, servicesAdmin: servicesAdminAr, clients: clientsAr, medicines: medicinesAr, prescriptions: prescriptionsAr, adminPages: adminPagesAr },
  },
  lng: getSavedLanguage(),
  fallbackLng: "en",
  supportedLngs: ["en", "ar"],
  ns: ["common", "providers", "login", "sidebar", "navbar", "providerDetails", "dashboard", "providerCategories", "providerMap", "serviceCategories", "servicesAdmin", "clients", "medicines", "prescriptions", "adminPages"],
  defaultNS: "common",
  initAsync: false,
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", syncDocumentLanguage);
syncDocumentLanguage(getActiveLanguage());

export default i18n;
