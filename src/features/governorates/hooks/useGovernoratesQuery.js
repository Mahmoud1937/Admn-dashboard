import { useQuery } from "@tanstack/react-query";
import { getGovernorates } from "../services/governoratesService";


export function useGovernoratesQuery({ pageNumber, pageSize, search }) {
  const query = useQuery({
    queryKey: ["governorates", pageNumber, pageSize, search],
    queryFn: () => getGovernorates(pageNumber, pageSize, search),
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    governorates: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
    serverPageSize: query.data?.data?.pageSize,
  };
}