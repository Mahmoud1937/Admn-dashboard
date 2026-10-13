import { useQuery } from "@tanstack/react-query";
import { getProviderPackages } from "../services/providerPackagesService";

export function useProviderPackagesQuery({ providerId, pageNumber, pageSize, enabled = true }) {
  const query = useQuery({
    queryKey: ["provider-packages", providerId, pageNumber, pageSize],
    queryFn: () => getProviderPackages({ providerId, pageNumber, pageSize }),
    enabled: enabled && !!providerId,
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    packages: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
  };
}
