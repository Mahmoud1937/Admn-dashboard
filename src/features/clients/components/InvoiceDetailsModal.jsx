import { useEffect, useId, useRef, useState } from "react";
import { Calendar, Tag, CheckCircle2, Clock, XCircle, X, Pill, Users } from "lucide-react";
import { SkeletonText } from "../../../shared/components/Skeleton";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import { getApiErrorMessage } from "../../../shared/helpers/apiErrorHandler";
import { getMedicineUnitName } from "../../Medicines/constants/medicineUnits";
import useClientsText from "../../../localization/useClientsText";
import useLanguage from "../../../localization/useLanguage";

const STATUS_STYLE = {
  paid: { badge: "bg-blue-50 text-blue-600", icon: Calendar, iconWrap: "bg-blue-50", iconColor: "text-blue-600", label: "Paid", message: "Payment received." },
  pending: { badge: "bg-amber-50 text-amber-600", icon: Clock, iconWrap: "bg-amber-50", iconColor: "text-amber-600", label: "Pending", message: "Awaiting payment." },
  canceled: { badge: "bg-red-50 text-red-600", icon: XCircle, iconWrap: "bg-red-50", iconColor: "text-red-600", label: "Canceled", message: "This invoice has been canceled." },
  used: { badge: "bg-emerald-50 text-emerald-600", icon: CheckCircle2, iconWrap: "bg-emerald-50", iconColor: "text-emerald-600", label: "Used", message: "This invoice has been used." },
};
const STATUS_NAMES = { 1: "paid", 2: "pending", 3: "canceled", 4: "used" };
const UNKNOWN_STATUS = { badge: "bg-slate-100 text-slate-600", icon: Calendar, iconWrap: "bg-slate-100", iconColor: "text-slate-500" };

function formatDate(value) {
  if (!value || String(value).startsWith("0001")) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-GB");
}

function formatMoney(value) {
  if (value == null || value === "" || !Number.isFinite(Number(value))) return "-";
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function InvoiceStat({ label, icon: Icon, children }) {
  return (
    <div className="text-center">
      <div className="mb-1.5 flex items-center justify-center gap-1.5 text-sm text-slate-400">
        {Icon && <Icon size={14} aria-hidden="true" />}
        <span>{label}</span>
      </div>
      <p dir="auto" className="break-words text-base font-semibold">{children}</p>
    </div>
  );
}

function MedicineImage({ src }) {
  const [hasError, setHasError] = useState(false);
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-slate-300">
      {src && !hasError
        ? <img src={src} alt="" className="h-full w-full object-contain" loading="lazy" onError={() => setHasError(true)} />
        : <Pill size={16} aria-hidden="true" />}
    </span>
  );
}

