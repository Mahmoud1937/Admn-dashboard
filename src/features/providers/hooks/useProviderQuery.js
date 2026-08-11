import { useQuery } from "@tanstack/react-query";
import { getProviderById } from "../services/providersService";

export function useProviderQuery(id, isCreateMode) {
  const query = useQuery({
    queryKey: ["provider", id],
    queryFn: () => getProviderById(id),
    enabled: !!id && !isCreateMode,
  });

  return {
    ...query,
    provider: query.data?.data ?? null,
  };
}