import { useQuery } from "@tanstack/react-query";
import { getProviderBranches } from "../services/providerBranchesService";

export function useBranchesQuery({
  providerId,
  pageNumber,
  pageSize,
  search,
  governorateFilter,
  cityFilter,
  statusFilter,
}) {
  const query = useQuery({
    queryKey: [
      "provider-branches",
      providerId,
      pageNumber,
      pageSize,
      search,
      governorateFilter,
      cityFilter,
      statusFilter,
    ],
    queryFn: () =>
      getProviderBranches({
        providerId,
        pageNumber,
        pageSize,
        search,
        governorateId: governorateFilter || undefined,
        cityId: cityFilter || undefined,
        // Backend contract: 0 = all, 1 = active, 2 = deactive
        status: statusFilter === "" ? 0 : Number(statusFilter),
      }),
    enabled: !!providerId,
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    branches: query.data?.items ?? [],
    totalCount: query.data?.totalCount ?? 0,
    totalPages: query.data?.totalPages ?? 1,
    serverPageSize: query.data?.pageSize,
  };
}