function InvoiceItems({ items, isMedicineInvoice, rtl, t }) {
  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-slate-100">
      <ScrollableTable maxHeight="18rem">
        <table dir={rtl ? "rtl" : "ltr"} className={`w-full text-sm ${isMedicineInvoice ? "min-w-[900px]" : "min-w-[480px] table-fixed"}`}>
          <caption className="sr-only">{t(isMedicineInvoice ? "Invoice medicines" : "Invoice services")}</caption>
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs text-slate-400">
            <tr>
              <th scope="col" className="px-3 py-3 text-center">#</th>
              <th scope="col" className="px-3 py-3 text-center">{t(isMedicineInvoice ? "Medicine name" : "Service name")}</th>
              {isMedicineInvoice ? (
                <>
                  <th scope="col" className="px-3 py-3 text-center">{t("Quantity")}</th>
                  <th scope="col" className="px-3 py-3 text-center">{t("Unit price before")}</th>
                  <th scope="col" className="px-3 py-3 text-center">{t("Unit price after")}</th>
                  <th scope="col" className="px-3 py-3 text-center">{t("Line total before")}</th>
                  <th scope="col" className="px-3 py-3 text-center">{t("Line total after")}</th>
                </>
              ) : (
                <>
                  <th scope="col" className="px-3 py-3 text-center">{t("Price before")}</th>
                  <th scope="col" className="px-3 py-3 text-center">{t("Price after")}</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={isMedicineInvoice ? 7 : 4} className="px-4 py-8 text-center text-slate-400">
                  {t(isMedicineInvoice ? "No medicines found." : "No services found.")}
                </td>
              </tr>
            ) : items.map((item, index) => {
              const name = rtl
                ? item.serviceNameAr || item.serviceName || item.serviceNameEn || "-"
                : item.serviceNameEn || item.serviceName || item.serviceNameAr || "-";
              const secondaryName = rtl ? item.serviceNameEn : item.serviceNameAr;
              const unit = getMedicineUnitName(item.unit) || (typeof item.unit === "string" ? item.unit : "");
              return (
                <tr key={item.id ?? index} className="border-t border-slate-100">
                  <td className="px-3 py-3.5 text-center tabular-nums">{index + 1}</td>
                  <td className={`px-3 py-3.5 ${isMedicineInvoice ? (rtl ? "text-right" : "text-left") : "text-center"}`}>
                    <div className={isMedicineInvoice ? "flex items-center gap-3" : ""}>
                      {isMedicineInvoice && <MedicineImage key={item.medicineImageUrl || "no-image"} src={item.medicineImageUrl} />}
                      <div className={`min-w-0 ${isMedicineInvoice ? (rtl ? "text-right" : "text-left") : ""}`}>
                        <p dir="auto" className="font-medium">{name}</p>
                        {secondaryName && secondaryName !== name && (
                          <p dir="auto" className="text-xs text-slate-400">{secondaryName}</p>
                        )}
                        {isMedicineInvoice && (item.medicineForm || unit) && (
                          <p className="mt-1 text-xs text-slate-500">{[item.medicineForm, unit].filter(Boolean).join(" · ")}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  {isMedicineInvoice ? (
                    <>
                      <td className="px-3 py-3.5 text-center tabular-nums">{item.quantity ?? "-"}</td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-center tabular-nums">{formatMoney(item.unitPriceBefore)}</td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-center tabular-nums">{formatMoney(item.unitPriceAfter)}</td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-center tabular-nums">{formatMoney(item.lineTotalBefore)}</td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-center font-semibold tabular-nums">{formatMoney(item.lineTotalAfter)}</td>
                    </>
                  ) : (
                    <>
                      <td className="whitespace-nowrap px-3 py-3.5 text-center tabular-nums">{formatMoney(item.priceBefore)}</td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-center tabular-nums">{formatMoney(item.priceAfter)}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollableTable>
    </div>
  );
}

export default function InvoiceDetailsModal({ isOpen, onClose, invoice, isLoading, error, onRetry }) {
  const t = useClientsText();
  const { direction } = useLanguage();
  const rtl = direction === "rtl";
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const status = STATUS_NAMES[invoice?.status] || String(invoice?.status ?? "").toLowerCase();
  const style = STATUS_STYLE[status] || UNKNOWN_STATUS;
  const StatusIcon = style.icon;
  const isMedicineInvoice = invoice?.isMedicineInvoice === true;
  const items = Array.isArray(invoice?.services) ? invoice.services : invoice?.items?.items ?? [];
  const familyName = [invoice?.familyFirstName, invoice?.familyLastName].filter(Boolean).join(" ");
  const invoiceId = invoice?.invoiceId ?? invoice?.id;
  const totalAfter = invoice?.totalAfter ?? invoice?.amount;
  const errorMessage = error?.response?.data?.message || error?.response?.data?.errors
    ? getApiErrorMessage(error, { details: true, fallback: t("Unable to load invoice details.") })
    : t("Unable to load invoice details.");

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-modal="true"
      dir={direction}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className={`m-auto max-h-[90dvh] w-[calc(100%_-_1.5rem)] overflow-hidden rounded-2xl border-0 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/40 sm:w-[calc(100%_-_2rem)] ${isMedicineInvoice ? "max-w-5xl" : "max-w-2xl"}`}
    >
      <div className="flex max-h-[90dvh] flex-col">
        <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 pb-4 pt-6 sm:px-8 sm:pt-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${style.iconWrap}`}>
              <StatusIcon size={20} className={style.iconColor} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id={titleId} className="truncate text-base font-semibold sm:text-lg">{t("Invoice Details")}</h2>
              {invoiceId != null && (
                <p className="mt-0.5 text-sm text-slate-400">{t("Invoice No")}: <span className={`font-semibold ${style.iconColor}`}>#{invoiceId}</span></p>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={t("Close invoice details")} className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-blue-600">
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto px-6 py-5 sm:px-8 sm:py-6" aria-busy={isLoading || undefined}>
          {isLoading ? (
            <SkeletonText label={t("Loading invoice details...")} lines={6} className="w-full space-y-4 py-8" />
          ) : !invoice ? (
            <div role="alert" className="space-y-3 py-8 text-center text-sm text-slate-500">
              <p>{error ? errorMessage : t("Invoice details are unavailable.")}</p>
              {onRetry && <button type="button" onClick={onRetry} className="rounded-lg bg-blue-50 px-4 py-2 font-medium text-blue-800 hover:bg-blue-100">{t("Try again")}</button>}
            </div>
          ) : (
            <>
              {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
              <span className={`mb-5 inline-block rounded-full px-3 py-1 text-sm font-medium sm:mb-6 ${style.badge}`}>
                {invoice.statusLabel || (style.label ? t(style.label) : invoice.status) || "-"}
              </span>

              <div className="mb-6 grid grid-cols-2 gap-4 sm:mb-8 sm:grid-cols-3 sm:gap-6">
                <InvoiceStat label={t("Date")} icon={Calendar}>{formatDate(invoice.date ?? invoice.requestDate)}</InvoiceStat>
                <InvoiceStat label={t("Invoice Type")}>{invoice.isMedicineInvoice == null ? "-" : t(isMedicineInvoice ? "Medicine" : "Service")}</InvoiceStat>
                <InvoiceStat label={t(isMedicineInvoice ? "Medicines" : "Services")} icon={Users}>{invoice.itemsCount ?? invoice.servicesCount ?? items.length}</InvoiceStat>
                {isMedicineInvoice && <InvoiceStat label={t("Total Quantity")} icon={Pill}>{invoice.totalQuantity ?? "-"}</InvoiceStat>}
                {familyName && <InvoiceStat label={t("Family Member")}>{familyName}</InvoiceStat>}
              </div>

              <h3 className="mb-3 text-base font-semibold">{t(isMedicineInvoice ? "Medicines" : "Services")}</h3>
              <InvoiceItems items={items} isMedicineInvoice={isMedicineInvoice} rtl={rtl} t={t} />

              <div className="mb-6 space-y-2">
                {invoice.totalBefore != null && (
                  <div className="flex items-center justify-between gap-2 text-sm text-slate-400">
                    <span>{t("Total Before Discount")}</span>
                    <span dir="ltr" className="whitespace-nowrap tabular-nums">{formatMoney(invoice.totalBefore)} EGP</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1.5 text-base text-slate-500"><Tag size={16} className="shrink-0" /><span>{t("Total After Discount")}</span></div>
                  <span dir="ltr" className="whitespace-nowrap text-lg font-bold tabular-nums text-emerald-600">{formatMoney(totalAfter)} EGP</span>
                </div>
              </div>
              {style.message && <p className={`flex items-center gap-2 rounded-xl px-5 py-3.5 text-sm ${style.badge}`}><StatusIcon size={18} className="shrink-0" />{t(style.message)}</p>}
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
