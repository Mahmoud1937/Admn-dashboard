import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
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
import Navbar from "../../src/navbar/Navbar";
import AdminNotificationsMenu from "../../src/navbar/AdminNotificationsMenu";
import NumberInput from "../../src/shared/components/NumberInput";
import TextField from "../../src/shared/components/TextField";
import SearchBarWithFilters from "../../src/shared/components/SearchBarWithFilters";
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

let numericSubmission;
// eslint-disable-next-line react-refresh/only-export-components
function NumericInputsHarness() {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { phone: "", card: "", price: "", count: "", quantity: "", name: "" },
  });
  const [numberSearch, setNumberSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const countField = register("count", { valueAsNumber: true });
  return <>
    <form onSubmit={handleSubmit(values => { numericSubmission = values; })}>
      <TextField label="NUMERIC_PHONE" inputMode="numeric" maxLength={11} sanitize={false} {...register("phone")} />
      <NumberInput type="text" maxLength={50} {...register("card")} />
      <TextField label="DECIMAL_PRICE" inputMode="decimal" sanitize={false} {...register("price")} />
      <NumberInput {...countField} onChange={event => {
        if (Number(event.target.value) > 10000) event.target.value = "10000";
        countField.onChange(event);
      }} />
      <NumberInput step="any" {...register("quantity", { valueAsNumber: true })} />
      <TextField label="ORDINARY_NAME" {...register("name")} />
      <button type="submit">SUBMIT_NUMERIC_FIELDS</button>
      <button type="button" onClick={() => reset({ phone: "01234567890", card: "000012345678", price: "5.25", count: 7, quantity: 0.75, name: "Reset name" })}>RESET_NUMERIC_FIELDS</button>
    </form>
    <SearchBarWithFilters numericOnly value={numberSearch} onChange={setNumberSearch} placeholder="NUMERIC_SEARCH" showFilterButton={false} />
    <SearchBarWithFilters value={nameSearch} onChange={setNameSearch} placeholder="MIXED_SEARCH" showFilterButton={false} />
  </>;
}

const changeInput = (input, value) => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
};
const numericKey = (input, key, modifiers = {}) => {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...modifiers });
  input.dispatchEvent(event);
  return event.defaultPrevented;
};
const numericPaste = (input, value) => {
  const clipboardData = new DataTransfer();
  clipboardData.setData("text/plain", value);
  const event = new ClipboardEvent("paste", { clipboardData, bubbles: true, cancelable: true });
  input.dispatchEvent(event);
  return event.defaultPrevented;
};

let failNotificationRead = false;
// eslint-disable-next-line react-refresh/only-export-components
function AdminNotificationsHarness() {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "NEW_TICKET", message: "TICKET_MESSAGE", createdAt: "2026-01-02T13:04:00Z", isRead: false },
    { id: 2, title: "NEW_PROVIDER", message: "PROVIDER_MESSAGE", createdAt: "invalid", isRead: false },
    { id: 3, title: "OLDER_NOTIFICATION", isRead: true },
  ]);
  return <header className="flex h-16 justify-end px-6"><AdminNotificationsMenu
    notifications={notifications}
    onMarkAsRead={async id => {
      if (failNotificationRead) throw new Error("Fixture read failure");
      setNotifications(previous => previous.map(item => item.id === id ? { ...item, isRead: true } : item));
    }}
    onMarkAllAsRead={async () => {
      setNotifications(previous => previous.map(item => ({ ...item, isRead: true })));
    }}
  /></header>;
}

// eslint-disable-next-line react-refresh/only-export-components
function NotificationLocation() {
  return <output data-notification-location>{useLocation().pathname}</output>;
}

