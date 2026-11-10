import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { createServer } from "vite";

const en = JSON.parse(readFileSync("src/localization/locales/en/providerCategories.json", "utf8"));
const ar = JSON.parse(readFileSync("src/localization/locales/ar/providerCategories.json", "utf8"));
assert.deepEqual(Object.keys(en).sort(), Object.keys(ar).sort());

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  const { default: i18n } = await vite.ssrLoadModule("/src/localization/i18n.js");
  const { default: LanguageProvider } = await vite.ssrLoadModule("/src/localization/LanguageProvider.jsx");
  const { AuthProvider } = await vite.ssrLoadModule("/src/features/auth/context/Authcontext.jsx");
  const { default: CategoriesPage } = await vite.ssrLoadModule("/src/features/categoreis/pages/CategoryPage.jsx");
  const { default: CategoryFormModal } = await vite.ssrLoadModule("/src/features/categoreis/components/CategoryFormModal.jsx");
  const { default: CategoriesTable } = await vite.ssrLoadModule("/src/features/categoreis/components/CategoriesTable.jsx");
  const { getCategorySchema } = await vite.ssrLoadModule("/src/features/categoreis/schema/categorySchema.js");

  globalThis.document = { documentElement: { lang: "en", dir: "ltr" } };
  globalThis.window = { location: { href: "http://localhost/" }, matchMedia: () => ({ matches: true }) };

  const queryClient = new QueryClient();
  const category = { id: 7, enName: "RAW_EN_CATEGORY", arName: "RAW_AR_CATEGORY", imageUrl: null };
  const response = { data: { items: [category], totalCount: 1, totalPages: 1 } };
  const key = (language) => ["categories", language, 1, 20, ""];
  const renderPage = () => renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(LanguageProvider, null,
        React.createElement(AuthProvider, null,
          React.createElement(MemoryRouter, { initialEntries: ["/provider-category"] }, React.createElement(CategoriesPage)),
        ),
      ),
    ),
  );
  const renderModal = () => renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(CategoryFormModal, { isOpen: true, category: null, onSave: () => {}, onClose: () => {}, isSaving: false }),
    ),
  );

  queryClient.setQueryData(key("en"), response);
  await i18n.changeLanguage("en");
  const english = renderPage();
  assert.match(english, /lang="en" dir="ltr"/);
  assert.match(english, /Categories Management/);
  assert.match(english, /RAW_EN_CATEGORY/);
  assert.match(english, /RAW_AR_CATEGORY/);
  assert.match(renderModal(), /Add Category/);

  await i18n.changeLanguage("ar");
  const loadingArabic = renderPage();
  assert.match(loadingArabic, /lang="ar" dir="rtl"/);
  assert.doesNotMatch(loadingArabic, /RAW_EN_CATEGORY/);
  queryClient.setQueryData(key("ar"), response);
  const arabic = renderPage();
  assert.match(arabic, new RegExp(ar["Categories Management"]));
  assert.match(arabic, /RAW_EN_CATEGORY/);
  assert.match(arabic, /RAW_AR_CATEGORY/);
  assert.match(renderModal(), new RegExp(ar["Add Category"]));

  const actions = renderToStaticMarkup(
    React.createElement(CategoriesTable, { categories: [category], hasActiveFilters: false, onEdit: () => {}, onDeleteRequest: () => {}, rtl: true }),
  );
  assert.match(actions, new RegExp(`title="${ar.Edit}"`));
  assert.match(actions, new RegExp(`title="${ar.Delete}"`));
  assert.equal(queryClient.getQueryData(key("ar")).data.items[0].enName, "RAW_EN_CATEGORY");

  const validation = getCategorySchema(true).safeParse({ enName: "A", arName: "x", logo: null });
  assert.equal(validation.success, false);
  for (const issue of validation.error.issues) {
    assert.ok(Object.hasOwn(en, issue.message), `Untranslated validation error: ${issue.message}`);
    assert.notEqual(ar[issue.message], issue.message);
  }
} finally {
  await vite.close();
}

console.log("Provider categories localization: English/Arabic page and modal, RTL/LTR, raw API values, and language cache passed.");
