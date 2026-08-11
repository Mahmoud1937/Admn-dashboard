import { useQuery } from "@tanstack/react-query";
import { getCities } from "../../cities/service/citeisService";

export function useCitiesByGovernorate(governorateId) {
  const { data, isLoading } = useQuery({
    queryKey: ["cities-by-governorate", governorateId],
    queryFn: () => getCities({ governorateId, pageNumber: 1, pageSize: 1000 }),
    enabled: !!governorateId,
  });

  return {
    cities: data?.data?.items ?? [],
    isLoading,
  };
}