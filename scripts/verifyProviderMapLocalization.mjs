import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createServer } from "vite";

const en = JSON.parse(readFileSync("src/localization/locales/en/providerMap.json", "utf8"));
const ar = JSON.parse(readFileSync("src/localization/locales/ar/providerMap.json", "utf8"));
assert.deepEqual(Object.keys(en).sort(), Object.keys(ar).sort());

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};
globalThis.document = { documentElement: { lang: "en", dir: "ltr" } };
globalThis.window = { location: { href: "http://localhost/" }, matchMedia: () => ({ matches: true }) };

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  const { default: i18n } = await vite.ssrLoadModule("/src/localization/i18n.js");
  const { default: CategoryTabs } = await vite.ssrLoadModule("/src/features/provider-map/components/CategoryTabs.jsx");
  const { default: MapFilters } = await vite.ssrLoadModule("/src/features/provider-map/components/MapFilters.jsx");
  const { getAllGovernorateCenters } = await vite.ssrLoadModule("/src/features/provider-map/utils/GovernorateCenters.js");
  const { useProvidersMapQuery } = await vite.ssrLoadModule("/src/features/provider-map/hooks/useProvidersMapQuery.js");
  const { useClientLocationsQuery } = await vite.ssrLoadModule("/src/features/provider-map/hooks/usecCientLocationsQuery.js");
  const governorate = getAllGovernorateCenters()[0];
  const queryClient = new QueryClient();

  function QueryProbe({ language }) {
    useProvidersMapQuery({ providerCategoryId: null, governorateId: null, search: "", language });
    useClientLocationsQuery(false, language);
    return null;
  }

  const render = (language) => renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(React.Fragment, null,
        React.createElement(CategoryTabs, { activeCategoryId: null, onChange: () => {} }),
        React.createElement(MapFilters, {
          governorateId: governorate.id,
          onGovernorateChange: () => {},
          search: "",
          onSearchChange: () => {},
        }),
        React.createElement(QueryProbe, { language }),
      ),
    ),
  );

  await i18n.changeLanguage("en");
  const english = render("en");
  assert.match(english, /Search by Provider name or Branch address/);
  assert.match(english, /All/);
  assert.ok(english.includes(`${governorate.nameEn} - ${governorate.nameAr}`));
  assert.ok(queryClient.getQueryCache().find({ queryKey: ["providers-map-data", null, "en"] }));
  assert.ok(queryClient.getQueryCache().find({ queryKey: ["client-locations", "en"] }));

  await i18n.changeLanguage("ar");
  const arabic = render("ar");
  assert.match(arabic, new RegExp(ar["Search by Provider name or Branch address..."]));
  assert.match(arabic, new RegExp(ar.All));
  assert.ok(arabic.includes(`${governorate.nameAr} - ${governorate.nameEn}`));
  assert.ok(queryClient.getQueryCache().find({ queryKey: ["providers-map-data", null, "ar"] }));
  assert.ok(queryClient.getQueryCache().find({ queryKey: ["client-locations", "ar"] }));
  assert.notEqual(i18n.t("Provider", { ns: "providerMap" }), "Provider");
  assert.equal(i18n.t("{{value}} client locations", { ns: "providerMap", keySeparator: false, value: 12 }), "12 موقع مستخدم");
} finally {
  await vite.close();
}

console.log("Provider map localization: English/Arabic filters, raw governorate names, and language-specific query keys passed.");
