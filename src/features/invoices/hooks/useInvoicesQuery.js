import { useQuery } from "@tanstack/react-query";
import { getInvoices } from "../services/invoicesService";

const toIsoStartOfDay = (dateStr) =>
  dateStr ? new Date(`${dateStr}T00:00:00.000Z`).toISOString() : undefined;
const toIsoEndOfDay = (dateStr) =>
  dateStr ? new Date(`${dateStr}T23:59:59.999Z`).toISOString() : undefined;

export const useInvoicesQuery = ({ pageNumber, pageSize, searchTerm, filters }) => {
  return useQuery({
    queryKey: ["invoices", pageNumber, pageSize, searchTerm, filters],
    queryFn: () =>
      getInvoices({
        PageNumber: pageNumber,
        PageSize: pageSize,
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
      }),
    keepPreviousData: true,
  });
};