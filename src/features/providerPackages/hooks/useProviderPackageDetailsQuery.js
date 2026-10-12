import { useQuery } from "@tanstack/react-query";
import { getProviderPackageById } from "../services/providerPackagesService";

export function useProviderPackageDetailsQuery(packageId) {
  return useQuery({
    queryKey: ["provider-package", packageId],
    queryFn: () => getProviderPackageById(packageId),
    enabled: packageId != null,
  });
}
