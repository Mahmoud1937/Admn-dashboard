import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createServer } from "vite";

const enSource = readFileSync("src/localization/locales/en/providerDetails.json", "utf8");
const arSource = readFileSync("src/localization/locales/ar/providerDetails.json", "utf8");
const en = JSON.parse(enSource);
const ar = JSON.parse(arSource);
const countResourceKeys = (source) => [...source.matchAll(/^  "(?:\\.|[^"\\])*":/gm)].length;
assert.equal(countResourceKeys(enSource), Object.keys(en).length, "English resource has duplicate keys");
assert.equal(countResourceKeys(arSource), Object.keys(ar).length, "Arabic resource has duplicate keys");
const components = [
  "src/features/providers/pages/ProviderDetailsPage.jsx",
  "src/features/providers/components/ProviderInfoForm.jsx",
  "src/features/providers/components/ProviderLogoUpload.jsx",
  "src/features/branches/components/ProviderBranchesTab.jsx",
  "src/features/branches/components/BranchesFilters.jsx",
  "src/features/branches/components/BranchFormModal.jsx",
  "src/features/providerServices/components/ProviderServicesTab.jsx",
  "src/features/providerServices/components/ProviderServiceFormModal.jsx",
  "src/features/providerServices/components/PriceListFormModal.jsx",
  "src/features/Medicines/components/ProviderMedicinesTab.jsx",
  "src/features/providerPackages/components/ProviderPackagesTab.jsx",
  "src/features/providerPackages/components/ProviderPackageFormModal.jsx",
  "src/features/providerPackages/components/ProviderPackageDetailsModal.jsx",
  "src/features/providerPackages/hooks/useProviderPackageActionsMutation.js",
  "src/features/providerPackages/hooks/useProviderPackageCreateMutation.js",
  "src/features/providerPackages/hooks/useProviderPackageUpdateMutation.js",
  "src/features/providerRenewals/components/ProviderRenewalsTab.jsx",
  "src/features/providerRenewals/components/ProviderRenewalFormModal.jsx",
  "src/features/providerRenewals/hooks/useProviderRenewalCreateMutation.js",
  "src/features/providerRenewals/hooks/useProviderRenewalUpdateMutation.js",
  "src/features/providerAttachments/components/ProviderAttachmentsModal.jsx",
  "src/features/providerAttachments/components/ProviderAttachmentUploadForm.jsx",
  "src/features/providerAttachments/components/ProviderAttachmentReplaceForm.jsx",
  "src/localization/ProviderDetailsQueryErrorState.jsx",
];

const missing = new Set();
for (const path of components) {
  const source = readFileSync(path, "utf8");
  for (const match of source.matchAll(/\btr\("((?:\\.|[^"\\])*)"/g)) {
    const key = JSON.parse(`"${match[1]}"`);
    if (!Object.hasOwn(en, key) || !Object.hasOwn(ar, key)) missing.add(key);
  }
}

