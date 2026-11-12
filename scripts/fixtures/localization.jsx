import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import i18n from "../../src/localization/i18n";
import LanguageProvider from "../../src/localization/LanguageProvider";
import useLanguage from "../../src/localization/useLanguage";
import LocalizedPage from "../../src/localization/LocalizedPage";
import localizeMessage from "../../src/localization/localizeMessage";
import { AuthProvider } from "../../src/features/auth/context/Authcontext";
import axiosInstance from "../../src/shared/api/axiosInstance";
import InvoicesTable from "../../src/features/invoices/components/InvoicesTable";
import TicketFormModal from "../../src/features/tickets/components/TicketFormModal";
import TicketsBoard from "../../src/features/tickets/components/TicketsBoard";
import NotificationFormModal from "../../src/features/notificationsAdmin/components/NotificationFormModal";
import NotificationImageField from "../../src/features/notificationsAdmin/components/NotificationImageField";
import NotificationPreview from "../../src/shared/components/NotificationPreview";
import TermsAndConditionsEditor from "../../src/features/termsAndConditions/components/Termsandconditionseditor";
import TermsAndConditionsPage from "../../src/features/termsAndConditions/pages/TermsAndConditionsPage";
import RefundPolicyPage from "../../src/features/refundPolicy/pages/RefundPolicyPage";
import PrivacyPolicyPage from "../../src/features/privacyPolicy/pages/PrivacyPolicyPage";
import ContactUsPage from "../../src/features/contactUs/pages/ContactUsPage";
import { ticketSchema } from "../../src/features/tickets/schema/ticketSchema";
import { notificationSchema } from "../../src/features/notificationsAdmin/schema/notificationSchema";
import { getColumnColorName } from "../../src/features/tickets/utils/ticketColors";
import { getApiErrorMessage } from "../../src/shared/helpers/apiErrorHandler";
import "../../src/index.css";

const checks = [];
const assert = (condition, message) => { if (!condition) throw new Error(message); checks.push(message); };
const pause = () => new Promise(resolve => setTimeout(resolve, 30));
const waitFor = async (predicate, message) => {
  for (let attempt = 0; attempt < 200; attempt++) { if (predicate()) return; await pause(); }
  throw new Error(`Timed out: ${message}`);
};
const root = createRoot(document.getElementById("root"));
const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } } });
let switchLanguage;
// This test entry mounts directly instead of exporting an application component.
// eslint-disable-next-line react-refresh/only-export-components
function LanguageController() {
  const { changeLanguage } = useLanguage();
  useEffect(() => { switchLanguage = changeLanguage; }, [changeLanguage]);
  return null;
}
const render = async (element, auth = false) => {
  root.render(<QueryClientProvider client={client}><LanguageProvider><MemoryRouter><LanguageController /><LocalizedPage>{auth ? <AuthProvider>{element}</AuthProvider> : element}</LocalizedPage></MemoryRouter></LanguageProvider></QueryClientProvider>);
  await pause();
  await waitFor(() => typeof switchLanguage === "function", "Language controller initialization");
};
const changeLanguage = async language => { await switchLanguage(language); await pause(); };
const button = text => [...document.querySelectorAll("button")].find(element => element.textContent.trim() === text);
const text = () => document.getElementById("root").textContent;
const exact = value => [...document.querySelectorAll("p,th,label,span,h1,h2,h3")].find(element => element.textContent.trim() === value);
const invoice = { invoiceId: 42, date: "2026-01-02T13:04:00Z", clientId: 3, clientName: "عميل عربي", providerNameEn: "English Provider", providerNameAr: "مقدم خدمة عربي", status: 1, statusName: "Paid", totalAmount: 123, isMedicineInvoice: false, isCash: true };
const ticket = { id: 7, userName: "عميل", ticketType: { enName: "Support", arName: "الدعم" }, priority: 2, priorityName: "High", isClosed: false, assignedToGroup: null };

