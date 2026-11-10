import { useQuery } from "@tanstack/react-query";
import { getServices } from "../services/ServicesService";


export function useServicesQuery({ pageNumber, pageSize, search, categoryFilter, statusFilter, language }) {
  const query = useQuery({
    queryKey: language
      ? ["services", language, pageNumber, pageSize, search, categoryFilter, statusFilter]
      : ["services", pageNumber, pageSize, search, categoryFilter, statusFilter],
    queryFn: () =>
      getServices({
        pageNumber,
        pageSize,
        searchTerm: search,
        categoryId: categoryFilter || undefined,
        status: Number(statusFilter),
      }),
    placeholderData: (previousData, previousQuery) =>
      !language || previousQuery?.queryKey[1] === language ? previousData : undefined,
  });

  return {
    ...query,
    services: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
  };
}
