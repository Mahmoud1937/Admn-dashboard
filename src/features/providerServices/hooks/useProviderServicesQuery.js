import { useQuery } from "@tanstack/react-query";
import { getProviderServices } from "../services/providerServicesService";

export function useProviderServicesQuery({
  providerId,
  pageNumber,
  pageSize,
  search,
  statusFilter,
  servicePriceListId,
  enabled = true,
  language,
}) {
  const query = useQuery({
    queryKey: ["provider-services", providerId, pageNumber, pageSize, search, statusFilter, servicePriceListId, language],
    queryFn: () =>
      getProviderServices({
        providerId,
        pageNumber,
        pageSize,
        search,
        servicePriceListId,
        // Backend contract: 0 = all, 1 = active, 2 = inactive
        status: statusFilter === "" ? 0 : Number(statusFilter),
      }),
    enabled: enabled && !!providerId,
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === providerId &&
      previousQuery?.queryKey[6] === servicePriceListId &&
      previousQuery?.queryKey[7] === language
        ? previousData
        : undefined,
  });

  return {
    ...query,
    providerServices: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
  };
}
