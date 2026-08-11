import { useQuery } from "@tanstack/react-query";
import { getCities } from "../service/citeisService";

export function useCitiesQuery({ pageNumber, pageSize, search, governorateFilter }) {
  const query = useQuery({
    queryKey: ["cities", pageNumber, pageSize, search, governorateFilter],
    queryFn: () =>
      getCities({
        pageNumber,
        pageSize,
        searchTerm: search,
        governorateId: governorateFilter || undefined,

      }),
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    cities: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
    serverPageSize: query.data?.data?.pageSize,
  };
}