const extraEn = Object.keys(en).filter((key) => !Object.hasOwn(ar, key));
const extraAr = Object.keys(ar).filter((key) => !Object.hasOwn(en, key));
assert.deepEqual([...missing].sort(), [], `Missing translations: ${[...missing].sort().join(" | ")}`);
assert.deepEqual(extraEn, [], `Missing Arabic keys: ${extraEn.join(" | ")}`);
assert.deepEqual(extraAr, [], `Missing English keys: ${extraAr.join(" | ")}`);
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
  const { default: ProviderDetailsPage } = await vite.ssrLoadModule("/src/features/providers/pages/ProviderDetailsPage.jsx");
  const { default: ProviderPackageDetailsModal } = await vite.ssrLoadModule("/src/features/providerPackages/components/ProviderPackageDetailsModal.jsx");
  const { default: localizeAttachmentError } = await vite.ssrLoadModule("/src/localization/localizeAttachmentError.js");
  const { useProviderPackagesQuery } = await vite.ssrLoadModule("/src/features/providerPackages/hooks/useProviderPackagesQuery.js");
  const { useProviderAttachmentsQuery } = await vite.ssrLoadModule("/src/features/providerAttachments/hooks/useProviderAttachmentsQuery.js");
  globalThis.document = { documentElement: { lang: "en", dir: "ltr" } };
  globalThis.window = { location: { href: "http://localhost/" }, matchMedia: () => ({ matches: true }) };
  const queryClient = new QueryClient();
  const tr = (key, options) => i18n.t(key, { ns: "providerDetails", keySeparator: false, ...options });
  const render = (path = "/providers/new") => renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(LanguageProvider, null,
        React.createElement(AuthProvider, null,
          React.createElement(MemoryRouter, { initialEntries: [path] },
            React.createElement(Routes, null,
              React.createElement(Route, { path: "/providers/new", element: React.createElement(ProviderDetailsPage) }),
              React.createElement(Route, { path: "/providers/:id", element: React.createElement(ProviderDetailsPage) }),
            ),
          ),
        ),
      ),
    ),
  );
  await i18n.changeLanguage("en");
  assert.equal(localizeAttachmentError('"sample.pdf" is empty. Choose a non-empty file.', tr), '"sample.pdf" is empty. Choose a non-empty file.');
  const english = render();
  assert.match(english, /lang="en" dir="ltr"/);
  assert.match(english, /New Provider/);
  assert.match(english, /Create Provider/);
  await i18n.changeLanguage("ar");
  assert.match(localizeAttachmentError('"sample.pdf" is empty. Choose a non-empty file.', tr), /الملف «sample\.pdf» فارغ/);
  const arabic = render();
  assert.match(arabic, /lang="ar" dir="rtl"/);
  assert.match(arabic, /مقدم خدمة جديد/);
  assert.match(arabic, /إضافة مقدم الخدمة/);
  assert.doesNotMatch(arabic, />New Provider</);
  queryClient.setQueryData(["provider", "42", "en"], { data: { id: 42, enName: "RAW_EN_PROVIDER", arName: "RAW_AR_PROVIDER", providerCategoryId: 1 } });
  queryClient.setQueryData(["provider", "42", "ar"], { data: { id: 42, enName: "RAW_EN_PROVIDER", arName: "RAW_AR_PROVIDER", providerCategoryId: 1 } });
  const arabicDetails = render("/providers/42");
  assert.match(arabicDetails, /<h1[^>]*>RAW_AR_PROVIDER<\/h1>/);
  assert.equal(queryClient.getQueryData(["provider", "42", "ar"]).data.enName, "RAW_EN_PROVIDER");
  const rawPackage = { packageId: 12, packageArName: "RAW_AR_PACKAGE", packageEnName: "RAW_EN_PACKAGE", priceBefore: 100, priceAfter: 80, totalDiscount: 20, isActive: true, services: [] };
  queryClient.setQueryData(["provider-package", 12, "ar"], rawPackage);
  const packageMarkup = renderToStaticMarkup(React.createElement(QueryClientProvider, { client: queryClient }, React.createElement(LanguageProvider, null, React.createElement(ProviderPackageDetailsModal, { packageId: 12, providerId: "42", onClose: () => {} }))));
  assert.match(packageMarkup, /RAW_AR_PACKAGE/);
  assert.match(packageMarkup, /RAW_EN_PACKAGE/);
  assert.ok(packageMarkup.indexOf("RAW_AR_PACKAGE") < packageMarkup.indexOf("RAW_EN_PACKAGE"));
  assert.match(packageMarkup, /justify-start/);
  assert.deepEqual(queryClient.getQueryData(["provider-package", 12, "ar"]), rawPackage);
  queryClient.setQueryData(["provider-packages", "42", 1, 10, "en"], { data: { items: [{ packageId: 12 }], totalCount: 1, totalPages: 1 } });
  queryClient.setQueryData(["provider-attachments", 7, "en"], { data: [{ id: 10 }] });
  function CacheProbe({ language }) {
    const packages = useProviderPackagesQuery({ providerId: "42", pageNumber: 1, pageSize: 10, enabled: false, language });
    const attachments = useProviderAttachmentsQuery({ providerRenewalId: 7, enabled: false, language });
    return React.createElement("span", null, `${packages.packages.length}:${attachments.attachments.length}`);
  }
  const cacheProbe = (language) => renderToStaticMarkup(React.createElement(QueryClientProvider, { client: queryClient }, React.createElement(CacheProbe, { language })));
  assert.match(cacheProbe("en"), />1:1</);
  assert.match(cacheProbe("ar"), />0:0</);
  await i18n.changeLanguage("en");
  assert.match(render(), /lang="en" dir="ltr"/);
  assert.match(render("/providers/42"), /<h1[^>]*>RAW_EN_PROVIDER<\/h1>/);
} finally {
  await vite.close();
}

console.log(`Provider details localization: ${Object.keys(en).length} matching keys, English and Arabic create page render.`);