// No live backend requests are made by this fixture.
const apiRequests = [];
let adminInboxItems = [];
let adminUnreadCountOverride;
let adminReadOutcome = "success";
let adminReadAllOutcome = "success";
let adminListFailurePage;
axiosInstance.defaults.adapter = async config => {
  apiRequests.push({ url: config.url, method: config.method, body: config.data, language: config.headers.get("Accept-Language"), params: config.params });
  let data = { items: [], totalCount: 0, totalPages: 1 };
  let succeeded = true;
  if (config.url === "admin/notifications/read-all" && config.method === "patch") {
    await new Promise(resolve => setTimeout(resolve, 60));
    succeeded = adminReadAllOutcome !== "error";
    data = adminReadAllOutcome === "invalid" ? false : 0;
    if (succeeded && data === 0) adminInboxItems.forEach(item => { item.isRead = true; });
  }
  const readId = config.url.match(/^admin\/notifications\/([^/]+)\/read$/)?.[1];
  if (readId && config.method === "patch") {
    await new Promise(resolve => setTimeout(resolve, 60));
    succeeded = adminReadOutcome !== "error";
    data = adminReadOutcome === "success";
    if (data) {
      const notification = adminInboxItems.find(item => String(item.id) === decodeURIComponent(readId));
      if (!notification) throw new Error("Unknown fixture notification ID");
      notification.isRead = true;
    }
  }
  if (config.url === "admin/notifications/get-my-notifications") {
    const pageNumber = config.params?.PageNumber ?? 1;
    const pageSize = config.params?.PageSize ?? 10;
    if (pageNumber > 1) await new Promise(resolve => setTimeout(resolve, 120));
    const records = typeof config.params?.IsRead === "boolean"
      ? adminInboxItems.filter(item => item.isRead === config.params.IsRead)
      : adminInboxItems;
    data = { items: records.slice((pageNumber - 1) * pageSize, pageNumber * pageSize), pageNumber, pageSize, totalCount: records.length, totalPages: Math.ceil(records.length / pageSize) };
    if (pageNumber === adminListFailurePage) { succeeded = false; data = null; }
  }
  if (config.url === "admin/notifications/unread-count") data = adminUnreadCountOverride ?? adminInboxItems.filter(item => !item.isRead).length;
  if (/TermsAndConditions|terms-and-conditions|RefundPolicy|refund-policy|PrivacyPolicy|privacy-policy/i.test(config.url)) data = { descriptionEn: "<p>ENGLISH_LEGAL_CONTENT</p>", descriptionAr: "<p>محتوى قانوني عربي</p>" };
  if (/contact/i.test(config.url)) data = { phoneNumber: "01012345678", email: "contact@example.test", whatsApp: "01012345678", faceBook: "https://facebook.com/test" };
  return { data: { succeeded, data }, status: 200, statusText: "OK", headers: {}, config };
};

