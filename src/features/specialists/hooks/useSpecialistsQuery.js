import { useQuery } from "@tanstack/react-query";
import { getSpecialists } from "../service/specialistsService";

export function useSpecialistsQuery({ pageNumber, pageSize, search }) {
  const query = useQuery({
    queryKey: ["specialists", pageNumber, pageSize, search],
    queryFn: () => getSpecialists(pageNumber, pageSize, search),
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    specialists: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
    serverPageSize: query.data?.data?.pageSize,
  };
}