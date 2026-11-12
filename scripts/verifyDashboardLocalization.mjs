import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createServer } from "vite";

const en = JSON.parse(readFileSync("src/localization/locales/en/dashboard.json", "utf8"));
const ar = JSON.parse(readFileSync("src/localization/locales/ar/dashboard.json", "utf8"));
const leafKeys = (value, prefix = "") => Object.entries(value).flatMap(([key, item]) =>
  item && typeof item === "object" && !Array.isArray(item)
    ? leafKeys(item, `${prefix}${key}.`)
    : [`${prefix}${key}`]);
assert.deepEqual(leafKeys(en).sort(), leafKeys(ar).sort());
assert.equal(en.weekdays.length, 7);
assert.equal(ar.weekdays.length, 7);
const resourceValue = (resource, key) => key.split(".").reduce((item, part) => item?.[part], resource);
for (const path of [
  "src/features/dashboard/pages/DashboardPage.jsx",
  "src/features/dashboard/components/StatCards.jsx",
  "src/features/dashboard/components/DashboardCharts.jsx",
]) {
  const source = readFileSync(path, "utf8");
  const keys = [
    ...[...source.matchAll(/\bt\("([^"]+)"/g)].map((match) => match[1]),
    ...[...source.matchAll(/\bkey: "(charts\.[^"]+)"/g)].map((match) => match[1]),
  ];
  for (const key of keys) {
    assert.notEqual(resourceValue(en, key), undefined, `${path}: missing English ${key}`);
    assert.notEqual(resourceValue(ar, key), undefined, `${path}: missing Arabic ${key}`);
  }
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
  const { default: DashboardPage } = await vite.ssrLoadModule("/src/features/dashboard/pages/DashboardPage.jsx");
  const { useDashboard } = await vite.ssrLoadModule("/src/features/dashboard/hooks/useDashboard.js");
  const { useDashboardChart } = await vite.ssrLoadModule("/src/features/dashboard/hooks/useDashboardChart.js");
  globalThis.document = { documentElement: { lang: "en", dir: "ltr" } };
  globalThis.window = { matchMedia: () => ({ matches: true }) };
  const queryClient = new QueryClient();
  const today = new Date().toLocaleDateString("en-CA");
  const summaryFilters = { fromDate: new Date(`${today}T00:00:00`).toISOString(), toDate: new Date(`${today}T23:59:59`).toISOString() };
  const chartView = { groupBy: 1, year: new Date().getFullYear() };
  const summaryData = { soldCards: { totalAmount: 1234.5, count: 1234 }, activatedCards: { totalAmount: 50, count: 1 }, providers: { providersCount: 3, branchesCount: 4 }, invoices: { totalAmount: 10, count: 5 } };
  const chartData = { invoiceInfo: { data: [], totalAmount: 10, totalCount: 5 }, soldCardsInfo: { data: [], totalCount: 2 }, providerInfo: { data: [], totalCount: 3 }, branchInfo: { data: [], totalCount: 4 } };
  for (const language of ["en", "ar"]) {
    queryClient.setQueryData(["dashboard", summaryFilters, language], summaryData);
    queryClient.setQueryData(["dashboard-chart", chartView, language], chartData);
  }
  const render = () => renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(LanguageProvider, null, React.createElement(DashboardPage)),
    ),
  );

  await i18n.changeLanguage("en");
  const english = render();
  assert.match(english, /lang="en" dir="ltr"/);
  assert.match(english, /Performance summary/);
  assert.match(english, /Operational trends/);
  assert.match(english, /By month/);
  assert.match(english, /Cards activated/);
  assert.match(english, /Invoice Performance/);
  assert.match(english, /1,234\.50 EGP/);
  await i18n.changeLanguage("ar");
  const arabic = render();
  assert.match(arabic, /lang="ar" dir="rtl"/);
  assert.match(arabic, /ملخص الأداء/);
  assert.match(arabic, /الاتجاهات التشغيلية/);
  assert.match(arabic, /التجميع حسب/);
  assert.match(arabic, /البطاقات المفعلة/);
  assert.match(arabic, /أداء الفواتير/);
  assert.match(arabic, /لا توجد بيانات للرسم البياني/);
  assert.match(arabic, /1,234\.50 ج\.م/);
  assert.match(arabic, /1,234/);
  assert.match(arabic, /<bdi dir="ltr">1,234\.50 ج\.م<\/bdi>/);
  assert.match(arabic, /<bdi dir="ltr">10\.00 ج\.م \/ 5<\/bdi>/);
  assert.doesNotMatch(arabic, />Performance summary</);
  await i18n.changeLanguage("en");
  assert.match(render(), /lang="en" dir="ltr"/);

  const filters = { fromDate: "2026-01-01", toDate: "2026-01-31" };
  const chartFilters = { groupBy: 1, year: 2026 };
  const rawSummary = { soldCards: { count: 42 } };
  const rawChart = { invoiceInfo: { data: [{ period: 1, labelEn: "RAW_EN_MONTH", labelAr: "RAW_AR_MONTH" }] } };
  queryClient.setQueryData(["dashboard", filters, "en"], rawSummary);
  queryClient.setQueryData(["dashboard-chart", chartFilters, "en"], rawChart);
  function CacheProbe({ language }) {
    const summary = useDashboard(filters, false, language);
    const chart = useDashboardChart(chartFilters, language);
    return React.createElement("span", null, `${summary.data?.soldCards?.count ?? "empty"}:${chart.data?.invoiceInfo?.data?.[0]?.labelEn ?? "empty"}`);
  }
  const probe = (language) => renderToStaticMarkup(React.createElement(QueryClientProvider, { client: queryClient }, React.createElement(CacheProbe, { language })));
  assert.match(probe("en"), />42:RAW_EN_MONTH</);
  assert.match(probe("ar"), />empty:empty</);
  assert.deepEqual(queryClient.getQueryData(["dashboard-chart", chartFilters, "en"]), rawChart);
} finally {
  await vite.close();
}

console.log("Dashboard localization: English/Arabic render, RTL/LTR, and language-separated query cache passed.");
