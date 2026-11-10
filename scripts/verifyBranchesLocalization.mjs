import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { createServer } from "vite";

const en = JSON.parse(readFileSync("src/localization/locales/en/providerDetails.json", "utf8"));
const ar = JSON.parse(readFileSync("src/localization/locales/ar/providerDetails.json", "utf8"));
for (const key of [
  "Branches", "Search by branch name (EN/AR) or email...", "Filters",
  "Branch", "Location", "Coordinates", "Status", "Joined", "Rows per page",
  "Export branches to Excel", "Exporting...", "Export",
  "Unable to export branches. Please try again.",
  "The server did not return an Excel file.",
  "No Excel file was returned. Please try again.",
  "Browse branch locations and contact details.", "No branches are available yet.",
]) {
  assert.ok(Object.hasOwn(en, key), `English key missing: ${key}`);
  assert.ok(Object.hasOwn(ar, key), `Arabic key missing: ${key}`);
}

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
  const { default: BranchesPage } = await vite.ssrLoadModule("/src/features/branches/pages/BranchesPage.jsx");
  globalThis.document = { documentElement: { lang: "en", dir: "ltr" } };
  globalThis.window = { location: { href: "http://localhost/" }, matchMedia: () => ({ matches: true }) };
  const queryClient = new QueryClient();
  const branch = { id: 17, branchName: "RAW_BRANCH", cityName: "RAW_CITY", governorateName: "RAW_GOVERNORATE", email: "raw@example.test", latitude: 30.5, longitude: 31.25, isActive: true, createdAt: "2025-01-01T00:00:00" };
  const key = (language) => ["all-branches", "", "", "", "", 1, 20, language];
  const response = { items: [branch], totalCount: 1, totalPages: 1 };
  const render = () => renderToStaticMarkup(React.createElement(QueryClientProvider, { client: queryClient },
    React.createElement(LanguageProvider, null,
      React.createElement(AuthProvider, null,
        React.createElement(MemoryRouter, { initialEntries: ["/branches"] }, React.createElement(BranchesPage)),
      ),
    ),
  ));

  queryClient.setQueryData(key("en"), response);
  await i18n.changeLanguage("en");
  const english = render();
  assert.match(english, /lang="en" dir="ltr"/);
  assert.match(english, /Search by branch name/);
  assert.match(english, /RAW_BRANCH/);
  await i18n.changeLanguage("ar");
  const loadingArabic = render();
  assert.match(loadingArabic, /lang="ar" dir="rtl"/);
  assert.doesNotMatch(loadingArabic, /RAW_BRANCH/);
  queryClient.setQueryData(key("ar"), { items: [], totalCount: 0, totalPages: 1 });
  assert.match(render(), /لا توجد فروع متاحة بعد/);
  queryClient.setQueryData(key("ar"), response);
  const arabic = render();
  assert.match(arabic, /الفروع/);
  assert.match(arabic, /إجمالي الفروع: 1/);
  assert.match(arabic, /RAW_BRANCH/);
  assert.match(arabic, /RAW_CITY/);
  assert.match(arabic, /<bdi dir="ltr">30\.5, 31\.25<\/bdi>/);
  assert.equal(queryClient.getQueryData(key("ar")).items[0].branchName, "RAW_BRANCH");
  await i18n.changeLanguage("en");
  assert.match(render(), /lang="en" dir="ltr"/);
} finally {
  await vite.close();
}

console.log("Branches localization: English/Arabic render, RTL/LTR, raw API fields, and language cache passed.");
