import { useQuery } from "@tanstack/react-query";
import { getInvoiceDetails } from "../services/clientsService";


export function useInvoiceDetailsQuery(invoiceId, enabled = false) {
  return useQuery({
    queryKey: ["invoice-details", invoiceId],
    queryFn: async ({ signal }) => {
      const data = await getInvoiceDetails(invoiceId, { signal });
      return data?.data;
    },
    enabled: enabled && !!invoiceId,
  });
}