async function run() {
  // Authentication is local to the fixture and has no real account identity.
  localStorage.setItem("token", `header.${btoa(JSON.stringify({ exp: 4102444800, employeeId: 1 }))}.signature`);
  await i18n.changeLanguage("en");

  await render(<NumericInputsHarness />);
  const numberField = name => document.querySelector(`input[name="${name}"]`);
  for (const name of ["phone", "card", "price", "count", "quantity"]) {
    for (const key of ["a", "ع", "e", "E", "+", "-"]) assert(numericKey(numberField(name), key), `${name} blocks nonnumeric key ${key}`);
    for (const value of ["123abc", "1e2", "1E2"]) assert(numericPaste(numberField(name), value), `${name} blocks mixed/scientific paste ${value}`);
    assert(!numericKey(numberField(name), "a", { ctrlKey: true }) && !numericKey(numberField(name), "v", { metaKey: true }), `${name} preserves keyboard shortcuts`);
    assert(!numericKey(numberField(name), "Backspace") && !numericKey(numberField(name), "ArrowLeft"), `${name} preserves editing keys`);
  }
  assert(numericKey(numberField("phone"), ".") && numericKey(numberField("count"), "."), "Integer and phone inputs block decimal points");
  assert(!numericKey(numberField("price"), ".") && !numericKey(numberField("quantity"), "."), "Price and fractional quantity inputs allow decimal points");
  assert(!numericPaste(numberField("phone"), "01000123000") && !numericPaste(numberField("card"), "000012345678"), "Digit pastes preserve leading zeros");
  assert(numberField("phone").maxLength === 11, "Egyptian mobile fields limit browser input to eleven digits");
  changeInput(numberField("phone"), "010123456789999");
  await pause();
  assert(numberField("phone").value === "01012345678", "Oversized phone input is capped at eleven digits before reaching the form");
  assert(!numericPaste(numberField("price"), "12.50") && !numericPaste(numberField("quantity"), "0.75"), "Decimal inputs accept fractional pastes");
  changeInput(numberField("phone"), "01000abc123000");
  changeInput(numberField("card"), "000012345678");
  changeInput(numberField("price"), "12.");
  assert(numberField("price").value === "12.", "Decimal text input preserves an unfinished fraction while editing");
  changeInput(numberField("price"), "12.50");
  numberField("price").setSelectionRange(5, 5);
  assert(numericKey(numberField("price"), ".") && numericPaste(numberField("price"), ".5"), "A second decimal separator is blocked");
  numberField("price").setSelectionRange(0, 5);
  assert(!numericPaste(numberField("price"), "9.25"), "Selecting and replacing a decimal value remains possible");
  changeInput(numberField("count"), "10001");
  changeInput(numberField("quantity"), "0.75");
  changeInput(numberField("name"), "Client 12");
  changeInput(document.querySelector('input[placeholder="NUMERIC_SEARCH"]'), "001abc23");
  changeInput(document.querySelector('input[placeholder="MIXED_SEARCH"]'), "Client 123");
  await pause();
  assert(numberField("phone").value === "01000123000", "Phone sanitization retains its initial zero");
  assert(document.querySelector('input[placeholder="NUMERIC_SEARCH"]').value === "00123", "Numeric searches sanitize pasted/input values");
  assert(document.querySelector('input[placeholder="MIXED_SEARCH"]').value === "Client 123" && numberField("name").value === "Client 12", "General searches and names continue accepting letters");
  button("SUBMIT_NUMERIC_FIELDS").click();
  await waitFor(() => numericSubmission, "Numeric form submission");
  assert(numericSubmission.phone === "01000123000" && numericSubmission.card === "000012345678", "React Hook Form receives phone and card strings with leading zeros");
  assert(numericSubmission.price === "12.50" && numericSubmission.quantity === 0.75, "React Hook Form receives decimal strings and numeric quantities correctly");
  assert(numericSubmission.count === 10000 && numberField("count").value === "10000", "Count caps update both the visible input and submitted numeric value");
  button("RESET_NUMERIC_FIELDS").click();
  await pause();
  assert(numberField("phone").value === "01234567890" && numberField("price").value === "5.25", "Server/form resets populate numeric fields correctly");
  await changeLanguage("ar");
  assert(numericKey(numberField("phone"), "ع") && numericPaste(numberField("price"), "1e2"), "Numeric restrictions remain active in Arabic");
  await changeLanguage("en");

  await render(<Navbar />, true);
  const bell = () => document.querySelector('button[aria-haspopup="dialog"]');
  const panel = () => document.querySelector('[role="dialog"]');
  assert(bell()?.getAttribute("aria-label") === "Admin notifications", "Navbar contains the admin notification bell without a fake unread badge");
  bell().click();
  await waitFor(panel, "Notification dropdown opens");
  await waitFor(() => text().includes("No notifications yet"), "Empty admin API inbox displays an empty state");
  assert(button("Mark all as read")?.disabled, "Mark all read is disabled when the unread count is zero");
  await changeLanguage("ar");
  assert(panel()?.dir === "rtl" && text().includes("لا توجد إشعارات حاليًا"), "Open notification dropdown follows Arabic language and direction");
  const bounds = panel().getBoundingClientRect();
  assert(bounds.left >= 0 && bounds.right <= window.innerWidth, "Notification panel fits the viewport");
  panel().dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await waitFor(() => !panel(), "Escape closes notification dropdown");
  assert(document.activeElement === bell(), "Closing notifications returns keyboard focus to the bell");
  bell().click();
  await waitFor(panel, "Notification dropdown reopens");
  document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  await waitFor(() => !panel(), "Outside click closes notification dropdown");
  await changeLanguage("en");

  await render(<AdminNotificationsHarness />);
  assert(bell().getAttribute("aria-label").includes("2 unread"), "Notification badge announces the unread count");
  bell().click();
  await waitFor(panel, "Populated notification dropdown opens");
  assert(panel().querySelectorAll("li").length === 3, "All notifications are displayed");
  assert(panel().querySelectorAll("time").length === 1, "Malformed notification dates do not break rendering");
  button("Unread").click();
  await pause();
  assert(panel().querySelectorAll("li").length === 2 && !text().includes("OLDER_NOTIFICATION"), "Unread filter hides read notifications");
  failNotificationRead = true;
  exact("NEW_TICKET").closest("button").click();
  await waitFor(() => text().includes("Couldn't mark notifications as read"), "Read failures surface a localized error");
  assert(bell().getAttribute("aria-label").includes("2 unread"), "Read failure preserves the unread count");
  failNotificationRead = false;
  exact("NEW_TICKET").closest("button").click();
  await waitFor(() => bell().getAttribute("aria-label").includes("1 unread"), "Read action updates the badge after success");
  assert(panel().querySelectorAll("li").length === 1, "Read notification leaves the unread filter");
  button("Mark all as read").click();
  await waitFor(() => text().includes("All caught up!"), "Mark all read clears the unread list");
  assert(bell().getAttribute("aria-label") === "Admin notifications", "Zero unread notifications removes the badge count");
  button("All").click();
  await pause();
  assert(panel().querySelectorAll("li").length === 3, "Mark all read retains notification history");

  await render(<AdminNotificationsMenu key="loading" isLoading />);
  bell().click();
  await waitFor(() => text().includes("Loading notifications..."), "Notification loading state");
  let notificationRetries = 0;
  await render(<AdminNotificationsMenu key="error" error={new Error("Fixture load failure")} onRetry={() => { notificationRetries++; }} />);
  bell().click();
  await waitFor(() => text().includes("Couldn't load notifications"), "Notification error state");
  button("Try again").click();
  assert(notificationRetries === 1, "Notification retry invokes the supplied loader");
  await render(<AdminNotificationsMenu key="capped" unreadCount={125} />);
  assert(bell().textContent.includes("99+") && bell().getAttribute("aria-label").includes("125 unread"), "Large unread badges are capped visually while announcing the full count");

  adminInboxItems = Array.from({ length: 23 }, (_, index) => ({ id: 50 - index, type: "OtherEvent", title: `API_NOTIFICATION_${index}`, isRead: true }));
  adminInboxItems[0] = { id: 5, type: "ManualPrescriptionCreated", referenceId: 60, title: "API_PRESCRIPTION", body: "API_NOTIFICATION_BODY", isRead: false, createdAt: "2026-11-15T11:12:52.7384353" };
  adminInboxItems[10] = { id: 4, type: "OtherEvent", referenceId: 59, title: "OLDER_API_NOTIFICATION", body: "OLDER_API_BODY", isRead: false, createdAt: "2026-11-15T10:40:16.6658843" };
  client.removeQueries({ queryKey: ["admin-notifications"] });
  await render(<><Navbar /><NotificationLocation /></>, true);
  await waitFor(() => bell()?.getAttribute("aria-label").includes("2 unread"), "Connected inbox fetches the total unread count before loading all pages");
  bell().click();
  await waitFor(() => text().includes("API_NOTIFICATION_BODY"), "Connected inbox maps API body into the message");
  assert(panel().querySelector("time") && button("Mark all as read") && !button("Mark all as read").disabled, "API timestamps render and mark-all is available for unread notifications");
  assert(!bell().getAttribute("aria-label").includes("at least"), "Server unread count is exact even with more pages available");
  assert(apiRequests.some(request => request.url === "admin/notifications/unread-count"), "Unread badge uses the dedicated count endpoint");
  assert(!apiRequests.some(request => request.url === "admin/notifications/get-my-notifications" && request.params?.PageSize === 1), "List pagination is not used to calculate the unread badge");
  const scroller = () => panel()?.querySelector('[role="region"]');
  const scrollToEnd = () => { scroller().scrollTop = scroller().scrollHeight; };
  assert(panel().querySelectorAll("li").length === 10 && !panel().querySelector("select") && !panel().querySelector('button[aria-label="Next"]'), "Notification inbox initially shows ten records without page controls");
  adminListFailurePage = 2;
  scrollToEnd();
  await waitFor(() => text().includes("Loading more notifications..."), "Scrolling to the end shows the incremental loading indicator");
  assert(panel().querySelectorAll("li").length === 10 && text().includes("API_NOTIFICATION_BODY"), "Loading more preserves the displayed notifications");
  await waitFor(() => text().includes("Couldn't load more notifications."), "Failed incremental loading offers a retry");
  assert(panel().querySelectorAll("li").length === 10 && bell().getAttribute("aria-label").includes("2 unread"), "Load-more failure preserves records and the total unread count");
  const failedPageRequests = apiRequests.filter(request => request.url === "admin/notifications/get-my-notifications" && request.params?.PageNumber === 2).length;
  await new Promise(resolve => setTimeout(resolve, 180));
  assert(apiRequests.filter(request => request.url === "admin/notifications/get-my-notifications" && request.params?.PageNumber === 2).length === failedPageRequests, "Load-more failure stops automatic retries until requested");
  adminListFailurePage = undefined;
  button("Try again").click();
  await waitFor(() => panel()?.querySelectorAll("li").length === 20, "Retry appends the next notification batch");
  assert(text().includes("API_NOTIFICATION_BODY") && text().includes("OLDER_API_NOTIFICATION"), "Incremental loading retains earlier notifications");
  assert(apiRequests.some(request => request.url === "admin/notifications/get-my-notifications" && request.params?.PageNumber === 2 && request.params.PageSize === 10), "Incremental loading sends the next page number and fixed page size");
  assert(exact("OLDER_API_NOTIFICATION").closest("button")?.title === "Mark as read", "Unknown unread notification types support reading without a navigation destination");
  scrollToEnd();
  await waitFor(() => panel()?.querySelectorAll("li").length === 23, "Scrolling again appends the final partial batch");
  const completedListRequests = apiRequests.filter(request => request.url === "admin/notifications/get-my-notifications").length;
  scrollToEnd();
  await new Promise(resolve => setTimeout(resolve, 180));
  assert(apiRequests.filter(request => request.url === "admin/notifications/get-my-notifications").length === completedListRequests, "All-loaded metadata stops further requests");
  button("Unread").click();
  await waitFor(() => panel()?.querySelectorAll("li").length === 2, "Unread filter loads all matching records from the server");
  assert(apiRequests.some(request => request.url === "admin/notifications/get-my-notifications" && request.params?.IsRead === false && request.params.PageNumber === 1 && request.params.PageSize === 10), "Unread filter starts its own first batch using IsRead=false");
  assert(scroller().scrollTop === 0, "Changing notification filters resets the list scroll position");
  button("All").click();
  await waitFor(() => panel()?.querySelectorAll("li").length === 23, "All filter restores the loaded notification history");
  assert(panel().scrollWidth <= panel().clientWidth, "Incremental notification list fits the dropdown");
  await changeLanguage("ar");
  await waitFor(() => panel()?.querySelectorAll("li").length === 10, "Language switching starts the localized notification list");
  scrollToEnd();
  await waitFor(() => text().includes("جارٍ تحميل المزيد من الإشعارات..."), "Incremental loading indicator follows Arabic translation");
  await waitFor(() => panel()?.querySelectorAll("li").length === 20, "Arabic notifications append on scroll");
  assert(panel().dir === "rtl" && panel().scrollWidth <= panel().clientWidth, "Arabic incremental loading fits the dropdown");
  await changeLanguage("en");
  await waitFor(() => text().includes("API_NOTIFICATION_BODY") && scroller()?.getAttribute("aria-busy") === "false", "Notification list switches back to English");
  for (const outcome of ["error", "false"]) {
    adminReadOutcome = outcome;
    exact("API_PRESCRIPTION").closest("button").focus();
    exact("API_PRESCRIPTION").closest("button").click();
    await pause();
    await waitFor(() => text().includes("Couldn't mark notifications as read") && !exact("API_PRESCRIPTION").closest("button").disabled, `API read failure is displayed for ${outcome} response`);
    assert(document.querySelector("[data-notification-location]").textContent === "/" && bell().getAttribute("aria-label").includes("2 unread"), `Failed ${outcome} response preserves unread count and prevents navigation`);
    assert(adminInboxItems[0].isRead === false, `Failed ${outcome} response leaves the notification unread`);
  }
  adminReadOutcome = "success";
  exact("API_PRESCRIPTION").closest("button").click();
  await waitFor(() => document.querySelector("[data-notification-location]")?.textContent === "/prescriptions/60", "Prescription notification opens its referenced details page");
  assert(!panel(), "Notification navigation closes the dropdown");
  assert(apiRequests.some(request => request.url === "admin/notifications/5/read" && request.method === "patch" && request.body == null), "Read mutation sends PATCH using notification ID rather than prescription reference ID, with no body");
  assert(bell().getAttribute("aria-label").includes("1 unread") && adminInboxItems[0].isRead === true, "Successful read refreshes the unread badge before navigation");
  const readRequestCount = () => apiRequests.filter(request => request.url === "admin/notifications/5/read" && request.method === "patch").length;
  const previousReadRequests = readRequestCount();
  bell().click();
  await waitFor(panel, "Read notification history reopens");
  assert(exact("API_PRESCRIPTION").closest("li").querySelector(".sr-only") === null, "Read notification loses its unread indicator in the full inbox");
  exact("API_PRESCRIPTION").closest("button").click();
  await waitFor(() => !panel(), "Already-read notification opens its details");
  assert(readRequestCount() === previousReadRequests, "Already-read notification does not send a duplicate PATCH");
  bell().click();
  await waitFor(panel, "Unread list reopens");
  button("Unread").click();
  await waitFor(() => panel()?.querySelectorAll("li").length === 1, "Read mutation refreshes the cached unread filter");
  exact("OLDER_API_NOTIFICATION").closest("button").focus();
  exact("OLDER_API_NOTIFICATION").closest("button").click();
  await waitFor(() => text().includes("All caught up!"), "Reading an informational notification removes it from the unread filter");
  assert(panel() && document.querySelector("[data-notification-location]").textContent === "/prescriptions/60", "Reading an informational notification preserves the open menu and current route");
  assert(bell().getAttribute("aria-label") === "Admin notifications", "Reading the final unread notification clears the badge");

  adminInboxItems = Array.from({ length: 11 }, (_, index) => ({ id: 200 + index, type: "OtherEvent", title: index === 10 ? "LAST_PAGE_UNREAD" : `UNREAD_PAGE_ITEM_${index}`, isRead: false }));
  scroller().scrollTop = 0;
  await client.invalidateQueries({ queryKey: ["admin-notifications"] });
  await waitFor(() => panel()?.querySelectorAll("li").length === 10, "Refreshed unread list loads its first batch");
  scrollToEnd();
  await waitFor(() => text().includes("LAST_PAGE_UNREAD"), "Scrolling appends the final unread notification");
  exact("LAST_PAGE_UNREAD").closest("button").focus();
  exact("LAST_PAGE_UNREAD").closest("button").click();
  await waitFor(() => !text().includes("LAST_PAGE_UNREAD") && panel()?.querySelectorAll("li").length === 10, "Reading the final batch item refreshes the remaining unread list");
  assert(bell().getAttribute("aria-label").includes("10 unread"), "Final-page read keeps the server unread count accurate");
  adminUnreadCountOverride = 0;
  await client.invalidateQueries({ predicate: query => query.queryKey[0] === "admin-notifications" && query.queryKey[3] === "unread-count" });
  await waitFor(() => bell()?.getAttribute("aria-label") === "Admin notifications", "Zero returned by the unread-count endpoint clears the badge independently of the current page");
  adminUnreadCountOverride = undefined;
  adminInboxItems = Array.from({ length: 23 }, (_, index) => ({ id: 300 + index, type: "OtherEvent", title: `BULK_READ_ITEM_${index}`, isRead: false }));
  scroller().scrollTop = 0;
  await client.invalidateQueries({ queryKey: ["admin-notifications"] });
  await waitFor(() => text().includes("BULK_READ_ITEM_0") && bell()?.getAttribute("aria-label").includes("23 unread"), "Bulk-read fixture refreshes notifications across multiple batches");
  scrollToEnd();
  await waitFor(() => text().includes("BULK_READ_ITEM_10"), "Bulk-read action is available beyond the first page");
  const markAllButton = () => button("Mark all as read");
  for (const outcome of ["error", "invalid"]) {
    adminReadAllOutcome = outcome;
    markAllButton().focus();
    markAllButton().click();
    await pause();
    await waitFor(() => text().includes("Couldn't mark notifications as read") && !markAllButton()?.disabled, `Bulk-read ${outcome} response offers a retry`);
    assert(panel() && bell().getAttribute("aria-label").includes("23 unread") && adminInboxItems.every(item => !item.isRead), `Bulk-read ${outcome} response preserves the unread list and count`);
  }
  adminReadAllOutcome = "success";
  markAllButton().focus();
  markAllButton().click();
  await pause();
  assert(markAllButton()?.disabled, "Mark all read is disabled while the request is pending");
  const bulkRequestCount = apiRequests.filter(request => request.url === "admin/notifications/read-all").length;
  markAllButton().click();
  assert(apiRequests.filter(request => request.url === "admin/notifications/read-all").length === bulkRequestCount, "Pending bulk-read action prevents duplicate PATCH requests");
  await waitFor(() => text().includes("All caught up!") && bell()?.getAttribute("aria-label") === "Admin notifications", "Successful bulk-read response with data zero clears the unread list and badge");
  assert(apiRequests.some(request => request.url === "admin/notifications/read-all" && request.method === "patch" && request.body == null), "Mark all read sends a single PATCH endpoint with no body");
  assert(adminInboxItems.every(item => item.isRead) && markAllButton()?.disabled, "Bulk read updates every page and disables the action at zero unread");
  assert(panel() && document.querySelector("[data-notification-location]").textContent === "/prescriptions/60", "Bulk read preserves the open dropdown and current route");
  button("All").click();
  await waitFor(() => text().includes("BULK_READ_ITEM_0") && scroller()?.getAttribute("aria-busy") === "false", "Bulk read retains notification history in All");
  assert(panel().querySelectorAll("li .sr-only").length === 0, "Bulk-read history contains no unread indicators");
  adminInboxItems = [];
  adminUnreadCountOverride = undefined;

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
