import { useQuery } from "@tanstack/react-query";
import { getProviderPackages } from "../services/providerPackagesService";

export function useProviderPackagesQuery({ providerId, pageNumber, pageSize, enabled = true, language }) {
  const query = useQuery({
    queryKey: ["provider-packages", providerId, pageNumber, pageSize, language],
    queryFn: () => getProviderPackages({ providerId, pageNumber, pageSize }),
    enabled: enabled && !!providerId,
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[4] === language ? previousData : undefined,
  });

  return {
    ...query,
    packages: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
  };
}
