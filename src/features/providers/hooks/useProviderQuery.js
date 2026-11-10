import { useQuery } from "@tanstack/react-query";
import { getProviderById } from "../services/providersService";

export function useProviderQuery(id, isCreateMode, language) {
  const query = useQuery({
    queryKey: language ? ["provider", id, language] : ["provider", id],
    queryFn: () => getProviderById(id),
    enabled: !!id && !isCreateMode,
  });

  return {
    ...query,
    provider: query.data?.data ?? null,
  };
}
