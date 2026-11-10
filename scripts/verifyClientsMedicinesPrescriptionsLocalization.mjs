import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createServer } from "vite";

const resources = Object.fromEntries(["clients", "medicines", "prescriptions"].map((name) => {
  const en = JSON.parse(readFileSync(`src/localization/locales/en/${name}.json`, "utf8"));
  const ar = JSON.parse(readFileSync(`src/localization/locales/ar/${name}.json`, "utf8"));
  assert.deepEqual(Object.keys(en).sort(), Object.keys(ar).sort());
  return [name, { en, ar }];
}));

for (const [namespace, directory] of Object.entries({
  clients: "src/features/clients",
  medicines: "src/features/Medicines",
  prescriptions: "src/features/prescriptions",
})) {
  const visit = (folder) => {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const path = join(folder, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (/\.[jt]sx?$/.test(path)) {
        const source = readFileSync(path, "utf8");
        for (const [, , key] of source.matchAll(/\bt\(\s*(["'])([^\r\n]*?)\1/g)) {
          assert.ok(Object.hasOwn(resources[namespace].ar, key), `Missing ${namespace} translation for ${key} in ${path}`);
        }
      }
    }
  };
  visit(directory);
}

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
  const { default: ClientsPage } = await vite.ssrLoadModule("/src/features/clients/pages/ClientsPage.jsx");
  const { default: ClientsFiltersPanel } = await vite.ssrLoadModule("/src/features/clients/components/ClientsFiltersPanel.jsx");
  const { default: ClientDetailsPage } = await vite.ssrLoadModule("/src/features/clients/pages/ClientDetailsPage.jsx");
  const { default: InvoiceDetailsModal } = await vite.ssrLoadModule("/src/features/clients/components/InvoiceDetailsModal.jsx");
  const { default: MedicinesPage } = await vite.ssrLoadModule("/src/features/Medicines/pages/Medicinespage.jsx");
  const { default: MedicineFormModal } = await vite.ssrLoadModule("/src/features/Medicines/components/Medicineformmodal.jsx");
  const { medicineSchema } = await vite.ssrLoadModule("/src/features/Medicines/schema/medicineSchema.js");
  const { default: PrescriptionsPage } = await vite.ssrLoadModule("/src/features/prescriptions/pages/PrescriptionsPage.jsx");
  const { default: PrescriptionDetailsPage } = await vite.ssrLoadModule("/src/features/prescriptions/pages/PrescriptionDetailsPage.jsx");

  globalThis.document = { documentElement: { lang: "en", dir: "ltr" } };
  globalThis.window = { location: { href: "http://localhost/" }, matchMedia: () => ({ matches: true }) };

  const queryClient = new QueryClient();
  const client = { clientId: 42, firstName: "RAW_FIRST", lastName: "RAW_LAST", userName: "RAW_CLIENT", phoneNumber: "01234567890", isMale: true, isBlocked: false, addresses: [] };
  const medicine = { id: 7, enName: "RAW_EN_MEDICINE", arName: "RAW_AR_MEDICINE", medicinePrice: 12.5, medicineForm: "RAW_FORM", unit: "Box", isLocal: true };
  const prescription = { id: 88, customerId: 42, customerFullName: "RAW_CUSTOMER", phoneNumber: "01234567890", text: "RAW_PRESCRIPTION_TEXT", status: "Pending", items: [] };
  const listResponse = (item) => ({ data: { items: [item], totalCount: 1, totalPages: 1 } });
  const clientsKey = (language) => ["clients", language, { pageNumber: 1, pageSize: 20 }];
  const medicinesKey = (language) => ["medicines", language, 1, 20, "", undefined];
  const prescriptionsKey = (language) => ["manual-prescriptions", language, 1, 10, "", ""];
  const clientDetailsKey = (language) => ["client", language, "42"];
  const prescriptionDetailsKey = (language) => ["manual-prescriptions", "details", language, "88"];

  const renderRoute = (Page, path, route = path) => renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(LanguageProvider, null,
        React.createElement(AuthProvider, null,
          React.createElement(MemoryRouter, { initialEntries: [path] },
            React.createElement(Routes, null,
              React.createElement(Route, { path: route, element: React.createElement(Page) }),
            ),
          ),
        ),
      ),
    ),
  );
  const renderComponent = (Component, props) => renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(Component, props),
    ),
  );
  const renderModal = () => renderComponent(MedicineFormModal, { isOpen: true, onSave: () => {}, onClose: () => {}, isSaving: false });

  queryClient.setQueryData(clientsKey("en"), listResponse(client));
  queryClient.setQueryData(medicinesKey("en"), listResponse(medicine));
  queryClient.setQueryData(prescriptionsKey("en"), listResponse(prescription));
  queryClient.setQueryData(clientDetailsKey("en"), { data: client });
  queryClient.setQueryData(prescriptionDetailsKey("en"), prescription);
  await i18n.changeLanguage("en");

  const englishClients = renderRoute(ClientsPage, "/clients");
  const englishMedicines = renderRoute(MedicinesPage, "/medicines");
  const englishPrescriptions = renderRoute(PrescriptionsPage, "/prescriptions");
  assert.match(englishClients, /lang="en" dir="ltr"/);
  assert.match(englishMedicines, /Medicines Management/);
  assert.match(englishPrescriptions, /Review manual prescriptions/);
  assert.match(englishClients, /RAW_CLIENT/);
  assert.match(englishMedicines, /RAW_EN_MEDICINE/);
  assert.match(englishPrescriptions, /RAW_PRESCRIPTION_TEXT/);
  assert.match(renderRoute(ClientDetailsPage, "/clients/42", "/clients/:clientId"), /RAW_FIRST RAW_LAST/);
  assert.match(renderRoute(PrescriptionDetailsPage, "/prescriptions/88", "/prescriptions/:manualPrescriptionId"), /RAW_CUSTOMER/);
  assert.match(renderModal(), /Add Medicine/);

  const invalidMedicine = medicineSchema.safeParse({ enName: "A", arName: "x", medicinePrice: "", medicineForm: "", unit: "", isLocal: "", isActive: true });
  assert.equal(invalidMedicine.success, false);
  for (const issue of invalidMedicine.error.issues) {
    assert.ok(Object.hasOwn(resources.medicines.ar, issue.message), `Untranslated medicine validation: ${issue.message}`);
    assert.notEqual(resources.medicines.ar[issue.message], issue.message);
  }

  await i18n.changeLanguage("ar");
  for (const [Page, path, raw] of [[ClientsPage, "/clients", "RAW_CLIENT"], [MedicinesPage, "/medicines", "RAW_EN_MEDICINE"], [PrescriptionsPage, "/prescriptions", "RAW_PRESCRIPTION_TEXT"]]) {
    const loading = renderRoute(Page, path);
    assert.match(loading, /lang="ar" dir="rtl"/);
    assert.doesNotMatch(loading, new RegExp(raw));
  }
  assert.doesNotMatch(renderRoute(ClientDetailsPage, "/clients/42", "/clients/:clientId"), /RAW_FIRST/);
  assert.doesNotMatch(renderRoute(PrescriptionDetailsPage, "/prescriptions/88", "/prescriptions/:manualPrescriptionId"), /RAW_CUSTOMER/);
  queryClient.setQueryData(clientsKey("ar"), listResponse(client));
  queryClient.setQueryData(medicinesKey("ar"), listResponse(medicine));
  queryClient.setQueryData(prescriptionsKey("ar"), listResponse(prescription));
  queryClient.setQueryData(clientDetailsKey("ar"), { data: client });
  queryClient.setQueryData(prescriptionDetailsKey("ar"), prescription);

  const arabicClients = renderRoute(ClientsPage, "/clients");
  const arabicMedicines = renderRoute(MedicinesPage, "/medicines");
  const arabicPrescriptions = renderRoute(PrescriptionsPage, "/prescriptions");
  assert.match(arabicClients, new RegExp(resources.clients.ar.Clients));
  assert.match(arabicMedicines, new RegExp(resources.medicines.ar["Medicines Management"]));
  assert.match(arabicPrescriptions, new RegExp(resources.prescriptions.ar.Prescriptions));
  assert.match(arabicPrescriptions, /<option value="Pending">قيد الانتظار<\/option>/);
  assert.match(arabicPrescriptions, />Pending<\/span>/);
  for (const [markup, raw] of [[arabicClients, "RAW_CLIENT"], [arabicMedicines, "RAW_EN_MEDICINE"], [arabicMedicines, "RAW_AR_MEDICINE"], [arabicPrescriptions, "RAW_PRESCRIPTION_TEXT"]]) {
    assert.ok(markup.includes(raw), `Backend value changed: ${raw}`);
  }
  assert.ok(arabicMedicines.indexOf("RAW_AR_MEDICINE") < arabicMedicines.indexOf("RAW_EN_MEDICINE"));
  assert.match(renderRoute(ClientDetailsPage, "/clients/42", "/clients/:clientId"), new RegExp(resources.clients.ar["Client Details"]));
  assert.match(renderRoute(PrescriptionDetailsPage, "/prescriptions/88", "/prescriptions/:manualPrescriptionId"), new RegExp(resources.prescriptions.ar["Prescription image"]));
  assert.match(renderModal(), new RegExp(resources.medicines.ar["Add Medicine"]));
  assert.equal(queryClient.getQueryData(medicinesKey("ar")).data.items[0].enName, "RAW_EN_MEDICINE");

  const filters = renderComponent(ClientsFiltersPanel, { draft: { platformType: "", isMale: "", hasCard: "" }, onChange: () => {}, onApply: () => {}, onClear: () => {}, onClose: () => {} });
  assert.match(filters, new RegExp(resources.clients.ar.Platform));
  assert.match(filters, new RegExp(resources.clients.ar["All genders"]));
  queryClient.setQueryData(["client-family-members", "ar", 42], { data: [{ id: 3, fullName: "RAW_FAMILY", relation: "RAW_RELATION" }] });
  const family = renderRoute(ClientDetailsPage, "/clients/42?tab=family", "/clients/:clientId");
  assert.match(family, /RAW_FAMILY/);
  assert.match(family, /RAW_RELATION/);

  const invoice = renderComponent(InvoiceDetailsModal, {
    isOpen: true, onClose: () => {}, isLoading: false,
    invoice: { invoiceId: 55, status: 1, statusLabel: "RAW_STATUS", isMedicineInvoice: false, totalAfter: 12.5,
      services: [{ id: 1, serviceNameEn: "RAW_EN_SERVICE", serviceNameAr: "RAW_AR_SERVICE", priceAfter: 12.5 }] },
  });
  assert.match(invoice, /RAW_STATUS/);
  assert.ok(invoice.indexOf("RAW_AR_SERVICE") < invoice.indexOf("RAW_EN_SERVICE"));
  assert.match(invoice, /12\.50 EGP/);

  const processForm = renderRoute(PrescriptionDetailsPage, "/prescriptions/88?action=process", "/prescriptions/:manualPrescriptionId");
  const rejectForm = renderRoute(PrescriptionDetailsPage, "/prescriptions/88?action=reject", "/prescriptions/:manualPrescriptionId");
  assert.match(processForm, new RegExp(resources.prescriptions.ar["Process prescription"]));
  assert.match(rejectForm, new RegExp(resources.prescriptions.ar["Explain why this prescription is being rejected"]));

  await i18n.changeLanguage("en");
  assert.match(renderRoute(PrescriptionsPage, "/prescriptions"), /lang="en" dir="ltr"/);
} finally {
  await vite.close();
}

console.log("Clients, medicines, and prescriptions localization: English/Arabic pages, details, RTL/LTR, language caches, and raw API values passed.");