// No live backend requests are made by this fixture.
const apiRequests = [];
axiosInstance.defaults.adapter = async config => {
  apiRequests.push({ url: config.url, language: config.headers.get("Accept-Language") });
  let data = { items: [], totalCount: 0, totalPages: 1 };
  if (/TermsAndConditions|terms-and-conditions|RefundPolicy|refund-policy|PrivacyPolicy|privacy-policy/i.test(config.url)) data = { descriptionEn: "<p>ENGLISH_LEGAL_CONTENT</p>", descriptionAr: "<p>محتوى قانوني عربي</p>" };
  if (/contact/i.test(config.url)) data = { phoneNumber: "01012345678", email: "contact@example.test", whatsApp: "01012345678", faceBook: "https://facebook.com/test" };
  return { data: { succeeded: true, data }, status: 200, statusText: "OK", headers: {}, config };
};

async function run() {
  // Authentication is local to the fixture and has no real account identity.
  localStorage.setItem("token", `header.${btoa(JSON.stringify({ exp: 4102444800, employeeId: 1 }))}.signature`);
  await i18n.changeLanguage("en");
  await render(<InvoicesTable invoices={[invoice]} isLoading={false} />);
  assert(exact("Invoice") && exact("Client"), "English invoice headers");
  assert(getComputedStyle(exact(invoice.providerNameEn)).textAlign === "left", "English provider name aligns left in English");
  const columns = document.querySelectorAll("col").length;
  await changeLanguage("ar");
  assert(exact("الفاتورة") && exact("العميل"), "Arabic invoice headers");
  for (const name of [invoice.clientName, invoice.providerNameEn, invoice.providerNameAr]) assert(getComputedStyle(exact(name)).textAlign === "right", `Arabic invoice alignment: ${name}`);
  assert(document.querySelector("table").dir === "rtl" && document.querySelectorAll("col").length === columns, "Arabic invoice direction preserves columns");
  await changeLanguage("en");
  assert(document.querySelector("table").dir === "ltr", "Invoice switches back to LTR");

  await render(<TicketFormModal isOpen onClose={() => {}} onSave={() => {}} />);
  await changeLanguage("ar");
  assert(exact("إضافة تذكرة"), "Arabic ticket form labels");
  assert([...document.querySelectorAll("select option")].some(option => option.textContent === "عالية"), "Arabic ticket priorities");
  button("إضافة تذكرة").click();
  await waitFor(() => text().includes(localizeMessage("Description is required")), "Ticket validation");
  assert(!text().includes("Phone number is required"), "Ticket validation renders in Arabic");
  await changeLanguage("en");
  assert(text().includes("Description is required"), "Existing ticket validation follows language change");
  await render(<TicketsBoard tickets={[ticket]} isLoading={false} onViewTicket={() => {}} />);
  await changeLanguage("ar");
  assert(text().includes("عالية") && text().includes("غير مسندة"), "Ticket board priority and unassigned labels");
  assert(getColumnColorName({ id: "2", title: "عالية" }, "priority") === "red", "Ticket priority color survives translation");

  for (const schema of [ticketSchema, notificationSchema]) {
    const invalid = schema.safeParse({ ticketTypeId: "", userId: "", userPhoneNumber: "", priority: "", description: "", title: "", messageEn: "", messageAr: "", isMale: "", governmentId: "", targetType: "", targetId: "", sendMode: "schedule", scheduledAt: "" });
    assert(!invalid.success && invalid.error.issues.every(issue => /[\u0600-\u06ff]/.test(localizeMessage(issue.message))), "All supplied schema failures translate to Arabic");
  }

  await render(<NotificationFormModal open onClose={() => {}} onSubmit={() => {}} />);
  assert(text().includes("اختيار صورة") && !text().includes("For example"), "Arabic notification attachment and hints");
  assert(text().includes("سيُرسل فورًا") && !text().includes("Will be sent immediately"), "Arabic notification delivery summary");
  document.querySelector('input[type="radio"][value="schedule"]').click();
  await pause();
  document.querySelector(`button[aria-label="${localizeMessage("Toggle calendar")}"]`).click();
  await pause();
  const monthName = new Intl.DateTimeFormat("ar-EG", { month: "long" }).format(new Date());
  assert(text().includes(monthName), "Notification calendar uses Arabic month labels");
  await changeLanguage("en");
  assert(text().includes("For example, 3 repeats"), "English notification repeat hint");
  const upload = document.querySelector('input[type="file"]');
  const transfer = new DataTransfer();
  transfer.items.add(new File([new Uint8Array([137,80,78,71])], "sample.png", { type: "image/png" }));
  upload.files = transfer.files;
  upload.dispatchEvent(new Event("change", { bubbles: true }));
  await pause();
  assert(text().includes("sample.png"), "Notification selected filename is displayed");
  await changeLanguage("ar");
  assert(text().includes("sample.png") && text().includes("اختيار صورة"), "Attachment selection survives language switch");
  const removeImage = button("إزالة الصورة");
  assert(removeImage, "Arabic attachment removal action exists");
  removeImage.click();
  await pause();
  assert(text().includes("لم يتم اختيار ملف"), "Arabic attachment removal restores localized empty state");
  await render(<NotificationImageField id="image-check" value={null} onChange={() => {}} error="Image size must not exceed 5 MB." />);
  assert(text().includes(localizeMessage("Image size must not exceed 5 MB.")), "Attachment validation is localized");
  for (const status of [0, 500, 401, 403, 404]) {
    const error = status ? { response: { status } } : new Error("Network Error");
    assert(/[\u0600-\u06ff]/.test(getApiErrorMessage(error, { details: true })), `Arabic API feedback for status ${status}`);
  }
  assert(getApiErrorMessage({ response: { status: 400, data: { message: "SERVER_CONTENT" } } }, { details: true }) === "SERVER_CONTENT", "Unrecognized server content is preserved");

  await render(<NotificationPreview messageEn="ENGLISH_PREVIEW" messageAr="معاينة عربية" />);
  assert(text().includes("معاينة عربية") && !text().includes("ENGLISH_PREVIEW"), "Notification preview defaults to Arabic");
  await changeLanguage("en");
  assert(text().includes("ENGLISH_PREVIEW"), "Notification preview follows live language changes");

  for (const Page of [TermsAndConditionsPage, RefundPolicyPage, PrivacyPolicyPage]) {
    await render(<Page />, true);
    await waitFor(() => text().includes("ENGLISH_LEGAL_CONTENT"), "English legal content");
    assert(!text().includes("محتوى قانوني عربي"), "Legal page opens English content");
    await changeLanguage("ar");
    await waitFor(() => text().includes("محتوى قانوني عربي"), "Arabic legal content");
    assert(!text().includes("ENGLISH_LEGAL_CONTENT"), "Legal page switches to Arabic without refresh");
    await changeLanguage("en");
  }
  await render(<ContactUsPage />, true);
  await waitFor(() => text().includes("contact@example.test"), "Contact content");
  await changeLanguage("ar");
  await waitFor(() => text().includes("اتصل بنا"), "Arabic contact labels");
  assert(document.documentElement.dir === "rtl" && document.body.dir === "rtl", "Document and body direction follow Arabic");
  assert(exact("contact@example.test").querySelector("bdi")?.dir === "ltr" || document.querySelector('bdi[dir="ltr"]'), "Contact addresses retain LTR isolation");

  await render(<TermsAndConditionsEditor initialValue={{ en: "<p>ENGLISH_DRAFT</p>", ar: "<p>مسودة عربية</p>" }} canUpdate onSave={() => {}} />);
  await waitFor(() => text().includes("مسودة عربية"), "Editor initializes");
  button("تحديث").click();
  await pause();
  const editor = document.querySelector('[contenteditable="true"]');
  editor.innerHTML = "<p>مسودة محفوظة أثناء تغيير اللغة</p>";
  editor.dispatchEvent(new Event("input", { bubbles: true }));
  await changeLanguage("en");
  await changeLanguage("ar");
  assert(document.querySelector('[contenteditable="true"]').textContent.includes("مسودة محفوظة"), "Language switching preserves unsaved legal edits");
  assert(apiRequests.some(request => request.language === "ar") && apiRequests.some(request => request.language === "en"), "Requests refresh with the active language");
  root.unmount();
  client.clear();
  return checks;
}

run().then(result => {
  document.getElementById("results").textContent = JSON.stringify({ status: "passed", checks: result });
  window.__localizationResult = { status: "passed", checks: result };
}).catch(error => {
  document.getElementById("results").textContent = error.stack;
  window.__localizationResult = { status: "failed", error: error.stack, checks, buttons: [...document.querySelectorAll("button")].map(element => element.textContent.trim()) };
});
