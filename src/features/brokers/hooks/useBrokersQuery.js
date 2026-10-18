import { useQuery } from "@tanstack/react-query";
import { getBrokers } from "../services/brokersService";

export function useBrokersQuery({ pageNumber, pageSize, searchTerm, enabled }) {
  const query = useQuery({
    queryKey: ["brokers", pageNumber, pageSize, searchTerm],
    queryFn: () => getBrokers({ pageNumber, pageSize, searchTerm }),
    enabled,
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    brokers: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
  };
}
