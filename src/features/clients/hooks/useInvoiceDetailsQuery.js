import { useQuery } from "@tanstack/react-query";
import { getInvoiceDetails } from "../services/clientsService";


export function useInvoiceDetailsQuery(invoiceId, enabled = false, language) {
  return useQuery({
    queryKey: language ? ["invoice-details", language, invoiceId] : ["invoice-details", invoiceId],
    queryFn: async ({ signal }) => {
      const data = await getInvoiceDetails(invoiceId, { signal });
      return data?.data;
    },
    enabled: enabled && !!invoiceId,
  });
}
