import { useQuery } from "@tanstack/react-query";
import { getProviders } from "../services/providersService";


export function useProvidersQuery({ pageNumber, pageSize, search, filters }) {
  const query = useQuery({
    queryKey: ["providers", pageNumber, pageSize, search, filters],
    queryFn: () => getProviders({ pageNumber, pageSize, searchTerm: search, filters }),
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    providers: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
    serverPageSize: query.data?.data?.pageSize,
  };
}