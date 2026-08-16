import { useQuery } from "@tanstack/react-query";
import { getProviderServices } from "../services/providerServicesService";

export function useProviderServicesQuery({
  providerId,
  pageNumber,
  pageSize,
  search,
  statusFilter,
}) {
  const query = useQuery({
    queryKey: ["provider-services", providerId, pageNumber, pageSize, search, statusFilter],
    queryFn: () =>
      getProviderServices({
        providerId,
        pageNumber,
        pageSize,
        search,
        // Backend contract: 0 = all, 1 = active, 2 = inactive
        status: statusFilter === "" ? 0 : Number(statusFilter),
      }),
    enabled: !!providerId,
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    providerServices: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
    serverPageSize: query.data?.data?.pageSize,
  };
}