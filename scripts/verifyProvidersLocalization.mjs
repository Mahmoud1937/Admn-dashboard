import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import React from 'react';
import axios from 'axios';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';

const data = new Map();
globalThis.localStorage = {
  getItem: (key) => data.get(key) ?? null,
  setItem: (key, value) => data.set(key, String(value)),
  removeItem: (key) => data.delete(key),
};
globalThis.document = { documentElement: { lang: 'en', dir: 'ltr' } };
globalThis.window = { location: { href: 'http://localhost/' }, matchMedia: () => ({ matches: true }) };

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { default: i18n, LANGUAGE_STORAGE_KEY } = await vite.ssrLoadModule('/src/localization/i18n.js');
  const { default: LanguageProvider } = await vite.ssrLoadModule('/src/localization/LanguageProvider.jsx');
  const { default: LocalizedPage } = await vite.ssrLoadModule('/src/localization/LocalizedPage.jsx');
  const { default: useLanguage } = await vite.ssrLoadModule('/src/localization/useLanguage.js');
  const { default: ProvidersFilters } = await vite.ssrLoadModule('/src/features/providers/components/ProvidersFilters.jsx');
  const { default: ProvidersTable } = await vite.ssrLoadModule('/src/features/providers/components/ProvidersTable.jsx');
  const { default: ProvidersPage } = await vite.ssrLoadModule('/src/features/providers/pages/ProvidersPage.jsx');
  const { useProvidersQuery } = await vite.ssrLoadModule('/src/features/providers/hooks/useProvidersQuery.js');
  const { AuthProvider } = await vite.ssrLoadModule('/src/features/auth/context/Authcontext.jsx');
  const { default: axiosInstance, restoreAuthSession } = await vite.ssrLoadModule('/src/shared/api/axiosInstance.js');
  const { getExcelExportErrorMessage, validateExcelExportResponse } = await vite.ssrLoadModule('/src/shared/hooks/useExcelExport.js');

  const verifyExportErrors = async () => {
    const invalidFileMessage = i18n.t('providers:exportInvalidFile');
    const emptyFileMessage = i18n.t('providers:exportEmptyFile');
    const networkErrorMessage = i18n.t('providers:exportError');
    const options = { errorMessage: networkErrorMessage, networkErrorMessage };
    const validationMessages = { invalidFileMessage, emptyFileMessage };
    const networkError = Object.assign(new Error('Network Error'), {
      isAxiosError: true, code: 'ERR_NETWORK', request: {},
    });
    const backendError = Object.assign(new Error('Request failed'), {
      response: { data: { message: 'BACKEND_ERROR_MESSAGE' } },
    });

    await assert.rejects(
      validateExcelExportResponse({ data: new Blob(['{}'], { type: 'application/json' }) }, validationMessages),
      (error) => getExcelExportErrorMessage(error, options) === invalidFileMessage,
    );
    await assert.rejects(
      validateExcelExportResponse({ data: new Blob([]) }, validationMessages),
      (error) => getExcelExportErrorMessage(error, options) === emptyFileMessage,
    );
    await assert.rejects(
      validateExcelExportResponse({ data: new Blob([JSON.stringify({ succeeded: false, message: 'BACKEND_ERROR_MESSAGE' })], { type: 'application/json' }) }, validationMessages),
      (error) => getExcelExportErrorMessage(error, options) === 'BACKEND_ERROR_MESSAGE',
    );
    assert.equal(getExcelExportErrorMessage(networkError, options), networkErrorMessage);
    assert.equal(getExcelExportErrorMessage(Object.assign(new Error('Timeout'), { code: 'ECONNABORTED' }), options), networkErrorMessage);
    assert.equal(getExcelExportErrorMessage(backendError, options), 'BACKEND_ERROR_MESSAGE');
    assert.equal(getExcelExportErrorMessage(networkError, { errorMessage: 'Fallback' }), 'Network Error');
    assert.equal(getExcelExportErrorMessage(Object.assign(new Error('Cancelled'), { code: 'ERR_CANCELED' }), options), 'Cancelled');
    const validBlob = new Blob(['excel-content']);
    assert.equal(await validateExcelExportResponse({ data: validBlob }, validationMessages), validBlob);
  };

  for (const namespace of ['common', 'providers']) {
    const en = JSON.parse(await readFile(`src/localization/locales/en/${namespace}.json`, 'utf8'));
    const ar = JSON.parse(await readFile(`src/localization/locales/ar/${namespace}.json`, 'utf8'));
    assert.deepEqual(Object.keys(en).sort(), Object.keys(ar).sort(), `${namespace} keys differ`);
  }
  const providerTranslations = JSON.parse(await readFile('src/localization/locales/en/providers.json', 'utf8'));
  for (const path of [
    'src/features/providers/pages/ProvidersPage.jsx',
    'src/features/providers/components/ProvidersFilters.jsx',
    'src/features/providers/components/ProvidersHeader.jsx',
    'src/features/providers/components/ProvidersTable.jsx',
  ]) {
    const source = await readFile(path, 'utf8');
    for (const [, key] of source.matchAll(/\bt\("([^"]+)"/g)) {
      assert.ok(Object.hasOwn(providerTranslations, key), `${path}: missing ${key}`);
    }
  }
  assert.match(await readFile('index.html', 'utf8'), /<body lang="en" dir="ltr">/);

  const queryClient = new QueryClient();
  const draft = { status: 0, joinDateFrom: '', joinDateTo: '', categoryId: '', specialistId: '' };
  const provider = {
    id: 123,
    enName: 'DYNAMIC_EN_NAME',
    arName: 'DYNAMIC_AR_NAME',
    categoryName: 'فئة DYNAMIC_CATEGORY_EN',
    specialistNameEn: 'DYNAMIC_SPECIALIST_EN',
    specialistNameAr: 'تخصص',
    isActive: true,
  };
  const render = () => renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(LanguageProvider, null,
        React.createElement(MemoryRouter, null,
          React.createElement(LocalizedPage, null,
            React.createElement(ProvidersFilters, { draft, onChange: () => {}, onApply: () => {}, onClear: () => {}, onClose: () => {} }),
            React.createElement(ProvidersTable, { providers: [provider] })
          )
        )
      )
    )
  );

  await i18n.changeLanguage('en');
  await verifyExportErrors();
  const english = render();
  assert.match(english, /lang="en" dir="ltr"/);
  assert.match(english, /Filters/);
  assert.match(english, /Category/);
  assert.match(english, /DYNAMIC_EN_NAME/);
  assert.match(english, /DYNAMIC_AR_NAME/);
  assert.match(english, /<p dir="ltr"[^>]*>DYNAMIC_EN_NAME<\/p><p dir="rtl"[^>]*>DYNAMIC_AR_NAME<\/p>/);
  assert.match(english, /<p dir="ltr"[^>]*>DYNAMIC_CATEGORY_EN<\/p><p dir="rtl"[^>]*>فئة<\/p>/);
  assert.match(english, /<p dir="ltr"[^>]*>DYNAMIC_SPECIALIST_EN<\/p><p dir="rtl"[^>]*>تخصص<\/p>/);
  assert.match(english, /right:var\(--table-action/);
  window.matchMedia = () => ({ matches: false });
  const englishMobile = render();
  assert.match(englishMobile, /<p dir="ltr"[^>]*>DYNAMIC_EN_NAME<\/p><p dir="rtl"[^>]*>DYNAMIC_AR_NAME<\/p>/);
  assert.match(englishMobile, /<p dir="ltr"[^>]*>DYNAMIC_CATEGORY_EN<\/p><p dir="rtl"[^>]*>فئة<\/p>/);
  assert.match(englishMobile, /<p dir="ltr"[^>]*>DYNAMIC_SPECIALIST_EN<\/p><p dir="rtl"[^>]*>تخصص<\/p>/);
  window.matchMedia = () => ({ matches: true });

  const englishKey = ['providers', 'en', 1, 10, '', draft];
  queryClient.setQueryData(englishKey, { data: { items: [provider], totalCount: 1, totalPages: 1 } });
  function QueryProbe({ language }) {
    const result = useProvidersQuery({ pageNumber: 1, pageSize: 10, search: '', filters: draft, language });
    return React.createElement('span', null, result.providers.map((item) => item.enName).join(','));
  }
  const probe = (language) => renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client: queryClient }, React.createElement(QueryProbe, { language }))
  );
  assert.match(probe('en'), /DYNAMIC_EN_NAME/);
  assert.doesNotMatch(probe('ar'), /DYNAMIC_EN_NAME/);

  let changeAppLanguage;
  function SwitchProbe() {
    changeAppLanguage = useLanguage().changeLanguage;
    return null;
  }
  renderToStaticMarkup(React.createElement(QueryClientProvider, { client: queryClient },
    React.createElement(LanguageProvider, null, React.createElement(SwitchProbe))));
  assert.equal(queryClient.getQueryState(englishKey).isInvalidated, false);
  await changeAppLanguage('ar');
  await verifyExportErrors();
  assert.equal(queryClient.getQueryState(englishKey).isInvalidated, true);
  const arabic = render();
  assert.match(arabic, /lang="ar" dir="rtl"/);
  assert.match(arabic, /عوامل التصفية/);
  assert.match(arabic, /الفئة/);
  assert.match(arabic, /DYNAMIC_EN_NAME/);
  assert.match(arabic, /DYNAMIC_AR_NAME/);
  assert.match(arabic, /<p dir="rtl"[^>]*>DYNAMIC_AR_NAME<\/p><p dir="ltr"[^>]*>DYNAMIC_EN_NAME<\/p>/);
  assert.match(arabic, /<p dir="rtl"[^>]*>فئة<\/p><p dir="ltr"[^>]*>DYNAMIC_CATEGORY_EN<\/p>/);
  assert.match(arabic, /<p dir="rtl"[^>]*>تخصص<\/p><p dir="ltr"[^>]*>DYNAMIC_SPECIALIST_EN<\/p>/);
  assert.match(arabic, /left:var\(--table-action/);
  window.matchMedia = () => ({ matches: false });
  const arabicMobile = render();
  assert.match(arabicMobile, /<p dir="rtl"[^>]*>DYNAMIC_AR_NAME<\/p><p dir="ltr"[^>]*>DYNAMIC_EN_NAME<\/p>/);
  assert.match(arabicMobile, /<p dir="rtl"[^>]*>فئة<\/p><p dir="ltr"[^>]*>DYNAMIC_CATEGORY_EN<\/p>/);
  assert.match(arabicMobile, /<p dir="rtl"[^>]*>تخصص<\/p><p dir="ltr"[^>]*>DYNAMIC_SPECIALIST_EN<\/p>/);
  window.matchMedia = () => ({ matches: true });
  assert.equal(document.documentElement.lang, 'ar');
  assert.equal(document.documentElement.dir, 'rtl');
  assert.equal(localStorage.getItem(LANGUAGE_STORAGE_KEY), 'ar');

  const page = renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client: new QueryClient() },
      React.createElement(LanguageProvider, null,
        React.createElement(AuthProvider, null,
          React.createElement(MemoryRouter, null, React.createElement(ProvidersPage))
        )
      )
    )
  );
  assert.match(page, /دليل مقدمي الخدمة/);
  assert.match(page, /ابحث بالاسم/);
  assert.match(page, /lang="ar" dir="rtl"/);

  const token = `eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify({ exp: 4102444800 })).toString('base64url')}.signature`;
  localStorage.setItem('token', token);
  const headers = [];
  const originalAdapter = axiosInstance.defaults.adapter;
  axiosInstance.defaults.adapter = async (config) => {
    headers.push({
      contentLanguage: config.headers.get('Content-Language'),
      acceptLanguage: config.headers.get('Accept-Language'),
    });
    return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
  };
  try {
    await axiosInstance.get('/admin/providers');
    await changeAppLanguage('en');
    assert.equal(i18n.language, 'en');
    assert.equal(document.documentElement.dir, 'ltr');
    await axiosInstance.get('/admin/providers');
  } finally {
    axiosInstance.defaults.adapter = originalAdapter;
  }
  assert.deepEqual(headers, [
    { contentLanguage: 'ar', acceptLanguage: 'ar' },
    { contentLanguage: 'en', acceptLanguage: 'en' },
  ]);
  const refreshHeaders = [];
  const originalRefreshAdapter = axios.defaults.adapter;
  axios.defaults.adapter = async (config) => {
    refreshHeaders.push({
      contentLanguage: config.headers.get('Content-Language'),
      acceptLanguage: config.headers.get('Accept-Language'),
    });
    return {
      data: { succeeded: true, data: { success: true, token, refreshToken: 'test-refresh-token' } },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  };
  try {
    for (const language of ['ar', 'en']) {
      await changeAppLanguage(language);
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', 'test-refresh-token');
      await restoreAuthSession();
    }
  } finally {
    axios.defaults.adapter = originalRefreshAdapter;
  }
  assert.deepEqual(refreshHeaders, [
    { contentLanguage: 'ar', acceptLanguage: 'ar' },
    { contentLanguage: 'en', acceptLanguage: 'en' },
  ]);
  assert.equal(document.documentElement.dir, 'ltr');
  assert.equal(localStorage.getItem(LANGUAGE_STORAGE_KEY), 'en');
  console.log('Providers localization checks passed');
} finally {
  await vite.close();
}
