import { useQuery } from "@tanstack/react-query";
import { getProviderPackageById } from "../services/providerPackagesService";

export function useProviderPackageDetailsQuery(packageId, language) {
  return useQuery({
    queryKey: ["provider-package", packageId, language],
    queryFn: () => getProviderPackageById(packageId),
    enabled: packageId != null,
  });
}
