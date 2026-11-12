import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { mapInvoiceToStep } from "../utils/timelineMapper";
import { getInvoiceTimeline } from "../services/invoicesService";


export function useInvoiceTimeline(orderNo) {
  const { i18n } = useTranslation("adminPages");
  const { data, isLoading, error } = useQuery({
    queryKey: ["invoice-timeline", orderNo, i18n.resolvedLanguage],
    queryFn: ({ signal }) => getInvoiceTimeline({ orderNo, signal }),
    enabled: Boolean(orderNo),
    retry: false,
  });

  return {
    steps: (data ?? []).map(mapInvoiceToStep),
    loading: isLoading,
    error: error ? error.response?.data?.message || error.message : null,
  };
}
