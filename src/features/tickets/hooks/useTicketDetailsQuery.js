import { useQuery } from "@tanstack/react-query";
import { getTicketById } from "../services/ticketsService";

export function useTicketDetailsQuery(ticketId, enabled = true) {
  return useQuery({
    queryKey: ["ticket-details", ticketId],
    queryFn: () => getTicketById(ticketId),
    enabled: enabled && !!ticketId,
  });
}
