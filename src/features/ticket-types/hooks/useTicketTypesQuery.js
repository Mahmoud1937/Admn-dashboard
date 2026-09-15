import { useQuery } from "@tanstack/react-query";
import { getTicketTypes } from "../services/ticketTypesService";

export function useTicketTypesQuery({ pageNumber, pageSize, search }) {
  const query = useQuery({
    queryKey: ["ticket-types", pageNumber, pageSize, search],
    queryFn: () => getTicketTypes(pageNumber, pageSize, search),
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    ticketTypes: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
  };
}
