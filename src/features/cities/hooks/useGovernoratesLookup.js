import { useQuery } from "@tanstack/react-query";
import { getGovernorates } from "../../governorates/services/governoratesService";

export function useGovernoratesLookup() {
  const { data, isLoading } = useQuery({
    queryKey: ["governorates-lookup"],
    queryFn: () => getGovernorates(1, 1000),
  });

  return {
    governorates: data?.data?.items ?? [],
    isLoading,
  };
}