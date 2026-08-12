import { useQuery } from "@tanstack/react-query";
import { getServiceCategories } from "../../ServiceCategory/services/Servicecategoriesservice";


export function useServiceCategoriesLookup() {
  const { data, isLoading } = useQuery({
    queryKey: ["service-categories-lookup"],
    queryFn: () => getServiceCategories(1, 1000),
  });

  return {
    categories: data?.data?.items ?? [],
    isLoading,
  };
}