import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createServer } from "vite";

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};
globalThis.document = {
  documentElement: { lang: "en", dir: "ltr" },
  createElement: () => ({ firstChild: { data: "" } }),
  head: { appendChild: (element) => { element.parentNode = document.head; } },
};
globalThis.window = { location: { href: "http://localhost/" }, matchMedia: () => ({ matches: false }) };

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  const { default: i18n } = await vite.ssrLoadModule("/src/localization/i18n.js");
  const { default: LanguageProvider } = await vite.ssrLoadModule("/src/localization/LanguageProvider.jsx");
  const { AuthProvider } = await vite.ssrLoadModule("/src/features/auth/context/Authcontext.jsx");
  const { default: DashboardLayout } = await vite.ssrLoadModule("/src/layout/DashboardLayout.jsx");
  const { default: SidebarItem } = await vite.ssrLoadModule("/src/sidebar/SidebarItem.jsx");
  const { default: SidebarGroup } = await vite.ssrLoadModule("/src/sidebar/SidebarGroup.jsx");
  const { default: ChangePasswordModal } = await vite.ssrLoadModule("/src/features/auth/components/ChangePasswordModal.jsx");
  const { navigation } = await vite.ssrLoadModule("/src/sidebar/navigation.js");
  const {
    loginSchema, localizedLoginSchema,
    changePasswordSchema, localizedChangePasswordSchema,
  } = await vite.ssrLoadModule("/src/features/auth/schema/loginSchema.js");
  const { handleMutationError } = await vite.ssrLoadModule("/src/shared/utils/handleMutationError.js");
  const { default: axiosInstance } = await vite.ssrLoadModule("/src/shared/api/axiosInstance.js");
  const { login } = await vite.ssrLoadModule("/src/features/auth/services/Authservice.js");
  const { default: toast } = await import("react-hot-toast");

  for (const namespace of ["login", "sidebar", "navbar"]) {
    const en = JSON.parse(await readFile(`src/localization/locales/en/${namespace}.json`, "utf8"));
    const ar = JSON.parse(await readFile(`src/localization/locales/ar/${namespace}.json`, "utf8"));
    assert.deepEqual(Object.keys(en).sort(), Object.keys(ar).sort(), `${namespace} translation keys differ`);
  }
  for (const item of navigation) {
    for (const page of [item, ...(item.children ?? [])]) {
      assert.equal(i18n.t(page.path, { ns: "sidebar" }), page.title, `${page.path} English label changed`);
      assert.notEqual(i18n.getResource("ar", "sidebar", page.path), undefined, `${page.path} Arabic label missing`);
    }
  }

  assert.equal(loginSchema.safeParse({ identifier: "", password: "" }).error.issues[0].message, "Enter your email address.");
  assert.equal(localizedLoginSchema.safeParse({ identifier: "", password: "" }).error.issues[0].message, "validationEmailRequired");
  assert.equal(localizedLoginSchema.safeParse({ identifier: "bad", password: "ok" }).error.issues[0].message, "validationEmailInvalid");
  assert.equal(localizedLoginSchema.safeParse({ identifier: "a@b.com", password: "" }).error.issues[0].message, "validationPasswordRequired");
  assert.equal(changePasswordSchema.safeParse({ currentPassword: "", newPassword: "", confirmNewPassword: "" }).error.issues[0].message, "Enter your current password.");
  assert.equal(localizedChangePasswordSchema.safeParse({ currentPassword: "", newPassword: "", confirmNewPassword: "" }).error.issues[0].message, "validationCurrentRequired");
  assert.equal(localizedChangePasswordSchema.safeParse({ currentPassword: "old123", newPassword: "new123", confirmNewPassword: "wrong1" }).error.issues[0].message, "validationPasswordsMismatch");
  assert.equal(localizedChangePasswordSchema.safeParse({ currentPassword: "same123", newPassword: "same123", confirmNewPassword: "same123" }).error.issues[0].message, "validationNewMustDiffer");

  const originalToastError = toast.error;
  const shownMessages = [];
  let fieldErrors;
  toast.error = (message) => shownMessages.push(message);
  try {
    const saveErrors = (value) => { fieldErrors = value; };
    handleMutationError(new Error("Network Error"), "fallback", saveErrors);
    assert.equal(shownMessages.pop(), "Unable to connect to the server. Please check your internet connection and try again.");
    handleMutationError(new Error("Network Error"), "fallback", saveErrors, { networkError: "رسالة الشبكة" });
    assert.equal(shownMessages.pop(), "رسالة الشبكة");
    handleMutationError({ response: { status: 500 } }, "fallback", saveErrors, { serverError: "رسالة الخادم" });
    assert.equal(shownMessages.pop(), "رسالة الخادم");
    handleMutationError({ response: { status: 400, data: { message: "BACKEND_MESSAGE" } } }, "fallback", saveErrors, { networkError: "رسالة الشبكة" });
    assert.equal(shownMessages.pop(), "BACKEND_MESSAGE");
    const backendErrors = { identifier: ["BACKEND_FIELD_ERROR"] };
    handleMutationError({ response: { status: 400, data: { errors: backendErrors } } }, "fallback", saveErrors, { networkError: "رسالة الشبكة" });
    assert.equal(fieldErrors, backendErrors);
  } finally {
    toast.error = originalToastError;
  }

  const queryClient = new QueryClient();
  const providerGroup = navigation.find((item) => item.path === "/providers");
  const dashboardItem = navigation.find((item) => item.path === "/");
  const render = () => renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(LanguageProvider, null,
        React.createElement(AuthProvider, null,
          React.createElement(MemoryRouter, { initialEntries: ["/"] },
            React.createElement(React.Fragment, null,
              React.createElement(Routes, null,
                React.createElement(Route, { path: "/", element: React.createElement(DashboardLayout) },
                  React.createElement(Route, { index: true, element: React.createElement("div", null, "UNMIGRATED_PAGE_CONTENT") })
                )
              ),
              React.createElement(SidebarItem, { ...dashboardItem, collapsed: false }),
              React.createElement(SidebarGroup, { ...providerGroup, collapsed: false })
            )
          )
        )
      )
    )
  );
  const renderModal = (localized) => renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(LanguageProvider, null,
        React.createElement(AuthProvider, null,
          React.createElement(MemoryRouter, null,
            React.createElement(ChangePasswordModal, { localized, onClose: () => {} })
          )
        )
      )
    )
  );

  await i18n.changeLanguage("en");
  const enMarkup = render();
  assert.match(enMarkup, /<aside lang="en" dir="ltr"/);
  assert.match(enMarkup, /<nav id="sidebar-navigation"[^>]*dir="ltr"[^>]*class="flex-1 space-y-1 overflow-y-auto p-4"/);
  assert.match(enMarkup, /<main dir="ltr" class="flex-1 overflow-y-auto p-4 md:p-8"><div dir="ltr" class="contents">/);
  assert.match(enMarkup, /<header lang="en" dir="ltr"/);
  assert.doesNotMatch(enMarkup, /flex-row-reverse/);
  assert.match(enMarkup, />Dashboard</);
  assert.match(enMarkup, />Providers</);
  assert.match(enMarkup, /UNMIGRATED_PAGE_CONTENT/);
  assert.match(renderModal(true), /Change Password/);
  assert.match(renderModal(true), /Current Password/);

  await i18n.changeLanguage("ar");
  const arMarkup = render();
  assert.match(arMarkup, /flex-row-reverse/);
  assert.match(arMarkup, /<aside lang="ar" dir="rtl"/);
  assert.match(arMarkup, /<nav id="sidebar-navigation"[^>]*dir="rtl"[^>]*class="flex-1 space-y-1 overflow-y-auto p-4"/);
  assert.match(arMarkup, /<main dir="rtl" class="flex-1 overflow-y-auto p-4 md:p-8"><div dir="ltr" class="contents">/);
  assert.match(arMarkup, /<header lang="ar" dir="rtl"/);
  assert.match(arMarkup, />لوحة المعلومات</);
  assert.match(arMarkup, />مقدمو الخدمة</);
  assert.match(arMarkup, /UNMIGRATED_PAGE_CONTENT/);
  assert.equal(document.documentElement.dir, "rtl");
  const arabicModal = renderModal(true);
  assert.match(arabicModal, /lang="ar" dir="rtl"/);
  assert.match(arabicModal, /تغيير كلمة المرور/);
  assert.match(arabicModal, /كلمة المرور الحالية/);
  const defaultModal = renderModal(false);
  assert.match(defaultModal, /Change Password/);
  assert.doesNotMatch(defaultModal, /lang="ar" dir="rtl"/);

  await i18n.changeLanguage("en");
  assert.equal(document.documentElement.dir, "ltr");
  const originalAdapter = axiosInstance.defaults.adapter;
  const loginHeaders = [];
  axiosInstance.defaults.adapter = async (config) => {
    loginHeaders.push({
      contentLanguage: config.headers.get("Content-Language"),
      acceptLanguage: config.headers.get("Accept-Language"),
    });
    return { data: { message: "BACKEND_MESSAGE" }, status: 200, statusText: "OK", headers: {}, config };
  };
  try {
    for (const language of ["en", "ar", "en"]) {
      await i18n.changeLanguage(language);
      const response = await login({ email: "test@example.com", password: "test" });
      assert.equal(response.data.message, "BACKEND_MESSAGE");
    }
  } finally {
    axiosInstance.defaults.adapter = originalAdapter;
  }
  assert.deepEqual(loginHeaders, [
    { contentLanguage: "en", acceptLanguage: "en" },
    { contentLanguage: "ar", acceptLanguage: "ar" },
    { contentLanguage: "en", acceptLanguage: "en" },
  ]);
  console.log("Login, Sidebar, and Navbar localization checks passed");
} finally {
  await vite.close();
}
