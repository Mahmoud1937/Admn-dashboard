import { useState } from "react";
import { exportInvoices } from "../services/invoicesService";

const toIsoStartOfDay = (dateStr) =>
  dateStr ? new Date(`${dateStr}T00:00:00.000Z`).toISOString() : undefined;
const toIsoEndOfDay = (dateStr) =>
  dateStr ? new Date(`${dateStr}T23:59:59.999Z`).toISOString() : undefined;

export function useExportInvoices() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = async ({ searchTerm, filters }) => {
    setIsExporting(true);
    try {
      const blob = await exportInvoices({
        SearchTerm: searchTerm || undefined,
        ProviderId: filters.providerId || undefined,
        ProviderBranchId: filters.providerBranchId || undefined,
        Status: filters.status || undefined,
        FromDate: toIsoStartOfDay(filters.fromDate),
        ToDate: toIsoEndOfDay(filters.toDate),
        IsCash:
          filters.isCash === "" || filters.isCash === undefined
            ? undefined
            : filters.isCash === "true",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoices-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToExcel, isExporting };
}