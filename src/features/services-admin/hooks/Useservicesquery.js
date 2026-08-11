import { useQuery } from "@tanstack/react-query";
import { getServices } from "../services/Servicesservice";


export function useServicesQuery({ pageNumber, pageSize, search, categoryFilter,statusFilter }) {
  const query = useQuery({
    queryKey: ["services", pageNumber, pageSize, search, categoryFilter,statusFilter],
    queryFn: () =>
      getServices({
        pageNumber,
        pageSize,
        searchTerm: search,
        categoryId: categoryFilter || undefined,
         status: Number(statusFilter),
      }),
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    services: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
    serverPageSize: query.data?.data?.pageSize,
  };
}