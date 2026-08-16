import { useQuery } from "@tanstack/react-query";
import { getServices } from "../../services-admin/services/ServicesService";


export function useServicesLookup() {
  const { data, isLoading } = useQuery({
    queryKey: ["services", "dropdown"],
    queryFn: () => getServices({ pageNumber: 1, pageSize: 1000 }),
  });

  return {
    services: data?.data?.items ?? [],
    isLoading,
  };
}