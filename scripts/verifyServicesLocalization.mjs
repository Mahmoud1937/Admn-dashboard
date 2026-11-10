import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { createServer } from "vite";

const resources = Object.fromEntries(
  ["serviceCategories", "servicesAdmin"].map((namespace) => {
    const en = JSON.parse(readFileSync(`src/localization/locales/en/${namespace}.json`, "utf8"));
    const ar = JSON.parse(readFileSync(`src/localization/locales/ar/${namespace}.json`, "utf8"));
    assert.deepEqual(Object.keys(en).sort(), Object.keys(ar).sort());
    return [namespace, { en, ar }];
  }),
);

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};

const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
try {
  const { default: i18n } = await vite.ssrLoadModule("/src/localization/i18n.js");
  const { default: LanguageProvider } = await vite.ssrLoadModule("/src/localization/LanguageProvider.jsx");
  const { AuthProvider } = await vite.ssrLoadModule("/src/features/auth/context/Authcontext.jsx");
  const { default: ServiceCategoriesPage } = await vite.ssrLoadModule("/src/features/ServiceCategory/pages/ServiceCategoriesPage.jsx");
  const { default: ServicesPage } = await vite.ssrLoadModule("/src/features/services-admin/pages/ServicesPage.jsx");
  const { default: ServiceCategoryFormModal } = await vite.ssrLoadModule("/src/features/ServiceCategory/components/ServiceCategoryFormModal.jsx");
  const { default: ServiceFormModal } = await vite.ssrLoadModule("/src/features/services-admin/components/ServiceFormModal.jsx");
  const { getServiceCategorySchema } = await vite.ssrLoadModule("/src/features/ServiceCategory/schema/serviceCategorySchema.js");
  const { serviceSchema } = await vite.ssrLoadModule("/src/features/services-admin/schema/serviceSchema.js");

  globalThis.document = { documentElement: { lang: "en", dir: "ltr" } };
  globalThis.window = { location: { href: "http://localhost/" }, matchMedia: () => ({ matches: true }) };

  const queryClient = new QueryClient();
  const category = { id: 7, enName: "RAW_EN_CATEGORY", arName: "RAW_AR_CATEGORY", imageUrl: null };
  const service = {
    id: 9, enName: "RAW_EN_SERVICE", arName: "RAW_AR_SERVICE",
    categoryNameEn: "RAW_EN_CATEGORY", categoryNameAr: "RAW_AR_CATEGORY",
    cpt: "RAW_CPT", serviceInstruction: "RAW_INSTRUCTION",
  };
  const categoryKey = (language) => ["service-categories", language, 1, 20, ""];
  const serviceKey = (language) => ["services", language, 1, 20, "", "", undefined];
  const response = (item) => ({ data: { items: [item], totalCount: 1, totalPages: 1 } });

  const renderPage = (Page, path) => renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(LanguageProvider, null,
        React.createElement(AuthProvider, null,
          React.createElement(MemoryRouter, { initialEntries: [path] }, React.createElement(Page)),
        ),
      ),
    ),
  );
  const renderModal = (Modal) => renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(Modal, { isOpen: true, onSave: () => {}, onClose: () => {}, isSaving: false }),
    ),
  );

  queryClient.setQueryData(categoryKey("en"), response(category));
  queryClient.setQueryData(serviceKey("en"), response(service));
  await i18n.changeLanguage("en");
  const englishCategories = renderPage(ServiceCategoriesPage, "/service-category");
  const englishServices = renderPage(ServicesPage, "/services");
  assert.match(englishCategories, /lang="en" dir="ltr"/);
  assert.match(englishServices, /lang="en" dir="ltr"/);
  assert.match(englishCategories, /Service Categories Management/);
  assert.match(englishServices, /Services Management/);
  assert.match(englishServices, /RAW_EN_SERVICE/);
  assert.match(renderModal(ServiceCategoryFormModal), /Add Service Category/);
  assert.match(renderModal(ServiceFormModal), /Add Service/);

  await i18n.changeLanguage("ar");
  const loadingCategories = renderPage(ServiceCategoriesPage, "/service-category");
  const loadingServices = renderPage(ServicesPage, "/services");
  assert.match(loadingCategories, /lang="ar" dir="rtl"/);
  assert.match(loadingServices, /lang="ar" dir="rtl"/);
  assert.doesNotMatch(loadingCategories, /RAW_EN_CATEGORY/);
  assert.doesNotMatch(loadingServices, /RAW_EN_SERVICE/);

  queryClient.setQueryData(categoryKey("ar"), response(category));
  queryClient.setQueryData(serviceKey("ar"), response(service));
  const arabicCategories = renderPage(ServiceCategoriesPage, "/service-category");
  const arabicServices = renderPage(ServicesPage, "/services");
  assert.match(arabicCategories, new RegExp(resources.serviceCategories.ar["Service Categories Management"]));
  assert.match(arabicServices, new RegExp(resources.servicesAdmin.ar["Services Management"]));
  for (const raw of ["RAW_EN_SERVICE", "RAW_AR_SERVICE", "RAW_EN_CATEGORY", "RAW_AR_CATEGORY", "RAW_CPT", "RAW_INSTRUCTION"]) {
    assert.ok(arabicServices.includes(raw), `Backend value changed or hidden: ${raw}`);
  }
  assert.ok(arabicServices.indexOf("RAW_AR_SERVICE") < arabicServices.indexOf("RAW_EN_SERVICE"));
  assert.match(renderModal(ServiceCategoryFormModal), new RegExp(resources.serviceCategories.ar["Add Service Category"]));
  assert.match(renderModal(ServiceFormModal), new RegExp(resources.servicesAdmin.ar["Add Service"]));
  assert.equal(queryClient.getQueryData(serviceKey("ar")).data.items[0].enName, "RAW_EN_SERVICE");

  const categoryValidation = getServiceCategorySchema(true).safeParse({ enName: "A", arName: "x", logo: null });
  const serviceValidation = serviceSchema.safeParse({ enName: "A", arName: "x", categoryId: "", cpt: "AB" });
  for (const [validation, namespace] of [[categoryValidation, "serviceCategories"], [serviceValidation, "servicesAdmin"]]) {
    assert.equal(validation.success, false);
    for (const issue of validation.error.issues) {
      assert.ok(Object.hasOwn(resources[namespace].ar, issue.message), `Untranslated ${namespace} validation error: ${issue.message}`);
      assert.notEqual(resources[namespace].ar[issue.message], issue.message);
    }
  }

  await i18n.changeLanguage("en");
  assert.match(renderPage(ServiceCategoriesPage, "/service-category"), /lang="en" dir="ltr"/);
  assert.match(renderPage(ServicesPage, "/services"), /Services Management/);
} finally {
  await vite.close();
}

console.log("Service categories and services localization: English/Arabic, RTL/LTR, forms, validation, raw API values, and language cache passed.");
