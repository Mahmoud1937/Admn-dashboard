import { useQuery } from "@tanstack/react-query";
import { getAllBranches } from "../services/providerBranchesService";

export function useAllBranchesQuery({
  governorateFilter,
  cityFilter,
  search,
  statusFilter,
  pageNumber,
  pageSize,
  enabled = true,
} = {}) {
  const query = useQuery({
    queryKey: [
      "all-branches",
      governorateFilter,
      cityFilter,
      search,
      statusFilter,
      pageNumber,
      pageSize,
    ],
    queryFn: () =>
      getAllBranches({
        governorateId: governorateFilter,
        cityId: cityFilter,
        search,
        // Backend contract: 0 = all, 1 = active, 2 = deactive
        status: statusFilter === "" ? 0 : Number(statusFilter),
        pageNumber,
        pageSize,
      }),
    enabled,
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    branches: query.data?.items ?? [],
    totalCount: query.data?.totalCount ?? 0,
    totalPages: query.data?.totalPages ?? 1,
  };
}
