import { useQuery } from "@tanstack/react-query";
import { clientsService } from "../services/clientsService";

export const useClientDetailsQuery = (clientId) => {
  const query = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => clientsService.getClientById(clientId),
    enabled: !!clientId,
  });

  return {
    client: query.data?.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};

export default useClientDetailsQuery;