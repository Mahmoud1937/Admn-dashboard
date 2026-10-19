import { useQuery } from "@tanstack/react-query";
import { getProviderRenewals } from "../services/providerRenewalsService";

export function useProviderRenewalsQuery({
  providerId,
  pageNumber = 1,
  pageSize = 15,
  enabled = true,
}) {
  const query = useQuery({
    queryKey: ["provider-renewals", providerId, pageNumber, pageSize],
    queryFn: ({ signal }) =>
      getProviderRenewals({ providerId, pageNumber, pageSize, signal }),
    enabled: enabled && !!providerId,
  });

  return {
    ...query,
    renewals: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
  };
}
