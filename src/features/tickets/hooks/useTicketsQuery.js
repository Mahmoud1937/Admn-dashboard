import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTickets } from "../services/ticketsService";

export function useTicketsQuery({ pageNumber, pageSize, searchTerm, filters }) {
  const query = useQuery({
    queryKey: ["tickets", pageNumber, pageSize, searchTerm, filters],
    queryFn: () => getTickets({ pageNumber, pageSize, searchTerm, filters }),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    tickets: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
  };
}
